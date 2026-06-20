import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { LEGAL_PAGES, getLegalPage } from "@/lib/data/legal";

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) return { title: "Page not found" };
  return { title: page.title, description: page.intro };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} subtitle={`Last updated ${page.updated}`} />
      <section className="shell py-16 lg:py-20">
        <div className="mx-auto max-w-[760px]">
          <p className="text-[17px] leading-relaxed text-body">{page.intro}</p>
          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-xl font-bold text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-[16px] leading-relaxed text-body">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
