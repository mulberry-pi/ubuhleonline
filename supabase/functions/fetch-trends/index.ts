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
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    if (!APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN not configured");
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

    // Determine if provider does hair, lashes, barber, or combinations
    const doesHair = serviceCategories.includes('Hair Styling');
    const doesLashes = serviceCategories.includes('Lash Extensions');
    const doesBarber = serviceCategories.includes('Barber');

    // Define hashtags based on service categories
    let hashtags: string[] = [];
    if (doesBarber && (doesHair || doesLashes)) {
      hashtags = ['barber', 'fade', 'lineup', 'mensgrooming', 'braids', 'lashes'];
    } else if (doesBarber) {
      hashtags = ['barber', 'fade', 'taper', 'lineup', 'mensgrooming', 'barbershop'];
    } else if (doesHair && doesLashes) {
      hashtags = ['braids', 'lashes', 'silkpress', 'lashextensions', 'protectivestyles', 'volumelashes'];
    } else if (doesHair) {
      hashtags = ['braids', 'silkpress', 'boxbraids', 'knotlessbraids', 'protectivestyles', 'naturalhairstyles'];
    } else if (doesLashes) {
      hashtags = ['lashes', 'lashextensions', 'volumelashes', 'wispylashes', 'classiclashes', 'megalashes'];
    } else {
      hashtags = ['braids', 'lashes', 'beauty', 'hairstyles'];
    }

    console.log(`Scraping Instagram hashtags:`, hashtags);

    // Run Instagram hashtag scraper
    const instagramResults: any[] = [];
    for (const hashtag of hashtags.slice(0, 3)) { // Limit to 3 hashtags to avoid rate limits
      try {
        console.log(`Scraping Instagram #${hashtag}...`);
        const instagramResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hashtags: [hashtag],
            resultsLimit: 20,
            addParentData: false
          })
        });

        if (instagramResponse.ok) {
          const data = await instagramResponse.json();
          instagramResults.push(...(data || []));
          console.log(`Scraped ${data?.length || 0} posts for #${hashtag}`);
        }
      } catch (error) {
        console.error(`Error scraping Instagram #${hashtag}:`, error);
      }
    }

    // Run TikTok scraper
    console.log(`Scraping TikTok for beauty trends...`);
    let tiktokResults: any[] = [];
    try {
      const tiktokKeywords = doesBarber 
        ? 'barber fade haircut mens grooming' 
        : doesHair 
          ? 'braids hairstyles' 
          : doesLashes 
            ? 'lash extensions' 
            : 'beauty hair lashes';
      const tiktokResponse = await fetch(`https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQueries: [tiktokKeywords],
          resultsPerPage: 20,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false
        })
      });

      if (tiktokResponse.ok) {
        const data = await tiktokResponse.json();
        tiktokResults = data || [];
        console.log(`Scraped ${tiktokResults.length} TikTok videos`);
      }
    } catch (error) {
      console.error('Error scraping TikTok:', error);
    }

    // Analyze scraped data with OpenAI
    console.log("Analyzing real social media data with AI...");
    
    const analysisPrompt = `Analyze the following real social media data from Instagram and TikTok to identify the top 10 trending beauty styles.

Instagram Posts (${instagramResults.length} posts):
${JSON.stringify(instagramResults.slice(0, 30).map(post => ({
  caption: post.caption,
  likes: post.likesCount,
  comments: post.commentsCount,
  hashtags: post.hashtags
})))}

TikTok Videos (${tiktokResults.length} videos):
${JSON.stringify(tiktokResults.slice(0, 30).map(video => ({
  description: video.text,
  likes: video.diggCount,
  shares: video.shareCount,
  views: video.playCount
})))}

Based on this REAL DATA, identify the top 10 trending styles. For each trend:
1. Extract the actual style name from captions/hashtags
2. Calculate popularity score (0-100) based on engagement metrics (likes, comments, shares, views)
3. Write a description explaining why it's trending based on the actual posts

IMPORTANT: EXCLUDE "Viking Braids" from results (often used sarcastically online).

Focus on: ${doesBarber && (doesHair || doesLashes) 
  ? 'barber services, hairstyles, and lash extensions' 
  : doesBarber 
    ? 'barber services and mens grooming only' 
    : doesHair && doesLashes 
      ? 'both hairstyles and lash extensions' 
      : doesHair 
        ? 'hairstyles only' 
        : doesLashes 
          ? 'lash extensions only' 
          : 'beauty styles'}

Return ONLY a JSON array with objects containing: name, description, popularity_score`;

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
            content: 'You are a data analyst specializing in beauty industry trends. Analyze real social media data and extract concrete trending styles with accurate popularity metrics. Return only valid JSON.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
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
      const jsonMatch = trendsText.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/) || trendsText.match(/(\[[\s\S]*\])/);
      const jsonStr = jsonMatch ? jsonMatch[1] : trendsText;
      aiTrends = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      throw new Error("Could not parse trend data from AI");
    }

    // Filter out Viking Braids (used sarcastically online)
    aiTrends = aiTrends.filter((trend: any) => 
      !trend.name?.toLowerCase().includes('viking')
    );

    console.log(`Analyzed ${aiTrends.length} trends from real social media data`);

    if (aiTrends.length > 0) {
      // Clear existing trends and insert new ones
      await supabaseClient.from("trends").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      const { error: insertError } = await supabaseClient
        .from("trends")
        .insert(aiTrends);

      if (insertError) {
        console.error("Error inserting trends:", insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${aiTrends.length} AI-generated trends`);
    }

    return new Response(
      JSON.stringify({ success: true, count: aiTrends.length }),
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
