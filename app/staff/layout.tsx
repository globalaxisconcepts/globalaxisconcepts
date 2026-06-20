"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2, CalendarClock, Ticket } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ToastProvider } from "@/components/ui/toast";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { useAuth } from "@/components/auth/auth-provider";
import { signOutUser } from "@/lib/firebase/auth";
import { homePathForUser } from "@/lib/auth-routing";
import { listStaffNotifications } from "@/lib/firebase/notifications";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // The claim page lives under /staff but is reachable before you're a staff
  // member, so it opts out of the role guard.
  const isJoin = pathname.startsWith("/staff/join");

  React.useEffect(() => {
    if (isJoin || loading) return;
    if (!user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    else if (!profile || profile.role !== "staff") router.replace(homePathForUser(profile, user.email));
  }, [isJoin, loading, user, profile, pathname, router]);

  const companyId = profile?.companyId ?? "";
  const staffId = profile?.staffId ?? "";
  const notifFetcher = React.useCallback(
    () => listStaffNotifications(companyId, staffId),
    [companyId, staffId],
  );

  if (isJoin) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  if (loading || !user || !profile || profile.role !== "staff") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }

  const logout = async () => {
    await signOutUser();
    router.push("/");
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas">
        <header className="sticky top-0 z-30 border-b border-line-soft bg-surface">
          <div className="shell flex h-[72px] items-center gap-4">
            <Logo size="sm" />
            <span className="hidden rounded-pill bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand sm:inline">
              Staff portal
            </span>
            <nav className="ml-2 hidden items-center gap-1 sm:flex">
              <Link
                href="/staff"
                className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-medium text-brand"
              >
                <CalendarClock className="size-4" /> My schedule
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-canvas-2"
              >
                <Ticket className="size-4" /> My bookings
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              {companyId && staffId && (
                <NotificationBell companyId={companyId} fetcher={notifFetcher} />
              )}
              <span className="hidden text-sm text-muted sm:block">{user.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-btn border border-line px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-danger/40 hover:text-danger"
              >
                <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>
        <main className="shell py-8 lg:py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
