import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, Check } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Stylist, BookingFormData } from "@/types/booking";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
  location: z.enum(["salon", "home"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  payDeposit: z.boolean(),
});

interface BookingFormProps {
  stylist: Stylist;
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const BookingForm = ({ stylist, onSubmit, onBack }: BookingFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      location: "salon",
      payDeposit: false,
    },
  });

  const handleSubmit = (data: BookingFormData) => {
    onSubmit(data);
  };

  return (
    <div className="bg-card rounded-2xl p-8 shadow-elegant border border-primary/20 animate-fade-in-up">
      <Button onClick={onBack} variant="ghost" className="mb-6">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Profile
      </Button>

      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        Book Your Appointment
      </h2>
      <p className="text-muted-foreground mb-8">
        with {stylist.name} at {stylist.businessName}
      </p>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <Label htmlFor="service">Selected Service</Label>
          <Select onValueChange={(value) => form.setValue("service", value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {stylist.services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - R{service.price} ({service.duration} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.service && (
            <p className="text-sm text-destructive">{form.formState.errors.service.message}</p>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) form.setValue("date", date);
                  }}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time</Label>
            <Select onValueChange={(value) => form.setValue("time", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.time && (
              <p className="text-sm text-destructive">{form.formState.errors.time.message}</p>
            )}
          </div>
        </div>

        {/* Location Type */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Select onValueChange={(value: "salon" | "home") => form.setValue("location", value)} defaultValue="salon">
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salon">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Salon Visit
                </div>
              </SelectItem>
              <SelectItem value="home">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Home Visit
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Contact Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Your full name"
              className="h-12"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="your@email.com"
              className="h-12"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="+27 XX XXX XXXX"
              className="h-12"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Deposit Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="deposit">Pay Deposit Now</Label>
            <p className="text-sm text-muted-foreground">Secure your booking with a 30% deposit</p>
          </div>
          <Switch
            id="deposit"
            onCheckedChange={(checked) => form.setValue("payDeposit", checked)}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full hover-glow text-lg h-14">
          {form.watch("payDeposit") ? "Proceed to Payment" : "Confirm Booking"}
          <Check className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
