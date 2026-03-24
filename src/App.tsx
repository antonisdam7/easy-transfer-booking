import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Crete from "./pages/Crete";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminTransfers from "./pages/AdminTransfers";
import ProtectedRoute from "./components/ProtectedRoute";
import CreteTransfers from "./pages/CreteTransfers";
import HeraklionAirportTransfer from "./pages/HeraklionAirportTransfer";
import ChaniaAirportTransfer from "./pages/ChaniaAirportTransfer";
import PrivateTaxiCrete from "./pages/PrivateTaxiCrete";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/crete" element={<Crete />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/crete-transfers" element={<CreteTransfers />} />
            <Route path="/heraklion-airport-transfer" element={<HeraklionAirportTransfer />} />
            <Route path="/chania-airport-transfer" element={<ChaniaAirportTransfer />} />
            <Route path="/private-taxi-crete" element={<PrivateTaxiCrete />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminTransfers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
