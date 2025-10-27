import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Step 1: Analyzing inspiration image...");

    // Step 1: Analyze the inspiration image to extract style details
    const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
    const selfieAnalysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
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

    console.log("Step 3: Generating style preview with gpt-image-1...");

    // Step 3: Generate the styled image combining person + style
    const combinedPrompt = `Create a realistic portrait photo of a person with these exact characteristics:

PERSON DETAILS (MUST MATCH EXACTLY):
${personDescription}

STYLE TO APPLY:
${styleDescription}

IMPORTANT: Keep the person's facial features, skin tone, and overall appearance IDENTICAL to the description. Only apply the hairstyle/lash style changes described. The result should look like a professional beauty salon photo.`;

    const generationResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: combinedPrompt,
        n: 1,
        size: "1024x1536",
        quality: "high",
        output_format: "png"
      }),
    });

    if (!generationResponse.ok) {
      const errorText = await generationResponse.text();
      console.error("Generation error:", generationResponse.status, errorText);
      throw new Error(`Preview generation failed: ${errorText}`);
    }

    const generationData = await generationResponse.json();
    
    // Extract the generated image (gpt-image-1 returns base64)
    const generatedImageBase64 = generationData.data?.[0]?.b64_json;
    
    if (!generatedImageBase64) {
      console.error("Generation response:", JSON.stringify(generationData));
      throw new Error("No image was generated");
    }

    // Convert base64 to data URL
    const generatedImageUrl = `data:image/png;base64,${generatedImageBase64}`;

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
