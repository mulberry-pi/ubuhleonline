import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StylistCarousel from "@/components/booking/StylistCarousel";
import StylistProfileModal from "@/components/booking/StylistProfileModal";
import BookingForm from "@/components/booking/BookingForm";
import PaymentSection from "@/components/booking/PaymentSection";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { mockStylists } from "@/data/mockStylists";
import { Stylist, BookingFormData } from "@/types/booking";

type BookingStage = "browse" | "profile" | "booking" | "payment" | "confirmation";

const Booking = () => {
  const [stage, setStage] = useState<BookingStage>("browse");
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  const handleStylistSelect = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setStage("profile");
  };

  const handleBookingSubmit = (data: BookingFormData) => {
    setBookingData(data);
    if (data.payDeposit) {
      setStage("payment");
    } else {
      setStage("confirmation");
    }
  };

  const handlePaymentComplete = () => {
    setStage("confirmation");
  };

  const handleReset = () => {
    setStage("browse");
    setSelectedStylist(null);
    setBookingData(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {stage === "browse" && (
        <>
          {/* Hero Section */}
          <section className="pt-32 pb-16 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            </div>

            <div className="container mx-auto text-center relative z-10">
              <h1
                className="text-5xl md:text-6xl font-bold mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Matched Stylists for <span className="text-primary">Your Style Preview</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We've found professionals who specialize in your chosen look.
              </p>
            </div>
          </section>

          {/* Stylist Carousel */}
          <section className="px-6 pb-16">
            <StylistCarousel stylists={mockStylists} onStylistSelect={handleStylistSelect} />
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
            <BookingForm stylist={selectedStylist} onSubmit={handleBookingSubmit} onBack={() => setStage("profile")} />
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
