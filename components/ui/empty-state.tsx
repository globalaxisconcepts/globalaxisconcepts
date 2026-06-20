import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-canvas px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[15px] text-body">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
