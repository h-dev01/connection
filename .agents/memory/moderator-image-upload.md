---
name: Moderator listing photo upload — local disk storage
description: Why marketplace listing photos are stored on local disk via multer instead of an object storage bucket.
---

Moderator marketplace-listing photo uploads (`POST /api/moderator/upload` in
`artifacts/api-server`) save files to a local `uploads/` directory via
`multer` disk storage, served back through `express.static` at `/uploads`,
proxied from the frontend dev server at the same path.

**Why:** no Replit object-storage integration is set up in this project
(checked via `searchIntegrations` — only Drive/OneDrive/SharePoint/Box/
Dropbox connectors were available, none suitable for this use case). Local
disk was the pragmatic fallback given available tooling.

**How to apply:** local disk storage is not persistent across redeploys —
if the user later wants uploaded photos to survive redeploys/scaling, set
up a proper object-storage integration and migrate the upload route (and
any stored `/uploads/...` URLs already saved on listings) rather than
assuming the existing files will still be there.
