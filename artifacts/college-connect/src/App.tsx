import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
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
import Match from "@/pages/match";

const queryClient = new QueryClient();

/** Redirect to /dashboard if the user doesn't have the required role */
function RoleGuard({ allow, children }: { allow: UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      {/* App pages */}
      <Route path="/dashboard">
        <SidebarLayout><Dashboard /></SidebarLayout>
      </Route>
      <Route path="/study">
        <SidebarLayout><Study /></SidebarLayout>
      </Route>
      <Route path="/marketplace">
        <SidebarLayout><Marketplace /></SidebarLayout>
      </Route>
      <Route path="/community">
        <SidebarLayout><Community /></SidebarLayout>
      </Route>
      <Route path="/career">
        <SidebarLayout><Career /></SidebarLayout>
      </Route>
      <Route path="/clubs">
        <SidebarLayout><Clubs /></SidebarLayout>
      </Route>
      <Route path="/profile">
        <SidebarLayout><Profile /></SidebarLayout>
      </Route>
      <Route path="/admin">
        <SidebarLayout><Admin /></SidebarLayout>
      </Route>
      <Route path="/moderator">
        <SidebarLayout><Moderator /></SidebarLayout>
      </Route>
      <Route path="/match">
        <SidebarLayout><Match /></SidebarLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
