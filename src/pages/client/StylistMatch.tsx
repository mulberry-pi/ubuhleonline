import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { mockProviders } from "@/data/mockProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Stylist {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_logo_url: string;
  rating: number;
  profiles: {
    full_name: string;
  };
}

const StylistMatch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const searchType = searchParams.get("type");

  useEffect(() => {
    const imageData = searchParams.get("image");
    if (imageData) {
      setSearchImage(imageData);
    }
    fetchStylists();
  }, [searchParams]);

  const fetchStylists = async () => {
    try {
      // Using mock data for testing
      const mockData = mockProviders.map(provider => ({
        id: provider.id,
        user_id: provider.user_id,
        business_name: provider.business_name,
        business_description: provider.business_description,
        business_address: provider.business_address || `${provider.suburb}, ${provider.city}`,
        business_logo_url: provider.business_logo_url,
        rating: provider.rating,
        profiles: {
          full_name: provider.business_name
        }
      }));
      
      setStylists(mockData);
      toast.success(`Found ${mockData.length} stylists for you!`);
    } catch (error) {
      console.error("Error fetching stylists:", error);
      toast.error("Failed to load stylists");
    } finally {
      setLoading(false);
    }
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Your Perfect {searchType === "preview" ? "Style" : "Inspiration"} Match
          </h1>
          <p className="text-muted-foreground">
            Based on your {searchType === "preview" ? "generated preview" : "style inspiration"}, we've found these amazing stylists for you.
          </p>
        </div>

        {searchImage && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <img
                  src={searchImage}
                  alt="Search reference"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold mb-2">Your Reference Style</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing stylists who specialize in this look
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stylists.map((stylist) => (
            <Card key={stylist.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={stylist.business_logo_url} />
                    <AvatarFallback>
                      {stylist.business_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {stylist.business_name || stylist.profiles.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{stylist.rating?.toFixed(1) || "5.0"}</span>
                    </div>
                  </div>
                </div>

                {stylist.business_description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {stylist.business_description}
                  </p>
                )}

                {stylist.business_address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{stylist.business_address}</span>
                  </div>
                )}

                <Badge variant="secondary" className="mb-4">
                  Recommended Match
                </Badge>

                <Button
                  onClick={() => handleBookStylist(stylist.user_id)}
                  className="w-full"
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {stylists.length === 0 && (
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
