"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ExternalLink,
  Menu,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ToastProvider } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { signOutUser } from "@/lib/firebase/auth";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Plans", href: "/admin/plans", icon: CreditCard },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const isSuperAdmin = !!user?.email && SUPER_ADMIN_EMAILS.includes(user.email);

  React.useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    else if (!isSuperAdmin) router.replace("/");
  }, [loading, user, isSuperAdmin, pathname, router]);

  if (loading || !user || !isSuperAdmin) {
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

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center gap-2 border-b border-line-soft px-5">
        <Logo size="sm" />
      </div>
      <div className="px-4 pt-4">
        <span className="flex items-center gap-1.5 rounded-pill bg-ink px-3 py-1.5 text-xs font-semibold text-white">
          <ShieldCheck className="size-3.5" /> Platform admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-btn px-3 py-2.5 text-[15px] font-medium transition-colors",
              isActive(href) ? "bg-brand-tint text-brand" : "text-ink-700 hover:bg-canvas-2",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line-soft p-4">
        <Link href="/" className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-canvas-2">
          <ExternalLink className="size-[18px]" /> View site
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-danger-tint hover:text-danger">
          <LogOut className="size-[18px]" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas">
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line-soft bg-surface lg:block">
          {SidebarInner}
        </aside>

        {mobileOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line-soft bg-surface">
              {SidebarInner}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line-soft bg-surface px-5">
            <button
              className="grid size-9 place-items-center rounded-btn border border-line text-ink-800 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <span className="font-display text-sm font-semibold text-ink-800">Super Admin</span>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:block">{user.email}</span>
              <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                {(user.email || "A").charAt(0).toUpperCase()}
              </span>
            </div>
          </header>
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
