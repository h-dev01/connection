/**
 * ProfileCompleteModal — shown once after a new student signs up via OTP.
 * Dismissible only after filling required fields (name + college + branch + year).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Building2, BookOpen, CalendarDays, Phone, FileText,
  CheckCircle2, Sparkles, ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

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

const YEARS = [
  "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year (Integrated)",
];

export function ProfileCompleteModal() {
  const { user, completeProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    college: "",
    branch: "",
    year: "",
    phone: "",
    bio: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Only show for students with incomplete profile
  if (!user || user.role !== "student" || user.profileComplete) return null;

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const step1Valid = form.name.trim().length >= 2 && form.college.trim().length >= 2;
  const step2Valid = form.branch !== "" && form.year !== "";

  const handleFinish = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    completeProfile({
      name: form.name.trim(),
      college: form.college.trim(),
      branch: form.branch,
      year: form.year,
      phone: form.phone.trim(),
      bio: form.bio.trim(),
    });
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <AnimatePresence mode="wait">

          {/* ── Success screen ── */}
          {done && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">You're all set! 🎉</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Welcome to CollegeConnect, <strong className="text-slate-800">{form.name}</strong>!
                Your profile is live — start exploring the campus super app.
              </p>
            </motion.div>
          )}

          {/* ── Step 1: Name + College ── */}
          {!done && step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="p-8">

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Step 1 of 2</p>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Complete your profile</h2>
                </div>
              </div>

              <p className="text-slate-500 text-sm mb-6">
                Help your peers find and connect with you. Takes just 30 seconds!
              </p>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="e.g. Aryan Sharma"
                      className="h-11 pl-10 bg-slate-50"
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* College */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    College / University <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="e.g. IIT Bombay"
                      className="h-11 pl-10 bg-slate-50"
                      value={form.college}
                      onChange={e => set("college", e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="+91 98765 43210"
                      className="h-11 pl-10 bg-slate-50"
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700 mt-6"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Branch + Year + Bio ── */}
          {!done && step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="p-8">

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 2 of 2</p>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Academic details</h2>
                </div>
              </div>

              <div className="space-y-4">
                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Branch / Department <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={v => set("branch", v)}>
                    <SelectTrigger className="h-11 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Select your branch" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={v => set("year", v)}>
                    <SelectTrigger className="h-11 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Select your year" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Short Bio <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      placeholder="e.g. Passionate about AI, open source, and cricket 🏏"
                      rows={3}
                      className="w-full rounded-xl border border-input bg-slate-50 pl-10 pr-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.bio}
                      onChange={e => set("bio", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="h-11 px-5" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 font-bold bg-indigo-600 hover:bg-indigo-700"
                  disabled={!step2Valid || submitting}
                  onClick={handleFinish}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Complete Profile
                    </span>
                  )}
                </Button>
              </div>

              {/* Skip link */}
              <p className="text-center text-xs text-slate-400 mt-4">
                You can always update this in your{" "}
                <button
                  className="text-blue-500 hover:underline font-medium"
                  onClick={handleFinish}
                >
                  Profile page
                </button>
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
