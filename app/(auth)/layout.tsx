import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BookingScene } from "@/components/illustrations/booking-scene";
import { ToastProvider } from "@/components/ui/toast";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* brand panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-12 text-white lg:flex">
          <div className="absolute -right-16 top-10 size-72 rounded-full bg-white/10" />
          <div className="absolute -left-10 bottom-0 size-72 rounded-full bg-white/10" />
          <Logo variant="light" href="/" />
          <div className="relative">
            <h2 className="max-w-sm font-display text-3xl font-bold leading-tight">
              Grow your business with smart booking
            </h2>
            <ul className="mt-6 space-y-3">
              {["14-day free trial, all features", "No credit card required", "Cancel anytime"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2.5 text-white/90">
                    <span className="grid size-5 place-items-center rounded-full bg-white/20">
                      <Check className="size-3.5" />
                    </span>
                    {t}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-10 max-w-sm">
              <BookingScene label="your booking page" />
            </div>
          </div>
          <p className="relative text-sm text-white/60">© 2026 Global Axis Concepts</p>
        </aside>

        {/* form column */}
        <main className="flex flex-col">
          <div className="flex items-center justify-between p-6">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              href="/"
              className="ml-auto text-sm font-medium text-muted transition-colors hover:text-brand"
            >
              ← Back to site
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 pb-14">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
