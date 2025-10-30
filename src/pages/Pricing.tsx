import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Client",
      price: "Free",
      description: "Perfect for finding your ideal stylist",
      features: [
        "AI-powered stylist matching",
        "Style preview with AR",
        "Book appointments",
        "Access to verified stylists",
        "Portfolio browsing",
        "Direct messaging"
      ]
    },
    {
      name: "Service Provider - Basic",
      price: "$29",
      period: "/month",
      description: "Get started with your beauty business",
      features: [
        "Professional profile",
        "Portfolio gallery",
        "Appointment management",
        "Client messaging",
        "Basic analytics",
        "Payment processing"
      ],
      popular: false
    },
    {
      name: "Service Provider - Pro",
      price: "$79",
      period: "/month",
      description: "Grow your business with advanced tools",
      features: [
        "Everything in Basic",
        "Advanced analytics & insights",
        "Market trend analysis",
        "AI-powered client matching",
        "Verified results showcase",
        "Priority support",
        "Featured profile placement"
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/get-started")}
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-secondary hover:bg-secondary/90"
                  }`}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Have questions? Contact our team for custom enterprise solutions.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
