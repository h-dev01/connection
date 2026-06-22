/**
 * Home / Landing page — shown to first-time / logged-out visitors.
 * No sidebar. Clicking "Get Started" or "Sign In" goes to /login.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen, ShoppingBag, Users, Briefcase, Tent,
  Star, Shield, Zap, ChevronRight, GraduationCap,
  BarChart3, MessageSquare, ArrowRight, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Feature data ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: BookOpen,
    color: "bg-blue-500",
    title: "Study Hub",
    desc: "Access notes, slides, and study materials uploaded by top students. AI-powered summarizer included.",
  },
  {
    icon: ShoppingBag,
    color: "bg-emerald-500",
    title: "Marketplace",
    desc: "Buy and sell textbooks, gadgets, and housing listings safely within your verified campus network.",
  },
  {
    icon: Users,
    color: "bg-violet-500",
    title: "Community",
    desc: "Connect with peers through hobby groups, anonymous Q&A, campus polls, and co-founder matchmaking.",
  },
  {
    icon: Briefcase,
    color: "bg-amber-500",
    title: "Career Corner",
    desc: "Discover internships, build your resume, practice interviews, and connect with startup founders.",
  },
  {
    icon: Tent,
    color: "bg-rose-500",
    title: "Clubs & Orgs",
    desc: "Discover and join official clubs. Start your own, host events, and build your campus reputation.",
  },
  {
    icon: BarChart3,
    color: "bg-cyan-500",
    title: "Reputation System",
    desc: "Earn Bronze → Silver → Gold → Platinum badges by contributing resources, helping peers, and more.",
  },
];

const STATS = [
  { value: "50,000+", label: "Verified Students" },
  { value: "200+", label: "Colleges" },
  { value: "12,000+", label: "Study Materials" },
  { value: "98%", label: "Satisfaction Rate" },
];

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    dept: "3rd Year · Computer Science",
    initials: "AM",
    color: "bg-blue-500",
    quote: "CollegeConnect completely changed how I study. I found notes I never could have written better myself.",
  },
  {
    name: "Sneha Kapoor",
    dept: "2nd Year · Architecture",
    initials: "SK",
    color: "bg-violet-500",
    quote: "Sold my old drafting kit within 2 hours of posting. The campus marketplace is incredibly active.",
  },
  {
    name: "Rohan Verma",
    dept: "4th Year · Data Science",
    initials: "RV",
    color: "bg-emerald-500",
    quote: "Got my first internship at Amazon through the Career Corner. The resume builder is genuinely useful.",
  },
];

const WHY_US = [
  "EDU-verified students only — no outsiders",
  "All study materials reviewed by top contributors",
  "Marketplace with built-in reputation scoring",
  "Anonymous Q&A so you always get honest answers",
  "Events, clubs, and communities all in one place",
  "Admin and moderation tools built for campus safety",
];

/* ─── Component ─────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">CollegeConnect</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600 font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-6 text-sm px-4 py-1">
              Campus Super App — Now in Beta
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
              Your entire campus<br />
              <span className="text-blue-400">in one app.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Study smarter, trade with peers, connect with communities, launch your career —
              all within your verified college network.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 text-base gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 h-12 text-base px-8">
                  See Features
                </Button>
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-extrabold text-white">{value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">Everything you need</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900">One app. Every campus need.</h2>
            <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
              Built by students, for students. Every feature solves a real campus problem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">Simple onboarding</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900">Up and running in 60 seconds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[17%] right-[17%] h-0.5 bg-slate-100" />

            {[
              { step: "01", icon: GraduationCap, title: "Verify your EDU email", desc: "Sign up with your college email. Our system verifies your enrollment automatically." },
              { step: "02", icon: Shield, title: "Set up your profile", desc: "Add your department, year, interests, and academic goals. Customize your experience." },
              { step: "03", icon: Zap, title: "Explore the campus", desc: "Access study materials, join clubs, browse the marketplace, and connect with peers." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs font-bold text-blue-500 tracking-wider uppercase">Step {step}</span>
                <h3 className="font-bold text-slate-900 text-lg mt-1 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why CollegeConnect ── */}
      <section className="py-24 px-6 bg-slate-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">Why us</Badge>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Built with campus<br />safety in mind.
            </h2>
            <p className="text-slate-400 mt-4 leading-relaxed">
              CollegeConnect is not just another social app. Every user is verified,
              every transaction is tracked, and moderators keep the community safe.
            </p>
            <Link href="/login" className="inline-block mt-8">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 px-6">
                Join for free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ul className="space-y-4">
            {WHY_US.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4">Student voices</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900">Loved by students across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, dept, initials, color, quote }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mt-3 mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    <p className="text-xs text-slate-400">{dept}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to own your campus?
          </h2>
          <p className="text-blue-100 mt-4 text-lg max-w-xl mx-auto">
            Join 50,000+ students already building their academic and social legacy on CollegeConnect.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-10 bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 h-13 text-base gap-2">
              Get Started — It's Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="text-white font-semibold">CollegeConnect</span>
        </div>
        <p className="text-slate-600 text-sm">Campus Super App — Built for students, by students.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-slate-600">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">Contact</span>
        </div>
      </footer>
    </div>
  );
}
