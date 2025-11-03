import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StylistCarousel from "@/components/booking/StylistCarousel";
import StylistProfileModal from "@/components/booking/StylistProfileModal";
import BookingForm from "@/components/booking/BookingForm";
import PaymentSection from "@/components/booking/PaymentSection";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { Stylist, BookingFormData } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BookingStage = "browse" | "profile" | "booking" | "payment" | "confirmation";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("provider");
  
  const [stage, setStage] = useState<BookingStage>("browse");
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  useEffect(() => {
    if (providerId) {
      fetchProviderData(providerId);
    } else {
      loadStylists();
    }
  }, [providerId]);

  const loadStylists = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("provider_profiles")
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .limit(10);

      if (error) throw error;

      const stylistsData: Stylist[] = await Promise.all((profiles || []).map(async (profile) => {
        const { data: services } = await supabase
          .from("services")
          .select("*")
          .eq("provider_id", profile.user_id)
          .eq("is_available", true);

        return {
          id: profile.user_id,
          name: profile.profiles.full_name || "Professional Stylist",
          businessName: profile.business_name || "",
          avatar: profile.profiles.avatar_url || profile.business_logo_url || "/placeholder.svg",
          bannerImage: profile.business_logo_url || "/placeholder.svg",
          rating: Number(profile.rating) || 5.0,
          reviewCount: profile.review_count || 0,
          location: profile.business_address || "Location not specified",
          bio: profile.business_description || "",
          specialties: [],
          verified: true,
          depositPercentage: profile.deposit_percentage || 50,
          services: (services || []).map(s => ({
            id: s.id,
            name: s.name,
            price: Number(s.price),
            duration: s.duration_minutes,
            description: s.description || undefined
          })),
          availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          portfolioImages: profile.gallery_images || []
        };
      }));

      setStylists(stylistsData);
    } catch (error) {
      console.error("Error loading stylists:", error);
      toast.error("Failed to load stylists");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderData = async (userId: string) => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("provider_profiles")
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url,
            phone,
            email
          )
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching provider:", profileError);
      }

      // If no provider found (mock data scenario), create a mock stylist
      if (!profile) {
        const mockStylist: Stylist = {
          id: userId,
          name: "Professional Beauty Stylist",
          businessName: "Expert Beauty Services",
          avatar: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
          bannerImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800",
          rating: 4.8,
          reviewCount: 127,
          location: "Cape Town, Observatory",
          bio: "Specializing in natural hair care, protective styling, and modern beauty techniques.",
          specialties: ["Braids", "Natural Hair", "Protective Styles"],
          verified: true,
          depositPercentage: 50, // Default 50% for mock data
          services: [
            {
              id: "service-1",
              name: "Knotless Braids",
              price: 800,
              duration: 180,
              description: "Beautiful tension-free knotless braids"
            },
            {
              id: "service-2",
              name: "Silk Press",
              price: 450,
              duration: 120,
              description: "Smooth silk press with heat protectant"
            },
            {
              id: "service-3",
              name: "Twist Out",
              price: 350,
              duration: 90,
              description: "Defined twist out styling"
            }
          ],
          availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          portfolioImages: [
            "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800",
            "https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800"
          ]
        };
        setSelectedStylist(mockStylist);
        setStage("booking");
        toast.info("Testing mode - using sample provider data");
        setLoading(false);
        return;
      }

      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", userId)
        .eq("is_available", true);

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
      }

      const stylist: Stylist = {
        id: profile.user_id,
        name: profile.profiles.full_name || "Professional Stylist",
        businessName: profile.business_name || "",
        avatar: profile.profiles.avatar_url || profile.business_logo_url || "/placeholder.svg",
        bannerImage: profile.business_logo_url || "/placeholder.svg",
        rating: Number(profile.rating) || 5.0,
        reviewCount: profile.review_count || 0,
        location: profile.business_address || "Location not specified",
        bio: profile.business_description || "",
        specialties: [],
        verified: true,
        depositPercentage: profile.deposit_percentage || 50, // Default to 50% if not set
        services: (services || []).map(s => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          duration: s.duration_minutes,
          description: s.description || undefined
        })),
        availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        portfolioImages: profile.gallery_images || []
      };

      setSelectedStylist(stylist);
      setStage("booking");
    } catch (error) {
      console.error("Error fetching provider:", error);
      toast.error("Failed to load provider details");
    } finally {
      setLoading(false);
    }
  };

  const handleStylistSelect = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setStage("profile");
  };

  const handleBookingSubmit = (data: BookingFormData) => {
    setBookingData(data);
    setStage("payment");
  };

  const handlePaymentComplete = () => {
    setStage("confirmation");
  };

  const handleReset = () => {
    setStage("browse");
    setSelectedStylist(null);
    setBookingData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading provider details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {stage === "browse" && !providerId && (
        <>
          {/* Hero Section */}
          <section className="pt-32 pb-16 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            </div>

            <div className="container mx-auto text-center relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Matched Stylists for <span className="text-primary">Your Style Preview</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We've found professionals who specialize in your chosen look.
              </p>
            </div>
          </section>

          {/* Stylist Carousel */}
          <section className="px-6 pb-16">
            {stylists.length > 0 ? (
              <StylistCarousel stylists={stylists} onStylistSelect={handleStylistSelect} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stylists available at the moment</p>
              </div>
            )}
          </section>
        </>
      )}

      {stage === "profile" && selectedStylist && (
        <StylistProfileModal
          stylist={selectedStylist}
          onClose={() => setStage("browse")}
          onBook={() => setStage("booking")}
        />
      )}

      {stage === "booking" && selectedStylist && (
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-3xl">
            <BookingForm 
              stylist={selectedStylist} 
              onSubmit={handleBookingSubmit} 
              onBack={() => providerId ? window.history.back() : setStage("profile")} 
            />
          </div>
        </section>
      )}

      {stage === "payment" && selectedStylist && bookingData && (
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-2xl">
            <PaymentSection
              stylist={selectedStylist}
              bookingData={bookingData}
              onComplete={handlePaymentComplete}
              onBack={() => setStage("booking")}
            />
          </div>
        </section>
      )}

      {stage === "confirmation" && selectedStylist && bookingData && (
        <BookingConfirmation
          stylist={selectedStylist}
          bookingData={bookingData}
          onReset={handleReset}
        />
      )}

      <Footer />
    </div>
  );
};

export default Booking;
