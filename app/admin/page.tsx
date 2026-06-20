"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, CreditCard, FileText, HelpCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getCompanies } from "@/lib/firebase/content";
import { getPlans, getBlogPosts, getFaqs, seedDefaults } from "@/lib/firebase/cms";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
  const { toast } = useToast();
  const [counts, setCounts] = React.useState({ companies: 0, plans: 0, blogs: 0, faqs: 0 });
  const [loading, setLoading] = React.useState(true);
  const [seeding, setSeeding] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    Promise.all([getCompanies(), getPlans(), getBlogPosts(), getFaqs()])
      .then(([c, p, b, f]) =>
        setCounts({ companies: c.length, plans: p.length, blogs: b.length, faqs: f.length }),
      )
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => refresh(), [refresh]);

  const seed = async () => {
    setSeeding(true);
    try {
      const r = await seedDefaults();
      toast({
        tone: "success",
        title: "Default content imported",
        description: `${r.plans} plans, ${r.blogs} blog posts, ${r.faqs} FAQs.`,
      });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't import content", description: "Are you signed in as the platform owner?" });
    } finally {
      setSeeding(false);
    }
  };

  const kpis = [
    { label: "Companies", value: counts.companies, icon: Building2, tone: "text-brand bg-brand-tint", href: "/admin/companies" },
    { label: "Plans", value: counts.plans, icon: CreditCard, tone: "text-accent-purple bg-accent-purple-tint", href: "/admin/plans" },
    { label: "Blog posts", value: counts.blogs, icon: FileText, tone: "text-accent-teal bg-accent-teal-tint", href: "/admin/blogs" },
    { label: "FAQs", value: counts.faqs, icon: HelpCircle, tone: "text-accent-orange bg-accent-orange-tint", href: "/admin/faqs" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-ink">Platform overview</h1>
      <p className="mt-1 text-[15px] text-body">Manage every tenant, plan, and piece of content.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="rounded-card border border-line-soft bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className={cn("grid size-10 place-items-center rounded-xl", k.tone)}>
              <k.icon className="size-5" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-ink">{loading ? "—" : k.value}</p>
            <p className="text-sm text-muted">{k.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-card border border-line-soft bg-surface p-6 shadow-xs">
        <h2 className="font-display text-lg font-semibold text-ink-800">Content</h2>
        <p className="mt-1 max-w-2xl text-[15px] text-body">
          Import the built-in default plans, blog posts, and FAQs into Firestore so you can edit them.
          Safe to run more than once — it overwrites the defaults, not your custom entries.
        </p>
        <Button onClick={seed} loading={seeding} className="mt-4">
          <Download className="size-4" /> {seeding ? "Importing…" : "Import default content"}
        </Button>
      </div>
    </div>
  );
}
