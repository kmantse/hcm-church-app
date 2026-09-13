export type Role = "ADMIN" | "PASTOR" | "STAFF" | "VIEWER";

export const ROLES: Role[] = ["ADMIN", "PASTOR", "STAFF", "VIEWER"];

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 4,
  PASTOR: 3,
  STAFF: 2,
  VIEWER: 1,
};

export function hasRole(userRole: string, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole as Role] ?? 0) >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  PASTOR: "Pastor",
  STAFF: "Staff",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Full access including user management",
  PASTOR: "Full access to all ministry modules",
  STAFF: "Check-in, follow-ups, view members & visitors",
  VIEWER: "Dashboard and reports read-only",
};

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700",
  PASTOR: "bg-purple-100 text-purple-700",
  STAFF: "bg-blue-100 text-blue-700",
  VIEWER: "bg-slate-100 text-slate-600",
};

// Which roles can see each nav route
export const NAV_ROLES: Record<string, Role[]> = {
  "/dashboard": ["ADMIN", "PASTOR", "STAFF", "VIEWER"],
  "/members": ["ADMIN", "PASTOR", "STAFF"],
  "/visitors": ["ADMIN", "PASTOR", "STAFF"],
  "/checkin": ["ADMIN", "PASTOR", "STAFF"],
  "/programmes": ["ADMIN", "PASTOR"],
  "/registrations": ["ADMIN", "PASTOR"],
  "/followups": ["ADMIN", "PASTOR", "STAFF"],
  "/reports": ["ADMIN", "PASTOR", "VIEWER"],
  "/users": ["ADMIN"],
};

export function canAccessRoute(userRole: string, route: string): boolean {
  const allowed = NAV_ROLES[route];
  if (!allowed) return hasRole(userRole, "VIEWER");
  return allowed.includes(userRole as Role);
}
