import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Share2, Edit2, Building, GraduationCap,
  ThumbsUp, Star, Award, Code, BookOpen, Download, FileText,
  Plus, ChevronRight, Eye, User, Phone, X, Save,
  CalendarDays, Camera, Pencil, Trash2, Image as ImageIcon,
  Sparkles, Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth, type StudentProfile } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────── */
interface Project {
  id: string;
  title: string;
  role: string;
  desc: string;
  image: string;
  link?: string;
}

/* ── Constants ────────────────────────────────────────────── */
const BRANCHES = [
  "Computer Science & Engineering", "Electronics & Communication Engineering",
  "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
  "Information Technology", "Chemical Engineering", "Aerospace Engineering",
  "Biotechnology", "Other",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year (Integrated)"];

const DEFAULT_INTERESTS = ["Machine Learning", "System Design", "UI/UX", "Web3", "Product Management"];
const DEFAULT_PROJECTS: Project[] = [
  { id: "1", title: "Campus Navigation AR", role: "Lead Developer", desc: "An augmented reality app helping freshmen navigate the campus buildings.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
  { id: "2", title: "Smart Canteen POS", role: "UI Designer", desc: "Redesigned the cafeteria point-of-sale system reducing queue times by 30%.", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=600&q=80" },
];

/* ── localStorage helpers ─────────────────────────────────── */
function loadLocal<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function saveLocal(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ── Edit Profile Modal ───────────────────────────────────── */
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, completeProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "", college: user?.college ?? "", branch: user?.branch ?? "",
    year: user?.year ?? "", phone: user?.phone ?? "", bio: user?.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim().length >= 2 && form.college.trim().length >= 2;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    completeProfile({ name: form.name.trim(), college: form.college.trim(), branch: form.branch, year: form.year, phone: form.phone.trim(), bio: form.bio.trim() } as StudentProfile & { name: string });
    setSaving(false); setSaved(true);
    setTimeout(() => onClose(), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div><h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2><p className="text-xs text-slate-500 mt-0.5">Changes are saved immediately</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-7 pt-5 pb-3 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              {form.name ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow"><Camera className="h-3 w-3" /></button>
          </div>
          <div><p className="text-sm font-semibold text-slate-900">{user?.badge}</p><p className="text-xs text-slate-500">{user?.email}</p></div>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-4 space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" value={form.name} onChange={e => set("name", e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">College / University <span className="text-red-500">*</span></label>
            <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" value={form.college} onChange={e => set("college", e.target.value)} /></div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
              <Select value={form.branch} onValueChange={v => set("branch", v)}>
                <SelectTrigger className="h-11 bg-slate-50"><div className="flex items-center gap-2 min-w-0"><BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" /><SelectValue placeholder="Branch" /></div></SelectTrigger>
                <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
              <Select value={form.year} onValueChange={v => set("year", v)}>
                <SelectTrigger className="h-11 bg-slate-50"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" /><SelectValue placeholder="Year" /></div></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" value={form.phone} onChange={e => set("phone", e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" value={form.bio} onChange={e => set("bio", e.target.value)} /></div>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-none px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className={cn("flex-1 h-11 font-bold", saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700")} disabled={!valid || saving} onClick={handleSave}>
            {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
              : saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
              : <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Project Add/Edit Modal ───────────────────────────────── */
function ProjectModal({ initial, onSave, onClose }: { initial?: Project; onSave: (p: Project) => void; onClose: () => void }) {
  const [form, setForm] = useState<Project>(initial ?? { id: crypto.randomUUID(), title: "", role: "", desc: "", image: "", link: "" });
  const set = (k: keyof Project, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim().length >= 2 && form.role.trim().length >= 1 && form.desc.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">{initial ? "Edit Project" : "Add Project"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">
          {/* Image preview */}
          {form.image && (
            <div className="h-32 rounded-xl overflow-hidden border border-slate-100">
              <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          )}
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title <span className="text-red-500">*</span></label>
            <Input className="h-11 bg-slate-50" placeholder="e.g. Campus Navigation AR" value={form.title} onChange={e => set("title", e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Role <span className="text-red-500">*</span></label>
            <Input className="h-11 bg-slate-50" placeholder="e.g. Lead Developer, Designer, Co-founder…" value={form.role} onChange={e => set("role", e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="What does this project do? What problem does it solve?" value={form.desc} onChange={e => set("desc", e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Cover Image URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative"><ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="https://..." value={form.image} onChange={e => set("image", e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Project Link <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="https://github.com/..." value={form.link ?? ""} onChange={e => set("link", e.target.value)} /></div></div>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-none px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-11 font-bold bg-blue-600 hover:bg-blue-700" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>
            <span className="flex items-center gap-2"><Save className="h-4 w-4" /> {initial ? "Save Changes" : "Add Project"}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Interests & Skills section ───────────────────────────── */
function InterestsSection({ storageKey }: { storageKey: string }) {
  const [tags, setTags] = useState<string[]>(() => loadLocal(storageKey, DEFAULT_INTERESTS));
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveLocal(storageKey, tags); }, [tags, storageKey]);
  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setInput(""); setAdding(false);
  };
  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          className="group flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
          <span className="text-xs font-semibold text-slate-700">{tag}</span>
          <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-slate-400 hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      ))}

      <AnimatePresence>
        {adding ? (
          <motion.div key="input" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1">
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addTag(); if (e.key === "Escape") { setAdding(false); setInput(""); } }}
              placeholder="e.g. Cricket, Guitar, ML…"
              className="h-7 text-xs rounded-full border border-blue-400 bg-blue-50 px-3 py-1 outline-none w-36 focus:ring-1 focus:ring-blue-400"
            />
            <button onClick={addTag} className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
              <Plus className="h-3 w-3" />
            </button>
            <button onClick={() => { setAdding(false); setInput(""); }} className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ) : (
          <motion.button key="add-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 bg-white border border-dashed border-slate-300 text-slate-500 font-semibold rounded-full px-3 py-1 text-xs hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Plus className="h-3 w-3" /> Add Interest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Project Showcase section ─────────────────────────────── */
function ProjectsSection({ storageKey }: { storageKey: string }) {
  const [projects, setProjects] = useState<Project[]>(() => loadLocal(storageKey, DEFAULT_PROJECTS));
  const [editing, setEditing] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => { saveLocal(storageKey, projects); }, [projects, storageKey]);

  const saveProject = (p: Project) => {
    setProjects(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);
  };
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

  return (
    <>
      <AnimatePresence>
        {(adding || editing) && (
          <ProjectModal
            key="project-modal"
            initial={editing ?? undefined}
            onSave={saveProject}
            onClose={() => { setAdding(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(proj => (
          <motion.div key={proj.id} layout>
            <Card className="overflow-hidden border-none shadow-sm group cursor-pointer h-full">
              <div className="h-40 bg-slate-200 relative overflow-hidden">
                {proj.image ? (
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 hover:bg-white border-none font-bold backdrop-blur-sm shadow-sm text-xs">
                  {proj.role}
                </Badge>
                {/* Edit/Delete overlay buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(proj)}
                    className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white shadow">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteProject(proj.id)}
                    className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-red-500 hover:bg-white shadow">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white tracking-tight leading-tight">{proj.title}</h3>
              </div>
              <CardContent className="p-5 bg-white border border-t-0 border-slate-100 rounded-b-xl">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{proj.desc}</p>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-white"><AvatarFallback className="text-xs bg-blue-100 text-blue-700">A</AvatarFallback></Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white"><AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">B</AvatarFallback></Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white"><AvatarFallback className="text-xs bg-violet-100 text-violet-700">C</AvatarFallback></Avatar>
                  </div>
                  {proj.link ? (
                    <a href={proj.link} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-semibold text-xs h-8">
                        View Project <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-semibold text-xs h-8" onClick={() => setEditing(proj)}>
                      Edit <Pencil className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Add Project card */}
        <motion.button layout onClick={() => setAdding(true)}
          className="border-2 border-dashed border-slate-200 rounded-2xl h-[240px] flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/40 transition-all group">
          <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
            <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-600 group-hover:text-blue-700 transition-colors">Add Project</p>
            <p className="text-xs text-slate-400 mt-0.5">Showcase your work, any domain</p>
          </div>
        </motion.button>
      </div>
    </>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const name     = user?.name     ?? "Student";
  const initials = user?.initials ?? "ST";
  const badge    = user?.badge    ?? "Student";
  const college  = user?.college  ?? "—";
  const branch   = user?.branch   ?? "—";
  const year     = user?.year     ?? "—";
  const bio      = user?.bio      ?? "";
  const storagePrefix = `cc_profile_${user?.email ?? "guest"}`;

  const badgeColor =
    badge === "System Admin"     ? "bg-violet-100 text-violet-800"  :
    badge === "Moderator"        ? "bg-emerald-100 text-emerald-800" :
    badge === "Gold Contributor" ? "bg-amber-100 text-amber-800"    :
    "bg-blue-100 text-blue-800";

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <AnimatePresence>{editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}</AnimatePresence>

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-3">
        <Tabs defaultValue="profile" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="dashboard" className="text-slate-600">Dashboard</TabsTrigger>
            <TabsTrigger value="study" className="text-slate-600">Study Hub</TabsTrigger>
            <TabsTrigger value="profile" className="font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 shadow-sm">Profile</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-5xl mx-auto p-8 space-y-8">

        {/* Header */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          </div>
          <CardContent className="p-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 mb-6">
              <div className="flex items-end gap-5">
                <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold">
                  {initials}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
                    <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
                  </div>
                  <Badge className={cn("border-none font-bold text-xs uppercase tracking-wider mb-2", badgeColor)}>
                    <Star className="h-3 w-3 mr-1 fill-current" /> {badge}
                  </Badge>
                  {bio && <p className="text-sm text-slate-500 max-w-sm leading-relaxed mt-1">"{bio}"</p>}
                </div>
              </div>
              <div className="flex gap-3 pb-2">
                <Button variant="outline" className="border-slate-200 text-slate-700 font-semibold shadow-sm">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm" onClick={() => setEditOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-slate-400" /><span>{branch !== "—" ? `${branch} · ${year}` : year}</span></div>
              <div className="flex items-center gap-2"><Building className="h-4 w-4 text-slate-400" /><span>{college}</span></div>
              {user?.email && <div className="flex items-center gap-2"><Code className="h-4 w-4 text-slate-400" /><span>{user.email}</span></div>}
            </div>
          </CardContent>
        </Card>

        {/* Reputation + Interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" /> Reputation Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between">
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1 mr-4">
                  <ThumbsUp className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-slate-900">1.2k</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Helpful Votes</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                  <Star className="h-6 w-6 text-amber-500 mx-auto mb-2 fill-current" />
                  <p className="text-2xl font-black text-slate-900">4.9</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Seller Rating</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-bold text-slate-900">Contribution Level</p>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold border-none text-[10px]">TOP 1%</Badge>
                </div>
                <Progress value={85} className="h-2.5 bg-slate-100 [&>div]:bg-blue-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 text-right">Next badge: Diamond Peer Mentor (150 votes to go)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" /> Interests & Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <InterestsSection storageKey={`${storagePrefix}_interests`} />
              {bio && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative mt-4">
                  <Code className="absolute top-4 left-4 h-6 w-6 text-indigo-200" />
                  <p className="text-sm font-medium text-indigo-900 italic pl-8 leading-relaxed">"{bio}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Showcase */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Project Showcase</h2>
            <p className="text-xs text-slate-400">Hover a project card to edit or delete it</p>
          </div>
          <ProjectsSection storageKey={`${storagePrefix}_projects`} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> Uploaded Notes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 font-semibold">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { color: "red", name: "Advanced DB Queries.pdf", course: "CS305", time: "2 weeks ago", dl: 142 },
                { color: "orange", name: "ML Exam Cheatsheet.ppt", course: "CS405", time: "1 month ago", dl: 89 },
                { color: "blue", name: "Network Protocols.docx", course: "CS302", time: "2 months ago", dl: 415 },
              ].map((note, i) => (
                <div key={i} className={cn("p-4 flex items-center justify-between hover:bg-slate-50 transition-colors", i < 2 && "border-b border-slate-50")}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded bg-${note.color}-50 text-${note.color}-600`}><FileText className="h-4 w-4" /></div>
                    <div><p className="text-sm font-bold text-slate-900">{note.name}</p><p className="text-xs text-slate-500 font-medium">{note.course} • {note.time}</p></div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded"><Download className="h-3 w-3" /> {note.dl}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-600" /> Marketplace Listings
              </CardTitle>
              <Button size="sm" className="text-xs bg-slate-900 text-white hover:bg-slate-800 h-8 font-semibold"><Plus className="mr-1 h-3 w-3" /> Post New</Button>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              {[
                { img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80", title: "Physics Vol 1 & 2 - Resnick Halliday", price: "₹600", time: "3 days ago" },
                { img: "https://images.unsplash.com/photo-1585675100414-22b04fbb3530?w=200&q=80", title: "Engineering Drawing Kit", price: "₹850", time: "1 week ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden shrink-0"><img src={item.img} alt={item.title} className="h-full w-full object-cover" /></div>
                  <div className="flex-1"><h4 className="text-sm font-bold text-slate-900 leading-tight">{item.title}</h4><p className="text-sm font-black text-blue-600 mt-1">{item.price}</p><p className="text-xs text-slate-500 mt-0.5 font-medium">Listed {item.time}</p></div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><Eye className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
