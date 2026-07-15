/**
 * Profile Page — redesigned to match the CollegeConnect design system.
 * Layout: cover + identity header → 4-stat row → two-column body
 * (left sidebar: Campus Match, Career, Community) (right: Interests, Projects, Notes + Listings)
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Share2, Edit2, Building, GraduationCap,
  Award, Code, BookOpen, Download, FileText,
  Plus, ChevronRight, Eye, User, Phone, X, Save,
  Camera, Pencil, Trash2, Image as ImageIcon,
  Sparkles, Link as LinkIcon, AtSign, Briefcase,
  Users, Handshake, Search, Star, BadgeCheck,
  Github, Globe, Heart, Zap, Clock, TrendingUp,
  MessageCircle, ThumbsUp, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  studyGroup: true, projectCollaboration: false, roommate: false,
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

/* ── Campus Match Edit Modal ──────────────────────────────── */
const STUDY_STYLES = ["Flexible", "Morning Person", "Night Owl", "Weekends Only", "Daily Sessions"];
const LOOKING_FOR_OPTIONS = ["Study Buddy", "Project Partner", "Roommate", "Mentor", "Co-founder", "Freelance"];
const AVAILABILITY_OPTIONS = ["Available Weekends", "Available Evenings", "Flexible Schedule", "Weekdays Only"];

interface CampusMatchPrefs {
  studyStyle: string;
  lookingFor: string[];
  availability: string;
}

function CampusMatchModal({ prefs, onSave, onClose }: { prefs: CampusMatchPrefs; onSave: (p: CampusMatchPrefs) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<CampusMatchPrefs>({ ...prefs });
  const toggleLookingFor = (item: string) =>
    setDraft(d => ({ ...d, lookingFor: d.lookingFor.includes(item) ? d.lookingFor.filter(x => x !== item) : [...d.lookingFor, item] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div><h2 className="text-lg font-extrabold text-slate-900">Campus Match Preferences</h2><p className="text-xs text-slate-500 mt-0.5">How you like to study and collaborate</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Study Style</p>
            <div className="flex flex-wrap gap-2">
              {STUDY_STYLES.map(s => (
                <button key={s} onClick={() => setDraft(d => ({ ...d, studyStyle: s }))}
                  className={cn("text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    draft.studyStyle === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Looking For</p>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map(o => {
                const active = draft.lookingFor.includes(o);
                return (
                  <button key={o} onClick={() => toggleLookingFor(o)}
                    className={cn("text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                      active ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300")}>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Availability</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map(a => (
                <button key={a} onClick={() => setDraft(d => ({ ...d, availability: a }))}
                  className={cn("text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    draft.availability === a ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400")}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-none px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-11 font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => { onSave(draft); onClose(); }}>
            <Save className="h-4 w-4 mr-2" />Save Preferences
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [addingProject, setAddingProject] = useState(false);
  const [campusMatchOpen, setCampusMatchOpen] = useState(false);

  const name     = user?.name     ?? "Student";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const badge    = user?.badge    ?? "Student";
  const email    = user?.email    ?? "";
  const rollNo   = email ? extractRollNo(email) : "";
  const bio      = user?.bio      ?? "";
  const college  = user?.college  ?? "Demo Engineering College";

  const storagePrefix = `cc_profile_${email || "guest"}`;

  /* ── Interests ── */
  const [interests, setInterests] = useState<string[]>(() => loadLocal(`${storagePrefix}_interests`, DEFAULT_INTERESTS));
  useEffect(() => { saveLocal(`${storagePrefix}_interests`, interests); }, [interests, storagePrefix]);

  /* ── Projects ── */
  const [projects, setProjects] = useState<Project[]>(() => loadLocal(`${storagePrefix}_projects`, DEFAULT_PROJECTS));
  useEffect(() => { saveLocal(`${storagePrefix}_projects`, projects); }, [projects, storagePrefix]);
  const saveProject = (p: Project) => setProjects(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

  /* ── Campus Match ── */
  const [campusPrefs, setCampusPrefs] = useState<CampusMatchPrefs>(() =>
    loadLocal(`${storagePrefix}_campusMatch`, { studyStyle: "Flexible", lookingFor: ["Study Buddy"], availability: "Available Weekends" })
  );
  useEffect(() => { saveLocal(`${storagePrefix}_campusMatch`, campusPrefs); }, [campusPrefs, storagePrefix]);

  /* ── Profile completeness ── */
  const completenessFields = [name !== "Student", !!bio, !!college, interests.length > 0, projects.length > 0];
  const completeness = Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100);

  const badgeColor =
    badge === "System Admin"     ? "from-violet-500 to-purple-600"  :
    badge === "Moderator"        ? "from-emerald-500 to-teal-600"   :
    badge === "Gold Contributor" ? "from-amber-400 to-orange-500"   :
    "from-blue-500 to-indigo-600";

  const badgeBg =
    badge === "System Admin"     ? "bg-violet-100 text-violet-700"  :
    badge === "Moderator"        ? "bg-emerald-100 text-emerald-700" :
    "bg-blue-100 text-blue-700";

  /* ── Demo notes ── */
  const DEMO_NOTES = [
    { color: "text-red-600 bg-red-50", icon: "📄", name: "Advanced DB Queries.pdf", course: "CS305", dl: 142 },
    { color: "text-orange-500 bg-orange-50", icon: "📊", name: "ML Exam Cheatsheet.ppt", course: "CS405", dl: 89 },
    { color: "text-blue-600 bg-blue-50", icon: "📝", name: "Network Protocols.docx", course: "CS302", dl: 415 },
  ];

  /* ── Demo listings ── */
  const DEMO_LISTINGS = [
    { name: "Physics — Resnick Halliday", price: "₹600", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&q=80" },
    { name: "Engineering Drawing Kit", price: "₹850", image: "" },
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#f4f5f7]">
      {/* Modals */}
      <AnimatePresence>
        {editOpen && <EditProfileModal key="edit" onClose={() => setEditOpen(false)} />}
        {interestsOpen && <InterestsEditModal key="interests" tags={interests} onSave={setInterests} onClose={() => setInterestsOpen(false)} />}
        {(addingProject || editingProject) && (
          <ProjectModal key="project" initial={editingProject ?? undefined}
            onSave={saveProject} onClose={() => { setAddingProject(false); setEditingProject(null); }} />
        )}
        {campusMatchOpen && (
          <CampusMatchModal key="campusMatch" prefs={campusPrefs} onSave={setCampusPrefs} onClose={() => setCampusMatchOpen(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* ── Identity Card ── */}
        <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white rounded-2xl">
          {/* Cover */}
          <div className={`h-32 bg-gradient-to-r from-[#1e2a5e] via-[#2d3a7a] to-[#3b4fa8] relative`}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="outline" size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-8 text-xs backdrop-blur-sm">
                <Share2 className="h-3.5 w-3.5 mr-1.5" />Share
              </Button>
              <Button size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs font-semibold"
                onClick={() => setEditOpen(true)}>
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit Profile
              </Button>
            </div>
          </div>

          <CardContent className="px-6 pb-6 pt-0">
            {/* Avatar + name row */}
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="relative flex-shrink-0">
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${badgeColor} flex items-center justify-center text-white text-2xl font-extrabold shadow-lg border-4 border-white`}>
                  {initials}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{name}</h1>
                  <BadgeCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide", badgeBg)}>
                    {badge}
                  </span>
                  {rollNo && (
                    <span className="text-xs font-bold text-slate-400">#{rollNo}</span>
                  )}
                </div>
                {bio && <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{bio}</p>}
              </div>
            </div>

            {/* Social links row */}
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors mb-4">
              <Plus className="h-3.5 w-3.5" />Add social links
            </button>

            {/* Profile completeness bar */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-800">Profile {completeness}% complete</span>
                <button onClick={() => setEditOpen(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                  Complete <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <FileText className="h-4 w-4 text-slate-500" />, value: DEMO_NOTES.length, label: "Notes Shared" },
            { icon: <ThumbsUp className="h-4 w-4 text-slate-500" />, value: user?.reputationScore ?? 1248, label: "Reputation" },
            { icon: <BookOpen className="h-4 w-4 text-slate-500" />, value: DEMO_LISTINGS.length, label: "Listings" },
            { icon: <Code className="h-4 w-4 text-slate-500" />, value: projects.length, label: "Projects" },
          ].map(({ icon, value, label }) => (
            <Card key={label} className="border border-slate-200 shadow-sm bg-white rounded-xl">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="mb-1">{icon}</div>
                <p className="text-2xl font-black text-slate-900 leading-none">{value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Campus Match card */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="px-5 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-bold text-slate-900">Campus Match</span>
                </div>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Find</button>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Study Style</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">{campusPrefs.studyStyle}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Looking For</p>
                  <div className="flex flex-wrap gap-1.5">
                    {campusPrefs.lookingFor.map(l => (
                      <span key={l} className="text-xs font-bold bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{campusPrefs.availability}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full h-9 text-xs font-semibold mt-1 border-slate-200 text-slate-600"
                  onClick={() => setCampusMatchOpen(true)}>
                  Edit preferences
                </Button>
              </CardContent>
            </Card>

            {/* Career card */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="px-5 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">Career</span>
                </div>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Jobs</button>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors">
                  <Plus className="h-4 w-4" />Add career goal
                </button>
              </CardContent>
            </Card>

            {/* Community card */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="px-5 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-900">Community</span>
                </div>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Feed</button>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-500">4</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Communities</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-slate-700">1.2k</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Rep</p>
                  </div>
                </div>
                {/* Activity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <MessageCircle className="h-3.5 w-3.5 text-slate-400" />Replied in #study-tips
                    </span>
                    <span className="text-slate-400">2h</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <ThumbsUp className="h-3.5 w-3.5 text-slate-400" />Post liked 12 times
                    </span>
                    <span className="text-slate-400">1d</span>
                  </div>
                </div>
                {/* Badge */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-700">TOP 1% Contributor</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT MAIN ── */}
          <div className="space-y-4">

            {/* Interests & Skills */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="px-6 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-900">Interests & Skills</span>
                </div>
                <button onClick={() => setInterestsOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                  <Pencil className="h-3 w-3" />Edit
                </button>
              </CardHeader>
              <CardContent className="px-6 py-4">
                {interests.length === 0 ? (
                  <button onClick={() => setInterestsOpen(true)} className="text-xs text-slate-400 hover:text-blue-600 italic">
                    + Add your skills and interests
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((tag, i) => (
                      <motion.span key={tag} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer">
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="px-6 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">Projects</span>
                </div>
                <button onClick={() => setAddingProject(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                  <Plus className="h-3.5 w-3.5" />Add
                </button>
              </CardHeader>
              <CardContent className="px-6 py-4">
                {projects.length === 0 ? (
                  <button onClick={() => setAddingProject(true)}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-600 italic transition-colors">
                    <Plus className="h-4 w-4" />Add your first project
                  </button>
                ) : (
                  <div className="space-y-3">
                    {projects.map(proj => (
                      <div key={proj.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {proj.image ? (
                            <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Code className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{proj.title}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">{proj.role}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.desc}</p>
                        </div>
                        {/* Edit/delete */}
                        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start pt-0.5">
                          <button onClick={() => setEditingProject(proj)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteProject(proj.id)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Shared + Listings (side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Notes Shared */}
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="px-5 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-bold text-slate-900">Notes Shared</span>
                  </div>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</button>
                </CardHeader>
                <CardContent className="p-0">
                  {DEMO_NOTES.map((note, i) => (
                    <div key={i} className={cn("px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors", i < DEMO_NOTES.length - 1 && "border-b border-slate-50")}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0", note.color)}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{note.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{note.course}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-500 flex-shrink-0">
                        <Download className="h-3 w-3" />{note.dl}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Listings */}
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="px-5 py-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-900">Listings</span>
                  </div>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus className="h-3 w-3" />Post
                  </button>
                </CardHeader>
                <CardContent className="p-0">
                  {DEMO_LISTINGS.map((listing, i) => (
                    <div key={i} className={cn("px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors", i < DEMO_LISTINGS.length - 1 && "border-b border-slate-50")}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {listing.image ? (
                          <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{listing.name}</p>
                        <p className="text-xs font-bold text-blue-600 mt-0.5">{listing.price}</p>
                      </div>
                      <button className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
