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
import NotFound from "./pages/NotFound";

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
