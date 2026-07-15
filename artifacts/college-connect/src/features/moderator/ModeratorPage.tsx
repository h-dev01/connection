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
  Store, Image as ImageIcon, Timer, Link2,
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

/* ─── Shared Moderator Filters bar ──────────────────────────────
   Time range (Today / Last 7 Days / Last 30 Days / Custom Range) +
   College → Course → Semester → Subject cascading dropdowns, plus an
   optional Section dropdown. Used across Feature Toggles, Study
   Materials, Exam Schedules and Timetables tabs.
   A Semester dropdown sits between Course and Subject — subjects belong
   to a specific course semester in the academic hierarchy, so it's kept
   as a required step to reach Subject, even though it isn't a distinct
   item in the original filter list.
─────────────────────────────────────────────────────────────── */
export type ModScope = {
  collegeId?: number;
  courseId?: number;
  semesterId?: number;
  subjectId?: number;
  section?: string;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  // Derived legacy text labels — kept for endpoints that still key on free text.
  courseCode?: string;
  semesterLabel?: string;
};

function ModeratorFilterBar({ scope, onChange, showSection = false, showSubject = true }: {
  scope: ModScope; onChange: (patch: Partial<ModScope>) => void; showSection?: boolean; showSubject?: boolean;
}) {
  const [colleges, setColleges]   = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses]     = useState<{ id: number; name: string; code: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: number; number: number; name: string }[]>([]);
  const [subjects, setSubjects]   = useState<{ id: number; name: string; code: string }[]>([]);
  const [timePreset, setTimePreset] = useState<"" | "today" | "last7" | "last30" | "custom">("");

  useEffect(() => { fetch("/api/colleges").then(r => r.ok ? r.json() : []).then(setColleges).catch(() => {}); }, []);
  useEffect(() => {
    if (!scope.collegeId) { setCourses([]); return; }
    fetch(`/api/colleges/${scope.collegeId}/courses`).then(r => r.ok ? r.json() : []).then(setCourses).catch(() => {});
  }, [scope.collegeId]);
  useEffect(() => {
    if (!scope.courseId) { setSemesters([]); return; }
    fetch(`/api/courses/${scope.courseId}/semesters`).then(r => r.ok ? r.json() : []).then(setSemesters).catch(() => {});
  }, [scope.courseId]);
  useEffect(() => {
    if (!scope.semesterId) { setSubjects([]); return; }
    fetch(`/api/semesters/${scope.semesterId}/subjects`).then(r => r.ok ? r.json() : []).then(setSubjects).catch(() => {});
  }, [scope.semesterId]);

  const applyPreset = (preset: "today" | "last7" | "last30") => {
    const now = new Date();
    const from = new Date(now);
    if (preset === "today") from.setHours(0, 0, 0, 0);
    if (preset === "last7") from.setDate(from.getDate() - 7);
    if (preset === "last30") from.setDate(from.getDate() - 30);
    setTimePreset(preset);
    onChange({ dateFrom: from.toISOString(), dateTo: now.toISOString() });
  };

  const selectCls = "h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex-wrap">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filters</span>

      {/* Time */}
      <select className={selectCls} value={timePreset} onChange={(e) => {
        const v = e.target.value as typeof timePreset;
        if (v === "today" || v === "last7" || v === "last30") applyPreset(v);
        else if (v === "custom") setTimePreset("custom");
        else { setTimePreset(""); onChange({ dateFrom: undefined, dateTo: undefined }); }
      }}>
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="last7">Last 7 Days</option>
        <option value="last30">Last 30 Days</option>
        <option value="custom">Custom Range</option>
      </select>
      {timePreset === "custom" && (
        <>
          <input type="date" className={selectCls} value={scope.dateFrom ? scope.dateFrom.slice(0, 10) : ""}
            onChange={(e) => onChange({ dateFrom: e.target.value ? new Date(`${e.target.value}T00:00:00`).toISOString() : undefined })} />
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" className={selectCls} value={scope.dateTo ? scope.dateTo.slice(0, 10) : ""}
            onChange={(e) => onChange({ dateTo: e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : undefined })} />
        </>
      )}

      {/* College */}
      <select className={selectCls} value={scope.collegeId ?? ""} onChange={(e) => {
        const id = e.target.value ? Number(e.target.value) : undefined;
        onChange({ collegeId: id, courseId: undefined, courseCode: undefined, semesterId: undefined, semesterLabel: undefined, subjectId: undefined });
      }}>
        <option value="">All Colleges</option>
        {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* Course */}
      <select className={selectCls} value={scope.courseId ?? ""} disabled={!scope.collegeId} onChange={(e) => {
        const id = e.target.value ? Number(e.target.value) : undefined;
        const c = courses.find((c) => c.id === id);
        onChange({ courseId: id, courseCode: c?.code, semesterId: undefined, semesterLabel: undefined, subjectId: undefined });
      }}>
        <option value="">All Courses</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* Semester — required intermediate step to reach Subject */}
      <select className={selectCls} value={scope.semesterId ?? ""} disabled={!scope.courseId} onChange={(e) => {
        const id = e.target.value ? Number(e.target.value) : undefined;
        const s = semesters.find((s) => s.id === id);
        onChange({ semesterId: id, semesterLabel: s?.name, subjectId: undefined });
      }}>
        <option value="">All Semesters</option>
        {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {showSection && (
        <select className={selectCls} value={scope.section ?? ""} onChange={(e) => onChange({ section: e.target.value || undefined })}>
          <option value="">All Sections</option>
          {SECTION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {showSubject && (
        <select className={selectCls} value={scope.subjectId ?? ""} disabled={!scope.semesterId} onChange={(e) => onChange({ subjectId: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE TOGGLES TAB
══════════════════════════════════════════════════════════════ */
function FeatureTogglesTab({ userName, userId }: { userName: string; userId?: number }) {
  const [scope, setScope] = useState<ModScope>({});
  const course = scope.courseCode ?? "CS301";
  const semester = scope.semesterLabel ?? "sem5";
  const [toggles, setToggles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const patchScope = (patch: Partial<ModScope>) => setScope((prev) => ({ ...prev, ...patch }));

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ course, semester });
    if (scope.collegeId)  p.set("collegeId",  String(scope.collegeId));
    if (scope.courseId)   p.set("courseId",   String(scope.courseId));
    if (scope.semesterId) p.set("semesterId", String(scope.semesterId));
    if (scope.subjectId)  p.set("subjectId",  String(scope.subjectId));
    if (scope.dateFrom)   p.set("dateFrom",   scope.dateFrom);
    if (scope.dateTo)     p.set("dateTo",     scope.dateTo);
    const r = await fetch(`/api/moderator/toggles?${p}`);
    if (r.ok) setToggles(await r.json());
    setLoading(false);
  }, [course, semester, scope.collegeId, scope.courseId, scope.semesterId, scope.subjectId, scope.dateFrom, scope.dateTo]);

  useEffect(() => { load(); }, [load]);

  const canWrite = !!(scope.courseId && scope.semesterId);

  const toggle = async (featureName: string, currentEnabled: boolean, forcedActive: boolean) => {
    if (forcedActive && !currentEnabled) return;
    if (forcedActive && currentEnabled) return;
    if (!canWrite) { setToast("Select a specific College, Course and Semester before toggling a feature."); setTimeout(() => setToast(null), 3500); return; }
    setSaving(featureName);
    const r = await fetch(`/api/moderator/toggles/${featureName}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course, semester, enabled: !currentEnabled, updatedByName: userName, updatedById: userId,
        collegeId: scope.collegeId, courseId: scope.courseId, semesterId: scope.semesterId, subjectId: scope.subjectId,
      }),
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
        <ModeratorFilterBar scope={scope} onChange={patchScope} />
      </div>
      {!canWrite && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select a specific College, Course and Semester above to toggle a feature. Showing platform-wide defaults for now.
        </p>
      )}

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
  const [scope, setScope] = useState<ModScope>({});
  const course = scope.courseCode ?? "CS301";
  const semester = scope.semesterLabel ?? "sem5";
  const patchScope = (patch: Partial<ModScope>) => setScope((prev) => ({ ...prev, ...patch }));
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
    const p = new URLSearchParams({ status: statusFilter });
    if (scope.collegeId)  p.set("collegeId",  String(scope.collegeId));
    if (scope.courseId)   p.set("courseId",   String(scope.courseId));
    if (scope.semesterId) p.set("semesterId", String(scope.semesterId));
    if (scope.subjectId)  p.set("subjectId",  String(scope.subjectId));
    if (scope.dateFrom)   p.set("dateFrom",   scope.dateFrom);
    if (scope.dateTo)     p.set("dateTo",     scope.dateTo);
    if (!scope.collegeId && !scope.courseId) { p.set("course", course); p.set("semester", semester); }
    const r = await fetch(`/api/moderator/materials?${p}`);
    if (r.ok) setMaterials(await r.json());
    setLoading(false);
  }, [statusFilter, course, semester, scope.collegeId, scope.courseId, scope.semesterId, scope.subjectId, scope.dateFrom, scope.dateTo]);

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
        <ModeratorFilterBar scope={scope} onChange={patchScope} />
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
  const [scope, setScope] = useState<ModScope>({});
  const course = scope.courseCode ?? "CS301";
  const semester = scope.semesterLabel ?? "sem5";
  const patchScope = (patch: Partial<ModScope>) => setScope((prev) => ({ ...prev, ...patch }));
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", examSession: "", dateFrom: "", dateTo: "", fileUrl: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const canWrite = !!(scope.courseId && scope.semesterId);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ course, semester });
    if (scope.collegeId)  p.set("collegeId",  String(scope.collegeId));
    if (scope.courseId)   p.set("courseId",   String(scope.courseId));
    if (scope.semesterId) p.set("semesterId", String(scope.semesterId));
    if (scope.subjectId)  p.set("subjectId",  String(scope.subjectId));
    if (scope.dateFrom)   p.set("dateFrom",   scope.dateFrom);
    if (scope.dateTo)     p.set("dateTo",     scope.dateTo);
    const r = await fetch(`/api/moderator/exam-schedules?${p}`);
    if (r.ok) setSchedules(await r.json());
    setLoading(false);
  }, [course, semester, scope.collegeId, scope.courseId, scope.semesterId, scope.subjectId, scope.dateFrom, scope.dateTo]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title || !form.examSession) { setError("Title and exam session are required."); return; }
    if (!canWrite) { setError("Select a specific College, Course and Semester before uploading."); return; }
    setSaving(true);
    setError("");
    const url = editing ? `/api/moderator/exam-schedules/${editing.id}` : "/api/moderator/exam-schedules";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, course, semester, uploaderName: userName,
        collegeId: scope.collegeId, courseId: scope.courseId, semesterId: scope.semesterId, subjectId: scope.subjectId,
      }),
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
          <ModeratorFilterBar scope={scope} onChange={patchScope} />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={openNew} disabled={!canWrite}
            title={!canWrite ? "Select a specific College, Course and Semester to upload." : undefined}>
            <Upload className="h-4 w-4 mr-1.5" /> Upload
          </Button>
        </div>
      </div>
      {!canWrite && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select a specific College, Course and Semester above to upload a date sheet.
        </p>
      )}

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
            <p className="font-semibold">No exam date sheets found</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={openNew} disabled={!canWrite}>
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
  const [scope, setScope] = useState<ModScope>({ section: "Section A" });
  const course = scope.courseCode ?? "CS301";
  const semester = scope.semesterLabel ?? "sem5";
  const section = scope.section ?? "Section A";
  const patchScope = (patch: Partial<ModScope>) => setScope((prev) => ({ ...prev, ...patch }));
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", section: "Section A", effectiveFrom: "", effectiveTo: "", fileUrl: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const canWrite = !!(scope.courseId && scope.semesterId);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ course, semester, section });
    if (scope.collegeId)  p.set("collegeId",  String(scope.collegeId));
    if (scope.courseId)   p.set("courseId",   String(scope.courseId));
    if (scope.semesterId) p.set("semesterId", String(scope.semesterId));
    if (scope.subjectId)  p.set("subjectId",  String(scope.subjectId));
    if (scope.dateFrom)   p.set("dateFrom",   scope.dateFrom);
    if (scope.dateTo)     p.set("dateTo",     scope.dateTo);
    const r = await fetch(`/api/moderator/timetables?${p}`);
    if (r.ok) setTimetables(await r.json());
    setLoading(false);
  }, [course, semester, section, scope.collegeId, scope.courseId, scope.semesterId, scope.subjectId, scope.dateFrom, scope.dateTo]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title || !form.section) { setError("Title and section are required."); return; }
    if (!canWrite) { setError("Select a specific College, Course and Semester before uploading."); return; }
    setSaving(true);
    setError("");
    const url = editing ? `/api/moderator/timetables/${editing.id}` : "/api/moderator/timetables";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, course, semester, uploaderName: userName,
        collegeId: scope.collegeId, courseId: scope.courseId, semesterId: scope.semesterId, subjectId: scope.subjectId,
      }),
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
          <ModeratorFilterBar scope={scope} onChange={patchScope} showSection />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={openNew} disabled={!canWrite}
            title={!canWrite ? "Select a specific College, Course and Semester to upload." : undefined}>
            <Upload className="h-4 w-4 mr-1.5" /> Upload
          </Button>
        </div>
      </div>
      {!canWrite && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select a specific College, Course and Semester above to upload a timetable.
        </p>
      )}

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
            <p className="font-semibold">No timetables found for {section}</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={openNew} disabled={!canWrite}>
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
const CUISINE_TYPES = ["Indian","Chinese","Fast Food","Cafe"];

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
  return {
    category: cat, name: "", photos: [] as string[], description: "",
    address: "", contactNumber: "", googleMapsLink: "",
    metadata: {} as Record<string, unknown>,
    collegeId: undefined as number | undefined, collegeName: "",
    priorityScore: 0, displayDate: "",
  };
}

/** ISO datetime → "YYYY-MM-DDThh:mm" for <input type="datetime-local"> */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  try { return new Date(iso).toISOString().slice(0, 16); } catch { return ""; }
}

/** "YYYY-MM-DDThh:mm" → full ISO string for the API */
function fromDatetimeLocal(v: string): string {
  if (!v) return "";
  return new Date(v).toISOString();
}

/* ══════════════════════════════════════════════════════════════
   BANNERS TAB — rotating ad banners for Study Hub & Marketplace
══════════════════════════════════════════════════════════════ */
const PLACEMENT_OPTIONS = [
  { value: "both",        label: "Study Hub + Marketplace" },
  { value: "study",       label: "Study Hub only" },
  { value: "marketplace", label: "Marketplace only" },
] as const;

const LINK_TYPE_OPTIONS = [
  { value: "none",          label: "No link" },
  { value: "restaurant",    label: "Connect to Restaurants" },
  { value: "pg",            label: "Connect to PG / Housing" },
  { value: "local_service", label: "Connect to Local Services" },
] as const;

function blankBannerForm() {
  return {
    title: "", subtitle: "", imageUrl: "",
    placement: "both" as "both" | "study" | "marketplace",
    linkType: "none" as "none" | "restaurant" | "pg" | "local_service",
    durationSec: 5,
    status: "active" as "active" | "inactive",
    // Empty array = shown to every college. Non-empty = only those colleges.
    collegeIds: [] as number[],
  };
}

function BannersTab({ userName, userId }: { userName: string; userId?: number }) {
  const [banners, setBanners] = useState<any[]>([]);
  const [colleges, setColleges] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [dialog, setDialog] = useState<{ mode: "add" | "edit"; banner?: any } | null>(null);
  const [form, setForm] = useState(blankBannerForm());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { fetch("/api/colleges").then(r => r.ok ? r.json() : []).then(setColleges).catch(() => {}); }, []);

  const collegeName = (id: number) => colleges.find(c => c.id === id)?.name ?? `#${id}`;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/moderator/banners");
    if (r.ok) setBanners(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setF = (patch: Partial<ReturnType<typeof blankBannerForm>>) => setForm(prev => ({ ...prev, ...patch }));

  const openAdd = () => { setForm(blankBannerForm()); setDialog({ mode: "add" }); };
  const openEdit = (banner: any) => {
    setForm({
      title: banner.title, subtitle: banner.subtitle ?? "", imageUrl: banner.imageUrl,
      placement: banner.placement, linkType: banner.linkType,
      durationSec: Math.round((banner.durationMs ?? 5000) / 1000),
      status: banner.status, collegeIds: Array.isArray(banner.collegeIds) ? banner.collegeIds : [],
    });
    setDialog({ mode: "edit", banner });
  };

  const toggleCollege = (id: number) => setF({
    collegeIds: form.collegeIds.includes(id) ? form.collegeIds.filter(c => c !== id) : [...form.collegeIds, id],
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl) return;
    setSaving(true);
    const payload = {
      title: form.title, subtitle: form.subtitle, imageUrl: form.imageUrl,
      placement: form.placement, linkType: form.linkType,
      durationMs: Math.min(15000, Math.max(2000, Number(form.durationSec) * 1000 || 5000)),
      status: form.status, collegeIds: form.collegeIds,
      addedByModerator: userName, addedByModeratorId: userId,
    };
    const isAdd = dialog?.mode === "add";
    const url = isAdd ? "/api/moderator/banners" : `/api/moderator/banners/${dialog?.banner?.id}`;
    const method = isAdd ? "POST" : "PATCH";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) {
      setDialog(null);
      showToast(isAdd ? "Banner added." : "Banner updated.");
      load();
    } else {
      const err = await r.json().catch(() => ({}));
      showToast((err as any).error || "Failed to save.", "error");
    }
  };

  const handleToggleStatus = async (banner: any) => {
    const r = await fetch(`/api/moderator/banners/${banner.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: banner.status === "active" ? "inactive" : "active", addedByModerator: userName }),
    });
    if (r.ok) { load(); } else showToast("Failed to update.", "error");
  };

  const handleDelete = async (id: number) => {
    const r = await fetch(`/api/moderator/banners/${id}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedBy: userName }),
    });
    if (r.ok) { showToast("Banner deleted."); load(); }
    else showToast("Failed to delete.", "error");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ad Banners</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Rotating banners shown on Study Hub and Marketplace. Recommended image size: 1200×400px (all banners display at a fixed size regardless of the upload).
          </p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

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

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading banners…</div>
      ) : banners.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ImageIcon className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No banners yet.</p>
          <p className="text-sm mt-1">Add one to promote restaurants, PGs or local services.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex gap-4">
              <img src={b.imageUrl} alt={b.title} className="w-28 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">{b.title}</span>
                  <Badge className={cn("text-xs border capitalize", b.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                    {b.status}
                  </Badge>
                </div>
                {b.subtitle && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.subtitle}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
                  <span>📍 {PLACEMENT_OPTIONS.find(p => p.value === b.placement)?.label ?? b.placement}</span>
                  <span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" />{LINK_TYPE_OPTIONS.find(l => l.value === b.linkType)?.label ?? b.linkType}</span>
                  <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" />{Math.round((b.durationMs ?? 5000) / 1000)}s</span>
                  <span className="inline-flex items-center gap-1">
                    🎓 {Array.isArray(b.collegeIds) && b.collegeIds.length > 0
                      ? b.collegeIds.map((id: number) => collegeName(id)).join(", ")
                      : "All Colleges"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-slate-400">
                  <span>By {b.addedByModerator}</span>
                  <span>· {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:bg-slate-50" onClick={() => handleToggleStatus(b)}>
                  {b.status === "active" ? <ToggleRight className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <ToggleLeft className="h-3.5 w-3.5 mr-1" />}
                  {b.status === "active" ? "Active" : "Inactive"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:bg-slate-50" onClick={() => openEdit(b)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-50" onClick={() => handleDelete(b.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "add" ? "Add Banner" : "Edit Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Banner Image *</label>
              <p className="text-xs text-slate-400 mb-2">Recommended size 1200×400px — it will always display at a fixed size on the page.</p>
              {form.imageUrl ? (
                <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/1]">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setF({ imageUrl: "" })}
                    className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className={cn(
                  "flex flex-col items-center justify-center gap-1 aspect-[3/1] rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors",
                  uploadingImage && "opacity-50 pointer-events-none",
                )}>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const fd = new FormData();
                        fd.append("image", file);
                        const r = await fetch("/api/moderator/upload", { method: "POST", body: fd });
                        if (r.ok) {
                          const { url } = await r.json();
                          setF({ imageUrl: url });
                        } else {
                          const err = await r.json().catch(() => ({}));
                          showToast((err as any).error || "Upload failed.", "error");
                        }
                      } catch {
                        showToast("Upload failed.", "error");
                      } finally {
                        setUploadingImage(false);
                      }
                    }} />
                  {uploadingImage ? <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" /> : (
                    <>
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-400">Upload Image</span>
                    </>
                  )}
                </label>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Title *</label>
              <Input value={form.title} onChange={e => setF({ title: e.target.value })} placeholder="e.g. 20% off at Spice Garden" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Subtitle</label>
              <Input value={form.subtitle} onChange={e => setF({ subtitle: e.target.value })} placeholder="Short supporting line" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Show on</label>
              <select value={form.placement} onChange={e => setF({ placement: e.target.value as typeof form.placement })}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PLACEMENT_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">On click</label>
              <select value={form.linkType} onChange={e => setF({ linkType: e.target.value as typeof form.linkType })}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {LINK_TYPE_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">Opens the matching Marketplace tab (Restaurants / Housing / Local Services).</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Rotation duration (seconds)</label>
              <Input type="number" min={2} max={15} value={form.durationSec}
                onChange={e => setF({ durationSec: Number(e.target.value) || 5 })} />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Status</label>
              <select value={form.status} onChange={e => setF({ status: e.target.value as typeof form.status })}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Colleges</label>
              <p className="text-xs text-slate-400 mb-2">
                Leave everything unchecked to show this banner to every college. Check one or more to target only those colleges.
              </p>
              {colleges.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No colleges set up yet — this banner will show to all colleges.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {colleges.map(c => (
                    <label key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={form.collegeIds.includes(c.id)} onChange={() => toggleCollege(c.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1.5">
                {form.collegeIds.length === 0 ? "Showing to: All Colleges" : `Showing to: ${form.collegeIds.map(id => collegeName(id)).join(", ")}`}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
              <Button disabled={!form.title.trim() || !form.imageUrl || saving} onClick={handleSave}>
                {saving ? "Saving…" : dialog?.mode === "add" ? "Add Banner" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
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
  const [fCuisines,  setFCuisines]  = useState<string[]>([]);
  const [fDelivery,  setFDelivery]  = useState("");
  const [fService,   setFService]   = useState("");

  const [listings, setListings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Add / Edit dialog
  const [dialog,  setDialog]  = useState<{ mode: "add" | "edit"; listing?: any } | null>(null);
  const [form,    setForm]    = useState<ReturnType<typeof blankForm>>(blankForm());
  const [saving,  setSaving]  = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    if (fCuisines.length)  p.set("cuisineTypes", fCuisines.join(","));
    if (fDelivery)         p.set("deliveryAvailable", fDelivery);
    if (fService)          p.set("serviceType", fService);
    const r = await fetch(`/api/moderator/local-listings?${p}`);
    if (r.ok) setListings(await r.json());
    setLoading(false);
  }, [filterCollegeId, filterCategory, statusFilter, search, fRoomType, fGender, fCuisines, fDelivery, fService]);

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
    // Migrate legacy single `cuisineType` string to the multi-select `cuisineTypes` array.
    if (!Array.isArray(metadata.cuisineTypes) && typeof metadata.cuisineType === "string" && metadata.cuisineType) {
      metadata = { ...metadata, cuisineTypes: [metadata.cuisineType] };
    }
    setForm({
      ...listing,
      metadata, photos,
      priorityScore: listing.priorityScore ?? 0,
      displayDate: toDatetimeLocal(listing.displayDate),
    });
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
      priorityScore: Number(form.priorityScore) || 0,
      displayDate: form.displayDate ? fromDatetimeLocal(form.displayDate) : "",
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
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFRoomType(""); setFGender(""); setFCuisines([]); setFDelivery(""); setFService(""); }}
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
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuisine</span>
            {CUISINE_TYPES.map(v => (
              <label key={v} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={fCuisines.includes(v)}
                  onChange={e => setFCuisines(prev => e.target.checked ? [...prev, v] : prev.filter(c => c !== v))}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-blue-600" />
                {v}
              </label>
            ))}
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
                    {(Array.isArray(meta2.cuisineTypes) ? meta2.cuisineTypes : meta2.cuisineType ? [meta2.cuisineType] : []).length > 0 && (
                      <span>🍽 {(Array.isArray(meta2.cuisineTypes) ? meta2.cuisineTypes : [meta2.cuisineType]).join(", ")}</span>
                    )}
                    {meta2.deliveryAvailable === true && <span>🛵 Delivery</span>}
                    {meta2.serviceType && (
                      <span>🔧 {meta2.serviceType === "Other" && meta2.serviceTypeOther ? meta2.serviceTypeOther : meta2.serviceType}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span>By {listing.addedByModerator}</span>
                    <span>· {new Date(listing.createdAt).toLocaleDateString()}</span>
                    {photos.length > 1 && <span>· {photos.length} photos</span>}
                    {listing.rejectionReason && (
                      <span className="text-red-400">· Rejected: {listing.rejectionReason}</span>
                    )}
                  </div>
                  {/* Internal ordering info — moderator-only */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500">
                      Priority&nbsp;<span className="text-slate-700">{listing.priorityScore ?? 0}</span>
                    </span>
                    {listing.displayDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500">
                        Display&nbsp;<span className="text-slate-700">{new Date(listing.displayDate).toLocaleDateString()}</span>
                      </span>
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
              <label className="text-sm font-semibold text-slate-700 block mb-1">Photos</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {form.photos.filter(Boolean).map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setF({ photos: form.photos.filter((_, j) => j !== i) })}
                      className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className={cn(
                  "aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors",
                  uploadingPhoto && "opacity-50 pointer-events-none",
                )}>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setUploadingPhoto(true);
                      try {
                        const fd = new FormData();
                        fd.append("image", file);
                        const r = await fetch("/api/moderator/upload", { method: "POST", body: fd });
                        if (r.ok) {
                          const { url } = await r.json();
                          setF({ photos: [...form.photos.filter(Boolean), url] });
                        } else {
                          const err = await r.json().catch(() => ({}));
                          showToast((err as any).error || "Upload failed.", "error");
                        }
                      } catch {
                        showToast("Upload failed.", "error");
                      } finally {
                        setUploadingPhoto(false);
                      }
                    }} />
                  {uploadingPhoto ? (
                    <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-400">Upload</span>
                    </>
                  )}
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">JPEG, PNG, WEBP, GIF or AVIF. Max 8 MB per photo.</p>
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
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Cuisine Type <span className="text-slate-400 font-normal">(select any that apply)</span></label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {CUISINE_TYPES.map(v => {
                        const selected: string[] = Array.isArray(meta.cuisineTypes) ? meta.cuisineTypes : [];
                        return (
                          <label key={v} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={selected.includes(v)}
                              onChange={e => setMeta({ cuisineTypes: e.target.checked ? [...selected, v] : selected.filter(c => c !== v) })}
                              className="h-4 w-4 rounded border-slate-300 accent-orange-600" />
                            {v}
                          </label>
                        );
                      })}
                    </div>
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
                {/* Menu Photos */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Menu Photos <span className="text-slate-400 font-normal">(students can view these)</span></label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(Array.isArray(meta.menuPhotos) ? meta.menuPhotos as string[] : []).map((src: string, i: number) => (
                      <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={src} alt={`menu-${i}`} className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setMeta({ menuPhotos: (Array.isArray(meta.menuPhotos) ? meta.menuPhotos as string[] : []).filter((_: string, idx: number) => idx !== i) })}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] text-slate-400 mt-1">Add Photo</span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = evt => {
                            const dataUrl = evt.target?.result as string;
                            const existing = Array.isArray(meta.menuPhotos) ? meta.menuPhotos as string[] : [];
                            setMeta({ menuPhotos: [...existing, dataUrl] });
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }} />
                    </label>
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
                  <select value={(meta.serviceType as string) ?? ""} onChange={e => setMeta({ serviceType: e.target.value, ...(e.target.value !== "Other" ? { serviceTypeOther: "" } : {}) })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    {SERVICE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {meta.serviceType === "Other" && (
                    <Input className="mt-2" value={(meta.serviceTypeOther as string) ?? ""}
                      onChange={e => setMeta({ serviceTypeOther: e.target.value })}
                      placeholder="Enter custom service name…" />
                  )}
                </div>
              </div>
            )}

            {/* ── Internal ordering fields (moderator-only) ─────── */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Internal Settings</span>
                <span className="text-[10px] text-slate-400 font-normal">(not visible to students)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Priority Score</label>
                  <Input
                    type="number" min={0}
                    value={form.priorityScore}
                    onChange={e => setF({ priorityScore: Number(e.target.value) })}
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Higher = appears first. Default: 0.</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Display Date</label>
                  <input
                    type="datetime-local"
                    value={form.displayDate}
                    onChange={e => setF({ displayDate: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tiebreaker when priority scores match. Newer wins.</p>
                </div>
              </div>
            </div>

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
type Tab = "toggles" | "materials" | "schedules" | "timetables" | "reports" | "listings" | "banners";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "toggles",   label: "Feature Toggles", icon: ToggleRight },
  { id: "materials", label: "Study Materials",  icon: FileText },
  { id: "schedules", label: "Exam Schedules",   icon: Calendar },
  { id: "timetables",label: "Timetables",       icon: BookOpen },
  { id: "listings",  label: "Listings",         icon: Store },
  { id: "banners",   label: "Ad Banners",       icon: ImageIcon },
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
            {activeTab === "banners"    && <BannersTab userName={userName} userId={userId} />}
            {activeTab === "reports"    && <ReportsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
