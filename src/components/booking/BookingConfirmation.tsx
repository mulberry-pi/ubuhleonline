import { useEffect, useState } from "react";
import { CheckCircle2, Calendar, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stylist, BookingFormData } from "@/types/booking";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BookingConfirmationProps {
  stylist: Stylist;
  bookingData: BookingFormData;
  onReset: () => void;
}

const BookingConfirmation = ({ stylist, bookingData, onReset }: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const [providerAddress, setProviderAddress] = useState<string>('');

  useEffect(() => {
    // Fetch provider's full address now that payment is complete
    const fetchProviderAddress = async () => {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('street_address_line1, street_address_line2, suburb, city, province')
        .eq('user_id', stylist.id)
        .single();

      if (data && !error) {
        // Build full address from components
        const addressParts = [
          data.street_address_line1,
          data.street_address_line2,
          data.suburb,
          data.city,
          data.province
        ].filter(Boolean);
        setProviderAddress(addressParts.join(', '));
      }
    };

    fetchProviderAddress();
  }, [stylist.id]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
        {/* Success Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary/10 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-primary animate-scale-in" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold">
            Booking <span className="text-primary">Confirmed</span> ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Thank you for trusting Ubuhle. {stylist.name} can't wait to meet you!
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-card rounded-2xl p-8 shadow-elegant border border-primary/20 text-left">
          <h3 className="text-lg font-semibold mb-4">Your Appointment Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {format(bookingData.date, "EEEE, MMMM d, yyyy")} at {bookingData.time}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stylist.services.find(s => s.id === bookingData.service)?.duration} minutes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <img
                  src={stylist.avatar}
                  alt={stylist.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{stylist.name}</p>
                <p className="text-sm text-muted-foreground">{stylist.businessName}</p>
              </div>
            </div>

            {providerAddress && (
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Location Address</p>
                  <p className="text-sm text-muted-foreground">{providerAddress}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Address revealed after payment confirmation
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium capitalize">{bookingData.location} Visit</p>
                <p className="text-sm text-muted-foreground">
                  {stylist.services.find(s => s.id === bookingData.service)?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              // Add to calendar functionality
              const event = {
                title: `Ubuhle Appointment with ${stylist.name}`,
                start: bookingData.date,
                duration: stylist.services.find(s => s.id === bookingData.service)?.duration || 60,
              };
              console.log("Add to calendar:", event);
            }}
            variant="outline"
            size="lg"
            className="px-8"
          >
            <Calendar className="mr-2 w-5 h-5" />
            Add to Calendar
          </Button>
          <Button onClick={() => navigate("/")} size="lg" className="hover-glow px-8">
            <Home className="mr-2 w-5 h-5" />
            Back to Home
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to {bookingData.email}
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
