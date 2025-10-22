import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  preview_image_url: string | null;
  profiles: {
    full_name: string | null;
  };
  services: {
    name: string;
  };
}

interface Recommendation {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export default function ClientDashboard() {
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userName, setUserName] = useState("Client");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // Get next upcoming appointment
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          preview_image_url,
          profiles!appointments_provider_id_fkey(full_name),
          services(name)
        `)
        .eq("client_id", user.id)
        .gte("appointment_date", new Date().toISOString().split('T')[0])
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
        .limit(1);

      if (appointments && appointments.length > 0) {
        setUpcomingAppointment(appointments[0]);
      }

      // Get trending styles as recommendations
      const { data: trends } = await supabase
        .from("trends")
        .select("id, name, description, image_url")
        .order("popularity_score", { ascending: false })
        .limit(3);

      setRecommendations(trends || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Hi {userName}, ready for your next glow-up? ✨</h2>
        <p className="text-muted-foreground mt-2">
          Explore styles, book appointments, and connect with beauty professionals
        </p>
      </div>

      {/* Upcoming Appointment */}
      {upcomingAppointment && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Next Appointment</CardTitle>
            <CardDescription>Your upcoming beauty session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {upcomingAppointment.preview_image_url && (
                <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={upcomingAppointment.preview_image_url}
                    alt="Style preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{upcomingAppointment.services.name}</h3>
                  <p className="text-muted-foreground">
                    with {upcomingAppointment.profiles.full_name || "Provider"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(upcomingAppointment.appointment_date).toLocaleDateString()} at{" "}
                  {upcomingAppointment.appointment_time}
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  upcomingAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  upcomingAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {upcomingAppointment.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/client/new-booking")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">New Booking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Try a new style with AI preview and book instantly
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/client/appointments")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">My Appointments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage your booking schedule
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/client/gallery")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Style Gallery</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse your past looks and favorites
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Styles You Might Love</CardTitle>
              <CardDescription>Based on trending beauty looks</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Recommendations will appear here based on your preferences
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="group cursor-pointer">
                  {rec.image_url && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                      <img
                        src={rec.image_url}
                        alt={rec.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <h4 className="font-medium">{rec.name}</h4>
                  {rec.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {rec.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Everything you need to know</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Try AI Style Preview</p>
              <p className="text-sm text-muted-foreground">
                Upload your photo and see how different styles look on you before booking
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Book with Confidence</p>
              <p className="text-sm text-muted-foreground">
                Choose from verified professionals and see their ratings and portfolio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
