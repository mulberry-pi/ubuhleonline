import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log("Step 2: Generating style preview...");

    // Step 2: Generate preview by applying the style to the selfie
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
            content: [
              {
                type: "text",
                text: `Transform this image by applying the following beauty style while keeping the person's facial features, skin tone, and overall appearance EXACTLY the same. Only change the hair/lashes according to this description:\n\n${styleDescription}\n\nIMPORTANT: Maintain the person's identity completely - same face, same skin, same person. Only the hairstyle/lashes should change to match the description.`
              },
              {
                type: "image_url",
                image_url: { url: selfieUrl }
              }
            ]
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
    
    // Extract the generated image
    const generatedImageUrl = generationData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImageUrl) {
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
