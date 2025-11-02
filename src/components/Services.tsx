import ServiceCard from "./ServiceCard";
import { Clock, Calendar, Sparkles, Briefcase } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Clock,
      title: "Always-On",
      description: "24/7 booking and management. Access services anytime, anywhere.",
    },
    {
      icon: Calendar,
      title: "Online Bookings, Secure Payments",
      description: "Real-time scheduling with safe, encrypted payment processing.",
    },
    {
      icon: Sparkles,
      title: "Stylist Matching and Discovery",
      description: "AI-generated style previews using your selfie to find the perfect match.",
    },
    {
      icon: Briefcase,
      title: "Business Tools",
      description: "Scheduling, analytics, and portfolio management for service providers.",
    },
  ];

  return (
    <section id="services" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to discover, book and{" "}
            <span className="text-primary">manage beauty services</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
