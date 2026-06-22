/**
 * Login page — no sidebar wrapper needed.
 * Mock: Replace handleSubmit with real POST /api/auth/login call.
 * Real auth flow should set a session cookie and redirect to /dashboard.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Mail, Lock, ShieldCheck, BookOpen, Building2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TRUST_INDICATORS = [
  { icon: ShieldCheck, label: "Verified Students Only", color: "text-emerald-400" },
  { icon: Building2, label: "200+ Colleges", color: "text-blue-400" },
  { icon: BookOpen, label: "Secure EDU Platform", color: "text-violet-400" },
];

export default function Login() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // TODO: Replace with real POST /api/auth/login when auth is implemented
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 bg-[#0f172a] flex-col justify-between p-14 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">CollegeConnect</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">Campus Super App</Badge>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              The Campus<br />
              <span className="text-blue-400">Super App.</span>
            </h1>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">
              Study smarter, connect deeper, and build your campus legacy — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {TRUST_INDICATORS.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", color)} />
                <span className="text-slate-300 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-slate-600 text-xs">Trusted by 50,000+ students across India</p>
        </div>
      </motion.div>

      {/* Right form panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center bg-slate-50 px-6"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-bold text-lg text-slate-900">CollegeConnect</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-200 rounded-xl p-1 mb-8">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  tab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {tab === "login"
              ? "Sign in with your college email address"
              : "Use your .edu or .ac.in email to join"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <Input placeholder="Rahul Sharma" className="h-11" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="you@college.edu"
                  className="h-11 pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10"
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

            {tab === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {tab === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {tab === "login" ? (
              <>New student?{" "}
                <button onClick={() => setTab("register")} className="text-blue-600 font-medium hover:underline">
                  Create account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setTab("login")} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              By signing up you agree to the Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
