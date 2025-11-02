import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  const customerPlans = [
    {
      name: "Free Plan",
      price: "ZAR 0",
      features: [
        "Book online appointments",
        "1 AI preview weekly",
        "Review stylists and salons"
      ]
    },
    {
      name: "Pro Plan",
      price: "ZAR 59",
      period: "p/m or R500 for 12 months",
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50 -z-10" />
      
      {/* Subtle Wave Pattern */}
      <div className="fixed inset-0 opacity-[0.03] -z-10" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30c10 0 10-10 20-10s10 10 20 10 10-10 20-10 10 10 20 10v10H0z' fill='%239333ea' fill-opacity='1'/%3E%3C/svg%3E")`,
             backgroundSize: '60px 60px'
           }} 
      />

      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Section 1: Customers */}
        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Pricing Model — Customers
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {customerPlans.map((plan, index) => (
              <Card
                key={plan.name}
                className="p-10 bg-white/80 backdrop-blur-sm border-purple-100 shadow-[0_8px_30px_rgb(147,51,234,0.08)] hover:shadow-[0_12px_40px_rgb(147,51,234,0.15)] transition-all duration-500 rounded-3xl animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3 text-purple-900">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
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
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                        <Check className="w-4 h-4 text-purple-600" strokeWidth={3} />
                      </div>
                      <span className="text-foreground/80 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/get-started")}
                  className="w-full h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Pricing Model — Service Providers
            </h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card 
              className="p-12 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border-purple-100 shadow-[0_8px_30px_rgb(147,51,234,0.12)] rounded-3xl animate-fade-in"
              style={{ animationDelay: '450ms' }}
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 text-purple-900">Pro Plan</h3>
                <div className="mb-8">
                  <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    ZAR 149
                  </span>
                  <p className="text-lg text-muted-foreground mt-2">per month</p>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {providerFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                      <Check className="w-4 h-4 text-purple-600" strokeWidth={3} />
                    </div>
                    <span className="text-foreground/80 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white/60 rounded-2xl p-6 mb-8">
                <p className="text-center text-sm font-medium text-purple-900 mb-3">
                  Extended Payment Options
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-purple-600">6 MONTHS</p>
                    <p className="text-muted-foreground">R800</p>
                  </div>
                  <div className="w-px bg-purple-200" />
                  <div className="text-center">
                    <p className="font-bold text-purple-600">12 MONTHS</p>
                    <p className="text-muted-foreground">R1200</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/get-started")}
                className="w-full h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Get Started
              </Button>
            </Card>
          </div>
        </section>

        {/* Watermark Logo */}
        <div className="fixed bottom-8 right-8 opacity-5 pointer-events-none">
          <img src="/src/assets/logo.png" alt="" className="w-24 h-24" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
