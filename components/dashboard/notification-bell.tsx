"use client";

import * as React from "react";
import { Bell, Check, Loader2, CalendarDays } from "lucide-react";
import {
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/firebase/notifications";
import { cn } from "@/lib/utils";

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return ref;
}

function timeAgo(ms: number | null) {
  if (!ms) return "just now";
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function NotificationBell({
  companyId,
  fetcher,
}: {
  companyId: string;
  fetcher: () => Promise<AppNotification[]>;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<AppNotification[] | null>(null);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const load = React.useCallback(() => {
    fetcher().then(setItems).catch(() => setItems([]));
  }, [fetcher]);

  React.useEffect(() => load(), [load]);

  const unread = items?.filter((n) => !n.read).length ?? 0;

  const onOpen = () => {
    setOpen((o) => !o);
    if (!open) load();
  };

  const readOne = async (n: AppNotification) => {
    if (n.read) return;
    setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? prev);
    try {
      await markNotificationRead(companyId, n.id);
    } catch {
      load();
    }
  };

  const readAll = async () => {
    const ids = items?.filter((n) => !n.read).map((n) => n.id) ?? [];
    if (!ids.length) return;
    setItems((prev) => prev?.map((x) => ({ ...x, read: true })) ?? prev);
    try {
      await markAllNotificationsRead(companyId, ids);
    } catch {
      load();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onOpen}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-btn border border-line text-ink-700 transition-colors hover:border-brand/40 hover:text-brand"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-[18px] text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-rise absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-card border border-line bg-surface shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink-800">Notifications</p>
            {unread > 0 && (
              <button onClick={readAll} className="text-xs font-semibold text-brand hover:text-brand-dark">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items === null ? (
              <div className="flex justify-center py-10 text-muted"><Loader2 className="size-5 animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-canvas-2 text-muted">
                  <CalendarDays className="size-5" />
                </span>
                <p className="text-sm text-muted">You&apos;re all caught up.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => readOne(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas-2",
                        !n.read && "bg-brand-tint/40",
                      )}
                    >
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand")} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-semibold text-ink-800">{n.title}</span>
                          <span className="shrink-0 text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] text-body">{n.body}</span>
                      </span>
                      {n.read && <Check className="mt-1 size-3.5 shrink-0 text-muted" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
