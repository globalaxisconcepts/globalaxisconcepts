"use client";

import * as React from "react";
import { CalendarDays, Clock, Loader2, Mail, Phone } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { listBookings, updateBookingStatus, type Booking, type BookingStatus } from "@/lib/firebase/company-data";

const STATUS_TONE: Record<BookingStatus, NonNullable<BadgeProps["tone"]>> = {
  pending: "warning",
  confirmed: "brand",
  completed: "success",
  cancelled: "danger",
};
const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];
const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function fmtDate(start: string) {
  return new Date(start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function BookingsPage() {
  const { profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const { toast } = useToast();

  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");

  const refresh = React.useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    listBookings(companyId)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [companyId]);
  React.useEffect(() => refresh(), [refresh]);

  const changeStatus = async (b: Booking, status: BookingStatus) => {
    if (!companyId || status === b.status) return;
    if (status === "cancelled" && !window.confirm(`Cancel ${b.customerName}'s booking?`)) return;
    // optimistic
    setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status } : x)));
    try {
      await updateBookingStatus(companyId, b.id, status);
      toast({ tone: "success", title: `Marked ${status}` });
    } catch {
      toast({ tone: "error", title: "Couldn't update booking" });
      refresh();
    }
  };

  const visible = bookings.filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Bookings</h1>
          <p className="mt-1 text-[15px] text-body">
            {loading ? "Loading…" : `${bookings.length} total ${bookings.length === 1 ? "appointment" : "appointments"}.`}
          </p>
        </div>
        <div className="w-44">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])} aria-label="Filter by status">
            {FILTERS.map((f) => (
              <option key={f} value={f} className="capitalize">{f === "all" ? "All statuses" : f}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted"><Loader2 className="size-6 animate-spin" /></div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title={bookings.length === 0 ? "No bookings yet" : "No bookings match this filter"}
            description={bookings.length === 0 ? "When customers book through your page, their appointments show up here." : "Try a different status filter."}
          />
        ) : (
          <div className="space-y-3">
            {visible.map((b) => (
              <div key={b.id} className="flex flex-col gap-4 rounded-card border border-line-soft bg-surface p-5 shadow-xs lg:flex-row lg:items-center">
                <div className="lg:w-48">
                  <p className="font-display font-semibold text-ink-800">{fmtDate(b.start)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><Clock className="size-3.5" /> {fmtTime(b.time)}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink-800">{b.customerName}</p>
                  <p className="text-sm text-body">{b.serviceName} · {b.staffName}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
                    <span className="flex items-center gap-1"><Mail className="size-3" /> {b.customerEmail}</span>
                    <span className="flex items-center gap-1"><Phone className="size-3" /> {b.customerPhone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <div className="text-right">
                    <p className="font-display font-bold text-brand">${b.price.toFixed(2)}</p>
                    <p className="text-xs text-muted">{b.payment === "online" ? "Paid online" : "Pay at venue"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONE[b.status]} size="sm" className="capitalize">{b.status}</Badge>
                    <select
                      value={b.status}
                      onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                      aria-label="Change status"
                      className="rounded-md border border-line bg-white px-2 py-1 text-xs font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
