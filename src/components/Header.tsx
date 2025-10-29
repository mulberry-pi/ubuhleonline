import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRole = async (userId: string) => {
    try {
      // Load role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      
      if (roleData) {
        setUserRole(roleData.role);
      }

      // Load profile to get name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      
      if (profile?.full_name) {
        const firstName = profile.full_name.split(' ')[0];
        setUserName(firstName);
      } else {
        setUserName("User");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleUserClick = async () => {
    if (!user) {
      navigate("/get-started");
      return;
    }

    // If role is already loaded, navigate immediately
    if (userRole) {
      const dashboardPath = userRole === "provider" 
        ? "/provider/dashboard" 
        : "/client/dashboard";
      navigate(dashboardPath);
      return;
    }

    // Otherwise, load the role first
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      const role = roleData?.role || "client";
      const dashboardPath = role === "provider" 
        ? "/provider/dashboard" 
        : "/client/dashboard";
      navigate(dashboardPath);
    } catch (error) {
      console.error("Error loading user role:", error);
      navigate("/client/dashboard"); // Default to client dashboard
    }
  };

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
            onClick={handleUserClick}
            className="bg-primary hover:bg-primary/90 text-white px-6 hover-glow"
          >
            {user ? `Hi, ${userName || 'User'}` : 'Get Started'}
          </Button>
        </nav>

        <Button
          onClick={handleUserClick}
          className="md:hidden bg-primary hover:bg-primary/90 text-white hover-glow"
        >
          {user ? `Hi, ${userName || 'User'}` : 'Get Started'}
        </Button>
      </div>
    </header>
  );
};

export default Header;
