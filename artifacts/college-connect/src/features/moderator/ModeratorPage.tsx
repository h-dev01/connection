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
  ChevronRight, Check, Search, RefreshCw, Filter, MapPin,
  Store,
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
   LOCAL LISTINGS TAB
══════════════════════════════════════════════════════════════ */
const CATEGORY_OPTIONS = [
  { value: "housing",       label: "Housing" },
  { value: "restaurant",    label: "Restaurant" },
  { value: "local_service", label: "Local Service" },
] as const;
type Category = typeof CATEGORY_OPTIONS[number]["value"];

const SERVICE_TYPES = ["Printing Shop","Stationery","Laundry","Repair Shop","Medical Store","Gym","Coaching","Other"];

function categoryLabel(c: string) {
  if (c === "local_service") return "Local Service";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function categoryColor(c: string) {
  if (c === "housing")       return "bg-blue-100 text-blue-700 border-blue-200";
  if (c === "restaurant")    return "bg-orange-100 text-orange-700 border-orange-200";
  if (c === "local_service") return "bg-purple-100 text-purple-700 border-purple-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function statusColor(s: string) {
  if (s === "approved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
  return "bg-amber-100 text-amber-700 border-amber-200"; // pending
}

function blankForm(cat: Category = "housing") {
  return { category: cat, name: "", photos: [] as string[], description: "", address: "", contactNumber: "", googleMapsLink: "", metadata: {} as Record<string, unknown>, collegeId: undefined as number | undefined, collegeName: "" };
}

function ListingsTab({ userName, userId }: { userName: string; userId?: number }) {
  const [colleges, setColleges]         = useState<{ id: number; name: string }[]>([]);
  const [filterCollegeId, setFilterCollegeId] = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");
  const [statusFilter,    setStatusFilter]    = useState("pending");
  const [search,          setSearch]          = useState("");
  // Category-specific filter state
  const [fRoomType,  setFRoomType]  = useState("");
  const [fGender,    setFGender]    = useState("");
  const [fCuisine,   setFCuisine]   = useState("");
  const [fDelivery,  setFDelivery]  = useState("");
  const [fService,   setFService]   = useState("");

  const [listings, setListings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Add / Edit dialog
  const [dialog,  setDialog]  = useState<{ mode: "add" | "edit"; listing?: any } | null>(null);
  const [form,    setForm]    = useState<ReturnType<typeof blankForm>>(blankForm());
  const [saving,  setSaving]  = useState(false);

  // Approve / Reject dialog
  const [reviewing, setReviewing] = useState<{ listing: any; action: "approve" | "reject" } | null>(null);
  const [rejReason, setRejReason] = useState("");

  // Load colleges for the dropdown
  useEffect(() => {
    fetch("/api/colleges").then(r => r.ok ? r.json() : []).then(setColleges).catch(() => {});
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterCollegeId)   p.set("collegeId", filterCollegeId);
    if (filterCategory)    p.set("category",  filterCategory);
    if (statusFilter)      p.set("status",    statusFilter);
    if (search)            p.set("search",    search);
    if (fRoomType)         p.set("roomType",  fRoomType);
    if (fGender)           p.set("gender",    fGender);
    if (fCuisine)          p.set("cuisineType", fCuisine);
    if (fDelivery)         p.set("deliveryAvailable", fDelivery);
    if (fService)          p.set("serviceType", fService);
    const r = await fetch(`/api/moderator/local-listings?${p}`);
    if (r.ok) setListings(await r.json());
    setLoading(false);
  }, [filterCollegeId, filterCategory, statusFilter, search, fRoomType, fGender, fCuisine, fDelivery, fService]);

  useEffect(() => { load(); }, [load]);

  // ── Dialog helpers ──────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...blankForm(), collegeId: filterCollegeId ? Number(filterCollegeId) : undefined, collegeName: colleges.find(c => String(c.id) === filterCollegeId)?.name ?? "" });
    setDialog({ mode: "add" });
  };

  const openEdit = (listing: any) => {
    let metadata: Record<string, unknown> = {};
    let photos: string[] = [];
    try { metadata = JSON.parse(listing.metadata || "{}"); } catch { /* */ }
    try { photos   = JSON.parse(listing.photos   || "[]"); } catch { /* */ }
    setForm({ ...listing, metadata, photos });
    setDialog({ mode: "edit", listing });
  };

  const setF = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));
  const setMeta = (patch: Record<string, unknown>) => setF({ metadata: { ...form.metadata, ...patch } });

  const handleSave = async () => {
    if (!form.name.trim() || !form.category) return;
    setSaving(true);
    const payload = {
      ...form,
      photos:   JSON.stringify(form.photos.filter(Boolean)),
      metadata: JSON.stringify(form.metadata),
      addedByModerator:   userName,
      addedByModeratorId: userId,
    };
    const isAdd = dialog?.mode === "add";
    const url    = isAdd ? "/api/moderator/local-listings" : `/api/moderator/local-listings/${dialog?.listing?.id}`;
    const method = isAdd ? "POST" : "PATCH";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) {
      setDialog(null);
      showToast(isAdd ? "Listing added." : "Listing updated.");
      load();
    } else {
      const err = await r.json().catch(() => ({}));
      showToast((err as any).error || "Failed to save.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const r = await fetch(`/api/moderator/local-listings/${id}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedBy: userName }),
    });
    if (r.ok) { showToast("Listing deleted."); load(); }
    else showToast("Failed to delete.", "error");
  };

  const handleApprove = async () => {
    if (!reviewing) return;
    const r = await fetch(`/api/moderator/local-listings/${reviewing.listing.id}/approve`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: userName }),
    });
    setReviewing(null);
    if (r.ok) { showToast("Listing approved."); load(); }
    else showToast("Failed to approve.", "error");
  };

  const handleReject = async () => {
    if (!reviewing || !rejReason.trim()) return;
    const r = await fetch(`/api/moderator/local-listings/${reviewing.listing.id}/reject`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectedBy: userName, rejectionReason: rejReason }),
    });
    setReviewing(null);
    setRejReason("");
    if (r.ok) { showToast("Listing rejected."); load(); }
    else showToast("Failed to reject.", "error");
  };

  const meta = form.metadata as Record<string, any>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Listings</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage Housing, Restaurant &amp; Local Service listings near campus.</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Listing
        </Button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={cn("text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg",
              toast.type === "error" ? "bg-red-600" : "bg-emerald-600")}>
            {toast.type === "error" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* College */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">College</span>
            <select value={filterCollegeId} onChange={e => setFilterCollegeId(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]">
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {/* Category */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</span>
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFRoomType(""); setFGender(""); setFCuisine(""); setFDelivery(""); setFService(""); }}
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {/* Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, description…"
                className="h-9 pl-9 pr-3 w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <span className="text-xs invisible">·</span>
            <button onClick={load} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 border border-slate-200">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category-specific secondary filters */}
        {filterCategory === "housing" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <select value={fRoomType} onChange={e => setFRoomType(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Room Type</option>
              {["Single","Double","Triple"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={fGender} onChange={e => setFGender(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Gender</option>
              {["Boys","Girls","Unisex"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        )}
        {filterCategory === "restaurant" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <select value={fCuisine} onChange={e => setFCuisine(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Cuisine</option>
              {["Indian","Chinese","Fast Food","Cafe"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={fDelivery} onChange={e => setFDelivery(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Delivery</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>
        )}
        {filterCategory === "local_service" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <select value={fService} onChange={e => setFService(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Service Type</option>
              {SERVICE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: "pending",  label: "Pending",  Icon: Clock },
          { v: "approved", label: "Approved", Icon: CheckCircle },
          { v: "rejected", label: "Rejected", Icon: XCircle },
          { v: "",         label: "All",      Icon: Filter },
        ].map(({ v, label, Icon }) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all",
              statusFilter === v
                ? v === "pending"  ? "bg-amber-600 text-white border-amber-600"
                : v === "approved" ? "bg-emerald-600 text-white border-emerald-600"
                : v === "rejected" ? "bg-red-600 text-white border-red-600"
                : "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            )}>
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading listings…</div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Store className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No listings found.</p>
          <p className="text-sm mt-1">Add one or adjust filters above.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map(listing => {
            let photos: string[] = [];
            let meta2: Record<string, any> = {};
            try { photos = JSON.parse(listing.photos || "[]"); } catch { /* */ }
            try { meta2  = JSON.parse(listing.metadata || "{}"); } catch { /* */ }
            const firstPhoto = photos.find(Boolean);

            return (
              <div key={listing.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex gap-4">
                {/* Thumbnail */}
                {firstPhoto ? (
                  <img src={firstPhoto} alt={listing.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Store className="h-6 w-6 text-slate-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{listing.name}</span>
                    <Badge className={cn("text-xs border", categoryColor(listing.category))}>
                      {categoryLabel(listing.category)}
                    </Badge>
                    <Badge className={cn("text-xs border capitalize", statusColor(listing.status))}>
                      {listing.status}
                    </Badge>
                  </div>

                  {listing.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{listing.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
                    {listing.collegeName && <span>🏫 {listing.collegeName}</span>}
                    {listing.address     && <span>📍 {listing.address}</span>}
                    {listing.contactNumber && <span>📞 {listing.contactNumber}</span>}
                    {/* Metadata chips */}
                    {meta2.roomType && <span>🛏 {meta2.roomType}</span>}
                    {meta2.gender   && <span>👤 {meta2.gender}</span>}
                    {(meta2.rentMin || meta2.rentMax) && <span>💰 ₹{meta2.rentMin || "?"}–{meta2.rentMax || "?"}/mo</span>}
                    {meta2.cuisineType && <span>🍽 {meta2.cuisineType}</span>}
                    {meta2.deliveryAvailable === true && <span>🛵 Delivery</span>}
                    {meta2.serviceType && <span>🔧 {meta2.serviceType}</span>}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span>By {listing.addedByModerator}</span>
                    <span>· {new Date(listing.createdAt).toLocaleDateString()}</span>
                    {photos.length > 1 && <span>· {photos.length} photos</span>}
                    {listing.rejectionReason && (
                      <span className="text-red-400">· Rejected: {listing.rejectionReason}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {listing.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:bg-emerald-50"
                        onClick={() => setReviewing({ listing, action: "approve" })}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-50"
                        onClick={() => setReviewing({ listing, action: "reject" })}>
                        <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:bg-slate-50"
                    onClick={() => openEdit(listing)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(listing.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                  </Button>
                  {listing.googleMapsLink && (
                    <a href={listing.googleMapsLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline px-2 py-1">
                      <MapPin className="h-3.5 w-3.5" />Map
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────── */}
      <Dialog open={!!dialog} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "add" ? "Add Listing" : "Edit Listing"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* College */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">College</label>
              <select value={form.collegeId ?? ""} onChange={e => {
                const id = e.target.value ? Number(e.target.value) : undefined;
                setF({ collegeId: id, collegeName: colleges.find(c => c.id === id)?.name ?? "" });
              }} className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select College</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Category *</label>
              <select value={form.category} onChange={e => setF({ category: e.target.value as Category, metadata: {} })}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Listing Name *</label>
              <Input value={form.name} onChange={e => setF({ name: e.target.value })} placeholder="e.g. Sunrise PG, Spice Garden" />
            </div>

            {/* Photos */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Photos (image URLs)</label>
              <div className="space-y-2">
                {form.photos.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={url} onChange={e => {
                      const arr = [...form.photos];
                      arr[i] = e.target.value;
                      setF({ photos: arr });
                    }} placeholder="https://…" className="flex-1" />
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 flex-shrink-0"
                      onClick={() => setF({ photos: form.photos.filter((_, j) => j !== i) })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" className="text-xs gap-1"
                  onClick={() => setF({ photos: [...form.photos, ""] })}>
                  <Plus className="h-3.5 w-3.5" /> Add Photo URL
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setF({ description: e.target.value })}
                placeholder="Brief description…" rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            {/* Address / Contact / Maps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Address <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input value={form.address} onChange={e => setF({ address: e.target.value })} placeholder="123 Main St, City" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Contact Number <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input value={form.contactNumber} onChange={e => setF({ contactNumber: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Google Maps Link <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input value={form.googleMapsLink} onChange={e => setF({ googleMapsLink: e.target.value })} placeholder="https://maps.google.com/…" />
            </div>

            {/* Housing metadata */}
            {form.category === "housing" && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Housing Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Room Type</label>
                    <select value={(meta.roomType as string) ?? ""} onChange={e => setMeta({ roomType: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select</option>
                      {["Single","Double","Triple"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Gender</label>
                    <select value={(meta.gender as string) ?? ""} onChange={e => setMeta({ gender: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select</option>
                      {["Boys","Girls","Unisex"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Rent Min (₹/mo)</label>
                    <Input type="number" value={(meta.rentMin as string) ?? ""} onChange={e => setMeta({ rentMin: e.target.value })} placeholder="e.g. 3000" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Rent Max (₹/mo)</label>
                    <Input type="number" value={(meta.rentMax as string) ?? ""} onChange={e => setMeta({ rentMax: e.target.value })} placeholder="e.g. 6000" />
                  </div>
                </div>
              </div>
            )}

            {/* Restaurant metadata */}
            {form.category === "restaurant" && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Restaurant Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Cuisine Type</label>
                    <select value={(meta.cuisineType as string) ?? ""} onChange={e => setMeta({ cuisineType: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select</option>
                      {["Indian","Chinese","Fast Food","Cafe"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Delivery Available</label>
                    <button type="button"
                      onClick={() => setMeta({ deliveryAvailable: !meta.deliveryAvailable })}
                      className={cn("relative mt-1 w-12 h-6 rounded-full transition-all outline-none", meta.deliveryAvailable ? "bg-emerald-500" : "bg-slate-300")}>
                      <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", meta.deliveryAvailable ? "left-7" : "left-1")} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Local Service metadata */}
            {form.category === "local_service" && (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Service Details</p>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Service Type</label>
                  <select value={(meta.serviceType as string) ?? ""} onChange={e => setMeta({ serviceType: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    {SERVICE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.category}>
                {saving ? "Saving…" : dialog?.mode === "add" ? "Add Listing" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Approve / Reject Dialog ──────────────────────────── */}
      <Dialog open={!!reviewing} onOpenChange={open => { if (!open) { setReviewing(null); setRejReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewing?.action === "approve" ? "Approve Listing" : "Reject Listing"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              {reviewing?.action === "approve"
                ? <>Approve <strong>"{reviewing.listing.name}"</strong>? It will become visible to students.</>
                : <>Reject <strong>"{reviewing?.listing?.name}"</strong>? Please provide a reason.</>}
            </p>
            {reviewing?.action === "reject" && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Rejection Reason *</label>
                <textarea value={rejReason} onChange={e => setRejReason(e.target.value)}
                  placeholder="Explain why this listing is being rejected…" rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setReviewing(null); setRejReason(""); }}>Cancel</Button>
              {reviewing?.action === "approve" ? (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>Approve</Button>
              ) : (
                <Button variant="destructive" onClick={handleReject} disabled={!rejReason.trim()}>Reject</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN MODERATOR PAGE
══════════════════════════════════════════════════════════════ */
type Tab = "toggles" | "materials" | "schedules" | "timetables" | "reports" | "listings";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "toggles",   label: "Feature Toggles", icon: ToggleRight },
  { id: "materials", label: "Study Materials",  icon: FileText },
  { id: "schedules", label: "Exam Schedules",   icon: Calendar },
  { id: "timetables",label: "Timetables",       icon: BookOpen },
  { id: "listings",  label: "Listings",         icon: Store },
  { id: "reports",   label: "Reports",          icon: Flag },
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
            {activeTab === "listings"   && <ListingsTab userName={userName} userId={userId} />}
            {activeTab === "reports"    && <ReportsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
