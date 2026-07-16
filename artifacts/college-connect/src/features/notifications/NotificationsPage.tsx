import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BookOpen, ShoppingBag, Users, Briefcase, Heart,
  CheckCheck, Trash2, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications, type NotifCategory } from "@/contexts/NotificationsContext";

const FILTERS: { id: NotifCategory; label: string; icon: React.ElementType }[] = [
  { id: "all",         label: "All",         icon: Bell },
  { id: "study",       label: "Study",       icon: BookOpen },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "community",   label: "Community",   icon: Users },
  { id: "career",      label: "Career",      icon: Briefcase },
  { id: "match",       label: "Match",       icon: Heart },
];

export default function NotificationsPage() {
  const { notifs, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications();
  const [active, setActive] = useState<NotifCategory>("all");

  const visible = active === "all" ? notifs : notifs.filter((n) => n.category === active);

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-slate-500 hover:text-slate-800 text-xs gap-1.5">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
            {notifs.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-400 hover:text-red-500 text-xs gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="max-w-3xl mx-auto px-6 pb-3 flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mr-1" />
          {FILTERS.map((f) => {
            const count = f.id === "all"
              ? notifs.filter((n) => !n.read).length
              : notifs.filter((n) => n.category === f.id && !n.read).length;
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                  active === f.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <f.icon className="h-3 w-3" />
                {f.label}
                {count > 0 && (
                  <span className={cn(
                    "rounded-full px-1 text-[10px] font-bold leading-tight",
                    active === f.id ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-2">
        <AnimatePresence initial={false}>
          {visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-slate-400"
            >
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-500">All caught up!</p>
              <p className="text-sm mt-1">No notifications here.</p>
            </motion.div>
          ) : (
            visible.map((n) => {
              const Icon = n.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                    n.read
                      ? "bg-white border-slate-100 hover:border-slate-200"
                      : "bg-blue-50/60 border-blue-100 hover:border-blue-200"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", n.iconBg)}>
                    <Icon className={cn("h-5 w-5", n.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm leading-snug", n.read ? "font-medium text-slate-700" : "font-semibold text-slate-900")}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 mt-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
