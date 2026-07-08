/**
 * Moderator Dashboard
 * Tabs: Feature Toggles · Study Materials · Exam Schedules · Timetables · Reports
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ToggleLeft, ToggleRight, Shield, BookOpen, Calendar,
  FileText, Flag, CheckCircle, XCircle, Clock, Trash2,
  Plus, X, Eye, Upload, Pencil, AlertTriangle, ChevronDown,
  ChevronRight, Check, Search, RefreshCw, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/* ─── Scope constants ───────────────────────────────────────── */
const COURSE_OPTIONS = ["CS301", "CS302", "CS401", "CS405", "ME301", "EE401", "CE301", "BT201"];
const SEM_OPTIONS = ["sem1", "sem2", "sem3", "sem4", "sem5", "sem6", "sem7", "sem8"];
const SECTION_OPTIONS = ["Section A", "Section B", "Section C", "Section D"];

const REJECTION_REASONS = [
  "Duplicate content already exists",
  "Incorrect course or semester",
  "File quality too low",
  "Policy violation",
  "Incomplete or corrupted file",
  "Other",
];

/* ─── Shared scope picker ───────────────────────────────────── */
function ScopePicker({ course, semester, onCourse, onSemester }: {
  course: string; semester: string; onCourse: (v: string) => void; onSemester: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Scope</span>
      <select className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={course} onChange={(e) => onCourse(e.target.value)}>
        {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <X className="h-3 w-3 text-slate-400" />
      <select className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={semester} onChange={(e) => onSemester(e.target.value)}>
        {SEM_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE TOGGLES TAB
══════════════════════════════════════════════════════════════ */
function FeatureTogglesTab({ userName, userId }: { userName: string; userId?: number }) {
  const [course, setCourse] = useState("CS301");
  const [semester, setSemester] = useState("sem5");
  const [toggles, setToggles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/moderator/toggles?course=${course}&semester=${semester}`);
    if (r.ok) setToggles(await r.json());
    setLoading(false);
  }, [course, semester]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (featureName: string, currentEnabled: boolean, forcedActive: boolean) => {
    if (forcedActive && !currentEnabled) return;
    if (forcedActive && currentEnabled) return;
    setSaving(featureName);
    const r = await fetch(`/api/moderator/toggles/${featureName}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course, semester, enabled: !currentEnabled, updatedByName: userName, updatedById: userId }),
    });
    if (r.ok) {
      setToggles((prev) => prev.map((t) => t.featureName === featureName ? { ...t, enabled: !currentEnabled } : t));
      setToast(`${featureName} ${!currentEnabled ? "enabled" : "disabled"} for ${course} × ${semester}`);
      setTimeout(() => setToast(null), 3000);
    }
    setSaving(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Feature Toggles</h2>
          <p className="text-sm text-slate-500 mt-0.5">Control which features are visible to students in your scope.</p>
        </div>
        <ScopePicker course={course} semester={semester} onCourse={setCourse} onSemester={setSemester} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <CheckCircle className="h-4 w-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading toggles…</div>
      ) : toggles.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ToggleLeft className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No features registered yet.</p>
          <p className="text-sm mt-1">Ask your admin to add features to the Feature Registry.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {toggles.map((t) => (
            <div key={t.featureName} className={cn(
              "bg-white rounded-xl border px-5 py-4 shadow-sm flex items-center gap-5 transition-all",
              t.forcedActive ? "border-violet-200 bg-violet-50/30" : "border-slate-200"
            )}>
              <button
                onClick={() => toggle(t.featureName, t.enabled, t.forcedActive)}
                disabled={!!saving || t.forcedActive}
                className={cn("relative flex-shrink-0 w-12 h-6 rounded-full transition-all outline-none",
                  t.enabled ? "bg-emerald-500" : "bg-slate-300",
                  t.forcedActive ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:opacity-90"
                )}>
                <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", t.enabled ? "left-7" : "left-1")} />
                {saving === t.featureName && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  </span>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">{t.label}</span>
                  {t.forcedActive && <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">Forced Active</Badge>}
                  <Badge className={cn("text-xs border", t.enabled ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                    {t.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                {t.updatedByName && (
                  <p className="text-[10px] text-slate-400 mt-1">Last changed by {t.updatedByName}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STUDY MATERIALS TAB
══════════════════════════════════════════════════════════════ */
function StudyMaterialsTab({ userName }: { userName: string }) {
  const [course, setCourse] = useState("CS301");
  const [semester, setSemester] = useState("sem5");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<{ mat: any; action: "approve" | "reject" } | null>(null);
  const [rejReason, setRejReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/moderator/materials?status=${statusFilter}&course=${course}&semester=${semester}`);
    if (r.ok) setMaterials(await r.json());
    setLoading(false);
  }, [statusFilter, course, semester]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async () => {
    if (!reviewing) return;
    setSaving(true);
    const r = await fetch(`/api/moderator/materials/${reviewing.mat.id}/approve`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: userName }),
    });
    setSaving(false);
    setReviewing(null);
    if (r.ok) { showToast("Material approved and published."); load(); }
    else showToast("Failed to approve.", "error");
  };

  const handleReject = async () => {
    if (!reviewing) return;
    const reason = rejReason === "Other" ? customReason : rejReason;
    if (!reason) return;
    setSaving(true);
    const r = await fetch(`/api/moderator/materials/${reviewing.mat.id}/reject`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectedBy: userName, rejectionReason: reason }),
    });
    setSaving(false);
    setReviewing(null);
    setRejReason("");
    setCustomReason("");
    if (r.ok) { showToast("Material rejected. Archived safely."); load(); }
    else showToast("Failed to reject.", "error");
  };

  const handleDelete = async (id: number) => {
    const r = await fetch(`/api/moderator/materials/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deletedBy: userName }) });
    if (r.ok) { showToast("Material archived."); load(); }
  };

  const counts = { pending: "?", approved: "?", rejected: "?" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review pending uploads and manage approved/rejected materials.</p>
        </div>
        <ScopePicker course={course} semester={semester} onCourse={setCourse} onSemester={setSemester} />
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all capitalize",
              statusFilter === f
                ? f === "pending" ? "bg-amber-600 text-white border-amber-600"
                : f === "approved" ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            )}>
            {f === "pending" && <Clock className="h-3 w-3" />}
            {f === "approved" && <CheckCircle className="h-3 w-3" />}
            {f === "rejected" && <XCircle className="h-3 w-3" />}
            {f}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={cn("text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg", toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}>
            {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading materials…</div>
      ) : materials.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <FileText className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No {statusFilter} materials</p>
          <p className="text-sm mt-1">for {course} × {semester}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">{m.course}</span>
                          <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 rounded text-blue-700">{m.fileType?.toUpperCase()}</span>
                          <span className="text-xs text-slate-400">{m.semester}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">by {m.uploadedBy}</span>
                    </div>

                    {m.status === "rejected" && m.rejectionReason && (
                      <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-red-700"><strong>Rejected:</strong> {m.rejectionReason}</p>
                        {m.rejectedBy && <p className="text-[10px] text-red-400 mt-0.5">by {m.rejectedBy}</p>}
                      </div>
                    )}
                    {m.status === "approved" && m.approvedBy && (
                      <p className="text-[10px] text-emerald-500 mt-1.5">Approved by {m.approvedBy}</p>
                    )}
                  </div>
                </div>

                {statusFilter === "pending" && (
                  <div className="flex gap-2 mt-3 pl-12">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
                      onClick={() => setReviewing({ mat: m, action: "approve" })}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs font-bold"
                      onClick={() => { setReviewing({ mat: m, action: "reject" }); setRejReason(""); setCustomReason(""); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                )}

                {statusFilter !== "pending" && (
                  <div className="flex gap-2 mt-3 pl-12">
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Archive
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={reviewing?.action === "approve"} onOpenChange={() => setReviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-emerald-700">✓ Approve Material</DialogTitle></DialogHeader>
          {reviewing && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">{reviewing.mat.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">by {reviewing.mat.uploadedBy} · {reviewing.mat.course}</p>
              </div>
              <p className="text-sm text-slate-600">This will mark the material as <strong className="text-emerald-700">Approved</strong> and make it immediately visible to students.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setReviewing(null)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled={saving} onClick={handleApprove}>
                  {saving ? "Approving…" : "Confirm Approval"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={reviewing?.action === "reject"} onOpenChange={() => { setReviewing(null); setRejReason(""); setCustomReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-red-700">✗ Reject Material</DialogTitle></DialogHeader>
          {reviewing && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">{reviewing.mat.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">by {reviewing.mat.uploadedBy} · {reviewing.mat.course}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Rejection Reason *</label>
                <div className="space-y-2">
                  {REJECTION_REASONS.map((r) => (
                    <label key={r} className={cn("flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-sm",
                      rejReason === r ? "border-red-300 bg-red-50 text-red-800" : "border-slate-200 hover:border-slate-300 text-slate-700")}>
                      <input type="radio" name="rej" value={r} checked={rejReason === r} onChange={() => setRejReason(r)} className="accent-red-600" />
                      {r}
                    </label>
                  ))}
                </div>
                {rejReason === "Other" && (
                  <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Describe the reason…" rows={2}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setReviewing(null); setRejReason(""); setCustomReason(""); }}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" disabled={saving || !rejReason || (rejReason === "Other" && !customReason)}
                  onClick={handleReject}>
                  {saving ? "Rejecting…" : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXAM SCHEDULES TAB
══════════════════════════════════════════════════════════════ */
function ExamSchedulesTab({ userName }: { userName: string }) {
  const [course, setCourse] = useState("CS301");
  const [semester, setSemester] = useState("sem5");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", examSession: "", dateFrom: "", dateTo: "", fileUrl: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/moderator/exam-schedules?course=${course}&semester=${semester}`);
    if (r.ok) setSchedules(await r.json());
    setLoading(false);
  }, [course, semester]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title || !form.examSession) { setError("Title and exam session are required."); return; }
    setSaving(true);
    setError("");
    const url = editing ? `/api/moderator/exam-schedules/${editing.id}` : "/api/moderator/exam-schedules";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, course, semester, uploaderName: userName }),
    });
    setSaving(false);
    if (!r.ok) { const d = await r.json(); setError(d.error ?? "Failed"); return; }
    setShowForm(false);
    setEditing(null);
    setToast(editing ? "Date sheet updated." : "Exam date sheet uploaded.");
    setTimeout(() => setToast(null), 3000);
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/moderator/exam-schedules/${id}`, { method: "DELETE" });
    setToast("Date sheet deleted.");
    setTimeout(() => setToast(null), 3000);
    load();
  };

  const openNew = () => { setForm({ title: "", examSession: "", dateFrom: "", dateTo: "", fileUrl: "", description: "" }); setEditing(null); setError(""); setShowForm(true); };
  const openEdit = (s: any) => { setForm({ title: s.title, examSession: s.examSession, dateFrom: s.dateFrom ?? "", dateTo: s.dateTo ?? "", fileUrl: s.fileUrl ?? "", description: s.description ?? "" }); setEditing(s); setError(""); setShowForm(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Exam Date Sheets</h2>
          <p className="text-sm text-slate-500 mt-0.5">Upload and manage exam schedules by course and semester.</p>
        </div>
        <div className="flex items-center gap-3">
          <ScopePicker course={course} semester={semester} onCourse={setCourse} onSemester={setSemester} />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={openNew}>
            <Upload className="h-4 w-4 mr-1.5" /> Upload
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <CheckCircle className="h-4 w-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <div className="py-12 text-center text-slate-400">Loading…</div>
        : schedules.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">No exam date sheets for {course} × {semester}</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={openNew}>
              <Upload className="h-4 w-4 mr-1" /> Upload First Date Sheet
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm flex items-center gap-4">
                <div className="p-2.5 bg-violet-50 rounded-xl flex-shrink-0">
                  <Calendar className="h-5 w-5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{s.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="text-xs bg-violet-50 text-violet-700 border-violet-100">{s.examSession}</Badge>
                    {s.dateFrom && <span className="text-xs text-slate-400">{s.dateFrom} → {s.dateTo ?? "?"}</span>}
                  </div>
                  {s.description && <p className="text-xs text-slate-400 mt-1">{s.description}</p>}
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View File
                    </a>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-blue-600" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-red-600" onClick={() => del(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Date Sheet" : "Upload Exam Date Sheet"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Title *</label>
              <Input placeholder="e.g. End-Semester Exam Schedule" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Exam Session *</label>
              <Input placeholder="e.g. End-Semester Dec 2025" value={form.examSession} onChange={(e) => setForm({ ...form, examSession: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">From Date</label>
                <Input type="date" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">To Date</label>
                <Input type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">File URL</label>
              <Input placeholder="https://drive.google.com/…" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
              <p className="text-xs text-slate-400 mt-1">Paste a link to the hosted file (Google Drive, Dropbox, etc.)</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
              <Input placeholder="Optional notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={saving} onClick={save}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TIMETABLES TAB
══════════════════════════════════════════════════════════════ */
function TimetablesTab({ userName }: { userName: string }) {
  const [course, setCourse] = useState("CS301");
  const [semester, setSemester] = useState("sem5");
  const [section, setSection] = useState("Section A");
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", section: "Section A", effectiveFrom: "", effectiveTo: "", fileUrl: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/moderator/timetables?course=${course}&semester=${semester}&section=${encodeURIComponent(section)}`);
    if (r.ok) setTimetables(await r.json());
    setLoading(false);
  }, [course, semester, section]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title || !form.section) { setError("Title and section are required."); return; }
    setSaving(true);
    setError("");
    const url = editing ? `/api/moderator/timetables/${editing.id}` : "/api/moderator/timetables";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, course, semester, uploaderName: userName }),
    });
    setSaving(false);
    if (!r.ok) { const d = await r.json(); setError(d.error ?? "Failed"); return; }
    setShowForm(false);
    setEditing(null);
    setToast(editing ? "Timetable updated." : "Timetable uploaded.");
    setTimeout(() => setToast(null), 3000);
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/moderator/timetables/${id}`, { method: "DELETE" });
    setToast("Timetable deleted.");
    setTimeout(() => setToast(null), 3000);
    load();
  };

  const openNew = () => { setForm({ title: "", section, effectiveFrom: "", effectiveTo: "", fileUrl: "", description: "" }); setEditing(null); setError(""); setShowForm(true); };
  const openEdit = (t: any) => { setForm({ title: t.title, section: t.section, effectiveFrom: t.effectiveFrom ?? "", effectiveTo: t.effectiveTo ?? "", fileUrl: t.fileUrl ?? "", description: t.description ?? "" }); setEditing(t); setError(""); setShowForm(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Class Timetables</h2>
          <p className="text-sm text-slate-500 mt-0.5">Upload and manage class timetables by course, semester, and section.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ScopePicker course={course} semester={semester} onCourse={setCourse} onSemester={setSemester} />
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={section} onChange={(e) => setSection(e.target.value)}>
            {SECTION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={openNew}>
            <Upload className="h-4 w-4 mr-1.5" /> Upload
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <CheckCircle className="h-4 w-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <div className="py-12 text-center text-slate-400">Loading…</div>
        : timetables.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">No timetables for {course} × {semester} × {section}</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={openNew}>
              <Upload className="h-4 w-4 mr-1" /> Upload First Timetable
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {timetables.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-100">{t.section}</Badge>
                    {t.effectiveFrom && <span className="text-xs text-slate-400">{t.effectiveFrom} → {t.effectiveTo ?? "?"}</span>}
                  </div>
                  {t.description && <p className="text-xs text-slate-400 mt-1">{t.description}</p>}
                  {t.fileUrl && (
                    <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View File
                    </a>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-blue-600" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-red-600" onClick={() => del(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Timetable" : "Upload Timetable"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Title *</label>
              <Input placeholder="e.g. Even Semester 2026 — Section A" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Section *</label>
              <select className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                {SECTION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Effective From</label>
                <Input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Effective To</label>
                <Input type="date" value={form.effectiveTo} onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">File URL</label>
              <Input placeholder="https://drive.google.com/…" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
              <p className="text-xs text-slate-400 mt-1">Paste a link to the hosted file</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
              <Input placeholder="Optional notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={saving} onClick={save}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REPORTS TAB (preserved from original)
══════════════════════════════════════════════════════════════ */
const MOCK_REPORTS = [
  { id: 1, title: "MacBook Pro 2021 Listing", type: "Marketplace", reason: "Suspected scam — seller requesting payment outside platform", status: "Urgent", reporter: "Arjun Mehta", time: "2h ago" },
  { id: 2, title: '"The final exam is…"', type: "Community Post", reason: "Inappropriate language and misinformation", status: "Pending", reporter: "Sneha Kapoor", time: "4h ago" },
  { id: 3, title: "Outdoor Mixer Ad", type: "Event", reason: "Spam — duplicate posting across multiple communities", status: "Under Investigation", reporter: "Rohan Verma", time: "6h ago" },
];
const STATUS_STYLES: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "Under Investigation": "bg-blue-100 text-blue-700 border-blue-200",
};

function ReportsTab() {
  const [filter, setFilter] = useState<"all" | "urgent" | "standard">("all");
  const shown = MOCK_REPORTS.filter((r) => filter === "all" || (filter === "urgent" ? r.status === "Urgent" : r.status !== "Urgent"));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Content Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review flagged content from students.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "urgent", "standard"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all capitalize",
                filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400")}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {shown.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-red-50 rounded-xl flex-shrink-0"><Flag className="h-5 w-5 text-red-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                <Badge className="text-xs bg-slate-100 text-slate-500 border-slate-200">{r.type}</Badge>
                <Badge className={cn("text-xs border", STATUS_STYLES[r.status] ?? "bg-slate-100")}>{r.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{r.reason}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Reported by {r.reporter} · {r.time}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-600 hover:bg-emerald-50"><Check className="h-3.5 w-3.5 mr-1" />Resolve</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500 hover:bg-red-50"><X className="h-3.5 w-3.5 mr-1" />Dismiss</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN MODERATOR PAGE
══════════════════════════════════════════════════════════════ */
type Tab = "toggles" | "materials" | "schedules" | "timetables" | "reports";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "toggles", label: "Feature Toggles", icon: ToggleRight },
  { id: "materials", label: "Study Materials", icon: FileText },
  { id: "schedules", label: "Exam Schedules", icon: Calendar },
  { id: "timetables", label: "Timetables", icon: BookOpen },
  { id: "reports", label: "Reports", icon: Flag },
];

export default function Moderator() {
  const [activeTab, setActiveTab] = useState<Tab>("toggles");
  const { user } = useAuth();
  const userName = user?.name ?? "Moderator";
  const userId = user?.id;

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === t.id ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}>
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6 max-w-5xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {activeTab === "toggles"    && <FeatureTogglesTab userName={userName} userId={userId} />}
            {activeTab === "materials"  && <StudyMaterialsTab userName={userName} />}
            {activeTab === "schedules"  && <ExamSchedulesTab userName={userName} />}
            {activeTab === "timetables" && <TimetablesTab userName={userName} />}
            {activeTab === "reports"    && <ReportsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
