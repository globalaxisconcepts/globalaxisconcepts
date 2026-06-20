"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  LayoutGrid,
  Users,
  UserRound,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ToastProvider } from "@/components/ui/toast";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { useAuth } from "@/components/auth/auth-provider";
import { signOutUser } from "@/lib/firebase/auth";
import { homePathForUser } from "@/lib/auth-routing";
import { listOwnerNotifications } from "@/lib/firebase/notifications";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Services", href: "/dashboard/services", icon: LayoutGrid },
  { label: "Staff", href: "/dashboard/staff", icon: Users },
  { label: "Customers", href: "/dashboard/customers", icon: UserRound },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  React.useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    else if (!profile) router.replace("/register");
    else if (profile.role !== "business-owner") router.replace(homePathForUser(profile, user.email));
  }, [loading, user, profile, pathname, router]);

  // Stable fetcher for the notification bell (avoids a reload loop).
  const ownerCompanyId = profile?.companyId ?? "";
  const notifFetcher = React.useCallback(
    () => listOwnerNotifications(ownerCompanyId),
    [ownerCompanyId],
  );

  if (loading || !user || !profile || profile.role !== "business-owner") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }

  const companyId = profile.companyId;
  const logout = async () => {
    await signOutUser();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center border-b border-line-soft px-5">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-btn px-3 py-2.5 text-[15px] font-medium transition-colors",
              isActive(href)
                ? "bg-brand-tint text-brand"
                : "text-ink-700 hover:bg-canvas-2",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line-soft p-4">
        {companyId && (
          <Link
            href={`/${companyId}`}
            className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-canvas-2"
          >
            <ExternalLink className="size-[18px]" /> View booking page
          </Link>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-danger-tint hover:text-danger"
        >
          <LogOut className="size-[18px]" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas">
        {/* desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line-soft bg-surface lg:block">
          {SidebarInner}
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line-soft bg-surface">
              {SidebarInner}
            </aside>
          </div>
        )}

        {/* content */}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line-soft bg-surface px-5">
            <button
              className="grid size-9 place-items-center rounded-btn border border-line text-ink-800 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <span className="font-display text-sm font-semibold text-ink-800">
              {profile.companyId}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell companyId={ownerCompanyId} fetcher={notifFetcher} />
              <span className="hidden text-sm text-muted sm:block">{user.email}</span>
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
                {(user.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          </header>
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
