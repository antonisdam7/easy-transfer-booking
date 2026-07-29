import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";

// The landing page is imported directly: it is what most visitors ask for first, and
// waiting on a second request to draw it would only slow the common case down.
//
// Everything else is fetched when someone actually routes to it. The booking flow
// carries the map and the Google loader, and the admin screens carry the Supabase
// session code -- none of which a visitor reading the FAQs has any use for.
const About = lazy(() => import("./pages/About"));
const Crete = lazy(() => import("./pages/Crete"));
const Contact = lazy(() => import("./pages/Contact"));
const Faqs = lazy(() => import("./pages/Faqs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminTransfers = lazy(() => import("./pages/AdminTransfers"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const CreteTransfers = lazy(() => import("./pages/CreteTransfers"));
const HeraklionAirportTransfer = lazy(() => import("./pages/HeraklionAirportTransfer"));
const ChaniaAirportTransfer = lazy(() => import("./pages/ChaniaAirportTransfer"));
const PrivateTaxiCrete = lazy(() => import("./pages/PrivateTaxiCrete"));
const BookingResults = lazy(() => import("./pages/BookingResults"));

// Deliberately blank, and tall enough to hold the header still while a page arrives.
// A spinner that flashes for 80ms reads as a fault; empty space does not.
const PageFallback = () => <div className="min-h-[60vh]" />;

// The shell used to mount a QueryClientProvider, a TooltipProvider and a second
// Toaster. Nothing ever called a query, drew a tooltip, or raised a toast through
// that Toaster -- every message on the site comes from sonner. They were scaffolding,
// and each one was paid for on the first page view.
const App = () => (
  <>
    <Sonner />
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
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
            <Route path="/booking-results" element={<BookingResults />} />
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
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
