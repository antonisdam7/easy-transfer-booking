import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import { transferRoutes } from "./lib/transferRoutes";

// The landing page is imported directly: it is what most visitors ask for first, and
// waiting on a second request to draw it would only slow the common case down.
//
// So are the content pages below, and that is a change from how this file used to read.
// They were lazy, which was the right call while the body arrived from React and nothing
// else. Now these pages are rendered into their HTML at build time, and the browser
// hydrates what it was handed rather than building it. A lazy route cannot be hydrated:
// React reaches the Suspense boundary, finds the chunk missing, throws away the server's
// markup and draws the fallback -- so the reader watches a finished page blank itself out
// to load the code that draws the same page again. Importing them directly costs a few
// kilobytes on first load and buys that back on every one of these pages.
//
// Still lazy, because they are genuinely heavy and never prerendered: the booking flow
// carries the map and the Google loader, and the admin screens carry the Supabase session
// code -- none of which a visitor reading the FAQs has any use for.
import About from "./pages/About";
import Crete from "./pages/Crete";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import CreteTransfers from "./pages/CreteTransfers";
import HeraklionAirportTransfer from "./pages/HeraklionAirportTransfer";
import ChaniaAirportTransfer from "./pages/ChaniaAirportTransfer";
import PrivateTaxiCrete from "./pages/PrivateTaxiCrete";
import TransferRoute from "./pages/TransferRoute";

const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminTransfers = lazy(() => import("./pages/AdminTransfers"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const BookingResults = lazy(() => import("./pages/BookingResults"));

// Deliberately blank, and tall enough to hold the header still while a page arrives.
// A spinner that flashes for 80ms reads as a fault; empty space does not.
const PageFallback = () => <div className="min-h-[60vh]" />;

// The route tree on its own, with no router around it.
//
// Two things mount it: the browser, through BrowserRouter below, and the build, through
// StaticRouter in entry-server.tsx. They have to be the same tree or the markup written
// into the file would not match the markup the browser then hydrates.
export const AppRoutes = () => (
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
        {/* Registered from the same list that writes their heads and prerenders them,
            so a route can never exist in the sitemap without existing here. Without a
            catch-all rewrite in front of the site, that gap would be a live 404. */}
        {transferRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<TransferRoute path={route.path} />} />
        ))}
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
);

// The shell used to mount a QueryClientProvider, a TooltipProvider and a second
// Toaster. Nothing ever called a query, drew a tooltip, or raised a toast through
// that Toaster -- every message on the site comes from sonner. They were scaffolding,
// and each one was paid for on the first page view.
//
// Sonner stays outside AppRoutes: it draws nothing until something raises a toast, and
// during the build there is nobody to raise one.
const App = () => (
  <>
    <Sonner />
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </>
);

export default App;
