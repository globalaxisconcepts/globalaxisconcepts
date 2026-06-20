"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Clock, Loader2, Store, Ticket } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { getMyBookings, type MyBooking } from "@/lib/firebase/account";
import type { BookingStatus } from "@/lib/firebase/company-data";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<BookingStatus, NonNullable<BadgeProps["tone"]>> = {
  pending: "warning", confirmed: "brand", completed: "success", cancelled: "danger",
};

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function fmtDate(start: string) {
  return new Date(start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function Row({ b }: { b: MyBooking }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line-soft bg-surface p-5 shadow-xs sm:flex-row sm:items-center">
      <div className="sm:w-44">
        <p className="font-display font-semibold text-ink-800">{fmtDate(b.start)}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><Clock className="size-3.5" /> {fmtTime(b.time)}</p>
      </div>
      <div className="flex-1">
        <p className="font-medium text-ink-800">{b.serviceName}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted">
          <Link href={`/${b.companyId}`} className="flex items-center gap-1.5 font-medium text-brand hover:text-brand-dark">
            <Store className="size-3.5" /> {b.companyName}
          </Link>
          {b.staffName && b.staffName !== "Any available" && <span>with {b.staffName}</span>}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span className="font-display font-bold text-brand">${b.price.toFixed(2)}</span>
        <Badge tone={STATUS_TONE[b.status]} size="sm" className="capitalize">{b.status}</Badge>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState<MyBooking[] | null>(null);

  React.useEffect(() => {
    if (!user) return;
    getMyBookings(user.uid).then(setBookings).catch(() => setBookings([]));
  }, [user]);

  const nowIso = new Date().toISOString();
  const upcoming = (bookings ?? [])
    .filter((b) => b.status !== "cancelled" && b.start >= nowIso)
    .sort((a, b) => a.start.localeCompare(b.start));
  const pastOrCancelled = (bookings ?? [])
    .filter((b) => b.status === "cancelled" || b.start < nowIso)
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <div className="shell max-w-4xl py-10 lg:py-14">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-brand-tint text-brand">
          <Ticket className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">My bookings</h1>
          <p className="text-[15px] text-body">Appointments you&apos;ve booked across businesses.</p>
        </div>
      </div>

      {bookings === null ? (
        <div className="flex justify-center py-20 text-muted"><Loader2 className="size-6 animate-spin" /></div>
      ) : bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="No bookings yet"
            description="When you book an appointment while signed in, it shows up here so you can keep track."
            action={<Link href="/companies" className={cn(buttonVariants({ size: "sm" }))}>Browse businesses</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="rounded-card border border-dashed border-line-strong bg-canvas px-5 py-8 text-center text-sm text-muted">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">{upcoming.map((b) => <Row key={b.id} b={b} />)}</div>
            )}
          </section>

          {pastOrCancelled.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">Past &amp; cancelled</h2>
              <div className="space-y-3 opacity-75">{pastOrCancelled.map((b) => <Row key={b.id} b={b} />)}</div>
            </section>
          )}

          <p className="text-center text-xs text-muted">
            Need to change or cancel an appointment? Contact the business directly.
          </p>
        </div>
      )}
    </div>
  );
}
