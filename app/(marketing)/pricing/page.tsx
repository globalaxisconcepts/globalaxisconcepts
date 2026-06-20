import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingClient } from "@/components/marketing/pricing-client";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, small-business friendly pricing. Start free, then choose an affordable Standard or Premium plan as you grow.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Small Business – friendly Pricing"
        subtitle="We're offering a generous Free Plan and affordable Standard & Premium pricing plans that will help you grow with Global Axis Concepts."
      />
      <Suspense fallback={<div className="shell py-20 text-center text-muted">Loading plans…</div>}>
        <PricingClient />
      </Suspense>
    </>
  );
}
