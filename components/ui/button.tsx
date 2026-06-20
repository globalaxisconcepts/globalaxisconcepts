import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap rounded-btn transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] select-none disabled:pointer-events-none disabled:opacity-55 active:translate-y-px focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white shadow-btn hover:bg-brand-dark hover:shadow-btn-hover",
        secondary:
          "border border-brand/40 text-brand bg-white hover:bg-brand-tint hover:border-brand",
        ghost: "text-ink-800 hover:bg-canvas-2 hover:text-brand",
        subtle: "bg-brand-tint text-brand hover:bg-brand-tint-2",
        white: "bg-white text-brand shadow-card hover:shadow-card-hover",
        danger: "bg-danger text-white hover:brightness-95 shadow-btn",
        link: "text-brand underline-offset-4 hover:underline px-0 h-auto shadow-none",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "px-7 py-[13px] text-[15px]",
        lg: "px-8 py-4 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
