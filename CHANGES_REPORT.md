# Locale — Changes Report
### Branch: `develop_tavishi_pivot`
**Author:** Tavishi
**Date:** 2026-02-25
**Repo:** https://github.com/taeoldlee/nuvention

---

## Overview

This report documents all bug fixes, feature enhancements, and new files added to the `develop_tavishi_pivot` branch. Changes fall into three categories:

1. **Bug Fixes** — corrected broken or misleading behaviour visible to end users
2. **Feature Enhancements** — new UI components and improved AI fallback logic
3. **Developer Tooling** — seed data, documentation, and environment setup

---

## Bug Fixes

### Bug 1 — AWS S3 credentials error shown on image upload

**Symptom**
During operator onboarding, the Visual References step showed a red error:
```
The AWS Access Key Id you provided does not exist in our records.
```

**Root Cause**
`server/.env` contained placeholder strings (`your_key`, `your_secret`) for AWS credentials. Because these strings are truthy, the S3 client initialised successfully with invalid credentials. When a user tried to upload images, `multer-s3` made a real request to AWS, which rejected the fake key and surfaced the raw AWS error message directly in the UI.

**Fix**
Commented out all placeholder AWS environment variables so the S3 config falls through to its built-in disk-storage fallback:

```diff
- AWS_REGION=us-east-1
- AWS_ACCESS_KEY_ID=your_key
- AWS_SECRET_ACCESS_KEY=your_secret
- AWS_S3_BUCKET=locale-uploads
+ # AWS S3 — leave blank to use local disk storage (demo mode)
+ # AWS_REGION=us-east-1
+ # AWS_ACCESS_KEY_ID=
+ # AWS_SECRET_ACCESS_KEY=
+ # AWS_S3_BUCKET=locale-uploads
```

Uploads now succeed silently using disk storage. Files are served from `/api/uploads/files/`.

**File changed:** `server/.env`

---

### Bug 2 — "Could not auto-detect brand info" toast on every URL import

**Symptom**
Whenever an operator pasted a URL and clicked **Import** during onboarding, an info toast appeared:
```
Could not auto-detect brand info. Please fill in manually.
```
The app still advanced to the review step, making the toast feel like an error when it wasn't.

**Root Cause**
`Onboarding.jsx` showed this toast whenever the server returned `source: 'manual'`. In a local environment with no OpenAI API key, the server returns `source: 'manual'` for every URL that isn't one of four hardcoded demo businesses — i.e., always, for real business URLs.

**Fix**
Removed the conditional toast entirely. The user is already navigated to the review step where they can see and edit their profile — no additional notification is needed.

```diff
  const res = await autoImportBrand(importUrl.trim());
  const data = res.data?.data || res.data;
  formActions.applyImportData(data);
- if (res.data?.source === 'manual') {
-   addToast('Could not auto-detect brand info. Please fill in manually.', 'info');
- }
  setStep(1);
```

**File changed:** `client/src/pages/operator/Onboarding.jsx`

---

### Bug 3 — Auto-import returned empty business name, location, and vibe

**Symptom**
After pasting any real Google Maps or Yelp URL and clicking **Import**, the review step showed blank fields — business name, neighborhood, vibe, values, and content zones were all empty. The import appeared to do nothing.

**Root Cause**
`POST /api/brands/auto-import` has three steps:
1. Try OpenAI — skipped when no API key
2. Match known demo fallbacks — only worked for 4 hardcoded Evanston businesses
3. **Fallback** — was returning a hardcoded empty object instead of calling `analyzeBrandFromUrl()`, which already existed and had working logic

```js
// Before — step 3 returned an empty shell
return res.json({
  source: "manual",
  data: { businessName: "", neighborhood: "", vibe: [], ... }
});
```

**Fix**
Changed step 3 to call `analyzeBrandFromUrl(url)`, which routes to `fallbackBrandAnalysis()` and returns real extracted data.

```diff
- return res.json({
-   source: "manual",
-   data: { businessName: "", neighborhood: "", vibe: [], ... },
- });
+ const extractedData = await analyzeBrandFromUrl(url);
+ return res.json({ source: "fallback", urlType, data: extractedData });
```

**File changed:** `server/src/routes/brands.js`

---

## Feature Enhancements

### Enhancement 1 — Smart cuisine-aware fallback (no API key required)

**Background**
With Bug 3 fixed, all imports without an OpenAI key now flow through `fallbackBrandAnalysis()`. The original implementation of that function returned generic, unhelpful data regardless of business type. This enhancement replaced it with a keyword-detection system that infers a meaningful brand profile directly from the URL string.

**What it does**

| Capability | Detail |
|---|---|
| Business name extraction | Parses `/place/Business+Name/` from Google Maps URLs; parses `/biz/business-name-12345` from Yelp URLs (strips trailing numeric IDs, title-cases result) |
| Neighborhood detection | Scans the URL for 19 known Chicago/Evanston neighborhoods in URL-encoded, hyphenated, and plain variants |
| Cuisine detection | Matches keywords from the business name + URL against 19 cuisine signal lists |
| Brand profile mapping | Each detected cuisine maps to curated vibe, values, content zones, aesthetic tags, and content recommendations |

**19 Cuisine Categories Supported**

Japanese · Mexican · Italian · American · Bakery & Pastry · Coffee & Beverage · Thai · Indian · Chinese · Korean · French · Mediterranean · Seafood · Vegan & Plant-Based · Bar & Cocktails · Brunch & Breakfast · Desserts & Sweets

**Example output for a ramen URL**
```json
{
  "businessName": "Strings Ramen Shop",
  "neighborhood": "Wicker Park",
  "vibe": ["Minimalist & Clean", "Cozy & Warm"],
  "values": ["Quality-obsessed", "Tradition & Heritage"],
  "contentComfortZones": ["Food & Drink", "Behind the Scenes", "Ambiance / Interior"],
  "cuisineTypes": ["Japanese"],
  "vibeAnalysis": {
    "primaryVibe": "Japanese — Minimalist & Clean",
    "aestheticTags": ["cozy-steam", "warm-broth", "handcrafted-noodles", "local-charm", "inviting"],
    "contentRecommendations": [
      "Steam rising from a fresh bowl",
      "Noodle pull close-up",
      "Chef at work behind the counter",
      "Golden hour interior shots"
    ],
    "avoidTags": ["corporate", "chain-feel", "stock-photo-style"]
  }
}
```

**File changed:** `server/src/services/ai.js` — `fallbackBrandAnalysis()` function

---

### Enhancement 2 — UI: Creator tier badge in application cards

Added a tier badge (Nano / Micro / Mid-Tier / Macro / Mega) next to the follower count in each application card on the Brief Detail page. Tier is derived from follower count using standard UGC industry thresholds.

**File changed:** `client/src/pages/operator/BriefDetail.jsx`

---

### Enhancement 3 — UI: Engagement rate colour-coding in application cards

Engagement rate in application cards now renders with contextual colour:
- **Green** — ≥ 4% (strong)
- **Neutral** — 2–3.9% (average)
- **Muted grey** — < 2% (low)

**File changed:** `client/src/pages/operator/BriefDetail.jsx`

---

### Enhancement 4 — UI: Application filter bar on Brief Detail

Added an `<ApplicationFilters>` component above the applications list on the Brief Detail page, allowing operators to filter applications by status, tier, and engagement rate without leaving the page.

**File changed:** `client/src/pages/operator/BriefDetail.jsx`

---

### Enhancement 5 — UI: Project status tracker and draft history in Project View

- Added `<ProjectStatusTracker>` inside the project header card to show the current status visually as a step progression
- Added `<DraftHistory>` between the Draft Submissions card and the Message Thread, showing a log of all past drafts submitted for a project

**File changed:** `client/src/pages/operator/ProjectView.jsx`

---

### Enhancement 6 — UI: Settings enhancement panel

Added `<SettingsEnhancement>` component to the operator Settings page, providing additional profile and notification preference controls below the existing Account Info card.

**File changed:** `client/src/pages/operator/Settings.jsx`

---

### Enhancement 7 — Seed data: CampaignData analytics records

Added 10 `CampaignData` records to `server/prisma/seed.js` to populate the Insights page with realistic demo analytics data. Records span three demo brands (Todoroki, Coralie, Hewn) across multiple briefs with varied compensation types, creator tiers, cuisine types, and approval states.

**File changed:** `server/prisma/seed.js`

---

## Files Added

| File | Purpose |
|---|---|
| `CHANGELOG.md` | Full chronological changelog for the `develop_tavishi_pivot` branch |
| `BUGFIXES.md` | Detailed root-cause analysis and fix description for all 3 bugs |
| `CHANGES_REPORT.md` | This document — shareable summary for teammates |
| `README.md` | Complete project reference rewrite (demo accounts, API docs, env vars, project structure, seed data overview) |

---

## Files Modified

| File | What Changed |
|---|---|
| `server/.env` | Commented out placeholder AWS credentials |
| `server/src/routes/brands.js` | Step 3 of auto-import now calls `analyzeBrandFromUrl()` |
| `server/src/services/ai.js` | `fallbackBrandAnalysis()` rewritten with 19-cuisine keyword detection |
| `server/prisma/seed.js` | Added 10 `CampaignData` records for Insights page demo data |
| `client/src/pages/operator/Onboarding.jsx` | Removed noisy `source === 'manual'` toast |
| `client/src/pages/operator/BriefDetail.jsx` | Added `ApplicationFilters`, creator tier badge, engagement rate colour-coding |
| `client/src/pages/operator/ProjectView.jsx` | Added `ProjectStatusTracker`, `DraftHistory`, toast feedback on status actions |
| `client/src/pages/operator/Settings.jsx` | Added `SettingsEnhancement` component |

---

## No Breaking Changes

- All existing API contracts are preserved
- No database schema columns were added or removed (seed data uses existing schema fields only)
- All changes are additive or are pure removals of unintended side effects
- The application runs fully without any third-party API keys (OpenAI, AWS) in demo mode

---

## How to Run Locally

```bash
# 1. Install dependencies
npm run install:all

# 2. Push schema and seed demo data
cd server && npx prisma db push && npx prisma db seed

# 3. Start both client and server
cd .. && npm run dev
```

**Demo accounts**

| Role | Email | Password |
|---|---|---|
| Operator | Josh@todoroki.com | password |
| Operator | Marie@coralie.com | password |
| Operator | Ellen@hewn.com | password |
| Agency | sarah@agency.com | password |

Client runs at `http://localhost:5173` · API at `http://localhost:3001`
