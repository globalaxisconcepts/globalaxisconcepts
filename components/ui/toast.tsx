"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const toneConfig: Record<
  ToastTone,
  { icon: React.ElementType; className: string }
> = {
  success: { icon: CheckCircle2, className: "text-success" },
  error: { icon: XCircle, className: "text-danger" },
  info: { icon: Info, className: "text-brand" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => {
          const { icon: Icon, className } = toneConfig[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className="animate-rise pointer-events-auto flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-pop"
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink-800">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-[13px] text-body">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted transition-colors hover:text-ink-800"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
