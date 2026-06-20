import { cn } from "@/lib/utils";

interface BookingSceneProps {
  /** Mono caption tag shown at the bottom-left (prototype placeholder style). */
  label?: string;
  /** Numbered step badge centered on the top edge. */
  badge?: number;
  /** Varies which grid cells are accented so repeated scenes don't look identical. */
  seed?: number;
  className?: string;
}

// Deterministic accent patterns (no Math.random — SSR-safe & stable).
const PATTERNS: Record<number, { brand: number[]; tint: number[] }> = {
  0: { brand: [1, 8, 9, 15], tint: [3, 10, 17, 22] },
  1: { brand: [2, 7, 13, 19], tint: [0, 9, 16, 21] },
  2: { brand: [4, 6, 11, 18], tint: [1, 12, 15, 23] },
  3: { brand: [0, 7, 14, 20], tint: [5, 9, 13, 22] },
};

const CELLS = 24; // 6 cols × 4 rows

export function BookingScene({ label, badge, seed = 0, className }: BookingSceneProps) {
  const pattern = PATTERNS[seed % 4];

  return (
    <div className={cn("relative aspect-[4/3] w-full", className)}>
      {/* soft blue blobs */}
      <div className="blob -left-6 top-2 size-40 opacity-80" />
      <div className="blob bottom-0 right-2 size-48 opacity-60" />
      <div
        aria-hidden
        className="absolute right-6 top-6 size-24 rounded-3xl bg-brand-tint-2/40 blur-md"
      />

      {/* booking card */}
      <div className="absolute inset-x-[10%] top-[14%] rounded-2xl border border-line-soft bg-white p-4 shadow-card sm:p-5">
        {/* header row */}
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-lg bg-brand" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-3/5 rounded-full bg-line-strong" />
            <div className="h-2 w-2/5 rounded-full bg-line-soft" />
          </div>
        </div>

        {/* calendar grid */}
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {Array.from({ length: CELLS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-[5px]",
                pattern.brand.includes(i)
                  ? "bg-brand"
                  : pattern.tint.includes(i)
                    ? "bg-brand-tint-2"
                    : "bg-canvas-2",
              )}
            />
          ))}
        </div>
      </div>

      {/* step badge */}
      {badge !== undefined && (
        <div className="absolute left-1/2 top-[6%] grid size-8 -translate-x-1/2 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-btn">
          {badge}
        </div>
      )}

      {/* mono caption tag */}
      {label && (
        <div className="absolute bottom-[6%] left-[10%] rounded-md border border-line bg-white/90 px-2 py-1 font-mono text-[10px] font-medium text-muted backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
}
