"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { getPlans, upsertPlan } from "@/lib/firebase/cms";
import { PLAN_FEATURE_ROWS } from "@/lib/data/plans";
import type { Plan } from "@/lib/types";

const LIMIT_KEYS: { key: keyof Plan["limits"]; label: string }[] = [
  { key: "customers", label: "Customers" },
  { key: "staffs", label: "Staffs" },
  { key: "services", label: "Services" },
  { key: "appointments", label: "Appointments" },
];

export default function AdminPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPlans().then(setPlans).finally(() => setLoading(false));
  }, []);

  const patch = (i: number, fn: (p: Plan) => Plan) =>
    setPlans((prev) => prev.map((p, idx) => (idx === i ? fn(p) : p)));

  const save = async (plan: Plan) => {
    setSavingId(plan.id);
    try {
      await upsertPlan(plan);
      toast({ tone: "success", title: `${plan.name} plan saved` });
    } catch {
      toast({ tone: "error", title: "Couldn't save plan", description: "Sign in as the platform owner." });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16 text-muted"><Loader2 className="size-6 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-ink">Subscription plans</h1>
      <p className="mt-1 text-[15px] text-body">Prices, limits, and feature toggles shown on the pricing page.</p>

      <div className="mt-7 space-y-6">
        {plans.map((plan, i) => (
          <div key={plan.id} className="rounded-card border border-line-soft bg-surface p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-bold text-ink">{plan.name}</h2>
                <label className="flex items-center gap-2 text-sm text-body">
                  <Switch checked={!!plan.popular} onCheckedChange={(v) => patch(i, (p) => ({ ...p, popular: v }))} aria-label="Popular" />
                  Popular
                </label>
              </div>
              <Button size="sm" loading={savingId === plan.id} onClick={() => save(plan)}>Save</Button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={plan.name} onChange={(e) => patch(i, (p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input value={plan.blurb} onChange={(e) => patch(i, (p) => ({ ...p, blurb: e.target.value }))} />
              </div>
              <div>
                <Label>Monthly price ($)</Label>
                <Input type="number" step="0.01" value={plan.monthly} onChange={(e) => patch(i, (p) => ({ ...p, monthly: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Yearly price ($/mo)</Label>
                <Input type="number" step="0.01" value={plan.yearly} onChange={(e) => patch(i, (p) => ({ ...p, yearly: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink-800">Limits</p>
              <div className="grid gap-4 sm:grid-cols-4">
                {LIMIT_KEYS.map(({ key, label }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input value={plan.limits[key]} onChange={(e) => patch(i, (p) => ({ ...p, limits: { ...p.limits, [key]: e.target.value } }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink-800">Features</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {PLAN_FEATURE_ROWS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 rounded-btn border border-line px-3 py-2.5 text-sm text-ink-800">
                    <Switch checked={plan.features[key]} onCheckedChange={(v) => patch(i, (p) => ({ ...p, features: { ...p.features, [key]: v } }))} aria-label={label} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
