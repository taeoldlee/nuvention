# Changelog

All notable changes to Locale are documented here.

---

## [Unreleased] — develop_tavishi_pivot

### Fixed
- **Toast positioning** — Toasts now appear at `top-20 right-4` (below navbar) instead of the bottom of the screen, matching the design spec.
- **SuggestionPanel API** — Added missing `getRequestSuggestions` export in `client/src/api/index.js`, resolving the runtime error in `SuggestionPanel.jsx`.

### Added

#### AI Brief Suggestions
- New `AISuggestionCards` component surfaces AI-generated creative direction, dos/don'ts, deliverable structure, and compensation notes during brief creation.
- Suggestions are triggered on demand (user clicks "Get AI Suggestions") and applied per-field via a "Use" button.
- Wired to the existing `/api/ai/suggest-brief` endpoint.

#### Enhanced Application Review
- `ApplicationFilters` component adds filter pills (All / High Match / Nano·Micro / Pending Only) and sort controls (Best Match, Followers, Engagement, Lowest Cost) to the BriefDetail applications section.
- `ApplicationScoreBadge` component renders color-coded circular match scores (green ≥ 75, amber 50–74, terracotta < 50).
- Creator tier labels (NANO / MICRO / MID / MACRO) now appear inline next to follower counts on each application card.
- Engagement rate is color-coded: green ≥ 4%, neutral 2–3.9%, muted < 2%.
- Toast feedback added to Select and Reject actions.

#### Campaign Insights Page
- New `/operator/insights` route with full insights dashboard.
- **Locked state** (< 3 completed campaigns): shows a progress bar and blurred preview to encourage campaign completion.
- **Unlocked state**: displays total campaigns, avg acceptance rate, best offer type, avg response time, offer-type acceptance breakdown, creator tier performance grid, neighborhood benchmarks table, and an AI-generated recommendation.
- New `GET /api/stats/insights` endpoint with OpenAI-powered recommendation (falls back to computed string when key is absent).
- 10 seed `CampaignData` records added across all three demo brands (Todoroki Ramen, Patisserie Coralie, Hewn Bread).

#### Project View Enhancement
- `ProjectStatusTracker` component now renders inside the project header card, showing a 4-step visual progress indicator (Brief Sent → Draft Submitted → Approved → Delivered).
- `DraftHistory` component now renders below the Draft Submissions card, showing thumbnails and feedback for all previous draft versions when > 1 draft exists.
- Toast feedback added to Approve Draft, Request Revision, and Complete & Release Payment actions.

#### Settings Enhancement
- `SettingsEnhancement` tab component appended below the Account card in `/operator/settings`.
- **Profile tab** — `BrandProfileEditor` allows inline editing of business name, neighborhood, city, state, Google Maps URL, and content no-gos.
- **Subscription tab** — `SubscriptionCard` shows Basic vs Pro plan comparison with an upgrade CTA.
- **Notifications tab** — `NotificationPreferences` provides toggles for four notification types (New Application, Creator Response, Draft Submission, Weekly Digest).
- **Data tab** — `DataExport` generates and downloads a `locale-campaign-data.csv` with full campaign history.

### Changed
- Operator navbar now includes an **Insights** link between "Public Portal" and "Settings".
- Brief creation form now validates required fields inline (title, campaign goal, content types, creative direction) and shows per-field error messages.
- Character counter (X/500) added to the Creative Direction textarea in CreateBrief.
- Toast notifications added to brief creation success and error paths.
