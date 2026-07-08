---
name: Study Materials Approval Flow
description: Status lifecycle for study materials and which endpoints serve which audiences.
---

## Status Field
`study_materials.status`: "pending" | "approved" | "rejected" | "archived"
- Old `verified` boolean kept for backward compat (set to true on approve, false on reject)
- New uploads land in "pending" automatically

## Endpoints
- `GET /api/study/materials` — student-facing, returns only `status = 'approved'`
- `GET /api/moderator/materials?status=...&course=...&semester=...` — moderator view, any status
- `PATCH /api/moderator/materials/:id/approve` — sets status=approved, verified=true
- `PATCH /api/moderator/materials/:id/reject` — sets status=rejected, stores rejectionReason
- `DELETE /api/moderator/materials/:id` — soft-delete (sets status="archived")

**Why:** Students should never see pending or rejected materials. Moderators need to see all statuses to action them. The old SubmissionsContext was client-side only with no persistence.
