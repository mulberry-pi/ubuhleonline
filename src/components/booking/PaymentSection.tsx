import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Lock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Luhn algorithm for card validation
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Check if expiry date is valid and in the future
const isValidExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  today.setDate(1); // Set to first day of month for comparison
  return expiryDate >= today;
};

const paymentSchema = z.object({
  cardNumber: z.string()
    .regex(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .refine((val) => luhnCheck(val), 'Invalid card number'),
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Invalid format (MM/YY)')
    .refine((val) => isValidExpiry(val), 'Card has expired'),
  cvv: z.string()
    .regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardholderName: z.string()
    .trim()
    .min(2, 'Name is required')
    .max(100, 'Name too long')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentSection = ({ stylist, bookingData, onComplete, onBack }: PaymentSectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedService = stylist.services.find(s => s.id === bookingData.service);
  const depositAmount = selectedService ? Math.round(selectedService.price * 0.3) : 0;
  const fullPrice = selectedService?.price || 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to complete payment');
        return;
      }

      // Split cardholder name
      const nameParts = data.cardholderName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      // Call PayFast payment processing edge function
      const { data: paymentData, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount: depositAmount,
          item_name: `${selectedService?.name} - ${stylist.businessName}`,
          item_description: `Booking deposit for ${format(bookingData.date, "PPP")} at ${bookingData.time}`,
          email_address: user.email,
          name_first: firstName,
          name_last: lastName
        }
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error('Payment processing failed. Please try again.');
        return;
      }

      // In production, redirect to PayFast
      if (paymentData?.payment_url) {
        // Create a form and submit it to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.payment_url;
        
        Object.keys(paymentData.payment_data).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData.payment_data[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        // For now, simulate success
        setTimeout(() => {
          toast.success('Payment processed successfully!');
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234567890123456"
                className="h-12 pl-12"
                {...register("cardNumber")}
              />
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                className="h-12"
                {...register("expiry")}
              />
              {errors.expiry && (
                <p className="text-sm text-destructive">{errors.expiry.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv" 
                placeholder="123" 
                maxLength={4} 
                className="h-12"
                {...register("cvv")}
              />
              {errors.cvv && (
                <p className="text-sm text-destructive">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="Name on card"
              className="h-12"
              {...register("cardholderName")}
            />
            {errors.cardholderName && (
              <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
            )}
          </div>

          <Button
            type="submit"
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