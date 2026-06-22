/**
 * Login page — role-based sign in for CollegeConnect.
 * Three roles: Student | Low Admin | High Admin (Admin)
 *
 * Demo credentials (shown as hints on each role card):
 *   Student    → student@college.edu   / student123
 *   Low Admin  → lowadmin@college.edu  / lowadmin123
 *   High Admin → admin@college.edu     / admin123
 *
 * TODO: Replace login() in AuthContext with real POST /api/auth/login
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Mail, Lock, GraduationCap, ShieldAlert, ShieldCheck,
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { homeRouteForRole } from "@/lib/auth-utils";

/* ─── Role definitions ───────────────────────────────────── */
const ROLES: {
  key: UserRole;
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
    key: "student",
    label: "Student",
    subtitle: "Access study, marketplace, community & career tools",
    icon: GraduationCap,
    color: "text-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-50",
    badge: "Most common",
    hint: "student@college.edu / student123",
  },
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

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();

  // Step 1: pick role  |  Step 2: fill credentials
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleConfig = ROLES.find((r) => r.key === selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
    // Pre-fill demo credentials so user can log in instantly
    const hint = ROLES.find((r) => r.key === role)!.hint.split(" / ");
    setForm({ email: hint[0], password: hint[1] });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password, selectedRole);
    setLoading(false);
    if (result.ok) {
      navigate(homeRouteForRole(selectedRole));
    } else {
      setError(result.error ?? "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex w-[46%] bg-[#0f172a] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 relative z-10 cursor-pointer">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">CollegeConnect</span>
          </div>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-5">Campus Super App</Badge>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Your campus.<br />
              <span className="text-blue-400">Your role.</span><br />
              Your tools.
            </h1>
            <p className="text-slate-400 mt-5 text-base leading-relaxed max-w-sm">
              Students study, trade, and connect. Moderators keep it safe.
              Admins see the full picture. Every role has a home.
            </p>
          </div>

          {/* Role preview chips */}
          <div className="space-y-3">
            {ROLES.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="flex items-center gap-3">
                <div className={cn("p-1.5 rounded-lg", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <span className="text-slate-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs relative z-10">Trusted by 50,000+ verified students across India</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <Link href="/">
            <div className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg text-slate-900">CollegeConnect</span>
            </div>
          </Link>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Choose role ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-500 text-sm mb-8">Select your role to continue</p>

                <div className="space-y-4">
                  {ROLES.map(({ key, label, subtitle, icon: Icon, color, border, bg, badge }) => (
                    <button
                      key={key}
                      onClick={() => handleRoleSelect(key)}
                      className={cn(
                        "w-full text-left p-5 rounded-2xl border-2 bg-white transition-all hover:shadow-md group",
                        "border-slate-200 hover:" + border
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl transition-colors", bg)}>
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

                <p className="text-center text-xs text-slate-400 mt-8">
                  New student?{" "}
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                    Register with your college email
                  </span>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Fill credentials ── */}
            {step === 2 && roleConfig && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Back button */}
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Change role
                </button>

                {/* Role badge */}
                <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6", roleConfig.bg)}>
                  <roleConfig.icon className={cn("h-5 w-5", roleConfig.color)} />
                  <span className={cn("font-semibold text-sm", roleConfig.color)}>
                    Signing in as {roleConfig.label}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Enter your credentials</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Demo credentials are pre-filled — just click Sign In.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="you@college.edu"
                        className="h-11 pl-10 bg-white"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 pl-10 pr-10 bg-white"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  {/* Demo credential hint */}
                  <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Demo login:</span> {roleConfig.hint}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-11 font-bold text-white",
                      selectedRole === "admin" ? "bg-violet-600 hover:bg-violet-700"
                        : selectedRole === "low_admin" ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In as {roleConfig.label}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6">
                  Forgot your password?{" "}
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                    Reset via college email
                  </span>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
