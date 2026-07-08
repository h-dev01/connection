/**
 * AuthContext — role-based auth for CollegeConnect.
 *
 * Student sign-up (3 steps):
 *   initiateSignup(data) → verifySignupOtp(email, otp) → logged in
 *
 * Student sign-in (2 steps):
 *   signinWithPassword(email, password) → verifySigninOtp(email, otp) → logged in
 *
 * Admin/Mod: login(email, password, role) — unchanged demo credentials
 *
 * Storage: localStorage ("cc_user") — no server session needed for this scope.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "student" | "low_admin" | "admin";

export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  badge: string;
  initials: string;
  profileComplete: boolean;
  college?: string;
  branch?: string;
  courseName?: string;
  passInYear?: number;
  passOutYear?: number;
  year?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  reputationScore?: number;
  reputationLevel?: string;
  verified?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  college: string;
  courseName: string;
  passInYear: number;
  passOutYear: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** Admin / Mod demo login */
  login: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  /** Student sign-in step 1 — verify email+password, get OTP */
  signinWithPassword: (email: string, password: string) => Promise<{ ok: boolean; demoOtp?: string; error?: string }>;
  /** Student sign-in step 2 — verify OTP and log in */
  verifySigninOtp: (email: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  /** Student sign-up step 1+2 — submit all data, get OTP */
  initiateSignup: (data: SignupData) => Promise<{ ok: boolean; demoOtp?: string; error?: string }>;
  /** Student sign-up step 3 — verify OTP and create account */
  verifySignupOtp: (email: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  /** Save profile details (called from ProfileCompleteModal) */
  completeProfile: (data: { name: string; college?: string; branch?: string; year?: string; phone?: string; bio?: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "cc_user";
let _memoryStore: string | null = null;
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
};

/** Demo staff credentials (client-side only — admin/mod don't hit the DB) */
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

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function apiUserToAuthUser(u: Record<string, unknown>): AuthUser {
  const name = String(u.name ?? "Student");
  return {
    id: u.id as number | undefined,
    name,
    email: String(u.email ?? ""),
    role: (u.role as UserRole) ?? "student",
    badge: u.verified ? "Verified Student" : "Student",
    initials: initialsFromName(name),
    profileComplete: !!(u.college && u.courseName),
    college: u.college as string | undefined,
    branch: (u.courseName ?? u.department) as string | undefined,
    courseName: u.courseName as string | undefined,
    passInYear: u.passInYear as number | undefined,
    passOutYear: u.passOutYear as number | undefined,
    bio: u.bio as string | undefined,
    avatarUrl: u.avatarUrl as string | undefined,
    reputationScore: u.reputationScore as number | undefined,
    reputationLevel: u.reputationLevel as string | undefined,
    verified: u.verified as boolean | undefined,
  };
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => ({ ok: false }),
  signinWithPassword: async () => ({ ok: false }),
  verifySigninOtp: async () => ({ ok: false }),
  initiateSignup: async () => ({ ok: false }),
  verifySignupOtp: async () => ({ ok: false }),
  completeProfile: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = safeStorage.get();
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) safeStorage.set(JSON.stringify(user));
    else safeStorage.remove();
  }, [user]);

  /** Admin / Mod demo login (client-side, no DB) */
  const login = async (email: string, password: string, role: UserRole): Promise<{ ok: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    if (role === "student") return { ok: false, error: "Students use email + password." };
    const demo = DEMO_STAFF[role as "low_admin" | "admin"];
    if (email.trim() === demo.email && password === demo.password) {
      const { password: _p, ...authUser } = demo;
      setUser(authUser);
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials." };
  };

  /** Student sign-in step 1 */
  const signinWithPassword = async (email: string, password: string): Promise<{ ok: boolean; demoOtp?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Invalid credentials" };
      return { ok: true, demoOtp: data.demoOtp };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  };

  /** Student sign-in step 2 */
  const verifySigninOtp = async (email: string, otp: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Verification failed" };
      setUser(apiUserToAuthUser(data));
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  };

  /** Student sign-up step 1+2 — collect data, send OTP */
  const initiateSignup = async (signupData: SignupData): Promise<{ ok: boolean; demoOtp?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signup/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Signup failed" };
      return { ok: true, demoOtp: data.demoOtp };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  };

  /** Student sign-up step 3 — verify OTP, create account */
  const verifySignupOtp = async (email: string, otp: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Verification failed" };
      setUser(apiUserToAuthUser(data));
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  };

  const completeProfile = (data: { name: string; college?: string; branch?: string; year?: string; phone?: string; bio?: string }) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...data,
        initials: initialsFromName(data.name),
        profileComplete: true,
        badge: "Verified Student",
      };
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user, login, signinWithPassword, verifySigninOtp, initiateSignup, verifySignupOtp,
      completeProfile, logout, isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
