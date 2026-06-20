import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { CompaniesClient } from "@/components/marketing/companies-client";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Browse businesses using Global Axis Concepts. Filter by category and country to find a booking page.",
};

export default function CompaniesPage() {
  return (
    <>
      <PageHero
        eyebrow="Directory"
        title="Company Lists"
        subtitle="Discover businesses taking bookings with Global Axis Concepts. Filter by category and country to find the right one."
      />
      <Suspense fallback={<div className="shell py-20 text-center text-muted">Loading companies…</div>}>
        <CompaniesClient />
      </Suspense>
    </>
  );
}
