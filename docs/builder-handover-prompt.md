# Builder Handover — Global Axis Concepts (multi-tenant booking SaaS)

You are building the real, production application for **Global Axis Concepts**, a multi-tenant appointment-booking SaaS (businesses sign up → get a branded booking microsite → take appointments + payments). I am handing you four reference artifacts and want you to turn them into a working app.

## What you're given (source of truth, in priority order)
1. **`Global Axis Concepts` Claude Design prototype** — the visual + interaction reference. It already implements every surface as a clickable mock. Match its layout, components, copy, and flows. **Do not copy its internals**: state is in-memory and content is placeholder. Treat it as the design contract, not the codebase.
2. **`booking-saas-design-spec.md`** — page-by-page spec with exact copy, routes, and the asset checklist.
3. **`design-system.html`** — the living style sheet. Extract tokens from here.
4. **`wiring-prompt.md`** — routing map, access levels, the 9 element states, the multi-step booking flow wiring, and plan-gating rules. This is your behavior contract.

## Product surfaces (all four must exist)
- **Marketing site:** Home, Pricing (monthly/yearly toggle), Companies directory (category + country filters, empty states), FAQs, Contact, Blog + post, Terms/Privacy.
- **Auth:** Sign In, Register (live company-slug availability check with available / taken / invalid-chars states).
- **Tenant booking microsite** at `/{company-slug}`: business profile (About/Services/Gallery) + the **6-step booking flow**: service → staff → date/time → customer details → payment → confirmation. Cover the unhappy paths from the wiring prompt: no slots, payment failure, auth gate.
- **Business dashboard:** bookings, customers, services, staff, payments, billing, integrations — with plan-gating and usage limits.
- **Super-admin dashboard:** overview, companies, plans.

## Design tokens (non-negotiable)
- Primary brand `#286efb` (hover `#1b5ce0`), backgrounds `#ffffff` / `#f7f9fc`, ink `#0f1729` / body `#5b6472`, borders `#eef1f6`/`#e6e9f0`.
- Type: **Poppins** (headings), **DM Sans** (body), **JetBrains Mono** (eyebrow labels).
- Rounded cards (12–16px), soft blue-tinted shadows, sticky blurred header. Logo mark = calendar-check icon in a blue gradient tile (placeholder — real logo TBD).

## Tech stack (use unless I say otherwise)
- **Next.js (App Router) + TypeScript**, Tailwind for the tokens above (translate the prototype's inline styles + `style-hover` into real CSS/Tailwind).
- **Postgres + Prisma**, multi-tenant by `company` with row-level scoping.
- **Auth** with role-based access (customer / staff / business-owner / super-admin) per the wiring prompt's access levels.
- **Stripe** for subscriptions (plan tiers) and **Stripe Connect** for tenant-side booking payments.
- Build **original code and original legal/FAQ/blog copy** — no nulled scripts, no scraped text.

> NOTE (build deviation agreed with the user): the backend uses **Firebase** (Auth + Cloud Firestore + Storage) instead of Postgres + Prisma, and the **frontend is built first** with mock/in-memory data; Firebase and Stripe are wired in later as the project progresses.

## Build order
Work in vertical slices, each independently runnable and reviewable:
1. Scaffold + design system (tokens, base components, layout shells, header/footer).
2. Marketing pages (static, real routes).
3. Auth + registration + slug-availability check.
4. Data layer + multi-tenant schema (companies, services, staff, bookings, customers, plans).
5. Tenant microsite + 6-step booking flow (happy path, then the unhappy paths).
6. Business dashboard (CRUD + usage limits + plan-gating).
7. Super-admin dashboard.
8. Stripe subscriptions + Connect payments.
9. Edge cases, QA against the wiring prompt's acceptance checklist, deploy.

## Definition of done per slice
Routes resolve, access guards enforced, every interactive element covers its relevant states from the wiring prompt's 9-state list, and it visually matches the prototype.

## Start here
Confirm the stack, then do slice 1: scaffold the project, set up Tailwind with the tokens above and the three font families, and build the global header + footer and a base button/card/input matching the design system. Show me the result before moving on. Ask me anything ambiguous before generating large amounts of code.
