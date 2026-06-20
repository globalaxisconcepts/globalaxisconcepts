import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="shell flex h-[72px] items-center border-b border-line-soft">
        <Logo />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="text-center">
          <p className="font-display text-[120px] font-bold leading-none text-brand-tint">
            404
          </p>
          <h1 className="text-h2 -mt-4 text-ink">This page doesn&apos;t exist</h1>
          <p className="mx-auto mt-3 max-w-md text-[16px] text-body">
            The page you&apos;re looking for may have moved or never existed. Let&apos;s
            get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={buttonVariants()}>
              Back to home
            </Link>
            <Link href="/companies" className={cn(buttonVariants({ variant: "secondary" }))}>
              Browse companies
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
