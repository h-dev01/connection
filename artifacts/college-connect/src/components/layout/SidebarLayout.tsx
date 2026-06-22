import { Link, useLocation } from "wouter";
import { LayoutDashboard, BookOpen, ShoppingBag, Users, Briefcase, Tent, Settings, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Study Hub", href: "/study", icon: BookOpen },
    { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { label: "Community", href: "/community", icon: Users },
    { label: "Career", href: "/career", icon: Briefcase },
    { label: "Clubs", href: "/clubs", icon: Tent },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            CollegeConnect
          </h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1 uppercase tracking-wider font-semibold">Campus Super App</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-400" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-4">
          <Button className="w-full bg-black hover:bg-black/90 text-white font-medium shadow-none border-none">
            Quick Action
          </Button>
          
          <div className="space-y-1">
            <Link href="/admin">
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-white cursor-pointer rounded-md hover:bg-sidebar-accent/50">
                <Settings className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </div>
            </Link>
            <Link href="/moderator">
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-white cursor-pointer rounded-md hover:bg-sidebar-accent/50">
                <HelpCircle className="h-4 w-4" />
                <span>Moderator</span>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
