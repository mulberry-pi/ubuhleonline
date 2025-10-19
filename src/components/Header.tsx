import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
        <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ubuhle
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("technology")}
            className="text-foreground/80 hover:text-primary transition-colors font-medium"
          >
            Style Previewing
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="text-foreground/80 hover:text-primary transition-colors font-medium"
          >
            Service Providers
          </button>
          <button
            onClick={() => scrollToSection("technology")}
            className="text-foreground/80 hover:text-primary transition-colors font-medium"
          >
            Find Stylist
          </button>
          <Button
            onClick={() => scrollToSection("hero")}
            className="bg-primary hover:bg-primary/90 text-white px-6 hover-glow"
          >
            Get Started
          </Button>
        </nav>

        <Button
          onClick={() => scrollToSection("hero")}
          className="md:hidden bg-primary hover:bg-primary/90 text-white hover-glow"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
};

export default Header;
