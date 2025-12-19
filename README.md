# Aurora Event Collective — Backend

## Overview

This repository contains the backend for the Aurora Event Collective application. It provides APIs for the frontend to consume — handling things like event creation/listing, calendar-click counters, data storage, and more.

## Tech Stack

- Server: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Environment: `.env` for secrets and config
- Runtime: `tsx` (used for running TypeScript ESM files in development)

## Project Structure

```
backend/
│
├── src/ # main source files
│ ├── controllers/ # request handlers (business logic)
 │ ├── routes/ # API endpoint definitions
 │ ├── models/ # Database schema helpers
 │ ├── config/ # Configuration (DB connection, env variables)
 │ ├── middleware/ # Middleware (auth, validation, error handling, logging)
 │ ├── utils/
 │ └── lib/ # lightweight helpers (e.g., `prisma.ts`)
│
├── generated/ # Prisma generated client output
├── prisma/ # Prisma schema & migrations
├── .env.example # sample environment variables
├── package.json # dependencies & scripts
├── server.js # small express server for counters
└── README.md # this file
```

---

## Installation & Setup

1. Clone the repository

```bash
git clone <repo-url>
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Duplicate the example env:

```bash
copy .env.example .env    # Windows (PowerShell/CMD)
# or on bash/mac
# cp .env.example .env
```

4. Generate Prisma client (if you change the schema)

```bash
npx prisma generate
```

5. Start development server

```bash
# run with tsx so TypeScript ESM imports work
npx tsx server.js
```

---

## API Testing (Postman & curl)

**Purpose:** test the calendar counter API that tracks "Add to Google Calendar" and "Add to Apple Calendar" clicks for a given event.

**Base URL**: `http://localhost:5000` (server listens on port `5000` by default)

### Endpoints

- `GET /health` — health check
- `GET /events/:id/stats` — returns all `CalendarStat` rows for the event
- `POST /events/:id/click` — increment counter for a platform. JSON body: `{ "platform": "google" }` or `{ "platform": "apple" }`.

### Example curl requests

- Health check

```bash
curl http://localhost:5000/health
```

- Increment Google counter for event `lumenfest-2025`

```bash
curl -X POST http://localhost:5000/events/lumenfest-2025/click \
  -H "Content-Type: application/json" \
  -d '{"platform":"google"}'
```

- Fetch stats for `lumenfest-2025`

```bash
curl http://localhost:5000/events/lumenfest-2025/stats
```

### Using Postman

- Open Postman and create a new collection (or import a collection JSON if available).
- Add the three requests above (GET `/health`, POST `/events/:id/click`, GET `/events/:id/stats`).
- For the POST request set `Content-Type: application/json` and a raw JSON body like `{"platform":"google"}`.

If you'd like, import the Postman collection file that can be added to this repo (I can add it for you on request).

---

## Prisma, Database & Migrations

- Ensure `DATABASE_URL` in `.env` points to a running PostgreSQL instance.
- Apply migrations locally using:

```bash
npx prisma migrate dev    # use for local development
```

- In non-development environments, use `npx prisma migrate deploy`.

- If you change `schema.prisma`, regenerate the client:

```bash
npx prisma generate
```

## Troubleshooting

- If requests hang or the server stalls at startup, check that PostgreSQL is running and `DATABASE_URL` is reachable.
- Check Prisma client generation and that `generated/prisma` exists after `npx prisma generate`.
- For ESM import problems, use `npx tsx server.js` (this repo uses ESM + TypeScript in dev).
- If you get `prisma.user` undefined or model-related errors, verify your `schema.prisma` models and run `npx prisma generate`.

---

## Next steps (optional)

- Add a `postman_collection.json` to the repo for quick import.
- Add automated tests for the counter endpoints (supertest + jest or vitest).
- Add rate limiting / authentication for production-ready endpoints.

---

Thank you!

