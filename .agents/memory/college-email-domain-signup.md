---
name: College email-domain-gated signup
description: How admin college management ties into student signup validation via emailDomain.
---

Colleges now have a unique `emailDomain` (e.g. "dit.edu") and `pincode` field.
Signup requires collegeId/courseId/semesterId (not free text); the server checks
the submitted email's domain matches the selected college's emailDomain, and that
course/semester belong to the selected college/course chain, before issuing an OTP.

**Why:** without server-side domain + hierarchy enforcement, students could pick
any college with any email and self-report an unrelated course/semester.

**How to apply:** public read endpoints (`/api/colleges`, `/api/colleges/:id/courses`,
`/api/courses/:id/semesters`) only return active/upcoming rows without sensitive fields
and are separate from the `/api/admin/*` CRUD endpoints. Any new client that adds a
college-scoped signup or profile field must revalidate against these same three FKs
server-side, not trust client-submitted names/strings.
