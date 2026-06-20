"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, LayoutGrid, UserRound, Sparkles, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listServices, listBookings, type Booking, type BookingStatus } from "@/lib/firebase/company-data";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<BookingStatus, NonNullable<BadgeProps["tone"]>> = {
  pending: "warning", confirmed: "brand", completed: "success", cancelled: "danger",
};
function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const [services, setServices] = React.useState<number | null>(null);
  const [bookings, setBookings] = React.useState<Booking[] | null>(null);

  React.useEffect(() => {
    if (!companyId) return;
    listServices(companyId).then((s) => setServices(s.length)).catch(() => setServices(0));
    listBookings(companyId).then(setBookings).catch(() => setBookings([]));
  }, [companyId]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todays = bookings?.filter((b) => b.date === todayStr && b.status !== "cancelled").length ?? null;
  const customers = bookings ? new Set(bookings.map((b) => b.customerEmail.toLowerCase())).size : null;

  const show = (v: number | null) => (v === null ? "—" : String(v));

  const kpis = [
    { label: "Today's bookings", value: show(todays), icon: CalendarDays, tone: "text-brand bg-brand-tint" },
    { label: "Services", value: show(services), icon: LayoutGrid, tone: "text-accent-purple bg-accent-purple-tint" },
    { label: "Customers", value: show(customers), icon: UserRound, tone: "text-success bg-success-tint" },
    { label: "Plan", value: "Free", icon: Sparkles, tone: "text-accent-orange bg-accent-orange-tint" },
  ];

  const recent = bookings?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-ink">
        Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-[15px] text-body">Here&apos;s what&apos;s happening with your business.</p>

      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-card border border-brand/20 bg-brand-tint px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-ink-800">
          <Sparkles className="size-4 text-brand" />
          You&apos;re on the <strong>14-day free trial</strong> — all features unlocked.
        </p>
        <Link href="/pricing" className={cn(buttonVariants({ size: "sm" }))}>Upgrade plan</Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-card border border-line-soft bg-surface p-5 shadow-xs">
            <div className={cn("grid size-10 place-items-center rounded-xl", k.tone)}>
              <k.icon className="size-5" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-ink">{k.value}</p>
            <p className="text-sm text-muted">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-card border border-line-soft bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-800">Recent bookings</h2>
            {recent.length > 0 && (
              <Link href="/dashboard/bookings" className="text-sm font-semibold text-brand hover:text-brand-dark">View all</Link>
            )}
          </div>
          <div className="mt-4">
            {bookings === null ? (
              <p className="py-6 text-center text-sm text-muted">Loading…</p>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="size-6" />}
                title="No bookings yet"
                description="Bookings from your customers will appear here once your booking page is live."
              />
            ) : (
              <ul className="divide-y divide-line-soft">
                {recent.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-800">{b.customerName}</p>
                      <p className="truncate text-sm text-muted">{b.serviceName} · {b.date} · {fmtTime(b.time)}</p>
                    </div>
                    <Badge tone={STATUS_TONE[b.status]} size="sm" className="shrink-0 capitalize">{b.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="rounded-card border border-line-soft bg-surface p-6 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-ink-800">Quick actions</h2>
          <div className="mt-4 space-y-2.5">
            <Link href="/dashboard/services" className="flex items-center justify-between rounded-btn border border-line px-4 py-3 text-sm font-medium text-ink-800 transition-colors hover:border-brand/40 hover:bg-brand-tint/40">
              <span className="flex items-center gap-2"><Plus className="size-4 text-brand" /> Add a service</span>
              <ArrowRight className="size-4 text-muted" />
            </Link>
            <Link href="/dashboard/bookings" className="flex items-center justify-between rounded-btn border border-line px-4 py-3 text-sm font-medium text-ink-800 transition-colors hover:border-brand/40 hover:bg-brand-tint/40">
              <span>View bookings</span>
              <ArrowRight className="size-4 text-muted" />
            </Link>
            {companyId && (
              <Link href={`/${companyId}`} className="flex items-center justify-between rounded-btn border border-line px-4 py-3 text-sm font-medium text-ink-800 transition-colors hover:border-brand/40 hover:bg-brand-tint/40">
                <span>View booking page</span>
                <ArrowRight className="size-4 text-muted" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
