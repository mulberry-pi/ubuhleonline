import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const customerPlans = [
    {
      name: "Free Plan",
      price: "ZAR 0",
      period: "",
      features: [
        "Book online appointments",
        "1 AI preview weekly",
        "Review stylists and salons"
      ]
    },
    {
      name: "Pro Plan",
      price: isYearly ? "R500" : "ZAR 59",
      period: isYearly ? "/ 12 months" : "p/m",
      features: [
        "Stylist matching and recommendations",
        "5 AI previews weekly",
        "Personalized style AI recommendations"
      ]
    }
  ];

  const providerFeatures = [
    "Receive client style previews prior to appointments",
    "Analytics & reporting",
    "2 staff accounts",
    "24/7 help support",
    "Automated marketing",
    "POS & payment processing"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Billing Toggle */}
        <div className="container mx-auto px-6 mb-16">
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <span className={`text-lg font-medium transition-colors ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 rounded-full bg-muted transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
              style={{
                backgroundColor: isYearly ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
              }}
            >
              <div
                className="absolute top-1 left-1 w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300"
                style={{
                  transform: isYearly ? 'translateX(32px)' : 'translateX(0)'
                }}
              />
            </button>
            <span className={`text-lg font-medium transition-colors ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Yearly
            </span>
          </div>
        </div>

        {/* Section 1: Customers */}
        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Pricing Model — Customers
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {customerPlans.map((plan, index) => (
              <Card
                key={plan.name}
                className="p-10 bg-card shadow-[0_8px_30px_-2px_hsl(266_60%_70%/0.15)] hover:shadow-[0_12px_40px_-4px_hsl(266_60%_70%/0.25)] transition-all duration-500 hover:-translate-y-2 rounded-2xl animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                  <div className="mb-6 transition-all duration-300">
                    <span className="text-5xl font-bold text-primary">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.period}</p>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/get-started")}
                  className="w-full h-12 rounded-md"
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Service Providers */}
        <section className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Pricing Model — Service Providers
            </h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card 
              className="p-12 bg-card shadow-[0_8px_30px_-2px_hsl(266_60%_70%/0.15)] hover:shadow-[0_12px_40px_-4px_hsl(266_60%_70%/0.25)] transition-all duration-300 rounded-2xl animate-fade-in"
              style={{ animationDelay: '450ms' }}
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Pro Plan</h3>
                <div className="mb-8 transition-all duration-300">
                  <span className="text-6xl font-bold text-primary">
                    {isYearly ? "R1200" : "ZAR 149"}
                  </span>
                  <p className="text-lg text-muted-foreground mt-2">
                    {isYearly ? "/ 12 months" : "per month"}
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {providerFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-muted-foreground leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isYearly && (
                <div className="bg-muted/50 rounded-xl p-6 mb-8 transition-all duration-300">
                  <p className="text-center text-sm font-medium mb-3">
                    Extended Payment Options
                  </p>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-primary">6 MONTHS</p>
                      <p className="text-muted-foreground">R800</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <p className="font-bold text-primary">12 MONTHS</p>
                      <p className="text-muted-foreground">R1200</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => navigate("/get-started")}
                className="w-full h-14 rounded-md text-lg"
              >
                Get Started
              </Button>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
