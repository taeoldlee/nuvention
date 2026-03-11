# Locale

Hyperlocal creator campaign assistant for independent restaurants. Operators post briefs, local creators apply, and AI handles matching, scoring, and campaign intelligence — so the restaurant doesn't have to manage any of it.

---

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Create database
createdb locale

# 3. Create server/.env (see Environment Variables section)
cp server/.env.example server/.env
# → Edit server/.env and set DATABASE_URL

# 4. Push schema and seed demo data
cd server
npx prisma db push
npx prisma db seed
cd ..

# 5. Start the app
npm run dev
```

Open **http://localhost:5173**. Click the **Demo** button (bottom-right) to switch between accounts.

> **No API keys required.** All AI features, file uploads, and external integrations fall back gracefully to demo data.

---

## Demo Accounts

Use the **Demo Switcher** (bottom-right corner) to switch between accounts without logging in.

### Brand Operators

| Name | Email | Business | What to explore |
|------|-------|----------|-----------------|
| Josh Rivera | josh@todoroki.com | Todoroki Ramen | Active project (draft submitted), 8 open briefs with applications |
| Marie Laurent | marie@coralie.com | Patisserie Coralie | Completed project, Valentine's brief (closed) |
| Ellen King | ellen@hewn.com | Hewn Bread | Open briefs, Insights page (10 campaign records seeded) |
| New Operator | newoperator@locale.app | — | Triggers onboarding flow |

### Agency Accounts

| Name | Email | Agency | What to explore |
|------|-------|--------|-----------------|
| Sarah Kim | sarah@northshorecreators.com | North Shore Creators | Roster of 6 creators, agency brief applications |
| New Agency | newagency@locale.app | — | Triggers agency onboarding |

### Public Portal

No login required — visit `/portal/briefs` to browse all open briefs as a creator.

### Active Demo Flows

| Scenario | Operator | Status | Try this |
|----------|----------|--------|----------|
| Todoroki x Shaurya | Josh Rivera | DRAFT_SUBMITTED | Approve or request revision on the submitted draft |
| Coralie x Emma (Valentine's) | Marie Laurent | COMPLETED | View completed project, payment released |
| Todoroki Grand Opening | Josh Rivera | OPEN | Review 5 pending applications, use filters + match scores |
| Coralie Mother's Day | Marie Laurent | OPEN | Review 3 applications including agency creator |
| Insights Dashboard | Ellen King | Unlocked | 10 seeded CampaignData records — insights are fully unlocked |

---

## Features

### Operator Flow

**Brief Creation**
- Multi-step form: campaign goal, content types, creative direction, dos/don'ts, compensation, deadline
- Inline field validation with per-field error messages
- Character counter on Creative Direction (500 char limit)
- AI Suggestions panel — click "Get AI Suggestions" to receive context-aware recommendations for creative direction, deliverable structure, dos/don'ts, and compensation range. Each suggestion applies individually with a "Use" button.

**Brief Management**
- Dashboard with live status badges (OPEN / DRAFT / CLOSED)
- Application count and project status at a glance
- Link through to brief detail or active project

**Application Review**
- Filter pills: All / High Match (>75%) / Nano·Micro / Pending Only
- Sort: Best Match · Followers ↓ · Engagement ↓ · Lowest Cost
- Summary bar: application count, avg match score, best match score
- Color-coded match score badges: green ≥75, amber 50–74, terracotta <50
- Creator tier labels inline (NANO <5K · MICRO 5–25K · MID 25–100K · MACRO 100K+)
- Engagement rate color-coding: green ≥4%, neutral 2–3.9%, muted <2%
- One-click Select or Reject with toast confirmation

**Project View**
- 4-step status tracker: Brief Sent → Draft Submitted → Approved → Delivered
- Draft submissions with expand/collapse, image previews, creator notes
- Approve or request revision (with written feedback field)
- Draft history panel shows thumbnails and feedback for all prior versions
- Inline messaging thread with creator
- Complete & Release Payment button when draft is approved
- Toast notifications on every action

**Campaign Insights** (`/operator/insights`)
- Locked state when <3 completed campaigns — progress bar + blurred preview
- Unlocked when ≥3 campaigns:
  - Stat cards: total campaigns, avg acceptance rate, best offer type, avg response time
  - Offer-type acceptance breakdown (FREE PRODUCT / FLAT FEE / HYBRID / COMMISSION)
  - Creator tier performance grid with campaign count and avg acceptance rate per tier
  - Neighborhood benchmarks table with acceptance rate and top content type
  - AI-generated recommendation (OpenAI `gpt-4o-mini`, falls back to computed string)

**Settings** (`/operator/settings`)
- Read-only brand profile card with cuisine types, vibe, values, subscription tier
- **Profile tab** — Edit business name, neighborhood, city, state, Google Maps URL, content no-gos
- **Subscription tab** — Basic vs Pro plan comparison with upgrade CTA
- **Notifications tab** — Toggle switches for New Application, Creator Response, Draft Submission, Weekly Digest
- **Data tab** — Export full campaign history as `locale-campaign-data.csv`

### Agency Flow

- Agency dashboard with roster overview and available briefs
- Roster management — add, edit, remove creators with follower count and platform
- Browse open briefs and apply on behalf of roster creators
- Agency badge on navbar and creator cards

### Public Portal (`/portal/briefs`)

- Browse all OPEN briefs without logging in
- Filter by campaign goal and compensation type
- View full brief detail including creative direction, dos/don'ts, and compensation

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS (custom design system) |
| HTTP client | Axios |
| Backend | Node.js 20 + Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| AI | OpenAI API (`gpt-4o-mini`) |
| File storage | AWS S3 (disk fallback) |
| Fonts | Playfair Display (headings) + DM Sans (body) |
| Deployment | Railway (single-service monorepo) |

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `dark` | `#2C2220` | Primary text |
| `mid` | `#5A4A42` | Secondary text |
| `muted` | `#8A7B72` | Labels, placeholders |
| `accent` | `#B85042` | CTAs, active states |
| `accentLight` | `#FDF0ED` | Accent backgrounds |
| `green` | `#1B7D3A` | Success, approval |
| `border` | `#E8E0DA` | Dividers, card borders |
| `bgWarm` | `#FAFAF7` | Page background |
| `bgTan` | `#F5F0EB` | Card backgrounds |

---

## Project Structure

```
locale/
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── api/
│       │   └── index.js             # All API functions + Axios client
│       ├── components/
│       │   ├── common/
│       │   │   ├── Avatar.jsx
│       │   │   ├── Btn.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── MessageThread.jsx
│       │   │   ├── ProjectStatusTracker.jsx  # 4-step progress indicator
│       │   │   ├── Skeleton.jsx
│       │   │   ├── StatCard.jsx
│       │   │   ├── StatusBadge.jsx
│       │   │   └── Toast.jsx                 # Top-right toast container
│       │   ├── layout/
│       │   │   ├── AppShell.jsx
│       │   │   ├── DemoSwitcher.jsx
│       │   │   ├── Navbar.jsx               # Operator + agency nav links
│       │   │   └── NotificationBell.jsx
│       │   └── operator/
│       │       ├── AISuggestionCards.jsx    # AI brief suggestions panel
│       │       ├── ApplicationFilters.jsx   # Filter + sort for applications
│       │       ├── ApplicationScoreBadge.jsx # Color-coded match score badge
│       │       ├── BrandProfileEditor.jsx   # Inline brand profile editing
│       │       ├── DataExport.jsx           # CSV campaign data export
│       │       ├── DraftHistory.jsx         # Prior draft version viewer
│       │       ├── DraftReviewSection.jsx
│       │       ├── NotificationPreferences.jsx # Notification toggles
│       │       ├── ProjectStatusSection.jsx
│       │       ├── SettingsEnhancement.jsx  # Tabbed settings panel
│       │       ├── SubscriptionCard.jsx     # Plan comparison card
│       │       └── SuggestionPanel.jsx
│       ├── contexts/
│       │   ├── AuthContext.jsx              # Demo user state
│       │   └── ToastContext.jsx             # Global toast system
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── agency/
│       │   │   ├── BriefDetail.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Onboarding.jsx
│       │   │   ├── Roster.jsx
│       │   │   └── Settings.jsx
│       │   ├── operator/
│       │   │   ├── BriefDetail.jsx          # Application review + filters
│       │   │   ├── CreateBrief.jsx          # Brief form + AI suggestions
│       │   │   ├── Dashboard.jsx
│       │   │   ├── InsightsPage.jsx         # Campaign analytics dashboard
│       │   │   ├── Onboarding.jsx
│       │   │   ├── ProjectView.jsx          # Project tracker + draft history
│       │   │   └── Settings.jsx             # Tabbed settings
│       │   └── portal/
│       │       └── BriefPortal.jsx
│       └── utils/
│           └── constants.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma                    # Full data model
│   │   └── seed.js                          # Demo data (6 users, 8 briefs, 10 CampaignData)
│   └── src/
│       ├── config/
│       │   ├── db.js                        # Prisma client
│       │   ├── openai.js                    # OpenAI client (optional)
│       │   └── s3.js                        # S3 client (optional)
│       ├── middleware/
│       │   └── auth.js                      # x-user-id header auth
│       ├── routes/
│       │   ├── admin.js
│       │   ├── agencies.js
│       │   ├── ai.js                        # POST /api/ai/suggest-brief
│       │   ├── applications.js
│       │   ├── auth.js
│       │   ├── brands.js
│       │   ├── briefs.js
│       │   ├── insights.js                  # GET /api/stats/insights
│       │   ├── messages.js
│       │   ├── notifications.js
│       │   ├── portal.js
│       │   ├── projects.js
│       │   ├── stats.js
│       │   └── uploads.js
│       └── services/
│           ├── ai.js                        # OpenAI service + fallbacks
│           └── matching.js                  # Creator-brief match scoring
│
├── CHANGELOG.md
├── README.md
└── package.json                             # Root monorepo scripts
```

---

## API Reference

### Auth
All authenticated requests require an `x-user-id` header (demo mode — no JWT).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/demo-login` | Log in as a demo user |
| GET | `/api/auth/me` | Get current user + profile |

### Briefs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/briefs` | List briefs for current brand |
| POST | `/api/briefs` | Create a new brief |
| GET | `/api/briefs/:id` | Get brief with applications |
| PATCH | `/api/briefs/:id` | Update brief |
| DELETE | `/api/briefs/:id` | Delete brief |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit an application |
| POST | `/api/applications/:id/select` | Select a creator (creates project) |
| POST | `/api/applications/:id/reject` | Reject an application |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id` | Get project with drafts + messages |
| POST | `/api/projects/:id/drafts/:draftId/approve` | Approve a draft |
| POST | `/api/projects/:id/drafts/:draftId/revision` | Request revision |
| POST | `/api/projects/:id/complete` | Complete project + release payment |
| GET | `/api/projects/:id/messages` | Get message thread |
| POST | `/api/projects/:id/messages` | Send a message |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggest-brief` | Get AI suggestions for brief fields |

### Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/insights` | Get aggregated campaign analytics |

**Insights response (unlocked):**
```json
{
  "unlocked": true,
  "totalCampaigns": 10,
  "avgAcceptanceRate": 80,
  "bestOfferType": "FLAT_FEE",
  "avgResponseTime": 285,
  "acceptanceByOfferType": { "FLAT_FEE": { "accepted": 4, "total": 4, "rate": 100 } },
  "creatorTierPerformance": { "MICRO": { "campaigns": 4, "avgAcceptanceRate": 75 } },
  "neighborhoodBenchmarks": [{ "neighborhood": "Evanston", "campaigns": 10, "acceptanceRate": 80, "topContentType": "REEL" }],
  "aiRecommendation": "Based on 10 campaigns in Evanston, we recommend..."
}
```

**Insights response (locked):**
```json
{ "unlocked": false, "count": 1 }
```

---

## Environment Variables

### `server/.env`

```bash
# Required
DATABASE_URL=postgresql://<username>@localhost:5432/locale

# App
PORT=3001
DEMO_MODE=true
CORS_ORIGIN=http://localhost:5173

# Optional — AI features (falls back to templates without this)
OPENAI_API_KEY=sk-...

# Optional — File uploads (falls back to disk/placeholder URLs without these)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=locale-uploads

# Optional — Onboarding auto-import
GOOGLE_PLACES_API_KEY=...
YELP_API_KEY=...
```

### `client/.env`

```bash
# Only needed if not using the Vite proxy
VITE_API_URL=http://localhost:3001/api
```

---

## Optional Services

### OpenAI
Enables AI brief suggestions, brand analysis during onboarding, and campaign insight recommendations.
- Get a key at https://platform.openai.com
- Uses `gpt-4o-mini` — cost is ~$0.001–0.02 per request
- Without it: all AI features return sensible computed fallbacks

### AWS S3
Enables real file uploads for draft submissions and creator portfolios.
- Create a bucket, configure public read, create an IAM user with S3 access
- Without it: uploads write to local disk and return placeholder URLs

### Google Places / Yelp
Enables operators to paste a Google Maps or Yelp URL during onboarding to auto-fill their brand profile.
- Without them: onboarding falls back to manual entry

---

## Local Development

### Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL 14+
- npm 9+

### Commands

```bash
npm run install:all     # install root + client + server dependencies
npm run dev             # start client (5173) + server (3001) concurrently
npm run dev:client      # client only
npm run dev:server      # server only
npm run seed            # reseed database (wipes existing data)
npm run migrate         # run prisma migrate dev
npm run migrate:deploy  # run prisma migrate deploy (production)
```

### First-time setup

```bash
git clone https://github.com/taeoldlee/nuvention.git
cd nuvention
npm run install:all

createdb locale

cd server
cp .env.example .env
# Edit .env — set DATABASE_URL=postgresql://<your-pg-username>@localhost:5432/locale

npx prisma db push
npx prisma db seed
cd ..

npm run dev
```

### Resetting demo data

```bash
npm run seed
```

This wipes all tables and re-inserts the full demo dataset.

---

## Live Demo

**https://energetic-abundance-production-3958.up.railway.app**

Use the **Demo Switcher** (bottom-right) to log in as any demo account.

---

## Repository

**https://github.com/taeoldlee/nuvention**

---

## Production Deployment (Railway)

The app is configured for Railway via `nixpacks.toml`. A single service runs both the Express API and serves the built Vite frontend.

**Build command:** `npm run build`
**Start command:** `npm run start`

The `start` script runs `prisma db push --force-reset` + `prisma db seed` + `node src/index.js` on every deploy — ensuring the database is always in sync with the schema.

### Environment variables to set in Railway

```
DATABASE_URL          (Railway PostgreSQL plugin)
CORS_ORIGIN           *
DEMO_MODE             true
NODE_ENV              production
PORT                  3001
OPENAI_API_KEY        (optional)
AWS_REGION            (optional)
AWS_ACCESS_KEY_ID     (optional)
AWS_SECRET_ACCESS_KEY (optional)
AWS_S3_BUCKET         (optional)
RAPIDAPI_KEY          (optional)
VITE_GOOGLE_PLACES_API_KEY (optional)
```

---

## What Changed — develop_tavishi_pivot

### Bug Fixes

| Bug | Fix |
|-----|-----|
| Toast appeared at bottom of screen | Repositioned to `top-20 right-4` (below navbar) |
| `SuggestionPanel` crashed on load | Added missing `getRequestSuggestions` export to `api/index.js` |

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AISuggestionCards` | `components/operator/` | AI-generated brief field suggestions during create flow |
| `ApplicationFilters` | `components/operator/` | Filter pills + sort controls for application review |
| `ApplicationScoreBadge` | `components/operator/` | Color-coded circular match score badge |
| `BrandProfileEditor` | `components/operator/` | Inline brand profile editing form |
| `DataExport` | `components/operator/` | CSV campaign data export |
| `NotificationPreferences` | `components/operator/` | Notification toggle switches |
| `SettingsEnhancement` | `components/operator/` | Tabbed settings panel (Profile / Subscription / Notifications / Data) |
| `SubscriptionCard` | `components/operator/` | Basic vs Pro plan comparison |

### New Pages & Routes

| Route | File | Description |
|-------|------|-------------|
| `/operator/insights` | `pages/operator/InsightsPage.jsx` | Campaign analytics dashboard |

### New API Endpoints

| Endpoint | File | Description |
|----------|------|-------------|
| `GET /api/stats/insights` | `server/src/routes/insights.js` | Aggregated campaign intelligence from `CampaignData` |

### Modified Files

| File | Change |
|------|--------|
| `client/src/api/index.js` | Added `getInsights`, `getRequestSuggestions` exports |
| `client/src/App.jsx` | Added `/operator/insights` route |
| `client/src/components/layout/Navbar.jsx` | Added Insights link to operator nav |
| `client/src/components/common/Toast.jsx` | Fixed position to top-right |
| `client/src/pages/operator/CreateBrief.jsx` | Inline validation, `AISuggestionCards`, character counter, toast |
| `client/src/pages/operator/BriefDetail.jsx` | `ApplicationFilters`, score badges, tier labels, toast |
| `client/src/pages/operator/ProjectView.jsx` | `ProjectStatusTracker`, `DraftHistory`, toast on all actions |
| `client/src/pages/operator/Settings.jsx` | `SettingsEnhancement` tabs appended |
| `server/src/index.js` | Registered `insights` route on `/api/stats` |
| `server/prisma/seed.js` | Added 10 `CampaignData` records across all 3 demo brands |

---

## Seed Data Overview

The seed script (`server/prisma/seed.js`) creates:

- **6 users** — 4 brand operators, 2 agency users
- **3 brand profiles** — Todoroki Ramen, Patisserie Coralie, Hewn Bread
- **1 agency profile** — North Shore Creators with 6 roster creators
- **8 briefs** — 6 OPEN, 1 DRAFT, 1 CLOSED
- **27 applications** across 7 briefs (9 submitted by the agency)
- **2 projects** — 1 DRAFT_SUBMITTED, 1 COMPLETED
- **3 project drafts** with images, notes, and feedback
- **2 transactions** — 1 escrow held, 1 released
- **9 messages** across both projects
- **12 notifications** for operator accounts
- **10 CampaignData records** — powers the Insights page (all unlocked for demo)
