import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Badge } from "@/components/ui/badge";
import { getBlogPosts } from "@/lib/firebase/cms";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Guides and ideas on online booking, growth, payments, and running a service business.",
};

export const revalidate = 60;

export default async function BlogsPage() {
  const posts = await getBlogPosts();
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas to grow your booking business"
        subtitle="Practical guides on online booking, reducing no-shows, payments, and scaling your service business."
      />
      <section className="shell py-16 lg:py-20">
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-card border border-line-soft bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className={cn("relative h-44 bg-gradient-to-br", post.accent)}>
                <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/15" />
                <div className="absolute bottom-4 left-4">
                  <Badge tone="neutral" size="sm" className="bg-white/90 text-ink-800">
                    {post.category}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-lg font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-body">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <CalendarDays className="size-3.5" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-brand">
                    Read more <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
