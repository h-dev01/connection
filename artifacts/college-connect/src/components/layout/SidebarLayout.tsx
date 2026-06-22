/**
 * SidebarLayout — wraps all authenticated pages.
 * Nav items are filtered by the user's role:
 *   student   → main nav only (no admin section)
 *   low_admin → main nav + Moderator only
 *   admin     → main nav + both Admin Dashboard & Moderator
 */
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BookOpen, ShoppingBag, Users,
  Briefcase, Tent, User, Settings, ShieldCheck,
  Bell, Heart, LogOut, GraduationCap, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Study Hub",    href: "/study",       icon: BookOpen },
  { label: "Marketplace",  href: "/marketplace", icon: ShoppingBag },
  { label: "Community",    href: "/community",   icon: Users },
  { label: "Campus Match", href: "/match",       icon: Heart, badge: "New" },
  { label: "Career",       href: "/career",      icon: Briefcase },
  { label: "Clubs",        href: "/clubs",       icon: Tent },
  { label: "Profile",      href: "/profile",     icon: User },
];

// Each item declares the minimum role required to see it
const ADMIN_ITEMS = [
  { label: "Moderator Panel",  href: "/moderator", icon: ShieldCheck, roles: ["low_admin", "admin"] },
  { label: "Admin Dashboard",  href: "/admin",      icon: Settings,    roles: ["admin"] },
];

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  student:   { label: "Student",    icon: GraduationCap, color: "text-blue-400",    bg: "bg-blue-500/20" },
  low_admin: { label: "Moderator",  icon: ShieldCheck,   color: "text-emerald-400", bg: "bg-emerald-500/20" },
  admin:     { label: "High Admin", icon: ShieldAlert,   color: "text-violet-400",  bg: "bg-violet-500/20" },
};

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const role = user?.role ?? "student";
  const roleMeta = ROLE_META[role];
  const RoleIcon = roleMeta.icon;

  // Filter admin items by role
  const visibleAdminItems = ADMIN_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">

        {/* Logo */}
        <Link href="/">
          <div className="px-5 py-4 border-b border-sidebar-border/50 flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">CollegeConnect</h1>
              <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider mt-0.5">Campus Super App</p>
            </div>
          </div>
        </Link>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-white"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-blue-400" : item.href === "/match" ? "text-rose-400" : ""
                  )} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="ml-auto text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </div>
              </Link>
            );
          })}

          {/* Admin section — only shown to admins/moderators */}
          {visibleAdminItems.length > 0 && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest">
                  {role === "admin" ? "Admin Controls" : "Moderator"}
                </p>
              </div>

              {visibleAdminItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-white"
                    )}>
                      <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-blue-400")} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom — user info + logout */}
        <div className="p-3 border-t border-sidebar-border/50 space-y-1">
          {/* Notifications */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/40 cursor-pointer transition-all">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Notifications</span>
            <span className="ml-auto text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">3</span>
          </div>

          {/* User identity chip */}
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", roleMeta.bg)}>
                <RoleIcon className={cn("h-3.5 w-3.5", roleMeta.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className={cn("text-[10px] font-medium", roleMeta.color)}>{roleMeta.label}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="text-sidebar-foreground/40 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
