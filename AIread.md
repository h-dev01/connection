# AIread — Full Codebase Guide for CollegeConnect

This file exists so an AI (or a new developer) can read ONE document and instantly
know **which folder/file to open for a given feature**, on both frontend and backend.
Folders and files are named after the website feature they implement.

---

## 1. What is CollegeConnect?

A full-stack "Campus Super App" for college students: study material sharing,
a marketplace, a community feed, career/internship listings, clubs, a
reputation/profile system, and admin/moderator tooling — now spanning **multiple
colleges** with a normalized academic hierarchy and email-domain-gated signup.

**Stack:** pnpm workspaces monorepo, Node.js, TypeScript.
- Frontend: React + Vite + Tailwind v4 + shadcn/ui + wouter (routing) + framer-motion + TanStack Query
- Backend: Express 5 (API server)
- Database: PostgreSQL + Drizzle ORM
- Validation: Zod — some routes use schemas generated from an OpenAPI spec (`lib/api-zod`), newer routes use inline `zod` schemas directly in the route file (see Section 4's warning box)
- Auth: bcryptjs password hashing + in-memory OTP codes for students; hardcoded demo credentials (client-side only, no backend call) for admin/moderator

**Top-level monorepo layout:**
```
artifacts/college-connect/   → the main website (frontend)
artifacts/api-server/        → the backend REST API
artifacts/mockup-sandbox/    → isolated component preview sandbox (design/canvas tool, NOT part of the live site)
lib/db/                      → Drizzle ORM schema + DB client (shared)
lib/api-spec/                → OpenAPI YAML contract (partially stale — see Section 6)
lib/api-zod/                 → Zod schemas generated from the OpenAPI spec (used by some backend routes for validation)
lib/api-client-react/        → TanStack Query hooks generated from the OpenAPI spec (currently unused — see Section 6)
scripts/                     → misc workspace utility scripts
```

Data flow in one sentence: **Frontend feature page → `fetch()` + TanStack Query `useQuery`/`useMutation` → Vite dev-server proxy forwards `/api/*` → Express route (`artifacts/api-server`) → Zod validation (inline or `lib/api-zod`) → Drizzle ORM query (`lib/db`) → PostgreSQL.**

---

## 2. ⭐ Feature Map — find any feature in 2 seconds

Every row below is one website feature. It tells you exactly which frontend folder,
which backend route file, and which database table power it.

| Feature | Frontend folder | Backend route file | DB table(s) | Data status |
|---|---|---|---|---|
| Landing / marketing page | `features/home/` | — | — | static/mock |
| Signup (student, 3-step OTP, cascading college→course→semester dropdowns) | `features/auth/SignupPage.tsx` | `auth.ts` (signup), `academic.ts` (public reads for dropdowns) | `users`, `colleges`, `courses`, `course_semesters` | **live** |
| Signin (student, 2-step OTP) | `features/auth/LoginPage.tsx` | `auth.ts` (signin) | `users` | **live** |
| Login (admin / moderator) | `features/auth/LoginPage.tsx` | *none — hardcoded demo credentials checked client-side in `AuthContext.tsx`* | — | **mock / demo only, no DB or backend call** |
| Dashboard (CGPA, attendance, exam countdown, recent materials/listings) | `features/dashboard/` | `stats.ts`, `study.ts` (`/study/recent`) | `users`, `study_materials`, `listings` | partial live (recent items), rest mock |
| Study Hub (notes, uploads, approval status, AI tools) | `features/study/` | `study.ts` | `study_materials` | **live** (AI tools UI is mock) |
| Marketplace (buy/sell, housing, services) | `features/marketplace/` | `marketplace.ts` | `listings` | **live** |
| Community (feed, anonymous Q&A, leaderboard) | `features/community/` | `community.ts` | `posts`, `qa_questions` | **live** feed/Q&A; comments/bookmarks client-only (no `comments` table) |
| Career (internships, resume, interview prep) | `features/career/` | `clubs.ts` (internships) | `internships` | mock |
| Clubs (organizations, events, join/start) | `features/clubs/` | `clubs.ts` | `clubs`, `communities`, `events` | mock |
| Profile (reputation, academics, showcase) | `features/profile/` | `users.ts` | `users` | partial live (reads real user), showcase mock |
| Match ("Campus Match" peer/roommate finder) | `features/match/` | — | — | mock only |
| Admin → Overview (analytics, alerts, moderation queue) | `features/admin/AdminPage.tsx` | `stats.ts` | all tables (aggregated) | mock |
| Admin → Colleges (Colleges → Courses → Semesters → Subjects CRUD) | `features/admin/AdminPage.tsx` (`CollegesTab` etc.) | `academic.ts` | `colleges`, `courses`, `course_semesters`, `subjects` | **live** |
| Admin → Semesters (legacy global semester list) | `features/admin/AdminPage.tsx` | `admin.ts` | `semesters` | **live** — ⚠️ unrelated to `course_semesters`, see 5.2 |
| Admin → Feature Registry | `features/admin/AdminPage.tsx` | `admin.ts` | `feature_registry` | **live** |
| Admin → Moderators | `features/admin/AdminPage.tsx` | `admin.ts` | `users` (role=`low_admin`), `moderator_scopes` | **live** |
| Admin → Audit Log | `features/admin/AdminPage.tsx` | `admin.ts` | `audit_log` | **live** |
| Moderator → Feature Toggles (per course×semester enable/disable) | `features/moderator/` | `moderator.ts` | `feature_toggles`, `feature_registry` | **live** |
| Moderator → Study Materials (approve/reject queue) | `features/moderator/` | `moderator.ts` | `study_materials` | **live** |
| Moderator → Exam Schedules | `features/moderator/` | `moderator.ts` | `exam_schedules` | **live** |
| Moderator → Timetables | `features/moderator/` | `moderator.ts` | `class_timetables` | **live** |
| Moderator → Reports | `features/moderator/` | — | — | mock |
| 404 / not-found | `features/misc/` | — | — | — |

> Rule of thumb: **frontend folder name = feature name = (usually) backend route file name.**
> Exceptions: Career/Clubs share `clubs.ts`; Profile/Dashboard read from `users.ts`/`stats.ts`; Admin/Moderator both read aggregate stats from `stats.ts` for their Overview pages but have their own dedicated `admin.ts`/`moderator.ts`/`academic.ts` files for CRUD tabs.

> ⚠️ **No backend enforces role/permission checks anywhere.** Every `/api/admin/*`
> and `/api/moderator/*` route will respond to any caller — access control today
> is purely "which page calls it," not a real auth boundary. See Section 9.

---

## 3. Frontend — `artifacts/college-connect/src`

### Folder structure (feature-first)
```
src/
  features/
    home/          → HomePage.tsx              (landing page)
    auth/          → LoginPage.tsx, SignupPage.tsx, auth-utils.ts
    dashboard/     → DashboardPage.tsx
    study/         → StudyPage.tsx
    marketplace/   → MarketplacePage.tsx
    community/     → CommunityPage.tsx
    career/        → CareerPage.tsx
    clubs/         → ClubsPage.tsx
    profile/       → ProfilePage.tsx
    admin/         → AdminPage.tsx              (Overview, Colleges, Semesters, Feature Registry, Moderators, Audit Log tabs)
    moderator/     → ModeratorPage.tsx           (Feature Toggles, Study Materials, Exam Schedules, Timetables, Reports tabs)
    match/         → MatchPage.tsx
    misc/          → NotFoundPage.tsx           (404 fallback, not a real feature)
  components/
    layout/        → SidebarLayout.tsx          (shared shell used by every authenticated feature page)
    shared/        → ContentActions.tsx, ProfileCompleteModal.tsx (cross-feature UI)
    ui/            → shadcn/ui primitives (button, dialog, table, select, switch, etc.) — generic, not feature-specific
  contexts/        → AuthContext.tsx, SubmissionsContext.tsx (cross-feature app state)
  hooks/           → use-mobile.tsx, use-toast.ts (generic utilities)
  lib/             → utils.ts (generic helpers, e.g. `cn()`)
  App.tsx          → wouter routes; imports every feature's page component, wraps authenticated pages in `SidebarLayout`, wraps role-restricted pages in `RoleGuard`
  main.tsx         → React root
```

**Why this layout:** each feature lives in its own folder, so to work on
Marketplace you only ever need to open `features/marketplace/`. Code that's
genuinely shared across features (auth session state, the sidebar shell,
moderation dialogs, generic UI kit) stays outside `features/` in
`contexts/`, `components/`, `hooks/`, `lib/`.

### Routing (`App.tsx`)
All routes are declared with `wouter`. `/`, `/login`, `/signup` are public.
Every other route (`/dashboard`, `/study`, `/marketplace`, `/community`,
`/career`, `/clubs`, `/profile`, `/admin`, `/moderator`, `/match`) is wrapped in
`<SidebarLayout>`. **There is currently no `RoleGuard` actually applied to
`/admin` or `/moderator` in `App.tsx`** — the `RoleGuard` helper exists in the
file but isn't used on any route yet, so any logged-in user (or even a logged-out
one, since there's no auth check either) can navigate straight to `/admin` or
`/moderator` by URL. Route-level protection is a gap, not a design choice — see
Section 9.

### Feature folders in detail
| Folder | Main file | What it does |
|---|---|---|
| `features/home/` | `HomePage.tsx` | Public marketing landing page for logged-out visitors. |
| `features/auth/` | `LoginPage.tsx` | Multi-role login: student email+password→OTP flow (real, hits `auth.ts`); admin/moderator email+password flow (fake, hardcoded creds in `AuthContext.tsx`, no network call). |
| `features/auth/` | `SignupPage.tsx` | 3-step student signup: form (with cascading College → Course → Semester dropdowns fetched live from `academic.ts`'s public endpoints) → OTP → account created. |
| `features/auth/` | `auth-utils.ts` | `homeRouteForRole()` — decides which page to redirect to after login based on role. |
| `features/dashboard/` | `DashboardPage.tsx` | Student home: CGPA, attendance, exam countdown, recent study materials (`/api/study/recent`, live), marketplace highlights, campus feed/polls (mostly mock). |
| `features/study/` | `StudyPage.tsx` | Study Hub: filterable materials list (live, approved-only), upload notes (live, lands as `pending`), AI Summarizer & Exam Prep UI (mock), academic tools. |
| `features/marketplace/` | `MarketplacePage.tsx` | Buy/sell items, housing (PG/hostel), local services, roommate finder — all backed by `listings` table. |
| `features/community/` | `CommunityPage.tsx` | Campus feed, hobby communities, meetup requests, anonymous Q&A (live), reputation leaderboard (mock). |
| `features/career/` | `CareerPage.tsx` | Internship listings (mock data shape matches `internships` table but page doesn't fetch it yet), resume builder, interview prep, startup co-founder finder — all mock. |
| `features/clubs/` | `ClubsPage.tsx` | Trending clubs, all organizations, join/start-a-club flow, campus events — mock. |
| `features/profile/` | `ProfilePage.tsx` | Personal reputation hub (reads real logged-in user via `AuthContext`), academic interests, project showcase, uploaded notes (showcase/notes list is mock). |
| `features/match/` | `MatchPage.tsx` | "Campus Match" — peer/roommate/interest matching. Entirely mock. |
| `features/admin/` | `AdminPage.tsx` | Tabs: **Overview** (mock analytics/alerts), **Colleges** (live CRUD: Colleges → Courses → Semesters → Subjects, with a "Generate Remaining" semester-bulk-create helper), **Semesters** (live CRUD on the legacy global `semesters` table), **Feature Registry** (live CRUD), **Moderators** (live CRUD + scope assignment), **Audit Log** (live, read-only). |
| `features/moderator/` | `ModeratorPage.tsx` | Tabs: **Feature Toggles** (live, per course×semester scope, reads/writes `feature_toggles`), **Study Materials** (live approve/reject/edit/delete queue), **Exam Schedules** (live CRUD), **Timetables** (live CRUD), **Reports** (mock). |
| `features/misc/` | `NotFoundPage.tsx` | 404 fallback route. |

### Cross-feature (shared) code
- **`contexts/AuthContext.tsx`** — logged-in user/session state (persisted to `localStorage` under key `cc_user`, no server session/cookie), student OTP signup/signin flow (real API calls), admin/moderator demo login (hardcoded, no API call). Used by `features/auth/` and `components/layout/SidebarLayout.tsx` (to filter nav by role).
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
  routes/         → one file per feature/domain
    index.ts        → combines every router into one, mounted at /api
    health.ts        → infra/monitoring only
    users.ts         → Profile + Dashboard + Community-leaderboard data
    community.ts      → Community feature (feed posts + anonymous Q&A)  [renamed from posts.ts]
    study.ts          → Study Hub feature (materials CRUD, feature-status map)
    marketplace.ts    → Marketplace feature
    clubs.ts          → Clubs + Career(internships) + Community(events)
    stats.ts          → Dashboard + Admin + Moderator aggregate stats
    academic.ts       → College/Course/Semester/Subject hierarchy (admin CRUD + public signup reads)
    auth.ts           → Student signup (3-step OTP) + signin (2-step OTP)
    admin.ts          → Legacy Semesters, Feature Registry, Moderator accounts, Audit Log
    moderator.ts      → Study material approval queue, feature toggles (write side), exam schedules, timetables
```

### Route files in detail
| File | Endpoints | Feature it powers |
|---|---|---|
| `routes/health.ts` | `GET /api/healthz` | Infra/monitoring |
| `routes/users.ts` | `GET /users`, `GET /users/:id`, `PATCH /users/:id` | **Profile**, **Dashboard** stats, **Community leaderboard** |
| `routes/community.ts` | `GET /posts`, `POST /posts`, `PATCH /posts/:id/like`, Q&A endpoints | **Community** (feed + anonymous Q&A) |
| `routes/study.ts` | `GET /study/feature-status` (public, effective on/off map for every registry feature — resolves `forcedActive`/`globalEnabled`/parent-inheritance), `GET /study/materials` (approved only), `GET /study/recent` (4 newest approved, for Dashboard), `GET /study/materials/:id`, `POST /study/materials` (lands as `pending`), `PATCH /study/materials/:id/download` | **Study Hub**, **Dashboard** widget |
| `routes/marketplace.ts` | `GET /marketplace/listings`, `POST /marketplace/listings`, `DELETE /marketplace/listings/:id` | **Marketplace** |
| `routes/clubs.ts` | fetch/join clubs, list communities/events, list internships | **Clubs**, **Career** (internships), **Community** (events) |
| `routes/stats.ts` | aggregate CGPA/attendance summary, global usage/reports/verification counts | **Dashboard**, **Admin Overview**, **Moderator Overview** |
| `routes/academic.ts` | Admin CRUD (all soft-delete via `status`+`deletedAt`, all write audit-logged): `/admin/colleges`, `/admin/courses?collegeId=`, `/admin/course-semesters?courseId=`, `/admin/subjects?semesterId=` (GET/POST/PATCH/DELETE each). **Public, unauthenticated reads** (active rows only, minimal fields): `GET /colleges`, `GET /colleges/:id/courses`, `GET /courses/:id/semesters` | **Admin → Colleges tab**, **Signup** (cascading dropdowns) |
| `routes/auth.ts` | `POST /auth/signup/initiate` (validates college active + email domain match + course belongs to college + semester belongs to course & active/upcoming; hashes password; stores pending signup + OTP in memory), `POST /auth/signup/complete` (verifies OTP, inserts `users` row), `POST /auth/signup/resend`, `POST /auth/signin` (bcrypt-compares password, issues OTP), `POST /auth/signin/verify`, `POST /auth/signin/resend` | **Signup**, **Signin** (student OTP flow) |
| `routes/admin.ts` | `/admin/semesters` CRUD (**legacy global** semester list — see 5.2 warning), `/admin/features` CRUD (feature registry), `/admin/moderators` GET/POST/PATCH (creates a `users` row with `role="low_admin"` + `moderator_scopes` rows), `GET /admin/audit-log` (latest 100) | **Admin** (Semesters, Feature Registry, Moderators, Audit Log tabs) |
| `routes/moderator.ts` | `/moderator/materials` (list/approve/reject/edit/delete — writes `status`, `approvedBy`/`rejectedBy`, `reviewedAt`), `/moderator/toggles` GET (merges `feature_registry` + `feature_toggles` for a `?course=&semester=` scope) + PATCH `:featureName` (upserts a toggle row, blocked if the feature is `forcedActive` and the request tries to disable it; audit-logged), `/moderator/exam-schedules`, `/moderator/timetables` | **Moderator** dashboard |

All routes validate request bodies with Zod. Older routes (`users.ts`, `community.ts`,
`study.ts`, `marketplace.ts`, `clubs.ts`, `stats.ts`) import shared schemas from
`lib/api-zod`. **Newer routes (`academic.ts`, `auth.ts`, `admin.ts`, `moderator.ts`)
define their own `zod` schemas inline in the route file** rather than using
`lib/api-zod` — this is why the OpenAPI spec in `lib/api-spec` no longer fully
describes the API surface (see Section 6).

`writeAudit()` (duplicated locally in `academic.ts`, `admin.ts`, and `moderator.ts`
— not a shared helper) inserts a row into `audit_log` for every create/update/delete
on colleges, courses, course-semesters, subjects, legacy semesters, features,
moderators, and feature-toggle changes. Study material approve/reject also writes
an audit entry from `moderator.ts`.

> ⚠️ **No server-side auth/authorization exists on any route.** `/api/admin/*` and
> `/api/moderator/*` are wide open — there's no session, JWT, or role-check
> middleware anywhere in `app.ts` or the individual routers. Access control today
> is purely a client-side UI convention (only the Admin/Moderator pages call
> them). Treat this as a known, pre-existing gap across the whole app — not
> something introduced by any specific feature — and prioritize fixing it before
> real users/data are involved. See Section 9 for what a fix would need to cover.

---

## 5. Database — `lib/db/src`

Drizzle ORM schema, PostgreSQL. `index.ts` exports the `db` client plus every table
(re-exported via `export * from "./schema"`, which re-exports each schema file below).
`drizzle.config.ts` configures schema push (`pnpm --filter @workspace/db run push`)
against `DATABASE_URL` — **there are no numbered migration files; schema changes are
pushed directly** (safe for empty/dev tables, review before running against
populated production data).

| Schema file | Table(s) | Key columns | Feature |
|---|---|---|---|
| `schema/users.ts` | `users` | `id`, `name`, `email` (unique), `passwordHash`, `role` (`student`\|`low_admin`\|`admin`), `college`/`department`/`courseName` (legacy text, kept for compat), `collegeId`/`courseId`/`semesterId` (FKs, nullable during rollout), `passInYear`, `passOutYear`, `year`, `reputationScore`, `reputationLevel`, `cgpa`, `attendance`, `verified`, `status` (`active`\|`suspended`\|`disabled`), `deletedAt` | Profile, Dashboard, Auth, Admin (Moderators tab reuses this table with `role="low_admin"`) |
| `schema/posts.ts` | `posts`, `qa_questions` | `collegeId` (FK), author info, `content`/`question`, `category`, `likes`/`upvotes`, `anonymous`, `status` (`active`\|`hidden`\|`removed`), `deletedAt` | Community |
| `schema/study.ts` | `study_materials` | `title`, legacy text `subject`/`course`/`semester` + normalized `collegeId`/`courseId`/`semesterId`/`subjectId` (FKs, nullable), `fileType`, `downloads`, `rating`, `status` (`pending`\|`approved`\|`rejected`), `rejectionReason`, `approvedBy`/`rejectedBy`, `reviewedAt` | Study Hub, Moderator approval queue |
| `schema/marketplace.ts` | `listings` | `collegeId` (FK), `sellerId` (FK → `users`), `title`, `price`, `listingType` (`buy_sell`\|`housing`\|`service`), `sellerVerified`, `featured`, `status` (`active`\|`sold`\|`disabled`), `deletedAt` | Marketplace |
| `schema/clubs.ts` | `clubs`, `communities`, `events`, `internships` | `collegeId` (FK, nullable = cross-college), `memberCount`, event dates, internship postings, `status` per-table, `deletedAt` | Clubs, Career, Community |
| `schema/academic.ts` | `colleges`, `courses`, `course_semesters`, `subjects` | see Section 5.1 | Admin (Colleges tab), Signup |
| `schema/admin.ts` | `semesters` (legacy, global), `feature_registry`, `feature_toggles`, `moderator_scopes`, `exam_schedules`, `class_timetables`, `audit_log` | see Section 5.2 | Admin, Moderator |

### 5.0 📋 Full table-by-table column reference (exact — copy/paste ready)

This is the ground truth for every column, type, default, constraint, FK, and
index in the database, straight from the Drizzle schema files. Use this section
when writing a migration, a new query, or a Zod schema — it should match
`lib/db/src/schema/*.ts` exactly; if it ever looks out of date, the `.ts` file
wins (re-sync this table).

Legend: **PK** = primary key, **FK→table.col** = foreign key, **U** = unique,
**NN** = not null, `deletedAt` present = soft-delete table (never hard-deleted
in normal operation).

#### `users` (`schema/users.ts`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | serial | PK | |
| `name` | text | NN | |
| `email` | text | NN, U | lowercased before insert by `auth.ts` |
| `passwordHash` | text | nullable | bcrypt hash; null for admin/mod (they never hit the DB — see Section 9) |
| `college` | text | NN, default `""` | **legacy** free-text, kept for back-compat |
| `department` | text | NN, default `""` | **legacy** free-text |
| `courseName` | text | nullable | **legacy** free-text |
| `collegeId` | integer | FK→`colleges.id` (`ON DELETE SET NULL`) | normalized, nullable during rollout |
| `courseId` | integer | FK→`courses.id` (`ON DELETE SET NULL`) | normalized, nullable during rollout |
| `semesterId` | integer | FK→`course_semesters.id` (`ON DELETE SET NULL`) | normalized, nullable during rollout |
| `passInYear` | integer | nullable | |
| `passOutYear` | integer | nullable | |
| `year` | integer | NN, default `1` | year of study |
| `bio` | text | nullable | |
| `avatarUrl` | text | nullable | |
| `role` | text | NN, default `"student"` | `"student"` \| `"low_admin"` \| `"admin"` |
| `reputationScore` | integer | NN, default `0` | |
| `reputationLevel` | text | NN, default `"bronze"` | |
| `verified` | boolean | NN, default `false` | |
| `cgpa` | real | nullable | |
| `attendance` | real | nullable | |
| `status` | text | NN, default `"active"` | `"active"` \| `"suspended"` \| `"disabled"` |
| `deletedAt` | timestamptz | nullable | soft delete |
| `createdAt` | timestamptz | NN, default now | |
| `updatedAt` | timestamptz | NN, default now, auto-updates on write | |
| **Indexes** | | | `users_college_id_idx`, `users_course_id_idx`, `users_semester_id_idx`, `users_role_idx`, `users_status_idx` |

#### `posts` (`schema/posts.ts`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | serial | PK | |
| `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable |
| `authorId` | integer | nullable | **not** an FK constraint in the schema (plain integer) |
| `authorName` | text | nullable | |
| `authorAvatar` | text | nullable | |
| `authorDept` | text | nullable | |
| `authorLevel` | text | nullable | |
| `content` | text | NN | |
| `imageUrl` | text | nullable | |
| `category` | text | NN, default `"campus_life"` | `academics`\|`events`\|`campus_life`\|`entertainment`\|`announcement` |
| `likes` | integer | NN, default `0` | |
| `commentsCount` | integer | NN, default `0` | no `comments` table exists yet — see Section 9 |
| `anonymous` | boolean | NN, default `false` | |
| `status` | text | NN, default `"active"` | `"active"` \| `"hidden"` \| `"removed"` |
| `deletedAt` | timestamptz | nullable | soft delete |
| `createdAt` | timestamptz | NN, default now | |
| **Indexes** | | | `posts_college_id_idx`, `posts_author_id_idx`, `posts_status_idx` |

#### `qa_questions` (`schema/posts.ts`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | serial | PK | |
| `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable |
| `authorId` | integer | nullable | plain integer, not FK-constrained |
| `question` | text | NN | |
| `upvotes` | integer | NN, default `0` | |
| `repliesCount` | integer | NN, default `0` | |
| `status` | text | NN, default `"active"` | `"active"` \| `"hidden"` \| `"removed"` |
| `deletedAt` | timestamptz | nullable | soft delete |
| `createdAt` | timestamptz | NN, default now | |
| **Indexes** | | | `qa_questions_college_id_idx`, `qa_questions_status_idx` |

#### `study_materials` (`schema/study.ts`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | serial | PK | |
| `title` | text | NN | |
| `subject` | text | NN | **legacy** free-text |
| `course` | text | NN | **legacy** free-text |
| `semester` | text | NN | **legacy** free-text |
| `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | normalized, nullable |
| `courseId` | integer | FK→`courses.id` (`SET NULL`) | normalized, nullable |
| `semesterId` | integer | FK→`course_semesters.id` (`SET NULL`) | normalized, nullable |
| `subjectId` | integer | FK→`subjects.id` (`SET NULL`) | normalized, nullable |
| `fileType` | text | NN, default `"pdf"` | |
| `fileSizeMb` | real | NN, default `0` | |
| `downloads` | integer | NN, default `0` | |
| `rating` | real | NN, default `0` | |
| `ratingCount` | integer | NN, default `0` | |
| `verified` | boolean | NN, default `false` | legacy flag, superseded by `status` below |
| `status` | text | NN, default `"pending"` | `"pending"` → `"approved"` \| `"rejected"` |
| `rejectionReason` | text | nullable | |
| `approvedBy` | text | nullable | |
| `rejectedBy` | text | nullable | |
| `reviewedAt` | timestamptz | nullable | |
| `uploadedBy` | text | NN | |
| `sharedWith` | text | nullable | |
| `createdAt` | timestamptz | NN, default now | |
| **Indexes** | | | `study_materials_college_id_idx`, `study_materials_subject_id_idx`, `study_materials_status_idx` |

#### `listings` (`schema/marketplace.ts`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | serial | PK | |
| `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable |
| `sellerId` | integer | FK→`users.id` (`SET NULL`) | nullable |
| `title` | text | NN | |
| `description` | text | nullable | |
| `price` | real | NN | |
| `priceUnit` | text | NN, default `""` | e.g. `"/month"` |
| `category` | text | NN | |
| `listingType` | text | NN, default `"buy_sell"` | `"buy_sell"` \| `"housing"` \| `"service"` |
| `imageUrl` | text | nullable | |
| `sellerName` | text | NN | |
| `sellerRating` | real | NN, default `0` | |
| `sellerVerified` | boolean | NN, default `false` | |
| `location` | text | nullable | |
| `condition` | text | nullable | |
| `featured` | boolean | NN, default `false` | |
| `status` | text | NN, default `"active"` | `"active"` \| `"sold"` \| `"disabled"` |
| `deletedAt` | timestamptz | nullable | soft delete |
| `createdAt` | timestamptz | NN, default now | |
| **Indexes** | | | `listings_college_id_idx`, `listings_seller_id_idx`, `listings_status_idx` |

#### `clubs` / `communities` / `events` / `internships` (`schema/clubs.ts`)
| Table | Column | Type | Constraints | Notes |
|---|---|---|---|---|
| `clubs` | `id` | serial | PK | |
| `clubs` | `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable = cross-college club |
| `clubs` | `name` | text | NN | |
| `clubs` | `description` | text | NN | |
| `clubs` | `category` | text | NN | |
| `clubs` | `memberCount` | integer | NN, default `0` | |
| `clubs` | `official` | boolean | NN, default `false` | |
| `clubs` | `trending` | boolean | NN, default `false` | |
| `clubs` | `imageUrl` | text | nullable | |
| `clubs` | `badge` | text | nullable | |
| `clubs` | `nextEvent` | text | nullable | |
| `clubs` | `nextEventDate` | text | nullable | |
| `clubs` | `status` | text | NN, default `"active"` | `"active"` \| `"disabled"` |
| `clubs` | `deletedAt` | timestamptz | nullable | soft delete |
| `clubs` | `createdAt` | timestamptz | NN, default now | |
| `communities` | `id` | serial | PK | |
| `communities` | `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable |
| `communities` | `name` | text | NN | |
| `communities` | `memberCount` | integer | NN, default `0` | |
| `communities` | `icon` | text | NN | |
| `communities` | `color` | text | NN, default `"#3b82f6"` | |
| `communities` | `status` | text | NN, default `"active"` | |
| `communities` | `deletedAt` | timestamptz | nullable | soft delete; **note: no `createdAt` column on this table** |
| `events` | `id` | serial | PK | |
| `events` | `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable |
| `events` | `title` | text | NN | |
| `events` | `date` | text | NN | plain text, not a real date type |
| `events` | `time` | text | NN | |
| `events` | `venue` | text | NN | |
| `events` | `organizer` | text | NN | |
| `events` | `status` | text | NN, default `"upcoming"` | `upcoming`\|`approved`\|`pending`\|`cancelled` |
| `events` | `deletedAt` | timestamptz | nullable | soft delete |
| `events` | `createdAt` | timestamptz | NN, default now | |
| `internships` | `id` | serial | PK | |
| `internships` | `collegeId` | integer | FK→`colleges.id` (`SET NULL`) | nullable |
| `internships` | `title` | text | NN | |
| `internships` | `company` | text | NN | |
| `internships` | `location` | text | NN | |
| `internships` | `salary` | text | NN | plain text, e.g. `"$1500/mo"` |
| `internships` | `status` | text | NN, default `"open"` | `"open"` \| `"closed"` |
| `internships` | `logoUrl` | text | nullable | |
| `internships` | `isNew` | boolean | NN, default `false` | |
| `internships` | `deletedAt` | timestamptz | nullable | soft delete |
| `internships` | `createdAt` | timestamptz | NN, default now | |
| **Indexes** | | | | `clubs_college_id_idx`, `clubs_status_idx`, `communities_college_id_idx`, `events_college_id_idx`, `events_status_idx`, `internships_college_id_idx`, `internships_status_idx` |

#### `colleges` / `courses` / `course_semesters` / `subjects` (`schema/academic.ts`) — see Section 5.1 for the narrative version
| Table | Column | Type | Constraints | Notes |
|---|---|---|---|---|
| `colleges` | `id` | serial | PK | |
| `colleges` | `name` | text | NN | |
| `colleges` | `code` | text | NN, U | e.g. `"MIT01"` |
| `colleges` | `slug` | text | NN, U | e.g. `"mit-college"`, auto-slugified from `name` if omitted on create |
| `colleges` | `emailDomain` | text | NN, U | e.g. `"dit.edu"` — gates signup |
| `colleges` | `city` | text | nullable | |
| `colleges` | `state` | text | nullable | |
| `colleges` | `pincode` | text | nullable | |
| `colleges` | `logoUrl` | text | nullable | |
| `colleges` | `status` | text | NN, default `"active"` | `"active"` \| `"disabled"` |
| `colleges` | `deletedAt` | timestamptz | nullable | soft delete |
| `colleges` | `createdAt` | timestamptz | NN, default now | |
| `colleges` | `updatedAt` | timestamptz | NN, default now, auto-updates | |
| `courses` | `id` | serial | PK | |
| `courses` | `collegeId` | integer | **NN**, FK→`colleges.id` (`ON DELETE RESTRICT`) | can't delete a college with courses still pointing at it |
| `courses` | `name` | text | NN | e.g. `"B.Tech Computer Science"` |
| `courses` | `code` | text | NN | e.g. `"CSE"` — unique **per college**, not globally |
| `courses` | `durationSemesters` | integer | NN, default `8` | drives "Generate Remaining" bulk-create |
| `courses` | `status` | text | NN, default `"active"` | `"active"` \| `"disabled"` |
| `courses` | `deletedAt` | timestamptz | nullable | soft delete |
| `courses` | `createdAt` / `updatedAt` | timestamptz | NN, default now (updatedAt auto-updates) | |
| `course_semesters` | `id` | serial | PK | |
| `course_semesters` | `courseId` | integer | **NN**, FK→`courses.id` (`ON DELETE RESTRICT`) | |
| `course_semesters` | `number` | integer | NN | `1..durationSemesters`, unique **per course** |
| `course_semesters` | `name` | text | NN | e.g. `"Semester 5"` |
| `course_semesters` | `startDate` / `endDate` | text | nullable | plain text, not a real date type |
| `course_semesters` | `status` | text | NN, default `"upcoming"` | `"active"`\|`"disabled"`\|`"upcoming"`\|`"archived"` |
| `course_semesters` | `deletedAt` | timestamptz | nullable | soft delete |
| `course_semesters` | `createdAt` / `updatedAt` | timestamptz | NN, default now (updatedAt auto-updates) | |
| `subjects` | `id` | serial | PK | |
| `subjects` | `semesterId` | integer | **NN**, FK→`course_semesters.id` (`ON DELETE RESTRICT`) | |
| `subjects` | `name` | text | NN | e.g. `"Data Structures & Algorithms"` |
| `subjects` | `code` | text | NN | e.g. `"CS301"` — unique **per semester** |
| `subjects` | `credits` | integer | NN, default `3` | |
| `subjects` | `status` | text | NN, default `"active"` | `"active"` \| `"disabled"` |
| `subjects` | `deletedAt` | timestamptz | nullable | soft delete |
| `subjects` | `createdAt` / `updatedAt` | timestamptz | NN, default now (updatedAt auto-updates) | |
| **Unique indexes** | | | | `courses_college_code_idx` (collegeId+code), `course_semesters_course_number_idx` (courseId+number), `subjects_semester_code_idx` (semesterId+code) |
| **Other indexes** | | | | `colleges_status_idx`, `courses_college_id_idx`, `courses_status_idx`, `course_semesters_course_id_idx`, `course_semesters_status_idx`, `subjects_semester_id_idx`, `subjects_status_idx` |

> ⚠️ Note the `ON DELETE RESTRICT` on `courses.collegeId`, `course_semesters.courseId`,
> and `subjects.semesterId` — Postgres will **reject** a hard delete of a parent
> row if children exist. This is why Admin "delete" always does a soft delete
> (`status="disabled"` + `deletedAt`) instead of a real `DELETE` for these four
> tables — a real delete would usually fail once any course/semester/subject
> has been added underneath it.

#### `semesters` (legacy, global) / `feature_registry` / `feature_toggles` / `moderator_scopes` / `exam_schedules` / `class_timetables` / `audit_log` (`schema/admin.ts`)
| Table | Column | Type | Constraints | Notes |
|---|---|---|---|---|
| `semesters` | `id` | serial | PK | |
| `semesters` | `name` | text | NN | e.g. `"Semester 5"` |
| `semesters` | `code` | text | NN, U | e.g. `"sem5"` |
| `semesters` | `startDate` / `endDate` | text | nullable | |
| `semesters` | `status` | text | NN, default `"upcoming"` | `"active"` \| `"archived"` \| `"upcoming"` |
| `semesters` | `createdAt` / `updatedAt` | timestamptz | NN, default now | **`updatedAt` does not auto-update** (set manually in `admin.ts`'s PATCH handler) |
| `feature_registry` | `id` | serial | PK | |
| `feature_registry` | `name` | text | NN, U | internal key, e.g. `"study_hub"` |
| `feature_registry` | `label` | text | NN | display label |
| `feature_registry` | `description` | text | nullable | |
| `feature_registry` | `defaultEnabled` | boolean | NN, default `true` | fallback when no toggle row exists for a scope |
| `feature_registry` | `forcedActive` | boolean | NN, default `false` | moderators cannot disable it (403 if attempted) |
| `feature_registry` | `retired` | boolean | NN, default `false` | soft-hidden from Moderator UI |
| `feature_registry` | `globalEnabled` | boolean | NN, default `true` | platform-wide kill switch |
| `feature_registry` | `parentName` | text | nullable | references another row's `name`; null = top-level |
| `feature_registry` | `createdAt` | timestamptz | NN, default now | |
| `feature_toggles` | `id` | serial | PK | |
| `feature_toggles` | `featureName` | text | NN | references `feature_registry.name` (not FK-constrained) |
| `feature_toggles` | `course` / `semester` | text | NN | **legacy** free-text scope — this is what all current read/write paths actually use |
| `feature_toggles` | `collegeId` | integer | FK→`colleges.id` (`CASCADE`) | normalized scope, **unused by current routes** |
| `feature_toggles` | `courseId` | integer | FK→`courses.id` (`CASCADE`) | normalized scope, **unused by current routes** |
| `feature_toggles` | `semesterId` | integer | FK→`course_semesters.id` (`CASCADE`) | normalized scope, **unused by current routes** |
| `feature_toggles` | `enabled` | boolean | NN, default `true` | |
| `feature_toggles` | `updatedById` | integer | nullable | not FK-constrained |
| `feature_toggles` | `updatedByName` | text | nullable | |
| `feature_toggles` | `updatedAt` | timestamptz | NN, default now | set manually on every PATCH |
| `moderator_scopes` | `id` | serial | PK | |
| `moderator_scopes` | `userId` | integer | NN | not FK-constrained (should reference `users.id`) |
| `moderator_scopes` | `course` / `semester` | text | NN | **legacy** free-text — what's actually used |
| `moderator_scopes` | `collegeId`/`courseId`/`semesterId` | integer | FK→respective tables (`CASCADE`) | normalized scope, **unused by current routes** |
| `moderator_scopes` | `createdAt` | timestamptz | NN, default now | |
| `exam_schedules` | `id` | serial | PK | |
| `exam_schedules` | `title` | text | NN | |
| `exam_schedules` | `course` / `semester` | text | NN | free-text scope |
| `exam_schedules` | `examSession` | text | NN | e.g. `"End-Semester Dec 2025"` |
| `exam_schedules` | `dateFrom` / `dateTo` | text | nullable | plain text |
| `exam_schedules` | `fileUrl` | text | nullable | no storage integration behind this — plain URL string |
| `exam_schedules` | `description` | text | nullable | |
| `exam_schedules` | `uploaderName` | text | nullable | |
| `exam_schedules` | `uploadedById` | integer | nullable | not FK-constrained |
| `exam_schedules` | `createdAt` / `updatedAt` | timestamptz | NN, default now | `updatedAt` set manually |
| `class_timetables` | `id` | serial | PK | |
| `class_timetables` | `title` | text | NN | |
| `class_timetables` | `course` / `semester` | text | NN | free-text scope |
| `class_timetables` | `section` | text | NN | e.g. `"Section A"` |
| `class_timetables` | `effectiveFrom` / `effectiveTo` | text | nullable | plain text |
| `class_timetables` | `fileUrl` | text | nullable | no storage integration |
| `class_timetables` | `description` | text | nullable | |
| `class_timetables` | `uploaderName` | text | nullable | |
| `class_timetables` | `uploadedById` | integer | nullable | not FK-constrained |
| `class_timetables` | `createdAt` / `updatedAt` | timestamptz | NN, default now | `updatedAt` set manually |
| `audit_log` | `id` | serial | PK | |
| `audit_log` | `actorId` | integer | nullable | not FK-constrained |
| `audit_log` | `actorName` | text | NN | |
| `audit_log` | `actorRole` | text | NN | |
| `audit_log` | `action` | text | NN | e.g. `"create_college"`, `"toggle_feature"`, `"update_moderator"` |
| `audit_log` | `entityType` | text | NN | e.g. `"college"`, `"feature"`, `"user"` |
| `audit_log` | `entityId` | text | nullable | |
| `audit_log` | `entityLabel` | text | nullable | |
| `audit_log` | `beforeState` / `afterState` | text | nullable | raw strings, not structured diffs |
| `audit_log` | `scope` | text | nullable | e.g. `"CS301 × Semester 5"` |
| `audit_log` | `createdAt` | timestamptz | NN, default now | |
| **Indexes** | | | | `feature_toggles_scope_idx` (collegeId, courseId, semesterId), `moderator_scopes_user_id_idx` |

### 5.1 Academic hierarchy — `College → Course → Semester → Subject`

This is the normalized master-data backbone that lets the platform host many
colleges without schema changes (adding a college is an INSERT, not a
migration). Every table below has `status` (`active`/`disabled`) + `deletedAt`
for soft delete — nothing is hard-deleted from these four tables in normal
operation; Admin "delete" always sets `deletedAt` + `status="disabled"`.

| Table | Key columns | Notes |
|---|---|---|
| `colleges` | `name`, `code` (unique), `slug` (unique, auto-generated from `name` if omitted), `emailDomain` (unique — e.g. `"dit.edu"`), `city`, `state`, `pincode`, `logoUrl` | `emailDomain` gates student signup: only `@<emailDomain>` addresses may register for that college. Unique-constraint violations on create/update return `409` with a friendly message (only `academic.ts` does this try/catch — see Section 9). |
| `courses` | `collegeId` (FK, cascade delete), `name`, `code`, `durationSemesters` (default 8) | The "how many semesters does this course have" field admins set when creating a course; drives the "Generate Remaining" bulk-create button in Admin → Colleges → Courses → Semesters. |
| `course_semesters` | `courseId` (FK, cascade delete), `number`, `name`, `startDate`, `endDate`, `status` (`active`\|`upcoming`\|`disabled`\|`archived`) | Signup and the public `/api/courses/:id/semesters` endpoint only ever return `active`/`upcoming` rows. |
| `subjects` | `semesterId` (FK, cascade delete), `name`, `code`, `credits` | Leaf level of the hierarchy. No public read endpoint yet — only `GET /admin/subjects?semesterId=` (admin CRUD, includes disabled rows), so nothing student-facing (e.g. Study Hub subject filters) reads from this table yet. |

`users` and `study_materials` both have nullable FK columns (`collegeId`/
`courseId`/`semesterId`, plus `subjectId` on `study_materials`) pointing into
this hierarchy, added during rollout alongside legacy free-text columns kept for
backward compatibility. `feature_toggles` and `moderator_scopes` also have
nullable `collegeId`/`courseId`/`semesterId` for scoping to a specific
college/course/semester (all-null = platform-wide default) — **but the current
UI/routes for both still key off the legacy free-text `course`/`semester`
strings, not these FK columns**, so the normalized scope columns on those two
tables exist in the schema but aren't wired up to any read/write path yet.

**Signup enforcement:** `POST /api/auth/signup/initiate` (in `routes/auth.ts`)
requires `collegeId`/`courseId`/`semesterId` — not free-text names — and
validates server-side that (a) the college exists and is `active`, (b) the
submitted email's domain matches that college's `emailDomain`, (c) the course
belongs to that college and is `active`, and (d) the semester belongs to that
course and is `active`/`upcoming`. The frontend (`SignupPage.tsx`) presents this
as three cascading dropdowns (college → course → semester), each fetched from
the public `GET /api/colleges`, `GET /api/colleges/:id/courses`,
`GET /api/courses/:id/semesters` endpoints (active rows only, no auth, no
sensitive fields returned).

### 5.2 Admin/Moderator operational tables

| Table | Purpose |
|---|---|
| `semesters` | **Legacy, global** semester list (e.g. code `"sem5"`, name `"Semester 5"`) managed from the Admin → **Semesters** tab via `admin.ts`. This is a completely separate table from the per-course `course_semesters` table in Section 5.1 — editing/deleting a row here has no effect on Signup or the Colleges tab, and vice versa. Not yet consolidated; don't assume the two are linked. |
| `feature_registry` | Master list of toggleable features (e.g. `"study_hub"`), managed from Admin → **Feature Registry**. Fields: `defaultEnabled` (fallback when no per-scope toggle row exists), `forcedActive` (moderators cannot disable it — `PATCH /moderator/toggles/:name` returns 403 if `forcedActive && enabled===false`), `retired` (soft-hidden), `globalEnabled` (platform-wide kill switch, independent of per-scope toggles), `parentName` (nests a feature under a parent; if the parent is off, `GET /study/feature-status` reports the child as off too, regardless of the child's own flags). |
| `feature_toggles` | Per `course`×`semester` (free-text scope, see 5.1 caveat) enable/disable rows referencing `feature_registry.name`. Read/written by the Moderator → Feature Toggles tab (`moderator.ts`). `GET /study/feature-status` (public) is a *different*, simpler view: it only resolves `feature_registry`'s own global/forced/parent flags, and does **not** consult `feature_toggles` at all — so a moderator disabling a feature for one course/semester via the toggle UI does not currently affect what `/study/feature-status` reports platform-wide. These are two independent notions of "is this feature on." |
| `moderator_scopes` | Which `course`×`semester` (free-text) each `low_admin` user is allowed to moderate; assigned from Admin → Moderators. Not currently enforced server-side (see the auth gap in Section 9) — it only drives what the Moderator UI *shows* by default. |
| `exam_schedules`, `class_timetables` | Moderator-managed file/date metadata scoped by free-text `course`/`semester`. `fileUrl` is a plain text column — there's no file upload/storage wired up yet, so in practice this is either left blank or expected to hold an externally-hosted link. |
| `audit_log` | Append-only log of admin/moderator actions (`action` values like `create_college`, `toggle_feature`, `update_moderator`), read via `GET /api/admin/audit-log` (latest 100). Nothing ever reads `beforeState`/`afterState` back into a diff view in the UI today — they're stored but only shown as raw strings. |

---

## 6. Shared API contract libs

| Dir | Purpose |
|---|---|
| `lib/api-spec` | OpenAPI YAML — originally the source of truth for endpoint shapes. **Now stale**: it does not describe `academic.ts`, `auth.ts`, `admin.ts`, or `moderator.ts` endpoints, since those were written with inline Zod schemas instead of being added to the spec. Codegen (Orval) was already bypassed before this due to an unrelated YAML parsing issue — see `replit.md`. |
| `lib/api-zod` | Zod schemas generated from the (partial/stale) spec — still used by the **older** backend routes (`users.ts`, `community.ts`, `study.ts`, `marketplace.ts`, `clubs.ts`, `stats.ts`) to validate requests/responses. |
| `lib/api-client-react` | TanStack Query hooks generated from the spec, plus `custom-fetch.ts`. **Not actually used anywhere in the frontend** — every feature page calls `fetch()` directly with `@tanstack/react-query`'s `useQuery`/`useMutation` wrapped around it, bypassing these generated hooks entirely. Safe to ignore unless someone re-enables codegen. |

---

## 7. Other folders

- **`artifacts/mockup-sandbox/`** — isolated Vite app for the Canvas design/preview tool. Not part of the deployed website; safe to ignore for live-site behavior.
- **`scripts/src/hello.ts`** — placeholder utility script for verifying workspace tooling. Not part of the app.

---

## 8. How a feature request typically touches files

Example — "let students comment on posts" (a Community feature change):
1. `lib/api-spec` — add the endpoint to the OpenAPI YAML if you want to keep it in sync (optional; newer routes skip this, see Section 6).
2. `lib/api-zod/src/generated` — add/update the Zod schema, or just write an inline `zod` schema in the route file (matches the pattern used by `academic.ts`/`auth.ts`/`admin.ts`/`moderator.ts`).
3. `artifacts/api-server/src/routes/community.ts` — add `POST /posts/:id/comments`, validate with Zod, write to DB.
4. `lib/db/src/schema/posts.ts` — add a `comments` table if it doesn't exist (nullable `collegeId` FK to match the pattern used by `posts`/`qa_questions`, plus `status`+`deletedAt` for soft delete if moderation will apply).
5. `artifacts/college-connect/src/features/community/CommunityPage.tsx` — call the new endpoint directly via `fetch` + TanStack Query (do **not** wire up `lib/api-client-react` — it's dead code today), render comment UI (replacing the current client-only mock).

Example — "let admins scope a feature toggle to a specific college/course/semester instead of free text" (fixing the 5.2 caveat):
1. `artifacts/api-server/src/routes/moderator.ts` — change `GET/PATCH /moderator/toggles` to accept/filter by `collegeId`/`courseId`/`semesterId` instead of (or alongside) `course`/`semester` strings.
2. `artifacts/college-connect/src/features/moderator/ModeratorPage.tsx` — swap the scope picker to use the cascading College→Course→Semester dropdowns (same pattern as `SignupPage.tsx`, backed by `academic.ts`'s public read endpoints) instead of free-text selects.
3. No DB migration needed — the FK columns already exist on `feature_toggles` (Section 5.1), they're just unused today.

**General rule:** find the feature in the table in Section 2, and every file you need to touch will be in that row's frontend folder + backend route file + DB table.

---

## 9. Known gotchas (see also `replit.md`)

- **No server-side auth/authorization anywhere.** No route in `app.ts` or any router checks a session, JWT, or role. `/api/admin/*` and `/api/moderator/*` will respond to any request. On the frontend, `/admin` and `/moderator` are also reachable by URL without being logged in at all — the `RoleGuard` helper in `App.tsx` exists but isn't applied to any route. Admin/moderator "login" itself is a hardcoded client-side credential check (`DEMO_STAFF` in `AuthContext.tsx`) that never touches the backend or database — only student signup/signin does real password hashing + OTP verification against the `users` table. Before any of this handles real users, add session/JWT-based auth middleware enforcing role on every `/admin` and `/moderator` route, and actually apply `RoleGuard` (or equivalent) on the frontend routes.
- **OTP codes are ephemeral and never actually delivered.** `auth.ts` stores pending OTPs in an in-memory `Map` (5-minute TTL) and returns the code directly in the API response as `demoOtp` instead of emailing/texting it. This means: OTPs are lost on every server restart, there is no real email/SMS delivery, and — in its current form — the OTP is visible in the network response, so it provides no real security benefit today. Needs a real email/SMS provider (Replit has integrations for this) plus a persistent (Redis/DB) OTP store before production use.
- **Two unrelated "semester" concepts.** The legacy global `semesters` table (Admin → Semesters tab) and the per-course `course_semesters` table (Admin → Colleges → Courses → Semesters, used by Signup) are entirely separate and not cross-referenced. Don't assume editing one affects the other.
- **Two unrelated notions of "is this feature on."** `GET /study/feature-status` (public) only resolves `feature_registry`'s own `globalEnabled`/`forcedActive`/`parentName` chain. The Moderator Feature Toggles tab (`feature_toggles` table) is a *separate* per-course×semester override that nothing student-facing currently reads. If you wire a feature page to respect toggles, decide which of these two systems (or both, merged) it should check — don't assume they're already combined.
- **`feature_toggles` and `moderator_scopes` have unused normalized FK columns.** Both tables have nullable `collegeId`/`courseId`/`semesterId` columns in the schema, but every current read/write path for them still keys off legacy free-text `course`/`semester` strings. Don't assume setting the FK columns has any effect yet — see Section 8's second example for what wiring this up would require.
- **`subjects` has no public read endpoint.** Only `GET /admin/subjects?semesterId=` exists (admin CRUD, includes disabled rows). If a student-facing feature (e.g. tagging Study Hub materials by real subject) needs this, add a new public endpoint mirroring the pattern in `academic.ts`'s other three public routes — don't reuse the admin one directly.
- **`exam_schedules`/`class_timetables` have no real file upload.** `fileUrl` is a plain text column with no storage integration behind it.
- **`lib/api-client-react` (generated TanStack Query hooks) is unused.** Every feature page calls `fetch()` directly. Don't wire new code to the generated hooks unless you also fix OpenAPI codegen — it'll silently be out of sync with `academic.ts`/`auth.ts`/`admin.ts`/`moderator.ts` either way (see Section 6).
- Do not run `pnpm dev` at the workspace root — use the Replit workflow or `pnpm --filter <package> run dev`.
- Schema changes are pushed directly via `pnpm --filter @workspace/db run push` — there's no migration history. Double check before pushing against a populated table (safe so far because tables affected by recent changes were empty).
- Most feature-page data is still mock data at the top of each page file — check the Feature Map's "Data status" column (Section 2) before assuming any given page is live from the API. Live-data features today: Signup/Signin, Study Hub, Marketplace, Community (feed+Q&A), Dashboard's "recent materials" widget, and Admin's Colleges/Semesters/Feature Registry/Moderators/Audit Log tabs plus all of Moderator except Reports. Everything else (Career, Clubs, Match, Profile showcase, Admin Overview, Moderator Reports) is mock.
- Backend route file naming mostly mirrors frontend feature folder names, with the noted exceptions above; `academic.ts`, `auth.ts`, `admin.ts`, and `moderator.ts` are cross-cutting/operational routers rather than 1:1 feature mirrors.

---

## 9.5 📝 Changelog — every project change so far

A running log of what changed, in what file(s), and why — newest first.
**Whenever you (an AI agent) make a change to the database schema or edit a
file in a way another AI reading this doc later would need to know about,
add a new entry at the top of this list** in the same format: date, one-line
summary, then bullet points naming the exact file(s)/table(s)/column(s)
touched and what changed. Keep entries factual and short — this is a log, not
a narrative; the "why" belongs in one clause, not a paragraph.

- **2026-07-10 — Full documentation pass on AIread.md (no code/schema changes)**
  - `AIread.md`: added Section 5.0 (exact column-by-column reference for
    every DB table), Section 10 (full file index — one line per source file
    across frontend/backend/`lib/*`), and this changelog section (9.5).
    Rewrote Section 4 route tables and Section 9 gotchas list for accuracy.
    No application code or database schema was changed in this pass.

- **2026-07-10 — Seeded default feature-registry rows (data fix, no schema change)**
  - `feature_registry` table: inserted 6 rows via `POST /api/admin/features`
    (`study_hub`, `marketplace`, `community`, `career`, `clubs`,
    `campus_match`) — the table was empty, which made the Moderator "Feature
    Toggles" tab show "No features registered yet." and look broken. No code
    changed; this was pure data seeding.

- **2026-07-10 — College email-domain-gated signup + cascading dropdowns**
  - `lib/db/src/schema/academic.ts`: added `emailDomain` (unique) and
    `pincode` columns to `colleges`.
  - `artifacts/api-server/src/routes/auth.ts`: signup now validates the
    submitted email's domain against `colleges.emailDomain` before creating
    an OTP.
  - `artifacts/api-server/src/routes/academic.ts`: added public
    read-only endpoints for colleges/courses/course-semesters so the signup
    form can populate cascading dropdowns without needing admin auth.
  - `artifacts/college-connect/src/features/auth/SignupPage.tsx`: replaced
    free-text college/course/semester fields with cascading dropdowns
    (`CollegeCombobox` + dependent Course/Semester selects) wired to the new
    endpoints.

- **2026-07-10 — Multi-college academic hierarchy (colleges → courses → course_semesters → subjects)**
  - `lib/db/src/schema/academic.ts` (new file): added `collegesTable`,
    `coursesTable`, `courseSemestersTable`, `subjectsTable` — normalized,
    FK-linked, soft-deletable (`status` + `deletedAt`) hierarchy.
  - `lib/db/src/schema/users.ts`, `study.ts`: added nullable
    `collegeId`/`courseId`/`semesterId` (and `subjectId` on
    `study_materials`) FK columns alongside the existing legacy free-text
    fields, for backward compatibility during rollout.
  - `lib/db/src/schema/posts.ts`, `marketplace.ts`, `clubs.ts`: added
    nullable `collegeId` FK column to `posts`, `qa_questions`, `listings`,
    `clubs`, `communities`, `events`, `internships` to scope content per
    college.
  - `artifacts/api-server/src/routes/academic.ts` (new file): full admin
    CRUD for colleges/courses/course-semesters/subjects, with a
    `writeAudit()` helper and a "Generate Remaining Semesters" bulk-create
    endpoint.
  - `artifacts/college-connect/src/features/admin/AdminPage.tsx`: added the
    nested Colleges → Courses → Semesters → Subjects drill-down UI
    (`CollegesTab` → `CollegeCoursesPanel` → `CourseSemestersPanel` →
    `SubjectsPanel`).

- **2026-07-10 — Admin + Moderator dashboards (DB-backed)**
  - `lib/db/src/schema/admin.ts` (new file): added `semestersTable`
    (legacy, global), `featureRegistryTable`, `featureTogglesTable`,
    `moderatorScopesTable`, `examSchedulesTable`, `classTimetablesTable`,
    `auditLogTable`.
  - `artifacts/api-server/src/routes/admin.ts` (new file): CRUD for legacy
    semesters, feature registry, moderator accounts; audit-log read.
  - `artifacts/api-server/src/routes/moderator.ts` (new file): study
    material approve/reject queue, per-scope feature-toggle upsert,
    exam-schedule/timetable CRUD.
  - `artifacts/college-connect/src/features/admin/AdminPage.tsx`,
    `features/moderator/ModeratorPage.tsx` (new files): built out both
    dashboards end-to-end against the routes above.
  - Ordering note preserved from that work: Admin must seed features in
    `feature_registry` before Moderators have anything to toggle per scope.

- **2026-07-10 — Study materials approval flow**
  - `lib/db/src/schema/study.ts`: replaced the old `verified: boolean` flag
    on `study_materials` with a `status` text field
    (`"pending"` → `"approved"` | `"rejected"`), plus `rejectionReason`,
    `approvedBy`, `rejectedBy`, `reviewedAt`.
  - `artifacts/api-server/src/routes/study.ts`: student-facing `GET`
    endpoint now filters to `status = "approved"` only; new materials are
    created as `"pending"`.
  - `artifacts/api-server/src/routes/moderator.ts`: added
    approve/reject actions that set `status` + the audit columns above.

> Earlier history (initial project scaffold — base schema for `users`,
> `posts`, `qa_questions`, `study_materials`, `listings`, `clubs`,
> `communities`, `events`, `internships`; base routes; base frontend pages)
> predates this changelog's introduction and is fully captured by Sections
> 3–8 as the current-state description, so it isn't repeated here.

---

## 10. 🗂️ Full File Index — every source file, one line each

Every non-generated, non-`node_modules` source file in the repo. Use this when
you need to jump straight to a specific file instead of going through the
Feature Map. Generated/build output (`dist/`, `.vite/`, `node_modules/`,
`lib/*/src/generated/`) is intentionally omitted — it's derived, never edited
by hand.

### Root
| File | Purpose |
|---|---|
| `AIread.md` | This file. |
| `replit.md` | Project overview + user preferences, read by the agent every session. |
| `package.json` | Root workspace manifest (scripts, shared devDependencies). |
| `pnpm-workspace.yaml` | Declares which folders are pnpm workspace packages. |
| `pnpm-lock.yaml` | Lockfile — do not hand-edit. |
| `tsconfig.json` / `tsconfig.base.json` | Root/shared TypeScript config extended by each package. |
| `.replit` | Replit run/workflow configuration. |
| `.npmrc`, `.gitignore`, `.replitignore` | Tooling config, not app logic. |
| `start.sh` | Legacy single-process start script — **not used by any current workflow** (superseded by the three per-artifact workflows); safe to ignore, don't reintroduce a workflow that calls it. |
| `scripts/src/hello.ts` | Placeholder script verifying workspace tooling works; not part of the app. |
| `scripts/post-merge.sh` | Runs automatically after a task-agent merge (see `post-merge-setup` skill) to reconcile the environment. |

### `artifacts/college-connect/src` — frontend

**Entry & routing**
| File | Purpose |
|---|---|
| `main.tsx` | React root, mounts `<App />`. |
| `App.tsx` | Declares every `wouter` route, wraps authenticated pages in `SidebarLayout`, provides `QueryClientProvider`/`AuthProvider`/`SubmissionsProvider`. Contains an unused `RoleGuard` helper (see Section 9). |
| `index.css` | Tailwind v4 theme tokens + global styles. |

**Features** (one folder per row in Section 2's Feature Map)
| File | Purpose |
|---|---|
| `features/home/HomePage.tsx` | Public landing page. |
| `features/auth/LoginPage.tsx` | Student email+password→OTP sign-in UI; admin/moderator demo-credential login UI. |
| `features/auth/SignupPage.tsx` | 3-step student signup UI: form (cascading College→Course→Semester dropdowns) → OTP → done. Contains `CollegeCombobox` and the cascade-fetch `useEffect` chain with error states. |
| `features/auth/auth-utils.ts` | `homeRouteForRole()` — post-login redirect target by role. |
| `features/dashboard/DashboardPage.tsx` | Student home: CGPA/attendance/exam countdown, recent materials (live), marketplace highlights, feed/polls (mock). |
| `features/study/StudyPage.tsx` | Study Hub: materials list/upload (live), AI tools UI (mock). |
| `features/marketplace/MarketplacePage.tsx` | Buy/sell/housing/services listings (live). |
| `features/community/CommunityPage.tsx` | Feed + anonymous Q&A (live); comments/bookmarks (client-only, no table). |
| `features/career/CareerPage.tsx` | Internships/resume/interview-prep UI (mock). |
| `features/clubs/ClubsPage.tsx` | Clubs/organizations/events UI (mock). |
| `features/profile/ProfilePage.tsx` | Reputation hub; reads real logged-in user, showcase list is mock. |
| `features/admin/AdminPage.tsx` | Largest feature file — Overview (mock) + Colleges/Semesters/Feature Registry/Moderators/Audit Log tabs (all live), including nested `CollegesTab`→`CollegeCoursesPanel`→`CourseSemestersPanel`→`SubjectsPanel` drill-down components. |
| `features/moderator/ModeratorPage.tsx` | Feature Toggles/Study Materials/Exam Schedules/Timetables tabs (live), Reports tab (mock). |
| `features/match/MatchPage.tsx` | "Campus Match" peer/roommate finder (fully mock). |
| `features/misc/NotFoundPage.tsx` | 404 fallback. |

**Cross-feature**
| File | Purpose |
|---|---|
| `contexts/AuthContext.tsx` | Session state (`localStorage` key `cc_user`), student signup/signin API calls, hardcoded admin/mod demo login (`DEMO_STAFF`), `completeProfile()`. |
| `contexts/SubmissionsContext.tsx` | Shares upload/approval state between Study Hub and Moderator. |
| `components/layout/SidebarLayout.tsx` | Dark sidebar shell wrapping every authenticated page; filters nav items by role. |
| `components/shared/ContentActions.tsx` | Report/delete/action-menu dropdown reused by Community and Marketplace cards. |
| `components/shared/ProfileCompleteModal.tsx` | Global modal forcing new users to fill in academic details. |
| `hooks/use-mobile.tsx` | Viewport-width media-query hook. |
| `hooks/use-toast.ts` | Toast notification state hook (backs `components/ui/toast.tsx`/`toaster.tsx`). |
| `lib/utils.ts` | `cn()` class-name merge helper and other generic utilities. |

**`components/ui/*`** — 45 shadcn/ui primitives (accordion, alert, alert-dialog,
aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card,
carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer,
dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp,
item, kbd, label, menubar, navigation-menu, pagination, popover, progress,
radio-group, resizable, scroll-area, select, separator, sheet, sidebar,
skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toast,
toaster, toggle, toggle-group, tooltip) — generic building blocks, not
feature-specific, safe to reuse anywhere; rarely need editing.

### `artifacts/api-server/src` — backend
| File | Purpose |
|---|---|
| `index.ts` | Process entry point — starts the HTTP server on `$PORT`. |
| `app.ts` | Express app setup: JSON body parsing, CORS, `pino-http` request logging, mounts the combined router at `/api`. No auth middleware (see Section 9). |
| `lib/logger.ts` | `pino` logger instance/config used by `app.ts` and routes. |
| `lib/.gitkeep`, `middlewares/.gitkeep` | Placeholder files keeping empty dirs in git; `middlewares/` is empty today — the natural home for future auth middleware. |
| `routes/index.ts` | Imports every route file below and combines them into one router. |
| `routes/health.ts` | `GET /api/healthz` — infra/monitoring only. |
| `routes/users.ts` | Profile/Dashboard/Community-leaderboard user data (`lib/api-zod` schemas). |
| `routes/community.ts` | Feed posts + anonymous Q&A (`lib/api-zod` schemas). |
| `routes/study.ts` | Study materials CRUD + `/study/feature-status` public map (`lib/api-zod` schemas). |
| `routes/marketplace.ts` | Listings CRUD (`lib/api-zod` schemas). |
| `routes/clubs.ts` | Clubs/communities/events/internships reads (`lib/api-zod` schemas). |
| `routes/stats.ts` | Aggregate stats for Dashboard/Admin/Moderator overviews (`lib/api-zod` schemas). |
| `routes/academic.ts` | Colleges/Courses/Course-Semesters/Subjects admin CRUD + 3 public signup-read endpoints; inline `zod` schemas; local `writeAudit()`/`slugify()` helpers. |
| `routes/auth.ts` | Student signup (3-step OTP) + signin (2-step OTP); in-memory OTP store; inline `zod` schemas; `safeUser()` strips `passwordHash` from responses. |
| `routes/admin.ts` | Legacy `semesters` CRUD, `feature_registry` CRUD, moderator account CRUD, audit-log read; inline `zod` schemas; local `writeAudit()` helper (duplicated from `academic.ts`, not shared). |
| `routes/moderator.ts` | Study-material approve/reject/edit/delete queue, feature-toggle upsert (per course×semester), exam-schedule/timetable CRUD; inline `zod` schemas; local `writeAudit()` helper (duplicated again). |

### `lib/db/src` — shared database layer
| File | Purpose |
|---|---|
| `index.ts` | Creates the `pg` `Pool` + Drizzle `db` client from `DATABASE_URL`; re-exports every schema file via `export * from "./schema"`. |
| `schema/index.ts` | Re-exports all table/type definitions from the files below — this is what `@workspace/db` resolves to for consumers. |
| `schema/users.ts` | `usersTable` + `insertUserSchema`/`User` type. |
| `schema/posts.ts` | `postsTable`, `qaTable` + insert schemas/types. |
| `schema/study.ts` | `studyMaterialsTable` + insert schema/type. |
| `schema/marketplace.ts` | `listingsTable` + insert schema/type. |
| `schema/clubs.ts` | `clubsTable`, `communitiesTable`, `eventsTable`, `internshipsTable` + insert schemas/types. |
| `schema/academic.ts` | `collegesTable`, `coursesTable`, `courseSemestersTable`, `subjectsTable` — the normalized hierarchy (Section 5.1). |
| `schema/admin.ts` | `semestersTable` (legacy), `featureRegistryTable`, `featureTogglesTable`, `moderatorScopesTable`, `examSchedulesTable`, `classTimetablesTable`, `auditLogTable` (Section 5.2). |

### `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` — OpenAPI contract libs (see Section 6 — partially stale/unused)
| File | Purpose |
|---|---|
| `lib/api-spec/openapi.yaml` | The OpenAPI contract. Does not describe `academic.ts`/`auth.ts`/`admin.ts`/`moderator.ts` endpoints (written after codegen was bypassed). |
| `lib/api-spec/orval.config.ts` | Orval codegen configuration (currently not run — bypassed due to a YAML parsing issue). |
| `lib/api-zod/src/index.ts` | Re-exports the generated Zod schemas (`src/generated/`, not hand-edited) consumed by the older backend routes. |
| `lib/api-client-react/src/index.ts` | Re-exports the generated TanStack Query hooks (`src/generated/`, not hand-edited) — **currently unused** by any frontend page. |
| `lib/api-client-react/src/custom-fetch.ts` | Fetch wrapper used by the generated hooks above. |

### `artifacts/mockup-sandbox` — canvas design tool (not part of the live site)
Its own isolated Vite app for previewing UI components on the Canvas. Not
listed file-by-file here since it's unrelated to CollegeConnect's runtime
behavior — see the `mockup-sandbox` skill if you need to work in it.
