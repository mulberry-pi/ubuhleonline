import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function NewBooking() {
  const [step, setStep] = useState<"upload" | "preview" | "select">("upload");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [inspFile, setInspFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFile(file);
    }
  };

  const handleInspoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInspFile(file);
    }
  };

  const generatePreview = () => {
    if (!selfieFile || !inspFile) {
      toast.error("Please upload both images");
      return;
    }

    // Simulate AI processing
    toast.info("Generating AI preview...");
    setTimeout(() => {
      // In real implementation, this would call an AI service
      setPreviewUrl(URL.createObjectURL(inspFile));
      setStep("preview");
      toast.success("Preview generated!");
    }, 2000);
  };

  const proceedToProviderSelection = () => {
    setStep("select");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-semibold">New Booking</h2>
        <p className="text-muted-foreground mt-2">
          Upload your photo and style inspiration to see an AI preview
        </p>
      </div>

      {step === "upload" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Selfie</CardTitle>
              <CardDescription>Clear photo showing your current hairstyle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieUpload}
                  className="hidden"
                  id="selfie-upload"
                />
                <label htmlFor="selfie-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {selfieFile ? selfieFile.name : "Click to upload or drag and drop"}
                  </p>
                </label>
              </div>
              {selfieFile && (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={URL.createObjectURL(selfieFile)}
                    alt="Your selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Style Inspiration</CardTitle>
              <CardDescription>The hairstyle you want to try</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleInspoUpload}
                  className="hidden"
                  id="inspo-upload"
                />
                <label htmlFor="inspo-upload" className="cursor-pointer">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {inspFile ? inspFile.name : "Click to upload or drag and drop"}
                  </p>
                </label>
              </div>
              {inspFile && (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={URL.createObjectURL(inspFile)}
                    alt="Style inspiration"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === "upload" && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={generatePreview}
            disabled={!selfieFile || !inspFile}
            className="gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Generate AI Preview
          </Button>
        </div>
      )}

      {step === "preview" && previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle>AI Preview Generated! ✨</CardTitle>
            <CardDescription>Here's how you might look with this style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Your Photo</Label>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {selfieFile && (
                    <img
                      src={URL.createObjectURL(selfieFile)}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">AI Preview</Label>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-primary">
                  <img
                    src={previewUrl}
                    alt="AI Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Try Different Style
              </Button>
              <Button onClick={proceedToProviderSelection} className="gap-2">
                <Search className="h-4 w-4" />
                Find Stylist
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Stylist</CardTitle>
            <CardDescription>Find the perfect professional for your style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center py-12 text-muted-foreground">
              Available stylists will appear here based on your location and preferences
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/search")}>
                Browse All Stylists
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
