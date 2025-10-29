import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { afterServiceImageUrl, comparisonImageUrl, appointmentId } = await req.json();

    if (!afterServiceImageUrl || !comparisonImageUrl) {
      throw new Error('Missing required images');
    }

    // Verify user is the provider for the appointment
    if (appointmentId) {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('provider_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        console.error('Appointment not found:', appointmentError);
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (appointment.provider_id !== user.id) {
        console.error('User not authorized for this appointment');
        return new Response(
          JSON.stringify({ error: 'Forbidden - You are not the provider for this appointment' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing images with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a beauty and styling image analysis assistant. Compare the two images provided. Evaluate color accuracy, texture consistency, structure alignment, and overall style similarity. Output a similarity percentage (0-100) and a 2-3 sentence summary for professional display. Return only valid JSON in this exact format: {"similarity_score": number, "summary": "text"}'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Compare these two beauty styling images. The first is the target/preview image, and the second is the actual result after service.'
              },
              {
                type: 'image_url',
                image_url: { url: comparisonImageUrl }
              },
              {
                type: 'image_url',
                image_url: { url: afterServiceImageUrl }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze images');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);
    
    // Parse the JSON response
    const result = JSON.parse(content);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-after-service function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});