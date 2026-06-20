"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Clock, ArrowRight, Building2, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCompany, type CompanyDoc } from "@/lib/firebase/content";
import { listServices, type Service } from "@/lib/firebase/company-data";
import { categoryByValue } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

const AVATAR_GRADIENTS = [
  "from-accent-purple to-brand",
  "from-brand to-brand-dark",
  "from-success to-accent-teal",
  "from-accent-orange to-warning",
  "from-accent-teal to-brand",
  "from-accent-orange to-accent-purple",
];
function hashIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function TenantProfile({ slug }: { slug: string }) {
  const [company, setCompany] = React.useState<CompanyDoc | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    Promise.all([getCompany(slug), listServices(slug).catch(() => [])])
      .then(([c, s]) => {
        if (!active) return;
        setCompany(c);
        setServices(s);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32 text-muted">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="shell py-20">
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="Company not found"
          description="This booking page doesn't exist or may have been removed."
          action={
            <Link href="/companies" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              Browse companies
            </Link>
          }
        />
      </div>
    );
  }

  const cat = categoryByValue(company.category);
  const initials =
    company.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "GA";
  const avatar = AVATAR_GRADIENTS[hashIndex(company.slug, AVATAR_GRADIENTS.length)];

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-line-soft bg-canvas">
        <div className="absolute -right-16 -top-16 size-72 rounded-full bg-brand-tint/60 blur-2xl" aria-hidden />
        <div className="shell relative py-16 lg:py-20">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className={cn("grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-display text-2xl font-bold text-white shadow-card", avatar)}>
              {initials}
            </div>
            <div className="flex-1">
              {cat && <Badge tone={cat.tone} size="sm">{cat.label}</Badge>}
              <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{company.name}</h1>
              {company.country && <p className="mt-1 text-sm text-muted">{company.country}</p>}
            </div>
            <Link href={`/${company.slug}/book`} className={cn(buttonVariants({ size: "lg" }))}>
              <CalendarCheck className="size-4" /> Book Now
            </Link>
          </div>
        </div>
      </section>

      <div className="shell grid gap-10 py-14 lg:grid-cols-[1fr_2fr] lg:py-20">
        {/* about */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-xl font-bold text-ink">About</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-body">
            {company.details || "Book an appointment online in just a few clicks."}
          </p>
        </aside>

        {/* services */}
        <section id="services">
          <h2 className="font-display text-xl font-bold text-ink">Services</h2>
          {services.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<CalendarCheck className="size-6" />}
                title="No services listed yet"
                description="This business hasn't published any bookable services yet. Check back soon."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {services.map((s) => (
                <div key={s.id} className="flex flex-col gap-4 rounded-card border border-line-soft bg-surface p-5 shadow-xs sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <h3 className="font-display text-[17px] font-semibold text-ink-800">{s.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <Clock className="size-3.5" /> {s.duration} min · ${s.price.toFixed(2)}
                    </p>
                    {s.description && <p className="mt-2 text-sm text-body">{s.description}</p>}
                  </div>
                  <Link
                    href={`/${company.slug}/book?service=${s.id}`}
                    className={cn(buttonVariants({ variant: "secondary" }), "shrink-0")}
                  >
                    Book <ArrowRight className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
