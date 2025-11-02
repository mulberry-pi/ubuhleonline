import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Portfolio() {
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("provider_profiles")
        .select("gallery_images")
        .eq("user_id", user.id)
        .single();

      if (profile?.gallery_images) {
        setPortfolioImages(profile.gallery_images);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolio images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...portfolioImages, ...uploadedUrls];
        
        const { error: updateError } = await supabase
          .from("provider_profiles")
          .update({ gallery_images: newImages })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        setPortfolioImages(newImages);
        toast({
          title: "Success",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Extract file path from URL
      const urlParts = imageUrl.split('/portfolio-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('portfolio-images')
          .remove([filePath]);
      }

      const newImages = portfolioImages.filter(img => img !== imageUrl);
      
      const { error } = await supabase
        .from("provider_profiles")
        .update({ gallery_images: newImages })
        .eq("user_id", user.id);

      if (error) throw error;

      setPortfolioImages(newImages);
      toast({
        title: "Success",
        description: "Image removed from portfolio",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <ImageIcon className="h-8 w-8" />
          Portfolio Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Showcase your work by uploading portfolio images
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Add images to showcase your work (Max 5MB per image, JPG/PNG/WEBP)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio-upload">Select Images</Label>
            <Input
              id="portfolio-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          {uploading && (
            <p className="text-sm text-muted-foreground">Uploading images...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Gallery</CardTitle>
          <CardDescription>
            {portfolioImages.length} image{portfolioImages.length !== 1 ? 's' : ''} in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {portfolioImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No portfolio images yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload images to showcase your work
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(imageUrl)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
