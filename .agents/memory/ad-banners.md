---
name: Ad banner carousel
description: Shared BannerCarousel component, moderator-managed banners table, and college-targeting model.
---

## Core model
- Shared `BannerCarousel` component used on both Study Hub and Marketplace pages, moderator-managed via a `banners` table, fixed display size (not upload-validated), rotation duration is per-banner (moderator sets seconds).
- `linkType` → Marketplace tab map drives click-through navigation (restaurant/pg/local_service/none).

## College targeting
- `banners.collegeIds` is a native Postgres integer array (`integer("college_ids").array().notNull().default([])`), not a join table or JSON column — chosen so filtering can use `cardinality(...) = 0 OR :id = ANY(...)` directly in SQL.
- Empty array = global banner (shown to every college). Non-empty = shown only to students whose `collegeId` is in the array.
- Public `GET /api/banners` accepts an optional `collegeId` query param. With it: returns global banners OR banners containing that id. Without it (e.g. logged-out): only global banners are returned — never assume "no college" means "show everything."
- Moderator Ad Banners dialog uses a checkbox list (not a single `<select>`) sourced from `/api/colleges`; leaving all boxes unchecked means global by design, communicated directly in the UI copy.
- **Why:** originally shipped with singular nullable `collegeId`/`collegeName` scalar fields; replaced entirely (not kept alongside) when the requirement became "target one or more colleges, or all."
