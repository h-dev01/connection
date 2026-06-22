import type { UserRole } from "@/contexts/AuthContext";

/** Returns the default landing route for each role after login */
export const homeRouteForRole = (role: UserRole): string => {
  if (role === "admin") return "/admin";
  if (role === "low_admin") return "/moderator";
  return "/dashboard";
};
