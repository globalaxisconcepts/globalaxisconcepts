# Booking SaaS — Complete Design Specification

> A full visual + structural spec for a multi-business service booking platform, modeled on the reference site. Hand this to a design agent to produce a high-fidelity replica. Replace `[BRAND]` with the final product name and swap placeholder copy where noted.

---

## 0. Product summary (context for the designer)

A SaaS platform where **businesses sign up, get a branded booking microsite, and accept appointments + payments from their customers.** There are four audiences and therefore four distinct UI surfaces:

1. **Marketing site** (public — what most of this spec covers) — sells the platform to business owners.
2. **Tenant booking microsite** (public, per business) — where end-customers actually book.
3. **Business/company dashboard** (logged-in) — where a business manages services, staff, bookings.
4. **Super-admin dashboard** (logged-in, platform owner) — runs the whole SaaS.

The marketing site is the priority for "replica" fidelity. Dashboards should match the same design system.

---

## 1. Brand & visual system

**Primary color:** `#286efb` (bright royal blue). Used for primary buttons, links, active states, icon accents, and the browser theme color.

**Suggested palette (extend from the primary):**
- Primary blue `#286efb`, primary-dark (hover) `#1b5ce0`, primary-tint (backgrounds) `#eaf1ff`
- Ink / headings `#0f1729` to `#1a2233`
- Body text `#5b6472`
- Muted / captions `#9aa3b2`
- Borders / dividers `#e6e9f0`
- Surface white `#ffffff`, off-white section bg `#f7f9fc`
- Success green, warning amber, error red for dashboard states

**Typography:** Clean geometric sans (Poppins, Inter, or DM Sans). Headings semi-bold/bold with tight leading; body regular at comfortable line-height (1.6). Large hero headline (~48–60px desktop), section titles ~32–36px, card titles ~18–20px.

**Aesthetic:** Light, airy, friendly SaaS. White backgrounds, generous whitespace, soft rounded corners (12–16px on cards, 8–10px on buttons/inputs), subtle soft shadows (low-opacity blue-grey). Flat **vector illustrations** (people + workspace/finance/scheduling scenes, the friendly "corporate Memphis / freepik" style) for hero and feature sections — NOT photos. Simple line/duotone SVG icons for feature tiles.

**Buttons:** Pill or lightly-rounded rectangles. Primary = solid blue, white text. Secondary = outline blue or ghost. Generous padding.

**Logo:** Square/circular mark, top-left. Pair mark + wordmark in header; mark alone where space is tight.

**Spacing/grid:** 12-column responsive grid, max content width ~1140–1200px, consistent vertical section rhythm (80–120px section padding desktop, ~48px mobile).

---

## 2. Global elements

### 2.1 Header / top navigation (sticky)
- Left: logo (links home).
- Center/left nav links: **Home · Pricing · Companies · Blogs · FAQs · Contact**
- **Pages** dropdown → Terms and Conditions, Privacy Policy
- **Language** switcher dropdown (shows current lang code e.g. "en"; menu lists available languages, e.g. English)
- Right: **Sign In** (ghost/text button) and **Get Started** (solid primary button)
- Mobile: collapses to a hamburger; nav items + auth buttons stack in a drawer.

### 2.2 Footer (every marketing page)
- Left column: logo + descriptor paragraph: *"[BRAND] is a complete SaaS based multi business service booking software, that gives your users the ability to create and manage bookings, staffs, services, customers, etc."* + social icons (Facebook, Twitter/X, LinkedIn, Instagram).
- Column "**Services**": Pricing, Blogs, FAQs, Contact
- Column "**Pages**": Terms and Conditions, Privacy Policy
- Bottom bar: `© 2026 All rights reserved. | [BRAND]`

---

## 3. Marketing pages

### 3.1 Home (`/`)

**Section A — Hero**
- Small eyebrow text: *"One Platform For any Business"*
- H1: **"Smart booking tool to grow your online business"**
- Subtext: *"[BRAND] appointment booking, helping you to manage business in a smart way."*
- Primary CTA button: **"Start 30 days trial"** → `/pricing?trial=start`
- Right side: large friendly vector illustration (person + booking/scheduling theme).
- Layout: two-column desktop (copy left, illustration right), stacked on mobile.

**Section B — Feature highlights (4-up icon grid)**
- Section heading: *"The best solution to start your online business with powerful features"*
- Four cards, each = SVG icon + title + one line:
  1. **Booking Website** — "You will get a ready to use booking site after signup in [BRAND]"
  2. **Accept online bookings** — "Accept bookings from your clients using your own booking site."
  3. **Staff & Client Portal** — "Your Staffs & Clients will get access to their own portal."
  4. **Accept Payments** — "Accept Online / Offline payments from your clients."

**Section C — Workflow ("how it works")**
- Heading: *"Workflow"* / subhead "Look at a glance how our system works"
- Three steps, each illustration + caption:
  1. (website image) "Customize your appointment schedule and booking page."
  2. (link image) "Share your personal booking page with your customers & prospects."
  3. (schedule image) "Your customers & prospects book an available time with you"
- Layout: 3 horizontal steps desktop (consider connecting arrows/dotted line), stacked mobile.

**Section D — Alternating feature rows** (image one side, text other; alternate sides each row)
1. **"Create your own booking page that is branding your business"** — "Customise and branding your business to share your booking page with a smart URL which will help you to run your business a smart way."
2. **"Accept bookings from anywhere anytime"** — "There are no boundary for your business, Share your booking page URL using any social platform email or others to booking your services from anywhere in the world."
3. **"Connect with your customers all around the world using zoom meeting"** — "Integrate with Zoom, So you can easily manage your Virtual Meetings and Classes right from [BRAND]." *(Note: scrub any leftover third-party brand name from copy.)*
4. **"Accept Online / Offline Payments from your Customers"** — "Easily process your payments online in a secure manner, Select from Payment Processors like PayPal, Stripe and offline."
- Each row uses a duotone vector illustration.

**Section E — Closing CTA band**
- Heading: *"Start using [BRAND] account"*
- Subtext: *"Sign up for our 14-day trial with all features. No credit card required."*
- Button: **"Get Started"** → `/register?trial=start`
- Full-width tinted/colored band to stand out.

**Then:** global footer.

---

### 3.2 Pricing (`/pricing`)
- Heading: **"Small Business — friendly Pricing"**
- Subtext: *"We're offering a generous Free Plan and affordable Standard & Premium pricing plans that will help you to grow with"*
- **Billing toggle:** Monthly / Yearly switch (updates displayed prices live).
- **Plan cards** (3 tiers: Free, Standard, Premium — highlight the recommended one with a colored border/"Popular" ribbon). Each card shows: plan name, price (with the per-month / per-year / lifetime variants), a feature/limits list, and a **"Select Plan"** button → `/register?plan={planname}`.
- Limits shown per plan (numbers are configurable by platform owner): **Customers, Staffs, Services, Appointments** counts, plus feature toggles: **Gallery, Get Online Payments, Virtual Meeting (Zoom/Google Meet), Google Calendar Sync, Custom domain.** Use check/cross or enabled/disabled styling per plan.
- Reference values seen: Standard ≈ $35.50/mo (200 customers, 20 staff, 20 services, 20 appointments); Premium ≈ $55.50/mo (higher/unlimited limits, 200 services). Treat as placeholders.

---

### 3.3 Companies (`/companies`) — public business directory
- Heading: **"Company Lists"**
- **Two filter dropdowns:**
  - **Category:** All Categories, Other, Personal meetings and services, Law & Consultancy, Events and entertainment, Educations, Medical, Beauty and wellness, Sport & Gym
  - **Country:** "All Countries" + full ISO country list (~200 entries).
- **Results grid:** company cards — each shows logo/avatar, company name, category tag, and a **"View Page"** button linking to that tenant's booking microsite. Responsive card grid (3–4 cols desktop → 1 col mobile).
- Empty/zero-state for filters with no matches.

---

### 3.4 Blogs (`/blogs`)
- **List view:** grid of blog cards (featured image, title, excerpt, date/author, "Read more"). Pagination at bottom. Optional category/search sidebar.
- **Detail view (`/blogs/{slug}`):** hero image, title, meta (author, date), article body (rich text), share buttons, related posts. Keep typography clean and readable (max ~720px text column).

---

### 3.5 FAQs (`/faqs`)
- Heading: **"Frequently Asked Questions"**
- **Accordion** list (click to expand/collapse). Seed questions + answers present on the reference:
  1. **How does the free trial work?** — 14-day trial is 100% free, no credit card; at the end you can upgrade or auto-downgrade to the free plan.
  2. **Do I need to choose a plan now?** — No; full unlimited version free for 14 days, choose a plan when ready.
  3. **What is an online booking system?** — explains an online interface for customers to book services as appointments, with buffer time / recurring options and brandable booking pages.
  4. **What is an online appointment?** — a booking made via the system; the appointment itself may happen by phone or in person.
  5. **How do I set up an online booking?** — use the free scheduling tool, get a brandable booking page, integrate with your own website.
- *(Rewrite answers in your own brand voice; scrub leftover third-party brand names.)*

---

### 3.6 Contact (`/contact`)
- Heading: **"Get In Touch"**
- **Form fields:** Your full name, Your email, Message (textarea), **Submit** button.
- Optional: supporting illustration or contact details (email/phone/address) beside the form, and a success toast on submit.

---

### 3.7 Legal pages (`/page/terms-of-service`, `/page/privacy-policy`)
- Simple static content layout: page title + long-form rich-text body, readable single column, last-updated date. (Write original legal copy — do not copy the reference site's text.)

---

## 4. Authentication

### 4.1 Register company (`/register`)
- Heading: **"Register your company"** / subtext "Basic information, You can add more later".
- **Fields:**
  - **Company Slug** * — inline prefix shows `[yourdomain]/` then the slug input. Live availability check with three states: *"…contains illegal characters."*, *"This name is already taken, try another one."*, *"Name is available."* Note: *"Related to url & cannot be changed."*
  - **Company Name** * (with illegal-character validation)
  - **Categories** * — select (Beauty and wellness, Educations, Events and entertainment, Law & Consultancy, Medical, Other, Personal meetings and services, Sport & Gym)
  - **Company Details** (optional text)
  - **Email** *, **Phone** *, **Password** *
  - Checkbox: "I have read and understood the **Terms and Conditions** and **Privacy Policy**."
  - **Register** button.
  - Footer link: "Already have an account? **Sign In**"
- Often deep-linked with `?plan={tier}` or `?trial=start` to preselect the chosen plan.
- Layout: form in a centered card; optional brand/illustration panel beside it.

### 4.2 Login (`/login`)
- Email + Password fields, "Remember me", **Sign In** button, "Forgot password?" link, and a link to Register. Same centered-card layout. (Also supports staff/customer logins routed to their portals.)

---

## 5. Tenant booking microsite (public, per business)

Each registered business gets a public page at `/{company-slug}`. This is the customer-facing booking experience and should be themeable per tenant (their logo/colors). Structure:
- **Business header:** logo, business name, **"Book Now"** CTA, nav (About / Services).
- **About section:** business description.
- **Services list:** each service = name, duration, price, "Book" button.
- **Booking flow (multi-step):**
  1. Select service (and any add-on "service extras").
  2. Select staff member (optional / "any").
  3. Pick date + available time slot (calendar; availability = staff working hours − existing bookings − buffer time).
  4. Enter customer details / sign in or register as customer.
  5. Choose payment (online via Stripe/PayPal, or offline) and confirm.
  6. Confirmation screen + email/SMS notification; optional Zoom/Meet link for virtual services.
- **Gallery** (if enabled by plan). Footer mirrors the brand footer pattern.

---

## 6. Dashboards (logged-in app — match the design system)

### 6.1 Business / company dashboard
Sidebar nav + topbar shell. Modules:
- **Dashboard home:** KPI cards (today's bookings, revenue, upcoming appointments), recent bookings table, mini calendar/charts.
- **Bookings:** calendar + list views; create/edit/cancel; statuses (pending, confirmed, completed, cancelled); buffer time, deposits, cancellation rules.
- **Services:** CRUD; price, duration, category, extras, description, image.
- **Staff:** CRUD; working hours, break times, assigned services; each staff gets a portal login.
- **Customers:** list/CRUD, history, notes.
- **Schedule / working hours:** per-business and per-staff availability.
- **Payments:** transactions, payment gateway settings (Stripe, PayPal, offline), currency.
- **Booking page settings:** branding (logo, colors, hero, slug), gallery, custom domain (plan-gated).
- **Integrations:** Zoom / Google Meet, Google Calendar sync.
- **Notifications:** email/SMS/WhatsApp templates and triggers.
- **Plan & billing:** current plan, usage vs limits, upgrade.
- **Settings / profile.**

### 6.2 Staff portal
Pared-down view: own schedule, assigned bookings, working hours, profile.

### 6.3 Customer portal
Customer's own upcoming/past bookings, reschedule/cancel (per rules), profile, saved payment.

### 6.4 Super-admin (platform owner) dashboard
- Overview KPIs (total companies, revenue, active subscriptions).
- **Companies/tenants** management.
- **Subscription plans** builder: name, prices (monthly/yearly/lifetime), limits (customers/staff/services/appointments), feature toggles (gallery, online payments, virtual meeting, calendar sync, custom domain), trial length.
- **Payments / subscriptions** ledger; payment gateway config.
- **Site/CMS settings:** logo, favicon, hero image, site title/description, colors, languages.
- **Content:** blogs, FAQs, pages (terms/privacy), contact messages.
- **Categories & countries**, **email/SMS templates**, **users/roles**.

---

## 7. Responsive & states (apply globally)
- Breakpoints: mobile ≤640, tablet 641–1024, desktop ≥1025. Mobile-first.
- All grids collapse to single column on mobile; nav → hamburger drawer.
- Provide: hover/focus/active states, form validation styling (inline error text + colored borders, matching the slug-availability pattern), loading skeletons, empty states, success/error toasts, and disabled states for plan-gated features.
- Accessibility: AA contrast, visible focus rings, labelled inputs, keyboard-navigable accordions/dropdowns.

---

## 8. Asset checklist for the designer
- Logo (mark + wordmark), favicon, theme color `#286efb`.
- Hero illustration + ~4 feature-row illustrations + 3 workflow images (friendly flat vector style).
- ~4 feature-tile SVG icons (web, calendar, profile, payment/valid).
- Social icons. Default company avatar/placeholder. Blog placeholder image.
- Empty-state and confirmation illustrations.

---

## 9. Page inventory (quick reference)
| Surface | Route | Purpose |
|---|---|---|
| Marketing | `/` | Home / landing |
| Marketing | `/pricing` | Plans + billing toggle |
| Marketing | `/companies` | Public business directory + filters |
| Marketing | `/blogs`, `/blogs/{slug}` | Blog list + article |
| Marketing | `/faqs` | FAQ accordion |
| Marketing | `/contact` | Contact form |
| Marketing | `/page/terms-of-service`, `/page/privacy-policy` | Legal |
| Auth | `/register`, `/login` | Company signup + sign in |
| Tenant | `/{company-slug}` | Public booking microsite + flow |
| App | business / staff / customer / super-admin dashboards | Logged-in management |

---

*Notes for the agent: keep the look light, blue-accented, illustration-led, and uncluttered. Prioritize pixel-fidelity on Home, Pricing, Companies, FAQs, Contact, and Register first; carry the same system into the booking microsite and dashboards.*
