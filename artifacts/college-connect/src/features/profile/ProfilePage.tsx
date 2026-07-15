/**
 * Profile Page — redesigned for Community, Career, and Campus Match integration.
 * Shows roll number (extracted from email), skills, projects, "Open To" status,
 * and optional contact links — all info future features can consume.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Share2, Edit2, Building, GraduationCap,
  Award, Code, BookOpen, Download, FileText,
  Plus, ChevronRight, Eye, User, Phone, X, Save,
  Camera, Pencil, Trash2, Image as ImageIcon,
  Sparkles, Link as LinkIcon, AtSign, Briefcase,
  Users, Handshake, Search, Star, BadgeCheck,
  Instagram, Github, Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/* ── Utility ──────────────────────────────────────────────── */
function extractRollNo(email: string): string {
  return email.split("@")[0] ?? "";
}

/* ── Types ────────────────────────────────────────────────── */
interface Project {
  id: string;
  title: string;
  role: string;
  desc: string;
  image: string;
  link?: string;
}

interface OpenToState {
  studyGroup: boolean;
  projectCollaboration: boolean;
  roommate: boolean;
  careerMentorship: boolean;
  coFounder: boolean;
  freelance: boolean;
}

interface SocialLinks {
  instagram: string;
  linkedin: string;
  github: string;
  portfolio: string;
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
  { id: "1", title: "Campus Navigation AR", role: "Lead Developer", desc: "An augmented reality app helping freshmen navigate campus buildings.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
  { id: "2", title: "Smart Canteen POS", role: "UI Designer", desc: "Redesigned the cafeteria POS system, reducing queue times by 30%.", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=600&q=80" },
];
const DEFAULT_OPEN_TO: OpenToState = {
  studyGroup: false, projectCollaboration: false, roommate: false,
  careerMentorship: false, coFounder: false, freelance: false,
};
const DEFAULT_SOCIAL: SocialLinks = { instagram: "", linkedin: "", github: "", portfolio: "" };

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
  const valid = form.name.trim().length >= 2;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    completeProfile({ name: form.name.trim(), college: form.college.trim(), branch: form.branch, year: form.year, phone: form.phone.trim(), bio: form.bio.trim() });
    setSaving(false); setSaved(true);
    setTimeout(() => onClose(), 800);
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
          <div><h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2><p className="text-xs text-slate-500 mt-0.5">Changes save immediately</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">
          <div className="flex items-center gap-4 pb-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
                {form.name ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow"><Camera className="h-3 w-3" /></button>
            </div>
            <div><p className="text-sm font-semibold text-slate-900">{user?.badge}</p><p className="text-xs text-slate-500">{user?.email}</p></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" value={form.name} onChange={e => set("name", e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">College / University</label>
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
                <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="Shown on your profile" value={form.phone} onChange={e => set("phone", e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Tell others who you are — interests, goals, what you're building…"
              value={form.bio} onChange={e => set("bio", e.target.value)} /></div>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-none px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className={cn("flex-1 h-11 font-bold", saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700")} disabled={!valid || saving} onClick={handleSave}>
            {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Saved!</span>
              : saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
              : <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Changes</span>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Interests section ────────────────────────────────────── */
const INTEREST_SUGGESTIONS: { category: string; emoji: string; items: string[] }[] = [
  { category: "Tech & Coding", emoji: "💻", items: ["Machine Learning","Web Development","App Development","UI/UX Design","Cybersecurity","Blockchain","Data Science","Open Source","Game Dev","DevOps"] },
  { category: "Science & Research", emoji: "🔬", items: ["Physics","Chemistry","Biology","Robotics","Electronics","Nanotechnology","Environmental Science"] },
  { category: "Business & Career", emoji: "📈", items: ["Product Management","Entrepreneurship","Finance","Marketing","Consulting","Startups","Leadership","Stock Market"] },
  { category: "Arts & Creative", emoji: "🎨", items: ["Photography","Video Editing","Graphic Design","Music","Writing","Film Making","Content Creation"] },
  { category: "Sports & Fitness", emoji: "⚽", items: ["Cricket","Football","Basketball","Badminton","Chess","Swimming","Running","Gym","Yoga"] },
  { category: "Social & Community", emoji: "🌍", items: ["NSS","NCC","Volunteering","Social Impact","Debate","Public Speaking","Teaching"] },
];

function InterestsEditModal({ tags, onSave, onClose }: { tags: string[]; onSave: (t: string[]) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<string[]>([...tags]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toggle = (item: string) => setDraft(prev => prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]);
  const addCustom = () => {
    const t = input.trim();
    if (t && !draft.includes(t)) setDraft(prev => [...prev, t]);
    setInput(""); inputRef.current?.focus();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div><h2 className="text-xl font-extrabold text-slate-900">Edit Skills & Interests</h2><p className="text-xs text-slate-500 mt-0.5">Pick from suggestions or type your own</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-7 pt-4 pb-3 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Your skills ({draft.length})</p>
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            <AnimatePresence>
              {draft.length === 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-400 italic py-1">None yet — pick from below or add your own</motion.p>}
              {draft.map(tag => (
                <motion.div key={tag} initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1">
                  <span className="text-xs font-semibold">{tag}</span>
                  <button onClick={() => toggle(tag)} className="ml-0.5 text-blue-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
                placeholder="Type anything — Cricket, Guitar, Startups…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <Button size="sm" className="h-9 px-4 bg-blue-600 hover:bg-blue-700" onClick={addCustom} disabled={!input.trim()}>Add</Button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-4 space-y-5">
          {INTEREST_SUGGESTIONS.map(({ category, emoji, items }) => (
            <div key={category}>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">{emoji} {category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => {
                  const active = draft.includes(item);
                  return (
                    <button key={item} onClick={() => toggle(item)}
                      className={cn("text-xs font-semibold rounded-full px-3 py-1.5 border transition-all",
                        active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600")}>
                      {active && "✓ "}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{draft.length} selected</p>
          <div className="flex gap-3">
            <Button variant="outline" className="px-5 h-11" onClick={onClose}>Cancel</Button>
            <Button className="px-6 h-11 font-bold bg-blue-600 hover:bg-blue-700" onClick={() => { onSave(draft); onClose(); }}>
              <Save className="h-4 w-4 mr-2" />Save
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Project modal ────────────────────────────────────────── */
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
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">
          {form.image && <div className="h-32 rounded-xl overflow-hidden border border-slate-100"><img src={form.image} alt="" className="w-full h-full object-cover" /></div>}
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title *</label>
            <Input className="h-11 bg-slate-50" placeholder="e.g. Campus Navigation AR" value={form.title} onChange={e => set("title", e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Role *</label>
            <Input className="h-11 bg-slate-50" placeholder="e.g. Lead Developer, Designer…" value={form.role} onChange={e => set("role", e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="What does this project do? What problem does it solve?" value={form.desc} onChange={e => set("desc", e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative"><ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="https://..." value={form.image} onChange={e => set("image", e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Link <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="https://github.com/..." value={form.link ?? ""} onChange={e => set("link", e.target.value)} /></div></div>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-none px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-11 font-bold bg-blue-600 hover:bg-blue-700" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>
            <Save className="h-4 w-4 mr-2" />{initial ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Open-To section ──────────────────────────────────────── */
const OPEN_TO_OPTIONS: { key: keyof OpenToState; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "studyGroup",         label: "Study Group",          icon: <BookOpen className="h-4 w-4" />,   color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "projectCollaboration", label: "Project Collaboration", icon: <Code className="h-4 w-4" />,   color: "bg-violet-50 border-violet-200 text-violet-700" },
  { key: "roommate",           label: "Roommate",             icon: <Users className="h-4 w-4" />,     color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { key: "careerMentorship",   label: "Career Mentorship",    icon: <Briefcase className="h-4 w-4" />, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "coFounder",          label: "Co-founder Search",    icon: <Handshake className="h-4 w-4" />, color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "freelance",          label: "Freelance Work",       icon: <Globe className="h-4 w-4" />,     color: "bg-rose-50 border-rose-200 text-rose-700" },
];

function OpenToSection({ storageKey }: { storageKey: string }) {
  const [openTo, setOpenTo] = useState<OpenToState>(() => loadLocal(storageKey, DEFAULT_OPEN_TO));
  useEffect(() => { saveLocal(storageKey, openTo); }, [openTo, storageKey]);
  const toggle = (key: keyof OpenToState) => setOpenTo(prev => ({ ...prev, [key]: !prev[key] }));
  const activeCount = Object.values(openTo).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Click to toggle what you're open to</p>
        {activeCount > 0 && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">{activeCount} active</Badge>}
      </div>
      <div className="flex flex-wrap gap-2">
        {OPEN_TO_OPTIONS.map(({ key, label, icon, color }) => (
          <button key={key} onClick={() => toggle(key)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-all",
              openTo[key] ? color : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}>
            {icon}{label}
            {openTo[key] && <CheckCircle2 className="h-3 w-3 ml-0.5" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Social Links section ─────────────────────────────────── */
function SocialLinksSection({ storageKey, editing, onSave }: { storageKey: string; editing: boolean; onSave?: () => void }) {
  const [links, setLinks] = useState<SocialLinks>(() => loadLocal(storageKey, DEFAULT_SOCIAL));
  const [draft, setDraft] = useState<SocialLinks>(links);
  useEffect(() => { saveLocal(storageKey, links); }, [links, storageKey]);

  if (!editing) {
    const hasLinks = Object.values(links).some(v => v.trim());
    if (!hasLinks) return null;
    return (
      <div className="flex flex-wrap gap-3">
        {links.instagram && (
          <a href={`https://instagram.com/${links.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors">
            <AtSign className="h-3.5 w-3.5" />{links.instagram}
          </a>
        )}
        {links.github && (
          <a href={`https://github.com/${links.github}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <Github className="h-3.5 w-3.5" />{links.github}
          </a>
        )}
        {links.linkedin && (
          <a href={links.linkedin.startsWith("http") ? links.linkedin : `https://linkedin.com/in/${links.linkedin}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            <LinkIcon className="h-3.5 w-3.5" />LinkedIn
          </a>
        )}
        {links.portfolio && (
          <a href={links.portfolio.startsWith("http") ? links.portfolio : `https://${links.portfolio}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
            <Globe className="h-3.5 w-3.5" />Portfolio
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[
        { key: "instagram" as const, icon: <AtSign className="h-4 w-4" />, placeholder: "@username" },
        { key: "github" as const, icon: <Github className="h-4 w-4" />, placeholder: "github-username" },
        { key: "linkedin" as const, icon: <LinkIcon className="h-4 w-4" />, placeholder: "linkedin.com/in/..." },
        { key: "portfolio" as const, icon: <Globe className="h-4 w-4" />, placeholder: "yoursite.com" },
      ].map(({ key, icon, placeholder }) => (
        <div key={key} className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
          <Input className="h-10 pl-9 bg-slate-50 text-sm capitalize" placeholder={placeholder}
            value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
        </div>
      ))}
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 px-5 font-bold"
        onClick={() => { setLinks(draft); onSave?.(); }}>
        <Save className="h-3.5 w-3.5 mr-1.5" />Save Links
      </Button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [editingLinks, setEditingLinks] = useState(false);

  const name         = user?.name     ?? "Student";
  const initials     = user?.initials ?? "ST";
  const badge        = user?.badge    ?? "Student";
  const college      = user?.college  ?? "";
  const branch       = user?.branch   ?? "";
  const year         = user?.year     ?? "";
  const bio          = user?.bio      ?? "";
  const email        = user?.email    ?? "";
  const rollNo       = email ? extractRollNo(email) : "";

  const storagePrefix = `cc_profile_${user?.email ?? "guest"}`;

  /* ── Interests ── */
  const [interests, setInterests] = useState<string[]>(() => loadLocal(`${storagePrefix}_interests`, DEFAULT_INTERESTS));
  const [interestsOpen, setInterestsOpen] = useState(false);
  useEffect(() => { saveLocal(`${storagePrefix}_interests`, interests); }, [interests, storagePrefix]);

  /* ── Projects ── */
  const [projects, setProjects] = useState<Project[]>(() => loadLocal(`${storagePrefix}_projects`, DEFAULT_PROJECTS));
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [addingProject, setAddingProject] = useState(false);
  useEffect(() => { saveLocal(`${storagePrefix}_projects`, projects); }, [projects, storagePrefix]);
  const saveProject = (p: Project) => setProjects(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

  const badgeColor =
    badge === "System Admin"     ? "from-violet-500 to-purple-600"  :
    badge === "Moderator"        ? "from-emerald-500 to-teal-600"   :
    badge === "Gold Contributor" ? "from-amber-400 to-orange-500"   :
    "from-blue-500 to-indigo-600";

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      {/* Modals */}
      <AnimatePresence>
        {editOpen && <EditProfileModal key="edit" onClose={() => setEditOpen(false)} />}
        {interestsOpen && (
          <InterestsEditModal key="interests" tags={interests} onSave={setInterests} onClose={() => setInterestsOpen(false)} />
        )}
        {(addingProject || editingProject) && (
          <ProjectModal key="project" initial={editingProject ?? undefined}
            onSave={saveProject} onClose={() => { setAddingProject(false); setEditingProject(null); }} />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* ── Cover + Identity card ── */}
        <Card className="overflow-hidden border-none shadow-md bg-white">
          {/* Cover band */}
          <div className={`h-36 bg-gradient-to-r ${badgeColor} relative`}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="outline" size="sm"
                className="bg-white/90 border-white/50 text-slate-700 hover:bg-white shadow-sm h-8 text-xs">
                <Share2 className="h-3.5 w-3.5 mr-1.5" />Share
              </Button>
              <Button size="sm"
                className="bg-white text-slate-900 hover:bg-white/90 shadow-sm h-8 text-xs font-bold"
                onClick={() => setEditOpen(true)}>
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit Profile
              </Button>
            </div>
          </div>

          <CardContent className="px-7 pb-7 pt-0">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-14 mb-5 gap-4">
              <div className="flex items-end gap-4">
                <div className={`h-28 w-28 rounded-2xl bg-gradient-to-br ${badgeColor} flex items-center justify-center text-white text-4xl font-extrabold shadow-xl border-4 border-white`}>
                  {initials}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-slate-900">{name}</h1>
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  {rollNo && (
                    <p className="text-sm font-bold text-slate-500 mt-0.5">
                      Roll No: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{rollNo}</span>
                    </p>
                  )}
                  <Badge className={cn("mt-1 text-xs font-bold border-none", `bg-gradient-to-r ${badgeColor} text-white`)}>
                    <Star className="h-3 w-3 mr-1 fill-white/80" /> {badge}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Academic info strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-5">
              {(branch || year) && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span>{[branch, year].filter(Boolean).join(" · ")}</span>
                </div>
              )}
              {college && (
                <div className="flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span>{college}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Code className="h-4 w-4" />
                  <span>{email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {bio ? (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
                <p className="text-sm text-slate-700 leading-relaxed italic">"{bio}"</p>
              </div>
            ) : (
              <button onClick={() => setEditOpen(true)}
                className="text-xs text-slate-400 hover:text-blue-600 italic mb-5 block transition-colors">
                + Add a bio to tell others about yourself
              </button>
            )}

            {/* Social links */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Links</p>
              <button onClick={() => setEditingLinks(v => !v)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                {editingLinks ? "Done" : <><Pencil className="inline h-3 w-3 mr-1" />Edit</>}
              </button>
            </div>
            <SocialLinksSection
              storageKey={`${storagePrefix}_social`}
              editing={editingLinks}
              onSave={() => setEditingLinks(false)} />
          </CardContent>
        </Card>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Award className="h-5 w-5 text-amber-500" />, value: user?.reputationScore ?? 0, label: "Rep Score", color: "bg-amber-50" },
            { icon: <FileText className="h-5 w-5 text-blue-500" />, value: projects.length, label: "Projects", color: "bg-blue-50" },
            { icon: <BookOpen className="h-5 w-5 text-emerald-500" />, value: interests.length, label: "Interests", color: "bg-emerald-50" },
          ].map(({ icon, value, label, color }) => (
            <Card key={label} className={cn("border-none shadow-sm text-center", color)}>
              <CardContent className="p-4">
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Skills & Interests ── */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />Skills & Interests
            </CardTitle>
            <button onClick={() => setInterestsOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Pencil className="h-3 w-3" />Edit
            </button>
          </CardHeader>
          <CardContent className="p-6">
            {interests.length === 0 ? (
              <button onClick={() => setInterestsOpen(true)}
                className="text-xs text-slate-400 hover:text-blue-600 italic transition-colors">
                + Add your skills and interests
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((tag, i) => (
                  <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-1 bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 rounded-full px-3 py-1.5 hover:border-blue-300 transition-colors cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">{tag}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Open To ── */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-500" />Open To
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold ml-1">for Campus Match</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <OpenToSection storageKey={`${storagePrefix}_openTo`} />
          </CardContent>
        </Card>

        {/* ── Projects ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />Project Showcase
            </h2>
            <p className="text-xs text-slate-400">Hover to edit or delete</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map(proj => (
              <motion.div key={proj.id} layout>
                <Card className="overflow-hidden border-none shadow-sm group cursor-pointer h-full hover:shadow-md transition-shadow">
                  <div className="h-40 bg-slate-200 relative overflow-hidden">
                    {proj.image ? (
                      <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 border-none font-bold text-xs shadow-sm backdrop-blur-sm">{proj.role}</Badge>
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingProject(proj)}
                        className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white shadow">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteProject(proj.id)}
                        className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-red-500 hover:bg-white shadow">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="absolute bottom-4 left-4 right-4 text-lg font-bold text-white leading-tight">{proj.title}</h3>
                  </div>
                  <CardContent className="p-5 bg-white">
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{proj.desc}</p>
                    {proj.link ? (
                      <a href={proj.link} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-semibold text-xs h-8 -ml-2">
                          View Project <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-slate-400 text-xs h-8 -ml-2" onClick={() => setEditingProject(proj)}>
                        <Pencil className="mr-1 h-3 w-3" />Add link
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {/* Add Project card */}
            <motion.button layout onClick={() => setAddingProject(true)}
              className="border-2 border-dashed border-slate-200 rounded-2xl h-[240px] flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/40 transition-all group">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600 group-hover:text-blue-700 transition-colors">Add Project</p>
                <p className="text-xs text-slate-400 mt-0.5">Showcase your work</p>
              </div>
            </motion.button>
          </div>
        </div>

        {/* ── Reputation ── */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />Reputation Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Star className="h-6 w-6 text-amber-500 mx-auto mb-2 fill-amber-500" />
                <p className="text-2xl font-black text-slate-900">{user?.reputationScore ?? 0}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Rep Score</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <BadgeCheck className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-xl font-black text-slate-900 capitalize">{user?.reputationLevel ?? "Bronze"}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Level</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-bold text-slate-900">Progress to next level</p>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold border-none text-[10px]">TOP 5%</Badge>
              </div>
              <Progress value={65} className="h-2.5 bg-slate-100 [&>div]:bg-blue-600 mb-2" />
              <p className="text-xs font-medium text-slate-500 text-right">150 points to Diamond level</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Uploaded Notes (from profile) ── */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />Uploaded Notes
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 font-semibold">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { color: "text-red-600 bg-red-50", name: "Advanced DB Queries.pdf",   course: "CS305", time: "2 weeks ago",  dl: 142 },
              { color: "text-orange-600 bg-orange-50", name: "ML Exam Cheatsheet.ppt", course: "CS405", time: "1 month ago",  dl: 89  },
              { color: "text-blue-600 bg-blue-50",  name: "Network Protocols.docx",   course: "CS302", time: "2 months ago", dl: 415 },
            ].map((note, i) => (
              <div key={i} className={cn("p-4 flex items-center justify-between hover:bg-slate-50 transition-colors", i < 2 && "border-b border-slate-50")}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", note.color)}><FileText className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{note.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{note.course} · {note.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  <Download className="h-3 w-3" />{note.dl}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
