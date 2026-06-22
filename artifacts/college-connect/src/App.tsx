import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { AuthProvider, useAuth, type UserRole } from "@/contexts/AuthContext";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Study from "@/pages/study";
import Marketplace from "@/pages/marketplace";
import Community from "@/pages/community";
import Career from "@/pages/career";
import Clubs from "@/pages/clubs";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Moderator from "@/pages/moderator";

const queryClient = new QueryClient();

/* ─────────────────────────────────────────────────────────
   ProtectedRoute — redirects to /login if not authenticated.
   Optionally restricts to specific roles.
───────────────────────────────────────────────────────── */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If a role restriction is set and user doesn't qualify, redirect to their home
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Redirect to="/admin" />;
    if (user.role === "low_admin") return <Redirect to="/moderator" />;
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

/* ─────────────────────────────────────────────────────────
   PublicOnlyRoute — if already logged in, go home.
   Used for /login and / (home) when authenticated.
───────────────────────────────────────────────────────── */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === "admin") return <Redirect to="/admin" />;
    if (user.role === "low_admin") return <Redirect to="/moderator" />;
    return <Redirect to="/dashboard" />;
  }
  return <>{children}</>;
}

/* ─────────────────────────────────────────────────────────
   Router — all app routes
───────────────────────────────────────────────────────── */
function Router() {
  return (
    <Switch>
      {/* Public — home landing page */}
      <Route path="/">
        <PublicOnlyRoute><Home /></PublicOnlyRoute>
      </Route>

      {/* Public — login (redirects away if already logged in) */}
      <Route path="/login">
        <PublicOnlyRoute><Login /></PublicOnlyRoute>
      </Route>

      {/* Student + admin: core pages */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <SidebarLayout><Dashboard /></SidebarLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study">
        <ProtectedRoute>
          <SidebarLayout><Study /></SidebarLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketplace">
        <ProtectedRoute>
          <SidebarLayout><Marketplace /></SidebarLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/community">
        <ProtectedRoute>
          <SidebarLayout><Community /></SidebarLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/career">
        <ProtectedRoute>
          <SidebarLayout><Career /></SidebarLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/clubs">
        <ProtectedRoute>
          <SidebarLayout><Clubs /></SidebarLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <SidebarLayout><Profile /></SidebarLayout>
        </ProtectedRoute>
      </Route>

      {/* Low admin + admin: moderator tools */}
      <Route path="/moderator">
        <ProtectedRoute allowedRoles={["low_admin", "admin"]}>
          <SidebarLayout><Moderator /></SidebarLayout>
        </ProtectedRoute>
      </Route>

      {/* Admin only: global health dashboard */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin"]}>
          <SidebarLayout><Admin /></SidebarLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

/* ─────────────────────────────────────────────────────────
   App — providers wrapper
───────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
