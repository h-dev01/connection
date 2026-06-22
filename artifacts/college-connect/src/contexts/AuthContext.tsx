/**
 * AuthContext — role-based auth + student OTP signup for CollegeConnect.
 *
 * Student flow:  signupWithEmail(email) → verifyOtp(email, otp) → logged in
 *                After first login: profileComplete=false → triggers ProfileCompleteModal
 *
 * Admin/Mod flow: login(email, password, role)  (unchanged)
 *
 * Storage: localStorage ("cc_user") — replace with server session when backend is ready.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "student" | "low_admin" | "admin";

export interface StudentProfile {
  college?: string;
  branch?: string;
  year?: string;
  phone?: string;
  bio?: string;
}

export interface AuthUser extends StudentProfile {
  name: string;
  email: string;
  role: UserRole;
  badge: string;
  initials: string;
  profileComplete: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  /** Student OTP signup — step 1: send OTP (returns the demo OTP for display) */
  signupWithEmail: (email: string) => Promise<{ ok: boolean; otp?: string; error?: string }>;
  /** Student OTP signup — step 2: verify OTP and log in */
  verifyOtp: (email: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  /** Save profile details after first login */
  completeProfile: (data: StudentProfile & { name: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "cc_user";
const OTP_STORAGE_KEY = "cc_otp_pending";

/** In-memory fallback when localStorage is blocked (e.g. inside iframes) */
let _memoryStore: string | null = null;
let _otpMemory: string | null = null;
const safeStorage = {
  get(): string | null {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return _memoryStore; }
  },
  set(val: string) {
    try { localStorage.setItem(STORAGE_KEY, val); } catch { _memoryStore = val; }
  },
  remove() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { _memoryStore = null; }
  },
  getOtp(): string | null {
    try { return localStorage.getItem(OTP_STORAGE_KEY); } catch { return _otpMemory; }
  },
  setOtp(val: string) {
    try { localStorage.setItem(OTP_STORAGE_KEY, val); } catch { _otpMemory = val; }
  },
  removeOtp() {
    try { localStorage.removeItem(OTP_STORAGE_KEY); } catch { _otpMemory = null; }
  },
};

/** Demo credentials for admin / moderator (unchanged) */
const DEMO_STAFF: Record<"low_admin" | "admin", AuthUser & { password: string }> = {
  low_admin: {
    name: "Priya Nair",
    email: "lowadmin@college.edu",
    password: "lowadmin123",
    role: "low_admin",
    badge: "Moderator",
    initials: "PN",
    profileComplete: true,
  },
  admin: {
    name: "Dr. Rajan Mehta",
    email: "admin@college.edu",
    password: "admin123",
    role: "admin",
    badge: "System Admin",
    initials: "RM",
    profileComplete: true,
  },
};

/** The demo student account (pre-filled profile) */
const DEMO_STUDENT: AuthUser = {
  name: "Alex Rivera",
  email: "student@college.edu",
  role: "student",
  badge: "Gold Contributor",
  initials: "AR",
  profileComplete: true,
  college: "National Institute of Technology",
  branch: "Computer Science & Engineering",
  year: "3rd Year",
  phone: "+91 98765 43210",
  bio: "Passionate about open source and machine learning. Building cool stuff one commit at a time.",
};

/** Derive a display name from an email address */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0];
  return local
    .replace(/[._-]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .trim() || "Student";
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => ({ ok: false }),
  signupWithEmail: async () => ({ ok: false }),
  verifyOtp: async () => ({ ok: false }),
  completeProfile: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = safeStorage.get();
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      safeStorage.set(JSON.stringify(user));
    } else {
      safeStorage.remove();
    }
  }, [user]);

  /** Admin / Mod password login (unchanged) */
  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ ok: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    if (role === "student") {
      return { ok: false, error: "Students use the email + OTP flow." };
    }
    const demo = DEMO_STAFF[role as "low_admin" | "admin"];
    if (email.trim() === demo.email && password === demo.password) {
      const { password: _p, ...authUser } = demo;
      setUser(authUser);
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password for this role." };
  };

  /** Step 1 — generate & "send" OTP for student signup */
  const signupWithEmail = async (
    email: string
  ): Promise<{ ok: boolean; otp?: string; error?: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    if (!email.includes("@") || !email.includes(".")) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    safeStorage.setOtp(JSON.stringify({ email: email.trim().toLowerCase(), otp }));
    return { ok: true, otp };
  };

  /** Step 2 — verify OTP and log in student */
  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ ok: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    const raw = safeStorage.getOtp();
    if (!raw) return { ok: false, error: "OTP expired. Please request a new one." };
    const pending = JSON.parse(raw) as { email: string; otp: string };
    if (pending.email !== email.trim().toLowerCase()) {
      return { ok: false, error: "Email mismatch. Please restart the process." };
    }
    if (pending.otp !== otp.trim()) {
      return { ok: false, error: "Incorrect OTP. Please try again." };
    }
    safeStorage.removeOtp();

    // Returning demo student for the demo email
    if (email.trim().toLowerCase() === "student@college.edu") {
      setUser(DEMO_STUDENT);
    } else {
      const name = nameFromEmail(email);
      const newStudent: AuthUser = {
        name,
        email: email.trim().toLowerCase(),
        role: "student",
        badge: "New Student",
        initials: initialsFromName(name),
        profileComplete: false,
      };
      setUser(newStudent);
    }
    return { ok: true };
  };

  /** Save profile details; called from ProfileCompleteModal */
  const completeProfile = (data: StudentProfile & { name: string }) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = {
        ...prev,
        ...data,
        initials: initialsFromName(data.name),
        profileComplete: true,
        badge: "Verified Student",
      };
      return updated;
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signupWithEmail, verifyOtp, completeProfile, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
