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

## Summary

| # | Location | Symptom | Fix |
|---|----------|---------|-----|
| 1 | `server/.env` + `server/src/config/s3.js` | AWS error shown to user on image upload | Removed placeholder AWS credentials so S3 falls back to disk storage |
| 2 | `client/src/pages/operator/Onboarding.jsx` | Confusing toast on every URL import in demo mode | Removed toast for expected `source === 'manual'` fallback path |

Neither fix changes any application logic, API contracts, or UI structure — both are pure removal of unintended side effects.
