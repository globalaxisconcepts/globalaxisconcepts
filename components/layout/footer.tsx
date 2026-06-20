import Link from "next/link";
import { Globe } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BRAND, FOOTER_COLUMNS, SOCIALS } from "@/lib/constants";

type IconProps = { className?: string };

// lucide-react dropped brand glyphs, so we ship our own minimal SVGs.
const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
  </svg>
);
const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.656l-5.214-6.817-5.966 6.817H1.683l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);
const LinkedinIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM0 8h5v16H0V8Zm7.5 0H12v2.2h.07c.63-1.2 2.18-2.46 4.49-2.46C21.4 7.74 24 10 24 14.6V24h-5v-8.3c0-2-.04-4.55-2.77-4.55-2.78 0-3.2 2.16-3.2 4.4V24h-5V8Z" />
  </svg>
);
const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const iconMap = {
  facebook: FacebookIcon,
  x: XIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
} as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* brand column */}
          <div className="max-w-sm">
            <Logo variant="light" href="/" />
            <p className="mt-5 text-sm leading-relaxed text-white/55">
              {BRAND.descriptor}
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((s) => {
                const Icon = iconMap[s.icon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-9 place-items-center rounded-lg bg-white/8 text-white/70 transition-colors hover:bg-brand hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-sm text-white/50">
            © 2026 All rights reserved. | {BRAND.name}
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
            <Globe className="size-4" />
            English (en)
          </span>
        </div>
      </div>
    </footer>
  );
}
