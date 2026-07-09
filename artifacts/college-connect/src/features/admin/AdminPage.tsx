/**
 * Admin Dashboard
 * Tabs: Overview · Semesters · Feature Registry · Moderators · Audit Log
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Settings, Download, Activity, AlertTriangle, CheckCircle,
  Server, Database, Users, ShieldAlert, TrendingUp, ShoppingBag,
  BookOpen, Plus, Pencil, Trash2, Archive, RefreshCw, X, Check,
  Shield, Layers, ClipboardList, ToggleLeft, ToggleRight, Eye,
  ChevronRight, Search, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const chartData = [
  { name: "Mon", users: 38000 }, { name: "Tue", users: 42000 },
  { name: "Wed", users: 41500 }, { name: "Thu", users: 45000 },
  { name: "Fri", users: 48000 }, { name: "Sat", users: 32000 }, { name: "Sun", users: 35000 },
];

const SYSTEM_ALERTS = [
  { icon: AlertTriangle, color: "text-amber-500 bg-amber-50", msg: "High CPU latency detected on API cluster (>250ms)", time: "2m ago" },
  { icon: CheckCircle, color: "text-emerald-500 bg-emerald-50", msg: "Nightly DB backup completed successfully", time: "1h ago" },
  { icon: AlertTriangle, color: "text-red-500 bg-red-50", msg: "API v1 deprecation — 14 clients still on legacy endpoints", time: "3h ago" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

const DEFAULT_FEATURES = [
  { name: "study_hub", label: "Study & Career Hub", description: "Parent container — turning this off hides the entire Study Hub and all its sub-features for every student.", defaultEnabled: true, forcedActive: false, globalEnabled: true, parentName: null },
  { name: "study_materials", label: "Study Materials", description: "Study material library, browsing and uploads", defaultEnabled: true, forcedActive: false, globalEnabled: true, parentName: "study_hub" },
  { name: "ai_summarizer", label: "AI Summarizer", description: "AI-powered document summarizer", defaultEnabled: true, forcedActive: false, globalEnabled: true, parentName: "study_hub" },
  { name: "exam_prep_hub", label: "Exam Prep Hub", description: "Past papers and exam preparation tools", defaultEnabled: true, forcedActive: false, globalEnabled: true, parentName: "study_hub" },
  { name: "academic_tools", label: "Academic Tools", description: "Smart timetable and GPA calculator", defaultEnabled: true, forcedActive: false, globalEnabled: true, parentName: "study_hub" },
  { name: "career_corner", label: "Career Corner", description: "Internship listings and resume builder", defaultEnabled: true, forcedActive: false, globalEnabled: true, parentName: "study_hub" },
  { name: "campus_match", label: "Campus Match", description: "Peer and roommate matching feature", defaultEnabled: false, forcedActive: false, globalEnabled: false, parentName: null },
];

/* ─── Toggle switch ─────────────────────────────────────────── */
function ToggleSwitch({ checked, onChange, disabled, color = "emerald" }: { checked: boolean; onChange: () => void; disabled?: boolean; color?: "emerald" | "blue" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        checked ? (color === "blue" ? "bg-blue-600" : "bg-emerald-500") : "bg-slate-300"
      )}
    >
      <span className={cn("inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE TOGGLE PANEL (Admin Only) — master switchboard
══════════════════════════════════════════════════════════════ */
function FeatureToggleTab({ actorName }: { actorName: string }) {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/features");
    setFeatures(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const flip = async (f: any) => {
    setBusyId(f.id);
    await fetch(`/api/admin/features/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ globalEnabled: !f.globalEnabled, actorName }),
    });
    await load();
    setBusyId(null);
  };

  const parents = features.filter((f) => !f.parentName && !f.retired);
  const childrenOf = (name: string) => features.filter((f) => f.parentName === name && !f.retired);

  if (loading) return <div className="py-12 text-center text-slate-400">Loading…</div>;

  if (features.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Layers className="h-10 w-10 mx-auto mb-3 text-slate-200" />
        <p>No features registered yet.</p>
        <p className="text-sm mt-1">Seed defaults from the Feature Registry tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Feature Toggle Panel</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Master switchboard for the entire platform. Turning a feature OFF here removes it from the student
          interface globally — including for every course and semester.
        </p>
      </div>

      <div className="space-y-3">
        {parents.map((parent) => {
          const kids = childrenOf(parent.name);
          const parentOn = parent.forcedActive || parent.globalEnabled;
          return (
            <Card key={parent.id} className="border border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="px-5 py-4 flex items-start gap-4 bg-slate-50/70 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{parent.label}</span>
                    <code className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{parent.name}</code>
                    {parent.forcedActive && <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">Forced Active</Badge>}
                    {kids.length > 0 && <Badge className="text-xs bg-slate-100 text-slate-500 border-slate-200">{kids.length} sub-feature{kids.length > 1 ? "s" : ""}</Badge>}
                  </div>
                  {parent.description && <p className="text-xs text-slate-500 mt-1">{parent.description}</p>}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={cn("text-xs font-semibold", parentOn ? "text-emerald-600" : "text-slate-400")}>
                    {parentOn ? "ON" : "OFF"}
                  </span>
                  <ToggleSwitch checked={parentOn} disabled={parent.forcedActive || busyId === parent.id} onChange={() => flip(parent)} color="blue" />
                </div>
              </div>

              {kids.length > 0 && (
                <div className={cn("divide-y divide-slate-50", !parentOn && "opacity-50")}>
                  {kids.map((child) => {
                    const childOn = child.forcedActive || child.globalEnabled;
                    const effectivelyOn = parentOn && childOn;
                    return (
                      <div key={child.id} className="pl-8 pr-5 py-3 flex items-center gap-4">
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-800">{child.label}</span>
                            <code className="text-[11px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono">{child.name}</code>
                            {child.forcedActive && <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">Forced Active</Badge>}
                          </div>
                          {child.description && <p className="text-xs text-slate-400 mt-0.5">{child.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-semibold", effectivelyOn ? "text-emerald-600" : "text-slate-400")}>
                            {!parentOn ? "Hidden" : childOn ? "ON" : "OFF"}
                          </span>
                          <ToggleSwitch checked={childOn} disabled={!parentOn || child.forcedActive || busyId === child.id} onChange={() => flip(child)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Generic helpers ───────────────────────────────────────── */
function SectionEmpty({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-slate-100 rounded-2xl mb-4"><Layers className="h-8 w-8 text-slate-400" /></div>
      <p className="font-semibold text-slate-700 mb-1">No {label} yet</p>
      <p className="text-sm text-slate-400 mb-4">Add one to get started.</p>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> Add {label}
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SEMESTERS TAB
══════════════════════════════════════════════════════════════ */
function SemestersTab({ actorName }: { actorName: string }) {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", startDate: "", endDate: "", status: "upcoming" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/semesters");
    setSemesters(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: "", code: "", startDate: "", endDate: "", status: "upcoming" }); setEditing(null); setError(""); setShowForm(true); };
  const openEdit = (s: any) => { setForm({ name: s.name, code: s.code, startDate: s.startDate ?? "", endDate: s.endDate ?? "", status: s.status }); setEditing(s); setError(""); setShowForm(true); };

  const save = async () => {
    if (!form.name || !form.code) { setError("Name and code are required."); return; }
    setSaving(true);
    setError("");
    const url = editing ? `/api/admin/semesters/${editing.id}` : "/api/admin/semesters";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, actorName }) });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) { setError(data.error ?? "Failed to save."); return; }
    setShowForm(false);
    load();
  };

  const archive = async (id: number) => {
    await fetch(`/api/admin/semesters/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "archived", actorName }) });
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/admin/semesters/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Semesters</h2>
          <p className="text-sm text-slate-500 mt-0.5">Define the semester registry used across all moderator scopes.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Semester
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading…</div>
      ) : semesters.length === 0 ? (
        <SectionEmpty label="Semester" onAdd={openNew} />
      ) : (
        <div className="space-y-2">
          {semesters.map((s) => (
            <div key={s.id} className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{s.code}</code>
                  <Badge className={cn("text-xs border capitalize", STATUS_COLORS[s.status] ?? "bg-slate-100 text-slate-500")}>{s.status}</Badge>
                </div>
                {(s.startDate || s.endDate) && (
                  <p className="text-xs text-slate-400 mt-1">{s.startDate ?? "?"} → {s.endDate ?? "?"}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {s.status !== "archived" && (
                  <Button size="sm" variant="ghost" className="text-slate-500 hover:text-amber-600 h-8 px-2" onClick={() => archive(s.id)} title="Archive">
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-600 h-8 px-2" onClick={() => openEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-red-600 h-8 px-2" onClick={() => del(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Semester" : "Add Semester"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Semester Name *</label>
              <Input placeholder="e.g. Semester 5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Code *</label>
              <Input placeholder="e.g. sem5" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Start Date</label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">End Date</label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Status</label>
              <select className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={saving} onClick={save}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Semester"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE REGISTRY TAB
══════════════════════════════════════════════════════════════ */
function FeaturesTab({ actorName }: { actorName: string }) {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", label: "", description: "", defaultEnabled: true, forcedActive: false });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/features");
    setFeatures(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const seedDefaults = async () => {
    setSeeding(true);
    for (const f of DEFAULT_FEATURES) {
      await fetch("/api/admin/features", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, actorName }) });
    }
    setSeeding(false);
    load();
  };

  const openNew = () => { setForm({ name: "", label: "", description: "", defaultEnabled: true, forcedActive: false }); setEditing(null); setError(""); setShowForm(true); };
  const openEdit = (f: any) => { setForm({ name: f.name, label: f.label, description: f.description ?? "", defaultEnabled: f.defaultEnabled, forcedActive: f.forcedActive }); setEditing(f); setError(""); setShowForm(true); };

  const save = async () => {
    if (!form.name || !form.label) { setError("Name and label are required."); return; }
    setSaving(true);
    setError("");
    const url = editing ? `/api/admin/features/${editing.id}` : "/api/admin/features";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, actorName }) });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) { setError(data.error ?? "Failed to save."); return; }
    setShowForm(false);
    load();
  };

  const toggle = async (f: any, key: "defaultEnabled" | "forcedActive") => {
    await fetch(`/api/admin/features/${f.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: !f[key], actorName }) });
    load();
  };

  const retire = async (f: any) => {
    await fetch(`/api/admin/features/${f.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ retired: !f.retired, actorName }) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Feature Registry</h2>
          <p className="text-sm text-slate-500 mt-0.5">Define which features Moderators can toggle on/off for students.</p>
        </div>
        <div className="flex gap-2">
          {features.length === 0 && (
            <Button variant="outline" className="font-semibold" disabled={seeding} onClick={seedDefaults}>
              <RefreshCw className={cn("h-4 w-4 mr-1.5", seeding && "animate-spin")} />
              {seeding ? "Seeding…" : "Seed Defaults"}
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Feature
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading…</div>
      ) : features.length === 0 ? (
        <SectionEmpty label="Feature" onAdd={openNew} />
      ) : (
        <div className="space-y-2">
          {features.map((f) => (
            <div key={f.id} className={cn("bg-white rounded-xl border px-5 py-4 shadow-sm", f.retired ? "opacity-60 border-slate-200" : "border-slate-200")}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{f.label}</span>
                    <code className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{f.name}</code>
                    {f.forcedActive && <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">Forced Active</Badge>}
                    {f.retired && <Badge className="text-xs bg-slate-100 text-slate-400 border-slate-200">Retired</Badge>}
                  </div>
                  {f.description && <p className="text-xs text-slate-500 mt-1">{f.description}</p>}

                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => toggle(f, "defaultEnabled")} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors">
                      {f.defaultEnabled ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4 text-slate-300" />}
                      Default {f.defaultEnabled ? "On" : "Off"}
                    </button>
                    <button onClick={() => toggle(f, "forcedActive")} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-violet-600 transition-colors">
                      <Shield className={cn("h-4 w-4", f.forcedActive ? "text-violet-500" : "text-slate-300")} />
                      {f.forcedActive ? "Forced Active" : "Set Forced"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-blue-600" onClick={() => openEdit(f)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className={cn("h-8 px-2", f.retired ? "text-emerald-500 hover:text-emerald-600" : "text-slate-400 hover:text-amber-600")} onClick={() => retire(f)} title={f.retired ? "Restore" : "Retire"}>
                    {f.retired ? <RefreshCw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Feature" : "Add Feature"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Internal Name *</label>
              <Input placeholder="e.g. ai_summarizer" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })} disabled={!!editing} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Display Label *</label>
              <Input placeholder="e.g. AI Summarizer" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
              <Input placeholder="Brief description of what this feature does" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.defaultEnabled} onChange={(e) => setForm({ ...form, defaultEnabled: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 font-medium">Default Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.forcedActive} onChange={(e) => setForm({ ...form, forcedActive: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 font-medium">Forced Active</span>
              </label>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={saving} onClick={save}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Feature"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODERATORS TAB
══════════════════════════════════════════════════════════════ */
const COURSE_OPTIONS = ["CS301", "CS302", "CS401", "CS405", "ME301", "EE401", "CE301", "BT201"];
const SEM_OPTIONS = ["sem1", "sem2", "sem3", "sem4", "sem5", "sem6", "sem7", "sem8"];

function ModeratorsTab({ actorName }: { actorName: string }) {
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [scopeRows, setScopeRows] = useState<{ course: string; semester: string }[]>([{ course: "CS301", semester: "sem5" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/moderators");
    setMods(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scopes: scopeRows.filter((s) => s.course && s.semester), actorName }),
    });
    const data = await r.json();
    setSaving(false);
    if (!r.ok) { setError(data.error ?? "Failed to create."); return; }
    setShowForm(false);
    setForm({ name: "", email: "" });
    setScopeRows([{ course: "CS301", semester: "sem5" }]);
    load();
  };

  const toggleStatus = async (mod: any) => {
    const newStatus = mod.verified ? "suspended" : "active";
    await fetch(`/api/admin/moderators/${mod.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, actorName }),
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Moderators</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage moderator accounts with course/semester scope assignments.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => { setShowForm(true); setError(""); }}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Moderator
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading…</div>
      ) : mods.length === 0 ? (
        <SectionEmpty label="Moderator" onAdd={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {mods.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
                    {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <Badge className={cn("text-xs border", m.verified ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-600 border-red-200")}>
                      {m.verified ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{m.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(m.scopes ?? []).length === 0 ? (
                      <span className="text-xs text-slate-400">No scope assigned</span>
                    ) : (m.scopes ?? []).map((s: any, i: number) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                        {s.course} × {s.semester}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className={cn("h-8 text-xs font-semibold", m.verified ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50")} onClick={() => toggleStatus(m)}>
                    {m.verified ? "Suspend" : "Activate"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-blue-600" onClick={() => setSelected(m)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Moderator</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name *</label>
                <Input placeholder="Priya Nair" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email *</label>
                <Input type="email" placeholder="priya@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Scope Assignments</label>
              <div className="space-y-2">
                {scopeRows.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={s.course} onChange={(e) => setScopeRows((r) => r.map((x, j) => j === i ? { ...x, course: e.target.value } : x))}>
                      {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <X className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <select className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={s.semester} onChange={(e) => setScopeRows((r) => r.map((x, j) => j === i ? { ...x, semester: e.target.value } : x))}>
                      {SEM_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {scopeRows.length > 1 && (
                      <button onClick={() => setScopeRows((r) => r.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setScopeRows((r) => [...r, { course: "CS301", semester: "sem5" }])}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                  <Plus className="h-3.5 w-3.5" /> Add another scope
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={saving} onClick={save}>
                {saving ? "Creating…" : "Create Moderator"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AUDIT LOG TAB
══════════════════════════════════════════════════════════════ */
const ACTION_COLORS: Record<string, string> = {
  approve_material: "text-emerald-600 bg-emerald-50",
  reject_material: "text-red-600 bg-red-50",
  toggle_feature: "text-blue-600 bg-blue-50",
  upload_exam_schedule: "text-violet-600 bg-violet-50",
  upload_timetable: "text-violet-600 bg-violet-50",
  create_semester: "text-amber-600 bg-amber-50",
  create_moderator: "text-indigo-600 bg-indigo-50",
  update_moderator: "text-indigo-600 bg-indigo-50",
  default: "text-slate-600 bg-slate-100",
};

function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-log").then((r) => r.json()).then(setLogs).finally(() => setLoading(false));
  }, []);

  const fmt = (dt: string) => new Date(dt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Audit Log</h2>
        <p className="text-sm text-slate-500 mt-0.5">Immutable record of all admin and moderator actions.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading…</div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ClipboardList className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p>No audit events yet. Actions appear here as admins and moderators work.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map((l) => {
            const style = ACTION_COLORS[l.action] ?? ACTION_COLORS.default;
            return (
              <div key={l.id} className="bg-white rounded-xl border border-slate-200 px-5 py-3.5 shadow-sm flex items-center gap-4">
                <div className={cn("text-xs font-bold px-2 py-1 rounded-lg capitalize min-w-fit", style)}>
                  {l.action.replace(/_/g, " ")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">
                    <strong>{l.actorName}</strong>
                    {l.entityLabel ? <> → <span className="text-slate-600">{l.entityLabel}</span></> : null}
                    {l.afterState ? <> <span className="text-slate-400">({l.beforeState ?? "—"} → {l.afterState})</span></> : null}
                  </p>
                  {l.scope && <p className="text-xs text-slate-400 mt-0.5">Scope: {l.scope}</p>}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{fmt(l.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════════════════════ */
type Tab = "overview" | "semesters" | "toggles" | "features" | "moderators" | "audit";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "semesters", label: "Semesters", icon: BookOpen },
  { id: "toggles", label: "Feature Toggles", icon: ToggleRight },
  { id: "features", label: "Feature Registry", icon: Layers },
  { id: "moderators", label: "Moderators", icon: Shield },
  { id: "audit", label: "Audit Log", icon: ClipboardList },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { user } = useAuth();
  const actorName = user?.name ?? "Admin";

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === t.id ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}>
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <Avatar className="h-9 w-9 border border-slate-200 cursor-pointer">
              <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
              <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Health Dashboard</h1>
                    <p className="text-slate-500 mt-1 text-base font-medium">System-wide monitoring and moderation hub.</p>
                  </div>
                  <Button variant="outline" className="border-slate-200 font-semibold bg-white">
                    <Download className="mr-2 h-4 w-4" /> Export Reports
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: "42.8k", sub: "+2.1k this week", icon: Users, color: "text-blue-600 bg-blue-50" },
                    { label: "Verified", value: "38.2k", sub: "89% verified", icon: ShieldAlert, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Platform Uptime", value: "98.4%", sub: "Last 30 days", icon: Server, color: "text-violet-600 bg-violet-50" },
                    { label: "API Response", value: "12ms", sub: "Avg response time", icon: Activity, color: "text-amber-600 bg-amber-50" },
                  ].map((s) => (
                    <Card key={s.label} className="border border-slate-200 shadow-sm bg-white">
                      <CardContent className="p-5">
                        <div className={cn("p-2.5 rounded-xl w-fit mb-3", s.color)}>
                          <s.icon className="h-5 w-5" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{s.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Users className="h-5 w-5 text-indigo-600" /> Active User Dynamics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: number) => [`${(v / 1000).toFixed(1)}k`, "Users"]} />
                            <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" /> System Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        {SYSTEM_ALERTS.map((a, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={cn("p-1 rounded-lg flex-shrink-0 mt-0.5", a.color)}>
                              <a.icon className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-700 leading-snug">{a.msg}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-emerald-600" /> Marketplace Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        {[
                          { label: "Textbooks", value: 68 }, { label: "Electronics", value: 52 }, { label: "Services", value: 34 },
                        ].map((s) => (
                          <div key={s.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600 font-medium">{s.label}</span>
                              <span className="text-slate-400">{s.value}%</span>
                            </div>
                            <Progress value={s.value} className="h-1.5" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "semesters" && <SemestersTab actorName={actorName} />}
            {activeTab === "toggles" && <FeatureToggleTab actorName={actorName} />}
            {activeTab === "features" && <FeaturesTab actorName={actorName} />}
            {activeTab === "moderators" && <ModeratorsTab actorName={actorName} />}
            {activeTab === "audit" && <AuditLogTab />}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
