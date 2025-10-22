import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface GalleryItem {
  id: string;
  appointment_date: string;
  preview_image_url: string | null;
  status: string;
  services: {
    name: string;
  };
  profiles: {
    full_name: string | null;
  };
}

export default function StyleGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          preview_image_url,
          status,
          services(name),
          profiles!appointments_provider_id_fkey(full_name)
        `)
        .eq("client_id", user.id)
        .not("preview_image_url", "is", null)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setGallery(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const bookAgain = (serviceId: string) => {
    toast.info("Booking feature coming soon!");
    // Would navigate to booking with pre-selected service
  };

  if (loading) {
    return <div className="text-center py-12">Loading gallery...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Style Gallery</h2>
        <p className="text-muted-foreground mt-2">
          Your beauty journey and favorite looks
        </p>
      </div>

      {gallery.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No styles in your gallery yet</p>
                <p className="text-sm">Book your first appointment to start building your collection</p>
              </div>
              <Button onClick={() => navigate("/client/new-booking")}>
                Book Your First Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-muted">
                {item.preview_image_url && (
                  <img
                    src={item.preview_image_url}
                    alt={item.services.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={`${
                    item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{item.services.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.profiles.full_name || "Provider"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.appointment_date).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => bookAgain(item.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Book Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
