/**
 * SidebarLayout — wraps all authenticated pages.
 * No login required — all nav items are visible to everyone.
 */
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BookOpen, ShoppingBag, Users,
  Briefcase, Tent, User, Settings, ShieldCheck, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",  icon: LayoutDashboard },
  { label: "Study Hub",   href: "/study",       icon: BookOpen },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Community",   href: "/community",   icon: Users },
  { label: "Career",      href: "/career",      icon: Briefcase },
  { label: "Clubs",       href: "/clubs",       icon: Tent },
  { label: "Profile",     href: "/profile",     icon: User },
];

const ADMIN_ITEMS = [
  { label: "Admin Dashboard", href: "/admin",     icon: Settings },
  { label: "Moderator",       href: "/moderator", icon: ShieldCheck },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

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
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-blue-400")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-3 pb-1">
            <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest">Admin</p>
          </div>

          {ADMIN_ITEMS.map((item) => {
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
        </nav>

        {/* Bottom — notifications */}
        <div className="p-3 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/40 cursor-pointer transition-all">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Notifications</span>
            <span className="ml-auto text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">3</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
