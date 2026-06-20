import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { getBlogPost, getBlogPosts } from "@/lib/firebase/cms";
import { cn, formatDate } from "@/lib/utils";

export const revalidate = 60;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const related = (await getBlogPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="pb-20">
      {/* cover */}
      <div className={cn("relative h-56 bg-gradient-to-br sm:h-72", post.accent)}>
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 left-10 size-40 rounded-full bg-white/10" />
      </div>

      <div className="shell">
        <div className="mx-auto -mt-16 max-w-[760px]">
          <div className="rounded-card border border-line-soft bg-surface p-7 shadow-card sm:p-10">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-4" /> Back to all articles
            </Link>

            <div className="mt-5">
              <Badge tone="brand" size="sm">
                {post.category}
              </Badge>
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <User className="size-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" /> {post.readMinutes} min read
              </span>
            </div>
          </div>

          {/* body */}
          <div className="mt-8 space-y-5 px-1">
            <p className="text-xl font-medium leading-relaxed text-ink-700">
              {post.excerpt}
            </p>
            {post.body.map((para, i) => (
              <p key={i} className="text-[17px] leading-[1.75] text-body">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* related */}
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="font-display text-xl font-bold text-ink">Related articles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blogs/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-card border border-line-soft bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={cn("h-28 bg-gradient-to-br", p.accent)} />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[15px] font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted">{formatDate(p.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
