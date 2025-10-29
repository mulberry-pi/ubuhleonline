import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardStats {
  upcomingAppointments: number;
  totalClients: number;
  monthlyRevenue: number;
  activeServices: number;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
  services: {
    name: string;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    activeServices: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Provider");
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

      // Get upcoming appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          profiles!appointments_client_id_fkey(full_name, email),
          services(name)
        `)
        .eq("provider_id", user.id)
        .gte("appointment_date", new Date().toISOString().split('T')[0])
        .order("appointment_date", { ascending: true })
        .limit(3);

      if (appointmentsError) throw appointmentsError;

      setUpcomingAppointments(appointments || []);

      // Get stats
      const { count: appointmentsCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", user.id)
        .gte("appointment_date", new Date().toISOString().split('T')[0]);

      const { count: clientsCount } = await supabase
        .from("appointments")
        .select("client_id", { count: "exact", head: true })
        .eq("provider_id", user.id);

      const { count: servicesCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", user.id)
        .eq("is_available", true);

      setStats({
        upcomingAppointments: appointmentsCount || 0,
        totalClients: clientsCount || 0,
        monthlyRevenue: 0, // Would calculate from completed appointments
        activeServices: servicesCount || 0,
      });
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}</h2>
        <p className="text-muted-foreground">
          Keep it up and improve your performance!
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">Appointments</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Clients</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly</CardTitle>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">R{stats.monthlyRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">{stats.activeServices}</div>
            <p className="text-xs text-muted-foreground">Services</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments - Takes 2 columns */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/provider/appointments")}>
                See More →
              </Button>
            </div>
            <CardDescription>Your next 3 scheduled bookings</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {apt.profiles.full_name?.charAt(0) || apt.profiles.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{apt.profiles.full_name || apt.profiles.email}</p>
                        <p className="text-xs text-muted-foreground">{apt.services.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(apt.appointment_date).toLocaleDateString()} • {apt.appointment_time}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Takes 1 column */}
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Button 
              onClick={() => navigate("/provider/services")} 
              className="w-full justify-start h-12 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-3" />
              Add Service
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/provider/clients")}
              className="w-full justify-start h-12 rounded-xl"
            >
              <Users className="h-4 w-4 mr-3" />
              View Clients
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/provider/trends")}
              className="w-full justify-start h-12 rounded-xl"
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              View Trends
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
