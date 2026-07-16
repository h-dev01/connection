import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BookOpen, ShoppingBag, Users, Briefcase, Heart,
  CheckCheck, Trash2, Filter, Star, MessageSquare, Upload,
  Calendar, Trophy, UserPlus, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type NotifCategory = "all" | "study" | "marketplace" | "community" | "career" | "match";

interface Notification {
  id: string;
  category: NotifCategory;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const SEED_NOTIFS: Notification[] = [
  {
    id: "1",
    category: "study",
    icon: Upload,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    title: "New study material uploaded",
    body: 'Rahul Sharma uploaded "OS Final Notes" to CS301 · End-Semester.',
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    category: "community",
    icon: MessageSquare,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    title: "New reply on your post",
    body: 'Priya Patel replied: "Great question! I had the same doubt in sem 4…"',
    time: "18 min ago",
    read: false,
  },
  {
    id: "3",
    category: "marketplace",
    icon: ShoppingBag,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    title: "Someone is interested in your listing",
    body: 'Ananya Desai sent a message about your "Casio fx-991EX" listing.',
    time: "1 hr ago",
    read: false,
  },
  {
    id: "4",
    category: "match",
    icon: Heart,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
    title: "New Campus Match suggestion",
    body: "You have 3 new peer matches based on your updated interests.",
    time: "2 hr ago",
    read: false,
  },
  {
    id: "5",
    category: "career",
    icon: Briefcase,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    title: "Internship deadline approaching",
    body: "Google Summer Internship 2025 closes in 2 days. Don't miss it!",
    time: "3 hr ago",
    read: true,
  },
  {
    id: "6",
    category: "community",
    icon: Users,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    title: "You were added to a community",
    body: 'Moderator added you to "Web Dev Society · CS Department".',
    time: "Yesterday",
    read: true,
  },
  {
    id: "7",
    category: "study",
    icon: Star,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    title: "Your material got an upvote",
    body: '"Discrete Math Cheatsheet" was upvoted by 5 students this week.',
    time: "Yesterday",
    read: true,
  },
  {
    id: "8",
    category: "career",
    icon: Trophy,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    title: "Achievement unlocked",
    body: "You're now in the Top 5% contributors on Study Hub. Keep it up!",
    time: "2 days ago",
    read: true,
  },
  {
    id: "9",
    category: "community",
    icon: UserPlus,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
    title: "Club membership approved",
    body: 'Your request to join "Photography Club" has been approved.',
    time: "2 days ago",
    read: true,
  },
  {
    id: "10",
    category: "study",
    icon: BookOpen,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    title: "Study material approved",
    body: 'Your upload "ML Lecture Notes" has been approved by the moderator.',
    time: "3 days ago",
    read: true,
  },
  {
    id: "11",
    category: "marketplace",
    icon: Megaphone,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100",
    title: "New banner promotion",
    body: "Check out the latest campus offers in the Marketplace.",
    time: "4 days ago",
    read: true,
  },
  {
    id: "12",
    category: "career",
    icon: Calendar,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100",
    title: "Event reminder",
    body: "Resume Workshop by Career Cell starts tomorrow at 10 AM in Seminar Hall B.",
    time: "4 days ago",
    read: true,
  },
];

const FILTERS: { id: NotifCategory; label: string; icon: React.ElementType }[] = [
  { id: "all",         label: "All",         icon: Bell },
  { id: "study",       label: "Study",       icon: BookOpen },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "community",   label: "Community",   icon: Users },
  { id: "career",      label: "Career",      icon: Briefcase },
  { id: "match",       label: "Match",       icon: Heart },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>(SEED_NOTIFS);
  const [active, setActive] = useState<NotifCategory>("all");

  const visible = active === "all" ? notifs : notifs.filter((n) => n.category === active);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifs((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => setNotifs([]);

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
                  {/* Icon */}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", n.iconBg)}>
                    <Icon className={cn("h-5 w-5", n.iconColor)} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm leading-snug", n.read ? "font-medium text-slate-700" : "font-semibold text-slate-900")}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>

                  {/* Unread dot + dismiss */}
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
