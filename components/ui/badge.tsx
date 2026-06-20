import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill font-medium leading-none",
  {
    variants: {
      tone: {
        brand: "bg-brand-tint text-brand",
        neutral: "bg-canvas-2 text-ink-700",
        success: "bg-success-tint text-success",
        warning: "bg-warning-tint text-warning",
        danger: "bg-danger-tint text-danger",
        purple: "bg-accent-purple-tint text-accent-purple",
        teal: "bg-accent-teal-tint text-accent-teal",
        orange: "bg-accent-orange-tint text-accent-orange",
      },
      size: {
        sm: "px-2.5 py-1 text-xs",
        md: "px-3 py-1.5 text-[13px]",
      },
    },
    defaultVariants: { tone: "brand", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
