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
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth to verify identity
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verify user identity
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating style preview for authenticated user: ${user.id}`);

    const { selfieUrl, inspirationUrl } = await req.json();

    if (!selfieUrl || !inspirationUrl) {
      throw new Error("Both selfie and inspiration images are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Step 1: Analyzing inspiration image...");

    // Step 1: Analyze the inspiration image to extract style details
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a beauty style analyst specializing in hairstyles and lash styles for people of colour. Provide detailed, technical breakdowns of styles in uploaded images. Focus on specific, actionable details that can be replicated."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this beauty style in extreme detail. Focus on: hair/lash length, texture, volume, colour/tone, parting/shape, any accessories, structural elements, and overall aesthetic. Be very specific and technical."
              },
              {
                type: "image_url",
                image_url: { url: inspirationUrl }
              }
            ]
          }
        ]
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("Analysis error:", analysisResponse.status, errorText);
      throw new Error(`Style analysis failed: ${errorText}`);
    }

    const analysisData = await analysisResponse.json();
    const styleDescription = analysisData.choices[0].message.content;
    console.log("Style analysis completed:", styleDescription.substring(0, 200) + "...");

    console.log("Step 2: Analyzing selfie to describe the person...");

    // Step 2: Analyze the selfie to get person details
    const selfieAnalysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a portrait description expert. Describe people accurately focusing on facial features, skin tone, face shape, and current hairstyle/appearance."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this person in detail: face shape, skin tone, facial features, current hairstyle, and overall appearance. Be specific and accurate so the person can be recreated in an image."
              },
              {
                type: "image_url",
                image_url: { url: selfieUrl }
              }
            ]
          }
        ]
      }),
    });

    if (!selfieAnalysisResponse.ok) {
      const errorText = await selfieAnalysisResponse.text();
      console.error("Selfie analysis error:", selfieAnalysisResponse.status, errorText);
      throw new Error(`Selfie analysis failed: ${errorText}`);
    }

    const selfieData = await selfieAnalysisResponse.json();
    const personDescription = selfieData.choices[0].message.content;
    console.log("Person description completed:", personDescription.substring(0, 200) + "...");

    console.log("Step 3: Generating style preview with Gemini image model...");

    // Step 3: Generate the styled image using Gemini image generation
    const combinedPrompt = `Create a hyper-realistic professional beauty salon portrait photograph showing this exact person with a new hairstyle:

CRITICAL - PERSON FEATURES (MUST remain 100% identical):
${personDescription}

CRITICAL - NEW HAIRSTYLE TO APPLY (transfer THIS style to the person above):
${styleDescription}

REQUIREMENTS:
- Keep the person's face, skin tone, and facial features EXACTLY as described
- ONLY change the hairstyle to match the style description
- Ultra-realistic photography quality
- Professional beauty salon lighting
- Sharp focus on hair details and texture
- Natural, flattering angle`;

    const generationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: combinedPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!generationResponse.ok) {
      const errorText = await generationResponse.text();
      console.error("Generation error:", generationResponse.status, errorText);
      throw new Error(`Preview generation failed: ${errorText}`);
    }

    const generationData = await generationResponse.json();
    
    // Extract the generated image from Gemini response
    const generatedImageUrl = generationData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImageUrl) {
      console.error("Generation response:", JSON.stringify(generationData));
      throw new Error("No image was generated");
    }

    console.log("Style preview generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        previewUrl: generatedImageUrl,
        styleAnalysis: styleDescription
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in generate-style-preview:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
