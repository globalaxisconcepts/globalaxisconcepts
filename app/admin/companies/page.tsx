"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, ExternalLink, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getCompanies, type DirectoryCompany } from "@/lib/firebase/content";
import { categoryByValue } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

export default function AdminCompanies() {
  const [companies, setCompanies] = React.useState<DirectoryCompany[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-ink">Companies</h1>
      <p className="mt-1 text-[15px] text-body">
        {loading ? "Loading…" : `${companies.length} registered ${companies.length === 1 ? "tenant" : "tenants"}.`}
      </p>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted"><Loader2 className="size-6 animate-spin" /></div>
        ) : companies.length === 0 ? (
          <EmptyState icon={<Building2 className="size-6" />} title="No companies yet" description="Tenants will appear here as businesses register." />
        ) : (
          <div className="overflow-hidden rounded-card border border-line-soft bg-surface shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line-soft bg-canvas text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Category</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Country</th>
                  <th className="px-5 py-3 text-right font-semibold">Page</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const cat = categoryByValue(c.category);
                  return (
                    <tr key={c.slug} className="border-b border-line-soft last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white", c.avatar)}>
                            {c.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-ink-800">{c.name}</p>
                            <p className="font-mono text-xs text-muted">/{c.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        {cat && <Badge tone={cat.tone} size="sm">{cat.label}</Badge>}
                      </td>
                      <td className="hidden px-5 py-3 text-body md:table-cell">{c.country || "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/${c.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
                          View <ExternalLink className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
