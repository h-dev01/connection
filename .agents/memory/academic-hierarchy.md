---
name: Multi-college academic hierarchy
description: How colleges/courses/semesters/subjects are modeled, and how other tables scope to them.
---

## Structure

`lib/db/src/schema/academic.ts` defines the normalized master-data chain:

```
colleges ──▶ courses ──▶ course_semesters ──▶ subjects
```

Each level has a foreign key to its parent, a unique index scoped to the
parent (e.g. `courses` unique on `(collegeId, code)`), a `status` column
("active"/"disabled", or "upcoming"/"archived" for semesters), and a
`deletedAt` timestamp for soft delete. Admin "delete" sets `deletedAt` +
`status: "disabled"`; it never hard-deletes, since students/materials may
still reference the row.

Admin CRUD lives in `artifacts/api-server/src/routes/academic.ts`, mounted
at `/api/admin/colleges`, `/api/admin/courses`, `/api/admin/course-semesters`,
`/api/admin/subjects`.

## How existing tables connect

Rather than rewriting `users`, `study_materials`, `feature_toggles`,
`moderator_scopes`, `clubs`, `events`, `internships`, `communities`,
`listings`, `posts` to drop their free-text `college`/`course`/`semester`
fields (which the whole existing app reads/writes), each got **additive
nullable FK columns** (`collegeId`, `courseId`, `semesterId`, `subjectId`
where relevant) plus `status`/`deletedAt` soft-delete columns. The old
text columns stay for backward compatibility.

**Why:** a full rewrite of every route/frontend page to use FK ids in one
pass was out of scope and high-risk for an app already running in
production-like use. The additive approach lets new features (and a future
backfill/migration) adopt the FK columns without breaking anything that
still reads the text columns.

**How to apply:** new code should read/write the FK columns, not the
legacy text ones. When a route is next touched, prefer migrating it to
use the FK columns and stop populating the text ones only once every
call site has moved. Do not drop the text columns until then.

`exam_schedules` and `class_timetables` (and `feature_toggles`, which
already had college/course/semester) followed the same additive-FK pattern
by also gaining a `subjectId` FK — kept alongside their legacy `course`/
`semester` text fields for the same backward-compat reason.

Public read-only endpoints for cascading dropdowns already exist:
`/api/colleges`, `/api/colleges/:id/courses`, `/api/courses/:id/semesters`,
`/api/semesters/:id/subjects`. Any new College→Course→Semester→Subject
filter UI should reuse these rather than adding new academic endpoints.

## Known gaps (see follow-up notes below)

- Admin/moderator routes — including the new academic ones — have no
  server-side authorization check (client-side role check only). This
  predates this change but is worth fixing before real users have
  destructive access.
- `feature_toggles` has an index but no uniqueness constraint on scope,
  so duplicate rows for the same feature+scope can silently diverge.
- `posts` and `listings` got soft-delete columns, but their existing
  delete routes (`community.ts`, `marketplace.ts`) still hard-delete —
  not yet wired to use the new columns.
