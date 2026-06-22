/**
 * SidebarLayout — wraps all authenticated pages.
 * Sidebar items are filtered by the logged-in user's role:
 *   student   → core pages only
 *   low_admin → core pages + Moderator link
 *   admin     → everything including Admin Dashboard + Moderator
 */
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BookOpen, ShoppingBag, Users,
  Briefcase, Tent, User, Settings, ShieldCheck,
  LogOut, Bell, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/* ─── Nav items per role ─────────────────────────────────── */
const STUDENT_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Study Hub", href: "/study", icon: BookOpen },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Community", href: "/community", icon: Users },
  { label: "Career", href: "/career", icon: Briefcase },
  { label: "Clubs", href: "/clubs", icon: Tent },
  { label: "Profile", href: "/profile", icon: User },
];

const LOW_ADMIN_EXTRA = [
  { label: "Moderator", href: "/moderator", icon: ShieldCheck },
];

const HIGH_ADMIN_EXTRA = [
  { label: "Admin Dashboard", href: "/admin", icon: Settings },
  { label: "Moderator", href: "/moderator", icon: ShieldCheck },
];

const ROLE_BADGE_STYLE: Record<string, string> = {
  student: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  low_admin: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  admin: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const role = user?.role ?? "student";

  // Build nav list based on role
  const navItems = [
    ...STUDENT_NAV,
    ...(role === "low_admin" ? LOW_ADMIN_EXTRA : []),
    ...(role === "admin" ? HIGH_ADMIN_EXTRA : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">

        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border/50">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">C</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">CollegeConnect</h1>
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider mt-0.5">Campus Super App</p>
              </div>
            </div>
          </Link>
        </div>

        {/* User card */}
        {user && (
          <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/5 flex items-center gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <Badge className={cn("text-[10px] px-1.5 py-0 border mt-0.5", ROLE_BADGE_STYLE[role])}>
                {user.badge}
              </Badge>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                    isActive
                      ? "bg-sidebar-accent text-white shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-blue-400" : "")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-sidebar-border/50 space-y-2">
          {/* Notifications shortcut */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/40 cursor-pointer transition-all">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Notifications</span>
            <span className="ml-auto text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-bold">3</span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
