import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

type LogoProps = {
  /** "dark" for light backgrounds, "light" for the footer / blue bands. */
  variant?: "dark" | "light";
  /** Render only the icon tile (no wordmark). */
  markOnly?: boolean;
  /** Wrap in a link to home. Default true. */
  href?: string | null;
  className?: string;
  size?: "sm" | "md";
};

export function Logo({
  variant = "dark",
  markOnly = false,
  href = "/",
  className,
  size = "md",
}: LogoProps) {
  const tile = size === "sm" ? "size-9 rounded-[10px]" : "size-10 rounded-btn";
  const iconSize = size === "sm" ? 18 : 20;

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid place-items-center bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_6px_16px_rgba(40,110,251,0.3)]",
          tile,
        )}
      >
        <CalendarCheck size={iconSize} strokeWidth={2.4} aria-hidden />
      </span>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-tight",
              size === "sm" ? "text-[15px]" : "text-[17px]",
              variant === "light" ? "text-white" : "text-ink",
            )}
          >
            {BRAND.short}
          </span>
          <span
            className={cn(
              "mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]",
              variant === "light" ? "text-brand-tint-2" : "text-brand",
            )}
          >
            Concepts
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${BRAND.name} home`} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
