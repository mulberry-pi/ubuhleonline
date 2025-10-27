import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadInterface from "@/components/stylepreview/UploadInterface";
import ProcessingAnimation from "@/components/stylepreview/ProcessingAnimation";
import ResultComparison from "@/components/stylepreview/ResultComparison";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

const StylePreview = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<"upload" | "processing" | "result">("upload");
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUploadComplete = async (selfie: string, inspiration: string) => {
    if (!user) {
      toast.error("Please sign in to use the style preview feature");
      navigate("/auth");
      return;
    }

    setSelfieImage(selfie);
    setInspirationImage(inspiration);
    setStage("processing");
    
    try {
      // Check preview limit
      const { data: limitData, error: limitError } = await supabase.functions.invoke("check-preview-limit", {
        body: { user_id: user.id }
      });

      if (limitError) {
        throw new Error("Failed to check preview limit");
      }

      if (!limitData?.allowed) {
        toast.error(limitData?.error || "Preview limit reached");
        setStage("upload");
        return;
      }

      // Generate style preview
      const { data, error } = await supabase.functions.invoke("generate-style-preview", {
        body: {
          selfieUrl: selfie,
          inspirationUrl: inspiration
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.previewUrl) {
        setGeneratedImage(data.previewUrl);
        setStyleAnalysis(data.styleAnalysis);
        setStage("result");
      } else {
        throw new Error("Invalid response from style preview service");
      }
    } catch (error) {
      console.error("Error generating style preview:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to generate preview. Please try again."
      );
      setStage("upload");
    }
  };

  const handleReset = () => {
    setStage("upload");
    setSelfieImage(null);
    setInspirationImage(null);
    setGeneratedImage(null);
    setStyleAnalysis(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            See your next look, <span className="text-primary">instantly.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Upload a selfie and your inspiration image to visualize your new style before booking.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-6 pb-16">
        <div className="container mx-auto max-w-5xl">
          {stage === "upload" && (
            <UploadInterface onUploadComplete={handleUploadComplete} />
          )}
          
          {stage === "processing" && (
            <ProcessingAnimation />
          )}
          
          {stage === "result" && selfieImage && generatedImage && (
            <>
              <ResultComparison 
                originalImage={selfieImage}
                generatedImage={generatedImage}
                onReset={handleReset}
              />
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate(`/client/stylist-match?type=preview&image=${encodeURIComponent(generatedImage)}`)}
                  className="flex-1 sm:flex-initial"
                >
                  Search Using Style Preview
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(`/client/stylist-match?type=inspiration&image=${encodeURIComponent(inspirationImage!)}`)}
                  className="flex-1 sm:flex-initial"
                >
                  Search Using Style Inspiration
                </Button>
              </div>
            </>
          )}
          
          {/* Style Analysis - Optional Display */}
          {stage === "result" && styleAnalysis && (
            <div className="mt-8 bg-card rounded-2xl p-6 shadow-elegant border border-border/50">
              <h3 className="text-xl font-semibold mb-3">Style Analysis</h3>
              <p className="text-muted-foreground whitespace-pre-line">{styleAnalysis}</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StylePreview;
