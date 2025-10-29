import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ClientSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredServices: "",
    receiveUpdates: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/client/dashboard`,
          data: { full_name: formData.fullName },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Call edge function to create profile and assign role
        const { error: roleError } = await supabase.functions.invoke('assign-user-role', {
          body: { role: 'client', full_name: formData.fullName }
        });

        if (roleError) {
          console.error('Role assignment error:', roleError);
          toast({
            title: "Account created with issues",
            description: "Please contact support if you experience problems.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Welcome to Ubuhle 🌸",
        description: "Your personalized style journey starts here.",
      });
      navigate("/client/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Let's find your perfect beauty match.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create your Ubuhle account to preview styles, book appointments, and connect with trusted professionals.
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto bg-card rounded-3xl shadow-xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Preferred Services */}
            <div className="space-y-2">
              <Label htmlFor="services">Preferred Services</Label>
              <Select value={formData.preferredServices} onValueChange={(value) => setFormData({ ...formData, preferredServices: value })}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your preferred service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hair">Hair</SelectItem>
                  <SelectItem value="nails">Nails</SelectItem>
                  <SelectItem value="makeup">Makeup</SelectItem>
                  <SelectItem value="lashes">Lashes</SelectItem>
                  <SelectItem value="skincare">Skincare</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Receive Updates Toggle */}
            <div className="flex items-center justify-between p-4 bg-accent/5 rounded-xl">
              <Label htmlFor="updates" className="cursor-pointer">
                Would you like to receive updates or promotions?
              </Label>
              <Switch
                id="updates"
                checked={formData.receiveUpdates}
                onCheckedChange={(checked) => setFormData({ ...formData, receiveUpdates: checked })}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {isLoading ? "Creating Your Account..." : "Create My Account"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Log in here.
              </button>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientSignup;
