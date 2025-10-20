import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadInterface from "@/components/stylepreview/UploadInterface";
import ProcessingAnimation from "@/components/stylepreview/ProcessingAnimation";
import ResultComparison from "@/components/stylepreview/ResultComparison";

const StylePreview = () => {
  const [stage, setStage] = useState<"upload" | "processing" | "result">("upload");
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleUploadComplete = (selfie: string, inspiration: string) => {
    setSelfieImage(selfie);
    setInspirationImage(inspiration);
    setStage("processing");
    
    // Simulate AI processing (replace with actual API call)
    setTimeout(() => {
      setGeneratedImage(selfie); // Mock: use selfie as generated for now
      setStage("result");
    }, 4000);
  };

  const handleReset = () => {
    setStage("upload");
    setSelfieImage(null);
    setInspirationImage(null);
    setGeneratedImage(null);
  };

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
            <ResultComparison 
              originalImage={selfieImage}
              generatedImage={generatedImage}
              onReset={handleReset}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StylePreview;
