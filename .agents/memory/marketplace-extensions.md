---
name: Marketplace — restaurants & roommate finder
description: How Restaurants and Roommate Finder were added to the student Marketplace, and where their data comes from.
---

The Marketplace page has 5 tabs: Buy/Sell, Housing, Restaurants, Roommate
Finder, Local Services (last one still a placeholder).

- **Restaurants** are moderator-managed `local_listings` rows (category
  `restaurant`, must be `status: "approved"`) — students never post these
  directly. They're read-only student-facing data.
- **Roommate Finder** reuses the existing student-facing `listings` table
  (same one buy/sell and housing use) with a new `listingType: "roommate"`
  value — students post their own ads, same as buy/sell items.

**Why:** both fit patterns that already existed (moderator-approved local
listings vs. student-self-service listings) rather than introducing new
tables, keeping the additive-schema convention consistent.

**How to apply:** local-listings data is moderator-only by default (no
public read route existed) — any other local-listings category that needs
a student-facing view needs its own public GET route stripping internal
fields (`priorityScore`, `displayDate`, `addedByModeratorId`,
`rejectionReason`), following the pattern in
`artifacts/api-server/src/routes/marketplace.ts` (`GET /marketplace/restaurants`).
