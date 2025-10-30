import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MatchedStylist {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_logo_url: string;
  rating: number;
  review_count: number;
  city: string;
  suburb: string;
  gallery_images: string[];
  availability_status: string;
  price_range: string;
  predicted_success: number;
}

const StylistMatch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<MatchedStylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const [styleDescription, setStyleDescription] = useState<string>("");

  useEffect(() => {
    const imageData = searchParams.get("image");
    const description = searchParams.get("description");
    if (imageData) {
      setSearchImage(imageData);
    }
    if (description) {
      setStyleDescription(description);
    }
    fetchMatches();
  }, [searchParams]);

  const fetchMatches = async () => {
    try {
      const imageData = searchParams.get("image");
      const description = searchParams.get("description") || "Natural hairstyle";

      // Call the match-stylists edge function
      const { data, error } = await supabase.functions.invoke('match-stylists', {
        body: {
          previewImageUrl: imageData,
          styleDescription: description,
          clientLocation: "Cape Town, South Africa" // Could be dynamic
        }
      });

      if (error) throw error;

      if (data?.matches && data.matches.length > 0) {
        setStylists(data.matches);
        toast.success(`Found ${data.matches.length} perfect matches!`);
      } else {
        toast.info("No matches found at the moment");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load stylist matches");
    } finally {
      setLoading(false);
    }
  };

  const getSuccessColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const handleBookStylist = (providerId: string) => {
    navigate(`/booking?provider=${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding your perfect match...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Matches</h1>
            <p className="text-muted-foreground">
              AI-powered stylist recommendations based on your preferences
            </p>
          </div>
        </div>

        {stylists.length > 0 && (
          <div className="relative max-w-4xl mx-auto">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {stylists.map((stylist) => (
                  <CarouselItem key={stylist.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
                    <div className="relative">
                      <Card className="overflow-hidden rounded-3xl shadow-xl border-0 bg-gradient-to-b from-card to-card/90">
                        {/* Background Image */}
                        <div className="relative h-[500px]">
                          <img
                            src={stylist.gallery_images?.[0] || stylist.business_logo_url}
                            alt={stylist.business_name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          
                          {/* Predicted Success Badge */}
                          <div className={`absolute top-4 right-4 ${getSuccessColor(stylist.predicted_success)} text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg`}>
                            <span className="text-2xl font-bold">{stylist.predicted_success}%</span>
                            <span className="text-xs text-center">Predicated<br/>success</span>
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">{stylist.business_name}</h2>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{stylist.suburb}, {stylist.city}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{stylist.rating?.toFixed(1) || "5.0"}</span>
                              <span className="text-sm text-white/80">({stylist.review_count || 0})</span>
                            </div>

                            <Badge 
                              variant={stylist.availability_status === "available" ? "default" : "secondary"}
                              className="mb-4"
                            >
                              {stylist.availability_status === "available" ? "Available Today" : "Not Available Today"}
                            </Badge>

                            <div className="mb-4">
                              <p className="text-sm text-white/80 mb-1">Service price range:</p>
                              <p className="text-xl font-bold">{stylist.price_range || "R250 - R450"}</p>
                            </div>

                            {/* Portfolio Preview */}
                            {stylist.gallery_images && stylist.gallery_images.length > 0 && (
                              <div className="flex gap-2 mb-4 overflow-x-auto">
                                {stylist.gallery_images.slice(0, 5).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Portfolio ${idx + 1}`}
                                    className="w-12 h-12 rounded-lg object-cover border-2 border-white/20"
                                  />
                                ))}
                              </div>
                            )}

                            <Button
                              onClick={() => handleBookStylist(stylist.user_id)}
                              className="w-full bg-white text-primary hover:bg-white/90 font-semibold rounded-full py-6 text-lg"
                            >
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>

            <div className="text-center mt-8">
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                Scroll to pass match <ChevronRight className="h-4 w-4" />
              </p>
            </div>
          </div>
        )}

        {stylists.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No stylists found at the moment.
            </p>
            <Button onClick={() => navigate("/client/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylistMatch;
