/**
 * NotificationsContext — shared notification state across the whole app.
 * Used by both the SidebarLayout bell dropdown and the full NotificationsPage.
 */
import { createContext, useContext, useState, useCallback } from "react";
import {
  Bell, BookOpen, ShoppingBag, Users, Briefcase, Heart,
  Star, MessageSquare, Upload, Calendar, Trophy, UserPlus,
  Megaphone, CalendarCheck, Pencil, Ban,
} from "lucide-react";

export type NotifCategory = "all" | "study" | "marketplace" | "community" | "career" | "match";

export interface Notification {
  id: string;
  category: NotifCategory;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

const SEED_NOTIFS: Notification[] = [
  {
    id: "m1", category: "match", icon: Heart, iconColor: "text-rose-600", iconBg: "bg-rose-100",
    title: "New connect request", body: "Riya Sharma wants to connect with you as a Study Partner.",
    time: "Just now", read: false, href: "/match",
  },
  {
    id: "m2", category: "match", icon: CalendarCheck, iconColor: "text-blue-600", iconBg: "bg-blue-100",
    title: "Meetup proposed", body: "Arjun Patel proposed a Campus Walk on Next Monday at 5:00 PM.",
    time: "5 min ago", read: false, href: "/match",
  },
  {
    id: "m3", category: "match", icon: Pencil, iconColor: "text-amber-600", iconBg: "bg-amber-100",
    title: "Meetup edit request", body: "Sneha Nair wants to reschedule your Coffee Chat. (2/3 edits used)",
    time: "12 min ago", read: false, href: "/match",
  },
  {
    id: "1", category: "study", icon: Upload, iconColor: "text-blue-600", iconBg: "bg-blue-100",
    title: "New study material uploaded",
    body: 'Rahul Sharma uploaded "OS Final Notes" to CS301 · End-Semester.',
    time: "2 min ago", read: false,
  },
  {
    id: "2", category: "community", icon: MessageSquare, iconColor: "text-violet-600", iconBg: "bg-violet-100",
    title: "New reply on your post",
    body: 'Priya Patel replied: "Great question! I had the same doubt in sem 4…"',
    time: "18 min ago", read: false,
  },
  {
    id: "3", category: "marketplace", icon: ShoppingBag, iconColor: "text-amber-600", iconBg: "bg-amber-100",
    title: "Someone is interested in your listing",
    body: 'Ananya Desai sent a message about your "Casio fx-991EX" listing.',
    time: "1 hr ago", read: false,
  },
  {
    id: "4", category: "match", icon: Heart, iconColor: "text-rose-600", iconBg: "bg-rose-100",
    title: "New Campus Match suggestion",
    body: "You have 3 new peer matches based on your updated interests.",
    time: "2 hr ago", read: false, href: "/match",
  },
  {
    id: "5", category: "career", icon: Briefcase, iconColor: "text-emerald-600", iconBg: "bg-emerald-100",
    title: "Internship deadline approaching",
    body: "Google Summer Internship 2025 closes in 2 days. Don't miss it!",
    time: "3 hr ago", read: true,
  },
  {
    id: "6", category: "community", icon: Users, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
    title: "You were added to a community",
    body: 'Moderator added you to "Web Dev Society · CS Department".',
    time: "Yesterday", read: true,
  },
  {
    id: "7", category: "study", icon: Star, iconColor: "text-yellow-600", iconBg: "bg-yellow-100",
    title: "Your material got an upvote",
    body: '"Discrete Math Cheatsheet" was upvoted by 5 students this week.',
    time: "Yesterday", read: true,
  },
  {
    id: "8", category: "career", icon: Trophy, iconColor: "text-orange-600", iconBg: "bg-orange-100",
    title: "Achievement unlocked",
    body: "You're now in the Top 5% contributors on Study Hub. Keep it up!",
    time: "2 days ago", read: true,
  },
  {
    id: "9", category: "community", icon: UserPlus, iconColor: "text-teal-600", iconBg: "bg-teal-100",
    title: "Club membership approved",
    body: 'Your request to join "Photography Club" has been approved.',
    time: "2 days ago", read: true,
  },
  {
    id: "10", category: "study", icon: BookOpen, iconColor: "text-blue-600", iconBg: "bg-blue-100",
    title: "Study material approved",
    body: 'Your upload "ML Lecture Notes" has been approved by the moderator.',
    time: "3 days ago", read: true,
  },
  {
    id: "11", category: "marketplace", icon: Megaphone, iconColor: "text-pink-600", iconBg: "bg-pink-100",
    title: "New banner promotion",
    body: "Check out the latest campus offers in the Marketplace.",
    time: "4 days ago", read: true,
  },
  {
    id: "12", category: "career", icon: Calendar, iconColor: "text-cyan-600", iconBg: "bg-cyan-100",
    title: "Event reminder",
    body: "Resume Workshop by Career Cell starts tomorrow at 10 AM in Seminar Hall B.",
    time: "4 days ago", read: true,
  },
];

interface NotificationsContextValue {
  notifs: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  addNotif: (n: Omit<Notification, "id" | "read" | "time">) => void;
}

const Ctx = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notification[]>(SEED_NOTIFS);

  const markRead = useCallback((id: string) =>
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const markAllRead = useCallback(() =>
    setNotifs(p => p.map(n => ({ ...n, read: true }))), []);

  const dismiss = useCallback((id: string) =>
    setNotifs(p => p.filter(n => n.id !== id)), []);

  const clearAll = useCallback(() => setNotifs([]), []);

  const addNotif = useCallback((partial: Omit<Notification, "id" | "read" | "time">) => {
    const n: Notification = { ...partial, id: Date.now().toString(), read: false, time: "Just now" };
    setNotifs(p => [n, ...p]);
  }, []);

  return (
    <Ctx.Provider value={{ notifs, unreadCount: notifs.filter(n => !n.read).length, markRead, markAllRead, dismiss, clearAll, addNotif }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
