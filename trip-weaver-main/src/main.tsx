import "@vly-ai/integrations";
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { Seeder } from "@/components/Seeder";
import "./index.css";

// Lazy load route components
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const CreateTrip = lazy(() => import("./pages/CreateTrip.tsx"));
const MyTrips = lazy(() => import("./pages/MyTrips.tsx"));
const ItineraryBuilder = lazy(() => import("./pages/ItineraryBuilder.tsx"));
const CitySearch = lazy(() => import("./pages/CitySearch.tsx"));
const ActivitySearch = lazy(() => import("./pages/ActivitySearch.tsx"));
const BudgetPage = lazy(() => import("./pages/Budget.tsx"));
const CalendarPage = lazy(() => import("./pages/CalendarPage.tsx"));
const SharedTrips = lazy(() => import("./pages/SharedTrips.tsx"));
const PublicItinerary = lazy(() => import("./pages/PublicItinerary.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unknown error" };
  }
  componentDidCatch(err: Error) {
    console.error("[GlobeTrotter] Error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center">
            <p className="text-lg font-semibold">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-2">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <Seeder />
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/trips" element={<RequireAuth><MyTrips /></RequireAuth>} />
              <Route path="/trips/new" element={<RequireAuth><CreateTrip /></RequireAuth>} />
              <Route path="/trips/:id" element={<RequireAuth><ItineraryBuilder /></RequireAuth>} />
              <Route path="/explore" element={<RequireAuth><CitySearch /></RequireAuth>} />
              <Route path="/activities" element={<RequireAuth><ActivitySearch /></RequireAuth>} />
              <Route path="/budget" element={<RequireAuth><BudgetPage /></RequireAuth>} />
              <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
              <Route path="/shared" element={<RequireAuth><SharedTrips /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              {/* Public Routes */}
              <Route path="/public/:id" element={<PublicItinerary />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
