/**
 * SidebarLayout — wraps all authenticated pages.
 * Includes a notification bell dropdown in the sidebar header.
 */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell, BookOpen, ShoppingBag, Users,
  Briefcase, Tent, User, Settings, ShieldCheck,
  Heart, LogOut, GraduationCap, ShieldAlert,
  CheckCheck, Trash2, ArrowRight, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";

const NAV_ITEMS = [
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Study Hub",     href: "/study",          icon: BookOpen },
  { label: "Marketplace",  href: "/marketplace", icon: ShoppingBag },
  { label: "Community",    href: "/community",   icon: Users },
  { label: "Campus Match", href: "/match",       icon: Heart, badge: "New" },
  { label: "Career",       href: "/career",      icon: Briefcase },
  { label: "Clubs",        href: "/clubs",       icon: Tent },
  { label: "Profile",      href: "/profile",     icon: User },
];

const ADMIN_ITEMS = [
  { label: "Moderator Panel",  href: "/moderator", icon: ShieldCheck, roles: ["low_admin", "admin"] },
  { label: "Admin Dashboard",  href: "/admin",      icon: Settings,    roles: ["admin"] },
];

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  student:   { label: "Student",    icon: GraduationCap, color: "text-blue-400",    bg: "bg-blue-500/20" },
  low_admin: { label: "Moderator",  icon: ShieldCheck,   color: "text-emerald-400", bg: "bg-emerald-500/20" },
  admin:     { label: "High Admin", icon: ShieldAlert,   color: "text-violet-400",  bg: "bg-violet-500/20" },
};

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifs, unreadCount, markRead, markAllRead, dismiss, resolveAction } = useNotifications();
  const [, navigate] = useLocation();
  const preview = notifs.slice(0, 6);

  return (
    <div className="absolute left-[260px] top-0 z-50 w-[340px] rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <CheckCheck className="h-3 w-3" /> Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
        {preview.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">All caught up!</p>
          </div>
        ) : (
          preview.map((n) => {
            const Icon = n.icon;
            const hasActions = n.actions && n.actions.length > 0 && !n.resolved;
            return (
              <div
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 px-4 py-3 transition-colors",
                  !hasActions && "cursor-pointer",
                  n.read ? "bg-white hover:bg-slate-50" : "bg-blue-50/70 hover:bg-blue-50"
                )}
                onClick={!hasActions ? () => {
                  markRead(n.id);
                  if (n.href) { navigate(n.href); onClose(); }
                } : undefined}
              >
                {/* Icon */}
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", n.iconBg)}>
                  <Icon className={cn("h-4 w-4", n.iconColor)} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs leading-snug", n.read ? "font-medium text-slate-600" : "font-semibold text-slate-900")}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>

                  {/* Action buttons */}
                  {hasActions && (
                    <div className="flex gap-1.5 mt-2">
                      {n.actions!.map((a) => (
                        <button
                          key={a.variant}
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAction(n.id, a.variant === "accept" ? "accepted" : "declined");
                          }}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                            a.variant === "accept"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200"
                          )}
                        >
                          {a.variant === "accept"
                            ? <Check className="h-2.5 w-2.5" />
                            : <X className="h-2.5 w-2.5" />
                          }
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Resolved badge */}
                  {n.resolved && (
                    <div className={cn(
                      "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      n.resolved === "accepted"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    )}>
                      {n.resolved === "accepted"
                        ? <><Check className="h-2.5 w-2.5" /> Accepted</>
                        : <><X className="h-2.5 w-2.5" /> Declined</>
                      }
                    </div>
                  )}
                </div>

                {/* Unread dot + dismiss */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50">
        <Link href="/notifications">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-slate-100 transition-colors"
          >
            View all notifications <ArrowRight className="h-3 w-3" />
          </button>
        </Link>
      </div>
    </div>
  );
}

function useProfilePhoto() {
  const [photo, setPhoto] = useState<string | null>(() => {
    try {
      const s = localStorage.getItem("cc_match_profile");
      if (s) { const p = JSON.parse(s); return p.photos?.[0] ?? null; }
    } catch { /* ignore */ }
    return null;
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cc_match_profile") {
        try { const p = JSON.parse(e.newValue ?? "{}"); setPhoto(p.photos?.[0] ?? null); } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return photo;
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const profilePhoto = useProfilePhoto();
  const role = user?.role ?? "student";
  const roleMeta = ROLE_META[role];
  const RoleIcon = roleMeta.icon;

  const visibleAdminItems = ADMIN_ITEMS.filter((item) => item.roles.includes(role));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [bellOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">

        {/* Logo + Bell */}
        <div className="px-5 py-4 border-b border-sidebar-border/50 flex items-center gap-2.5">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity flex-1">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">C</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">CollegeConnect</h1>
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider mt-0.5">Campus Super App</p>
              </div>
            </div>
          </Link>

          {/* Bell button with badge */}
          <div ref={bellRef} className="relative ml-auto flex-shrink-0">
            <button
              onClick={() => setBellOpen(v => !v)}
              className={cn(
                "relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                bellOpen
                  ? "bg-blue-500/30 text-white"
                  : "text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/40"
              )}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <NotificationDropdown onClose={() => setBellOpen(false)} />
            )}
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const isBell = item.href === "/notifications";
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

                  {isBell && unreadCount > 0 && !isActive && (
                    <span className="ml-auto text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {!isBell && item.badge && !isActive && (
                    <span className="ml-auto text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </div>
              </Link>
            );
          })}

          {/* Admin section */}
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
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              {profilePhoto ? (
                <img src={profilePhoto} alt="You" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-white/20" />
              ) : (
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", roleMeta.bg)}>
                  <RoleIcon className={cn("h-3.5 w-3.5", roleMeta.color)} />
                </div>
              )}
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
