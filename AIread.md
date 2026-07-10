# AIread — Full Codebase Guide for CollegeConnect

This file exists so an AI (or a new developer) can read ONE document and instantly
know **which folder/file to open for a given feature**, on both frontend and backend.
Folders and files are now named after the website feature they implement.

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

**Top-level monorepo layout:**
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

Data flow in one sentence: **Frontend feature page → generated React Query hook (lib/api-client-react) → HTTP request proxied by Vite to `/api` → Express route (artifacts/api-server) → Zod validation (lib/api-zod) → Drizzle ORM query (lib/db) → PostgreSQL.**

---

## 2. ⭐ Feature Map — find any feature in 2 seconds

Every row below is one website feature. It tells you exactly which frontend folder,
which backend route file, and which database table power it.

| Feature | Frontend folder | Backend route file | DB table(s) |
|---|---|---|---|
| Landing / marketing page | `artifacts/college-connect/src/features/home/` | — | — |
| Login (student OTP + admin/mod password) | `artifacts/college-connect/src/features/auth/` | `users.ts` (lookup) | `users` |
| Dashboard (CGPA, attendance, exam countdown) | `artifacts/college-connect/src/features/dashboard/` | `stats.ts` | `users`, `study_materials`, `listings` |
| Study Hub (notes, uploads, AI tools) | `artifacts/college-connect/src/features/study/` | `study.ts` | `study_materials` |
| Marketplace (buy/sell, housing, services) | `artifacts/college-connect/src/features/marketplace/` | `marketplace.ts` | `listings` |
| Community (feed, anonymous Q&A, leaderboard) | `artifacts/college-connect/src/features/community/` | `community.ts` | `posts`, `qa_questions` |
| Career (internships, resume, interview prep) | `artifacts/college-connect/src/features/career/` | `clubs.ts` (internships) | `internships` |
| Clubs (organizations, events, join/start) | `artifacts/college-connect/src/features/clubs/` | `clubs.ts` | `clubs`, `communities`, `events` |
| Profile (reputation, academics, showcase) | `artifacts/college-connect/src/features/profile/` | `users.ts` | `users` |
| Match ("Campus Match" peer/roommate finder) | `artifacts/college-connect/src/features/match/` | — (mock data only so far) | — |
| Admin (analytics, alerts, moderation queue, colleges, semesters, feature registry, moderators, audit log) | `artifacts/college-connect/src/features/admin/AdminPage.tsx` | `stats.ts` (overview), `academic.ts` (Colleges tab), `admin.ts` (Semesters/Feature Registry/Moderators/Audit Log tabs) | all tables (aggregated) + `colleges`, `courses`, `course_semesters`, `subjects`, `semesters`, `feature_registry`, `feature_toggles`, `moderator_scopes`, `audit_log` |
| Moderator (materials approval, feature toggles, exam schedules, timetables, campus stats) | `artifacts/college-connect/src/features/moderator/` | `moderator.ts`, `stats.ts` | `study_materials`, `feature_toggles`, `exam_schedules`, `timetables` |
| Signup / Signin (student OTP, college/email-domain validation, cascading academic dropdowns) | `artifacts/college-connect/src/features/auth/SignupPage.tsx`, `LoginPage.tsx` | `auth.ts`, `academic.ts` (public read endpoints) | `users`, `colleges`, `courses`, `course_semesters` |
| 404 / not-found | `artifacts/college-connect/src/features/misc/` | — | — |

> **Academic hierarchy is master data, not a "feature" of its own** — it's the
> normalized `College → Course → Semester → Subject` backbone (see Section 5.1)
> that Admin manages and that Signup/Study Hub/Feature Toggles scope themselves to.

> Rule of thumb: **frontend folder name = feature name = (usually) backend route file name.**
> The three exceptions are noted above: Career/Clubs share `clubs.ts`, Profile/Dashboard read from `users.ts`/`stats.ts`, and Admin/Moderator both read aggregate data from `stats.ts` (because those pages show overlapping cross-feature stats, not their own dedicated data).

---

## 3. Frontend — `artifacts/college-connect/src`

### Folder structure (feature-first)
```
src/
  features/
    home/          → HomePage.tsx              (landing page)
    auth/          → LoginPage.tsx, auth-utils.ts   (login + role-redirect helper)
    dashboard/     → DashboardPage.tsx
    study/         → StudyPage.tsx
    marketplace/   → MarketplacePage.tsx
    community/     → CommunityPage.tsx
    career/        → CareerPage.tsx
    clubs/         → ClubsPage.tsx
    profile/       → ProfilePage.tsx
    admin/         → AdminPage.tsx
    moderator/     → ModeratorPage.tsx
    match/         → MatchPage.tsx
    misc/          → NotFoundPage.tsx           (404 fallback, not a real feature)
  components/
    layout/        → SidebarLayout.tsx          (shared shell used by every feature page)
    shared/         → ContentActions.tsx, ProfileCompleteModal.tsx (cross-feature UI)
    ui/            → shadcn/ui primitives (button, dialog, table, etc.) — generic, not feature-specific
  contexts/         → AuthContext.tsx, SubmissionsContext.tsx (cross-feature app state)
  hooks/            → use-mobile.tsx, use-toast.ts (generic utilities)
  lib/              → utils.ts (generic helpers, e.g. `cn()`)
  App.tsx           → wouter routes; imports every feature's page component and wires up `/dashboard`, `/study`, etc.
  main.tsx          → React root
```

**Why this layout:** each feature now lives in its own folder, so to work on
Marketplace you only ever need to open `features/marketplace/`. Code that's
genuinely shared across features (auth session state, the sidebar shell,
moderation dialogs, generic UI kit) stays outside `features/` in
`contexts/`, `components/`, `hooks/`, `lib/` — if it moved into one feature
folder it would create a fake dependency between unrelated features.

### Feature folders in detail
| Folder | Main file | What it does |
|---|---|---|
| `features/home/` | `HomePage.tsx` | Public marketing landing page for logged-out visitors. |
| `features/auth/` | `LoginPage.tsx` | Multi-role login: student email+OTP flow, admin/moderator email+password flow. |
| `features/auth/` | `auth-utils.ts` | `homeRouteForRole()` — decides which page to redirect to after login based on role. |
| `features/dashboard/` | `DashboardPage.tsx` | Student home: CGPA, attendance, exam countdown, recent study materials, marketplace highlights, campus feed/polls. |
| `features/study/` | `StudyPage.tsx` | Study Hub: filterable materials list, upload notes, AI Summarizer & Exam Prep UI, academic tools. |
| `features/marketplace/` | `MarketplacePage.tsx` | Buy/sell items, housing (PG/hostel), local services, roommate finder. |
| `features/community/` | `CommunityPage.tsx` | Campus feed, hobby communities, meetup requests, anonymous Q&A, reputation leaderboard. |
| `features/career/` | `CareerPage.tsx` | Internship listings, resume builder, interview prep, startup co-founder finder. |
| `features/clubs/` | `ClubsPage.tsx` | Trending clubs, all organizations, join/start-a-club flow, campus events. |
| `features/profile/` | `ProfilePage.tsx` | Personal reputation hub, academic interests, project showcase, uploaded notes. |
| `features/match/` | `MatchPage.tsx` | "Campus Match" — peer/roommate/interest matching. |
| `features/admin/` | `AdminPage.tsx` | Global admin dashboard: user analytics, system alerts, moderation queue, marketplace stats. |
| `features/moderator/` | `ModeratorPage.tsx` | Moderator workflow: reported content queue, student verification, campus stats. |
| `features/misc/` | `NotFoundPage.tsx` | 404 fallback route. |

**Study Hub, Marketplace, and Community now render live data from the database**
(via `fetch` + `@tanstack/react-query`'s `useQuery`/`useMutation`, calling
`/api/study/materials`, `/api/marketplace/listings`, and `/api/posts`
directly — not the generated `lib/api-client-react` hooks, which remain
unused because codegen is bypassed, see Section 9). Creating a listing,
posting to the feed, liking a post, and downloading/deleting persist to
Postgres. Comments and bookmarks on Community posts are still client-side
only (no `comments` table yet). Every other feature page still renders
**realistic mock data** defined at the top of the file (see JSDoc comments).

### Cross-feature (shared) code
- **`contexts/AuthContext.tsx`** — logged-in user/session state, role-based login logic, OTP flow. Used by `features/auth/` and `components/layout/SidebarLayout.tsx` (to filter nav by role).
- **`contexts/SubmissionsContext.tsx`** — shared state connecting `features/study/` (uploads) with `features/moderator/` (approve/reject queue).
- **`components/layout/SidebarLayout.tsx`** — dark-navy sidebar wrapping every authenticated feature page; nav items filtered by role.
- **`components/shared/ContentActions.tsx`** — report/delete/action-menu UI reused by `features/community/` and `features/marketplace/`.
- **`components/shared/ProfileCompleteModal.tsx`** — forces new users to complete academic details; triggered globally from `App.tsx`.
- **`components/ui/*`** — shadcn/ui building blocks, not tied to any one feature.

### Build config
- **`vite.config.ts`** — path alias `@/` → `src/`, dev server proxy forwarding `/api/*` to the backend on port 8080, `--host 0.0.0.0` for Replit's proxy.
- **`components.json`** — shadcn/ui config.

---

## 4. Backend — `artifacts/api-server/src`

### Folder structure
```
src/
  index.ts        → server entry point, starts listening on $PORT
  app.ts          → Express app setup (JSON parsing, CORS, pino-http logging, mounts /api)
  lib/
    logger.ts     → pino logger config
  routes/         → one file per feature (mirrors the frontend features/ folders)
    index.ts      → combines every feature router into one
    health.ts     → infra/monitoring only
    users.ts      → Profile + Dashboard + Community-leaderboard data
    community.ts  → Community feature (feed posts + anonymous Q&A)  [renamed from posts.ts]
    study.ts      → Study Hub feature
    marketplace.ts→ Marketplace feature
    clubs.ts      → Clubs + Career(internships) + Community(events)
    stats.ts      → Dashboard + Admin + Moderator aggregate stats
    academic.ts   → College/Course/Semester/Subject hierarchy (admin CRUD + public signup reads)
    auth.ts       → Student signup (3-step OTP) + signin (2-step OTP)
    admin.ts      → Semesters, Feature Registry, Feature Toggles per-scope defaults, Moderators, Audit Log
    moderator.ts  → Study material approval queue, feature toggles (moderator view), exam schedules, timetables
```

### Route files in detail
| File | Endpoints | Feature it powers |
|---|---|---|
| `routes/health.ts` | `GET /api/healthz` | Infra/monitoring |
| `routes/users.ts` | `GET /users`, `GET /users/:id`, `PATCH /users/:id` | **Profile**, **Dashboard** stats, **Community leaderboard** |
| `routes/community.ts` | `GET /posts`, `POST /posts`, `PATCH /posts/:id/like`, Q&A endpoints | **Community** (feed + anonymous Q&A) |
| `routes/study.ts` | `GET /study/materials`, `POST /study/materials`, `PATCH /study/materials/:id/download` | **Study Hub** |
| `routes/marketplace.ts` | `GET /marketplace/listings`, `POST /marketplace/listings`, `DELETE /marketplace/listings/:id` | **Marketplace** |
| `routes/clubs.ts` | fetch/join clubs, list communities/events, list internships | **Clubs**, **Career** (internships), **Community** (events) |
| `routes/stats.ts` | aggregate CGPA/attendance summary, global usage/reports/verification counts | **Dashboard**, **Admin**, **Moderator** |
| `routes/academic.ts` | Admin CRUD: `/admin/colleges`, `/admin/courses`, `/admin/course-semesters`, `/admin/subjects` (GET/POST/PATCH/DELETE). Public reads (no auth, active rows only, used by Signup): `GET /colleges`, `GET /colleges/:id/courses`, `GET /courses/:id/semesters` | **Admin → Colleges tab**, **Signup** (cascading dropdowns) |
| `routes/auth.ts` | `POST /auth/signup/initiate\|complete\|resend`, `POST /auth/signin`, `/auth/signin/verify`, `/auth/signin/resend` | **Signup**, **Signin** (student OTP flow) |
| `routes/admin.ts` | `/admin/semesters` CRUD (legacy global semester list, distinct from `course_semesters`), `/admin/features` CRUD (feature registry), `/admin/moderators` CRUD, `GET /admin/audit-log` | **Admin** (Semesters, Feature Registry, Moderators, Audit Log tabs) |
| `routes/moderator.ts` | `/moderator/materials` (list/approve/reject/edit/delete), `/moderator/toggles` (per-scope feature enable/disable), `/moderator/exam-schedules`, `/moderator/timetables` | **Moderator** dashboard |

All routes validate request bodies with Zod schemas from `lib/api-zod` (older routes) or inline `zod` schemas (newer routes: `academic.ts`, `auth.ts`, `admin.ts`, `moderator.ts`) before touching the database.

> ⚠️ **No server-side auth/authorization exists yet.** `/api/admin/*` and
> `/api/moderator/*` are not protected by any login/role check — access control
> today is purely a client-side UI convention (only the Admin/Moderator page
> calls them). Anyone who can reach the API can call these endpoints directly.
> Treat this as a known gap, not an intentional trust boundary (see Section 9).

---

## 5. Database — `lib/db/src`

Drizzle ORM schema, PostgreSQL. `index.ts` exports the `db` client plus every table.

| Schema file | Table(s) | Key columns | Feature |
|---|---|---|---|
| `schema/users.ts` | `users` | `id`, `name`, `email`, `college`, `department`, `year`, `role`, `reputationScore`, `reputationLevel`, `cgpa`, `attendance` | Profile, Dashboard, Auth |
| `schema/posts.ts` | `posts`, `qa_questions` | author info, `content`, `category`, `likes`, `anonymous` | Community |
| `schema/study.ts` | `study_materials` | `subject`, `course`, `semester`, `fileType`, `downloads`, `verified` | Study Hub |
| `schema/marketplace.ts` | `listings` | `listingType`, `price`, `sellerName`, `featured` | Marketplace |
| `schema/clubs.ts` | `clubs`, `communities`, `events`, `internships` | `memberCount`, event dates, internship postings | Clubs, Career, Community |
| `schema/academic.ts` | `colleges`, `courses`, `course_semesters`, `subjects` | see Section 5.1 | Admin (Colleges tab), Signup |
| `schema/admin.ts` | `semesters` (legacy, global), `feature_registry`, `feature_toggles`, `moderator_scopes`, `exam_schedules`, `timetables`, `audit_log` | see Section 5.2 | Admin, Moderator |

`drizzle.config.ts` configures schema push (`pnpm --filter @workspace/db run push`) against `DATABASE_URL`.

### 5.1 Academic hierarchy — `College → Course → Semester → Subject`

This is the normalized master-data backbone that lets the platform host many
colleges without schema changes (adding a college is an INSERT, not a
migration). Every table below has `status` ("active"/"disabled") + `deletedAt`
for soft delete — nothing is hard-deleted in normal operation.

| Table | Key columns | Notes |
|---|---|---|
| `colleges` | `name`, `code` (unique), `slug` (unique), `emailDomain` (unique — e.g. `"dit.edu"`), `city`, `state`, `pincode`, `logoUrl` | `emailDomain` gates student signup: only `@<emailDomain>` addresses may register for that college. |
| `courses` | `collegeId` (FK), `name`, `code`, `durationSemesters` (default 8) | The "how many semesters does this course have" field admins set when creating a course. |
| `course_semesters` | `courseId` (FK), `number`, `name`, `startDate`, `endDate`, `status` ("active"\|"upcoming"\|"disabled"\|"archived") | Admin can add these one at a time or bulk-generate up to `durationSemesters` via the "Generate Remaining" button in Admin → Colleges → Courses → Semesters. |
| `subjects` | `semesterId` (FK), `name`, `code`, `credits` | Leaf level of the hierarchy. |

`users` has nullable FK columns `collegeId`, `courseId`, `semesterId` pointing into
this hierarchy (added during rollout; legacy free-text `college`/`courseName`
columns are kept in parallel for backward compatibility with old rows/UI).
`feature_toggles` also has nullable `collegeId`/`courseId`/`semesterId` for
scoping a feature on/off to a specific college, course, or semester (all-null =
platform-wide default).

**Signup enforcement:** `POST /api/auth/signup/initiate` (in `routes/auth.ts`)
requires `collegeId`/`courseId`/`semesterId` — not free-text names — and
validates server-side that (a) the college is active, (b) the submitted
email's domain matches that college's `emailDomain`, (c) the course belongs
to that college, and (d) the semester belongs to that course and is
active/upcoming. The frontend (`SignupPage.tsx`) presents this as three
cascading dropdowns (college → course → semester), each fetched from the
public `GET /api/colleges`, `GET /api/colleges/:id/courses`,
`GET /api/courses/:id/semesters` endpoints (active rows only, no auth).

### 5.2 Admin/Moderator operational tables

| Table | Purpose |
|---|---|
| `semesters` | Legacy **global** semester list (e.g. `"sem5"`) used by the Admin "Semesters" tab — distinct from the newer per-course `course_semesters` table above. Not yet consolidated. |
| `feature_registry` | Master list of toggleable features (e.g. `"study_hub"`), with `defaultEnabled`, `forcedActive`, `retired`, `globalEnabled` (platform kill-switch), and optional `parentName` for nested features. |
| `feature_toggles` | Per-scope enable/disable rows referencing `feature_registry.name` + college/course/semester scope (or legacy free-text `course`/`semester` scope). Read by Moderator dashboard and (eventually) by feature pages to decide visibility. |
| `moderator_scopes`, `exam_schedules`, `timetables` | Moderator-managed content scoped to a college/course/semester. |
| `audit_log` | Append-only log of admin/moderator actions (create/update/delete), read via `GET /api/admin/audit-log`. |

---

## 6. Shared API contract libs

| Dir | Purpose |
|---|---|
| `lib/api-spec` | OpenAPI YAML — source of truth for every endpoint's shape. (Codegen from this spec is currently bypassed due to a YAML parsing issue; routes use manual Zod validation instead — see `replit.md`.) |
| `lib/api-zod` | Zod schemas generated from the spec — used by the **backend** to validate requests/responses. |
| `lib/api-client-react` | TanStack Query hooks generated from the spec, plus `custom-fetch.ts` — used by the **frontend** to call the API with type safety and caching. |

---

## 7. Other folders

- **`artifacts/mockup-sandbox/`** — isolated Vite app for the Canvas design/preview tool. Not part of the deployed website; safe to ignore for live-site behavior.
- **`scripts/src/hello.ts`** — placeholder utility script for verifying workspace tooling. Not part of the app.

---

## 8. How a feature request typically touches files

Example — "let students comment on posts" (a Community feature change):
1. `lib/api-spec` — add the endpoint to the OpenAPI YAML (if codegen is fixed) or skip if using manual Zod.
2. `lib/api-zod/src/generated` — add/update the Zod schema for the comment payload.
3. `artifacts/api-server/src/routes/community.ts` — add `POST /posts/:id/comments`, validate with Zod, write to DB.
4. `lib/db/src/schema/posts.ts` — add a `comments` table if it doesn't exist.
5. `lib/api-client-react/src/generated` — regenerate/add a React Query hook for the new endpoint.
6. `artifacts/college-connect/src/features/community/CommunityPage.tsx` — call the new hook, render comment UI (replacing the current mock data).

**General rule:** find the feature in the table in Section 2, and every file you need to touch will be in that row's frontend folder + backend route file + DB table.

---

## 9. Known gotchas (see also `replit.md`)

- **No server-side admin/moderator authorization.** `/api/admin/*` and `/api/moderator/*` accept requests from anyone — there's no session/JWT/role check on the backend. The Admin/Moderator pages are reachable by any logged-in-looking client. Student signin/signup *does* do real OTP + password verification, but admin/moderator "login" is a client-side demo-credentials check in `AuthContext.tsx`, not a real session. Before this goes to real users, add auth middleware (session or JWT) enforcing role on every `/admin` and `/moderator` route.
- OpenAPI codegen (Orval) is bypassed due to a YAML parsing issue — routes use manual Zod validation for now (all newer routes — `academic.ts`, `auth.ts`, `admin.ts`, `moderator.ts` — were written with inline `zod` schemas rather than `lib/api-zod`, so the OpenAPI spec in `lib/api-spec` is now out of date and doesn't describe them).
- OTP codes are stored **in-memory** in `auth.ts` (a `Map`, 5-minute TTL) and returned directly in the API response as `demoOtp` instead of being emailed — fine for a demo, but OTPs are lost on server restart and never actually delivered to the user's inbox. Needs a real email/SMS provider + a persistent (Redis/DB) OTP store before production use.
- Two parallel "semester" concepts exist: the legacy global `semesters` table (Admin → Semesters tab, free-standing "sem5" style rows) and the newer per-course `course_semesters` table (Admin → Colleges → Courses → Semesters, used by Signup). They are not linked or reconciled — don't assume editing one affects the other.
- `subjects`, `course_semesters`, and `courses` have no public list/search endpoints beyond the ones Signup needs (active-only, minimal fields) — anything else (e.g. showing subjects in Study Hub) needs a new endpoint, not reuse of the admin CRUD ones (those return soft-deleted/disabled rows too).
- Do not run `pnpm dev` at the workspace root — use the Replit workflow or `pnpm --filter <package> run dev`.
- Most feature-page data is mock data at the top of each page file — check JSDoc comments before assuming it's live from the API. Study Hub, Marketplace, Community, Auth (signup/signin), and Admin's Colleges/Semesters/Feature Registry/Moderators/Audit Log tabs are live; most other feature pages (Career, Clubs, Match, Profile, Dashboard) are still mock data.
- Backend route file naming mostly mirrors frontend feature folder names, with 3 intentional exceptions (see the note under the Feature Map table); `academic.ts`, `auth.ts`, `admin.ts`, and `moderator.ts` are further exceptions — they're operational/cross-cutting routers rather than 1:1 feature mirrors.
