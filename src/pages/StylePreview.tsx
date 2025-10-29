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
  const [stage, setStage] = useState<'select-service' | 'upload' | 'processing' | 'result'>('select-service');
  const [serviceType, setServiceType] = useState<'hair' | 'lash' | null>(null);
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
      // Check preview limit - function now uses authenticated user from JWT
      const { data: limitCheck, error: limitError } = await supabase.functions.invoke(
        'check-preview-limit'
      );

      if (limitError) {
        throw new Error("Failed to check preview limit");
      }

      if (!limitCheck?.allowed) {
        toast.error(limitCheck?.error || "Preview limit reached");
        setStage("upload");
        return;
      }

      // Generate style preview
      const { data, error } = await supabase.functions.invoke("generate-style-preview", {
        body: {
          selfieUrl: selfie,
          inspirationUrl: inspiration,
          serviceType: serviceType,
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
    setStage("select-service");
    setServiceType(null);
    setSelfieImage(null);
    setInspirationImage(null);
    setGeneratedImage(null);
    setStyleAnalysis(null);
  };

  const handleServiceSelect = (type: 'hair' | 'lash') => {
    setServiceType(type);
    setStage("upload");
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
          {stage === 'select-service' && (
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Choose Your Service</h2>
                <p className="text-lg text-muted-foreground">
                  Select the type of style preview you'd like to see
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleServiceSelect('hair')}
                  className="group p-8 rounded-2xl border-2 border-border hover:border-primary transition-all hover:shadow-lg bg-card"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold">Hairstyle</h3>
                    <p className="text-muted-foreground">
                      Preview different hairstyles and colors on yourself
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleServiceSelect('lash')}
                  className="group p-8 rounded-2xl border-2 border-border hover:border-primary transition-all hover:shadow-lg bg-card"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold">Lash Style</h3>
                    <p className="text-muted-foreground">
                      See how different lash extensions look on you
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {stage === "upload" && serviceType && (
            <UploadInterface 
              onUploadComplete={handleUploadComplete}
              selfieImage={selfieImage}
              inspirationImage={inspirationImage}
              serviceType={serviceType}
            />
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
