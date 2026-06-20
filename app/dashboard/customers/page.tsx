"use client";

import * as React from "react";
import { UserRound, Loader2, Mail, Phone } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { listBookings } from "@/lib/firebase/company-data";
import { cn } from "@/lib/utils";

interface CustomerRow {
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
}

const AVATARS = ["from-accent-purple to-brand", "from-brand to-brand-dark", "from-success to-accent-teal", "from-accent-orange to-warning"];
function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function CustomersPage() {
  const { profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!companyId) return;
    listBookings(companyId)
      .then((bookings) => {
        const map = new Map<string, CustomerRow>();
        for (const b of bookings) {
          const key = b.customerEmail.toLowerCase();
          const existing = map.get(key);
          if (existing) {
            existing.visits += 1;
            if (b.start > existing.lastVisit) existing.lastVisit = b.start;
          } else {
            map.set(key, { name: b.customerName, email: b.customerEmail, phone: b.customerPhone, visits: 1, lastVisit: b.start });
          }
        }
        setCustomers([...map.values()].sort((a, b) => b.lastVisit.localeCompare(a.lastVisit)));
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-ink">Customers</h1>
      <p className="mt-1 text-[15px] text-body">
        {loading ? "Loading…" : `${customers.length} ${customers.length === 1 ? "customer" : "customers"} who've booked with you.`}
      </p>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted"><Loader2 className="size-6 animate-spin" /></div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<UserRound className="size-6" />}
            title="No customers yet"
            description="Customers appear here automatically the first time they book with you."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {customers.map((c, i) => (
              <div key={c.email} className="rounded-card border border-line-soft bg-surface p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-sm font-bold text-white", AVATARS[i % AVATARS.length])}>
                    {initialsOf(c.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold text-ink-800">{c.name}</p>
                    <p className="text-xs text-muted">{c.visits} {c.visits === 1 ? "booking" : "bookings"}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-body">
                  <p className="flex items-center gap-2"><Mail className="size-3.5 text-muted" /> {c.email}</p>
                  <p className="flex items-center gap-2"><Phone className="size-3.5 text-muted" /> {c.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
