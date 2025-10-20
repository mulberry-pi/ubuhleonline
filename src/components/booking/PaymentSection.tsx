import { useState } from "react";
import { CreditCard, Lock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stylist, BookingFormData } from "@/types/booking";
import { format } from "date-fns";

interface PaymentSectionProps {
  stylist: Stylist;
  bookingData: BookingFormData;
  onComplete: () => void;
  onBack: () => void;
}

const PaymentSection = ({ stylist, bookingData, onComplete, onBack }: PaymentSectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedService = stylist.services.find(s => s.id === bookingData.service);
  const depositAmount = selectedService ? Math.round(selectedService.price * 0.3) : 0;
  const fullPrice = selectedService?.price || 0;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
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
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            <div className="border-t border-primary/20 pt-3 mt-3">
              <div className="flex justify-between text-base">
                <span className="font-semibold">Deposit Amount (30%)</span>
                <span className="font-bold text-primary text-lg">R{depositAmount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Remaining R{fullPrice - depositAmount} to be paid at appointment
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="h-12 pl-12"
              />
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="123" maxLength={3} className="h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="Name on card"
              className="h-12"
            />
          </div>

          <Button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing}
            size="lg"
            className="w-full hover-glow text-lg h-14 mt-6 bg-gradient-to-r from-primary to-accent"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Pay R{depositAmount}
                <Lock className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By completing this payment, you agree to Ubuhle's Terms & Conditions
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentSection;
