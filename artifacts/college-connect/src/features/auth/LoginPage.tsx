/**
 * LoginPage — sign-in for CollegeConnect
 *
 * Student flow (2 steps):
 *   Step 1: Email + Password  → POST /api/auth/signin
 *   Step 2: 6-digit OTP       → POST /api/auth/signin/verify
 *
 * Admin / Mod flow: role select → email + password (demo, client-side only)
 *
 * Security: generic "Invalid credentials" message — never reveals whether
 * an email is registered.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Mail, Lock, GraduationCap, ShieldAlert, ShieldCheck,
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2,
  KeyRound, RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { homeRouteForRole } from "@/features/auth/auth-utils";

/* ─── Staff role definitions ─────────────────────────────────── */
const STAFF_ROLES: {
  key: "low_admin" | "admin";
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  border: string;
  bg: string;
  badge: string;
  hint: string;
}[] = [
  {
    key: "low_admin",
    label: "Low Admin",
    subtitle: "Moderator — manage reports, verify students & events",
    icon: ShieldCheck,
    color: "text-emerald-600",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
    badge: "Moderator",
    hint: "lowadmin@college.edu / lowadmin123",
  },
  {
    key: "admin",
    label: "High Admin",
    subtitle: "Full system access — analytics, health dashboard & all controls",
    icon: ShieldAlert,
    color: "text-violet-600",
    border: "border-violet-500",
    bg: "bg-violet-50",
    badge: "Admin",
    hint: "admin@college.edu / admin123",
  },
];

/* ─── OTP input — 6 boxes ────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
      onChange(digits.slice(0, i - 1).join("") + digits.slice(i).join(""));
    }
  };
  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("").slice(0, 6);
    onChange(next);
    if (char && i < 5) setTimeout(() => document.getElementById(`otp-${i + 1}`)?.focus(), 0);
  };
  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
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

/* ─── Main page ──────────────────────────────────────────────── */
export default function Login() {
  const { login, signinWithPassword, verifySigninOtp } = useAuth();
  const [, navigate] = useLocation();

  // Flow states
  type Flow = "choose" | "student-creds" | "student-otp" | "staff-creds";
  const [flow, setFlow] = useState<Flow>("choose");
  const [selectedRole, setSelectedRole] = useState<"low_admin" | "admin" | null>(null);

  // Student signin state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsError, setCredsError] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Countdown for resend
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Staff login state
  const [staffForm, setStaffForm] = useState({ email: "", password: "" });
  const [showStaffPass, setShowStaffPass] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");

  const staffConfig = STAFF_ROLES.find((r) => r.key === selectedRole);

  /* ─ Step 1: student creds ─ */
  const handleStudentCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsLoading(true);
    setCredsError("");
    const res = await signinWithPassword(email, password);
    setCredsLoading(false);
    if (res.ok) {
      setDemoOtp(res.demoOtp ?? "");
      setFlow("student-otp");
      startCountdown();
    } else {
      setCredsError(res.error ?? "Invalid credentials");
    }
  };

  /* ─ Step 2: OTP verify ─ */
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError("Enter all 6 digits."); return; }
    setOtpLoading(true);
    setOtpError("");
    const res = await verifySigninOtp(email, otp);
    setOtpLoading(false);
    if (res.ok) {
      navigate(homeRouteForRole("student"));
    } else {
      setOtpError(res.error ?? "Verification failed.");
    }
  };

  /* ─ Resend OTP ─ */
  const handleResend = async () => {
    setOtpError("");
    setOtpLoading(true);
    const res = await signinWithPassword(email, password);
    setOtpLoading(false);
    if (res.ok) { setDemoOtp(res.demoOtp ?? ""); setOtp(""); startCountdown(); }
    else setOtpError(res.error ?? "Failed to resend OTP.");
  };

  /* ─ Staff submit ─ */
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setStaffError("");
    setStaffLoading(true);
    const result = await login(staffForm.email, staffForm.password, selectedRole);
    setStaffLoading(false);
    if (result.ok) navigate(homeRouteForRole(selectedRole));
    else setStaffError(result.error ?? "Login failed.");
  };

  const reset = () => {
    setFlow("choose");
    setSelectedRole(null);
    setEmail("");
    setPassword("");
    setOtp("");
    setDemoOtp("");
    setCredsError("");
    setOtpError("");
    setStaffError("");
    setStaffForm({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
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
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-5">Campus Super App</Badge>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Your campus.<br />
              <span className="text-blue-400">Your role.</span><br />
              Your tools.
            </h1>
            <p className="text-slate-400 mt-5 text-base leading-relaxed max-w-sm">
              Students sign in with email and password.
              Moderators and admins log in with staff credentials.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: GraduationCap, text: "Student — Email + Password + OTP" },
              { icon: ShieldCheck, text: "Low Admin — Moderator" },
              { icon: ShieldAlert, text: "High Admin — Full Access" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-50"><Icon className="h-4 w-4 text-blue-600" /></div>
                <span className="text-slate-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-700 text-xs relative z-10">Trusted by 50,000+ verified students across India</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-lg">
          <Link href="/">
            <div className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg text-slate-900">CollegeConnect</span>
            </div>
          </Link>

          <AnimatePresence mode="wait">

            {/* ── CHOOSE ── */}
            {flow === "choose" && (
              <motion.div key="choose"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-500 text-sm mb-8">Choose how you want to sign in</p>

                <div className="space-y-4">
                  <button onClick={() => setFlow("student-creds")}
                    className="w-full text-left p-5 rounded-2xl border-2 bg-white transition-all hover:shadow-md hover:border-blue-500 border-slate-200 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-50">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Student</span>
                          <Badge className="text-xs border-0 bg-blue-100 text-blue-600 font-medium">Most common</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">Sign in with email + password + OTP</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                    </div>
                  </button>

                  {STAFF_ROLES.map(({ key, label, subtitle, icon: Icon, color, border, bg, badge }) => (
                    <button key={key}
                      onClick={() => {
                        setSelectedRole(key);
                        const hint = STAFF_ROLES.find((r) => r.key === key)!.hint.split(" / ");
                        setStaffForm({ email: hint[0], password: hint[1] });
                        setFlow("staff-creds");
                      }}
                      className="w-full text-left p-5 rounded-2xl border-2 bg-white transition-all hover:shadow-md group border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", bg)}>
                          <Icon className={cn("h-6 w-6", color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{label}</span>
                            <Badge className="text-xs border-0 bg-slate-100 text-slate-500 font-medium">{badge}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-center text-sm text-slate-500 mt-8">
                  New to CollegeConnect?{" "}
                  <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
                </p>
              </motion.div>
            )}

            {/* ── STUDENT: Credentials ── */}
            {flow === "student-creds" && (
              <motion.div key="student-creds"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>

                <button onClick={reset}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 bg-blue-50">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-sm text-blue-600">Student Sign In</span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Sign in to your account</h2>
                <p className="text-slate-500 text-sm mb-6">We'll send a verification code after checking your credentials.</p>

                <form onSubmit={handleStudentCreds} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="email" placeholder="you@college.edu" className="h-11 pl-10 bg-white"
                        value={email} onChange={(e) => { setEmail(e.target.value); setCredsError(""); }}
                        required autoFocus />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type={showPass ? "text" : "password"} placeholder="••••••••"
                        className="h-11 pl-10 pr-10 bg-white"
                        value={password} onChange={(e) => { setPassword(e.target.value); setCredsError(""); }}
                        required />
                      <button type="button" onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {credsError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{credsError}</p>
                  )}

                  <Button type="submit" disabled={credsLoading} className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700">
                    {credsLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Checking credentials…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">Continue <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
                </p>
              </motion.div>
            )}

            {/* ── STUDENT: OTP ── */}
            {flow === "student-otp" && (
              <motion.div key="student-otp"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>

                <button onClick={() => { setFlow("student-creds"); setOtp(""); setOtpError(""); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Change credentials
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 bg-blue-50">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-sm text-blue-600">Verify your identity</span>
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

                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} />

                  {otpError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">{otpError}</p>
                  )}

                  <Button type="submit" disabled={otpLoading || otp.length < 6}
                    className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700">
                    {otpLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Verify & Sign In
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                    {canResend ? (
                      <>
                        <span>Didn't receive it?</span>
                        <button type="button" disabled={otpLoading} onClick={handleResend}
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

            {/* ── STAFF: Credentials ── */}
            {flow === "staff-creds" && staffConfig && (
              <motion.div key="staff-creds"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}>

                <button onClick={reset}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Change role
                </button>

                <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6", staffConfig.bg)}>
                  <staffConfig.icon className={cn("h-5 w-5", staffConfig.color)} />
                  <span className={cn("font-semibold text-sm", staffConfig.color)}>
                    Signing in as {staffConfig.label}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Staff credentials</h2>
                <p className="text-slate-500 text-sm mb-6">Demo credentials are pre-filled — just click Sign In.</p>

                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="email" placeholder="you@college.edu" className="h-11 pl-10 bg-white"
                        value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type={showStaffPass ? "text" : "password"} placeholder="••••••••"
                        className="h-11 pl-10 pr-10 bg-white"
                        value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required />
                      <button type="button" onClick={() => setShowStaffPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showStaffPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {staffError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{staffError}</p>
                  )}

                  <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Demo login:</span> {staffConfig.hint}
                    </p>
                  </div>

                  <Button type="submit" disabled={staffLoading}
                    className={cn("w-full h-11 font-bold text-white",
                      selectedRole === "admin" ? "bg-violet-600 hover:bg-violet-700" : "bg-emerald-600 hover:bg-emerald-700"
                    )}>
                    {staffLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Sign In as {staffConfig.badge}
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
