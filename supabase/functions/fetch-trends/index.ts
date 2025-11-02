import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create client with auth header for user verification
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verify user has provider role
    const { data: userRole, error: roleError } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'provider')
      .single();

    if (roleError || !userRole) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Provider access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log(`Trends fetch requested by provider: ${user.id}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get provider's service categories
    const { data: providerProfile, error: profileError } = await supabaseClient
      .from('provider_profiles')
      .select('service_categories')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching provider profile:", profileError);
      throw new Error("Could not fetch provider service categories");
    }

    const serviceCategories = providerProfile?.service_categories || [];
    console.log(`Provider service categories:`, serviceCategories);

    // Determine if provider does hair, lashes, or both
    const doesHair = serviceCategories.includes('Hair Styling');
    const doesLashes = serviceCategories.includes('Lash Extensions');

    let trendsPrompt = "Generate a list of 10 trending beauty styles with detailed descriptions. For each trend include: name, detailed description explaining why it's trending, and a popularity score (0-100). ";
    
    if (doesHair && doesLashes) {
      trendsPrompt += "Include 5 trending hairstyles and 5 trending lash extension styles.";
    } else if (doesHair) {
      trendsPrompt += "Focus on trending hairstyles only (box braids, silk press, boho braids, cornrows, fulani braids, etc).";
    } else if (doesLashes) {
      trendsPrompt += "Focus on trending lash extension styles only (wispy sets, volume sets, cat eye sets, individual lashes, cluster lashes, etc).";
    } else {
      trendsPrompt += "Include a mix of trending hairstyles and lash extension styles.";
    }

    trendsPrompt += " Return the data as a JSON array with objects containing: name, description, popularity_score.";

    console.log("Generating AI trends analysis...");

    // Use OpenAI to generate trend insights
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a beauty industry trend analyst. Generate realistic trending styles with detailed descriptions explaining why they are popular. Return only valid JSON.' 
          },
          { role: 'user', content: trendsPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const trendsText = openaiData.choices[0].message.content;
    
    // Parse the JSON response
    let aiTrends = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = trendsText.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/) || trendsText.match(/(\[[\s\S]*\])/);
      const jsonStr = jsonMatch ? jsonMatch[1] : trendsText;
      aiTrends = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      throw new Error("Could not parse trend data from AI");
    }

    console.log(`Generated ${aiTrends.length} AI trends`);

    // Generate images for top 5 trends using Lovable AI
    const trendsWithImages = await Promise.all(
      aiTrends.slice(0, 5).map(async (trend: any) => {
        try {
          const imagePrompt = `Professional beauty salon photo of ${trend.name}. High quality, well-lit, showing the style clearly. Realistic photography.`;
          
          const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [
                {
                  role: 'user',
                  content: imagePrompt
                }
              ],
              modalities: ['image', 'text']
            })
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            return { ...trend, image_url: imageUrl };
          }
        } catch (error) {
          console.error(`Error generating image for ${trend.name}:`, error);
        }
        return { ...trend, image_url: null };
      })
    );

    // Add the rest without images
    const allTrendsWithImages = [
      ...trendsWithImages,
      ...aiTrends.slice(5).map((trend: any) => ({ ...trend, image_url: null }))
    ];

    if (allTrendsWithImages.length > 0) {
      // Clear existing trends and insert new ones
      await supabaseClient.from("trends").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      const { error: insertError } = await supabaseClient
        .from("trends")
        .insert(allTrendsWithImages);

      if (insertError) {
        console.error("Error inserting trends:", insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${allTrendsWithImages.length} AI-generated trends`);
    }

    return new Response(
      JSON.stringify({ success: true, count: allTrendsWithImages.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error fetching trends:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
