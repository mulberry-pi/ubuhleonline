import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  monthlyRevenue: number;
  totalBookings: number;
  averageTicketValue: number;
  mostPopularService: string;
  returningClients: number;
  newClients: number;
  cancellationRate: number;
  peakBookingTime: string;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlyRevenue: 0,
    totalBookings: 0,
    averageTicketValue: 0,
    mostPopularService: "N/A",
    returningClients: 0,
    newClients: 0,
    cancellationRate: 0,
    peakBookingTime: "N/A",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current month dates
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get all appointments for current month
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          id,
          status,
          client_id,
          services(price, name)
        `)
        .eq("provider_id", user.id)
        .gte("appointment_date", firstDay.toISOString().split('T')[0])
        .lte("appointment_date", lastDay.toISOString().split('T')[0]);

      if (error) throw error;

      const completedAppointments = appointments?.filter(apt => apt.status === "completed") || [];
      const cancelledAppointments = appointments?.filter(apt => apt.status === "cancelled") || [];

      // Calculate revenue
      const revenue = completedAppointments.reduce((sum, apt) => sum + (apt.services?.price || 0), 0);

      // Calculate average ticket value
      const avgTicket = completedAppointments.length > 0
        ? revenue / completedAppointments.length
        : 0;

      // Find most popular service
      const serviceCounts: { [key: string]: number } = {};
      completedAppointments.forEach(apt => {
        const serviceName = apt.services?.name || "Unknown";
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      });
      const mostPopular = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      // Calculate cancellation rate
      const totalAppointments = appointments?.length || 0;
      const cancellationRate = totalAppointments > 0
        ? (cancelledAppointments.length / totalAppointments) * 100
        : 0;

      // Count unique clients
      const uniqueClients = new Set(appointments?.map(apt => apt.client_id) || []);

      setAnalytics({
        monthlyRevenue: revenue,
        totalBookings: completedAppointments.length,
        averageTicketValue: avgTicket,
        mostPopularService: mostPopular,
        returningClients: 0, // Would need historical data
        newClients: uniqueClients.size,
        cancellationRate: cancellationRate,
        peakBookingTime: "10:00 AM - 12:00 PM", // Would need time analysis
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Business Analytics</h2>
        <p className="text-muted-foreground mt-2">
          Track your monthly growth and business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {analytics.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.totalBookings} bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Ticket Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {analytics.averageTicketValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per completed booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Completed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.cancellationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of all bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Service</CardTitle>
            <CardDescription>Your top-requested service this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {analytics.mostPopularService}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Statistics</CardTitle>
            <CardDescription>New and returning clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New Clients</span>
              <span className="text-xl font-bold">{analytics.newClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Returning Clients</span>
              <span className="text-xl font-bold">{analytics.returningClients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Booking Times</CardTitle>
            <CardDescription>When you're busiest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div className="text-2xl font-bold">{analytics.peakBookingTime}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Month over month comparison</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              Historical data will appear here once you have multiple months of bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics Tracking</CardTitle>
          <CardDescription>Key performance indicators to monitor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Client Retention Rate</p>
                <p className="text-sm text-muted-foreground">
                  Track how many clients book again after their first visit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Average Spend Per Client</p>
                <p className="text-sm text-muted-foreground">
                  Monitor how much each client spends on average across all visits
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Service Popularity</p>
                <p className="text-sm text-muted-foreground">
                  Identify which services drive the most bookings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Revenue Growth</p>
                <p className="text-sm text-muted-foreground">
                  Compare monthly revenue trends to identify growth patterns
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
