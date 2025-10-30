import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inspirationImageUrl } = await req.json();

    if (!inspirationImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing inspiration image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing inspiration image...');

    // Analyze the inspiration image with OpenAI Vision
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this beauty/style inspiration image in detail. Describe the hairstyle, hair color, texture, length, and any distinctive features like highlights, braids, curls, or accessories. If it shows lashes, describe the lash style, length, curl, and volume. If it shows nails, describe the design, color, length, and art. Be specific and detailed - this description will be used to match the client with the right service provider. Keep it under 150 words.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: inspirationImageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI API error:', analysisResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisData = await analysisResponse.json();
    const styleDescription = analysisData.choices[0]?.message?.content;

    if (!styleDescription) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate style description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Style description generated:', styleDescription);

    return new Response(
      JSON.stringify({
        success: true,
        description: styleDescription
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-inspiration:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
