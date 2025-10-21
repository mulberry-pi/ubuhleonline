import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image-new.png";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="min-h-screen flex items-center pt-20 pb-12 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative fade-in-up">
            <img
              src={heroImage}
              alt="Professional beauty consultant"
              className="rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>

          <div className="space-y-6 fade-in-up animation-delay-200">
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
            <Button 
              size="lg" 
              className="bg-white text-black border border-black hover:bg-white/90 px-8"
              style={{ 
                width: '174px', 
                height: '48px', 
                borderRadius: '50px',
                borderWidth: '1px'
              }}
              onClick={() => navigate('/search')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" style={{ color: '#5345BA' }} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
