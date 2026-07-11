/**
 * Study & Career Hub
 * Two modes:
 *   - Student View  → browse approved materials
 *   - Contributor Mode → upload notes/PDFs → goes to pending approval queue
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Download, Star, Eye, Clock, Zap, FileText,
  CheckCircle2, TrendingUp, Users, Briefcase, Upload,
  FilePlus, AlertCircle, X, ChevronRight, Search, ShieldCheck, Trash2,
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

/* ─── live data types & helpers ─────────────────────────── */
interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  course: string;
  semester: string;
  fileType: string;
  fileSizeMb: number;
  downloads: number;
  rating: number;
  ratingCount: number;
  verified: boolean;
  uploadedBy: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  pdf: "text-red-500 bg-red-50",
  ppt: "text-orange-500 bg-orange-50",
  doc: "text-blue-500 bg-blue-50",
  notes: "text-violet-500 bg-violet-50",
  pyq: "text-emerald-500 bg-emerald-50",
  assignment: "text-amber-500 bg-amber-50",
  lab: "text-cyan-500 bg-cyan-50",
  syllabus: "text-slate-500 bg-slate-100",
};

interface FilterParams {
  collegeId?: number | null;
  courseId?:  number | null;
  semesterId?: number | null;
  subjectId?:  number | null;
  search?: string;
}

async function fetchMaterials(filters?: FilterParams): Promise<StudyMaterial[]> {
  const p = new URLSearchParams();
  if (filters?.collegeId)  p.set("collegeId",  String(filters.collegeId));
  if (filters?.courseId)   p.set("courseId",   String(filters.courseId));
  if (filters?.semesterId) p.set("semesterId", String(filters.semesterId));
  if (filters?.subjectId)  p.set("subjectId",  String(filters.subjectId));
  if (filters?.search)     p.set("search",     filters.search);
  const qs = p.toString();
  const res = await fetch(`/api/study/materials${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to load study materials");
  return res.json();
}

async function incrementDownload(id: number): Promise<StudyMaterial> {
  const res = await fetch(`/api/study/materials/${id}/download`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to record download");
  return res.json();
}

async function deleteMaterial(id: number): Promise<void> {
  const res = await fetch(`/api/moderator/materials/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete material");
}

async function fetchMyMaterials(uploadedBy: string): Promise<StudyMaterial[]> {
  const res = await fetch(`/api/study/my-materials?uploadedBy=${encodeURIComponent(uploadedBy)}`);
  if (!res.ok) throw new Error("Failed to load your submissions");
  return res.json();
}

async function fetchFeatureStatus(): Promise<Record<string, boolean>> {
  const res = await fetch("/api/study/feature-status");
  if (!res.ok) throw new Error("Failed to load feature status");
  return res.json();
}

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

/* ─── Cascading academic selects hook ───────────────────── */
interface AcademicOption { id: number; name: string; code?: string }

function useCascadingAcademic(fixedCollegeId?: number | null) {
  const [collegeId,  setCollegeIdRaw]  = useState<number | null>(fixedCollegeId ?? null);
  const [courseId,   setCourseIdRaw]   = useState<number | null>(null);
  const [semesterId, setSemesterIdRaw] = useState<number | null>(null);
  const [subjectId,  setSubjectIdRaw]  = useState<number | null>(null);

  const { data: colleges = [] }  = useQuery<AcademicOption[]>({
    queryKey: ["pub-colleges"],
    queryFn: () => fetch("/api/colleges").then(r => r.json()),
    enabled: fixedCollegeId == null, // only fetch list when college is not locked
  });
  const { data: courses = [] }   = useQuery<AcademicOption[]>({
    queryKey: ["pub-courses", collegeId],
    queryFn: () => fetch(`/api/colleges/${collegeId}/courses`).then(r => r.json()),
    enabled: !!collegeId,
  });
  const { data: semesters = [] } = useQuery<AcademicOption[]>({
    queryKey: ["pub-semesters", courseId],
    queryFn: () => fetch(`/api/courses/${courseId}/semesters`).then(r => r.json()),
    enabled: !!courseId,
  });
  const { data: subjects = [] }  = useQuery<AcademicOption[]>({
    queryKey: ["pub-subjects", semesterId],
    queryFn: () => fetch(`/api/semesters/${semesterId}/subjects`).then(r => r.json()),
    enabled: !!semesterId,
  });

  const setCollege  = (id: number | null) => { setCollegeIdRaw(id);  setCourseIdRaw(null); setSemesterIdRaw(null); setSubjectIdRaw(null); };
  const setCourse   = (id: number | null) => { setCourseIdRaw(id);   setSemesterIdRaw(null); setSubjectIdRaw(null); };
  const setSemester = (id: number | null) => { setSemesterIdRaw(id); setSubjectIdRaw(null); };
  const setSubject  = (id: number | null) => setSubjectIdRaw(id);

  return { colleges, courses, semesters, subjects, collegeId, courseId, semesterId, subjectId, setCollege, setCourse, setSemester, setSubject };
}

/* ─── Contributor Upload Form ───────────────────────────── */
function ContributorForm({ onSuccess }: { onSuccess: () => void }) {
  const { addSubmission } = useSubmissions();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMod = user?.role === "low_admin" || user?.role === "admin";

  // Students: college locked to profile; mod/admin: free dropdown
  const lockedCollegeId   = !isMod ? (user?.collegeId ?? null) : null;
  const lockedCollegeName = !isMod ? (user?.college ?? "") : "";

  const ac = useCascadingAcademic(lockedCollegeId);

  const [form, setForm] = useState({ title: "", description: "", type: "" as MaterialType | "" });
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const effectiveCollegeId = lockedCollegeId ?? ac.collegeId;

  const selectedCourse   = ac.courses.find(c => c.id === ac.courseId);
  const selectedSemester = ac.semesters.find(s => s.id === ac.semesterId);
  const selectedSubject  = ac.subjects.find(s => s.id === ac.subjectId);

  const valid =
    form.title.trim() &&
    form.type &&
    fileName &&
    effectiveCollegeId &&
    ac.courseId &&
    ac.semesterId &&
    ac.subjectId;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileName(file.name);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/study/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title,
          description: form.description,
          subject:     selectedSubject?.name  ?? "",
          course:      selectedCourse?.code   ?? "",
          semester:    selectedSemester?.name ?? "",
          fileType:    form.type,
          fileSizeMb:  0,
          uploadedBy:  user?.name ?? "Anonymous",
          collegeId:   effectiveCollegeId,
          courseId:    ac.courseId,
          semesterId:  ac.semesterId,
          subjectId:   ac.subjectId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Upload failed. Please try again.");
        setSubmitting(false); return;
      }
      // Optimistic local state for "My Submissions" tab
      addSubmission({
        title:           form.title,
        description:     form.description,
        subject:         selectedSubject?.name  ?? "",
        course:          selectedCourse?.code   ?? "",
        semester:        selectedSemester?.name ?? "",
        type:            form.type as MaterialType,
        fileName,
        fileSize:        "—",
        uploadedBy:      user?.name ?? "Anonymous",
        uploaderInitials: user?.initials ?? "?",
        uploaderColor:   AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        submittedAt:     "Just now",
      });
      // Refresh "My Submissions" tab from DB so it persists after a page reload
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
      setSubmitting(false); setDone(true);
      setTimeout(onSuccess, 1800);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 space-y-3">
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

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2 items-center text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative",
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        )}
      >
        <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
          onChange={handleFileInput} className="absolute inset-0 opacity-0 cursor-pointer" />
        {fileName ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">{fileName}</p>
              <p className="text-xs text-slate-400">Ready to upload</p>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setFileName(""); }}
              className="ml-2 text-slate-400 hover:text-red-500">
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

      {/* Title + Description */}
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Material Title *</label>
        <Input placeholder="e.g. Operating Systems Unit 3 Complete Notes"
          value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
        <textarea placeholder="What does this material cover? What makes it useful?"
          value={form.description} onChange={(e) => set("description", e.target.value)}
          rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Material type */}
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Material Type *</label>
        <Select onValueChange={(v) => set("type", v)} required>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            {MATERIAL_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Academic cascade ── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <p className="text-sm font-bold text-slate-700">Academic Details *</p>

        {/* College */}
        {isMod ? (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">College</label>
            <Select onValueChange={(v) => ac.setCollege(Number(v))}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Select college" /></SelectTrigger>
              <SelectContent>
                {ac.colleges.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">College</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              {lockedCollegeName || <span className="text-slate-400 italic">Set in your profile</span>}
            </div>
          </div>
        )}

        {/* Course */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Course</label>
          <Select
            onValueChange={(v) => ac.setCourse(Number(v))}
            disabled={!effectiveCollegeId || ac.courses.length === 0}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={!effectiveCollegeId ? "Select college first" : ac.courses.length === 0 ? "No courses available" : "Select course"} />
            </SelectTrigger>
            <SelectContent>
              {ac.courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Semester</label>
          <Select
            onValueChange={(v) => ac.setSemester(Number(v))}
            disabled={!ac.courseId || ac.semesters.length === 0}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={!ac.courseId ? "Select course first" : ac.semesters.length === 0 ? "No semesters available" : "Select semester"} />
            </SelectTrigger>
            <SelectContent>
              {ac.semesters.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Subject</label>
          <Select
            onValueChange={(v) => ac.setSubject(Number(v))}
            disabled={!ac.semesterId || ac.subjects.length === 0}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={!ac.semesterId ? "Select semester first" : ac.subjects.length === 0 ? "No subjects available" : "Select subject"} />
            </SelectTrigger>
            <SelectContent>
              {ac.subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>)}
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

      <Button type="submit" disabled={!valid || submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold">
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
  const { user } = useAuth();
  const name = user?.name ?? "";

  const { data: dbItems = [], isLoading } = useQuery<StudyMaterial[]>({
    queryKey: ["my-materials", name],
    queryFn: () => fetchMyMaterials(name),
    enabled: !!name,
    staleTime: 10_000,
  });

  // Also show anything added this session that the DB query might not have returned yet
  const { submissions } = useSubmissions();
  const sessionMine = submissions.filter(
    (s) => s.uploadedBy === name && s.id.startsWith("s_"),
  );

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">Loading your submissions…</p>
      </div>
    );
  }

  if (dbItems.length === 0 && sessionMine.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">You haven't submitted any materials yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {/* DB-backed submissions (survive page refresh) */}
      {(dbItems as (StudyMaterial & { status?: string; rejectionReason?: string })[]).map((s) => {
        const status = (s.status ?? "pending") as keyof typeof STATUS_STYLES;
        const { label, cls } = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
        return (
          <motion.div
            key={`db-${s.id}`}
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
                <p className="text-xs text-slate-400 mt-0.5">
                  {s.course} · {s.semester} · Submitted {new Date(s.createdAt).toLocaleDateString()}
                </p>
                {s.rejectionReason && (
                  <p className="text-xs mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                    <span className="font-semibold">Reviewer note:</span> {s.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
      {/* Session-only optimistic items (not yet in DB response) */}
      {sessionMine
        .filter((s) => !dbItems.some((d) => d.title === s.title))
        .map((s) => {
          const { label, cls } = STATUS_STYLES[s.status];
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm opacity-75"
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
  const queryClient = useQueryClient();

  // ── Search / filter state ──
  const [search, setSearch] = useState("");
  // Cascading academic selects for the browse/search panel
  // Students default to their own college; mod/admin start unfiltered
  const fac = useCascadingAcademic(!isMod ? (user?.collegeId ?? null) : null);

  const activeFilter: FilterParams = {
    collegeId:  fac.collegeId  ?? (!isMod ? user?.collegeId : undefined),
    courseId:   fac.courseId   ?? undefined,
    semesterId: fac.semesterId ?? undefined,
    subjectId:  fac.subjectId  ?? undefined,
    search: search || undefined,
  };

  const { data: dbMaterials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["study-materials", activeFilter],
    queryFn: () => fetchMaterials(activeFilter),
  });

  const { data: featureStatus = {}, isLoading: featureStatusLoading } = useQuery({
    queryKey: ["study-feature-status"],
    queryFn: fetchFeatureStatus,
  });
  const isOn = (name: string) => featureStatus[name] !== false;

  const downloadMutation = useMutation({
    mutationFn: incrementDownload,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-materials"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-materials"] }),
  });

  // Merge approved submitted materials (pending sync to DB) into the public list
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
  const liveMaterials = dbMaterials.map((m) => ({
    id: m.id,
    title: m.title,
    course: m.course,
    downloads: m.downloads,
    rating: m.rating,
    type: m.fileType,
    color: TYPE_COLORS[m.fileType] ?? "text-slate-500 bg-slate-100",
  }));
  const allMaterials = [...liveMaterials, ...approvedFromContrib];

  if (!featureStatusLoading && !isOn("study_hub")) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Study & Career Hub is unavailable</h1>
          <p className="text-slate-500">
            This feature has been temporarily disabled by an administrator. Please check back later.
          </p>
        </div>
      </div>
    );
  }

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
                {isOn("study_materials") && (
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
                    {/* ── Cascading Filters ── */}
                    <div className="space-y-3 mb-6">
                      {/* Text search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search by title or subject…"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="pl-9 bg-slate-50 border-slate-200"
                        />
                      </div>
                      {/* Cascade row */}
                      <div className="flex flex-wrap gap-2">
                        {/* College — only show for mod/admin; students are locked */}
                        {isMod && (
                          <Select onValueChange={v => fac.setCollege(v === "all" ? null : Number(v))}>
                            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 text-sm">
                              <SelectValue placeholder="All Colleges" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Colleges</SelectItem>
                              {fac.colleges.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        {/* Course */}
                        <Select
                          onValueChange={v => fac.setCourse(v === "all" ? null : Number(v))}
                          disabled={!fac.collegeId && !(!isMod && user?.collegeId)}
                        >
                          <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 text-sm">
                            <SelectValue placeholder="All Courses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {fac.courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {/* Semester */}
                        <Select
                          onValueChange={v => fac.setSemester(v === "all" ? null : Number(v))}
                          disabled={!fac.courseId}
                        >
                          <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200 text-sm">
                            <SelectValue placeholder="All Semesters" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {fac.semesters.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {/* Subject */}
                        <Select
                          onValueChange={v => fac.setSubject(v === "all" ? null : Number(v))}
                          disabled={!fac.semesterId}
                        >
                          <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 text-sm">
                            <SelectValue placeholder="All Subjects" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {fac.subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {/* Clear filters */}
                        {(fac.courseId || fac.semesterId || fac.subjectId || search) && (
                          <button
                            type="button"
                            onClick={() => { fac.setCourse(null); setSearch(""); }}
                            className="text-xs text-slate-400 hover:text-slate-700 px-2 underline underline-offset-2"
                          >
                            Clear
                          </button>
                        )}
                      </div>
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
                            <Button
                              variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              disabled={typeof mat.id !== "number"}
                              onClick={() => typeof mat.id === "number" && downloadMutation.mutate(mat.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {isMod && typeof mat.id === "number" && (
                              <Button
                                variant="ghost" size="icon"
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                disabled={deleteMutation.isPending}
                                onClick={() => deleteMutation.mutate(mat.id as number)}
                                title="Delete material"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* AI Tools row */}
                {(isOn("ai_summarizer") || isOn("exam_prep_hub")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isOn("ai_summarizer") && (
                  <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <Zap className="h-8 w-8 text-yellow-300 mb-4" />
                      <h3 className="text-xl font-bold mb-2">AI Summarizer</h3>
                      <p className="text-indigo-100 text-sm mb-6">Upload long lecture notes or PDFs and get concise, bulleted summaries instantly.</p>
                      <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold">Launch Summarizer</Button>
                    </CardContent>
                  </Card>
                  )}
                  {isOn("exam_prep_hub") && (
                  <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardContent className="p-6">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Exam Prep Hub</h3>
                      <p className="text-slate-400 text-sm mb-6">Generate mock tests from past year papers and test your knowledge before finals.</p>
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold">Start Practice Test</Button>
                    </CardContent>
                  </Card>
                  )}
                </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {isOn("academic_tools") && (
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
                )}

                {isOn("career_corner") && (
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
                )}
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
