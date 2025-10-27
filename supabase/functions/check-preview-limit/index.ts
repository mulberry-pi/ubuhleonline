import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id } = await req.json();

    if (!user_id) {
      console.error("Missing user_id in request");
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking preview limit for user: ${user_id}`);

    // Get user's preview usage and limits
    const { data: userRole, error: fetchError } = await supabase
      .from("user_roles")
      .select("role, previews_used, max_previews, subscription_status")
      .eq("user_id", user_id)
      .single();

    if (fetchError || !userRole) {
      console.error("User not found or error fetching user:", fetchError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User role: ${userRole.role}, previews used: ${userRole.previews_used}/${userRole.max_previews}`);

    // Check if user has reached their preview limit
    if (userRole.previews_used >= userRole.max_previews) {
      console.log(`Preview limit reached for user: ${user_id}`);
      return new Response(
        JSON.stringify({
          allowed: false,
          error: "Preview limit reached. Upgrade to a subscription for more previews.",
          previews_used: userRole.previews_used,
          max_previews: userRole.max_previews,
          subscription_status: userRole.subscription_status
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment preview counter
    const { error: updateError } = await supabase
      .from("user_roles")
      .update({ previews_used: userRole.previews_used + 1 })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Error updating preview count:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update preview count" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Preview allowed for user: ${user_id}. New count: ${userRole.previews_used + 1}`);

    return new Response(
      JSON.stringify({
        allowed: true,
        previews_used: userRole.previews_used + 1,
        max_previews: userRole.max_previews,
        subscription_status: userRole.subscription_status
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error in check-preview-limit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
