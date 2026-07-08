---
name: Monorepo Structure
description: Key paths, ports, and commands for the CollegeConnect pnpm monorepo.
---

## Paths
- Frontend: `artifacts/college-connect/` (Vite + React, port 5000)
- Backend: `artifacts/api-server/` (Express, port 8080)
- DB: `lib/db/` (Drizzle ORM + Postgres)

## DB Commands
- Push schema: `pnpm --filter @workspace/db run push`
- Schema files: `lib/db/src/schema/` — index.ts must export all new files

## Route Registration
All Express routes registered in `artifacts/api-server/src/routes/index.ts`.

## Auth
- Students: full OTP signup/signin via `/api/auth/…`
- Admin/Moderator: client-side demo login only (no real server auth for staff)

**Why:** Staff login is intentionally demo-only — not changed per project decision.
