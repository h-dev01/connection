---
name: Ad banner carousel (Study Hub + Marketplace)
description: DB-backed rotating banners uploaded by moderators, shown on Study Hub and Marketplace, click-through to Marketplace tabs.
---

Banners are a moderator-managed `banners` table (placement: study|marketplace|both, linkType: restaurant|pg|local_service|none, durationMs per-banner). Public `GET /api/banners?placement=` returns only `status: "active"`, moderator CRUD lives at `/api/moderator/banners`.

Frontend shares one `BannerCarousel` component (`components/shared/BannerCarousel.tsx`) used by both StudyPage and MarketplacePage — always display banners in the same fixed-size box (`aspect-[3/1]` + `object-cover`) regardless of the uploaded image's real dimensions, since there is no server-side image resize step in this app.

**Why:** the user asked for "fixed photo size" but the stack has no image-processing library, so fixed *display* size (not upload validation) is the achievable equivalent.

**How to apply:** cross-page banner navigation uses a `linkType → marketplace tab` map (`restaurant→restaurants`, `pg→housing`, `local_service→services`) and wouter's `useSearch`/`navigate("/marketplace?tab=...")`; MarketplacePage reads `?tab=` on mount to preselect the tab. If adding more link targets, extend that map in both StudyPage and MarketplacePage (kept duplicated, not shared, as of this writing).
