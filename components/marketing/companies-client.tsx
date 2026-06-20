"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Building2 } from "lucide-react";
import { Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getCompanies, type DirectoryCompany } from "@/lib/firebase/content";
import { CATEGORIES, categoryByValue } from "@/lib/data/categories";
import { COUNTRIES } from "@/lib/data/countries";
import { cn } from "@/lib/utils";

function CompanyCard({ company }: { company: DirectoryCompany }) {
  const cat = categoryByValue(company.category);
  return (
    <div className="group flex flex-col rounded-card border border-line-soft bg-surface p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-hover">
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br font-display text-base font-bold text-white",
            company.avatar,
          )}
        >
          {company.initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-[17px] font-semibold text-ink-800">
            {company.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5" />
            {company.country}
          </p>
        </div>
      </div>
      {cat && (
        <div className="mt-4">
          <Badge tone={cat.tone} size="sm">
            {cat.label}
          </Badge>
        </div>
      )}
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-body">
        {company.tagline}
      </p>
      <Link
        href={`/${company.slug}`}
        className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4 w-full")}
      >
        View Page
      </Link>
    </div>
  );
}

export function CompaniesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "all";
  const country = searchParams.get("country") ?? "all";
  const [companies, setCompanies] = React.useState<DirectoryCompany[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load companies from Firestore once.
  React.useEffect(() => {
    let active = true;
    getCompanies()
      .then((list) => active && setCompanies(list))
      .catch(() => active && setCompanies([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const update = (key: "category" | "country", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `/companies?${qs}` : "/companies", { scroll: false });
  };

  const clearFilters = () => router.replace("/companies", { scroll: false });

  const results = companies.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      (country === "all" || c.country === country),
  );

  return (
    <div className="shell py-12 lg:py-16">
      {/* filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:max-w-xs">
          <Select
            aria-label="Filter by country"
            value={country}
            onChange={(e) => update("country", e.target.value)}
          >
            <option value="all">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-sm text-muted sm:ml-auto">
          {loading ? "Searching…" : `${results.length} ${results.length === 1 ? "company" : "companies"}`}
        </p>
      </div>

      {/* results */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="No companies match these filters"
            description="Try a different category or country to see more booking pages."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
