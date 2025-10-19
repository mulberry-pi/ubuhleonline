import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import { Sparkles, Shield, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center pt-20 pb-12 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in-up">
            <h1
              className="text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Connecting you to the right people,{" "}
              <span className="text-primary">faster.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Using your style preview to instantly match you with trusted providers tailored to
              your needs.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 hover-glow">
              Get Started
            </Button>
          </div>

          <div className="relative fade-in-up animation-delay-200">
            <img
              src={heroImage}
              alt="Professional beauty consultant"
              className="rounded-3xl shadow-2xl w-full object-cover"
            />

            {/* Floating Callouts */}
            <div className="absolute top-8 -left-4 bg-white rounded-2xl shadow-lg p-4 float-animation">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Style Preview</p>
                  <p className="text-xs text-muted-foreground">Generated</p>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-4 bg-white rounded-2xl shadow-lg p-4 float-animation animation-delay-400">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Secure Booking</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/4 bg-white rounded-2xl shadow-lg p-4 float-animation animation-delay-600">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Best Provider</p>
                  <p className="text-xs text-muted-foreground">For You</p>
                </div>
              </div>
            </div>

            {/* Tech Background Elements */}
            <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
