/**
 * Study & Career Hub
 * Two modes:
 *   - Student View  → browse approved materials
 *   - Contributor Mode → upload notes/PDFs → goes to pending approval queue
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Download, Star, Eye, Clock, Zap, FileText,
  CheckCircle2, TrendingUp, Users, Briefcase, Upload,
  FilePlus, AlertCircle, X, ChevronRight, Search, ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSubmissions, type MaterialType } from "@/contexts/SubmissionsContext";
import { useAuth } from "@/contexts/AuthContext";

/* ─── static seed data (public approved materials) ────── */
const APPROVED_MATERIALS = [
  { id: "a1", title: "Data Structures & Algorithms — Complete Notes", course: "CS301", downloads: 1240, rating: 4.9, type: "pdf", color: "text-red-500 bg-red-50" },
  { id: "a2", title: "Machine Learning Midterm Review", course: "CS405", downloads: 856, rating: 4.8, type: "ppt", color: "text-orange-500 bg-orange-50" },
  { id: "a3", title: "Database Management Systems Lab Manual", course: "CS305", downloads: 642, rating: 4.6, type: "doc", color: "text-blue-500 bg-blue-50" },
  { id: "a4", title: "Computer Networks Previous Year Papers", course: "CS302", downloads: 2105, rating: 4.9, type: "pdf", color: "text-red-500 bg-red-50" },
];

const INTERNSHIPS = [
  { id: "1", title: "Frontend Developer Intern", company: "TechCorp India", salary: "₹25k/mo", status: "NEW" },
  { id: "2", title: "Data Analyst Intern", company: "DataSync Solutions", salary: "₹30k/mo", status: "OPEN" },
  { id: "3", title: "Product Design Intern", company: "Creative Minds", salary: "₹20k/mo", status: "CLOSED" },
];

const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: "notes",      label: "Lecture Notes" },
  { value: "pdf",        label: "PDF Textbook/Reference" },
  { value: "ppt",        label: "Presentation / Slides" },
  { value: "pyq",        label: "Previous Year Papers" },
  { value: "assignment", label: "Assignment" },
  { value: "lab",        label: "Lab Manual" },
  { value: "syllabus",   label: "Syllabus" },
];

const STATUS_STYLES = {
  pending:  { label: "Pending Review",  cls: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved ✓",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected",        cls: "bg-red-100 text-red-700 border-red-200" },
};

const AVATAR_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500","bg-amber-500"];

/* ─── Contributor Upload Form ───────────────────────────── */
function ContributorForm({ onSuccess }: { onSuccess: () => void }) {
  const { addSubmission } = useSubmissions();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", description: "", subject: "", course: "",
    semester: "", type: "" as MaterialType | "",
  });
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid =
    form.title.trim() &&
    form.subject.trim() &&
    form.course.trim() &&
    form.semester &&
    form.type &&
    fileName;

  const handleFakeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleFakeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // Simulate upload delay
    setTimeout(() => {
      addSubmission({
        title: form.title,
        description: form.description,
        subject: form.subject,
        course: form.course.toUpperCase(),
        semester: form.semester,
        type: form.type as MaterialType,
        fileName,
        fileSize: "—",
        uploadedBy: user?.name ?? "Anonymous",
        uploaderInitials: user?.initials ?? "?",
        uploaderColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        submittedAt: "Just now",
      });
      setSubmitting(false);
      setDone(true);
      setTimeout(onSuccess, 1800);
    }, 1000);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 space-y-3"
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Submitted for Review!</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Your material is now in the moderator's queue. It will appear in the public library once approved.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleFakeDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative",
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        )}
      >
        <input
          type="file"
          accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
          onChange={handleFakeFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {fileName ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">{fileName}</p>
              <p className="text-xs text-slate-400">Ready to upload</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFileName(""); }}
              className="ml-2 text-slate-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Drag & drop your file here</p>
            <p className="text-xs text-slate-400 mt-1">PDF, PPT, DOC, ZIP — max 50 MB</p>
            <Button type="button" variant="outline" size="sm" className="mt-4">
              <FilePlus className="h-4 w-4 mr-1.5" /> Browse Files
            </Button>
          </>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Material Title *</label>
        <Input
          placeholder="e.g. Operating Systems Unit 3 Complete Notes"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
        <textarea
          placeholder="What does this material cover? What makes it useful?"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 4 selects in a grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Type *</label>
          <Select onValueChange={(v) => set("type", v)} required>
            <SelectTrigger><SelectValue placeholder="Material type" /></SelectTrigger>
            <SelectContent>
              {MATERIAL_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Subject *</label>
          <Input
            placeholder="e.g. Computer Science"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Course Code *</label>
          <Input
            placeholder="e.g. CS401"
            value={form.course}
            onChange={(e) => set("course", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Semester *</label>
          <Select onValueChange={(v) => set("semester", v)} required>
            <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8].map((s) => (
                <SelectItem key={s} value={`Semester ${s}`}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Your submission goes into a <strong>pending review queue</strong>. A moderator or admin will approve or reject it — usually within 24 hours. Once approved, it appears in the public Study Hub.
        </p>
      </div>

      <Button
        type="submit"
        disabled={!valid || submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Submit for Review
          </span>
        )}
      </Button>
    </form>
  );
}

/* ─── My Submissions list ────────────────────────────────── */
function MySubmissions() {
  const { submissions } = useSubmissions();
  const { user } = useAuth();
  const mine = submissions.filter((s) => s.uploadedBy === (user?.name ?? ""));

  if (mine.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">You haven't submitted any materials yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {mine.map((s) => {
        const { label, cls } = STATUS_STYLES[s.status];
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900 text-sm">{s.title}</p>
                  <Badge className={cn("text-xs border flex-shrink-0", cls)}>{label}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{s.course} · {s.semester} · Submitted {s.submittedAt}</p>
                {s.reviewNote && (
                  <p className="text-xs mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                    <span className="font-semibold">Reviewer note:</span> {s.reviewNote}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Moderator quick-review panel (inline in Study Hub) ─── */
function ModReviewPanel() {
  const { submissions, approveSubmission, rejectSubmission, pendingCount } = useSubmissions();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const pending = submissions.filter(s => s.status === "pending");

  const confirm = () => {
    if (!selected || !action) return;
    if (action === "approve") approveSubmission(selected, note, user?.name ?? "Moderator");
    else rejectSubmission(selected, note, user?.name ?? "Moderator");
    setDone(action === "approve" ? "Material approved and published!" : "Material rejected.");
    setSelected(null); setAction(null); setNote("");
    setTimeout(() => setDone(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Toast */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {done}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-slate-700">
          {pendingCount === 0 ? "No pending submissions." : `${pendingCount} submission${pendingCount > 1 ? "s" : ""} awaiting your review`}
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">All caught up! No pending submissions.</p>
        </div>
      ) : (
        pending.map(sub => {
          const isOpen = selected === sub.id;
          return (
            <motion.div key={sub.id} layout className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{sub.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{sub.course}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-50 rounded text-blue-700 font-medium">{sub.type}</span>
                      <span className="text-xs text-slate-400">{sub.semester}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">by <strong>{sub.uploadedBy}</strong> · {sub.submittedAt}</p>
                    {sub.description && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">{sub.description}</p>
                    )}
                  </div>
                </div>

                {/* Quick action buttons */}
                {!isOpen && (
                  <div className="flex gap-2 mt-3 pl-11">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
                      onClick={() => { setSelected(sub.id); setAction("approve"); }}>
                      ✓ Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs font-bold"
                      onClick={() => { setSelected(sub.id); setAction("reject"); }}>
                      ✗ Reject
                    </Button>
                  </div>
                )}

                {/* Expanded confirm area */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pl-11 overflow-hidden">
                      <div className={`rounded-xl p-3 border mb-2 ${action === "approve" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                        <p className="text-xs font-semibold mb-2 text-slate-700">
                          {action === "approve" ? "Note for contributor (optional)" : "Reason for rejection *"}
                        </p>
                        <textarea value={note} onChange={e => setNote(e.target.value)}
                          placeholder={action === "approve" ? "Great notes, well structured!" : "e.g. Duplicate content or low quality scan"}
                          rows={2}
                          className="w-full rounded-lg border border-input bg-white px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setSelected(null); setAction(null); setNote(""); }}>Cancel</Button>
                        <Button size="sm"
                          className={`flex-1 h-8 text-xs font-bold text-white ${action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                          disabled={action === "reject" && !note.trim()}
                          onClick={confirm}>
                          Confirm {action === "approve" ? "Approval" : "Rejection"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Study() {
  const { submissions } = useSubmissions();
  const { user } = useAuth();
  const isMod = user?.role === "low_admin" || user?.role === "admin";
  const [mode, setMode] = useState<"student" | "contributor">("student");
  const [contribTab, setContribTab] = useState<"upload" | "mine" | "review">("upload");

  // Merge approved submitted materials into the public list
  const approvedFromContrib = submissions
    .filter((s) => s.status === "approved")
    .map((s) => ({
      id: s.id,
      title: s.title,
      course: s.course,
      downloads: s.downloads,
      rating: s.rating,
      type: s.type,
      color: "text-blue-500 bg-blue-50",
    }));
  const allMaterials = [...APPROVED_MATERIALS, ...approvedFromContrib];

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Study & Career Hub</h1>
          <p className="text-slate-500 mt-1">Accelerate your academic success</p>
        </div>
        {/* Mode toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
          <button
            onClick={() => setMode("student")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              mode === "student"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BookOpen className="inline h-3.5 w-3.5 mr-1.5" />Student View
          </button>
          <button
            onClick={() => setMode("contributor")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              mode === "contributor"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Upload className="inline h-3.5 w-3.5 mr-1.5" />Contributor Mode
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STUDENT VIEW ── */}
        {mode === "student" && (
          <motion.div
            key="student"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Study Materials</CardTitle>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        {allMaterials.length} materials
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search materials..." className="pl-9 bg-slate-50 border-slate-200" />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          <SelectItem value="cs">Computer Science</SelectItem>
                          <SelectItem value="ee">Electronics</SelectItem>
                          <SelectItem value="me">Mechanical</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="sem5">
                        <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {[4,5,6,7,8].map((s) => (
                            <SelectItem key={s} value={`sem${s}`}>Semester {s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      {allMaterials.map((mat) => (
                        <motion.div
                          key={mat.id}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all bg-white group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${mat.color}`}>
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors text-sm">
                                {mat.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">{mat.course}</span>
                                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {mat.downloads}</span>
                                {mat.rating > 0 && (
                                  <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" /> {mat.rating}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Tools row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <Zap className="h-8 w-8 text-yellow-300 mb-4" />
                      <h3 className="text-xl font-bold mb-2">AI Summarizer</h3>
                      <p className="text-indigo-100 text-sm mb-6">Upload long lecture notes or PDFs and get concise, bulleted summaries instantly.</p>
                      <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold">Launch Summarizer</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardContent className="p-6">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Exam Prep Hub</h3>
                      <p className="text-slate-400 text-sm mb-6">Generate mock tests from past year papers and test your knowledge before finals.</p>
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold">Start Practice Test</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-lg font-bold">Academic Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Smart Timetable</p>
                        <p className="text-sm font-semibold text-slate-900">Next Class: ML (14:00)</p>
                        <p className="text-xs text-slate-500">Room 402, Block B</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-300" />
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">GPA Calculator</p>
                        <p className="text-sm font-semibold text-slate-900">Current: 3.85 / 4.0</p>
                        <p className="text-xs text-slate-500">Target: 3.90</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Career Corner</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8">View All</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {INTERNSHIPS.map((intern) => (
                      <div key={intern.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-200 rounded-md flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{intern.title}</h4>
                              <p className="text-xs text-slate-500">{intern.company}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={
                            intern.status === "NEW"    ? "text-blue-700 bg-blue-50 border-blue-200" :
                            intern.status === "OPEN"   ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                                                         "text-slate-500 bg-slate-100 border-slate-200"
                          }>
                            {intern.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-semibold text-slate-700">{intern.salary}</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Apply</Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CONTRIBUTOR MODE ── */}
        {mode === "contributor" && (
          <motion.div
            key="contributor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-xl font-extrabold">Contributor Mode</h2>
                <p className="text-emerald-100 text-sm mt-1">
                  Share your notes & study materials. Earn Reputation points when approved!
                </p>
              </div>
              <div className="flex gap-6 text-center text-white">
                <div>
                  <p className="text-2xl font-extrabold">482</p>
                  <p className="text-xs text-emerald-100">Contributors</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">15.4k</p>
                  <p className="text-xs text-emerald-100">Materials</p>
                </div>
              </div>
            </div>

            {/* Sub-tabs */}
            <Tabs value={contribTab} onValueChange={(v) => setContribTab(v as "upload" | "mine" | "review")}>
              <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6">
                <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload New Material
                </TabsTrigger>
                <TabsTrigger value="mine" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> My Submissions
                </TabsTrigger>
                {isMod && (
                  <TabsTrigger value="review" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Review Queue
                    {submissions.filter(s => s.status === "pending").length > 0 && (
                      <span className="ml-1.5 bg-amber-500 data-[state=active]:bg-white/30 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                        {submissions.filter(s => s.status === "pending").length}
                      </span>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="upload">
                <ContributorForm onSuccess={() => setContribTab("mine")} />
              </TabsContent>

              <TabsContent value="mine">
                <MySubmissions />
              </TabsContent>

              {isMod && (
                <TabsContent value="review">
                  <ModReviewPanel />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom stats bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 py-3 px-8 z-10 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">1,248</strong> Students Online</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">15.4k</strong> Total Resources</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="items-center gap-2 hidden md:flex">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">+12%</strong> Avg Grade Increase</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="items-center gap-2 hidden md:flex">
            <Users className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">482</strong> Verified Contributors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
