import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/features/misc/NotFoundPage";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { AuthProvider, useAuth, type UserRole } from "@/contexts/AuthContext";
import { SubmissionsProvider } from "@/contexts/SubmissionsContext";
import { ProfileCompleteModal } from "@/components/shared/ProfileCompleteModal";

// Feature pages — one folder per website feature (see AIread.md for the full map)
import Home from "@/features/home/HomePage";
import Login from "@/features/auth/LoginPage";
import Signup from "@/features/auth/SignupPage";
import Notifications from "@/features/notifications/NotificationsPage";
import Study from "@/features/study/StudyPage";
import Marketplace from "@/features/marketplace/MarketplacePage";
import Community from "@/features/community/CommunityPage";
import Career from "@/features/career/CareerPage";
import Clubs from "@/features/clubs/ClubsPage";
import Profile from "@/features/profile/ProfilePage";
import Admin from "@/features/admin/AdminPage";
import Moderator from "@/features/moderator/ModeratorPage";
import Match from "@/features/match/MatchPage";

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
      <Route path="/signup" component={Signup} />

      {/* App pages */}
      <Route path="/notifications">
        <SidebarLayout><Notifications /></SidebarLayout>
      </Route>
      <Route path="/dashboard">
        <Redirect to="/notifications" />
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
        <SubmissionsProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <ProfileCompleteModal />
            <Toaster />
          </TooltipProvider>
        </SubmissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
