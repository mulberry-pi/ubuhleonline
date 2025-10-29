import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image-new.png";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/style-preview');
    } else {
      navigate('/get-started');
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center pt-20 pb-0">
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-0 items-center">
          <div className="relative fade-in-up h-full">
            <img
              src={heroImage}
              alt="Professional beauty consultant"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6 fade-in-up animation-delay-200 px-6 lg:px-12 py-12">
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
              onClick={handleGetStarted}
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
