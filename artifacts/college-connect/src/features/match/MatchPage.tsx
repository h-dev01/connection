/**
 * Campus Match & Meetup — find dating, friendship, study, project, or startup matches.
 * Tabs: Discover | My Matches | Meetups | My Profile
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Users, BookOpen, Code2, Rocket, X, Check,
  MapPin, Clock, Calendar, Star, Shield, MessageCircle,
  ChevronRight, Sparkles, Flame, Coffee, Library,
  Leaf, Building2, Filter, Settings, Bell, Ban,
  Flag, RefreshCw, CheckCircle2, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── Types ─────────────────────────────────────────────── */
type MatchType = "dating" | "friend" | "study" | "project" | "startup";
type MeetupStatus = "pending" | "confirmed" | "completed";

interface Candidate {
  id: string;
  name: string;
  initials: string;
  color: string;
  dept: string;
  year: string;
  age: number;
  bio: string;
  interests: string[];
  matchTypes: MatchType[];
  compatibility: number;
  distance: string;
  verified: boolean;
}

interface Match {
  id: string;
  candidate: Candidate;
  matchType: MatchType;
  matchedOn: string;
  meetup?: Meetup;
}

interface Meetup {
  id: string;
  with: string;
  location: string;
  date: string;
  time: string;
  status: MeetupStatus;
  matchType: MatchType;
}

/* ─── Static data ────────────────────────────────────────── */
const MATCH_TYPES: { key: MatchType; label: string; icon: React.ElementType; color: string; bg: string; desc: string }[] = [
  { key: "dating",  label: "Dating",          icon: Heart,    color: "text-rose-600",   bg: "bg-rose-50",   desc: "Find a compatible partner" },
  { key: "friend",  label: "Friend",          icon: Users,    color: "text-violet-600", bg: "bg-violet-50", desc: "Expand your social circle" },
  { key: "study",   label: "Study Partner",   icon: BookOpen, color: "text-blue-600",   bg: "bg-blue-50",   desc: "Study together & ace exams" },
  { key: "project", label: "Project Partner", icon: Code2,    color: "text-amber-600",  bg: "bg-amber-50",  desc: "Build something amazing" },
  { key: "startup", label: "Co-Founder",      icon: Rocket,   color: "text-emerald-600",bg: "bg-emerald-50",desc: "Launch a startup together" },
];

const CANDIDATES: Candidate[] = [
  {
    id: "c1", name: "Riya Sharma", initials: "RS", color: "bg-rose-400",
    dept: "Computer Science", year: "3rd Year", age: 21,
    bio: "Love building apps and exploring new ideas. Looking for a startup co-founder or project partner who shares the same passion for tech.",
    interests: ["React", "UI/UX", "Hiking", "Photography", "Startups"],
    matchTypes: ["dating", "project", "startup"],
    compatibility: 94, distance: "Same campus", verified: true,
  },
  {
    id: "c2", name: "Arjun Patel", initials: "AP", color: "bg-blue-400",
    dept: "Data Science", year: "2nd Year", age: 20,
    bio: "Data nerd by day, guitar player by night. Always up for deep conversations and study sessions.",
    interests: ["Python", "ML", "Guitar", "Chess", "Reading"],
    matchTypes: ["friend", "study", "project"],
    compatibility: 88, distance: "Same hostel block", verified: true,
  },
  {
    id: "c3", name: "Sneha Nair", initials: "SN", color: "bg-violet-400",
    dept: "Design", year: "3rd Year", age: 21,
    bio: "Designer who codes a little. Passionate about product design and creating meaningful user experiences.",
    interests: ["Figma", "Typography", "Coffee", "Podcasts", "Travel"],
    matchTypes: ["startup", "friend", "dating"],
    compatibility: 82, distance: "Design block", verified: true,
  },
  {
    id: "c4", name: "Karan Mehta", initials: "KM", color: "bg-amber-400",
    dept: "Mechanical Eng.", year: "4th Year", age: 22,
    bio: "Robotics club lead. Building an autonomous delivery robot for my thesis. Need a CS co-founder!",
    interests: ["Robotics", "CAD", "Python", "Cricket", "Entrepreneurship"],
    matchTypes: ["startup", "project"],
    compatibility: 79, distance: "Engineering block", verified: true,
  },
  {
    id: "c5", name: "Priya Iyer", initials: "PI", color: "bg-emerald-400",
    dept: "MBA", year: "1st Year", age: 23,
    bio: "Marketing strategist with a passion for social impact. Looking for tech co-founders to build EdTech products.",
    interests: ["Marketing", "Social Impact", "EdTech", "Yoga", "Books"],
    matchTypes: ["startup", "friend"],
    compatibility: 75, distance: "B-school campus", verified: true,
  },
];

const MY_MATCHES: Match[] = [
  {
    id: "m1",
    candidate: CANDIDATES[0],
    matchType: "project",
    matchedOn: "2 days ago",
    meetup: {
      id: "mu1", with: "Riya Sharma",
      location: "Library — Study Room 3", date: "Tomorrow",
      time: "4:00 PM", status: "confirmed", matchType: "project",
    },
  },
  {
    id: "m2",
    candidate: CANDIDATES[1],
    matchType: "study",
    matchedOn: "5 days ago",
  },
  {
    id: "m3",
    candidate: CANDIDATES[2],
    matchType: "startup",
    matchedOn: "1 week ago",
    meetup: {
      id: "mu2", with: "Sneha Nair",
      location: "Cafeteria", date: "Friday",
      time: "12:30 PM", status: "pending", matchType: "startup",
    },
  },
];

const CAMPUS_LOCATIONS = [
  { icon: Coffee,   label: "Cafeteria" },
  { icon: Library,  label: "Library" },
  { icon: Building2,label: "Student Center" },
  { icon: Leaf,     label: "Campus Garden" },
];

const TIME_SLOTS = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM",
  "2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];

const DATE_OPTIONS = ["Today","Tomorrow","This Saturday","This Sunday","Next Monday","Next Friday"];

/* ─── Small helpers ──────────────────────────────────────── */
function MatchTypePill({ type, size = "sm" }: { type: MatchType; size?: "sm"|"xs" }) {
  const cfg = MATCH_TYPES.find((m) => m.key === type)!;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      cfg.bg, cfg.color,
    )}>
      <cfg.icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {cfg.label}
    </span>
  );
}

function CompatibilityBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className={cn("text-xs font-bold", score >= 90 ? "text-emerald-600" : score >= 75 ? "text-blue-600" : "text-amber-600")}>
        {score}%
      </span>
    </div>
  );
}

/* ─── Discover tab ───────────────────────────────────────── */
function DiscoverTab() {
  const [activeType, setActiveType] = useState<MatchType>("startup");
  const [idx, setIdx] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, "liked"|"passed">>({});
  const [showMeetup, setShowMeetup] = useState(false);
  const [profileOpen, setProfileOpen] = useState<Candidate | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = CANDIDATES.filter((c) => c.matchTypes.includes(activeType) && !decisions[c.id]);
  const current = filtered[0] ?? null;

  const decide = (decision: "liked" | "passed") => {
    if (!current) return;
    setDecisions((d) => ({ ...d, [current.id]: decision }));
    if (decision === "liked" && Math.random() > 0.3) {
      setTimeout(() => setShowMeetup(true), 400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Match type selector */}
      <div className="flex gap-2 flex-wrap">
        {MATCH_TYPES.map(({ key, label, icon: Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => { setActiveType(key); setDecisions({}); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all",
              activeType === key
                ? cn(bg, color, "border-current")
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 border-slate-200 bg-white text-slate-500 hover:border-slate-300 ml-auto"
        >
          <Filter className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      {/* Card stack */}
      {current ? (
        <div className="flex gap-8 items-start">
          {/* Main card */}
          <div className="flex-1 max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden"
              >
                {/* Card header */}
                <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-4">
                  <div className="absolute inset-0 opacity-10">
                    <Sparkles className="absolute top-4 right-6 h-20 w-20 text-blue-400" />
                  </div>
                  <div className="flex items-end gap-4 relative z-10">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/20", current.color)}>
                      {current.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-white font-bold text-lg">{current.name}</h3>
                        {current.verified && <Shield className="h-4 w-4 text-blue-400" title="Verified student" />}
                      </div>
                      <p className="text-slate-400 text-sm">{current.dept} · {current.year}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Compatibility */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Compatibility</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{current.distance}
                      </span>
                    </div>
                    <CompatibilityBar score={current.compatibility} />
                  </div>

                  {/* Bio */}
                  <p className="text-slate-600 text-sm leading-relaxed">{current.bio}</p>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1.5">
                    {current.interests.map((i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{i}</span>
                    ))}
                  </div>

                  {/* Available for */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Open to</p>
                    <div className="flex flex-wrap gap-1.5">
                      {current.matchTypes.map((t) => <MatchTypePill key={t} type={t} />)}
                    </div>
                  </div>

                  {/* View full profile */}
                  <button
                    onClick={() => setProfileOpen(current)}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    View full profile <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="px-5 pb-5 flex gap-3">
                  <button
                    onClick={() => decide("passed")}
                    className="flex-1 h-12 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <X className="h-5 w-5" /> Pass
                  </button>
                  <button
                    onClick={() => decide("liked")}
                    className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2 font-semibold shadow-md"
                  >
                    <Heart className="h-5 w-5" /> Connect
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side info */}
          <div className="hidden lg:block w-56 space-y-4 pt-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">How matching works</p>
              <div className="space-y-2.5">
                {[
                  { icon: Star, text: "Compatibility based on shared interests & goals" },
                  { icon: Shield, text: "Verified college email only" },
                  { icon: CheckCircle2, text: "Mutual consent required for contact" },
                  { icon: MapPin, text: "Public campus meetup locations only" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2">
                    <Icon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <p className="text-xs font-bold text-blue-700 mb-1">Today's pool</p>
              <p className="text-2xl font-extrabold text-blue-700">
                {CANDIDATES.filter((c) => c.matchTypes.includes(activeType)).length}
              </p>
              <p className="text-xs text-blue-500">
                {MATCH_TYPES.find((m) => m.key === activeType)?.label} matches available
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">You've seen everyone!</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">New profiles are added daily. Check back tomorrow or try a different match type.</p>
          <Button onClick={() => setDecisions({})} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Reset Deck
          </Button>
        </div>
      )}

      {/* Mutual match dialog */}
      <Dialog open={showMeetup} onOpenChange={setShowMeetup}>
        <DialogContent className="max-w-sm">
          <div className="text-center py-4 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto"
            >
              <Heart className="h-9 w-9 text-rose-500 fill-rose-500" />
            </motion.div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">It's a Match! 🎉</h3>
              <p className="text-slate-500 text-sm mt-1">
                You and <strong>{current?.name ?? "your match"}</strong> both connected. Schedule a meetup on campus!
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowMeetup(false)}>
                Later
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setShowMeetup(false)}>
                Schedule Meetup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile detail dialog */}
      <Dialog open={!!profileOpen} onOpenChange={() => setProfileOpen(null)}>
        <DialogContent className="max-w-md">
          {profileOpen && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold", profileOpen.color)}>
                    {profileOpen.initials}
                  </div>
                  <div>
                    <DialogTitle>{profileOpen.name}</DialogTitle>
                    <p className="text-sm text-slate-500">{profileOpen.dept} · {profileOpen.year} · Age {profileOpen.age}</p>
                  </div>
                </div>
              </DialogHeader>
              <p className="text-sm text-slate-600 leading-relaxed">{profileOpen.bio}</p>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {profileOpen.interests.map((i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{i}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Open to</p>
                <div className="flex flex-wrap gap-1.5">
                  {profileOpen.matchTypes.map((t) => <MatchTypePill key={t} type={t} />)}
                </div>
              </div>
              <CompatibilityBar score={profileOpen.compatibility} />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setProfileOpen(null)}>
                  <Flag className="h-3.5 w-3.5 mr-1" /> Report
                </Button>
                <Button variant="outline" size="sm" className="text-slate-500" onClick={() => setProfileOpen(null)}>
                  <Ban className="h-3.5 w-3.5 mr-1" /> Block
                </Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setProfileOpen(null); decide("liked"); }}>
                  <Heart className="h-3.5 w-3.5 mr-1" /> Connect
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Filter Matches</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { label: "Department", placeholder: "Any department" },
              { label: "Year",       placeholder: "Any year" },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <p className="text-sm font-semibold text-slate-700 mb-1.5">{label}</p>
                <Select>
                  <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{placeholder}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setFilterOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── My Matches tab ─────────────────────────────────────── */
function MyMatchesTab({ onSchedule }: { onSchedule: (match: Match) => void }) {
  if (MY_MATCHES.length === 0) {
    return (
      <div className="text-center py-24">
        <Heart className="h-12 w-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400">No matches yet. Head to Discover to connect!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MY_MATCHES.map((match) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm", match.candidate.color)}>
              {match.candidate.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{match.candidate.name}</p>
              <p className="text-xs text-slate-400">{match.candidate.dept}</p>
            </div>
            <MatchTypePill type={match.matchType} size="xs" />
          </div>

          <CompatibilityBar score={match.candidate.compatibility} />

          <p className="text-xs text-slate-400">Matched {match.matchedOn}</p>

          {match.meetup ? (
            <div className={cn(
              "rounded-xl p-3 space-y-1",
              match.meetup.status === "confirmed" ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"
            )}>
              <div className="flex items-center gap-1.5">
                {match.meetup.status === "confirmed"
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  : <Clock className="h-3.5 w-3.5 text-amber-600" />
                }
                <span className={cn("text-xs font-bold", match.meetup.status === "confirmed" ? "text-emerald-700" : "text-amber-700")}>
                  Meetup {match.meetup.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1"><MapPin className="h-3 w-3" />{match.meetup.location}</p>
              <p className="text-xs text-slate-600 flex items-center gap-1"><Calendar className="h-3 w-3" />{match.meetup.date} · {match.meetup.time}</p>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => onSchedule(match)}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" /> Schedule Meetup
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 text-xs text-slate-500">
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> Message
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-500 hover:bg-red-50">
              <Flag className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Meetups tab ────────────────────────────────────────── */
function MeetupsTab() {
  const meetups = MY_MATCHES.filter((m) => m.meetup).map((m) => m.meetup!);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetups.map((meetup) => {
          const statusColor = meetup.status === "confirmed" ? "emerald" : meetup.status === "pending" ? "amber" : "slate";
          const locIcon = CAMPUS_LOCATIONS.find((l) => meetup.location.startsWith(l.label))?.icon ?? MapPin;
          const LocIcon = locIcon;

          return (
            <motion.div
              key={meetup.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-900">{meetup.with}</p>
                  <MatchTypePill type={meetup.matchType} size="xs" />
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold capitalize",
                  meetup.status === "confirmed" ? "bg-emerald-100 text-emerald-700"
                    : meetup.status === "pending" ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                )}>
                  {meetup.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <LocIcon className="h-4 w-4 text-slate-400" />
                  <span>{meetup.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{meetup.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{meetup.time}</span>
                </div>
              </div>

              {meetup.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-red-500 border-red-200 hover:bg-red-50">
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-3.5 w-3.5 mr-1" /> Confirm
                  </Button>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                  <Flag className="h-3.5 w-3.5 mr-1" /> Report
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-slate-400 ml-auto">
                  <Shield className="h-3.5 w-3.5 mr-1" /> Safety tips
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Safety notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">Campus Safety Reminder</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            All meetups should take place in public campus locations. Always inform a friend. Use the report button if you feel unsafe.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Match profile setup tab ────────────────────────────── */
const INTERESTS_LIST = [
  "Coding","Design","Music","Sports","Photography","Reading","Gaming",
  "Travel","Cooking","Art","Dance","Yoga","Entrepreneurship","ML/AI",
  "Robotics","Finance","Writing","Theatre","Chess","Debate",
];
const PERSONALITY = [
  { q: "I prefer...", a: ["Introvert", "Ambivert", "Extrovert"] },
  { q: "I work best...", a: ["Early morning", "Afternoon", "Late night"] },
  { q: "I value most...", a: ["Ambition", "Creativity", "Stability"] },
];

function ProfileSetupTab() {
  const [selected, setSelected] = useState<string[]>(["Coding","Entrepreneurship","Music"]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [openFor, setOpenFor] = useState<MatchType[]>(["project","startup"]);
  const [saved, setSaved] = useState(false);

  const toggleInterest = (i: string) =>
    setSelected((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i]);
  const toggleMatchType = (t: MatchType) =>
    setOpenFor((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-slate-900 text-base">Match Preferences</h3>

        {/* Open for */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">I'm open to</p>
          <div className="flex flex-wrap gap-2">
            {MATCH_TYPES.map(({ key, label, icon: Icon, color, bg }) => (
              <button
                key={key}
                onClick={() => toggleMatchType(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all",
                  openFor.includes(key)
                    ? cn(bg, color, "border-current")
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Interests <span className="text-xs text-slate-400 font-normal">(select all that apply)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_LIST.map((i) => (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  selected.includes(i)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Personality */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Personality</p>
          <div className="space-y-3">
            {PERSONALITY.map(({ q, a }) => (
              <div key={q}>
                <p className="text-xs text-slate-500 mb-1.5">{q}</p>
                <div className="flex gap-2">
                  {a.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q]: opt }))}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                        answers[q] === opt
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        >
          {saved ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved!</> : "Save Match Profile"}
        </Button>
      </div>

      {/* Privacy note */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
        <Shield className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Your match profile is only visible to other verified students who match your criteria. You can hide it anytime from Settings.
        </p>
      </div>
    </div>
  );
}

/* ─── Meetup scheduler dialog ────────────────────────────── */
function MeetupScheduler({ match, onClose }: { match: Match; onClose: () => void }) {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sent, setSent] = useState(false);

  const valid = location && date && time;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule a Meetup</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-900">Meetup request sent!</p>
            <p className="text-sm text-slate-500">Waiting for {match.candidate.name} to confirm.</p>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm", match.candidate.color)}>
                {match.candidate.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{match.candidate.name}</p>
                <MatchTypePill type={match.matchType} size="xs" />
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Pick a location</p>
              <div className="grid grid-cols-2 gap-2">
                {CAMPUS_LOCATIONS.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => setLocation(label)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                      location === label
                        ? "bg-blue-50 border-blue-400 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">When?</p>
              <Select onValueChange={setDate}>
                <SelectTrigger><SelectValue placeholder="Select date" /></SelectTrigger>
                <SelectContent>
                  {DATE_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">What time?</p>
              <Select onValueChange={setTime}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
              <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Only public campus locations. Both parties must confirm before the meetup is finalized.</p>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!valid}
              onClick={() => setSent(true)}
            >
              Send Meetup Request
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Match() {
  const [schedulingMatch, setSchedulingMatch] = useState<Match | null>(null);

  const stats = [
    { icon: Flame,   value: MY_MATCHES.length, label: "Active Matches", color: "text-rose-500" },
    { icon: Calendar,value: MY_MATCHES.filter((m) => m.meetup).length, label: "Meetups Planned", color: "text-blue-500" },
    { icon: Users,   value: CANDIDATES.length, label: "Profiles Near You", color: "text-violet-500" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Campus Match</h1>
          <p className="text-slate-500 text-sm mt-0.5">Find dating, friendship, study, project & startup connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <Icon className={cn("h-6 w-6 mx-auto mb-1.5", color)} />
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="discover">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="discover"  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Discover
          </TabsTrigger>
          <TabsTrigger value="matches"   className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Heart className="h-3.5 w-3.5 mr-1.5" /> My Matches
            <span className="ml-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{MY_MATCHES.length}</span>
          </TabsTrigger>
          <TabsTrigger value="meetups"   className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5" /> Meetups
          </TabsTrigger>
          <TabsTrigger value="setup"     className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-3.5 w-3.5 mr-1.5" /> My Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover"  className="mt-5"><DiscoverTab /></TabsContent>
        <TabsContent value="matches"   className="mt-5"><MyMatchesTab onSchedule={setSchedulingMatch} /></TabsContent>
        <TabsContent value="meetups"   className="mt-5"><MeetupsTab /></TabsContent>
        <TabsContent value="setup"     className="mt-5"><ProfileSetupTab /></TabsContent>
      </Tabs>

      {/* Meetup scheduler modal */}
      {schedulingMatch && (
        <MeetupScheduler match={schedulingMatch} onClose={() => setSchedulingMatch(null)} />
      )}
    </div>
  );
}
