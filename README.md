# LifeCare Hospital — Appointment Management System (MERN)

A complete, working full-stack hospital appointment management system, built
on the MERN stack:

- **Backend:** Node.js + Express, with **MongoDB** (via Mongoose) as the
  database.
- **Auth:** real signup/login with salted, hashed passwords (Node's built-in
  `crypto.scrypt` — no third-party auth library) and server-side session
  tokens stored in MongoDB.
- **Frontend:** **React** (built with Vite), talking to the backend over a
  REST API. Same blue & white design as the original.

This is a MERN conversion of a JSON-file prototype — the API surface,
booking rules and auth flow are unchanged; only the storage layer (JSON file
→ MongoDB) and the frontend (vanilla JS → React) changed.

## Deploying — the short version

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` to a
   MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas)
   cluster works fine).
2. Push this repo to your host of choice (Render, Railway, Fly.io, a VPS,
   etc).
3. Set the build command to `npm run build` and the start command to
   `npm start`, and set the `MONGO_URI` environment variable in the host's
   dashboard.
4. Deploy. The Express server serves the built React app itself, so this is
   a single web service — no separate frontend host needed.

That's it — no other code changes are required to go live.

## How the pieces fit together

```
Browser (React, built by Vite)
   │  fetch('/api/...')  +  Authorization: Bearer <token>
   ▼
Express (server/server.js)
   │  reads/writes via Mongoose
   ▼
MongoDB   (patients, sessions, appointments, doctors, departments)
```

Nothing is stored in the browser except a session token and a cached copy
of the patient's own profile (both in `localStorage`, both disposable —
the server is the source of truth).

## Project structure

```
lifecare-hospital-mern/
├── package.json            Root scripts: install/build/start both halves
├── server/                 Express API + MongoDB models
│   ├── server.js           App entrypoint — connects Mongo, mounts routes,
│   │                       serves client/dist in production
│   ├── models/             Patient, Session, Doctor, Department,
│   │                       Appointment, Meta (Mongoose schemas)
│   ├── routes/              departments, doctors, auth, appointments, stats
│   ├── middleware/auth.js  Bearer-token session middleware
│   ├── utils/               password hashing, time-slot helpers
│   ├── seed/                 reference data + one-time DB seeding
│   ├── .env.example
│   └── package.json
└── client/                 React app (Vite)
    ├── src/
    │   ├── main.jsx, App.jsx
    │   ├── api.js           fetch wrapper for the REST API
    │   ├── context/AppContext.jsx   auth, toast, modal, wizard, nav state
    │   ├── components/       Header, Footer, Modal, Toast, Icon, AuthModal
    │   └── pages/            Dashboard, Doctors, Book, Appointments
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Where an appointment actually goes, step by step

1. On the **Book an appointment** page, the wizard collects department →
   doctor → date → time → reason.
2. On confirm, the frontend calls `POST /api/appointments` with a bearer
   token in the `Authorization` header (no `patientId` is ever sent by the
   client — the server reads it from the authenticated session, so a
   patient can never book, see, or cancel on someone else's behalf).
3. `routes/appointments.js` validates the doctor works that weekday, checks
   no one else already holds that exact doctor+date+time (returns `409
   Conflict` if so), then creates a MongoDB document via
   `Appointment.create(...)`. That's the "goes to database" step — after
   this resolves, the booking survives a server restart.
4. The same collection is what every other read comes from:
   - `GET /api/appointments` (My Appointments page) — filtered to
     `patientId === req.patient.id`, derived from the session token.
   - `GET /api/appointments/today` (Dashboard's "Today's schedule") —
     all patients, no auth required, used only for the aggregate view.
   - `GET /api/doctors/:id/availability?date=` — marks a time slot
     unavailable if any non-cancelled appointment already occupies it.
5. Reschedule (`PUT /api/appointments/:id`) and cancel
   (`PUT /api/appointments/:id/cancel`) both re-check the appointment's
   `patientId` against `req.patient.id` before touching the record — a
   patient cannot modify another patient's appointment even if they
   guess/enumerate the id.

## Signup / login flow

- **Sign up** (`POST /api/auth/signup`): name, email, password (min 6
  chars), optional phone. Rejects a duplicate email with `409`. Password
  is hashed with `crypto.scryptSync` + a random salt before it's ever
  written to the database — the plaintext password is never stored.
- **Log in** (`POST /api/auth/login`): email + password, verified with
  `crypto.timingSafeEqual` against the stored hash. Wrong email and wrong
  password return the exact same `401` message on purpose, so the API
  can't be used to guess which emails have accounts.
- Both return a random 32-byte session `token` plus the patient's public
  profile (password hash never included, thanks to a `toJSON` transform
  on the Patient model). The frontend stores the token in `localStorage`
  and sends it as `Authorization: Bearer <token>` on every subsequent
  request.
- **`GET /api/auth/me`** — called once on page load if a token is stored,
  to confirm it's still valid and refresh the patient's profile. An
  invalid/expired token is cleared automatically and the UI falls back
  to "signed out" instead of showing stale data.
- **`POST /api/auth/logout`** — deletes just that one session document
  (other devices/tabs stay logged in).
- Sessions expire after 30 days (`SESSION_TTL_MS` in `server/middleware/auth.js`).

This is a minimal, dependency-light auth implementation appropriate for a
demo or learning project. Before using this for real patients, add at
minimum: HTTPS (session tokens are bearer tokens — they must never travel
over plain HTTP), rate limiting on `/api/auth/*` to slow down password
guessing, and a password-reset flow.

## Running it locally

Requires [Node.js](https://nodejs.org) 18+ and a MongoDB connection string
(a free MongoDB Atlas cluster, or `mongodb://localhost:27017/lifecare` if
you have MongoDB running locally).

```bash
# 1. Configure the database
cp server/.env.example server/.env
# then edit server/.env and set MONGO_URI

# 2. Install dependencies
npm run install:all

# 3. Run the backend (http://localhost:3000)
npm run dev:server

# 4. In a second terminal, run the frontend dev server (http://localhost:5173)
npm run dev:client
```

The Vite dev server proxies `/api/*` requests to `http://localhost:3000`
(see `client/vite.config.js`), so open **http://localhost:5173** while
developing.

On first run, the server seeds the `departments` and `doctors` collections
from `server/seed/seedData.js`, plus a handful of background demo
appointments (`isDemo: true`, no `patientId`) so doctors' calendars aren't
empty — this only happens once, guarded by a flag in the `Meta` collection.

### Production build (what `npm run build` / `npm start` do)

```bash
npm run build   # installs both halves, then builds client/ → client/dist
npm start       # node server/server.js — serves client/dist + the API on one port
```

Set `PORT` to change the port, e.g. `PORT=4000 npm start`.

## API reference

All endpoints are prefixed with `/api`. Routes marked 🔒 require
`Authorization: Bearer <token>`.

| Method | Endpoint                          | Description                                       |
|--------|------------------------------------|----------------------------------------------------|
| GET    | `/departments`                    | List all departments                               |
| GET    | `/doctors?dept=&search=`          | List doctors, optionally filtered                  |
| GET    | `/doctors/:id`                    | Get a single doctor                                |
| GET    | `/doctors/:id/availability?date=` | Get time slots + availability for a date           |
| POST   | `/auth/signup`                    | Create a patient account                           |
| POST   | `/auth/login`                     | Log in, get a session token                        |
| GET    | `/auth/me`                        | 🔒 Validate the current token, return patient info |
| POST   | `/auth/logout`                    | 🔒 Invalidate the current session token            |
| GET    | `/appointments`                   | 🔒 The logged-in patient's own appointments        |
| GET    | `/appointments/today?date=`       | Today's appointments across all patients (public)  |
| POST   | `/appointments`                   | 🔒 Book a new appointment                          |
| PUT    | `/appointments/:id`                | 🔒 Reschedule (must own the appointment)           |
| PUT    | `/appointments/:id/cancel`         | 🔒 Cancel (must own the appointment)                |
| GET    | `/stats`                           | Dashboard stats (today's count, weekly chart)      |

## Next steps you could add

- Admin role to manage doctors/departments and view all patients.
- Password reset via email, and email verification on signup.
- Rate limiting on auth endpoints.
- Email/SMS appointment reminders.
- Auto-mark past "upcoming" appointments as "completed" on a schedule
  (e.g. a MongoDB TTL job or a cron-triggered route).
