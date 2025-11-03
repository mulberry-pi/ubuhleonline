import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, RefreshCw, MessageSquare, BarChart3, Settings } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import freelancerImage from "@/assets/freelancer-provider.png";
import lashTechImage from "@/assets/lash-tech-provider.png";
import salonTeamImage from "@/assets/salon-team-provider.png";

const ServiceProviders = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: TrendingUp,
      title: "Market Trend Analysis & Visual Summary",
      description: "Stay ahead of beauty trends with AI insights that visualize what's gaining traction online before it peaks.",
    },
    {
      icon: Calendar,
      title: "Online Appointment Management",
      description: "Accept, reschedule, or cancel appointments from any device — seamlessly.",
    },
    {
      icon: RefreshCw,
      title: "Automatic Calendar Syncing",
      description: "Sync Ubuhle bookings to Google, Apple, or Outlook calendars in real time.",
    },
    {
      icon: MessageSquare,
      title: "Smart Consultations",
      description: "Automatically receive your client's inspo + AI preview + description for each booking.",
    },
    {
      icon: BarChart3,
      title: "Business Analytics Dashboard",
      description: "Track your monthly growth, repeat clients, average booking value, most requested services, and cancellation rates.",
    },
    {
      icon: Settings,
      title: "Metrics Tracking Suggestions",
      description: "Monitor: client retention rate, avg. spend per client, peak booking times, service popularity, revenue growth.",
    },
  ];

  const providerTypes = [
    {
      image: freelancerImage,
      title: "Freelancer",
      subtitle: "Grow your independent brand with tools that help you stand out.",
    },
    {
      image: lashTechImage,
      title: "Lash Technician",
      subtitle: "Reach more clients who love your artistry.",
    },
    {
      image: salonTeamImage,
      title: "Salon",
      subtitle: "Streamline your team's bookings and client communications.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-end overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(38,30,54,0.3) 0%, rgba(38,30,54,0.6) 100%)",
            }}
          />
        </div>

        {/* Hero Content - Bottom Third, Left Aligned */}
        <div className="relative z-20 pb-20 px-6 md:px-12 lg:px-20 max-w-5xl">
          <h1
            className="text-[36px] md:text-[42px] font-semibold text-white leading-[44px] md:leading-[52px] mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Empowering beauty professionals with the tools to grow, connect, and thrive.
          </h1>
          <p
            className="text-[18px] text-[#E8E0F5] max-w-[600px] mb-6"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Ubuhle helps stylists, salons, and technicians manage bookings, analyze trends, and
            connect with clients effortlessly.
          </p>
          <Button
            onClick={() => navigate("/signup/provider")}
            className="bg-[#C9B3F6] text-[#261E36] hover:bg-[#C9B3F6]/90 px-9 py-7 text-base font-semibold"
            style={{ borderRadius: "50px", fontFamily: "'Poppins', sans-serif" }}
          >
            Join as a Service Provider
          </Button>
        </div>
      </section>

      {/* Service Provider Types Carousel */}
      <section className="py-20" style={{ background: "#F7F2EE" }}>
        <div className="container mx-auto px-6">
          <h2
            className="text-[32px] font-semibold text-[#261E36] text-center mb-10"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            We work with every kind of beauty professional
          </h2>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 6000,
              }),
            ]}
            className="w-[90%] mx-auto"
          >
            <CarouselContent>
              {providerTypes.map((provider, index) => (
                <CarouselItem key={index}>
                  <div
                    className="relative h-[480px] rounded-[32px] overflow-hidden"
                    style={{
                      boxShadow: "0px 6px 24px rgba(134,134,249,0.15)",
                    }}
                  >
                    <img
                      src={provider.image}
                      alt={provider.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
                      <h3
                        className="text-[36px] font-bold text-white mb-4"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        }}
                      >
                        {provider.title}
                      </h3>
                      <p
                        className="text-[18px] text-white/90 mb-8 max-w-md"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {provider.subtitle}
                      </p>
                      <Button
                        onClick={() => navigate("/signup/provider")}
                        className="bg-white/90 text-[#261E36] hover:bg-white px-8 py-6"
                        style={{ borderRadius: "50px", fontFamily: "'Poppins', sans-serif" }}
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24" style={{ background: "#E8E0F5", padding: "100px 10%" }}>
        <h2
          className="text-[32px] font-semibold text-[#261E36] text-center mb-12"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          How you benefit from working with us
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 transition-transform hover:scale-[1.02]"
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 4px 14px rgba(38,30,54,0.08)",
                }}
              >
                <Icon className="w-10 h-10 mb-4" style={{ color: "#7546E8" }} />
                <h3
                  className="text-xl font-semibold text-[#261E36] mb-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-[#261E36]/80"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServiceProviders;
