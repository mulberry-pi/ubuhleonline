import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function syncCalendarForUser(
  userId: string,
  appointmentId: string,
  action: 'create' | 'update' | 'delete',
  supabase: any,
  appointment: any
) {
  // Get calendar sync settings for this user
  const { data: calendarSettings } = await supabase
    .from('calendar_sync_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .eq('provider', 'google')
    .single();

  if (!calendarSettings) {
    console.log(`Calendar sync not enabled for user ${userId}`);
    return { synced: false, reason: 'not_enabled' };
  }

  // Check if token needs refresh
  const now = new Date();
  const tokenExpiry = new Date(calendarSettings.token_expiry);
  let accessToken = calendarSettings.access_token;

  if (tokenExpiry < now) {
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: calendarSettings.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const refreshData = await refreshResponse.json();
    if (refreshData.access_token) {
      accessToken = refreshData.access_token;
      await supabase
        .from('calendar_sync_settings')
        .update({
          access_token: refreshData.access_token,
          token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('id', calendarSettings.id);
    }
  }

  const isClient = userId === appointment.client_id;
  const eventIdField = isClient ? 'client_calendar_event_id' : 'provider_calendar_event_id';
  const existingEventId = appointment[eventIdField];

  // Handle delete action
  if (action === 'delete' && existingEventId) {
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEventId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );
      console.log(`Deleted calendar event ${existingEventId} for user ${userId}`);
      return { synced: true, eventId: null };
    } catch (error) {
      console.error(`Failed to delete event: ${error}`);
      return { synced: false, error };
    }
  }

  // Prepare event data
  const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const endDateTime = new Date(startDateTime.getTime() + (appointment.service.duration_minutes * 60000));

  const otherParty = isClient 
    ? { email: appointment.provider.email, name: appointment.provider.business_name }
    : { email: appointment.client.email, name: appointment.client.full_name };

  const event = {
    summary: isClient 
      ? `${appointment.service.name} at ${appointment.provider.business_name}`
      : `${appointment.service.name} - ${appointment.client.full_name}`,
    description: appointment.notes || `Beauty appointment booked via Ubuhle${isClient ? '' : ` with client ${appointment.client.full_name}`}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Africa/Johannesburg',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Africa/Johannesburg',
    },
    attendees: [{ email: otherParty.email, displayName: otherParty.name }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 1440 },
      ],
    },
  };

  // Update existing event or create new one
  if (action === 'update' && existingEventId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      console.log(`Updated calendar event ${existingEventId} for user ${userId}`);
      return { synced: true, eventId: existingEventId };
    } catch (error) {
      console.error(`Failed to update event, will try creating new one: ${error}`);
    }
  }

  // Create new event
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  const calendarData = await response.json();
  
  if (!response.ok) {
    console.error('Google Calendar API error:', calendarData);
    throw new Error(calendarData.error?.message || 'Failed to create calendar event');
  }

  console.log(`Created calendar event ${calendarData.id} for user ${userId}`);
  return { synced: true, eventId: calendarData.id };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, action = 'create' } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get appointment with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes),
        provider:provider_profiles!appointments_provider_id_fkey(business_name, user_id),
        client:profiles!appointments_client_id_fkey(full_name, email, user_id)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError) throw appointmentError;

    // Get provider email from profiles table
    const { data: providerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', appointment.provider_id)
      .single();

    // Enrich appointment data with emails
    const enrichedAppointment = {
      ...appointment,
      client: { 
        ...appointment.client, 
        email: appointment.client.email 
      },
      provider: { 
        ...appointment.provider, 
        email: providerProfile?.email || '' 
      }
    };

    // Verify user is part of this appointment
    if (user.id !== appointment.client_id && user.id !== appointment.provider_id) {
      throw new Error('Unauthorized: User is not part of this appointment');
    }

    // Sync for both client and provider
    const clientResult = await syncCalendarForUser(
      enrichedAppointment.client_id,
      appointmentId,
      action,
      supabase,
      enrichedAppointment
    );

    const providerResult = await syncCalendarForUser(
      enrichedAppointment.provider_id,
      appointmentId,
      action,
      supabase,
      enrichedAppointment
    );

    // Update appointment with event IDs
    const updateData: any = {};
    if (clientResult.eventId !== undefined) {
      updateData.client_calendar_event_id = clientResult.eventId;
    }
    if (providerResult.eventId !== undefined) {
      updateData.provider_calendar_event_id = providerResult.eventId;
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        clientSynced: clientResult.synced,
        providerSynced: providerResult.synced,
        clientEventId: clientResult.eventId,
        providerEventId: providerResult.eventId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-calendar function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
