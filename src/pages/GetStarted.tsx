import { useNavigate } from "react-router-dom";
import { Users, Scissors } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C9B3F6] to-[#F7F2EE] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <img 
            src={logo} 
            alt="Ubuhle" 
            className="h-12 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          />
          <h1 className="text-3xl font-semibold leading-none tracking-tight">Join Ubuhle</h1>
          <CardDescription>
            Choose your account type to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Card */}
          <button
            onClick={() => navigate("/signup/client")}
            className="w-full bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-6 hover:scale-[1.02] hover:shadow-lg hover:border-primary/40 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Client</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  I'm looking for stylists, artists, and beauty experts to help me achieve my desired look.
                </p>
                <div className="text-primary font-medium group-hover:translate-x-1 transition-transform duration-300 text-sm">
                  Continue as Client →
                </div>
              </div>
            </div>
          </button>

          {/* Service Provider Card */}
          <button
            onClick={() => navigate("/signup/provider")}
            className="w-full bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20 rounded-2xl p-6 hover:scale-[1.02] hover:shadow-lg hover:border-accent/40 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Scissors className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Service Provider</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  I'm a beauty professional or salon owner looking to grow my business and connect with clients.
                </p>
                <div className="text-primary font-medium group-hover:translate-x-1 transition-transform duration-300 text-sm">
                  Continue as Service Provider →
                </div>
              </div>
            </div>
          </button>

          <div className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStarted;
