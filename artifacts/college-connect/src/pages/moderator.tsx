/**
 * Moderator Dashboard — manages reported content, student verifications, campus stats.
 * Mock: Replace MOCK_* constants with real API calls to /api/admin/* endpoints.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flag, Users, ShieldCheck, Calendar, Filter, ClipboardList,
  CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight,
  BarChart2, MapPin, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────
// MOCK DATA — Replace with GET /api/admin/reports
// ────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "Active Users", value: "12,840", sub: null, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Open Reports", value: "24", sub: "HIGH PRIORITY", icon: Flag, color: "text-red-500", bg: "bg-red-50" },
  { label: "Verifications", value: "48", sub: "12h avg", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Pending Events", value: "09", sub: "3 Starting Today", icon: Calendar, color: "text-violet-500", bg: "bg-violet-50" },
];

const MOCK_REPORTS = [
  {
    id: 1,
    title: "MacBook Pro 2021 Listing",
    type: "Marketplace",
    reason: "Suspected scam — seller requesting payment outside platform",
    status: "Urgent",
    priority: "urgent",
    reporter: "Arjun Mehta",
    time: "2h ago",
  },
  {
    id: 2,
    title: '"The final exam is..."',
    type: "Community Post",
    reason: "Inappropriate language and misinformation",
    status: "Pending",
    priority: "standard",
    reporter: "Sneha Kapoor",
    time: "4h ago",
  },
  {
    id: 3,
    title: "Outdoor Mixer Ad — North Campus",
    type: "Event",
    reason: "Spam — duplicate posting across multiple communities",
    status: "Under Investigation",
    priority: "standard",
    reporter: "Rohan Verma",
    time: "6h ago",
  },
];

// ────────────────────────────────────────────────
// MOCK DATA — Replace with GET /api/admin/verifications
// ────────────────────────────────────────────────
const MOCK_VERIFICATIONS = [
  { id: 1, name: "Priya Nair", class: "3rd Year · Computer Science", time: "Submitted 1h ago", initials: "PN" },
  { id: 2, name: "Tanveer Ahmed", class: "2nd Year · Mechanical Eng.", time: "Submitted 3h ago", initials: "TA" },
  { id: 3, name: "Kavya Reddy", class: "4th Year · Data Science", time: "Submitted 5h ago", initials: "KR" },
];

const MOCK_CAMPUS_STATS = [
  { label: "Marketplace Activity", value: 72, status: "Normal", color: "bg-emerald-500" },
  { label: "Community Posts", value: 58, status: "Normal", color: "bg-blue-500" },
  { label: "Report Density", value: 44, status: "Moderate", color: "bg-amber-500" },
];

const STATUS_STYLES: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "Under Investigation": "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Moderator() {
  const [filter, setFilter] = useState<"all" | "urgent" | "standard">("all");
  const filteredReports = filter === "all"
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter((r) => r.priority === filter);

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

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
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
                      <Badge className="mt-2 text-xs font-semibold bg-red-100 text-red-700 border-0">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Reported Content table */}
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">Reported Content</CardTitle>
              <div className="flex gap-2">
                {(["all", "urgent", "standard"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border transition-colors capitalize",
                      filter === f
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    )}
                  >
                    {f === "all" ? `All (${MOCK_REPORTS.length})` : f === "urgent" ? `12 Urgent` : `12 Standard`}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "mt-0.5 p-2 rounded-lg flex-shrink-0",
                      report.priority === "urgent" ? "bg-red-100" : "bg-amber-100"
                    )}>
                      {report.priority === "urgent"
                        ? <AlertTriangle className="h-4 w-4 text-red-600" />
                        : <Clock className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{report.title}</p>
                          <p className="text-xs text-slate-400">{report.type} · Reported by {report.reporter} · {report.time}</p>
                        </div>
                        <Badge className={cn("border text-xs flex-shrink-0", STATUS_STYLES[report.status])}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">{report.reason}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                          <CheckCircle className="h-3.5 w-3.5" /> Resolve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-700 border-red-200 hover:bg-red-50">
                          <XCircle className="h-3.5 w-3.5" /> Remove
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-5">

          {/* Verification queue */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-[#0f172a] text-white rounded-t-xl pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Student Verification</CardTitle>
                <Badge className="bg-amber-400 text-amber-900 text-xs font-bold border-0">48 Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {MOCK_VERIFICATIONS.map((v) => (
                  <div key={v.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                          {v.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{v.name}</p>
                        <p className="text-xs text-slate-400">{v.class}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{v.time}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3">
                          Verify
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 px-3">
                          Reject
                        </Button>
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

          {/* Campus Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-slate-400" />
                Campus Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_CAMPUS_STATS.map(({ label, value, status, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      status === "Normal" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {status}
                    </span>
                  </div>
                  <Progress value={value} className="h-2" />
                  <p className="text-xs text-slate-400 mt-1">{value}% capacity</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
