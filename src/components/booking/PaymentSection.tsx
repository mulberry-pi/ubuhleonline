import { useState } from "react";
import { Lock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Stylist, BookingFormData } from "@/types/booking";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentSectionProps {
  stylist: Stylist;
  bookingData: BookingFormData;
  onComplete: () => void;
  onBack: () => void;
}

const PaymentSection = ({ stylist, bookingData, onComplete, onBack }: PaymentSectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedService = stylist.services.find(s => s.id === bookingData.service);
  const fullPrice = selectedService?.price || 0;
  const depositPercentage = (stylist.depositPercentage || 50) / 100;
  const serviceFeePercentage = 0.1;
  const depositAmount = selectedService ? Math.round(selectedService.price * depositPercentage) : 0;
  const serviceFee = Math.round(fullPrice * serviceFeePercentage);
  const totalDueNow = depositAmount + serviceFee;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to complete booking');
        return;
      }

      // Skip payment processing - just confirm the booking
      setTimeout(() => {
        toast.success('Booking confirmed! You will receive further details via email.');
        onComplete();
      }, 800);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Button onClick={onBack} variant="ghost">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Booking
      </Button>

      <div className="bg-card rounded-2xl p-8 shadow-elegant border border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Secure Payment
            </h2>
            <p className="text-sm text-muted-foreground">Your payment information is encrypted and secure</p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-8 border border-primary/20">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stylist</span>
              <span className="font-medium">{stylist.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">
                {format(bookingData.date, "PPP")} at {bookingData.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium capitalize">{bookingData.location} Visit</span>
            </div>
            <div className="border-t border-primary/20 pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Price</span>
                <span>R{fullPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit (50%)</span>
                <span>R{depositAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee (10%)</span>
                <span>R{serviceFee}</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between text-base">
                <span className="font-semibold">Total Due Now</span>
                <span className="font-bold text-primary text-lg">R{totalDueNow}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Remaining R{depositAmount} to be paid at appointment
              </p>
            </div>
          </div>
        </div>

        {/* Temporary Payment Notice */}
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Payment Gateway Under Setup
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Our secure payment system is currently being verified and will be available soon. 
                  You can proceed with your booking, and payment details will be provided via email.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConfirmBooking}
            disabled={isProcessing}
            size="lg"
            className="w-full hover-glow text-lg h-14 bg-gradient-to-r from-primary to-accent"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Confirming...
              </>
            ) : (
              <>
                Confirm Booking
                <Lock className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By confirming this booking, you agree to Ubuhle's Terms & Conditions.
            Payment instructions will be sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;