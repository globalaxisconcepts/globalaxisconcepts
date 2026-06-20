"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PLANS, PLAN_FEATURE_ROWS } from "@/lib/data/plans";
import { getPlans } from "@/lib/firebase/cms";
import type { Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PricingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearly = searchParams.get("billing") === "yearly";

  // Start from code defaults, then refresh from Firestore (CMS-managed).
  const [plans, setPlans] = React.useState<Plan[]>(PLANS);
  React.useEffect(() => {
    getPlans().then(setPlans).catch(() => {});
  }, []);

  const setYearly = (next: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("billing", next ? "yearly" : "monthly");
    router.replace(`/pricing?${params.toString()}`, { scroll: false });
  };

  const billing = yearly ? "yearly" : "monthly";

  return (
    <div className="shell py-16 lg:py-20">
      {/* billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn("text-[15px]", !yearly ? "font-semibold text-ink-800" : "text-muted")}>
          Monthly
        </span>
        <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly billing" />
        <span className={cn("text-[15px]", yearly ? "font-semibold text-ink-800" : "text-muted")}>
          Yearly
        </span>
        <Badge tone="success" size="sm">
          Save 20%
        </Badge>
      </div>

      {/* plan cards */}
      <div className="mx-auto mt-12 grid max-w-5xl items-start gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const isFree = plan.id === "free";
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex h-full flex-col rounded-card border bg-surface p-7 transition-shadow",
                plan.popular
                  ? "border-brand shadow-card-hover lg:-mt-3 lg:pb-9"
                  : "border-line shadow-xs",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-brand px-3 py-1 text-xs font-semibold text-white shadow-btn">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-ink">{plan.name}</h3>
              <p className="mt-1.5 min-h-10 text-sm text-body">{plan.blurb}</p>

              <div className="mt-5 flex items-end gap-1">
                {isFree ? (
                  <span className="font-display text-4xl font-bold text-ink">Free</span>
                ) : (
                  <>
                    <span className="font-display text-4xl font-bold text-ink">
                      ${price.toFixed(2)}
                    </span>
                    <span className="mb-1 text-sm text-muted">/mo</span>
                  </>
                )}
              </div>
              <p className="mt-1 h-5 text-xs text-muted">
                {!isFree && yearly && "billed yearly"}
              </p>

              <Link
                href={`/register?plan=${plan.id}&billing=${billing}`}
                className={cn(
                  buttonVariants({ variant: plan.popular ? "primary" : "secondary" }),
                  "mt-5 w-full",
                )}
              >
                Select Plan
              </Link>

              {/* limits */}
              <ul className="mt-7 space-y-3 text-sm">
                {[
                  ["Customers", plan.limits.customers],
                  ["Staffs", plan.limits.staffs],
                  ["Services", plan.limits.services],
                  ["Appointments", plan.limits.appointments],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-body">{label}</span>
                    <span className="font-semibold text-ink-800">{value}</span>
                  </li>
                ))}
              </ul>

              <div className="my-6 h-px bg-line-soft" />

              {/* feature toggles */}
              <ul className="space-y-3 text-sm">
                {PLAN_FEATURE_ROWS.map((row) => {
                  const on = plan.features[row.key];
                  return (
                    <li key={row.key} className="flex items-center gap-2.5">
                      {on ? (
                        <Check className="size-4 shrink-0 text-success" />
                      ) : (
                        <X className="size-4 shrink-0 text-muted/60" />
                      )}
                      <span className={on ? "text-ink-800" : "text-muted line-through decoration-line-strong"}>
                        {row.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
