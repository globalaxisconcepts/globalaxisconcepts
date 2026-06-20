import { SUPER_ADMIN_EMAILS } from "./constants";
import type { UserProfile } from "./firebase/db";

/**
 * Only allow same-origin, in-app redirect targets (e.g. "/dashboard"). Rejects
 * absolute URLs, protocol-relative ("//evil.com") and backslash ("/\evil.com")
 * tricks so a crafted ?redirect= can't bounce users off-site (open redirect).
 */
export function safeInternalPath(target: string | null | undefined): string | null {
  if (!target) return null;
  if (!target.startsWith("/")) return null;
  if (target.startsWith("//") || target.startsWith("/\\")) return null;
  return target;
}

/**
 * Where a signed-in user belongs after auth, by role:
 * super-admin → /admin, business-owner → /dashboard, staff → /staff,
 * everyone else (customers / not-yet-registered) → /account.
 */
export function homePathForUser(
  profile: UserProfile | null,
  email: string | null,
): string {
  if (email && SUPER_ADMIN_EMAILS.includes(email)) return "/admin";
  if (profile?.role === "staff") return "/staff";
  if (profile?.role === "business-owner") return "/dashboard";
  return "/account";
}
