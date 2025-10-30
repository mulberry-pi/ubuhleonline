import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProcessingAnimation from "@/components/stylepreview/ProcessingAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Upload, Image as ImageIcon, Camera } from "lucide-react";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StylePreview = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState<string>("");

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInspirationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNativeCamera = async (source: CameraSource) => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        promptLabelHeader: source === CameraSource.Camera ? 'Take a Photo' : 'Choose from Gallery',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'Photo Gallery',
        promptLabelPicture: 'Camera',
      });

      if (image.dataUrl) {
        setInspirationImage(image.dataUrl);
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Camera error:', error);
        toast.error('Failed to access camera or gallery. Please check permissions.');
      }
    }
  };

  const handleFindMatches = async () => {
    if (!user) {
      toast.error("Please sign in to find stylist matches");
      navigate("/auth");
      return;
    }

    if (!inspirationImage && !textDescription.trim()) {
      toast.error("Please upload an image or describe your desired look");
      return;
    }

    setIsAnalyzing(true);

    try {
      let finalDescription = textDescription;

      // If there's an image, analyze it with AI
      if (inspirationImage) {
        const { data, error } = await supabase.functions.invoke("analyze-inspiration", {
          body: { inspirationImageUrl: inspirationImage }
        });

        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.success && data?.description) {
          finalDescription = data.description;
          // Combine with user text if provided
          if (textDescription.trim()) {
            finalDescription = `${finalDescription}\n\nAdditional details: ${textDescription}`;
          }
        } else {
          throw new Error("Failed to analyze inspiration image");
        }
      }

      // Navigate to stylist match page with the description and image
      const params = new URLSearchParams();
      params.set('description', finalDescription);
      if (inspirationImage) {
        params.set('image', inspirationImage);
      }
      
      navigate(`/client/stylist-match?${params.toString()}`);

    } catch (error) {
      console.error("Error finding matches:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to find matches. Please try again."
      );
      setIsAnalyzing(false);
    }
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find your perfect <span className="text-primary">style match.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Upload your style inspiration and let AI connect you with the best stylists for your look.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-6 pb-16">
        <div className="container mx-auto max-w-4xl">
          {isAnalyzing ? (
            <ProcessingAnimation />
          ) : (
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-elegant border border-border/50">
              <div className="space-y-8">
                {/* Upload Section */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center">Upload Style Inspiration</h2>
                  <p className="text-muted-foreground text-center">
                    Show us what you're looking for and we'll find the perfect stylists
                  </p>

                  <div
                    className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group ${
                      inspirationImage
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {inspirationImage ? (
                      <>
                        <img
                          src={inspirationImage}
                          alt="Style inspiration"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <label className="cursor-pointer">
                            <Upload className="w-12 h-12 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-primary/60 mb-4" />
                        <p className="text-lg font-medium text-foreground/80 mb-2">Upload Your Inspiration</p>
                        <p className="text-sm text-muted-foreground mb-6">
                          Hair, lashes, nails — show us your dream look
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            size="lg" 
                            className="hover-glow"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose from Files
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => handleNativeCamera(CameraSource.Photos)}
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Photo Gallery
                          </Button>
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => handleNativeCamera(CameraSource.Camera)}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground font-medium">OR</span>
                  </div>
                </div>

                {/* Text Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Describe Your Desired Look</h3>
                  <Textarea
                    placeholder="E.g., 'waist-length knotless braids with honey-blonde highlights and curled ends' or 'wispy volume lashes with a natural curl'"
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    The more details you provide, the better we can match you with the right stylists
                  </p>
                </div>

                {/* Find Matches Button */}
                <div className="text-center pt-4">
                  <Button
                    onClick={handleFindMatches}
                    disabled={!inspirationImage && !textDescription.trim()}
                    size="lg"
                    className="px-12 hover-glow text-lg h-14 w-full sm:w-auto"
                  >
                    Find My Matches
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StylePreview;
