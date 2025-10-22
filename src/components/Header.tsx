import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <img 
          src={logo} 
          alt="Ubuhle" 
          className="h-10 cursor-pointer" 
          onClick={() => navigate("/")}
        />

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate("/style-preview")}
            className="text-foreground/80 hover:text-primary transition-colors font-medium"
          >
            Style Previewing
          </button>
          <button
            onClick={() => navigate("/service-providers")}
            className="text-foreground/80 hover:text-primary transition-colors font-medium"
          >
            Service Providers
          </button>
          <button
            onClick={() => navigate("/search")}
            className="text-foreground/80 hover:text-primary transition-colors font-medium"
          >
            Find Stylist
          </button>
          <Button
            onClick={() => navigate("/get-started")}
            className="bg-primary hover:bg-primary/90 text-white px-6 hover-glow"
          >
            Get Started
          </Button>
        </nav>

        <Button
          onClick={() => navigate("/get-started")}
          className="md:hidden bg-primary hover:bg-primary/90 text-white hover-glow"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
};

export default Header;
