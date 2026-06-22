/**
 * Moderator Dashboard
 * Tabs:
 *   1. Reports         — reported content
 *   2. Study Materials — pending contributor uploads → Approve / Reject
 *   3. Verifications   — student ID verification queue
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag, Users, ShieldCheck, Calendar, Filter, ClipboardList,
  CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight,
  BarChart2, BookOpen, FileText, Check, X, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSubmissions, type Submission } from "@/contexts/SubmissionsContext";
import { useAuth } from "@/contexts/AuthContext";

/* ─── Mock data ─────────────────────────────────────────── */
const MOCK_STATS = [
  { label: "Active Users",    value: "12,840", sub: null,            icon: Users,      color: "text-blue-500",   bg: "bg-blue-50" },
  { label: "Open Reports",    value: "24",     sub: "HIGH PRIORITY", icon: Flag,       color: "text-red-500",    bg: "bg-red-50" },
  { label: "Verifications",   value: "48",     sub: "12h avg",       icon: ShieldCheck,color: "text-emerald-500",bg: "bg-emerald-50" },
  { label: "Pending Events",  value: "09",     sub: "3 Today",       icon: Calendar,   color: "text-violet-500", bg: "bg-violet-50" },
];

const MOCK_REPORTS = [
  { id: 1, title: "MacBook Pro 2021 Listing", type: "Marketplace",    reason: "Suspected scam — seller requesting payment outside platform", status: "Urgent",             priority: "urgent",   reporter: "Arjun Mehta",  time: "2h ago" },
  { id: 2, title: '"The final exam is..."',   type: "Community Post", reason: "Inappropriate language and misinformation",                   status: "Pending",            priority: "standard", reporter: "Sneha Kapoor", time: "4h ago" },
  { id: 3, title: "Outdoor Mixer Ad",         type: "Event",          reason: "Spam — duplicate posting across multiple communities",        status: "Under Investigation",priority: "standard", reporter: "Rohan Verma",  time: "6h ago" },
];

const MOCK_VERIFICATIONS = [
  { id: 1, name: "Priya Nair",    class: "3rd Year · Computer Science", time: "Submitted 1h ago",  initials: "PN" },
  { id: 2, name: "Tanveer Ahmed", class: "2nd Year · Mechanical Eng.",  time: "Submitted 3h ago",  initials: "TA" },
  { id: 3, name: "Kavya Reddy",   class: "4th Year · Data Science",     time: "Submitted 5h ago",  initials: "KR" },
];

const MOCK_CAMPUS_STATS = [
  { label: "Marketplace Activity", value: 72, status: "Normal",   color: "bg-emerald-500" },
  { label: "Community Posts",       value: 58, status: "Normal",   color: "bg-blue-500" },
  { label: "Report Density",        value: 44, status: "Moderate", color: "bg-amber-500" },
];

const STATUS_STYLES: Record<string, string> = {
  Urgent:               "bg-red-100 text-red-700 border-red-200",
  Pending:              "bg-amber-100 text-amber-700 border-amber-200",
  "Under Investigation":"bg-blue-100 text-blue-700 border-blue-200",
};

const TYPE_LABEL: Record<string, string> = {
  notes: "Lecture Notes", pdf: "PDF", ppt: "Slides", pyq: "PYQ",
  assignment: "Assignment", lab: "Lab Manual", syllabus: "Syllabus",
};

/* ─── Study Material Review card ────────────────────────── */
function MaterialCard({ sub, onAction }: { sub: Submission; onAction: (id: string, action: "approve" | "reject") => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-slate-900 text-sm leading-snug">{sub.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">{sub.course}</span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 rounded text-blue-700">{TYPE_LABEL[sub.type] ?? sub.type}</span>
                  <span className="text-xs text-slate-400">{sub.semester}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{sub.submittedAt}</span>
            </div>

            {/* Uploader */}
            <div className="flex items-center gap-2 mt-2">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold", sub.uploaderColor)}>
                {sub.uploaderInitials}
              </div>
              <span className="text-xs text-slate-500">by <strong>{sub.uploadedBy}</strong></span>
              <span className="text-xs text-slate-300">· {sub.fileSize !== "—" ? sub.fileSize : sub.fileName}</span>
            </div>

            {/* Expandable description */}
            {sub.description && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-xs text-blue-600 hover:underline mt-1.5 flex items-center gap-1"
              >
                <Eye className="h-3 w-3" /> {expanded ? "Hide" : "Show"} description
              </button>
            )}
            <AnimatePresence>
              {expanded && sub.description && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed overflow-hidden"
                >
                  {sub.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pl-14">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
            onClick={() => onAction(sub.id, "approve")}
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs font-bold"
            onClick={() => onAction(sub.id, "reject")}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Review dialog ──────────────────────────────────────── */
function ReviewDialog({
  sub, action, onConfirm, onCancel,
}: {
  sub: Submission;
  action: "approve" | "reject";
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  const isApprove = action === "approve";

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={isApprove ? "text-emerald-700" : "text-red-700"}>
            {isApprove ? "✓ Approve Material" : "✗ Reject Material"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="font-semibold text-slate-900 text-sm">{sub.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">by {sub.uploadedBy} · {sub.course}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              {isApprove ? "Note for contributor (optional)" : "Reason for rejection *"}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isApprove
                  ? "e.g. Excellent notes, well organised!"
                  : "e.g. Duplicate content already exists, or file quality too low."
              }
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button
              className={cn("flex-1 font-bold", isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700")}
              disabled={!isApprove && !note.trim()}
              onClick={() => onConfirm(note)}
            >
              {isApprove ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Study Materials tab ────────────────────────────────── */
function StudyMaterialsTab() {
  const { submissions, approveSubmission, rejectSubmission, pendingCount } = useSubmissions();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [reviewing, setReviewing] = useState<{ sub: Submission; action: "approve" | "reject" } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = submissions.filter((s) => s.status === filter);

  const handleAction = (id: string, action: "approve" | "reject") => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    setReviewing({ sub, action });
  };

  const handleConfirm = (note: string) => {
    if (!reviewing) return;
    const reviewerName = user?.name ?? "Moderator";
    if (reviewing.action === "approve") {
      approveSubmission(reviewing.sub.id, note, reviewerName);
      setToast("Material approved and published to Study Hub!");
    } else {
      rejectSubmission(reviewing.sub.id, note, reviewerName);
      setToast("Material rejected. Contributor has been notified.");
    }
    setReviewing(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["pending","approved","rejected"] as const).map((f) => {
          const count = submissions.filter((s) => s.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize",
                filter === f
                  ? f === "pending"  ? "bg-amber-600 text-white border-amber-600"
                  : f === "approved" ? "bg-emerald-600 text-white border-emerald-600"
                  :                   "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              {f === "pending" && <Clock className="h-3 w-3" />}
              {f === "approved" && <CheckCircle className="h-3 w-3" />}
              {f === "rejected" && <XCircle className="h-3 w-3" />}
              {f} ({count})
            </button>
          );
        })}

        {pendingCount > 0 && filter !== "pending" && (
          <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            {pendingCount} awaiting review
          </span>
        )}
      </div>

      {/* Material cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            {filter === "pending" ? "No materials pending review." : `No ${filter} materials yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((sub) => (
              filter === "pending"
                ? <MaterialCard key={sub.id} sub={sub} onAction={handleAction} />
                : (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "bg-white rounded-2xl border p-4 shadow-sm",
                      sub.status === "approved" ? "border-emerald-100" : "border-red-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-xl", sub.status === "approved" ? "bg-emerald-50" : "bg-red-50")}>
                        {sub.status === "approved"
                          ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                          : <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{sub.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{sub.course} · by {sub.uploadedBy} · reviewed {sub.reviewedAt ?? "recently"}</p>
                        {sub.reviewNote && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="font-semibold">Review note:</span> {sub.reviewNote}
                          </p>
                        )}
                      </div>
                      <Badge className={cn(
                        "border text-xs",
                        sub.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      )}>
                        {sub.status}
                      </Badge>
                    </div>
                  </motion.div>
                )
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Review dialog */}
      {reviewing && (
        <ReviewDialog
          sub={reviewing.sub}
          action={reviewing.action}
          onConfirm={handleConfirm}
          onCancel={() => setReviewing(null)}
        />
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Moderator() {
  const { pendingCount } = useSubmissions();
  const [reportFilter, setReportFilter] = useState<"all" | "urgent" | "standard">("all");

  const filteredReports = reportFilter === "all"
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter((r) => r.priority === reportFilter);

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moderator Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Managing content for North Campus Wing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> All Regions
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ClipboardList className="h-4 w-4" /> Audit Log
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ...MOCK_STATS.slice(0, 3),
          { label: "Study Materials", value: String(pendingCount).padStart(2, "0"), sub: "Awaiting Review", icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                    {sub && (
                      <Badge className="mt-2 text-xs font-semibold bg-amber-100 text-amber-700 border-0">
                        {sub}
                      </Badge>
                    )}
                    {!sub && <p className="text-xs text-slate-400 mt-1">All zones</p>}
                  </div>
                  <div className={cn("p-3 rounded-xl", bg)}>
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="materials">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="materials" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Study Materials
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Flag className="h-3.5 w-3.5 mr-1.5" /> Reports
          </TabsTrigger>
          <TabsTrigger value="verifications" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Verifications
          </TabsTrigger>
        </TabsList>

        {/* ── Study Materials tab ── */}
        <TabsContent value="materials" className="mt-5">
          <StudyMaterialsTab />
        </TabsContent>

        {/* ── Reports tab ── */}
        <TabsContent value="reports" className="mt-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">Reported Content</CardTitle>
                  <div className="flex gap-2">
                    {(["all", "urgent", "standard"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setReportFilter(f)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold border transition-colors capitalize",
                          reportFilter === f
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        )}
                      >
                        {f === "all" ? `All (${MOCK_REPORTS.length})` : f}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={cn("mt-0.5 p-2 rounded-lg flex-shrink-0", report.priority === "urgent" ? "bg-red-100" : "bg-amber-100")}>
                          {report.priority === "urgent" ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{report.title}</p>
                              <p className="text-xs text-slate-400">{report.type} · Reported by {report.reporter} · {report.time}</p>
                            </div>
                            <Badge className={cn("border text-xs flex-shrink-0", STATUS_STYLES[report.status])}>{report.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5">{report.reason}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"><CheckCircle className="h-3.5 w-3.5" /> Resolve</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-700 border-red-200 hover:bg-red-50"><XCircle className="h-3.5 w-3.5" /> Remove</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500">Details</Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campus stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-slate-400" /> Campus Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_CAMPUS_STATS.map(({ label, value, status, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-600">{label}</span>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", status === "Normal" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{status}</span>
                    </div>
                    <Progress value={value} className="h-2" />
                    <p className="text-xs text-slate-400 mt-1">{value}% capacity</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Verifications tab ── */}
        <TabsContent value="verifications" className="mt-5">
          <Card className="border-0 shadow-sm max-w-lg">
            <CardHeader className="bg-[#0f172a] text-white rounded-t-xl pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Student Verification Queue</CardTitle>
                <Badge className="bg-amber-400 text-amber-900 text-xs font-bold border-0">48 Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {MOCK_VERIFICATIONS.map((v) => (
                  <div key={v.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">{v.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{v.name}</p>
                        <p className="text-xs text-slate-400">{v.class}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{v.time}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3">Verify</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 px-3">Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100">
                <button className="w-full text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 py-1">
                  View All Requests <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
