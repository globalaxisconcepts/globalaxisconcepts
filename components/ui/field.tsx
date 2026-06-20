import * as React from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-sm border bg-white px-4 py-3 text-[15px] text-ink-800 placeholder:text-muted transition-shadow duration-150 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas-2 disabled:text-muted";

const stateClass = (invalid?: boolean) =>
  invalid
    ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(224,57,94,0.12)]"
    : "border-line focus:border-brand focus:shadow-ring";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(base, stateClass(invalid), className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(base, stateClass(invalid), "min-h-28 resize-y leading-relaxed", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(base, stateClass(invalid), "appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  ),
);
Select.displayName = "Select";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-ink-800", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-danger">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

export function FieldHint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[13px] text-muted">{children}</p>;
}

export function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-0", className)} {...props} />;
}
