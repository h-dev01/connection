import {
  Bell, BookOpen, ShoppingBag, Users, Briefcase, Heart,
  CheckCheck, Trash2, Star, MessageSquare, Upload,
  Calendar, Trophy, UserPlus, Megaphone, Filter,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, { bar: string; dot: string; pill: string; text: string }> = {
  study:       { bar: "bg-blue-500",   dot: "bg-blue-500",   pill: "bg-blue-50 text-blue-700 ring-blue-200",   text: "text-blue-700" },
  marketplace: { bar: "bg-amber-500",  dot: "bg-amber-500",  pill: "bg-amber-50 text-amber-700 ring-amber-200", text: "text-amber-700" },
  community:   { bar: "bg-violet-500", dot: "bg-violet-500", pill: "bg-violet-50 text-violet-700 ring-violet-200", text: "text-violet-700" },
  career:      { bar: "bg-emerald-500",dot: "bg-emerald-500",pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", text: "text-emerald-700" },
  match:       { bar: "bg-rose-500",   dot: "bg-rose-500",   pill: "bg-rose-50 text-rose-700 ring-rose-200",   text: "text-rose-700" },
};

const ICON_MAP: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  study_upload:  { icon: Upload,       bg: "bg-blue-100",    color: "text-blue-600" },
  study_book:    { icon: BookOpen,     bg: "bg-blue-100",    color: "text-blue-600" },
  study_star:    { icon: Star,         bg: "bg-yellow-100",  color: "text-yellow-600" },
  community_msg: { icon: MessageSquare,bg: "bg-violet-100",  color: "text-violet-600" },
  community_add: { icon: Users,        bg: "bg-indigo-100",  color: "text-indigo-600" },
  community_mem: { icon: UserPlus,     bg: "bg-teal-100",    color: "text-teal-600" },
  marketplace:   { icon: ShoppingBag,  bg: "bg-amber-100",   color: "text-amber-600" },
  marketplace_m: { icon: Megaphone,    bg: "bg-pink-100",    color: "text-pink-600" },
  career_brief:  { icon: Briefcase,    bg: "bg-emerald-100", color: "text-emerald-600" },
  career_trophy: { icon: Trophy,       bg: "bg-orange-100",  color: "text-orange-600" },
  career_cal:    { icon: Calendar,     bg: "bg-cyan-100",    color: "text-cyan-600" },
  match:         { icon: Heart,        bg: "bg-rose-100",    color: "text-rose-600" },
};

type N = {
  id: string; category: string; iconKey: string;
  title: string; body: string; time: string; read: boolean;
};

const NOTIFS: N[] = [
  { id:"1", category:"study",       iconKey:"study_upload",  title:"New study material uploaded",    body:'Rahul Sharma uploaded "OS Final Notes" to CS301 · End-Semester.',             time:"2 min ago",   read:false },
  { id:"2", category:"community",   iconKey:"community_msg", title:"New reply on your post",         body:'Priya Patel replied: "Great question! I had the same doubt in sem 4…"',       time:"18 min ago",  read:false },
  { id:"3", category:"marketplace", iconKey:"marketplace",   title:"Someone is interested in your listing", body:'Ananya Desai sent a message about your "Casio fx-991EX" listing.',   time:"1 hr ago",    read:false },
  { id:"4", category:"match",       iconKey:"match",         title:"New Campus Match suggestion",    body:"You have 3 new peer matches based on your updated interests.",               time:"2 hr ago",    read:false },
  { id:"5", category:"career",      iconKey:"career_brief",  title:"Internship deadline approaching", body:"Google Summer Internship 2025 closes in 2 days. Don't miss it!",           time:"3 hr ago",    read:true  },
  { id:"6", category:"community",   iconKey:"community_add", title:"You were added to a community",  body:'Moderator added you to "Web Dev Society · CS Department".',                  time:"Yesterday",   read:true  },
  { id:"7", category:"study",       iconKey:"study_star",    title:"Your material got an upvote",    body:'"Discrete Math Cheatsheet" was upvoted by 5 students this week.',           time:"Yesterday",   read:true  },
  { id:"8", category:"career",      iconKey:"career_trophy", title:"Achievement unlocked",           body:"You're now in the Top 5% contributors on Study Hub. Keep it up!",           time:"2 days ago",  read:true  },
  { id:"9", category:"community",   iconKey:"community_mem", title:"Club membership approved",       body:'Your request to join "Photography Club" has been approved.',                 time:"2 days ago",  read:true  },
  { id:"10",category:"study",       iconKey:"study_book",    title:"Study material approved",        body:'Your upload "ML Lecture Notes" has been approved by the moderator.',        time:"3 days ago",  read:true  },
  { id:"11",category:"marketplace", iconKey:"marketplace_m", title:"New banner promotion",           body:"Check out the latest campus offers in the Marketplace.",                    time:"4 days ago",  read:true  },
  { id:"12",category:"career",      iconKey:"career_cal",    title:"Event reminder",                 body:"Resume Workshop by Career Cell starts tomorrow at 10 AM in Seminar Hall B.", time:"4 days ago",  read:true  },
];

const GROUPS = [
  { label: "Today",     ids: ["1","2","3","4","5"] },
  { label: "Yesterday", ids: ["6","7"] },
  { label: "Earlier",   ids: ["8","9","10","11","12"] },
];

export function GroupedTimeline() {
  const unread = NOTIFS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter']">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Notifications</h1>
            <p className="text-xs text-slate-400">{unread} unread</p>
          </div>
          {unread > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <Filter className="h-3.5 w-3.5 text-slate-400 flex-none" />
        {["All","Study","Marketplace","Community","Career","Match"].map((label, i) => (
          <button key={label}
            className={`flex-none px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              i === 0
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {GROUPS.map(group => {
          const items = group.ids.map(id => NOTIFS.find(n => n.id === id)!).filter(Boolean);
          return (
            <div key={group.label}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {items.map(n => {
                  const ic = ICON_MAP[n.iconKey];
                  const Icon = ic.icon;
                  const cat = CATEGORY_COLORS[n.category] ?? CATEGORY_COLORS.study;
                  return (
                    <div key={n.id}
                      className={`relative flex gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer
                        ${n.read
                          ? "bg-white border-slate-100 hover:border-slate-200"
                          : "bg-white border-slate-200 hover:border-blue-200 shadow-sm"
                        }`}>
                      {/* colored left bar */}
                      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${cat.bar} ${n.read ? "opacity-30" : "opacity-100"}`} />

                      {/* Icon */}
                      <div className={`flex-none w-9 h-9 rounded-xl flex items-center justify-center ${ic.bg}`}>
                        <Icon className={`h-4 w-4 ${ic.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${n.read ? "text-slate-600 font-medium" : "text-slate-900 font-bold"}`}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-none">
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.time}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-none" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.body}</p>
                        <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${cat.pill}`}>
                          {n.category.charAt(0).toUpperCase() + n.category.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
