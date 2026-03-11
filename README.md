# Locale

**Live Demo: https://energetic-abundance-production-3958.up.railway.app**

**Repo: https://github.com/taeoldlee/nuvention**

Hyperlocal creator campaign assistant for independent F&B businesses. Brand operators post campaign briefs, local creators apply through a public portal, and AI handles matching and scoring — so the restaurant doesn't have to manage any of it.

> Use the **Demo Switcher** (bottom-right corner) to log in as a demo account. No signup required.

---

## How It Works

1. **Brand creates a brief** — campaign goal, content types, creative direction, compensation, deadline
2. **Creators browse & apply** — public portal at `/portal/briefs`, no account needed
3. **AI scores applications** — match score + rationale based on creator fit, location, and content style
4. **Brand selects a creator** — project is created with status tracking
5. **Creator submits drafts** — brand approves or requests revisions with feedback
6. **Payment released** — escrow flow with 10% platform fee

---

## Demo Accounts

| Name | Business | What to explore |
|------|----------|-----------------|
| **Josh Rivera** | Todoroki Ramen (PRO) | 12 briefs, active projects with draft submissions, full messaging thread |
| **New Operator** | — | Triggers the 8-step onboarding flow |

### Public Portal

Visit `/portal/briefs` to browse all open briefs as a creator — no login required. Creators access assigned projects via token-based URLs at `/portal/project/:id`.

---

## Features

### Brief Creation
- Multi-step form with inline validation and character counters
- AI Suggestions panel — context-aware recommendations for creative direction, deliverables, dos/don'ts, and compensation

### Application Review
- Filter: All / High Match (>75%) / Nano-Micro / Pending Only
- Sort: Best Match, Followers, Engagement, Lowest Cost
- Color-coded match score badges and creator tier labels
- Creator profile drawer with portfolio and demographics
- One-click Select or Reject

### Project Management
- 4-step status tracker: Brief Sent > Draft Submitted > Approved > Delivered
- Draft submissions with image previews and creator notes
- Approve or request revision with written feedback
- Full draft version history
- Inline messaging thread with creator
- Complete & Release Payment when approved

### Campaign Insights (`/operator/insights`)
- Locked until 3+ completed campaigns (progress bar + blurred preview)
- Stat cards, offer-type breakdown, creator tier performance, neighborhood benchmarks
- AI-generated recommendations (OpenAI, with computed fallback)

### Payments (`/operator/payments`)
- Transaction history with escrow status tracking
- 10% platform fee calculation

### Settings (`/operator/settings`)
- Profile editing (business name, location, content no-gos)
- Subscription plan comparison (Basic vs Pro)
- Notification preferences
- CSV campaign data export

### Onboarding
- 8-step guided setup: Google Places import, cuisine selection, brand style, budget, campaign goals
- Auto-fill from Google Maps URL

### Creator Portal
- Browse open briefs with goal and compensation filters
- Accept/decline project invitations
- Submit drafts with file uploads and notes
- Message the brand directly

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3.4 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js 20 + Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| AI | OpenAI API (gpt-4o-mini, optional) |
| File Storage | AWS S3 (disk fallback) |
| Fonts | Playfair Display + DM Sans |
| Deployment | Railway (nixpacks) |

> **No API keys required.** All external services (OpenAI, S3, Google Places) fall back gracefully without keys.

---

## Project Structure

```
nuvention/
├── client/                             # React frontend (Vite)
│   └── src/
│       ├── api/index.js                # 46 API functions (Axios client)
│       ├── components/
│       │   ├── common/                 # Avatar, Btn, Toast, StatusBadge, etc (15)
│       │   ├── layout/                 # AppShell, Navbar, DemoSwitcher, NotificationBell
│       │   ├── marketing/              # Landing page components
│       │   └── operator/               # Brief, application, project, settings components (24)
│       ├── contexts/                   # AuthContext, ToastContext
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── operator/               # Dashboard, AllBriefs, AllProjects, CreateBrief,
│       │   │                           # BriefDetail, ProjectView, Settings, Onboarding,
│       │   │                           # InsightsPage, Payments
│       │   └── portal/                 # BriefPortal, CreatorProjectPage
│       └── utils/constants.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma              # 11 models, 16 enums
│   │   └── seed.js                    # Demo data for Todoroki Ramen
│   └── src/
│       ├── config/                    # Prisma, OpenAI, S3 clients
│       ├── middleware/auth.js         # x-user-id header auth
│       ├── routes/                    # 15 route files
│       │   ├── auth.js, brands.js, briefs.js, portal.js
│       │   ├── applications.js, projects.js, creators.js
│       │   ├── ai.js, messages.js, notifications.js
│       │   ├── uploads.js, stats.js, insights.js
│       │   ├── transactions.js, admin.js
│       └── services/                  # AI service + matching algorithm
│
├── nixpacks.toml                      # Railway deployment config
└── package.json                       # Monorepo scripts
```

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing / Dashboard | Redirects based on auth state |
| `/operator/onboarding` | Onboarding | 8-step brand setup |
| `/operator/dashboard` | Dashboard | Brief overview + stats |
| `/operator/briefs` | All Briefs | List all briefs with status |
| `/operator/projects` | All Projects | List all active projects |
| `/operator/brief/new` | Create Brief | Multi-step brief form + AI |
| `/operator/brief/:id` | Brief Detail | Application review + selection |
| `/operator/project/:id` | Project View | Draft review + messaging |
| `/operator/insights` | Insights | Campaign analytics |
| `/operator/payments` | Payments | Transaction history |
| `/operator/settings` | Settings | Profile, plan, notifications |
| `/portal/briefs` | Creator Portal | Browse open briefs (public) |
| `/portal/project/:id` | Creator Project | Submit drafts, message brand |

---

## Local Development

### Prerequisites
- Node.js 18+ (20 recommended)
- PostgreSQL 14+

### Setup

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

Open **http://localhost:5173**.

### Commands

```bash
npm run dev             # Start client (5173) + server (3001)
npm run seed            # Reseed database (wipes + reinserts demo data)
npm run build           # Production build
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

# Optional
OPENAI_API_KEY=sk-...
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
VITE_GOOGLE_PLACES_API_KEY=...
RAPIDAPI_KEY=...
```

---

## Production Deployment (Railway)

Single service on Railway via `nixpacks.toml`. Express serves the built Vite frontend and API.

The start script runs `prisma db push --force-reset` + `prisma db seed` + `node src/index.js` on every deploy — database is always fresh with demo data.

### Railway Environment Variables

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

## Data Model

| Model | Purpose |
|-------|---------|
| User | Brand operators (demo mode, `x-user-id` header auth) |
| BrandProfile | Business info, cuisine, vibe, budget, location |
| Brief | Campaign briefs (DRAFT / OPEN / CLOSED / CANCELLED) |
| Application | Creator applications with AI match score + rationale |
| Creator | Creator database (platform, followers, engagement, neighborhoods) |
| Project | Active projects with status tracking |
| ProjectDraft | Draft submissions with versioning and feedback |
| Transaction | Payment escrow (HELD / RELEASED) |
| Message | Project messaging (BRAND / CREATOR sender types) |
| Notification | User notifications |
| CampaignData | Analytics aggregation for Insights dashboard |
