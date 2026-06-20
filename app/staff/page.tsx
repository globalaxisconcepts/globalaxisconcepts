"use client";

import * as React from "react";
import { CalendarClock, Clock, Loader2, Mail, Phone, User } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { listStaffBookings, getStaffMember } from "@/lib/firebase/booking";
import type { Booking, BookingStatus } from "@/lib/firebase/company-data";

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

function BookingRow({ b }: { b: Booking }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line-soft bg-surface p-5 shadow-xs sm:flex-row sm:items-center">
      <div className="sm:w-44">
        <p className="font-display font-semibold text-ink-800">{fmtDate(b.start)}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><Clock className="size-3.5" /> {fmtTime(b.time)}</p>
      </div>
      <div className="flex-1">
        <p className="font-medium text-ink-800">{b.serviceName}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
          <span className="flex items-center gap-1"><User className="size-3" /> {b.customerName}</span>
          <span className="flex items-center gap-1"><Mail className="size-3" /> {b.customerEmail}</span>
          <span className="flex items-center gap-1"><Phone className="size-3" /> {b.customerPhone}</span>
        </div>
      </div>
      <Badge tone={STATUS_TONE[b.status]} size="sm" className="shrink-0 capitalize">{b.status}</Badge>
    </div>
  );
}

export default function StaffSchedulePage() {
  const { user, profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const staffId = profile?.staffId ?? null;

  const [bookings, setBookings] = React.useState<Booking[] | null>(null);
  const [staffName, setStaffName] = React.useState<string>("");

  React.useEffect(() => {
    if (!companyId || !staffId) return;
    listStaffBookings(companyId, staffId).then(setBookings).catch(() => setBookings([]));
    getStaffMember(companyId, staffId).then((m) => m && setStaffName(m.name)).catch(() => {});
  }, [companyId, staffId]);

  const nowIso = new Date().toISOString();
  const active = bookings?.filter((b) => b.status !== "cancelled") ?? [];
  const upcoming = active.filter((b) => b.end >= nowIso).sort((a, b) => a.start.localeCompare(b.start));
  const past = active.filter((b) => b.end < nowIso).sort((a, b) => b.start.localeCompare(a.start));
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todays = active.filter((b) => b.date === todayStr).length;

  const firstName = (staffName || user?.displayName || "").split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-ink">
        Your schedule{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-1 text-[15px] text-body">
        {bookings === null
          ? "Loading…"
          : `${todays} appointment${todays === 1 ? "" : "s"} today · ${upcoming.length} upcoming.`}
      </p>

      {bookings === null ? (
        <div className="flex justify-center py-20 text-muted"><Loader2 className="size-6 animate-spin" /></div>
      ) : (
        <div className="mt-7 space-y-8">
          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">Upcoming</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="size-6" />}
                title="No upcoming appointments"
                description="When customers book you on the business's page, your appointments show up here."
              />
            ) : (
              <div className="space-y-3">{upcoming.map((b) => <BookingRow key={b.id} b={b} />)}</div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">Past</h2>
              <div className="space-y-3 opacity-75">{past.map((b) => <BookingRow key={b.id} b={b} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
