---
name: Admin and Moderator Dashboards
description: Architecture and workflow for the Admin (5-tab) and Moderator (5-tab) DB-backed dashboards.
---

## Admin Dashboard (AdminPage.tsx)
Tabs: Overview · Semesters · Feature Registry · Moderators · Audit Log

All tabs are DB-backed via `/api/admin/*` routes in `artifacts/api-server/src/routes/admin.ts`.

**Critical workflow:** Admin must seed Feature Registry before Moderators can use the Feature Toggles tab. A "Seed Defaults" button is available when the registry is empty.

## Moderator Dashboard (ModeratorPage.tsx)
Tabs: Feature Toggles · Study Materials · Exam Schedules · Timetables · Reports

All tabs (except Reports, which is mock) are DB-backed via `/api/moderator/*` routes in `artifacts/api-server/src/routes/moderator.ts`.

**Feature Toggles:** Pull from feature_registry merged with per-scope feature_toggles rows. Falls back to registry `defaultEnabled` if no scope row exists.

**Why:** The old ModeratorPage used client-side SubmissionsContext for material approvals — replaced entirely with DB-backed approval queue.

## DB Tables Added
- semesters, feature_registry, feature_toggles, moderator_scopes
- exam_schedules, class_timetables, audit_log
- study_materials: added status, rejectionReason, approvedBy, rejectedBy, reviewedAt columns

## Audit Log
Every admin/moderator action writes to `audit_log` table via helper `writeAudit()`. Visible at Admin → Audit Log tab.

## No file storage
Schedule/timetable uploads collect metadata + a `fileUrl` text field (user pastes a Google Drive/Dropbox link). No real file upload server.
