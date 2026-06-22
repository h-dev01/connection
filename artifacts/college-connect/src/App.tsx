import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

// Pages
import Home from "@/pages/home";
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

function Router() {
  return (
    <Switch>
      {/* Landing home page */}
      <Route path="/" component={Home} />

      {/* App pages — no login required */}
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

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
