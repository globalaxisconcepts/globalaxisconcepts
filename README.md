# Global Axis Concepts

A multi-tenant appointment-booking SaaS: businesses sign up, get a branded booking
microsite, and take appointments — with a business dashboard, a staff portal, a customer
portal, and a super-admin CMS.

Built with **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**,
**Tailwind CSS v4**, and **Firebase** (Auth + Cloud Firestore) on the client SDK.

## Surfaces

| Area | Route | Who |
| --- | --- | --- |
| Marketing site | `/`, `/pricing`, `/companies`, `/blogs`, `/faqs`, `/contact` | Public |
| Tenant microsite + booking | `/[companySlug]`, `/[companySlug]/book` | Public / customers |
| Business dashboard | `/dashboard/**` | Business owners |
| Staff portal | `/staff`, `/staff/join` | Staff |
| Customer portal | `/account` | Any signed-in user |
| Super-admin + CMS | `/admin/**` | Platform owner (by email) |

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase config
npm run dev                  # http://localhost:3000
```

`npm run build` produces the production build (the same command Vercel runs).

## Environment variables

All config is the public Firebase Web SDK config (`NEXT_PUBLIC_*`, embedded in the client
bundle and secured by Firestore rules). See [`.env.example`](.env.example) for the full list.

## Deploying to Vercel

1. **Import the repo** at [vercel.com/new](https://vercel.com/new). Vercel auto-detects
   Next.js — no build settings to change (build `next build`, output handled automatically).
2. **Add the environment variables** from `.env.example` (Production, Preview & Development).
   Vercel rebuilds when you change them.
3. **Deploy.** Pushes to the default branch ship to production; every other branch/PR gets a
   preview URL.
4. **Authorize the deployed domain in Firebase** so Google sign-in works:
   Firebase Console → Authentication → Settings → **Authorized domains** → add your
   `*.vercel.app` domain (and any custom domain). `localhost` is allowed by default for dev.

## Firebase backend

- **Auth:** Email/Password + Google (client SDK). Roles live in `users/{uid}` and are
  enforced by security rules; the super-admin is bootstrapped by email.
- **Firestore:** rules in [`firestore.rules`](firestore.rules), indexes in
  [`firestore.indexes.json`](firestore.indexes.json), project in [`.firebaserc`](.firebaserc).

Deploy rules/indexes with the Firebase CLI (separate from the Vercel deploy):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

> Super-admin access is restricted to a single email, mirrored in **both**
> `firestore.rules` (`isSuperAdmin()`) and `lib/constants.ts` (`SUPER_ADMIN_EMAILS`).
> Keep them in sync.

## Notes

- The project runs on Firebase's free **Spark** plan: no Cloud Storage, Cloud Functions, or
  Admin SDK. Email/SMS notification *delivery* is therefore not wired yet — in-app
  notifications work, and delivery preferences are saved ready for a future sender.
