/**
 * SignupPage — 3-step student registration
 *
 * Step 1: Account Creation  (name, email, password)
 * Step 2: Academic Details  (college, course, pass-in year, pass-out year)
 * Step 3: OTP Verification  (6-digit code, 60-second countdown)
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  CheckCircle2, KeyRound, RefreshCw, User, GraduationCap,
  BookOpen, Calendar, Sparkles, Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { homeRouteForRole } from "@/features/auth/auth-utils";

/* ─── College list ────────────────────────────────────────────── */
const COLLEGES = [
  "Indian Institute of Technology Bombay",
  "Indian Institute of Technology Delhi",
  "Indian Institute of Technology Madras",
  "Indian Institute of Technology Kanpur",
  "Indian Institute of Technology Kharagpur",
  "Indian Institute of Technology Roorkee",
  "Indian Institute of Technology Hyderabad",
  "Indian Institute of Technology Guwahati",
  "Indian Institute of Science Bangalore",
  "National Institute of Technology Trichy",
  "National Institute of Technology Warangal",
  "National Institute of Technology Surathkal",
  "National Institute of Technology Calicut",
  "Birla Institute of Technology and Science Pilani",
  "BITS Pilani – Goa Campus",
  "BITS Pilani – Hyderabad Campus",
  "Vellore Institute of Technology",
  "Manipal Institute of Technology",
  "SRM Institute of Science and Technology",
  "Amrita School of Engineering",
  "PSG College of Technology",
  "Coimbatore Institute of Technology",
  "Anna University",
  "Delhi Technological University",
  "Netaji Subhas University of Technology",
  "Jadavpur University",
  "Pune Institute of Computer Technology",
  "College of Engineering Pune",
  "Thapar Institute of Engineering and Technology",
  "PES University",
  "RV College of Engineering",
  "BMS College of Engineering",
  "Ramaiah Institute of Technology",
  "Christ University",
  "Symbiosis Institute of Technology",
  "KIIT University",
  "LPU – Lovely Professional University",
  "Chandigarh University",
  "Graphic Era University",
  "Other",
];

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => 2015 + i); // 2015–2029

/* ─── Password strength ───────────────────────────────────────── */
function passwordStrength(pw: string): { label: string; color: string; pct: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-red-500", pct: 25 };
  if (score === 2) return { label: "Fair", color: "bg-amber-500", pct: 50 };
  if (score === 3) return { label: "Good", color: "bg-blue-500", pct: 75 };
  return { label: "Strong", color: "bg-green-500", pct: 100 };
}

/* ─── OTP boxes ───────────────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      document.getElementById(`sotp-${i - 1}`)?.focus();
      onChange(digits.slice(0, i - 1).join("") + digits.slice(i).join(""));
    }
  };
  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("").slice(0, 6);
    onChange(next);
    if (char && i < 5) setTimeout(() => document.getElementById(`sotp-${i + 1}`)?.focus(), 0);
  };
  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input key={i} id={`sotp-${i}`} type="text" inputMode="numeric" maxLength={1}
          value={digits[i] ?? ""} onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
            digits[i] ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-900 focus:border-blue-400"
          )}
        />
      ))}
    </div>
  );
}

/* ─── Step indicator ──────────────────────────────────────────── */
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Account", "Academics", "Verify"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const n = idx + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
              )}>
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span className={cn("text-xs font-medium", active ? "text-blue-600" : done ? "text-green-600" : "text-slate-400")}>
                {label}
              </span>
            </div>
            {idx < 2 && (
              <div className={cn("flex-1 h-0.5 mx-2 mb-4 transition-all", done ? "bg-green-400" : "bg-slate-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Searchable college dropdown ─────────────────────────────── */
function CollegeCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COLLEGES.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const select = (college: string) => {
    onChange(college);
    setQuery(college);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search your college..."
          className="h-11 pl-10 bg-white"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((c) => (
            <button key={c} type="button" onClick={() => select(c)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors",
                value === c ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"
              )}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function SignupPage() {
  const { initiateSignup, verifySignupOtp } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2
  const [college, setCollege] = useState("");
  const [courseName, setCourseName] = useState("");
  const [passInYear, setPassInYear] = useState<number | "">("");
  const [passOutYear, setPassOutYear] = useState<number | "">("");
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Step 3
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  // Countdown
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* ─ Step 1 validation ─ */
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errors.name = "Full name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ─ Step 2 validation ─ */
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!college) errors.college = "Please select your college.";
    if (!courseName.trim()) errors.courseName = "Course name is required.";
    if (!passInYear) errors.passInYear = "Select your pass-in year.";
    if (!passOutYear) errors.passOutYear = "Select your pass-out year.";
    if (passInYear && passOutYear && Number(passOutYear) < Number(passInYear)) {
      errors.passOutYear = "Pass-out year must be on or after pass-in year.";
    }
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ─ Step 2 → 3: initiate signup ─ */
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const res = await initiateSignup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      college,
      courseName: courseName.trim(),
      passInYear: Number(passInYear),
      passOutYear: Number(passOutYear),
    });
    setLoading(false);
    if (res.ok) {
      setDemoOtp(res.demoOtp ?? "");
      setStep(3);
      startCountdown();
    } else {
      setStep2Errors({ general: res.error ?? "Something went wrong." });
    }
  };

  /* ─ Step 3: verify OTP ─ */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError("Enter all 6 digits."); return; }
    setLoading(true);
    setOtpError("");
    const res = await verifySignupOtp(email.trim().toLowerCase(), otp);
    setLoading(false);
    if (res.ok) {
      navigate(homeRouteForRole("student"));
    } else {
      setOtpError(res.error ?? "Verification failed.");
    }
  };

  /* ─ Resend OTP ─ */
  const handleResend = async () => {
    setOtpError("");
    setLoading(true);
    const res = await initiateSignup({
      name: name.trim(), email: email.trim().toLowerCase(), password,
      college, courseName: courseName.trim(),
      passInYear: Number(passInYear), passOutYear: Number(passOutYear),
    });
    setLoading(false);
    if (res.ok) { setDemoOtp(res.demoOtp ?? ""); setOtp(""); startCountdown(); }
    else setOtpError(res.error ?? "Failed to resend OTP.");
  };

  const pw = passwordStrength(password);

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[46%] bg-[#0f172a] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <Link href="/">
          <div className="flex items-center gap-3 relative z-10 cursor-pointer">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">CollegeConnect</span>
          </div>
        </Link>
        <div className="relative z-10 space-y-8">
          <div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-5">Join 50,000+ students</Badge>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Your campus,<br />
              <span className="text-blue-400">all in one place.</span>
            </h1>
            <p className="text-slate-400 mt-5 text-base leading-relaxed max-w-sm">
              Study materials, marketplace, community, career tools — everything your college life needs.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: BookOpen, text: "Access thousands of verified study materials" },
              { icon: GraduationCap, text: "Connect with students from your college" },
              { icon: Sparkles, text: "Build your academic reputation" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/20"><Icon className="h-4 w-4 text-blue-400" /></div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-700 text-xs relative z-10">Free forever for students · No credit card required</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-lg">
          <Link href="/">
            <div className="flex items-center gap-2 mb-6 lg:hidden cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg text-slate-900">CollegeConnect</span>
            </div>
          </Link>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Account ── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>

                <StepBar step={1} />
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h2>
                <p className="text-slate-500 text-sm mb-6">It only takes 3 quick steps to get started.</p>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (validateStep1()) setStep(2); }}>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Arjun Sharma" className="h-11 pl-10 bg-white"
                        value={name} onChange={(e) => { setName(e.target.value); setStep1Errors((p) => ({ ...p, name: "" })); }}
                        autoFocus />
                    </div>
                    {step1Errors.name && <p className="text-xs text-red-500 mt-1">{step1Errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">College Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="email" placeholder="you@college.edu" className="h-11 pl-10 bg-white"
                        value={email} onChange={(e) => { setEmail(e.target.value); setStep1Errors((p) => ({ ...p, email: "" })); }} />
                    </div>
                    {step1Errors.email && <p className="text-xs text-red-500 mt-1">{step1Errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                        className="h-11 pl-10 pr-10 bg-white"
                        value={password} onChange={(e) => { setPassword(e.target.value); setStep1Errors((p) => ({ ...p, password: "" })); }} />
                      <button type="button" onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", pw.color)} style={{ width: `${pw.pct}%` }} />
                        </div>
                        <p className="text-xs text-slate-500">Strength: <span className="font-semibold">{pw.label}</span></p>
                      </div>
                    )}
                    {step1Errors.password && <p className="text-xs text-red-500 mt-1">{step1Errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700">
                    Continue <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Academic Details ── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>

                <button onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <StepBar step={2} />
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Academic details</h2>
                <p className="text-slate-500 text-sm mb-6">Help us personalise your CollegeConnect experience.</p>

                <form className="space-y-4" onSubmit={handleProceedToOtp}>
                  {/* College */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">College / University</label>
                    <CollegeCombobox value={college} onChange={(v) => { setCollege(v); setStep2Errors((p) => ({ ...p, college: "" })); }} />
                    {step2Errors.college && <p className="text-xs text-red-500 mt-1">{step2Errors.college}</p>}
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course / Branch</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="e.g. B.Tech Computer Science" className="h-11 pl-10 bg-white"
                        value={courseName} onChange={(e) => { setCourseName(e.target.value); setStep2Errors((p) => ({ ...p, courseName: "" })); }} />
                    </div>
                    {step2Errors.courseName && <p className="text-xs text-red-500 mt-1">{step2Errors.courseName}</p>}
                  </div>

                  {/* Years */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        <Calendar className="inline h-3.5 w-3.5 mr-1 text-slate-400" />Pass-in Year
                      </label>
                      <select
                        className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passInYear}
                        onChange={(e) => {
                          const y = Number(e.target.value);
                          setPassInYear(y);
                          if (passOutYear && Number(passOutYear) < y) setPassOutYear("");
                          setStep2Errors((p) => ({ ...p, passInYear: "", passOutYear: "" }));
                        }}>
                        <option value="">Select year</option>
                        {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                      {step2Errors.passInYear && <p className="text-xs text-red-500 mt-1">{step2Errors.passInYear}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        <Calendar className="inline h-3.5 w-3.5 mr-1 text-slate-400" />Pass-out Year
                      </label>
                      <select
                        className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passOutYear}
                        onChange={(e) => { setPassOutYear(Number(e.target.value)); setStep2Errors((p) => ({ ...p, passOutYear: "" })); }}>
                        <option value="">Select year</option>
                        {YEAR_OPTIONS.filter((y) => !passInYear || y >= Number(passInYear)).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      {step2Errors.passOutYear && <p className="text-xs text-red-500 mt-1">{step2Errors.passOutYear}</p>}
                    </div>
                  </div>

                  {step2Errors.general && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{step2Errors.general}</p>
                  )}

                  <Button type="submit" disabled={loading} className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">Send Verification OTP <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: OTP Verification ── */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>

                <StepBar step={3} />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 bg-blue-50">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-sm text-blue-600">Verify your email</span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Enter the 6-digit OTP</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Sent to <strong className="text-slate-700">{email}</strong>
                </p>

                {demoOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <KeyRound className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Demo OTP (no real email sent)</p>
                      <p className="text-xl font-bold tracking-[0.25em] text-amber-700 mt-0.5">{demoOtp}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} />

                  {otpError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">{otpError}</p>
                  )}

                  <Button type="submit" disabled={loading || otp.length < 6}
                    className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Verify & Create Account
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                    {canResend ? (
                      <>
                        <span>Didn't receive it?</span>
                        <button type="button" disabled={loading}
                          onClick={handleResend}
                          className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                          <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400">
                        Resend available in <strong className="text-slate-600">{countdown}s</strong>
                      </span>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
