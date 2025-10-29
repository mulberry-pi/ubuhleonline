import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, action } = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes),
        provider:provider_profiles(business_name),
        client:profiles(full_name, email)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError) throw appointmentError;

    // Get calendar sync settings for the user
    const { data: calendarSettings, error: settingsError } = await supabase
      .from('calendar_sync_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .eq('provider', 'google');

    if (settingsError || !calendarSettings || calendarSettings.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Calendar sync not enabled',
          synced: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settings = calendarSettings[0];

    // Check if token needs refresh
    const now = new Date();
    const tokenExpiry = new Date(settings.token_expiry);
    
    let accessToken = settings.access_token;

    if (tokenExpiry < now) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: settings.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      
      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        
        // Update tokens in database
        await supabase
          .from('calendar_sync_settings')
          .update({
            access_token: refreshData.access_token,
            token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', settings.id);
      }
    }

    // Create or delete calendar event
    if (action === 'create') {
      const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const endDateTime = new Date(startDateTime.getTime() + (appointment.service.duration_minutes * 60000));

      const event = {
        summary: `${appointment.service.name} - ${appointment.provider.business_name}`,
        description: appointment.notes || 'Beauty appointment booked via Ubuhle',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Africa/Johannesburg',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Africa/Johannesburg',
        },
        attendees: [
          { email: appointment.client.email }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 1440 }, // 1 day before
          ],
        },
      };

      const calendarResponse = await fetch(
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

      const calendarData = await calendarResponse.json();
      
      if (!calendarResponse.ok) {
        console.error('Google Calendar API error:', calendarData);
        throw new Error(calendarData.error?.message || 'Failed to create calendar event');
      }

      console.log('Calendar event created:', calendarData.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          eventId: calendarData.id,
          synced: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
