import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Share2, Edit2, MapPin, Building, GraduationCap,
  ThumbsUp, Star, Award, Code, BookOpen, Download, FileText,
  Plus, ChevronRight, Eye, User, Phone, X, Save,
  CalendarDays, Camera,
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

/* ── static mock data ─────────────────────────────────────── */
const mockProjects = [
  { id: "1", title: "Campus Navigation AR", role: "Lead Developer", desc: "An augmented reality app helping freshmen navigate the campus buildings.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
  { id: "2", title: "Smart Canteen POS", role: "UI Designer", desc: "Redesigned the cafeteria point-of-sale system reducing queue times by 30%.", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=600&q=80" },
];

const BRANCHES = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Information Technology",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biotechnology",
  "Other",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year (Integrated)"];

/* ── Edit Profile Modal ───────────────────────────────────── */
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, completeProfile } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    college: user?.college ?? "",
    branch: user?.branch ?? "",
    year: user?.year ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim().length >= 2 && form.college.trim().length >= 2;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    completeProfile({
      name: form.name.trim(),
      college: form.college.trim(),
      branch: form.branch,
      year: form.year,
      phone: form.phone.trim(),
      bio: form.bio.trim(),
    } as StudentProfile & { name: string });
    setSaving(false);
    setSaved(true);
    setTimeout(() => onClose(), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Changes are saved immediately</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar section */}
        <div className="px-7 pt-5 pb-3 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              {form.name ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{user?.badge}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 px-7 py-4 space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="e.g. Aryan Sharma"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
          </div>

          {/* College */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              College / University <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="e.g. IIT Bombay"
                value={form.college} onChange={e => set("college", e.target.value)} />
            </div>
          </div>

          {/* Branch + Year row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
              <Select value={form.branch} onValueChange={v => set("branch", v)}>
                <SelectTrigger className="h-11 bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder="Branch" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
              <Select value={form.year} onValueChange={v => set("year", v)}>
                <SelectTrigger className="h-11 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder="Year" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-11 pl-10 bg-slate-50" placeholder="+91 98765 43210"
                value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Bio <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea rows={3}
              placeholder="Tell your peers a bit about yourself..."
              className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.bio}
              onChange={e => set("bio", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-none px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button
            className={cn(
              "flex-1 h-11 font-bold",
              saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"
            )}
            disabled={!valid || saving}
            onClick={handleSave}
          >
            {saved ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
            ) : saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>
            )}
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

  const name     = user?.name     ?? "Student";
  const initials = user?.initials ?? "ST";
  const badge    = user?.badge    ?? "Student";
  const college  = user?.college  ?? "—";
  const branch   = user?.branch   ?? "—";
  const year     = user?.year     ?? "—";
  const bio      = user?.bio      ?? "";

  const badgeColor =
    badge === "System Admin"   ? "bg-violet-100 text-violet-800"  :
    badge === "Moderator"      ? "bg-emerald-100 text-emerald-800" :
    badge === "Gold Contributor" ? "bg-amber-100 text-amber-800"  :
    "bg-blue-100 text-blue-800";

  return (
    <div className="flex-1 min-h-screen bg-slate-50">

      {/* Edit modal */}
      <AnimatePresence>
        {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      </AnimatePresence>

      {/* Top tab bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-3 flex items-center justify-between">
        <Tabs defaultValue="profile" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="dashboard" className="text-slate-600">Dashboard</TabsTrigger>
            <TabsTrigger value="study" className="text-slate-600">Study Hub</TabsTrigger>
            <TabsTrigger value="profile" className="font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 shadow-sm">Profile</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-5xl mx-auto p-8 space-y-8">

        {/* ── Profile Header ── */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          </div>
          <CardContent className="p-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 mb-6">
              <div className="flex items-end gap-5">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold">
                    {initials}
                  </div>
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
                    <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
                  </div>
                  <Badge className={cn("border-none font-bold text-xs uppercase tracking-wider mb-2", badgeColor)}>
                    <Star className="h-3 w-3 mr-1 fill-current" /> {badge}
                  </Badge>
                  {bio && (
                    <p className="text-sm text-slate-500 max-w-sm leading-relaxed mt-1">"{bio}"</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pb-2">
                <Button variant="outline" className="border-slate-200 text-slate-700 font-semibold shadow-sm">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>{branch !== "—" ? `${branch} · ${year}` : year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-400" />
                <span>{college}</span>
              </div>
              {user?.email && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Two Column: Reputation + Interests ── */}
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
                <BookOpen className="h-5 w-5 text-indigo-600" /> Academic Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-8">
                {["Machine Learning", "System Design", "UI/UX", "Web3", "Product Management"].map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-semibold px-3 py-1 text-xs">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="bg-white border-dashed border-slate-300 text-slate-500 font-semibold px-3 py-1 text-xs cursor-pointer hover:bg-slate-50">
                  <Plus className="h-3 w-3 mr-1" /> Add Skill
                </Badge>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative">
                <Code className="absolute top-4 left-4 h-6 w-6 text-indigo-200" />
                <p className="text-sm font-medium text-indigo-900 italic pl-8 leading-relaxed">
                  {bio || "I believe the best way to learn is by teaching. Building tools that help my peers navigate campus life more efficiently."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Project Showcase ── */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Project Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockProjects.map(proj => (
              <Card key={proj.id} className="overflow-hidden border-none shadow-sm group cursor-pointer">
                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 hover:bg-white border-none font-bold backdrop-blur-sm shadow-sm text-xs">
                    {proj.role}
                  </Badge>
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
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-semibold text-xs h-8">
                      View Project <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Bottom Row ── */}
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
                    <div className={`p-2 bg-${note.color}-50 text-${note.color}-600 rounded`}><FileText className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{note.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{note.course} • {note.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    <Download className="h-3 w-3" /> {note.dl}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-600" /> Marketplace Listings
              </CardTitle>
              <Button size="sm" className="text-xs bg-slate-900 text-white hover:bg-slate-800 h-8 font-semibold">
                <Plus className="mr-1 h-3 w-3" /> Post New
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              {[
                { img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80", title: "Physics Vol 1 & 2 - Resnick Halliday", price: "₹600", time: "3 days ago" },
                { img: "https://images.unsplash.com/photo-1585675100414-22b04fbb3530?w=200&q=80", title: "Engineering Drawing Kit", price: "₹850", time: "1 week ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                    <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.title}</h4>
                    <p className="text-sm font-black text-blue-600 mt-1">{item.price}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Listed {item.time}</p>
                  </div>
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
