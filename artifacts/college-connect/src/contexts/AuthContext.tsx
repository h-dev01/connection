/**
 * AuthContext — role-based auth state for CollegeConnect.
 *
 * Roles:
 *   "student"   → full campus app access (/dashboard, /study, etc.)
 *   "low_admin" → moderator tools + student pages (/moderator, /dashboard, etc.)
 *   "admin"     → everything including /admin global health dashboard
 *
 * Storage: localStorage ("cc_user") — replace with server session when backend auth is ready.
 * To add real auth: swap login() to POST /api/auth/login and read the JWT/cookie back.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "student" | "low_admin" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  /** Reputation badge label shown in sidebar */
  badge: string;
  /** Initials for avatar */
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "cc_user";

/** Demo credentials per role — remove when real auth is wired */
const DEMO_USERS: Record<UserRole, AuthUser & { password: string }> = {
  student: {
    name: "Alex Rivera",
    email: "student@college.edu",
    password: "student123",
    role: "student",
    badge: "Gold Contributor",
    initials: "AR",
  },
  low_admin: {
    name: "Priya Nair",
    email: "lowadmin@college.edu",
    password: "lowadmin123",
    role: "low_admin",
    badge: "Moderator",
    initials: "PN",
  },
  admin: {
    name: "Dr. Rajan Mehta",
    email: "admin@college.edu",
    password: "admin123",
    role: "admin",
    badge: "System Admin",
    initials: "RM",
  },
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => ({ ok: false }),
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /**
   * login — validates against demo credentials.
   * Replace body with: const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({email,password,role}) });
   */
  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ ok: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 600)); // simulate network

    const demo = DEMO_USERS[role];
    if (email.trim() === demo.email && password === demo.password) {
      const { password: _p, ...authUser } = demo;
      setUser(authUser);
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password for this role." };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Returns the default landing route for each role after login */
export function homeRouteForRole(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "low_admin") return "/moderator";
  return "/dashboard";
}
