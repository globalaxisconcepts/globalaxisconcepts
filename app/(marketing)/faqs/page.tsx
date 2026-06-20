import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { Accordion } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { getFaqs } from "@/lib/firebase/cms";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about Global Axis Concepts, the free trial, plans, and online booking.",
};

export const revalidate = 60;

export default async function FaqsPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about the trial, plans, and how online booking works. Can't find an answer? Get in touch."
      />
      <section className="shell py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <Accordion items={faqs} defaultOpen={[0]} />

          <div className="mt-12 rounded-card border border-line-soft bg-canvas p-8 text-center">
            <h2 className="font-display text-xl font-bold text-ink">
              Still have questions?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-body">
              Our team is happy to help you get set up and answer anything else.
            </p>
            <Link href="/contact" className={`${buttonVariants()} mt-5`}>
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
