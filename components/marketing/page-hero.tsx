import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Centered heading block used at the top of inner marketing pages. */
export function PageHero({ eyebrow, title, subtitle, className, children }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden border-b border-line-soft bg-canvas", className)}>
      <div className="shell py-16 text-center lg:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-h2 mx-auto mt-3 max-w-3xl text-ink">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-body">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
