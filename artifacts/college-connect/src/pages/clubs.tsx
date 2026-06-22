import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Calendar, Grid, List, Medal, Shield, Award,
  Tent, Plus, Search, Trophy, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ActionMenu, ActionToast } from "@/components/shared/ContentActions";
import { useAuth } from "@/contexts/AuthContext";

interface Club {
  id: string;
  name: string;
  desc: string;
  members: number;
  isOfficial: boolean;
  upcomingEvent: string;
  activityLevel: number;
  createdBy: string;
}

const SEED: Club[] = [
  { id: "1", name: "Robotics Society",  desc: "Building autonomous robots for national competitions.",       members: 145, isOfficial: true,  upcomingEvent: "Maze Solver Draft",        activityLevel: 85, createdBy: "Admin" },
  { id: "2", name: "Debate Club",       desc: "Weekly parliamentary style debates on current affairs.",     members: 89,  isOfficial: true,  upcomingEvent: "Inter-college Qualifiers", activityLevel: 60, createdBy: "Admin" },
  { id: "3", name: "Open Source Hub",   desc: "Contributing to FOSS and learning Git/GitHub together.",     members: 210, isOfficial: false, upcomingEvent: "Hacktoberfest Prep",       activityLevel: 95, createdBy: "Alex Rivera" },
  { id: "4", name: "Drama Dramatics",   desc: "Street plays, stage productions, and improv sessions.",      members: 112, isOfficial: true,  upcomingEvent: "Annual Fest Auditions",    activityLevel: 75, createdBy: "Admin" },
];

/* ─── Start-a-club form ───────────────────────────────────── */
function StartClubForm({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Club) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ name: "", desc: "", event: "" });
  const s = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `c_${Date.now()}`,
      name: f.name,
      desc: f.desc,
      members: 1,
      isOfficial: false,
      upcomingEvent: f.event || "TBD",
      activityLevel: 10,
      createdBy: user?.name ?? "",
    });
    onClose();
  };
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-blue-100 rounded-2xl p-6 shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900">Start a New Club</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Club name*" value={f.name} onChange={e => s("name", e.target.value)} required className="md:col-span-2" />
        <Input placeholder="Short description*" value={f.desc} onChange={e => s("desc", e.target.value)} required className="md:col-span-2" />
        <Input placeholder="First upcoming event (optional)" value={f.event} onChange={e => s("event", e.target.value)} className="md:col-span-2" />
        <Button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold">Create Club</Button>
      </form>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Clubs() {
  const { user } = useAuth();
  const isMod = user?.role === "low_admin" || user?.role === "admin";

  const [clubs, setClubs] = useState<Club[]>(SEED);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success"|"warn" } | null>(null);

  const notify = (msg: string, type: "success"|"warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = clubs.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-8">
      {toast && <ActionToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Tent className="h-8 w-8 text-blue-600" /> Clubs & Organizations
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Discover your tribe, build skills, and lead initiatives.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6" onClick={() => setShowForm(v => !v)}>
          <Plus className="mr-2 h-4 w-4" /> Start a Club
        </Button>
      </div>

      {/* Featured hero cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm overflow-hidden h-full group cursor-pointer relative bg-slate-900 min-h-[260px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/90 mix-blend-multiply z-10 pointer-events-none" />
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 pointer-events-none" />
            <CardContent className="p-8 relative z-20 flex flex-col h-full justify-end">
              <Badge className="w-fit bg-emerald-500 text-white border-none mb-4 hover:bg-emerald-600">HIGH GROWTH</Badge>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Entrepreneurship Society</h2>
              <p className="text-blue-100 text-lg mb-6 max-w-lg">Incubating student startups and hosting weekly pitches with alumni investors.</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/20 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {["1","2","3"].map(u => <Avatar key={u} className="h-10 w-10 border-2 border-slate-900"><AvatarImage src={`https://i.pravatar.cc/150?u=${u}`} /></Avatar>)}
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-lg leading-none">342</p>
                    <p className="text-xs text-blue-200">Active Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Next Event</p>
                    <p className="text-sm font-semibold text-white">Startup Pitch Deck</p>
                  </div>
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold">Join Club</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm overflow-hidden h-full group cursor-pointer relative bg-slate-900 min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 pointer-events-none" />
          <CardContent className="p-6 relative z-20 flex flex-col h-full justify-end">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Photography Collective</h3>
            <p className="text-slate-300 text-sm mb-4">Capturing campus life, workshops on editing, and weekend photowalks.</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-white/80"><Users className="h-4 w-4" /><span className="text-sm font-medium">128</span></div>
              <div className="flex items-center gap-2 text-white/80"><Calendar className="h-4 w-4" /><span className="text-sm font-medium">3 Events</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start-a-club form */}
      <AnimatePresence>
        {showForm && (
          <StartClubForm
            onClose={() => setShowForm(false)}
            onAdd={c => { setClubs(p => [...p, c]); notify(`"${c.name}" created! Pending official approval.`); }}
          />
        )}
      </AnimatePresence>

      {/* All clubs grid */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Organizations</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search clubs..."
                className="pl-9 bg-white"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-white rounded-md border border-slate-200 p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-100 text-slate-900"><Grid className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No clubs match your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map(club => {
                const isOwner = club.createdBy === user?.name;
                return (
                  <motion.div key={club.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative">
                      {/* Action menu */}
                      <div className="absolute top-3 right-3 z-10">
                        <ActionMenu
                          title={club.name}
                          isOwner={isOwner}
                          isModerator={isMod}
                          onDelete={() => {
                            setClubs(p => p.filter(x => x.id !== club.id));
                            notify(`"${club.name}" has been removed.`);
                          }}
                          onReport={() => notify(`"${club.name}" reported for review.`, "warn")}
                        />
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col pr-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Tent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {club.isOfficial && (
                              <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold">
                                <Shield className="h-3 w-3 mr-1" /> OFFICIAL
                              </Badge>
                            )}
                            {isOwner && (
                              <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] font-bold">YOUR CLUB</Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">{club.name}</h3>
                        <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">{club.desc}</p>

                        <div className="space-y-4 w-full">
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                              <span>Activity Level</span>
                              <span>{club.activityLevel}%</span>
                            </div>
                            <Progress value={club.activityLevel} className="h-1.5" />
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-md">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            <span className="truncate">{club.upcomingEvent}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-semibold">{club.members}</span>
                            </div>
                            {isOwner ? (
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs" onClick={() => {
                                setClubs(p => p.filter(x => x.id !== club.id));
                                notify(`"${club.name}" deleted.`);
                              }}>Delete</Button>
                            ) : (
                              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-medium">Join</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Reputation banner */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-900 to-indigo-900 text-white overflow-hidden relative">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Trophy className="h-64 w-64 -mb-10 -mr-10" />
        </div>
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">Build Your Leadership Reputation</h2>
            <p className="text-blue-100 text-lg">Earn badges by organizing events, maintaining high club activity, and contributing to the campus ecosystem.</p>
          </div>
          <div className="flex items-center gap-6">
            {[
              { icon: Medal,  bg: "bg-slate-200",  border: "border-slate-300",  icon_c: "text-slate-500",  label: "SILVER",   labelC: "text-blue-200"   },
              { icon: Award,  bg: "bg-yellow-100", border: "border-yellow-300", icon_c: "text-yellow-600", label: "GOLD",     labelC: "text-yellow-400", scale: true },
              { icon: Trophy, bg: "bg-cyan-100",   border: "border-cyan-300",   icon_c: "text-cyan-600",   label: "PLATINUM", labelC: "text-cyan-300"   },
            ].map(({ icon: Icon, bg, border, icon_c, label, labelC, scale }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`h-14 w-14 rounded-full ${bg} flex items-center justify-center shadow-lg border-2 ${border} ${scale ? "transform scale-110" : ""}`}>
                  <Icon className={`h-6 w-6 ${icon_c}`} />
                </div>
                <span className={`text-xs font-bold ${labelC}`}>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
