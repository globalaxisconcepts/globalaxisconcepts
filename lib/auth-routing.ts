import { SUPER_ADMIN_EMAILS } from "./constants";
import type { UserProfile } from "./firebase/db";

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
