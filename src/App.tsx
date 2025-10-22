import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import StylePreview from "./pages/StylePreview";
import Booking from "./pages/Booking";
import GetStarted from "./pages/GetStarted";
import ClientSignup from "./pages/ClientSignup";
import ProviderSignup from "./pages/ProviderSignup";
import ServiceProviders from "./pages/ServiceProviders";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProviderDashboardLayout from "./pages/provider/ProviderDashboardLayout";
import Dashboard from "./pages/provider/Dashboard";
import Appointments from "./pages/provider/Appointments";
import Clients from "./pages/provider/Clients";
import Services from "./pages/provider/Services";
import Analytics from "./pages/provider/Analytics";
import MarketTrends from "./pages/provider/MarketTrends";
import Messages from "./pages/provider/Messages";
import Settings from "./pages/provider/Settings";
import ClientDashboardLayout from "./pages/client/ClientDashboardLayout";
import ClientDashboard from "./pages/client/ClientDashboard";
import NewBooking from "./pages/client/NewBooking";
import ClientAppointments from "./pages/client/ClientAppointments";
import StyleGallery from "./pages/client/StyleGallery";
import ClientMessages from "./pages/client/ClientMessages";
import ClientSettings from "./pages/client/ClientSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/style-preview" element={<StylePreview />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/signup/client" element={<ClientSignup />} />
          <Route path="/signup/provider" element={<ProviderSignup />} />
          <Route path="/service-providers" element={<ServiceProviders />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Provider Dashboard Routes */}
          <Route path="/provider" element={<ProviderDashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="clients" element={<Clients />} />
            <Route path="services" element={<Services />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="trends" element={<MarketTrends />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Client Dashboard Routes */}
          <Route path="/client" element={<ClientDashboardLayout />}>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="new-booking" element={<NewBooking />} />
            <Route path="appointments" element={<ClientAppointments />} />
            <Route path="gallery" element={<StyleGallery />} />
            <Route path="messages" element={<ClientMessages />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
