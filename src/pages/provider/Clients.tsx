import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Client {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  appointment_count: number;
  last_appointment: string | null;
}

interface ClientDetails extends Client {
  appointments: Array<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    services: {
      name: string;
    };
  }>;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          client_id,
          appointment_date,
          profiles!appointments_client_id_fkey(id, email, full_name, phone)
        `)
        .eq("provider_id", user.id);

      if (error) throw error;

      // Group by client and count appointments
      const clientMap = new Map<string, Client>();
      
      appointments?.forEach((apt: any) => {
        const clientId = apt.profiles.id;
        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            id: clientId,
            email: apt.profiles.email,
            full_name: apt.profiles.full_name,
            phone: apt.profiles.phone,
            appointment_count: 0,
            last_appointment: apt.appointment_date,
          });
        }
        const client = clientMap.get(clientId)!;
        client.appointment_count += 1;
        
        if (apt.appointment_date > (client.last_appointment || "")) {
          client.last_appointment = apt.appointment_date;
        }
      });

      // Filter to only show clients with 2 or more appointments
      const qualifiedClients = Array.from(clientMap.values()).filter(
        client => client.appointment_count >= 2
      );

      setClients(qualifiedClients);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientId)
        .single();

      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          services(name)
        `)
        .eq("provider_id", user.id)
        .eq("client_id", clientId)
        .order("appointment_date", { ascending: false });

      if (profile && appointments) {
        setSelectedClient({
          ...profile,
          appointment_count: appointments.length,
          last_appointment: appointments[0]?.appointment_date || null,
          appointments: appointments,
        });
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error loading client details:", error);
      toast.error("Failed to load client details");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Clients</h2>
        <p className="text-muted-foreground mt-2">
          Clients who have booked with you at least twice
        </p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No repeat clients yet. Clients will appear here after booking at least twice.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadClientDetails(client.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {(client.full_name || client.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {client.full_name || "Client"}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {client.appointment_count} appointment{client.appointment_count !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
                {client.last_appointment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Last visit: {new Date(client.last_appointment).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              View booking history and contact information
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {(selectedClient.full_name || selectedClient.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedClient.full_name || "Client"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedClient.email}
                    </p>
                  </div>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {selectedClient.phone}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Booking History</h4>
                <div className="space-y-2">
                  {selectedClient.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{apt.services.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.appointment_date).toLocaleDateString()} at{" "}
                          {apt.appointment_time}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
