# Bug Fix Report — develop_tavishi_pivot

**Branch:** `develop_tavishi_pivot`
**Date:** 2026-02-25
**Author:** Tavishi

---

## Bug 1 — AWS S3 error shown to user on image upload

### Symptom

When a new operator reached the Visual References section of the onboarding review step and tried to upload reference images, they saw a red error message directly on the page:

```
The AWS Access Key Id you provided does not exist in our records.
```

### Root Cause

`server/.env` was created with placeholder AWS credentials:

```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=locale-uploads
```

`server/src/config/s3.js` initializes the S3 client when all three env vars are present and truthy. Since placeholder strings are truthy, the S3 client was being configured with invalid credentials. The disk-storage fallback was never reached.

When the user selected images to upload, `multer-s3` made a real request to AWS, which rejected the invalid credentials and returned an error. That error message propagated through `server/src/routes/uploads.js` → `client/src/hooks/useOnboardingForm.js` → `visualRefError` state → displayed as a red paragraph in `OnboardingStepReview.jsx`.

**Flow:**
```
User selects images
  → POST /api/uploads/images
  → multer-s3 calls AWS S3 with "your_key"
  → AWS returns: "The AWS Access Key Id you provided does not exist in our records."
  → uploads.js: res.status(400).json({ error: err.message })
  → useOnboardingForm: setVisualRefError(err.response.data.error)
  → OnboardingStepReview: <p className="text-red-600">{visualRefError}</p>
```

### Fix

Commented out the placeholder AWS credentials in `server/.env`:

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

With these vars absent, `s3.js` falls through to disk storage:

```
[S3] Running in demo mode — using disk storage with placeholder URLs
```

Uploads now succeed silently — files are stored to the OS temp directory and served from `/api/uploads/files/`.

### Files Changed

- `server/.env` — commented out placeholder AWS credentials

---

## Bug 2 — "Could not auto-detect brand info" toast shown on normal onboarding

### Symptom

When a new operator went through the URL-import step of onboarding (shown when Google Places is not available), they were shown an info-level toast notification:

```
Could not auto-detect brand info. Please fill in manually.
```

This appeared even when the user deliberately pasted a URL and clicked Import, and the app still correctly advanced to the review step — making the toast feel like an error when it wasn't.

### Root Cause

`client/src/pages/operator/Onboarding.jsx` in `handleImport()`:

```js
const res = await autoImportBrand(importUrl.trim());
const data = res.data?.data || res.data;
formActions.applyImportData(data);
if (res.data?.source === 'manual') {
  addToast('Could not auto-detect brand info. Please fill in manually.', 'info');
}
setStep(1);
```

The server returns `source: 'manual'` whenever there is no OpenAI API key configured **and** the URL doesn't match a known demo business. In a local dev environment without API keys, this is the expected path for any real business URL. The toast was meant as a fallback notice but showed up every single time, confusing users who thought they had done something wrong.

### Fix

Removed the conditional toast. The user is already being navigated to the review step (`setStep(1)`) where they can fill in their details — no additional notification is needed.

```diff
  const res = await autoImportBrand(importUrl.trim());
  const data = res.data?.data || res.data;
  formActions.applyImportData(data);
- if (res.data?.source === 'manual') {
-   addToast('Could not auto-detect brand info. Please fill in manually.', 'info');
- }
  setStep(1);
```

### Files Changed

- `client/src/pages/operator/Onboarding.jsx` — removed noisy toast for `source === 'manual'` case

---

---

## Bug 3 — Auto-import returns empty business name, location, and vibe

### Symptom

When an operator pasted a Google Maps or Yelp URL into the onboarding import field and clicked **Import**, the review step showed blank values for business name, neighborhood, vibe, values, and content comfort zones — the user had to fill everything in manually as if they hadn't imported anything.

### Root Cause

`POST /api/brands/auto-import` has three steps:

1. Try AI (OpenAI) — skipped when no API key
2. Try known demo fallbacks — only matched 4 hardcoded Evanston businesses
3. **Fallback** — was returning an empty shell object:

```js
// Before fix
return res.json({
  source: "manual",
  data: {
    businessName: "",
    neighborhood: "",
    vibe: [],
    values: [],
    contentComfortZones: [],
    vibeAnalysis: null,
  },
});
```

Any real business URL that wasn't one of the four hardcoded demo entries would hit step 3 and receive empty data. `analyzeBrandFromUrl()` already existed and contained `fallbackBrandAnalysis()` — but step 3 wasn't calling it.

### Fix

Changed step 3 to call `analyzeBrandFromUrl(url)` instead of returning an empty object:

```diff
- return res.json({
-   source: "manual",
-   data: { businessName: "", neighborhood: "", vibe: [], ... },
- });
+ const extractedData = await analyzeBrandFromUrl(url);
+ return res.json({ source: "fallback", urlType, data: extractedData });
```

### Files Changed

- `server/src/routes/brands.js` — step 3 now calls `analyzeBrandFromUrl(url)` instead of returning empty data

---

## Enhancement — Smart cuisine-aware fallback brand analysis (no API key needed)

### Background

With the step 3 fix above in place, all imports now flow through `fallbackBrandAnalysis(url)` in `server/src/services/ai.js` when no OpenAI key is configured. The original implementation of that function returned generic placeholder data regardless of the business type — not useful enough for real onboarding.

### What Was Changed

Rewrote `fallbackBrandAnalysis(url)` with a keyword-detection system that infers brand data directly from the URL and business name string — no external API calls needed:

**Business name extraction**
- Google Maps: parses the `/place/Business+Name/` URL segment
- Yelp: parses the `/biz/business-name-12345` slug, strips trailing numeric IDs, title-cases each word

**Neighborhood extraction**
- Scans the URL for 19 known Chicago/Evanston neighborhoods (URL-encoded, hyphenated, and plain variants)

**Cuisine detection (19 categories)**
- Matches keywords from the business name + URL against 19 cuisine signal lists:
  Japanese, Mexican, Italian, American, Bakery & Pastry, Coffee & Beverage, Thai, Indian, Chinese, Korean, French, Mediterranean, Seafood, Vegan & Plant-Based, Bar & Cocktails, Brunch & Breakfast, Desserts & Sweets, and more

**Cuisine → brand profile mapping**
- Each detected cuisine maps to curated `vibe[]`, `values[]`, `contentComfortZones[]`, `aestheticTags[]`, and `contentRecommendations[]`
- Example: a URL containing "ramen" → Japanese → `["Minimalist & Clean", "Cozy & Warm"]` + content recs like "Steam rising from a fresh bowl", "Noodle pull close-up"

**Full profile returned**
- `businessName`, `neighborhood`, `vibe`, `values`, `contentComfortZones`
- `cuisineTypes`, `budgetMin`, `budgetMax`
- `vibeScales`, `guestExperienceKeywords`, `contentNoGos`
- `vibeAnalysis` with `primaryVibe`, `aestheticTags`, `contentRecommendations`, `avoidTags`

### Files Changed

- `server/src/services/ai.js` — complete rewrite of `fallbackBrandAnalysis()` with 19-cuisine keyword detection system

---

## Summary

| # | Location | Symptom | Fix |
|---|----------|---------|-----|
| 1 | `server/.env` + `server/src/config/s3.js` | AWS error shown to user on image upload | Removed placeholder AWS credentials so S3 falls back to disk storage |
| 2 | `client/src/pages/operator/Onboarding.jsx` | Confusing toast on every URL import in demo mode | Removed toast for expected `source === 'manual'` fallback path |
| 3 | `server/src/routes/brands.js` | Auto-import returned empty business name, location, and vibe | Step 3 now calls `analyzeBrandFromUrl()` instead of returning an empty object |
| 4 | `server/src/services/ai.js` | Fallback brand analysis returned generic placeholder data | Rewrote `fallbackBrandAnalysis()` with 19-cuisine keyword detection — extracts real name, neighborhood, vibe, and content strategy from URL alone |

Fixes 1 and 2 are pure removals of unintended side effects with no logic changes. Fixes 3 and 4 correct a broken data flow and replace a useless stub with a working no-API-key implementation.
