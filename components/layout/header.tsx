"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Globe, LogOut, LayoutDashboard, ShieldCheck, CalendarClock, Ticket } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, PAGES_DROPDOWN, LANGUAGES, SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { useAuth } from "@/components/auth/auth-provider";
import { signOutUser } from "@/lib/firebase/auth";

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return ref;
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function PagesDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const active = PAGES_DROPDOWN.some((p) => isActive(pathname, p.href));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1 text-[15px] font-medium transition-colors hover:text-brand",
          active ? "text-brand" : "text-ink-700",
        )}
      >
        Pages
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="animate-rise absolute left-0 top-full z-50 mt-3 w-56 rounded-card border border-line bg-surface p-1.5 shadow-pop"
        >
          {PAGES_DROPDOWN.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-tint hover:text-brand"
            >
              {p.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(LANGUAGES[0]);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-btn border border-line px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand/40 hover:text-brand"
      >
        <Globe className="size-4" />
        <span className="uppercase">{current.code}</span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="animate-rise absolute right-0 top-full z-50 mt-3 w-40 rounded-card border border-line bg-surface p-1.5 shadow-pop"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="menuitem"
              onClick={() => {
                setCurrent(lang);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-brand-tint hover:text-brand",
                lang.code === current.code ? "text-brand" : "text-ink-700",
              )}
            >
              {lang.label}
              <span className="font-mono text-xs uppercase text-muted">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  if (!user) return null;
  const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();
  const isSuperAdmin = !!user.email && SUPER_ADMIN_EMAILS.includes(user.email);

  const logout = async () => {
    setOpen(false);
    await signOutUser();
    router.push("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-pill border border-line py-1 pl-1 pr-2.5 transition-colors hover:border-brand/40"
      >
        <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
          {initial}
        </span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="animate-rise absolute right-0 top-full z-50 mt-3 w-60 rounded-card border border-line bg-surface p-1.5 shadow-pop"
        >
          <div className="border-b border-line-soft px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink-800">
              {user.displayName || "Signed in"}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          {profile?.role === "business-owner" && (
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-tint hover:text-brand"
            >
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          )}
          {profile?.role === "staff" && (
            <Link
              href="/staff"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-tint hover:text-brand"
            >
              <CalendarClock className="size-4" /> My schedule
            </Link>
          )}
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-tint hover:text-brand"
          >
            <Ticket className="size-4" /> My bookings
          </Link>
          {isSuperAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-tint hover:text-brand"
            >
              <ShieldCheck className="size-4" /> Admin
            </Link>
          )}
          <button
            onClick={logout}
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-danger-tint hover:text-danger"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const mobileLogout = async () => {
    setMobileOpen(false);
    await signOutUser();
    router.push("/");
  };

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Logo />

        {/* desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[15px] font-medium transition-colors hover:text-brand",
                isActive(pathname, item.href) ? "text-brand" : "text-ink-700",
              )}
            >
              {item.label}
            </Link>
          ))}
          <PagesDropdown pathname={pathname} />
        </nav>

        {/* desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="text-[15px] font-semibold text-ink-800 transition-colors hover:text-brand"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }), "px-5 py-2.5")}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* mobile trigger */}
        <button
          className="grid size-10 place-items-center rounded-btn border border-line text-ink-800 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="shell flex flex-col gap-1 border-t border-line-soft py-4">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-btn px-3 py-3 text-base font-medium transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-brand-tint text-brand"
                    : "text-ink-700 hover:bg-canvas-2",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-line-soft pt-2">
              <p className="px-3 pb-1 font-mono text-xs uppercase tracking-wider text-muted">
                Pages
              </p>
              {PAGES_DROPDOWN.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block rounded-btn px-3 py-2.5 text-base font-medium text-ink-700 hover:bg-canvas-2"
                >
                  {p.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {user ? (
                <>
                  <div className="rounded-btn bg-canvas-2 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink-800">
                      {user.displayName || "Signed in"}
                    </p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  {profile?.role === "business-owner" && (
                    <Link href="/dashboard" className={cn(buttonVariants(), "w-full")}>
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                  )}
                  {profile?.role === "staff" && (
                    <Link href="/staff" className={cn(buttonVariants(), "w-full")}>
                      <CalendarClock className="size-4" /> My schedule
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className={cn(
                      buttonVariants({ variant: profile?.role ? "secondary" : "primary" }),
                      "w-full",
                    )}
                  >
                    <Ticket className="size-4" /> My bookings
                  </Link>
                  <button
                    onClick={mobileLogout}
                    className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                  >
                    <LogOut className="size-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                  >
                    Sign In
                  </Link>
                  <Link href="/register" className={cn(buttonVariants(), "w-full")}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
