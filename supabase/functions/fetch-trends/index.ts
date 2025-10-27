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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN not configured");
    }

    console.log("Fetching trends from Apify...");

    // Fetch from Instagram hashtag scraper dataset
    const instagramDatasetId = "hO9JplZdPtMIwo6iD";
    const instagramResponse = await fetch(
      `https://api.apify.com/v2/datasets/${instagramDatasetId}/items?token=${APIFY_API_TOKEN}`
    );
    
    // Fetch from TikTok scraper dataset
    const tiktokDatasetId = "D0Jo3fzMngJiBXSTl";
    const tiktokResponse = await fetch(
      `https://api.apify.com/v2/datasets/${tiktokDatasetId}/items?token=${APIFY_API_TOKEN}`
    );

    const instagramData = instagramResponse.ok ? await instagramResponse.json() : [];
    const tiktokData = tiktokResponse.ok ? await tiktokResponse.json() : [];

    console.log(`Fetched ${instagramData.length} Instagram trends and ${tiktokData.length} TikTok trends`);

    // Process and combine trends
    const allTrends = [
      ...instagramData.map((item: any) => ({
        name: item.title || item.hashtag || "Untitled Trend",
        description: `Instagram trend with ${item.stats?.playCount || item.likes || 0} engagements`,
        popularity_score: Math.min(100, Math.floor((item.stats?.playCount || item.likes || 0) / 10000)),
        image_url: item.displayUrl || item.thumbnailUrl || null
      })),
      ...tiktokData.map((item: any) => ({
        name: item.title || item.hashtag || "Untitled Trend",
        description: `TikTok trend with ${item.stats?.playCount || item.likes || 0} views`,
        popularity_score: Math.min(100, Math.floor((item.stats?.playCount || item.likes || 0) / 10000)),
        image_url: item.videoUrl || item.coverUrl || null
      }))
    ];

    // Sort by popularity and take top 10
    const topTrends = allTrends
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, 10);

    if (topTrends.length > 0) {
      // Clear existing trends and insert new ones
      await supabaseClient.from("trends").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      const { error: insertError } = await supabaseClient
        .from("trends")
        .insert(topTrends);

      if (insertError) {
        console.error("Error inserting trends:", insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${topTrends.length} trends`);
    }

    return new Response(
      JSON.stringify({ success: true, count: topTrends.length }),
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
