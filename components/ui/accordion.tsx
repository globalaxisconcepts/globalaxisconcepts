"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  /** Allow multiple panels open at once. Default false (single). */
  multiple?: boolean;
  defaultOpen?: number[];
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [open, setOpen] = React.useState<number[]>(defaultOpen);

  const toggle = (i: number) => {
    setOpen((prev) => {
      const isOpen = prev.includes(i);
      if (multiple) return isOpen ? prev.filter((x) => x !== i) : [...prev, i];
      return isOpen ? [] : [i];
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        const panelId = `accordion-panel-${i}`;
        const btnId = `accordion-trigger-${i}`;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-card border bg-surface transition-colors",
              isOpen ? "border-brand/30 shadow-xs" : "border-line",
            )}
          >
            <h3>
              <button
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none"
              >
                <span className="font-display text-[16px] font-semibold text-ink-800">
                  {item.question}
                </span>
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full transition-all duration-300",
                    isOpen
                      ? "rotate-45 bg-brand text-white"
                      : "bg-brand-tint text-brand",
                  )}
                >
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={cn(
                "grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[15px] leading-relaxed text-body">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
