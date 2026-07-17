/**
 * Campus Match — full peer-matching system
 * Tabs: Discover | My Matches | Meetups | My Profile
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Users, BookOpen, X, Check, MapPin, Clock, Calendar,
  Star, Shield, ChevronRight, Sparkles, Coffee, Library,
  Leaf, Building2, Filter, RefreshCw, CheckCircle2, User,
  Settings, Ban, Flag, Eye, EyeOff, Bell, ArrowLeft, ArrowRight,
  Pencil, Save, Cake, Phone, GraduationCap, UserCheck, UserX,
  MessageCircle, Zap, Music, Gamepad2, Film, Book, Cpu, Dumbbell,
  Moon, Sun, Brain, Globe, Lock, Plus, Minus, ChevronDown, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
type LookingFor = "Friendship" | "Study Partner" | "Relationship";
type Visibility = "own-college" | "all-colleges" | "hidden";
type Gender = "Male" | "Female" | "Non-binary" | "Prefer not to say";
type Personality = "Introvert" | "Extrovert" | "Ambivert";
type StudyStyle = "Solo" | "Group" | "Either";
type TimeType = "Early Bird" | "Night Owl" | "Flexible";
type MeetupType = "Coffee Chat" | "Study Session" | "Campus Walk" | "Club/Event Visit" | "Custom";
type MeetupStatus = "pending" | "confirmed" | "completed" | "cancelled";
type RequestStatus = "pending" | "accepted" | "passed";

interface MatchProfile {
  name: string; dob: string; gender: Gender; college: string;
  zodiac: string; age: number;
  interests: string[]; hobbies: string[]; sports: string[];
  music: string[]; movies: string[]; gaming: string[];
  reading: string[]; tech: string[];
  personality: Personality; timeType: TimeType; studyStyle: StudyStyle;
  socialLevel: number; // 1-5
  lookingFor: LookingFor[]; ageMin: number; ageMax: number;
  prefGender: string; prefCollege: "own" | "all";
  prefPersonality: Personality | "Either";
  prefStudyStyle: StudyStyle;
  prefInterests: string[];
  visibility: Visibility;
  bio: string;
  photos: string[]; // base64 data URLs, min 1 max 2
}

interface Candidate {
  id: string; name: string; initials: string; color: string;
  photo?: string; dept: string; year: string; age: number; gender: Gender;
  college: string; bio: string;
  interests: string[]; hobbies: string[]; sports: string[];
  music: string[]; personality: Personality; studyStyle: StudyStyle;
  lookingFor: LookingFor[]; compatibility: number; zodiac: string;
  verified: boolean;
}

interface MatchRequest {
  id: string; candidate: Candidate;
  lookingFor: LookingFor; sentAt: string;
  status: RequestStatus;
}

interface ConnectedMatch {
  id: string; candidate: Candidate;
  lookingFor: LookingFor; connectedOn: string;
  meetup?: Meetup;
}

interface Meetup {
  id: string; withName: string; withId: string;
  type: MeetupType; date: string; time: string;
  location: string; notes: string; status: MeetupStatus;
  proposedBy: "me" | "them";
  purpose: LookingFor;
  availableDays: string[];
  preferredTimeSlot: string;
  editCount: number;        // how many edit-requests have been made
  editRequestBy?: "me" | "them"; // who sent the latest edit request
  // Pending edit proposal — set when someone requests an edit
  pendingDate?: string;
  pendingTime?: string;
  pendingLocation?: string;
  pendingNotes?: string;
}

/* ══════════════════════════════════════════════════════════
   ZODIAC HELPER
══════════════════════════════════════════════════════════ */
function getZodiac(dob: string): string {
  if (!dob) return "—";
  const d = new Date(dob); const m = d.getMonth() + 1; const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "♈ Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "♉ Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "♊ Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "♋ Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "♌ Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "♍ Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "♎ Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "♏ Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "♐ Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "♑ Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "♒ Aquarius";
  return "♓ Pisces";
}
function calcAge(dob: string): number {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

/* ══════════════════════════════════════════════════════════
   COMPATIBILITY ENGINE
   Weights: Interests 28 | LookingFor 20 | Personality 15
            Hobbies 12 | StudyStyle 10 | Music 8 | Sports 7
   Total = 100 pts → clamped to 30–99
══════════════════════════════════════════════════════════ */
export interface CompatBreakdown {
  score: number;
  interests: number; lookingFor: number; personality: number;
  hobbies: number; studyStyle: number; music: number; sports: number;
  sharedInterests: string[]; sharedHobbies: string[]; sharedMusic: string[]; sharedSports: string[];
  profileComplete: boolean;
}

function overlap(a: string[], b: string[]): string[] {
  const bSet = new Set(b.map(s => s.toLowerCase()));
  return a.filter(s => bSet.has(s.toLowerCase()));
}
function pct(shared: number, total: number): number {
  return total === 0 ? 0 : shared / total;
}

export function calculateCompatibility(profile: MatchProfile | null, candidate: Candidate): CompatBreakdown {
  if (!profile || (!profile.interests.length && !profile.hobbies.length && !profile.lookingFor.length)) {
    return {
      score: candidate.compatibility, interests: 0, lookingFor: 0, personality: 0,
      hobbies: 0, studyStyle: 0, music: 0, sports: 0,
      sharedInterests: [], sharedHobbies: [], sharedMusic: [], sharedSports: [],
      profileComplete: false,
    };
  }

  // 1. Interests (28 pts)
  const sharedInterests = overlap(profile.interests, candidate.interests);
  const interestsScore = pct(sharedInterests.length,
    Math.max(profile.interests.length, candidate.interests.length, 1)) * 28;

  // 2. LookingFor overlap (20 pts)
  const lfOverlap = profile.lookingFor.filter(lf => candidate.lookingFor.includes(lf)).length;
  const lookingForScore = lfOverlap > 0 ? (lfOverlap / Math.max(profile.lookingFor.length, 1)) * 20 : 0;

  // 3. Personality (15 pts)
  let personalityScore = 0;
  if (profile.personality === candidate.personality) personalityScore = 15;
  else if (profile.personality === "Ambivert" || candidate.personality === "Ambivert") personalityScore = 10;
  else personalityScore = 4; // opposite types still get some

  // 4. Hobbies (12 pts)
  const sharedHobbies = overlap(profile.hobbies, candidate.hobbies);
  const hobbiesScore = pct(sharedHobbies.length,
    Math.max(profile.hobbies.length, candidate.hobbies.length, 1)) * 12;

  // 5. Study style (10 pts)
  let studyScore = 0;
  if (profile.studyStyle === "Either" || candidate.studyStyle === "Either") studyScore = 7;
  else if (profile.studyStyle === candidate.studyStyle) studyScore = 10;
  else studyScore = 2;

  // 6. Music (8 pts)
  const sharedMusic = overlap(profile.music, candidate.music);
  const musicScore = pct(sharedMusic.length,
    Math.max(profile.music.length, candidate.music.length, 1)) * 8;

  // 7. Sports (7 pts)
  const sharedSports = overlap(profile.sports, candidate.sports);
  const sportsScore = pct(sharedSports.length,
    Math.max(profile.sports.length, candidate.sports.length, 1)) * 7;

  const raw = interestsScore + lookingForScore + personalityScore + hobbiesScore + studyScore + musicScore + sportsScore;
  const score = Math.min(99, Math.max(30, Math.round(raw)));

  return {
    score, profileComplete: true,
    interests: Math.round(interestsScore), lookingFor: Math.round(lookingForScore),
    personality: Math.round(personalityScore), hobbies: Math.round(hobbiesScore),
    studyStyle: Math.round(studyScore), music: Math.round(musicScore), sports: Math.round(sportsScore),
    sharedInterests, sharedHobbies, sharedMusic, sharedSports,
  };
}

function loadMatchProfile(): MatchProfile | null {
  try { const s = localStorage.getItem("cc_match_profile"); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

/* ══════════════════════════════════════════════════════════
   SEED DATA
══════════════════════════════════════════════════════════ */
const CANDIDATES: Candidate[] = [
  { id: "c1", name: "Riya Sharma", initials: "RS", color: "bg-rose-400",
    photo: "https://i.pravatar.cc/300?u=riya_sharma_cc",
    dept: "Computer Science", year: "3rd Year", age: 21, gender: "Female",
    college: "NIT Trichy", bio: "Love building apps and exploring new ideas. Looking for a study buddy or project co-founder who shares the same passion for tech! 🚀",
    interests: ["UI/UX", "React", "Startups"], hobbies: ["Photography", "Hiking", "Journaling"],
    sports: ["Badminton", "Swimming"], music: ["Indie Pop", "Classical"],
    personality: "Ambivert", studyStyle: "Group",
    lookingFor: ["Friendship", "Study Partner"], compatibility: 94, zodiac: "♎ Libra", verified: true },
  { id: "c2", name: "Arjun Patel", initials: "AP", color: "bg-blue-400",
    photo: "https://i.pravatar.cc/300?u=arjun_patel_cc",
    dept: "Data Science", year: "2nd Year", age: 20, gender: "Male",
    college: "NIT Trichy", bio: "Data nerd by day, guitar player by night. Always up for deep conversations and study sessions. 📊🎸",
    interests: ["Python", "ML", "Data Viz"], hobbies: ["Guitar", "Chess", "Reading"],
    sports: ["Chess", "Table Tennis"], music: ["Rock", "Jazz"],
    personality: "Introvert", studyStyle: "Solo",
    lookingFor: ["Friendship", "Study Partner"], compatibility: 88, zodiac: "♐ Sagittarius", verified: true },
  { id: "c3", name: "Sneha Nair", initials: "SN", color: "bg-violet-400",
    photo: "https://i.pravatar.cc/300?u=sneha_nair_cc",
    dept: "Product Design", year: "3rd Year", age: 21, gender: "Female",
    college: "NIT Trichy", bio: "Designer who loves crafting stories. Passionate about meaningful UX and mindful living. ✨",
    interests: ["Figma", "Typography", "Research"], hobbies: ["Coffee brewing", "Podcasts", "Travel"],
    sports: ["Yoga", "Cycling"], music: ["Lo-fi", "Indie"],
    personality: "Introvert", studyStyle: "Solo",
    lookingFor: ["Friendship", "Relationship"], compatibility: 82, zodiac: "♊ Gemini", verified: true },
  { id: "c4", name: "Karan Mehta", initials: "KM", color: "bg-amber-400",
    photo: "https://i.pravatar.cc/300?u=karan_mehta_cc",
    dept: "Mechanical Eng.", year: "4th Year", age: 22, gender: "Male",
    college: "NIT Trichy", bio: "Robotics club lead building an autonomous delivery bot for my thesis. Need a CS partner! 🤖",
    interests: ["Robotics", "CAD", "Entrepreneurship"], hobbies: ["3D Printing", "Gaming", "Cricket"],
    sports: ["Cricket", "Football"], music: ["EDM", "Hip-Hop"],
    personality: "Extrovert", studyStyle: "Group",
    lookingFor: ["Friendship", "Study Partner"], compatibility: 79, zodiac: "♉ Taurus", verified: true },
  { id: "c5", name: "Ananya Roy", initials: "AR", color: "bg-emerald-400",
    photo: "https://i.pravatar.cc/300?u=ananya_roy_cc",
    dept: "MBA", year: "1st Year", age: 23, gender: "Female",
    college: "NIT Trichy", bio: "Marketing strategist passionate about EdTech and social impact. Let's build something together! 🌱",
    interests: ["Marketing", "EdTech", "Social Impact"], hobbies: ["Cooking", "Writing", "Films"],
    sports: ["Running", "Yoga"], music: ["Bollywood", "Pop"],
    personality: "Extrovert", studyStyle: "Group",
    lookingFor: ["Friendship", "Relationship"], compatibility: 75, zodiac: "♓ Pisces", verified: true },
  { id: "c6", name: "Dev Kumar", initials: "DK", color: "bg-sky-400",
    photo: "https://i.pravatar.cc/300?u=dev_kumar_cc",
    dept: "Electronics", year: "3rd Year", age: 21, gender: "Male",
    college: "NIT Trichy", bio: "Embedded systems + IoT. Building a smart campus energy monitor. Always up for hackathons! ⚡",
    interests: ["IoT", "C++", "Hardware"], hobbies: ["Gaming", "Anime", "Cooking"],
    sports: ["Badminton", "Chess"], music: ["Metal", "Classical"],
    personality: "Introvert", studyStyle: "Solo",
    lookingFor: ["Friendship", "Study Partner"], compatibility: 71, zodiac: "♌ Leo", verified: false },
];

const SEED_INCOMING: MatchRequest[] = [
  { id: "ir1", candidate: CANDIDATES[1], lookingFor: "Study Partner", sentAt: "2h ago", status: "pending" },
  { id: "ir2", candidate: CANDIDATES[3], lookingFor: "Friendship", sentAt: "1d ago",  status: "pending" },
];
const SEED_OUTGOING: MatchRequest[] = [
  { id: "or1", candidate: CANDIDATES[2], lookingFor: "Friendship", sentAt: "3h ago", status: "pending" },
  { id: "or2", candidate: CANDIDATES[4], lookingFor: "Friendship", sentAt: "2d ago", status: "accepted" },
];
const SEED_CONNECTED: ConnectedMatch[] = [
  { id: "cm1", candidate: CANDIDATES[0], lookingFor: "Study Partner", connectedOn: "2 days ago",
    meetup: { id: "mu1", withName: "Riya Sharma", withId: "c1", type: "Study Session",
      date: "Tomorrow", time: "4:00 PM", location: "Library — Study Room A",
      notes: "Bring DS notes", status: "confirmed", proposedBy: "me",
      purpose: "Study Partner", availableDays: ["Monday","Wednesday","Friday"], preferredTimeSlot: "Afternoon (12pm–4pm)" } },
  { id: "cm2", candidate: CANDIDATES[5], lookingFor: "Friendship", connectedOn: "5 days ago" },
];

const MEETUP_TYPES: MeetupType[] = ["Coffee Chat", "Study Session", "Campus Walk", "Club/Event Visit", "Custom"];
const MEETUP_ICONS: Record<MeetupType, React.FC<{ className?: string }>> = {
  "Coffee Chat": Coffee, "Study Session": Library, "Campus Walk": Leaf,
  "Club/Event Visit": Building2, "Custom": Sparkles,
};
const DEFAULT_LOCATIONS = ["Central Cafeteria", "Library — Study Room A", "Central Garden", "Student Activity Center", "Sports Complex Lobby", "Open Air Theatre", "CS Block Atrium"];
const TIME_SLOTS = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];
const DATE_OPTIONS = ["Today","Tomorrow","This Saturday","This Sunday","Next Monday","Next Friday"];
const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function getCampusLocations(college: string): string[] {
  try {
    const raw = localStorage.getItem("cc_campus_locations");
    if (!raw) return DEFAULT_LOCATIONS;
    const all: Array<{ college: string; name: string; active: boolean }> = JSON.parse(raw);
    const filtered = all.filter(l => l.active && l.college === college).map(l => l.name);
    return filtered.length > 0 ? filtered : DEFAULT_LOCATIONS;
  } catch { return DEFAULT_LOCATIONS; }
}

const INTEREST_OPTS = ["Machine Learning", "Web Dev", "App Dev", "UI/UX", "Data Science", "Cybersecurity", "Blockchain", "Open Source", "Game Dev", "Photography", "Graphic Design", "Writing", "Poetry", "Film Making", "Content Creation", "Public Speaking"];
const HOBBY_OPTS = ["Reading", "Cooking", "Hiking", "Travel", "Journaling", "Coffee brewing", "Podcasts", "Gaming", "Anime", "Gardening", "Painting", "Chess"];
const SPORT_OPTS = ["Cricket", "Football", "Badminton", "Basketball", "Table Tennis", "Chess", "Swimming", "Running", "Cycling", "Yoga", "Gym", "Volleyball"];
const MUSIC_OPTS = ["Bollywood", "Pop", "Rock", "Hip-Hop", "Classical", "Indie", "EDM", "Jazz", "Lo-fi", "Metal", "Country", "R&B"];
const MOVIE_OPTS = ["Sci-Fi", "Thriller", "Comedy", "Romance", "Action", "Horror", "Documentary", "Animation", "Drama", "Mystery"];
const GAME_OPTS = ["Mobile Gaming", "PC Gaming", "Console", "Board Games", "Chess", "Card Games", "Esports"];
const TECH_OPTS = ["AI/ML", "Web Dev", "Android Dev", "iOS Dev", "Cloud", "Cybersecurity", "IoT", "Robotics", "Blockchain", "AR/VR"];

/* ══════════════════════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════════════════════ */
function CompatBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-blue-500" : "bg-amber-500";
  const text = score >= 90 ? "text-emerald-600" : score >= 75 ? "text-blue-600" : "text-amber-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className={cn("h-full rounded-full", color)} initial={{ width: 0 }}
          animate={{ width: `${score}%` }} transition={{ duration: 0.7, ease: "easeOut" }} />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", text)}>{score}%</span>
    </div>
  );
}

function TagChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("text-xs font-semibold rounded-full px-2.5 py-1 border transition-all",
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600")}>
      {active && "✓ "}{label}
    </button>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "warn" }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={cn("fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2",
        type === "success" ? "bg-slate-900 text-white" : "bg-amber-500 text-white")}>
      {type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {msg}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   MEETUP FORM MODAL
══════════════════════════════════════════════════════════ */
function MeetupForm({ withName, purpose, college, onSave, onClose }: {
  withName: string; purpose: LookingFor; college: string;
  onSave: (m: Omit<Meetup, "id" | "withId" | "proposedBy">) => void;
  onClose: () => void;
}) {
  const campusLocations = getCampusLocations(college);
  const [type, setType] = useState<MeetupType>(
    purpose === "Study Partner" ? "Study Session" : purpose === "Friendship" ? "Coffee Chat" : "Coffee Chat"
  );
  const [date, setDate] = useState(DATE_OPTIONS[1]);
  const [time, setTime] = useState("4:00 PM");
  const [location, setLocation] = useState(campusLocations[0] ?? "Central Cafeteria");
  const [notes, setNotes] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>(["Saturday", "Sunday"]);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>("4:00 PM – 7:00 PM");

  const TIME_PREFS = ["Morning (8am–12pm)", "Afternoon (12pm–4pm)", "Evening (4pm–8pm)", "Flexible"];

  const toggleDay = (d: string) =>
    setAvailableDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const PURPOSE_COLORS: Record<LookingFor, string> = {
    "Friendship":    "bg-violet-100 text-violet-700 border-violet-200",
    "Study Partner": "bg-blue-100 text-blue-700 border-blue-200",
    "Relationship":  "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-none">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Propose Meetup</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500">with <strong>{withName}</strong></p>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", PURPOSE_COLORS[purpose])}>
                {purpose === "Friendship" ? "🤝" : purpose === "Study Partner" ? "📚" : "💞"} {purpose}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="h-4 w-4 text-slate-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Purpose banner */}
          <div className={cn("rounded-xl px-4 py-3 border", PURPOSE_COLORS[purpose])}>
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5">Purpose</p>
            <p className="text-sm font-semibold">
              {purpose === "Friendship" ? "Making new friends — casual hangout 🤝" :
               purpose === "Study Partner" ? "Study session — academic collaboration 📚" :
               "Getting to know each other better 💞"}
            </p>
          </div>

          {/* Meetup Type */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Meetup Type</p>
            <div className="grid grid-cols-2 gap-2">
              {MEETUP_TYPES.map(t => {
                const Icon = MEETUP_ICONS[t];
                return (
                  <button key={t} onClick={() => setType(t)}
                    className={cn("flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-semibold",
                      type === t ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                    <Icon className="h-4 w-4 flex-none" />{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Availability */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">My Available Days</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map(d => (
                <button key={d} onClick={() => toggleDay(d)}
                  className={cn("text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all",
                    availableDays.includes(d) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300")}>
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Time</p>
              <div className="flex flex-wrap gap-2">
                {TIME_PREFS.map(t => (
                  <button key={t} onClick={() => setPreferredTimeSlot(t)}
                    className={cn("text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all",
                      preferredTimeSlot === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Proposed Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Proposed Date</p>
              <select value={date} onChange={e => setDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {DATE_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Proposed Time</p>
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Campus Location (mod-approved) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Location</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ Campus-approved</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {campusLocations.map(l => (
                <button key={l} onClick={() => setLocation(l)}
                  className={cn("text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all flex items-center gap-1.5",
                    location === l ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400")}>
                  <MapPin className="h-3 w-3" />{l}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Only safe, campus-approved public locations are shown. Managed by your college moderator.</p>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes <span className="font-normal normal-case text-slate-400">(optional)</span></p>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Anything you want them to know beforehand…"
              className="w-full rounded-xl border border-input bg-slate-50 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-none">
          <Button variant="outline" className="px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-bold" disabled={availableDays.length === 0}
            onClick={() => {
              onSave({ withName, purpose, type, date, time, location, notes, status: "pending", availableDays, preferredTimeSlot });
              onClose();
            }}>
            <Calendar className="h-4 w-4 mr-2" /> Send Meetup Request
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EDIT REQUEST FORM MODAL
   Lets Student A propose a new date / time / location
══════════════════════════════════════════════════════════ */
function EditRequestForm({ meetup, college, onSave, onClose }: {
  meetup: Meetup; college: string;
  onSave: (pendingDate: string, pendingTime: string, pendingLocation: string, pendingNotes: string) => void;
  onClose: () => void;
}) {
  const campusLocations = getCampusLocations(college);
  const [date, setDate]         = useState(meetup.date);
  const [time, setTime]         = useState(meetup.time);
  const [location, setLocation] = useState(meetup.location);
  const [notes, setNotes]       = useState(meetup.notes ?? "");

  const changed = date !== meetup.date || time !== meetup.time || location !== meetup.location || notes !== meetup.notes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-none">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Request Schedule Change</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proposing a new time for your <strong>{meetup.type}</strong> with <strong>{meetup.withName}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Current schedule */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Schedule</p>
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> {meetup.date}
              <Clock className="h-3.5 w-3.5 text-slate-400 ml-2" /> {meetup.time}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {meetup.location}
            </p>
          </div>

          {/* New Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Date</p>
              <select value={date} onChange={e => setDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {DATE_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Time</p>
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* New Location */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Location</p>
            <div className="flex flex-wrap gap-2">
              {campusLocations.map(l => (
                <button key={l} onClick={() => setLocation(l)}
                  className={cn("text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all flex items-center gap-1.5",
                    location === l ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400")}>
                  <MapPin className="h-3 w-3" />{l}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Reason / Note <span className="font-normal normal-case text-slate-400">(optional)</span>
            </p>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. I have a lab session, can we move it to evening?"
              className="w-full rounded-xl border border-input bg-slate-50 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {!changed && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 font-semibold">
              ⚠️ Change at least one field (date, time, or location) before sending.
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-none">
          <button onClick={onClose}
            className="px-5 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button disabled={!changed}
            onClick={() => { onSave(date, time, location, notes); onClose(); }}
            className={cn("flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
              changed
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
            <Pencil className="h-4 w-4" /> Send Edit Request
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANDIDATE CARD (full profile modal)
══════════════════════════════════════════════════════════ */
function CandidateProfileModal({ candidate, onConnect, onPass, onClose }: {
  candidate: Candidate; onConnect: () => void; onPass: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        {/* Header banner */}
        <div className={cn("h-28 relative flex-none overflow-hidden", candidate.color)}>
          {candidate.photo && (
            <img src={candidate.photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 z-10"><X className="h-4 w-4" /></button>
          <div className="absolute -bottom-8 left-5 z-10">
            {candidate.photo ? (
              <img src={candidate.photo} alt={candidate.name}
                className="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover" />
            ) : (
              <div className={cn("w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-white font-bold text-xl shadow-md", candidate.color)}>
                {candidate.initials}
              </div>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 pt-12 pb-4 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{candidate.name}</h2>
              {candidate.verified && <Shield className="h-4 w-4 text-blue-500" />}
            </div>
            <p className="text-sm text-slate-500">{candidate.dept} · {candidate.year} · {candidate.age} yrs · {candidate.zodiac}</p>
            <p className="text-xs text-slate-400 mt-0.5">{candidate.college}</p>
          </div>
          <CompatBar score={candidate.compatibility} />
          <p className="text-sm text-slate-700 leading-relaxed">{candidate.bio}</p>
          {[
            { label: "Interests", items: candidate.interests, color: "bg-blue-50 text-blue-700" },
            { label: "Hobbies", items: candidate.hobbies, color: "bg-purple-50 text-purple-700" },
            { label: "Sports", items: candidate.sports, color: "bg-emerald-50 text-emerald-700" },
            { label: "Music", items: candidate.music, color: "bg-pink-50 text-pink-700" },
          ].map(({ label, items, color }) => items.length > 0 && (
            <div key={label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map(i => <span key={i} className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", color)}>{i}</span>)}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Personality", value: candidate.personality },
              { label: "Study Style", value: candidate.studyStyle },
              { label: "Looking for", value: candidate.lookingFor[0] },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{label}</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2 flex-none">
          <button onClick={() => { onPass(); onClose(); }}
            className="flex-1 h-11 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold text-sm">
            <X className="h-4 w-4" /> Pass
          </button>
          <button onClick={() => { onConnect(); onClose(); }}
            className="flex-1 h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 font-semibold text-sm shadow-md">
            <Heart className="h-4 w-4" /> Connect
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPAT BREAKDOWN MINI CARD
══════════════════════════════════════════════════════════ */
function BreakdownBar({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-16 flex-none">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }} animate={{ width: `${(score / max) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
      <span className="text-[10px] font-bold text-slate-700 w-6 text-right">{score}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DISCOVER CARD (compact grid card)
══════════════════════════════════════════════════════════ */
function DiscoverCard({
  candidate, compat, filterLF, onDecide, onViewProfile, onMeetup,
}: {
  candidate: Candidate;
  compat: CompatBreakdown;
  filterLF: LookingFor | "All";
  onDecide: (d: "liked" | "passed") => void;
  onViewProfile: () => void;
  onMeetup: () => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [decided, setDecided] = useState<"liked" | "passed" | null>(null);

  const LF_COLORS: Record<string, string> = {
    "All": "bg-slate-900 text-white",
    "Friendship": "bg-violet-100 text-violet-700",
    "Study Partner": "bg-blue-100 text-blue-700",
    "Relationship": "bg-rose-100 text-rose-700",
  };

  const decide = (d: "liked" | "passed") => {
    setDecided(d);
    setTimeout(() => onDecide(d), 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: decided ? 0 : 1, scale: decided ? 0.92 : 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

      {/* Color banner */}
      <div className={cn("h-16 relative flex-none", candidate.color)}>
        <div className="absolute inset-0 opacity-20 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        {candidate.verified && (
          <span className="absolute top-2 left-2 bg-white/90 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Shield className="h-2 w-2" /> Verified
          </span>
        )}
        <span className="absolute top-2 right-2 bg-white/90 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{candidate.college}</span>

        {/* Avatar */}
        <div className="absolute -bottom-5 left-3">
          {candidate.photo ? (
            <img src={candidate.photo} alt={candidate.name}
              className="w-11 h-11 rounded-xl border-2 border-white shadow object-cover" />
          ) : (
            <div className={cn("w-11 h-11 rounded-xl border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow", candidate.color)}>
              {candidate.initials}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 pt-7 pb-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{candidate.name}, {candidate.age}</h3>
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{candidate.dept} · {candidate.year}</p>
        </div>

        {/* Score row */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500">Match</span>
              {compat.profileComplete
                ? <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1 py-0.5 rounded-full">Live</span>
                : <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 py-0.5 rounded-full">Default</span>
              }
            </div>
            <button onClick={() => setShowBreakdown(p => !p)}
              className="text-[9px] text-blue-500 hover:text-blue-700 font-bold flex items-center gap-0.5">
              {showBreakdown ? "▲" : "Why?"}
            </button>
          </div>
          <CompatBar score={compat.score} />
        </div>

        {/* Breakdown panel */}
        <AnimatePresence>
          {showBreakdown && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 border border-slate-100">
                <BreakdownBar label="Interests"   score={compat.interests}   max={28} color="bg-blue-500" />
                <BreakdownBar label="Looking for" score={compat.lookingFor}  max={20} color="bg-violet-500" />
                <BreakdownBar label="Personality" score={compat.personality} max={15} color="bg-emerald-500" />
                <BreakdownBar label="Hobbies"     score={compat.hobbies}     max={12} color="bg-amber-500" />
                <BreakdownBar label="Study"       score={compat.studyStyle}  max={10} color="bg-pink-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interest chips */}
        <div className="flex flex-wrap gap-1">
          {[...candidate.interests, ...candidate.hobbies].slice(0, 4).map(i => {
            const isShared = compat.sharedInterests.includes(i) || compat.sharedHobbies.includes(i);
            return (
              <span key={i} className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium",
                isShared ? "bg-blue-100 text-blue-700 font-bold" : "bg-slate-100 text-slate-500")}>
                {isShared && "✓"}{i}
              </span>
            );
          })}
        </div>

        {/* LookingFor badges */}
        <div className="flex flex-wrap gap-1">
          {candidate.lookingFor.map(lf => (
            <span key={lf} className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", LF_COLORS[lf])}>{lf}</span>
          ))}
        </div>

        <button onClick={onViewProfile}
          className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5 mt-auto">
          Full profile <ChevronRight className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-3 pb-3 flex gap-2">
        <button onClick={() => decide("passed")}
          className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1 text-xs font-semibold">
          <X className="h-3.5 w-3.5" /> Pass
        </button>
        <button onClick={() => decide("liked")}
          className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-1 text-xs font-bold shadow">
          <Heart className="h-3.5 w-3.5" /> Connect
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   DISCOVER TAB — grid of all candidates
══════════════════════════════════════════════════════════ */
function DiscoverTab({ onConnect, notify }: { onConnect: (c: Candidate, lf: LookingFor) => void; notify: (m: string, t?: "success"|"warn") => void }) {
  const [decisions, setDecisions] = useState<Record<string, "liked"|"passed">>({});
  const [profileOpen, setProfileOpen] = useState<Candidate | null>(null);
  const [matchDialog, setMatchDialog] = useState<Candidate | null>(null);
  const [filterLF, setFilterLF] = useState<LookingFor | "All">("All");
  const [meetupOpen, setMeetupOpen] = useState<Candidate | null>(null);
  const [myProfile, setMyProfile] = useState<MatchProfile | null>(loadMatchProfile);

  useEffect(() => {
    const refresh = () => setMyProfile(loadMatchProfile());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const scoredPool = CANDIDATES
    .filter(c => !decisions[c.id] && (filterLF === "All" || c.lookingFor.includes(filterLF as LookingFor)))
    .map(c => ({ ...c, liveCompat: calculateCompatibility(myProfile, c) }))
    .sort((a, b) => b.liveCompat.score - a.liveCompat.score);

  const profileComplete = scoredPool[0]?.liveCompat?.profileComplete ?? false;

  const decide = (c: Candidate, d: "liked" | "passed") => {
    setDecisions(prev => ({ ...prev, [c.id]: d }));
    if (d === "liked") {
      onConnect(c, filterLF === "All" ? c.lookingFor[0] : filterLF as LookingFor);
      if (Math.random() > 0.4) setTimeout(() => setMatchDialog(c), 350);
      else notify(`Connect request sent to ${c.name}!`);
    } else {
      notify(`Passed on ${c.name}.`, "warn");
    }
  };

  const LOOKING_FOR_OPTIONS: (LookingFor | "All")[] = ["All", "Friendship", "Study Partner", "Relationship"];
  const LF_COLORS: Record<string, string> = { "All": "bg-slate-900 text-white", "Friendship": "bg-violet-100 text-violet-700", "Study Partner": "bg-blue-100 text-blue-700", "Relationship": "bg-rose-100 text-rose-700" };

  return (
    <div className="space-y-5">
      {/* Profile nudge / live score banner */}
      {!profileComplete ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <Zap className="h-4 w-4 text-amber-500 flex-none" />
          <p className="text-xs text-amber-700 font-semibold flex-1">
            Fill in <strong>My Profile</strong> for a real compatibility score based on your interests & personality.
          </p>
          <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full flex-none">Using defaults</span>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-none" />
          <p className="text-xs text-emerald-700 font-semibold">Live scores from your profile — sorted best match first.</p>
        </motion.div>
      )}

      {/* Filters + count */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Showing:</span>
          {LOOKING_FOR_OPTIONS.map(o => (
            <button key={o} onClick={() => { setFilterLF(o); setDecisions({}); }}
              className={cn("px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                filterLF === o ? LF_COLORS[o] + " border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
              {o}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">{scoredPool.length} student{scoredPool.length !== 1 ? "s" : ""}</span>
          {Object.keys(decisions).length > 0 && (
            <button onClick={() => setDecisions({})}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 rounded-full px-2.5 py-1 hover:bg-blue-50">
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {scoredPool.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {scoredPool.map(c => (
              <DiscoverCard
                key={c.id}
                candidate={c}
                compat={c.liveCompat}
                filterLF={filterLF}
                onDecide={d => decide(c, d)}
                onViewProfile={() => setProfileOpen(c)}
                onMeetup={() => setMeetupOpen(c)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">All done!</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">You've reviewed everyone. New profiles join daily.</p>
          <Button variant="outline" onClick={() => setDecisions({})}><RefreshCw className="h-4 w-4 mr-2" />Reset</Button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {profileOpen && (
          <CandidateProfileModal key="profile" candidate={profileOpen}
            onConnect={() => decide(profileOpen, "liked")}
            onPass={() => decide(profileOpen, "passed")}
            onClose={() => setProfileOpen(null)} />
        )}
      </AnimatePresence>

      {/* Mutual match popup */}
      <AnimatePresence>
        {matchDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMatchDialog(null)} />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="relative bg-white rounded-3xl p-8 text-center max-w-xs mx-4 shadow-2xl">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
                className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-9 w-9 text-rose-500 fill-rose-500" />
              </motion.div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">It's a Match! 🎉</h3>
              <p className="text-slate-500 text-sm mb-1">You and <strong>{matchDialog.name}</strong> connected!</p>
              <p className="text-xs text-slate-400 mb-6">Propose a campus meetup to get to know each other.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setMatchDialog(null)}>Later</Button>
                <Button className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => { setMeetupOpen(matchDialog); setMatchDialog(null); }}>
                  <Calendar className="h-4 w-4 mr-1.5" /> Plan Meetup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {meetupOpen && (
          <MeetupForm key="meetup-form" withName={meetupOpen.name}
            purpose={filterLF === "All" ? meetupOpen.lookingFor[0] : filterLF as LookingFor}
            college={meetupOpen.college}
            onSave={() => notify(`Meetup proposed to ${meetupOpen.name}! ☕`)}
            onClose={() => setMeetupOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MY MATCHES TAB
══════════════════════════════════════════════════════════ */
function MyMatchesTab({ notify }: { notify: (m: string, t?: "success"|"warn") => void }) {
  const [incoming, setIncoming] = useState<MatchRequest[]>(SEED_INCOMING);
  const [outgoing, setOutgoing] = useState<MatchRequest[]>(SEED_OUTGOING);
  const [connected, setConnected] = useState<ConnectedMatch[]>(SEED_CONNECTED);
  const [subTab, setSubTab] = useState<"incoming"|"outgoing"|"connected">("incoming");
  const [profileOpen, setProfileOpen] = useState<Candidate | null>(null);
  const [meetupOpen, setMeetupOpen] = useState<ConnectedMatch | null>(null);

  const acceptRequest = (id: string) => {
    const req = incoming.find(r => r.id === id)!;
    setIncoming(p => p.filter(r => r.id !== id));
    setConnected(p => [...p, { id: `cm_${Date.now()}`, candidate: req.candidate, lookingFor: req.lookingFor, connectedOn: "Just now" }]);
    notify(`Connected with ${req.candidate.name}! 🎉`);
  };
  const declineRequest = (id: string) => {
    const req = incoming.find(r => r.id === id)!;
    setIncoming(p => p.filter(r => r.id !== id));
    notify(`Passed on ${req.candidate.name}.`, "warn");
  };
  const unmatch = (id: string) => {
    const m = connected.find(c => c.id === id)!;
    setConnected(p => p.filter(c => c.id !== id));
    notify(`Unmatched from ${m.candidate.name}.`, "warn");
  };

  const SUB = [
    { key: "incoming" as const, label: "Incoming", count: incoming.filter(r => r.status === "pending").length, color: "text-blue-600" },
    { key: "outgoing" as const, label: "Outgoing", count: outgoing.length, color: "text-amber-600" },
    { key: "connected" as const, label: "Connected", count: connected.length, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1.5 w-fit">
        {SUB.map(s => (
          <button key={s.key} onClick={() => setSubTab(s.key)}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5",
              subTab === s.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}>
            {s.label}
            {s.count > 0 && <span className={cn("text-xs font-extrabold", subTab === s.key ? s.color : "text-slate-400")}>{s.count}</span>}
          </button>
        ))}
      </div>

      {/* Incoming */}
      {subTab === "incoming" && (
        <div className="space-y-3">
          {incoming.length === 0 ? (
            <div className="text-center py-16 text-slate-400"><UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No pending requests</p></div>
          ) : incoming.map(req => (
            <motion.div key={req.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              {req.candidate.photo ? (
                <img src={req.candidate.photo} alt={req.candidate.name} className="w-12 h-12 rounded-xl border border-slate-200 object-cover flex-none" />
              ) : (
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-none", req.candidate.color)}>
                  {req.candidate.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{req.candidate.name}</h4>
                  {req.candidate.verified && <Shield className="h-3.5 w-3.5 text-blue-500" />}
                </div>
                <p className="text-xs text-slate-500">{req.candidate.dept} · {req.candidate.year}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{req.lookingFor}</span>
                  <span className="text-[10px] text-slate-400">{req.sentAt}</span>
                </div>
              </div>
              <CompatBar score={req.candidate.compatibility} />
              <div className="flex gap-2 flex-none">
                <button onClick={() => setProfileOpen(req.candidate)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">View</button>
                <button onClick={() => declineRequest(req.id)}
                  className="h-9 w-9 rounded-xl border-2 border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                  <X className="h-4 w-4" /></button>
                <button onClick={() => acceptRequest(req.id)}
                  className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-sm transition-colors">
                  <Check className="h-4 w-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Outgoing */}
      {subTab === "outgoing" && (
        <div className="space-y-3">
          {outgoing.length === 0 ? (
            <div className="text-center py-16 text-slate-400"><UserX className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No outgoing requests</p></div>
          ) : outgoing.map(req => (
            <motion.div key={req.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              {req.candidate.photo ? (
                <img src={req.candidate.photo} alt={req.candidate.name} className="w-12 h-12 rounded-xl border border-slate-200 object-cover flex-none" />
              ) : (
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-none", req.candidate.color)}>
                  {req.candidate.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">{req.candidate.name}</h4>
                <p className="text-xs text-slate-500">{req.candidate.dept} · {req.candidate.year}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{req.lookingFor}</span>
                  <span className="text-[10px] text-slate-400">{req.sentAt}</span>
                </div>
              </div>
              <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full flex-none",
                req.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                req.status === "passed" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600")}>
                {req.status === "pending" ? "⏳ Pending" : req.status === "accepted" ? "✓ Accepted" : "✗ Passed"}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Connected */}
      {subTab === "connected" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connected.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-slate-400"><Heart className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No connections yet — head to Discover!</p></div>
          ) : connected.map(match => (
            <motion.div key={match.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                {match.candidate.photo ? (
                  <img src={match.candidate.photo} alt={match.candidate.name} className="w-12 h-12 rounded-xl border border-slate-200 object-cover" />
                ) : (
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold", match.candidate.color)}>
                    {match.candidate.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900">{match.candidate.name}</h4>
                  <p className="text-xs text-slate-500">{match.candidate.dept}</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{match.lookingFor}</span>
              </div>
              <CompatBar score={match.candidate.compatibility} />
              <p className="text-[10px] text-slate-400">Connected {match.connectedOn}</p>

              {/* Meetup status */}
              {match.meetup && (
                <div className={cn("rounded-xl p-3",
                  match.meetup.status === "confirmed" ? "bg-emerald-50 border border-emerald-100" :
                  match.meetup.status === "pending"   ? "bg-amber-50 border border-amber-100" :
                  "bg-slate-50 border border-slate-100")}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {match.meetup.status === "confirmed" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Clock className="h-3.5 w-3.5 text-amber-500" />}
                    <span className={cn("text-xs font-bold", match.meetup.status === "confirmed" ? "text-emerald-700" : "text-amber-700")}>
                      Meetup {match.meetup.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{match.meetup.type} · {match.meetup.date} at {match.meetup.time}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{match.meetup.location}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setProfileOpen(match.candidate)}
                  className="flex-1 h-8 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  View Profile
                </button>
                {!match.meetup && (
                  <button onClick={() => setMeetupOpen(match)}
                    className="flex-1 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />Meetup
                  </button>
                )}
                <button onClick={() => unmatch(match.id)}
                  className="h-8 w-8 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors flex-none">
                  <Ban className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {profileOpen && (
          <CandidateProfileModal key="p" candidate={profileOpen}
            onConnect={() => notify(`Already connected with ${profileOpen.name}!`, "warn")}
            onPass={() => {}} onClose={() => setProfileOpen(null)} />
        )}
        {meetupOpen && (
          <MeetupForm key="mf" withName={meetupOpen.candidate.name}
            purpose={meetupOpen.lookingFor}
            college={meetupOpen.candidate.college}
            onSave={(m) => {
              setConnected(prev => prev.map(c => c.id !== meetupOpen.id ? c : { ...c, meetup: { ...m, id: `mu_${Date.now()}`, withId: meetupOpen.candidate.id, proposedBy: "me" } }));
              notify(`Meetup proposed to ${meetupOpen.candidate.name}! ☕`);
            }}
            onClose={() => setMeetupOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MEETUPS TAB
══════════════════════════════════════════════════════════ */
function MeetupsTab({ notify }: { notify: (m: string, t?: "success"|"warn") => void }) {
  const { user } = useAuth();
  const college = user?.college ?? "NIT Trichy";

  const [meetups, setMeetups] = useState<Meetup[]>([
    { id: "mu1", withName: "Riya Sharma", withId: "c1", type: "Study Session", date: "Tomorrow", time: "4:00 PM", location: "Library — Study Room A", notes: "Bring DS notes", status: "confirmed", proposedBy: "me", purpose: "Study Partner", availableDays: ["Monday","Wednesday","Friday"], preferredTimeSlot: "Afternoon (12pm–4pm)", editCount: 0 },
    { id: "mu2", withName: "Sneha Nair", withId: "c3", type: "Coffee Chat", date: "This Saturday", time: "11:00 AM", location: "Central Cafeteria", notes: "", status: "pending", proposedBy: "them", purpose: "Friendship", availableDays: ["Saturday","Sunday"], preferredTimeSlot: "Morning (8am–12pm)", editCount: 2, editRequestBy: "them", pendingDate: "Next Sunday", pendingTime: "3:00 PM", pendingLocation: "Central Garden", pendingNotes: "Saturday doesn't work for me, can we do Sunday afternoon?" },
    { id: "mu3", withName: "Arjun Patel", withId: "c2", type: "Campus Walk", date: "Next Monday", time: "5:00 PM", location: "Central Garden", notes: "Around the lake trail", status: "pending", proposedBy: "me", purpose: "Friendship", availableDays: ["Monday","Thursday","Sunday"], preferredTimeSlot: "Evening (4pm–8pm)", editCount: 1, editRequestBy: "me", pendingDate: "Next Monday", pendingTime: "6:00 PM", pendingLocation: "Central Garden", pendingNotes: "Can we push it an hour later?" },
  ]);

  const [editFormOpen, setEditFormOpen] = useState<Meetup | null>(null);

  const MAX_EDITS = 3;

  const accept = (id: string) => {
    setMeetups(p => p.map(m => m.id === id ? { ...m, status: "confirmed", editRequestBy: undefined } : m));
    notify("Meetup confirmed! 🎉");
  };
  const decline = (id: string) => {
    setMeetups(p => p.map(m => m.id === id ? { ...m, status: "cancelled" } : m));
    notify("Meetup declined.", "warn");
  };
  const complete = (id: string) => {
    setMeetups(p => p.map(m => m.id === id ? { ...m, status: "completed" } : m));
    notify("Marked as completed! ⭐");
  };

  // Request an edit with a specific new schedule
  const requestEdit = (id: string, pendingDate: string, pendingTime: string, pendingLocation: string, pendingNotes: string) => {
    setMeetups(p => p.map(m => {
      if (m.id !== id) return m;
      const next = m.editCount + 1;
      if (next > MAX_EDITS) {
        notify(`Edit limit reached — meetup with ${m.withName} auto-declined.`, "warn");
        return { ...m, status: "cancelled", editCount: next };
      }
      if (next === MAX_EDITS) {
        notify(`⚠️ Last allowed edit sent to ${m.withName}. If declined again, meetup will be cancelled.`, "warn");
      } else {
        notify(`Edit request sent to ${m.withName}. (${next}/${MAX_EDITS} edits used)`);
      }
      return { ...m, editCount: next, editRequestBy: "me", status: "pending", pendingDate, pendingTime, pendingLocation, pendingNotes };
    }));
  };

  // Respond to an edit request from them — accept applies their pending values
  const acceptEdit = (id: string) => {
    setMeetups(p => p.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        status: "confirmed",
        editRequestBy: undefined,
        date: m.pendingDate ?? m.date,
        time: m.pendingTime ?? m.time,
        location: m.pendingLocation ?? m.location,
        notes: m.pendingNotes ?? m.notes,
        pendingDate: undefined, pendingTime: undefined, pendingLocation: undefined, pendingNotes: undefined,
      };
    }));
    notify("Edit accepted — schedule updated! ✅");
  };
  const declineEdit = (id: string) => {
    setMeetups(p => p.map(m => {
      if (m.id !== id) return m;
      const next = m.editCount + 1;
      if (next > MAX_EDITS) {
        notify(`Max edits exceeded — meetup with ${m.withName} cancelled.`, "warn");
        return { ...m, status: "cancelled", editCount: next, pendingDate: undefined, pendingTime: undefined, pendingLocation: undefined, pendingNotes: undefined };
      }
      notify(`Edit declined. ${m.withName} has ${MAX_EDITS - next} edit request(s) remaining.`, "warn");
      return { ...m, editCount: next, editRequestBy: undefined, status: "pending", pendingDate: undefined, pendingTime: undefined, pendingLocation: undefined, pendingNotes: undefined };
    }));
  };

  const STATUS_STYLE: Record<MeetupStatus, string> = {
    pending:   "bg-amber-50 border-amber-200",
    confirmed: "bg-emerald-50 border-emerald-200",
    completed: "bg-slate-100 border-slate-200",
    cancelled: "bg-red-50 border-red-200",
  };
  const STATUS_LABEL_STYLE: Record<MeetupStatus, string> = {
    pending: "text-amber-700", confirmed: "text-emerald-700", completed: "text-slate-500", cancelled: "text-red-600",
  };
  const STATUS_ICON: Record<MeetupStatus, React.FC<{ className?: string }>> = {
    pending: Clock, confirmed: CheckCircle2, completed: Star, cancelled: X,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">My Meetups</h2>
        <div className="flex gap-2 text-xs flex-wrap justify-end">
          {(["pending","confirmed","completed","cancelled"] as MeetupStatus[]).map(s => {
            const cnt = meetups.filter(m => m.status === s).length;
            return cnt > 0 ? (
              <span key={s} className={cn("px-2.5 py-1 rounded-full border font-bold capitalize", STATUS_STYLE[s], STATUS_LABEL_STYLE[s])}>
                {cnt} {s}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {meetups.map(m => {
        const Icon = MEETUP_ICONS[m.type];
        const SIcon = STATUS_ICON[m.status];
        const editsLeft = MAX_EDITS - m.editCount;
        const editLimitReached = m.editCount >= MAX_EDITS;
        const hasIncomingEdit = m.editRequestBy === "them" && m.status === "pending";
        const hasSentEdit = m.editRequestBy === "me" && m.status === "pending";

        return (
          <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={cn("bg-white rounded-2xl border-2 shadow-sm overflow-hidden", STATUS_STYLE[m.status])}>

            {/* Edit limit warning banner */}
            {editLimitReached && m.status !== "cancelled" && (
              <div className="bg-red-100 border-b border-red-200 px-4 py-2 flex items-center gap-2">
                <Ban className="h-3.5 w-3.5 text-red-600 flex-none" />
                <p className="text-xs font-bold text-red-700">Edit limit reached — no more changes allowed. Accept or decline as-is.</p>
              </div>
            )}
            {!editLimitReached && m.editCount > 0 && (
              <div className={cn("border-b px-4 py-2 flex items-center gap-2",
                editsLeft === 1 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-100")}>
                <Pencil className={cn("h-3 w-3 flex-none", editsLeft === 1 ? "text-red-500" : "text-amber-500")} />
                <p className={cn("text-xs font-semibold", editsLeft === 1 ? "text-red-600" : "text-amber-700")}>
                  {m.editCount}/{MAX_EDITS} edits used — {editsLeft} remaining.
                  {editsLeft === 1 && " ⚠️ Next edit will be the last!"}
                </p>
              </div>
            )}

            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm flex-none">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{m.type} <span className="text-slate-500 font-normal">with</span> {m.withName}</h4>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.location}</span>
                    </p>
                  </div>
                </div>
                <span className={cn("flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border flex-none", STATUS_STYLE[m.status], STATUS_LABEL_STYLE[m.status])}>
                  <SIcon className="h-3 w-3" />
                  {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                </span>
              </div>

              {m.notes && <p className="text-xs text-slate-600 bg-white/70 px-3 py-2 rounded-xl border border-slate-100">📝 {m.notes}</p>}

              {/* Incoming edit request from them — shows what they proposed */}
              {hasIncomingEdit && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 space-y-2">
                  <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                    <Pencil className="h-3 w-3" /> {m.withName} wants to reschedule
                    <span className="ml-auto text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">{m.editCount}/{MAX_EDITS} edits</span>
                  </p>

                  {/* Show what they're proposing */}
                  {(m.pendingDate || m.pendingTime || m.pendingLocation) && (
                    <div className="bg-white/80 rounded-lg px-3 py-2 border border-blue-100 space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Proposed changes</p>
                      {(m.pendingDate !== m.date || m.pendingTime !== m.time) && (
                        <p className="text-xs text-slate-700 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-blue-400" />
                          <span className="line-through text-slate-400">{m.date} at {m.time}</span>
                          <span className="font-semibold text-blue-700">→ {m.pendingDate} at {m.pendingTime}</span>
                        </p>
                      )}
                      {m.pendingLocation && m.pendingLocation !== m.location && (
                        <p className="text-xs text-slate-700 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-blue-400" />
                          <span className="line-through text-slate-400">{m.location}</span>
                          <span className="font-semibold text-blue-700">→ {m.pendingLocation}</span>
                        </p>
                      )}
                      {m.pendingNotes && (
                        <p className="text-xs text-slate-500 italic">"{m.pendingNotes}"</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 bg-blue-600 hover:bg-blue-700 text-xs font-bold" onClick={() => acceptEdit(m.id)}>
                      <Check className="h-3 w-3 mr-1" /> Accept Changes
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs" onClick={() => declineEdit(m.id)}>
                      <X className="h-3 w-3 mr-1" /> Decline Edit
                    </Button>
                  </div>
                </div>
              )}

              {/* New proposal from them (not an edit) */}
              {m.proposedBy === "them" && m.status === "pending" && !hasIncomingEdit && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs" onClick={() => accept(m.id)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50 text-xs" onClick={() => decline(m.id)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Decline
                  </Button>
                </div>
              )}

              {/* Waiting for them — show what you proposed */}
              {hasSentEdit && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 space-y-1.5">
                  <p className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Edit request sent — waiting for {m.withName}…
                    <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{m.editCount}/{MAX_EDITS}</span>
                  </p>
                  {(m.pendingDate || m.pendingTime || m.pendingLocation) && (
                    <div className="bg-white rounded-lg px-3 py-2 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your proposed change</p>
                      {(m.pendingDate !== m.date || m.pendingTime !== m.time) && (
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="line-through text-slate-400">{m.date} at {m.time}</span>
                          <span className="font-semibold text-slate-700">→ {m.pendingDate} at {m.pendingTime}</span>
                        </p>
                      )}
                      {m.pendingLocation && m.pendingLocation !== m.location && (
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span className="line-through text-slate-400">{m.location}</span>
                          <span className="font-semibold text-slate-700">→ {m.pendingLocation}</span>
                        </p>
                      )}
                      {m.pendingNotes && (
                        <p className="text-xs text-slate-500 italic">"{m.pendingNotes}"</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {m.proposedBy === "me" && m.status === "pending" && !hasSentEdit && (
                <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Waiting for {m.withName} to respond…
                </p>
              )}

              {/* Confirmed actions */}
              {m.status === "confirmed" && (
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="h-9 border-slate-200 text-slate-600 text-xs font-bold" onClick={() => complete(m.id)}>
                    <Star className="h-3.5 w-3.5 mr-1" /> Mark Completed
                  </Button>
                  {!editLimitReached && (
                    <Button size="sm" variant="outline"
                      className={cn("h-9 text-xs font-bold", editsLeft === 1
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-blue-200 text-blue-600 hover:bg-blue-50")}
                      onClick={() => setEditFormOpen(m)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Request Edit {m.editCount > 0 ? `(${editsLeft} left)` : ""}
                    </Button>
                  )}
                  {editLimitReached && (
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 px-2">
                      <Ban className="h-3 w-3" /> No more edits allowed
                    </span>
                  )}
                </div>
              )}

              {m.status === "cancelled" && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                  <Ban className="h-3 w-3" />
                  {m.editCount >= MAX_EDITS ? "Auto-cancelled: edit limit (3/3) reached." : "This meetup was declined."}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Edit Request Form modal */}
      <AnimatePresence>
        {editFormOpen && (
          <EditRequestForm
            key="ef"
            meetup={editFormOpen}
            college={college}
            onSave={(pendingDate, pendingTime, pendingLocation, pendingNotes) =>
              requestEdit(editFormOpen.id, pendingDate, pendingTime, pendingLocation, pendingNotes)
            }
            onClose={() => setEditFormOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MY PROFILE TAB
══════════════════════════════════════════════════════════ */
const SAVED_KEY = "cc_match_profile";
const GENDERS: Gender[] = ["Male", "Female", "Non-binary", "Prefer not to say"];
const PERSONALITIES: Personality[] = ["Introvert", "Extrovert", "Ambivert"];
const STUDY_STYLES: StudyStyle[] = ["Solo", "Group", "Either"];
const TIME_TYPES: TimeType[] = ["Early Bird", "Night Owl", "Flexible"];
const LOOKING_FOR_OPTS: LookingFor[] = ["Friendship", "Study Partner", "Relationship"];
const VISIBILITY_OPTS: { key: Visibility; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "own-college", label: "Own College", icon: GraduationCap },
  { key: "all-colleges", label: "All Colleges", icon: Globe },
  { key: "hidden", label: "Hidden", icon: EyeOff },
];

function defaultProfile(user: ReturnType<typeof useAuth>["user"]): MatchProfile {
  return {
    name: user?.name ?? "", dob: "", gender: "Prefer not to say",
    college: user?.college ?? "NIT Trichy", zodiac: "—", age: 0,
    interests: [], hobbies: [], sports: [], music: [], movies: [], gaming: [], reading: [], tech: [],
    personality: "Ambivert", timeType: "Flexible", studyStyle: "Either", socialLevel: 3,
    lookingFor: ["Friendship"], ageMin: 18, ageMax: 26,
    prefGender: "Any", prefCollege: "own",
    prefPersonality: "Either", prefStudyStyle: "Either",
    prefInterests: [], visibility: "own-college",
    bio: "", photos: [],
  };
}

function MyProfileTab({ notify }: { notify: (m: string, t?: "success"|"warn") => void }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MatchProfile>(() => {
    try { const s = localStorage.getItem(SAVED_KEY); return s ? JSON.parse(s) : defaultProfile(user); } catch { return defaultProfile(user); }
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const slots = 2 - (profile.photos?.length ?? 0);
    const toAdd = files.slice(0, slots);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(p => {
          const current = p.photos ?? [];
          if (current.length >= 2) return p;
          return { ...p, photos: [...current, reader.result as string] };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
    if (files.length > slots && slots === 0) notify("Maximum 2 photos allowed.", "warn");
  };

  const removePhoto = (idx: number) =>
    setProfile(p => ({ ...p, photos: (p.photos ?? []).filter((_, i) => i !== idx) }));

  useEffect(() => {
    if (profile.dob) {
      setProfile(p => ({ ...p, zodiac: getZodiac(p.dob), age: calcAge(p.dob) }));
    }
  }, [profile.dob]);

  const set = (k: keyof MatchProfile, v: unknown) => setProfile(p => ({ ...p, [k]: v }));
  const toggleArr = (k: keyof MatchProfile, v: string) => {
    const arr = profile[k] as string[];
    set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  const save = () => {
    if ((profile.photos ?? []).length < 1) {
      notify("Please add at least 1 photo before saving.", "warn");
      return;
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(profile));
    // Dispatch a storage event so the Discover tab reloads scores in this window
    window.dispatchEvent(new StorageEvent("storage", { key: SAVED_KEY }));
    setSaved(true);
    notify("Profile saved! Scores updated in Discover ✨");
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.FC<{ className?: string }>; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Icon className="h-4 w-4 text-blue-500" />{title}</h3>
      {children}
    </div>
  );
  const ToggleGroup = ({ label, opts, field }: { label: string; opts: string[]; field: keyof MatchProfile }) => (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {opts.map(o => <TagChip key={o} label={o} active={(profile[field] as string[]).includes(o)} onClick={() => toggleArr(field, o)} />)}
      </div>
    </div>
  );
  const Radio = <T extends string>({ label, opts, field }: { label: string; opts: T[]; field: keyof MatchProfile }) => (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {opts.map(o => (
          <button key={o} onClick={() => set(field, o)}
            className={cn("text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all",
              profile[field] === o ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      {/* Photos */}
      <Section title="My Photos" icon={Camera}>
        <p className="text-xs text-slate-500 -mt-2">Upload at least <strong>1</strong> photo, up to <strong>2</strong>. These show on your match card.</p>

        {/* Preview row */}
        <div className="flex gap-3">
          {(profile.photos ?? []).map((src, idx) => (
            <div key={idx} className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm group">
              <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {idx === 0 ? "Main" : "2nd"}
              </div>
            </div>
          ))}

          {/* Upload slot — shown when fewer than 2 photos */}
          {(profile.photos ?? []).length < 2 && (
            <button onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-400 hover:text-blue-500">
              <Camera className="h-7 w-7" />
              <span className="text-xs font-semibold">
                {(profile.photos ?? []).length === 0 ? "Add photo" : "Add 2nd"}
              </span>
            </button>
          )}
        </div>

        {/* Hint when no photos */}
        {(profile.photos ?? []).length === 0 && (
          <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
            <span>⚠️</span> At least 1 photo is required before saving.
          </p>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
      </Section>

      {/* Basic info */}
      <Section title="Basic Info (Auto-filled from account)" icon={User}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</p>
            <Input value={profile.name} readOnly className="bg-slate-50 h-10 font-semibold" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">College</p>
            <Input value={profile.college} readOnly className="bg-slate-50 h-10" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</p>
            <Input type="date" value={profile.dob} onChange={e => set("dob", e.target.value)} className="h-10 bg-slate-50" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age</p>
              <div className="h-10 bg-slate-100 rounded-lg flex items-center px-3 text-sm font-bold text-slate-700">
                {profile.age > 0 ? `${profile.age} yrs` : "—"}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Zodiac</p>
              <div className="h-10 bg-slate-100 rounded-lg flex items-center px-3 text-sm font-bold text-slate-700">{profile.zodiac}</div>
            </div>
          </div>
        </div>
        <Radio label="Gender" opts={GENDERS} field="gender" />
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio <span className="font-normal normal-case text-slate-400">(shown on your card)</span></p>
          <textarea rows={3} value={profile.bio} onChange={e => set("bio", e.target.value)}
            placeholder="Tell people what makes you interesting to connect with…"
            className="w-full rounded-xl border border-input bg-slate-50 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </Section>

      {/* Interests & Activities */}
      <Section title="My Interests & Activities" icon={Sparkles}>
        <ToggleGroup label="Interests / Skills" opts={INTEREST_OPTS} field="interests" />
        <ToggleGroup label="Hobbies" opts={HOBBY_OPTS} field="hobbies" />
        <ToggleGroup label="Sports" opts={SPORT_OPTS} field="sports" />
        <ToggleGroup label="Music" opts={MUSIC_OPTS} field="music" />
        <ToggleGroup label="Movies / Shows (genres)" opts={MOVIE_OPTS} field="movies" />
        <ToggleGroup label="Gaming" opts={GAME_OPTS} field="gaming" />
        <ToggleGroup label="Tech I love" opts={TECH_OPTS} field="tech" />
      </Section>

      {/* Personality */}
      <Section title="My Personality" icon={Brain}>
        <Radio label="I am mostly…" opts={PERSONALITIES} field="personality" />
        <Radio label="I am a…" opts={TIME_TYPES} field="timeType" />
        <Radio label="Study Style" opts={STUDY_STYLES} field="studyStyle" />
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Social Activity Level</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Homebody</span>
            <div className="flex gap-2 flex-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => set("socialLevel", n)}
                  className={cn("flex-1 h-8 rounded-xl border-2 text-xs font-bold transition-all",
                    profile.socialLevel >= n ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400")}>
                  {n}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">Social butterfly</span>
          </div>
        </div>
      </Section>

      {/* Looking For */}
      <Section title="I'm Looking For" icon={Heart}>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connection Type</p>
          <div className="flex gap-2 flex-wrap">
            {LOOKING_FOR_OPTS.map(o => (
              <button key={o} onClick={() => toggleArr("lookingFor", o)}
                className={cn("text-sm font-bold px-4 py-2.5 rounded-xl border-2 transition-all",
                  profile.lookingFor.includes(o) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
                {o === "Friendship" ? "🤝" : o === "Study Partner" ? "📚" : "💞"} {o}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Age</p>
            <div className="flex items-center gap-2">
              <button onClick={() => set("ageMin", Math.max(17, profile.ageMin - 1))} className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button>
              <span className="flex-1 text-center font-bold text-slate-900">{profile.ageMin}</span>
              <button onClick={() => set("ageMin", Math.min(profile.ageMax, profile.ageMin + 1))} className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Age</p>
            <div className="flex items-center gap-2">
              <button onClick={() => set("ageMax", Math.max(profile.ageMin, profile.ageMax - 1))} className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button>
              <span className="flex-1 text-center font-bold text-slate-900">{profile.ageMax}</span>
              <button onClick={() => set("ageMax", Math.min(40, profile.ageMax + 1))} className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
        <Radio label="Preferred Gender" opts={["Male","Female","Non-binary","Any"]} field="prefGender" />
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred College</p>
          <div className="flex gap-2">
            {[{ key: "own" as const, label: "Own College Only" }, { key: "all" as const, label: "All Colleges" }].map(o => (
              <button key={o.key} onClick={() => set("prefCollege", o.key)}
                className={cn("flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                  profile.prefCollege === o.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200")}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <Radio label="Preferred Personality" opts={[...PERSONALITIES, "Either"]} field="prefPersonality" />
        <Radio label="Preferred Study Style" opts={STUDY_STYLES} field="prefStudyStyle" />
        <ToggleGroup label="Preferred Interests (optional)" opts={INTEREST_OPTS.slice(0, 10)} field="prefInterests" />
      </Section>

      {/* Visibility */}
      <Section title="Visibility" icon={Eye}>
        <p className="text-xs text-slate-500 -mt-2">Control who sees your profile in Discover.</p>
        <div className="grid grid-cols-3 gap-3">
          {VISIBILITY_OPTS.map(({ key, label, icon: VIcon }) => (
            <button key={key} onClick={() => set("visibility", key)}
              className={cn("flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all",
                profile.visibility === key ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300")}>
              <VIcon className={cn("h-6 w-6", profile.visibility === key ? "text-blue-600" : "text-slate-400")} />
              <span className={cn("text-xs font-bold", profile.visibility === key ? "text-blue-700" : "text-slate-600")}>{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Save */}
      <Button className={cn("w-full h-12 font-extrabold text-base transition-all", saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700")} onClick={save}>
        {saved ? <><CheckCircle2 className="h-5 w-5 mr-2" />Saved!</> : <><Save className="h-5 w-5 mr-2" />Save Match Profile</>}
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════ */
export default function MatchPage() {
  const [toast, setToast] = useState<{ msg: string; type: "success"|"warn" } | null>(null);
  const [outgoing, setOutgoing] = useState<MatchRequest[]>(SEED_OUTGOING);

  const notify = (msg: string, type: "success"|"warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = (c: Candidate, lf: LookingFor) => {
    setOutgoing(prev => [...prev, { id: `or_${Date.now()}`, candidate: c, lookingFor: lf, sentAt: "Just now", status: "pending" }]);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <AnimatePresence>{toast && <Toast key="toast" msg={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 h-14 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Campus Match</h1>
        <Badge className="bg-pink-100 text-pink-700 border-none text-[10px] font-bold">BETA</Badge>
        <div className="ml-auto text-xs text-slate-400 flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" /> Verified students only · Safe campus meetups
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-xl mb-7 w-full grid grid-cols-4">
            {[
              { value: "discover", label: "Discover", icon: Sparkles },
              { value: "matches",  label: "My Matches", icon: Heart },
              { value: "meetups",  label: "Meetups", icon: Calendar },
              { value: "profile",  label: "My Profile", icon: User },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}
                className="py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold text-slate-600 flex items-center gap-1.5">
                <Icon className="h-4 w-4" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="discover">
            <DiscoverTab onConnect={handleConnect} notify={notify} />
          </TabsContent>
          <TabsContent value="matches">
            <MyMatchesTab notify={notify} />
          </TabsContent>
          <TabsContent value="meetups">
            <MeetupsTab notify={notify} />
          </TabsContent>
          <TabsContent value="profile">
            <MyProfileTab notify={notify} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
