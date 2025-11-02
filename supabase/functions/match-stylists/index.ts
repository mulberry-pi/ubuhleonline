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
    let { data: providers, error: providersError } = await supabase
      .from('provider_profiles')
      .select('id, user_id, business_name, business_description, city, suburb, rating, review_count, gallery_images, price_range')
      .eq('is_public', true)
      .not('gallery_images', 'is', null);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
    }

    // Use mock data if no real providers exist
    if (!providers || providers.length === 0) {
      console.log('No providers in database, using mock data for testing');
      providers = [
        {
          id: 'mock-1',
          user_id: 'mock-user-1',
          business_name: 'Crowned Glory Hair Studio',
          business_description: 'Expert in knotless braids, box braids, faux locs, and protective styling for Black women. Specializes in tension-free techniques and natural hair health.',
          city: 'Cape Town',
          suburb: 'Observatory',
          rating: 4.9,
          review_count: 156,
          price_range: 'R600 - R1500',
          gallery_images: [
            'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
            'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800',
            'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800'
          ]
        },
        {
          id: 'mock-2',
          user_id: 'mock-user-2',
          business_name: 'Melanin Magic Braids',
          business_description: 'Premium braiding specialist focusing on boho braids, goddess locs, passion twists, and trendy protective styles with curly textures.',
          city: 'Cape Town',
          suburb: 'Woodstock',
          rating: 4.8,
          review_count: 203,
          price_range: 'R700 - R2000',
          gallery_images: [
            'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
            'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800',
            'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800'
          ]
        },
        {
          id: 'mock-3',
          user_id: 'mock-user-3',
          business_name: 'Natural Crown Hair Bar',
          business_description: 'Dedicated to natural hair texture. Expert in silk presses, twist-outs, wash & go styles, and deep conditioning treatments for 4C hair.',
          city: 'Cape Town',
          suburb: 'Sea Point',
          rating: 4.7,
          review_count: 98,
          price_range: 'R400 - R900',
          gallery_images: [
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
            'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
            'https://images.unsplash.com/photo-1616575281571-30e82fc934c5?w=800'
          ]
        },
        {
          id: 'mock-4',
          user_id: 'mock-user-4',
          business_name: 'Loc Love Studio',
          business_description: 'Certified loctician specializing in starter locs, loc retwists, loc styling, and loc maintenance for all stages of the loc journey.',
          city: 'Cape Town',
          suburb: 'Claremont',
          rating: 4.9,
          review_count: 175,
          price_range: 'R350 - R800',
          gallery_images: [
            'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800',
            'https://images.unsplash.com/photo-1598217039267-2c87e93e3dfc?w=800'
          ]
        },
        {
          id: 'mock-5',
          user_id: 'mock-user-5',
          business_name: 'Afro Glam Styles',
          business_description: 'Creative braiding artist specializing in tribal braids, stitch braids, lemonade braids, and fulani braids with beads and accessories.',
          city: 'Cape Town',
          suburb: 'Rondebosch',
          rating: 4.8,
          review_count: 142,
          price_range: 'R650 - R1800',
          gallery_images: [
            'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800',
            'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800'
          ]
        }
      ];
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
- Specialties: ${p.business_description || 'General beauty services'}
- Location: ${p.city}, ${p.suburb}
- Rating: ${p.rating}/5 (${p.review_count} reviews)
- Portfolio Images: ${p.gallery_images?.length || 0} samples
- Price Range: ${p.price_range || 'Standard'}
`).join('\n')}

Task: Analyze each provider's specialties, expertise, location proximity, and rating to determine compatibility with the client's desired style. Return a JSON array with the top 5 matches, ranked by predicted success (0-100).

Consider:
1. Style compatibility based on specialties (most important - 40%)
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

    // Enrich matches with full provider data (flatten structure)
    const enrichedMatches = aiResponse.matches.map((match: any) => {
      const provider = providers.find(p => p.id === match.provider_id);
      if (!provider) return null;
      
      return {
        id: provider.id,
        user_id: provider.user_id,
        business_name: provider.business_name,
        business_description: provider.business_description,
        business_address: `${provider.suburb}, ${provider.city}`,
        business_logo_url: provider.gallery_images?.[0] || '',
        rating: provider.rating || 4.5,
        review_count: provider.review_count || 0,
        city: provider.city,
        suburb: provider.suburb,
        gallery_images: provider.gallery_images || [],
        availability_status: 'available',
        price_range: provider.price_range || 'R400 - R1200',
        predicted_success: match.predicted_success,
        match_reason: match.match_reason
      };
    }).filter((match: any) => match !== null);

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
