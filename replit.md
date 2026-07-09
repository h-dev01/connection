# CollegeConnect

A full-stack Campus Super App for college students — study, connect, trade, and build your campus reputation in one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/college-connect run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v4 + shadcn/ui + wouter + framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle for API), Vite (ESM bundle for frontend)

## Academic hierarchy (multi-college support)

Normalized master data lives in `lib/db/src/schema/academic.ts`:
`colleges` → `courses` → `course_semesters` → `subjects` (each FK-linked,
soft-delete via `status`/`deletedAt`). Admin CRUD for all four is in
`artifacts/api-server/src/routes/academic.ts` (`/api/admin/colleges`,
`/api/admin/courses`, `/api/admin/course-semesters`, `/api/admin/subjects`).

Existing tables (`users`, `study_materials`, `feature_toggles`,
`moderator_scopes`, `clubs`, `events`, `internships`, `communities`,
`listings`, `posts`) got additive nullable FK columns (`collegeId`,
`courseId`, `semesterId`, `subjectId`) plus `status`/`deletedAt` soft-delete
columns, while keeping their old free-text fields (e.g. `course`,
`semester` as text) for backward compatibility. Existing routes/frontend
are unaffected; new features should read/write the FK columns instead of
the legacy text ones.

## Where things live

```
artifacts/college-connect/src/
  pages/            — one file per page (dashboard, study, marketplace, community, career, clubs, profile, admin, moderator, login)
  components/
    layout/         — SidebarLayout (dark navy sidebar, nav items)
    ui/             — all shadcn/ui components
  index.css         — Tailwind v4 theme (CSS vars, sidebar colors, Inter font)
  App.tsx           — wouter routes, all pages registered

artifacts/api-server/src/
  routes/           — users, posts, study, marketplace, clubs, stats, health
  app.ts            — Express app setup with pino-http logger

lib/db/src/
  schema/           — Drizzle ORM tables: users, posts, study_materials, listings, clubs, communities, events, internships
  index.ts          — exports db instance + all tables
```

## Architecture decisions

- All frontend pages use realistic mock data at the top of each file with JSDoc comments so developers can easily swap them for real API calls
- Auth is not yet implemented — the Login page navigates directly to /dashboard; add POST /api/auth/login + session middleware when ready
- The OpenAPI codegen (Orval) is currently bypassed because the YAML spec has parsing issues; routes use manual Zod validation instead
- Login page does NOT use SidebarLayout — it has its own full-page split layout
- API routes use `/api` prefix (handled by the reverse proxy from path `/api`)

## Product

- **Dashboard** — CGPA, attendance, upcoming exam countdown, recent study materials, marketplace highlights, campus feed with polls
- **Study Hub** — filterable materials list, AI Summarizer & Exam Prep tools, career corner, academic tools
- **Marketplace** — buy/sell items, housing (PG/hostels), local services, roommate finder
- **Community** — campus feed, hobby communities, meetup requests, anonymous Q&A, reputation leaderboard
- **Career** — internship listings, resume builder, interview prep, startup co-founder finder
- **Clubs** — trending clubs, all organizations, join/start club flow
- **Profile** — reputation hub, academic interests, project showcase, uploaded notes
- **Admin** — global health dashboard, user analytics, system alerts, moderation queue, marketplace stats
- **Moderator** — reported content queue, student verification, campus stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root — use the workflow system or `pnpm --filter` per package
- The API server bundles at 1.4MB because it includes pino workers — this is expected
- codegen (`pnpm --filter @workspace/api-spec run codegen`) fails with YAML parsing error; use manual Zod validation in routes until fixed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
