# AIread — Full Codebase Guide for CollegeConnect

This file exists so an AI (or a new developer) can read ONE document and understand
what every file in this repo does, what website feature it powers, and which other
files it is connected to. Read this before making changes.

---

## 1. What is CollegeConnect?

A full-stack "Campus Super App" for college students: study material sharing,
a marketplace, a community feed, career/internship listings, clubs, a
reputation/profile system, and admin/moderator tooling.

**Stack:** pnpm workspaces monorepo, Node.js, TypeScript.
- Frontend: React + Vite + Tailwind v4 + shadcn/ui + wouter (routing) + framer-motion
- Backend: Express 5 (API server)
- Database: PostgreSQL + Drizzle ORM
- Validation: Zod, generated from an OpenAPI spec
- API client: TanStack Query hooks generated via Orval

**Monorepo layout:**
```
artifacts/college-connect/   → the main website (frontend)
artifacts/api-server/        → the backend REST API
artifacts/mockup-sandbox/    → isolated component preview sandbox (design/canvas tool, NOT part of the live site)
lib/db/                      → Drizzle ORM schema + DB client (shared)
lib/api-spec/                → OpenAPI YAML contract (source of truth for the API shape)
lib/api-zod/                 → Zod schemas generated from the OpenAPI spec (used by backend for validation)
lib/api-client-react/        → TanStack Query hooks generated from the OpenAPI spec (used by frontend to call the API)
scripts/                     → misc workspace utility scripts
```

Data flow in one sentence: **Frontend page → generated React Query hook (lib/api-client-react) → HTTP request proxied by Vite to `/api` → Express route (artifacts/api-server) → Zod validation (lib/api-zod) → Drizzle ORM query (lib/db) → PostgreSQL.**

---

## 2. Backend — `artifacts/api-server/src`

| File | What it does | Feature it powers | Related files |
|---|---|---|---|
| `index.ts` | Entry point. Starts the HTTP server, reads `PORT` from env, calls `app.ts`'s Express app to listen. | Whole API (boot) | `app.ts` |
| `app.ts` | Builds the Express app: JSON body parsing, CORS, `pino-http` request logging, mounts all routes under `/api`. | Whole API (setup) | `routes/index.ts`, `lib/logger.ts` |
| `lib/logger.ts` | Configures the `pino` logger instance used for structured request/error logging. | Observability/debugging | `app.ts` |
| `routes/index.ts` | Combines every feature router (health, users, posts, study, marketplace, clubs, stats) into one router mounted in `app.ts`. | Routing glue | all files in `routes/` |
| `routes/health.ts` | `GET /api/healthz` — simple liveness check. | Infra/monitoring | none |
| `routes/users.ts` | `GET /users`, `GET /users/:id`, `PATCH /users/:id` — student profile data (name, college, department, CGPA, attendance, reputation). | **Profile page**, **Dashboard** stats, **Community leaderboard** | `lib/db/src/schema/users.ts` |
| `routes/posts.ts` | `GET /posts`, `POST /posts` (supports anonymous posts), `PATCH /posts/:id/like`, plus Q&A endpoints. | **Community page** (campus feed + anonymous Q&A) | `lib/db/src/schema/posts.ts` |
| `routes/study.ts` | `GET /study/materials`, `POST /study/materials` (upload), `PATCH /study/materials/:id/download` (download counter). | **Study Hub page** | `lib/db/src/schema/study.ts` |
| `routes/marketplace.ts` | `GET /marketplace/listings`, `POST /marketplace/listings`, `DELETE /marketplace/listings/:id` — buy/sell, housing, and services listings. | **Marketplace page** | `lib/db/src/schema/marketplace.ts` |
| `routes/clubs.ts` | Fetch/join clubs, list campus communities/events, list internships. | **Clubs page**, **Career page** (internships), **Community** (events) | `lib/db/src/schema/clubs.ts` |
| `routes/stats.ts` | Aggregated stats: student summary (CGPA/attendance) for Dashboard, global usage/reports/verification counts for Admin. | **Dashboard page**, **Admin page** | `lib/db/src/schema/*` |

Backend routes validate incoming request bodies with Zod schemas from `lib/api-zod` before touching the database.

---

## 3. Database — `lib/db/src`

Drizzle ORM schema, PostgreSQL. `index.ts` exports the `db` client plus every table.

| File | Table(s) | Key columns |
|---|---|---|
| `schema/users.ts` | `users` | `id`, `name`, `email`, `college`, `department`, `year`, `role` (student / low_admin / admin), `reputationScore`, `reputationLevel`, `cgpa`, `attendance` |
| `schema/posts.ts` | `posts`, `qa_questions` | author info, `content`, `category`, `likes`, `anonymous` |
| `schema/study.ts` | `study_materials` | `subject`, `course`, `semester`, `fileType`, `downloads`, `verified` |
| `schema/marketplace.ts` | `listings` | `listingType` (item/housing/service), `price`, `sellerName`, `featured` |
| `schema/clubs.ts` | `clubs`, `communities`, `events`, `internships` | `memberCount` (clubs), event dates, internship postings |

`drizzle.config.ts` configures schema push (`pnpm --filter @workspace/db run push`) against `DATABASE_URL`.

---

## 4. Shared API contract libs

| Dir | Purpose |
|---|---|
| `lib/api-spec` | OpenAPI YAML — the single source of truth describing every endpoint, request/response shape. (Note: codegen from this spec is currently bypassed per `replit.md` due to a YAML parsing issue; routes use manual Zod validation instead.) |
| `lib/api-zod` | Zod schemas generated from the spec (`src/generated/*`) — used by the **backend** to validate requests/responses. |
| `lib/api-client-react` | TanStack Query hooks generated from the spec (`src/generated/api.ts`, `api.schemas.ts`) plus `custom-fetch.ts` (the fetch wrapper) — used by the **frontend** to call the API with type safety and caching. |

---

## 5. Frontend — `artifacts/college-connect/src`

### Entry & routing
- **`main.tsx`** — React root, mounts `App.tsx`.
- **`App.tsx`** — Sets up `QueryClientProvider` (TanStack Query), `AuthProvider`, `SubmissionsProvider`, and all `wouter` routes. Authenticated pages are wrapped in `SidebarLayout`; some routes have a `RoleGuard` restricting access by role (student / moderator / admin). The Login page is NOT wrapped in `SidebarLayout` (its own full-page layout).

### Pages (`src/pages/`)
| Page | Feature |
|---|---|
| `home.tsx` | Public landing page (marketing site) shown to logged-out visitors. |
| `login.tsx` | Multi-role login: student flow (email + OTP), admin/moderator flow (email + password). |
| `dashboard.tsx` | Student home after login: CGPA, attendance, upcoming exam countdown, recent study materials, marketplace highlights, campus feed/polls. |
| `study.tsx` | Study Hub: browse/filter study materials, upload notes, AI Summarizer & Exam Prep tool UI, academic tools. |
| `marketplace.tsx` | Buy/sell items, housing (PG/hostel), local services, roommate finder. |
| `community.tsx` | Campus social feed, hobby communities, meetup requests, anonymous Q&A, reputation leaderboard. |
| `career.tsx` | Internship listings, resume builder, interview prep, startup co-founder finder. |
| `clubs.tsx` | Trending clubs, all organizations, join/start-a-club flow, campus events. |
| `profile.tsx` | Personal reputation hub, academic interests, project showcase, uploaded notes. |
| `match.tsx` | "Campus Match" — peer/roommate/interest matching feature. |
| `admin.tsx` | Global admin dashboard: user analytics, system alerts, moderation queue, marketplace stats. |
| `moderator.tsx` | Moderator workflow: reported content queue, student verification, campus stats. |
| `not-found.tsx` | 404 fallback route. |

Every page currently renders **realistic mock data** defined at the top of the file (see JSDoc comments) — these are meant to be swapped for real API calls via `lib/api-client-react` hooks as backend integration progresses (per `replit.md`).

### Contexts (`src/contexts/`)
- **`AuthContext.tsx`** — Manages the logged-in user/session state, role-based login logic, OTP verification flow for students. Consumed via a hook throughout the app to know who's logged in and their role.
- **`SubmissionsContext.tsx`** — Shared state for the study-material upload → moderation-approval pipeline; connects the Study Hub (student uploads) with the Moderator page (approve/reject queue).

### Shared components (`src/components/`)
- **`layout/SidebarLayout.tsx`** — The dark-navy sidebar shell wrapping all authenticated pages; nav items are filtered based on the current user's role (student/moderator/admin).
- **`shared/ContentActions.tsx`** — Reusable moderation UI (report dialog, delete confirmation, action menu) used on posts/listings across Community and Marketplace.
- **`shared/ProfileCompleteModal.tsx`** — Modal forcing new users to fill in academic details (college, department, year) after first login.
- **`ui/*`** — shadcn/ui primitive components (button, dialog, table, sidebar, etc.) — generic building blocks, not feature-specific.

### Hooks & libs (`src/hooks`, `src/lib`)
- **`hooks/use-mobile.tsx`** — Detects mobile viewport for responsive behavior.
- **`hooks/use-toast.ts`** — Toast notification state/hook (used with `ui/toaster.tsx`).
- **`lib/utils.ts`** — Generic helpers (e.g. `cn()` for className merging).
- **`lib/auth-utils.ts`** — Helper that decides which page a user should land on based on their role after login.

### Build config
- **`vite.config.ts`** — Vite dev/build config: path alias `@/` → `src/`, dev server proxy forwarding `/api/*` requests to the backend on port 8080, `--host 0.0.0.0` for Replit's proxy.
- **`components.json`** — shadcn/ui config (component style, aliases).

---

## 6. `artifacts/mockup-sandbox`

A separate, isolated Vite app used only for the Canvas design/preview tool (component prototyping in isolation). It mirrors some `ui/` components but is **not part of the deployed website** — safe to ignore when reasoning about live site behavior.

---

## 7. `scripts/`

- **`scripts/src/hello.ts`** — trivial placeholder/utility script for verifying the workspace tooling works. Not part of the app.

---

## 8. How a feature request typically touches files

Example — "let students comment on posts":
1. `lib/api-spec` — add the endpoint to the OpenAPI YAML (if codegen is fixed) or skip if using manual Zod.
2. `lib/api-zod/src/generated` — add/update Zod schema for the comment payload.
2. `artifacts/api-server/src/routes/posts.ts` — add `POST /posts/:id/comments` route, validate with Zod, write to DB.
3. `lib/db/src/schema/posts.ts` — add a `comments` table if it doesn't exist.
4. `lib/api-client-react/src/generated` — regenerate/add a React Query hook for the new endpoint.
5. `artifacts/college-connect/src/pages/community.tsx` — call the new hook, render comment UI (replacing the current mock data).

---

## 9. Known gotchas (see also `replit.md`)

- Auth is not fully wired to the backend yet — Login currently just navigates to `/dashboard`/role home; `AuthContext` handles this client-side only.
- OpenAPI codegen (Orval) is bypassed due to a YAML parsing issue — routes use manual Zod validation for now.
- Do not run `pnpm dev` at the workspace root — use the Replit workflow or `pnpm --filter <package> run dev`.
- Most page-level data is mock data at the top of each page file — check JSDoc comments before assuming it's live from the API.
