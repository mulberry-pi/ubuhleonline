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
    const { previewImageUrl, styleDescription, clientLocation } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active providers with their gallery images
    const { data: providers, error: providersError } = await supabase
      .from('provider_profiles')
      .select('id, user_id, business_name, city, suburb, rating, review_count, gallery_images, price_range')
      .eq('is_public', true)
      .not('gallery_images', 'is', null);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
      throw providersError;
    }

    if (!providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${providers.length} providers for matching...`);

    // Build prompt for OpenAI to analyze matches
    const prompt = `You are a professional beauty stylist matching AI. Analyze the client's desired style and match them with the best service providers.

Client Information:
- Preview Image: ${previewImageUrl}
- Style Description: ${styleDescription}
- Location: ${clientLocation || 'Not specified'}

Available Providers:
${providers.map((p, idx) => `
Provider ${idx + 1}:
- ID: ${p.id}
- Name: ${p.business_name}
- Location: ${p.city}, ${p.suburb}
- Rating: ${p.rating}/5
- Portfolio Images: ${p.gallery_images?.length || 0} samples
- Price Range: ${p.price_range || 'Standard'}
`).join('\n')}

Task: Analyze each provider's portfolio style, expertise, location proximity, and rating to determine compatibility with the client's desired style. Return a JSON array with the top 5 matches, ranked by predicted success (0-100).

Consider:
1. Style compatibility (most important - 40%)
2. Provider rating and experience (30%)
3. Location proximity if available (20%)
4. Price range fit (10%)

Return format:
{
  "matches": [
    {"provider_id": "uuid", "predicted_success": 96, "match_reason": "Specializes in this exact style with excellent portfolio"},
    {"provider_id": "uuid", "predicted_success": 85, "match_reason": "Strong track record with similar styles"},
    ...
  ]
}`;

    // Call OpenAI API for matching analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert beauty stylist matching system. Analyze provider portfolios and client preferences to create perfect matches. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    console.log('AI matching complete:', aiResponse);

    // Enrich matches with full provider data
    const enrichedMatches = aiResponse.matches.map((match: any) => {
      const provider = providers.find(p => p.id === match.provider_id);
      return {
        ...match,
        provider: provider || null
      };
    }).filter((match: any) => match.provider !== null);

    return new Response(
      JSON.stringify({ matches: enrichedMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-stylists function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
