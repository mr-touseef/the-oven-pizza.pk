# The Oven Pizza — Website

Production-ready website for **The Oven Pizza** (Zahid Iqbal Chowk, Chichawatni),
built with Next.js (App Router), TypeScript, Tailwind CSS and PostgreSQL via
Prisma. The full menu — pizzas, burgers & wraps, shawarma/wings/sides,
coffee/drinks/desserts, and the Happy Student Deals — is stored in a real
database and rendered server-side.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS, custom design tokens |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod (client + server) |
| Deployment | Vercel |

No local filesystem writes, no in-memory arrays as a database, no fake data —
all dynamic content (menu, deals, form submissions, newsletter signups) is
read from and written to Postgres through Prisma.

## Project structure

```
prisma/
  schema.prisma        Database schema (menu, deals, inquiries, subscribers)
  seed.ts               Seeds the full real menu + deals into the database
src/
  app/
    api/contact/route.ts       POST — order/reservation/feedback inquiries
    api/newsletter/route.ts    POST — "Stay Tuned" email signups
    layout.tsx, page.tsx       Root layout + homepage (Server Component, reads DB)
    not-found.tsx, error.tsx, loading.tsx
    sitemap.ts, robots.ts      SEO
    globals.css
  components/            Navbar, Hero, MenuSection, DealsSection, ContactForm, etc.
  lib/                   Prisma client singleton, Zod schemas, rate limiter, types
public/
  videos/                Put your background video here (see below)
  images/                Reference photos + generated icons
  site.webmanifest
```

## 1. Prerequisites

- Node.js 18.18+ and npm
- A PostgreSQL database. Any provider works: [Neon](https://neon.tech),
  [Supabase](https://supabase.com), [Railway](https://railway.app), or your
  own Postgres instance.

## 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via `postinstall`.

## 3. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled/runtime Postgres connection string |
| `DIRECT_URL` | Yes | Direct (non-pooled) connection string, used by `prisma migrate` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL, used for SEO/OG/sitemap |
| `NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY` | Recommended | Shown in navbar, hero, footer, JSON-LD |
| `NEXT_PUBLIC_RESTAURANT_PHONE_SECONDARY` | Recommended | Same as above |
| `NEXT_PUBLIC_RESTAURANT_ADDRESS` | Recommended | Shown in contact section + JSON-LD |
| `FORM_SIGNING_SECRET` | Yes | Random secret reserved for future signed-token anti-spam use |
| `ALLOWED_ORIGINS` | Optional | Comma-separated extra origins allowed to call the API |

**Never commit `.env`.** It's already covered by `.gitignore`.

## 4. Set up the database

```bash
npx prisma migrate dev --name init   # creates tables from schema.prisma
npm run db:seed                      # loads the real menu + deals
```

`npm run db:seed` is idempotent — categories are upserted by slug and their
items are fully replaced each run, so re-seeding after editing
`prisma/seed.ts` always leaves the database matching the file.

Useful commands:

```bash
npx prisma studio        # visual database browser
npx prisma validate      # validate schema.prisma
npm run db:deploy        # apply migrations in production (no prompts)
```

## 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 6. Background video

The site plays a full-screen looping background video behind all content.
Add your own file at:

```
public/videos/background.mp4     (required)
public/videos/background.webm    (optional, smaller/faster)
```

See `public/videos/README.md` for recommended length/resolution. Until a
real file is added — or if the video fails to load in a visitor's browser —
`src/components/BackgroundVideo.tsx` automatically falls back to
`public/images/hero-food.png`, so the layout never breaks.

## 7. Quality checks before deploying

```bash
npm run lint          # ESLint (next/core-web-vitals rules)
npm run typecheck      # tsc --noEmit
npx prisma validate    # schema correctness
npm run build           # production build (runs `prisma generate` first)
```

Fix any errors these report before deploying — don't ship a build with
red flags in the terminal.

## 8. Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel: **New Project → Import** your repo.
3. Framework preset: Next.js (auto-detected).
4. Add the environment variables from `.env.example` in **Project Settings →
   Environment Variables** (use your real Postgres credentials — the same
   `DATABASE_URL`/`DIRECT_URL` pair you used locally, or your production
   database).
5. Deploy. Vercel runs `npm run build`, which runs `prisma generate` first.
6. **Run migrations against your production database** the first time (and
   after any schema change) — either:
   - Locally: `DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy`, or
   - As a one-off Vercel deployment step / CLI command.
7. Seed production data once: `DATABASE_URL=... npm run db:seed`.
8. Add `public/videos/background.mp4` to the repo (or upload after deploy and
   redeploy) to replace the image fallback with a real video.

The app has no dependency on the local filesystem at runtime and uses only
serverless-compatible APIs, so it deploys cleanly to Vercel's Edge/Node
serverless functions.

## Updating from a previous copy of this project

This version moves **branches** into the database and adds a **persisted
checkout** (orders), on top of the earlier cart/deals update. If you already
have a database seeded from an earlier copy:

```bash
npx prisma migrate dev --name add-branches-and-orders
npm run db:seed
```

This adds the `Branch`, `Order` and `OrderLine` tables and seeds the three
branch locations. Re-running `npm run db:seed` is always safe — branches are
upserted by `slug`, and deals/menu items are fully replaced each run.

### What's database-backed now

- **Branches** — `Branch` model, seeded from `prisma/seed.ts`, fetched by
  `src/lib/branches.ts` (`getBranches()`, request-deduplicated via React's
  `cache()`). Edit the `branchSeeds` array in `prisma/seed.ts` and re-run
  `npm run db:seed` to add/change locations — or edit rows directly with
  `npx prisma studio`.
- **Orders** — placing an order from `/cart` (the "Place Order" button) posts
  to `POST /api/orders`, which **re-derives every line's real name and price
  from the database** (it never trusts the price the browser sent), computes
  the subtotal/discount/total server-side, and writes an `Order` with nested
  `OrderLine` rows. View placed orders with `npx prisma studio` or a future
  admin page.
- The **cart itself** is still intentionally client-side (React Context +
  `localStorage`) — it's a scratch pad for building an order before you place
  it, not the order record itself. Once "Place Order" succeeds, the real,
  price-verified record lives in Postgres.

## Features

- Full menu (pizzas, burgers & wraps, shawarma/wings/sides, coffee/drinks/
  desserts) and 7 combo/student deals — each deal lists its included items —
  all sourced from the database.
- **Branches**: three locations, each with its own "Get Directions" button
  that opens Google Maps directions to that specific address. Branch data
  lives in `src/data/branches.ts` — edit that file to add/remove locations.
- **Cart**: every menu item with multiple sizes shows one button per size
  (Small/Medium/Large, 5pc/10pc, Half/Full, etc.), each adding its own
  distinct cart line; re-adding the same item+size increases quantity
  instead of duplicating. Cart state lives in React Context
  (`src/context/CartContext.tsx`) and persists to `localStorage`, so it
  survives page navigation and refreshes for the length of the browser
  session.
- **Add-to-cart confirmation**: every "Add to Cart" trigger — pizzas,
  burgers, drinks, sides, deals — opens a small Yes/Cancel confirmation
  before adding.
- **Cart page (`/cart`)**: quantity +/- controls, remove line, a live
  discount-percentage field that recalculates the total as you type, and a
  "Print Receipt" button that uses the browser's native `window.print()`
  with a dedicated print stylesheet — the printed page shows only a clean
  receipt (no navbar, footer, or background video).
- Order/reservation/feedback contact form — client + server (Zod) validation,
  honeypot spam field, per-IP rate limiting, persisted to Postgres.
- "Stay Tuned" newsletter signup, persisted to Postgres.
- Full-screen looping background video with overlay, poster and image/color
  fallback.
- Responsive from small phones to large desktop monitors.
- Accessible: semantic landmarks, labelled form fields with live error text,
  visible focus states, skip-to-content link, `prefers-reduced-motion`
  support, alt text on all meaningful images, accessible confirm dialogs
  (focus management, Escape to close).
- SEO: per-page metadata, Open Graph/Twitter cards, `sitemap.xml`,
  `robots.txt`, per-branch Restaurant JSON-LD structured data, favicon and
  web app manifest.
- Custom 404 page, route-level error boundary with retry, and a loading
  state.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`), server-side input validation on
  every API route, and no secrets in client-exposed code.

## Branch admin (`/admin`)

Each branch has its own login at `/admin/login` and can only ever see and
update the orders placed for that branch — there's no shared "super admin"
account, and the orders API/query is always scoped server-side to the
logged-in branch's ID, never a client-supplied one.

- **Default usernames** (seeded in `prisma/seed.ts`): `mian-channu`,
  `sahiwal`, `fateh-sher`, `chichawatni`.
- **Default password** for every branch: `TheOven@2026` — change this before
  going live. There's no in-app "change password" screen yet; either edit
  `DEFAULT_ADMIN_PASSWORD` in `prisma/seed.ts` and re-run `npm run db:seed`,
  or update a branch's `passwordHash` column directly using
  `hashPassword()` from `src/lib/crypto.ts`.
- Sessions are a signed, httpOnly cookie (12-hour expiry) — set
  `ADMIN_SESSION_SECRET` in your environment (see `.env.example`) before
  deploying; without it, sessions fall back to an insecure dev-only secret.
- On the orders dashboard, the branch's own phone number(s) — `Branch.phone`
  / `Branch.phone2` — are shown at the top, and each order's status can be
  updated in place (Pending → Confirmed → Preparing → Completed/Cancelled).

## Menu item photos

`MenuItem.imageUrl` (optional) shows a thumbnail next to that item on the
menu. Images used for the initial seed live in `public/images/menu-items/`,
cropped from the provided menu graphics. To add or change a photo, drop a
new image into that folder and set `imageUrl` on the item in
`prisma/seed.ts` (or update the row directly in the database), e.g.
`imageUrl: "/images/menu-items/crown-crust.jpg"`.

## Known limitations to be aware of

- The cart itself is intentionally client-side (React Context +
  `localStorage`), representing an in-progress, anonymous session cart. Once
  "Place Order" is submitted, it becomes a real, price-verified `Order` row
  in Postgres (see above) — so nothing important is lost by keeping the cart
  itself client-side.
- There's no authentication/admin panel to view/manage placed `Order` rows
  or update their `status` (PENDING → CONFIRMED → ...) from a UI — use
  `npx prisma studio` for now. A password-protected `/admin/orders` page is
  a natural next addition; the schema already supports it.
- Branch photos currently reuse existing site imagery as placeholders (no
  real branch photos were provided) — update `photoUrl` for each row (via
  `prisma/seed.ts` or Prisma Studio) with real photos when available.
- The in-memory rate limiter in `src/lib/rate-limit.ts` is best-effort per
  serverless instance, not a distributed limiter. For heavier abuse
  protection at scale, swap it for a shared store such as Upstash Redis.
- No authentication/admin panel is included for `Inquiry` and
  `NewsletterSubscriber` rows either — same as `Order`, use `npx prisma
  studio`, or a follow-up admin page can be added for all three (Prisma
  models are already in place to support it).
- This project was written and reviewed file-by-file in an offline sandbox
  without network access, so `npm install`, `npm run build`, `npm run lint`
  and `npx prisma generate` have **not** been executed end-to-end. Run the
  commands in section 7 yourself the first time, in an environment with
  internet access, and fix anything they report before deploying.
