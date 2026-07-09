---
name: Duplicate workflow causes stale API responses
description: Two running workflows can bind the same port; only one serves requests, so code changes appear to not take effect until you restart the right one.
---

In this project, both `Start application` (bash start.sh, spawns its own api-server) and the standalone `artifacts/api-server: API Server` workflow can end up running concurrently. Whichever one is holding port 8080 serves all requests — if it's the stale one, newly added routes/behavior will 404 or behave like old code even after editing source and confirming no syntax errors.

**Why:** `Start application` starting its own api-server subprocess causes `EADDRINUSE` against the already-running standalone API Server workflow; the standalone (older) process wins and keeps serving stale code.

**How to apply:** If a newly added backend route 404s despite the code looking correct, check workflow logs for `EADDRINUSE` on port 8080, then explicitly restart the `artifacts/api-server: API Server` workflow (not just `Start application`) to pick up the change.
