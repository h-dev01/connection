import {
  Bell, BookOpen, ShoppingBag, Users, Briefcase, Heart,
  CheckCheck, Trash2, Star, MessageSquare, Upload,
  Calendar, Trophy, UserPlus, Megaphone,
} from "lucide-react";

const CAT_PILL: Record<string, string> = {
  study:       "bg-blue-500/20 text-blue-300",
  marketplace: "bg-amber-500/20 text-amber-300",
  community:   "bg-violet-500/20 text-violet-300",
  career:      "bg-emerald-500/20 text-emerald-300",
  match:       "bg-rose-500/20 text-rose-300",
};

const ICON_CFG: Record<string, { icon: React.ElementType; gradient: string }> = {
  study_upload:  { icon: Upload,        gradient: "from-blue-500 to-cyan-400" },
  study_book:    { icon: BookOpen,      gradient: "from-blue-600 to-blue-400" },
  study_star:    { icon: Star,          gradient: "from-yellow-500 to-amber-400" },
  community_msg: { icon: MessageSquare, gradient: "from-violet-500 to-purple-400" },
  community_add: { icon: Users,         gradient: "from-indigo-500 to-violet-400" },
  community_mem: { icon: UserPlus,      gradient: "from-teal-500 to-cyan-400" },
  marketplace:   { icon: ShoppingBag,   gradient: "from-amber-500 to-yellow-400" },
  marketplace_m: { icon: Megaphone,     gradient: "from-pink-500 to-rose-400" },
  career_brief:  { icon: Briefcase,     gradient: "from-emerald-500 to-green-400" },
  career_trophy: { icon: Trophy,        gradient: "from-orange-500 to-amber-400" },
  career_cal:    { icon: Calendar,      gradient: "from-cyan-500 to-sky-400" },
  match:         { icon: Heart,         gradient: "from-rose-500 to-pink-400" },
};

type N = { id: string; category: string; iconKey: string; title: string; body: string; time: string; read: boolean };

const NOTIFS: N[] = [
  { id:"1",  category:"study",       iconKey:"study_upload",  title:"New study material uploaded",          body:'Rahul Sharma uploaded "OS Final Notes" to CS301 · End-Semester.',             time:"2m",       read:false },
  { id:"2",  category:"community",   iconKey:"community_msg", title:"New reply on your post",               body:'Priya Patel replied: "Great question! I had the same doubt in sem 4…"',       time:"18m",      read:false },
  { id:"3",  category:"marketplace", iconKey:"marketplace",   title:"Someone is interested in your listing", body:'Ananya Desai sent a message about your "Casio fx-991EX" listing.',            time:"1h",       read:false },
  { id:"4",  category:"match",       iconKey:"match",         title:"3 new peer matches for you",           body:"Based on your updated interests — check out who you matched with!",           time:"2h",       read:false },
  { id:"5",  category:"career",      iconKey:"career_brief",  title:"Internship deadline approaching",      body:"Google Summer Internship 2025 closes in 2 days. Don't miss it!",             time:"3h",       read:true },
  { id:"6",  category:"community",   iconKey:"community_add", title:"Added to a community",                 body:'Moderator added you to "Web Dev Society · CS Department".',                  time:"1d",       read:true },
  { id:"7",  category:"study",       iconKey:"study_star",    title:"Your material got an upvote",          body:'"Discrete Math Cheatsheet" was upvoted by 5 students.',                      time:"1d",       read:true },
  { id:"8",  category:"career",      iconKey:"career_trophy", title:"Achievement unlocked 🏆",              body:"Top 5% contributor on Study Hub. Keep it up!",                               time:"2d",       read:true },
  { id:"9",  category:"community",   iconKey:"community_mem", title:"Club membership approved",             body:'Your request to join "Photography Club" has been approved.',                  time:"2d",       read:true },
  { id:"10", category:"study",       iconKey:"study_book",    title:"Study material approved",              body:'Your upload "ML Lecture Notes" has been approved.',                          time:"3d",       read:true },
  { id:"11", category:"marketplace", iconKey:"marketplace_m", title:"New campus promo banner",              body:"Check out the latest campus offers in the Marketplace.",                     time:"4d",       read:true },
  { id:"12", category:"career",      iconKey:"career_cal",    title:"Event reminder",                       body:"Resume Workshop starts tomorrow at 10 AM in Seminar Hall B.",                time:"4d",       read:true },
];

const FILTERS = ["All", "Study", "Marketplace", "Community", "Career", "Match"];

export function SocialFeed() {
  const unread = NOTIFS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0f1117] font-['Inter']">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">Notifications</h1>
            {unread > 0 && (
              <span className="h-5 min-w-5 px-1.5 bg-blue-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all font-medium">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        </div>
        <p className="text-xs text-slate-500">{unread} unread · {NOTIFS.length} total</p>
      </div>

      {/* Filter tabs */}
      <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto">
        {FILTERS.map((f, i) => (
          <button key={f}
            className={`flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              i === 0
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="px-4 space-y-1 pb-6">
        {NOTIFS.map(n => {
          const ic = ICON_CFG[n.iconKey];
          const Icon = ic.icon;
          const pill = CAT_PILL[n.category] ?? CAT_PILL.study;
          return (
            <div key={n.id}
              className={`flex gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
                n.read
                  ? "bg-white/0 hover:bg-white/4"
                  : "bg-white/6 hover:bg-white/8"
              }`}>
              {/* Gradient icon */}
              <div className={`flex-none w-10 h-10 rounded-2xl bg-gradient-to-br ${ic.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${n.read ? "text-slate-300 font-medium" : "text-white font-bold"}`}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-1.5 flex-none">
                    <span className="text-[11px] text-slate-500">{n.time}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400 flex-none" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.body}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${pill}`}>
                  {n.category.charAt(0).toUpperCase() + n.category.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
