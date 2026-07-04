import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Building2, MapPin, DollarSign, ExternalLink,
  FileText, MonitorPlay, BrainCircuit, Search, UserPlus,
  Zap, Plus, Code, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActionMenu, ActionToast } from "@/components/shared/ContentActions";
import { useAuth } from "@/contexts/AuthContext";

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: string;
  postedBy: string; // user name
}

const SEED: Internship[] = [
  { id: "1", title: "SDE Intern (Summer '24)",      company: "Amazon India",       location: "Bangalore / Remote", salary: "₹80k/mo", status: "NEW",    postedBy: "Alex Rivera"   },
  { id: "2", title: "Product Marketing Intern",     company: "Zomato",             location: "Gurgaon",            salary: "₹45k/mo", status: "OPEN",   postedBy: "Career Cell"   },
  { id: "3", title: "Data Science Intern",          company: "Fractal Analytics",  location: "Mumbai",             salary: "₹60k/mo", status: "OPEN",   postedBy: "Career Cell"   },
  { id: "4", title: "UI/UX Design Intern",          company: "Cred",               location: "Gurgaon",            salary: "₹40k/mo", status: "CLOSED", postedBy: "Career Cell"   },
];

const COFOUNDER = [
  { role: "Developer", color: "bg-blue-500",    name: "Siddharth Rao", idea: "AI study planner app",           icon: Code       },
  { role: "Designer",  color: "bg-pink-500",    name: "Maya Patel",    idea: "Sustainable fashion marketplace",icon: Zap        },
  { role: "Marketing", color: "bg-amber-500",   name: "Kunal Singh",   idea: "Campus event aggregator",         icon: Search     },
  { role: "Business",  color: "bg-emerald-500", name: "Aryan Mehta",   idea: "B2B SaaS for local vendors",      icon: Building2  },
];

/* ─── Post-a-job form ─────────────────────────────────────── */
function PostJobForm({ onClose, onAdd }: { onClose: () => void; onAdd: (j: Internship) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ title: "", company: "", location: "", salary: "" });
  const s = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: `j_${Date.now()}`, ...f, status: "NEW", postedBy: user?.name ?? "" });
    onClose();
  };
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-blue-100 rounded-2xl p-6 shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900">Post a New Opportunity</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Role title*" value={f.title}    onChange={e => s("title",    e.target.value)} required />
        <Input placeholder="Company*"    value={f.company}  onChange={e => s("company",  e.target.value)} required />
        <Input placeholder="Location"    value={f.location} onChange={e => s("location", e.target.value)} />
        <Input placeholder="Stipend (e.g. ₹30k/mo)" value={f.salary} onChange={e => s("salary", e.target.value)} />
        <Button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold">Post Opportunity</Button>
      </form>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Career() {
  const { user } = useAuth();
  const isMod = user?.role === "low_admin" || user?.role === "admin";

  const [internships, setInternships] = useState<Internship[]>(SEED);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"warn" } | null>(null);

  const notify = (msg: string, type: "success"|"warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-8">
      {toast && <ActionToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Career Corner</h1>
          <p className="text-slate-500 mt-2 text-lg">Internships, placements, and startup networking.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => setShowForm(v => !v)}>
          <Plus className="mr-2 h-4 w-4" /> Post Opportunity
        </Button>
      </div>

      {/* Quick tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: FileText,     bg: "from-blue-50 to-indigo-50",   btn: "bg-blue-600",    title: "Resume Builder",     desc: "Create ATS-friendly resumes optimized for top tech companies." },
          { icon: MonitorPlay,  bg: "from-emerald-50 to-teal-50",  btn: "bg-emerald-600", title: "Interview Prep",     desc: "Mock interviews with peers and AI-based feedback sessions." },
          { icon: BrainCircuit, bg: "from-amber-50 to-orange-50",  btn: "bg-amber-600",   title: "Aptitude Practice", desc: "Daily quant and logic puzzles to clear online assessments." },
        ].map(({ icon: Icon, bg, btn, title, desc }) => (
          <Card key={title} className={`border-none shadow-sm hover:shadow-md transition-shadow group bg-gradient-to-br ${bg} cursor-pointer`}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`h-14 w-14 ${btn} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
              <p className="text-sm text-slate-500 mt-2">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post form */}
      <AnimatePresence>
        {showForm && (
          <PostJobForm
            onClose={() => setShowForm(false)}
            onAdd={j => { setInternships(p => [j, ...p]); notify("Opportunity posted!"); }}
          />
        )}
      </AnimatePresence>

      {/* Listings */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Latest Opportunities</h2>
          <Button variant="outline" className="text-slate-600">View All Jobs</Button>
        </div>
        {internships.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No listings. Post the first opportunity!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {internships.map(intern => {
                const isOwner = intern.postedBy === user?.name;
                return (
                  <motion.div key={intern.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                      {isOwner && (
                        <span className="absolute top-3 right-12 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">YOUR POST</span>
                      )}
                      {/* ⋯ menu */}
                      <div className="absolute top-3 right-3">
                        <ActionMenu
                          title={intern.title}
                          isOwner={isOwner}
                          isModerator={isMod}
                          onDelete={() => {
                            setInternships(p => p.filter(x => x.id !== intern.id));
                            notify("Listing removed.");
                          }}
                          onReport={() => notify(`"${intern.title}" reported to moderation team.`, "warn")}
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4 pr-8">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-slate-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{intern.title}</h3>
                              <p className="text-sm font-medium text-slate-600">{intern.company}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={
                            intern.status === "NEW"    ? "text-blue-700 bg-blue-50 border-blue-200 font-bold" :
                            intern.status === "OPEN"   ? "text-emerald-700 bg-emerald-50 border-emerald-200 font-bold" :
                                                         "text-slate-500 bg-slate-100 border-slate-200 font-bold"
                          }>{intern.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          {intern.location && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                              <MapPin className="h-4 w-4" /> {intern.location}
                            </div>
                          )}
                          {intern.salary && (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">
                              <DollarSign className="h-4 w-4" /> {intern.salary}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          {isOwner ? (
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                              setInternships(p => p.filter(x => x.id !== intern.id));
                              notify("Listing removed.");
                            }}>Remove Listing</Button>
                          ) : (
                            <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" disabled={intern.status === "CLOSED"}>
                              {intern.status === "CLOSED" ? "Applications Closed" : "Apply Now"}
                            </Button>
                          )}
                          <Button variant="outline" size="icon" className="border-slate-200 text-slate-600"><ExternalLink className="h-4 w-4" /></Button>
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

      {/* Co-founder section */}
      <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
          <div>
            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-none mb-3">CO-FOUNDER FINDER</Badge>
            <h2 className="text-3xl font-bold text-white tracking-tight">Build the next big thing.</h2>
            <p className="text-indigo-200 mt-2 text-lg max-w-xl">Find talented peers from different departments to turn your ideas into reality.</p>
          </div>
          <Button className="bg-white text-slate-900 hover:bg-slate-100 mt-4 md:mt-0 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Post an Idea
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {COFOUNDER.map(({ role, color, name, idea, icon: Icon }) => (
            <Card key={role} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Looking for</p>
                    <p className="font-bold text-white leading-tight">{role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-300">Project Idea:</p>
                  <p className="font-semibold text-white leading-snug">{idea}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-slate-600">
                      <AvatarFallback className="text-[10px] bg-slate-700 text-white">{name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-300 font-medium">{name}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-400 hover:text-white hover:bg-indigo-600/50">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
