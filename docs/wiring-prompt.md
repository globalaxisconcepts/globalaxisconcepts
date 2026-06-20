# Wiring Prompt — Booking SaaS (hand to the designer)

> **Use this prompt as-is.** You have the static mockups and the design system. Your job now is the **wiring layer**: connect every page, define what each interactive element does, and cover every state — so the result is a complete clickable prototype the builder can implement with no guesswork. Do **not** redesign visuals; reuse the existing mockups and tokens.
>
> **Deliverables:**
> 1. A clickable prototype where every link/button goes to its real destination (or its empty/loading/error/success variant).
> 2. A wiring annotation per page: each interactive element labeled with `action → destination/result`.
> 3. Every screen present in all required states (see "States every element must cover").
> Replace `[BRAND]` and `{company-slug}` with real values when known.

---

## 1. Global routing map (wire these exact routes)

| Route | Access | Notes |
|---|---|---|
| `/` | Public | Home |
| `/pricing` | Public | `?billing=monthly\|yearly` reflects toggle |
| `/companies` | Public | `?category=&country=` reflect filters |
| `/blogs` · `/blogs/{slug}` | Public | List + article |
| `/faqs` | Public | |
| `/contact` | Public | |
| `/page/terms-of-service` · `/page/privacy-policy` | Public | |
| `/register` | Logged-out only | Accepts `?plan={tier}` and `?trial=start` |
| `/login` | Logged-out only | |
| `/forgot-password` · `/reset-password?token=` | Public | |
| `/{company-slug}` | Public | Tenant booking microsite |
| `/{company-slug}/book` (multi-step) | Public → auth at details step | Booking flow |
| `/dashboard/**` | Auth · business role | Company management |
| `/staff/**` | Auth · staff role | Staff portal |
| `/account/**` | Auth · customer role | Customer portal |
| `/admin/**` | Auth · super-admin role | Platform owner |

**Route guards:** unauthenticated access to any auth route → redirect to `/login?redirect={attempted}`. Wrong-role access → role's own home (not a raw 403). Logged-in user hitting `/login` or `/register` → their dashboard.

---

## 2. Auth-state behavior (global header)

- **Logged out:** nav shows `Sign In` (→ `/login`) + `Get Started` (→ `/register`).
- **Logged in:** replace both with an avatar menu → `Dashboard/Portal` (role home), `Settings`, `Logout`. Hide "Get Started".
- **Logo** (everywhere) → `/`.
- **Language switcher** → swaps locale, stays on current route, persists choice.
- **Footer links** wire to the same destinations as their nav equivalents.

---

## 3. States every element must cover (apply to all pages)

For each screen, produce: **default · hover · focus-visible (keyboard) · active/pressed · disabled · loading (skeleton or spinner) · empty · error · success (toast/inline)**. Buttons that trigger async work show a loading state and are disabled while pending. Lists/grids have a defined empty state with a recovery action. Forms show inline field errors + a form-level error on failure and a success toast/redirect on success.

---

## 4. Page-by-page wiring

### Home `/`
- Hero CTA "Start 30 days trial" → `/register?trial=start`.
- Closing CTA "Get Started" → `/register?trial=start`.
- Each feature/workflow block is static (no link) unless noted.
- All nav + footer per §2.

### Pricing `/pricing`
- **Monthly/Yearly toggle** → swaps all displayed prices instantly; updates URL `?billing=`; no reload.
- Each plan's **"Select Plan"** → `/register?plan={tier}&billing={current}`.
- Free plan CTA → `/register?plan=free`.
- Feature rows render as enabled/disabled per plan (check vs muted cross).

### Companies `/companies`
- **Category** + **Country** dropdowns → filter the grid live; reflect in URL `?category=&country=`; combine (AND).
- Filters with no matches → empty state ("No companies match these filters" + "Clear filters" action).
- Each company card **"View Page"** → `/{company-slug}` (that tenant's microsite).
- Loading → skeleton cards.

### Blogs `/blogs` + `/blogs/{slug}`
- Card (image/title/excerpt) → `/blogs/{slug}`.
- Pagination → `?page=n`. Optional category/search → filters list.
- Article: share buttons (open share intents), related-post cards → their `/blogs/{slug}`.

### FAQs `/faqs`
- Accordion items expand/collapse on click (one or multiple open — pick one and apply consistently); keyboard-operable; rotate the +/× icon on open.

### Contact `/contact`
- Fields: full name, email, message — all required; email format-validated.
- **Submit** → loading → success state ("Thanks, we'll be in touch") and clears form; on failure → inline error, form retained.

### Terms / Privacy `/page/*`
- Static content; in-page anchor links if a TOC exists.

### Register `/register`
- Read `?plan=` / `?trial=start` → show selected plan/trial summary; if none, default to free/trial.
- **Company Slug**: live availability check as the user types → three inline states: *available* (green ✓), *taken* ("already taken, try another"), *illegal characters*. Submit disabled until slug is valid + available.
- **Company Name**: illegal-character validation.
- **Category**: required select.
- **Email / Phone / Password**: required; email + password rules validated inline.
- **Terms checkbox**: required; submit disabled until checked.
- **Register** → loading → success → (email verification screen if used) → **onboarding wizard** → `/dashboard`. On server error → form-level error, values retained.
- "Sign In" link → `/login`.

### Login `/login`
- Email + password; "Remember me"; **Sign In** → role home (or `?redirect=`). Invalid creds → inline error.
- "Forgot password?" → `/forgot-password`. "Register" → `/register`.
- Route role detection: business → `/dashboard`, staff → `/staff`, customer → `/account`, super-admin → `/admin`.

### Forgot / Reset password
- Forgot: email → "If that email exists, we've sent a link" (neutral, no account enumeration).
- Reset (`?token=`): new password + confirm → success → `/login`. Invalid/expired token → error + "request a new link".

---

## 5. Tenant booking microsite `/{company-slug}`
- Header "Book Now" + each service's "Book" → enter booking flow at step 1 (preselect that service when launched from a specific service).
- Nav anchors (About/Services/Gallery) scroll within page. Gallery hidden if the tenant's plan disables it.

### Booking flow `/{company-slug}/book` (multi-step — wire forward/back + guards)
1. **Service** (+ optional extras) → Next.
2. **Staff** (specific or "Any available") → Next.
3. **Date & time**: calendar shows only valid slots (staff hours − existing bookings − buffer); selecting a taken slot is impossible; if none, show "No slots — try another day". Back returns without losing prior steps.
4. **Customer details**: auth gate — *Sign in*, *Register*, or *Continue as guest* (if allowed). Carries the in-progress booking through auth without data loss.
5. **Payment**: online (Stripe/PayPal) or offline per tenant settings. Online failure → error, stay on step, allow retry. Virtual service → note that a Zoom/Meet link is generated on confirm.
6. **Confirmation**: summary + "booking confirmed"; triggers email/SMS; link to customer portal. Provide cancel/reschedule entry points per the tenant's rules.
- A progress indicator reflects the current step; browser back maps to step back.

---

## 6. Dashboards (wire nav + primary actions; match design system)

### Business dashboard `/dashboard`
- Sidebar items → their sections: Bookings, Services, Staff, Customers, Schedule, Payments, Booking-page settings, Integrations, Notifications, Plan & billing, Settings.
- KPI cards / recent-booking rows → relevant detail views.
- CRUD entries open create/edit forms (modal or page — pick one pattern) with validation, save→toast, cancel→discard confirm if dirty.
- **Plan-gating:** features above the current plan render locked with an "Upgrade" CTA → `/dashboard/billing`.
- **Usage limits:** hitting a limit (e.g., max staff) blocks the add action with an inline upgrade prompt.
- Booking statuses (pending/confirmed/completed/cancelled) change via explicit actions with confirmation on destructive ones.

### Staff portal `/staff`
- My schedule, assigned bookings (view/update status), working hours, profile. No access to billing/other staff.

### Customer portal `/account`
- Upcoming/past bookings; reschedule/cancel (enabled only within tenant rules, else disabled with reason); profile; saved payment.

### Super-admin `/admin`
- Companies, Subscription plans (builder: name, prices, limits, feature toggles, trial length), Payments/subscriptions, Site/CMS settings (logo, favicon, hero, title, colors, languages), Content (blogs/FAQs/pages/contact messages), Categories & countries, Email/SMS templates, Users/roles. Each list supports create/edit/delete with confirmations.

---

## 7. Cross-cutting wiring rules
- **Plan context persists**: `?plan=`/`?billing=` chosen on Pricing must survive into Register and into the post-signup plan summary.
- **Trial state**: during trial, dashboards show a persistent "X days left in trial — Upgrade" banner → billing.
- **Trial expiry**: on expiry, account auto-downgrades to free; gated features lock; show a one-time notice.
- **Notifications**: booking create/confirm/cancel/reminder each map to an email/SMS/WhatsApp trigger (wire the trigger points, not the templates).
- **Logout** → clears session → `/`.
- **404 / error pages** wired for unknown routes and server errors, each with a route back home.

---

## 8. Acceptance checklist (the designer confirms all before handoff)
- [ ] Every nav, footer, logo, and CTA link resolves to a real destination.
- [ ] Every button has a defined action and loading/disabled behavior.
- [ ] Every form: validation rules, inline + form-level errors, success path, redirect.
- [ ] Slug live-check shows all three states; submit gated correctly.
- [ ] Pricing toggle + plan selection carries plan into Register.
- [ ] Booking flow wired end-to-end incl. back-navigation, no-slots, payment failure, auth gate.
- [ ] Role-based route guards + redirects defined for all auth routes.
- [ ] Plan-gating and usage-limit blocks defined on dashboard.
- [ ] Empty, loading, error, and success states present on every list/form/flow.
- [ ] Trial banner, trial expiry, and logout behavior wired.
- [ ] 404 + error pages wired.
