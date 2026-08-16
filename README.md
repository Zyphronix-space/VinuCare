# VinuCare

Full-stack pet care management platform — appointment booking, an online pet
product shop, staff/doctor/nurse dashboards, reviews, and admin analytics.

Built as a university group project (React frontend, Node/Express backend, MySQL).

## Stack
- **Frontend:** React (Vite), React Router
- **Backend:** Node.js/Express, MySQL, Socket.io (live staff notifications)
- **Auth:** Email/password + Google sign-in, password reset flow
- **Other:** Resend for transactional email, appointment reminders, DB migrations

## Features
- Customer-facing appointment booking, pet product shop, and review system
- Role-based dashboards for Doctor, Nurse, and Admin (with live analytics/charts)
- Google authentication and password reset
- Real-time staff messaging via WebSockets

## Running it
This repo intentionally excludes `.env` files (they were previously committed by
mistake and are gitignored going forward). To run locally, create `.env` in the
root and `backend/.env` with your own DB, JWT, and Resend credentials, then:

```
npm install
npm run dev          # frontend

cd backend
npm install
node server.js        # backend
```

Apply the SQL files in `backend/migrations/` to your MySQL database in order.
