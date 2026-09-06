# VinuCare

**Live demo:** https://witty-stone-0dc7a5c00.7.azurestaticapps.net/

A full-stack pet clinic and pet-shop platform — appointment booking, an online
product shop, a real Sri Lankan payment gateway, role-based staff dashboards,
and an AI-assisted chatbot — built as a university group project around the
operational details a real clinic actually needs, not just CRUD screens.

## What it does

**Customers** book an appointment for a service (with only genuinely free
slots shown), shop for pet products, pay online, leave reviews, message the
clinic, and get an email reminder the day before their visit.

**Doctors, Nurses, and Admins** get their own dashboards: doctors manage their
calendar and mark themselves unavailable, nurses and admins manage
products/appointments, and admins get full analytics, user management, and an
audit log of every admin action.

## Features

- **Appointment booking with real slot locking** — booking a time slot runs
  inside a database transaction so two customers can't double-book the same
  slot, and the available-times list is Sri Lanka public-holiday aware.
- **Real payment gateway (PayHere)** — server-side checkout-hash generation
  (the merchant secret never reaches the browser), webhook signature
  verification on the payment notification, and an OAuth-based status-polling
  fallback for when the webhook can't reach a local dev server. Sandbox mode
  by default; a `PAYHERE_MODE=live` env var switches to real charges.
- **AI-assisted chatbot** — a fast keyword-matched FAQ handles common
  questions instantly; anything it can't match falls back to Claude
  (Anthropic), grounded in a real VinuCare knowledge base with two tools that
  let it pull a signed-in user's *own* live appointments or orders from the
  database instead of guessing. Questions it still can't answer are logged
  for staff review.
- **Role-based dashboards** — Admin, Doctor, Nurse, and Customer, enforced
  server-side per route (not just hidden UI).
- **Pet product shop** — browsable catalogue, cart, checkout, order history.
- **Real-time staff messaging** — Socket.io-based messaging between staff.
- **Authentication** — email/password and Google Sign-In, email verification,
  and a password-reset flow, backed by Resend for the actual emails
  (verification, reminders, reset links).
- **Automated appointment reminders** — an hourly sweep emails customers the
  day before a confirmed appointment, with a `reminder_sent_at` flag so a
  failed send retries on the next pass instead of silently being skipped.
- **Reviews** for services, and an interactive clinic-location map (Leaflet).
- **Admin audit log** — every admin CRUD action against users, products, and
  banners is recorded with who did what and when.
- **Refunds** — transactions carry refund status/fields, not just a one-way
  paid flag.

### What's not there

- No automated tests yet.
- No live-hosted backend at the moment — the demo link above is the frontend
  only; run the backend locally (see below) to exercise the full app.

## Architecture

```
src/           React (Vite) SPA — hand-rolled page-switching (no router
               library), organized by area: home, services, team, shop,
               appointments, reviews, auth, payment, account, admin,
               doctor, nurse
backend/       Node.js/Express API + MySQL (raw mysql2, no ORM)
  routes/      auth, appointments, orders, payments, doctor, admin,
               messages, reviews, chatbot
  middleware/  JWT auth, per-role route guards, rate limiting
  migrations/  additive .sql files (slot locking, holidays, audit log,
               payment fields, email verification, Google auth, ...)
```

- **Backend** — Express routes call MySQL directly via `mysql2`, no ORM
  layer. Migrations are additive, timestamped `.sql` files applied in order
  (see `backend/migrations/`), which is how features like slot locking,
  refunds, and the audit log were added over time without a destructive
  schema rewrite.
- **Auth** — JWT in an httpOnly cookie, checked by `authMiddleware.js`;
  `requireRole('Admin', 'Nurse')`-style middleware gates routes per role
  server-side. A `bootId` embedded in each token invalidates tokens issued by
  a previous server process (e.g. after a redeploy) instead of trusting a
  stale token indefinitely.
- **Payments** — `routes/payments.js` looks up the authoritative amount from
  the `orders`/`appointments` table itself (never trusts an amount the
  browser sends), generates the PayHere checkout hash server-side, verifies
  the `md5sig` on the notify webhook before marking anything paid, and writes
  a `transactions` row so admin revenue analytics stay in sync.
- **Chatbot** — `routes/chatbot.js`: the frontend's fast keyword matcher
  handles the common FAQs (kept in `chatbotKnowledge.js`); unmatched
  questions go to Claude with that same knowledge base as grounding, plus
  `get_appointment_status` / `get_order_status` tools scoped to the
  logged-in user's own data.
- **Real-time** — `socket.js` (Socket.io) powers live staff messaging.

## Tech stack

**Frontend:** React 19 (Vite) · Leaflet (map) · Recharts (admin analytics) ·
jsPDF · Socket.io client

**Backend:** Node.js / Express · MySQL (`mysql2`) · JWT (`jsonwebtoken`) +
`bcryptjs` · Google Sign-In (`google-auth-library`) · Resend (transactional
email) · Socket.io · `express-rate-limit`

**Payments:** PayHere (Sri Lanka) — sandbox by default

**AI:** Claude (Anthropic Messages API, tool-calling)

## Running it locally

This repo intentionally excludes `.env` files (an earlier commit accidentally
included them; they're gitignored going forward). Create `.env` in the root
and `backend/.env` with your own DB, JWT, Resend, Google, and PayHere
credentials, then:

```
npm install
npm run dev            # frontend

cd backend
npm install
node server.js          # backend
```

Apply the SQL files in `backend/migrations/` to your MySQL database in order
before starting the backend.

## Screenshots

_Not yet added — the app itself has plenty of content imagery (product
photos, service photos) but no captured UI screenshots yet. Good candidates
to add here: the customer appointment-booking flow, the Admin dashboard
analytics, and the chatbot in action._

## Future improvements

- Automated backend tests (none exist yet)
- A live-hosted backend for the demo (currently frontend-only)
- Live Koko "Pay Later" integration (the route exists and returns a clear
  "not available yet" response — no business BNPL onboarding for a student
  project)
