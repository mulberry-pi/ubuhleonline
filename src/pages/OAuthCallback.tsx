import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function OAuthCallback() {
  const [needsRole, setNeedsRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"client" | "provider">("client");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has a role
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (userRole) {
        // User has role, redirect to dashboard
        const redirectPath = userRole.role === "provider" 
          ? "/provider/dashboard" 
          : "/client/dashboard";
        navigate(redirectPath);
      } else {
        // User needs to select a role
        setNeedsRole(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setNeedsRole(true);
      setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Authentication required");
        navigate("/auth");
        return;
      }

      // Call edge function to assign role
      const { error: roleError } = await supabase.functions.invoke('assign-user-role', {
        body: { 
          role: selectedRole, 
          full_name: user.user_metadata.full_name || user.user_metadata.name,
          terms_accepted: true 
        }
      });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        toast.error('Failed to assign role. Please try again.');
        setLoading(false);
        return;
      }

      toast.success("Account setup complete!");
      const redirectPath = selectedRole === "provider" 
        ? "/provider/dashboard" 
        : "/client/dashboard";
      navigate(redirectPath);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C9B3F6] to-[#F7F2EE]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Setting up your account...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C9B3F6] to-[#F7F2EE] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src={logo} 
              alt="Ubuhle" 
              className="h-12 mx-auto mb-4" 
            />
            <CardTitle className="text-2xl">Complete Your Setup</CardTitle>
            <CardDescription>
              Just one more step! Tell us how you'd like to use Ubuhle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedRole === "client" ? "default" : "outline"}
                  onClick={() => setSelectedRole("client")}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-lg mb-1">👤</span>
                  <span>Client</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "provider" ? "default" : "outline"}
                  onClick={() => setSelectedRole("provider")}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-lg mb-1">✂️</span>
                  <span>Provider</span>
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleRoleSelection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Setting up..." : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
