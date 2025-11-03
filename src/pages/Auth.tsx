import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/, { message: "Password must contain at least one special character (!@#$%^&*()_+-=[]{})" }),
  fullName: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }).optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState<"client" | "provider">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      const emailValidation = z.string().email().safeParse(email);
      if (!emailValidation.success) {
        toast.error("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset link sent! Check your email.");
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationData = isLogin 
        ? { email, password }
        : { email, password, fullName };
      
      const result = authSchema.safeParse(validationData);
      
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Get user role and redirect accordingly
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          
          const redirectPath = userRole?.role === "provider" 
            ? "/provider/dashboard" 
            : "/client/dashboard";
          
          toast.success("Welcome back!");
          navigate(redirectPath);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/${role}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        if (data.user && data.session) {
          // Call secure edge function to assign role (uses service role key)
          const { error: roleError } = await supabase.functions.invoke('assign-user-role', {
            body: { role, full_name: fullName }
          });

          if (roleError) {
            console.error('Role assignment error:', roleError);
            toast.error('Failed to assign role. Please contact support.');
            return;
          }
        }

        toast.success("Account created! Redirecting...");
        navigate(`/${role}/dashboard`);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C9B3F6] to-[#F7F2EE] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={logo} 
            alt="Ubuhle" 
            className="h-12 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          />
          <CardTitle className="text-2xl">
            {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? "Enter your email to receive a password reset link" 
              : isLogin ? "Sign in to access your dashboard" : "Join Ubuhle platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "client" | "provider")}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="client">Client</option>
                    <option value="provider">Service Provider</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
          )}
          <div className="mt-4 space-y-2">
            {isLogin && !isForgotPassword && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {!isForgotPassword && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
