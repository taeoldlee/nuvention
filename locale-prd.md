# Locale — Product Requirements Document

**Version:** 1.0  
**Date:** February 6, 2026  
**Target Demo:** February 13, 2026  
**Author:** Team 5 — NUvention  

---

## 1. Product Overview

Locale is a hyperlocal UGC sourcing platform for F&B businesses (restaurants, coffee shops, cafés). It connects operators with pre-vetted local creators based on vibe, values, and neighborhood alignment — not follower count.

**Core principle:** Businesses never browse creators. They complete a brand profile, receive a maximum of 3 curated content options, and approve one. The platform handles matching, contracting, and delivery.

**Two user types:**
- **Operators** (F&B business owners/managers) — commission content
- **Creators** (local UGC creators) — receive briefs, submit content, get paid

---

## 2. Tech Stack & Infrastructure

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + custom design tokens ported from existing prototype
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Deployment:** Netlify (static build)

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **ORM:** Prisma (PostgreSQL)
- **File Upload:** Multer → AWS S3
- **AI:** OpenAI API (gpt-4o-mini for vibe analysis, matching)
- **Deployment:** AWS EC2

### Infrastructure
- **Database:** PostgreSQL 16 on AWS RDS
- **File Storage:** AWS S3 (creator portfolios, draft content, brand photos)
- **Environment Variables:** .env files (never committed)

### Design System (Ported from Prototype)
```
Colors:
  dark: "#2C2220"        // Primary text
  mid: "#5A4A42"         // Secondary text
  muted: "#8A7B72"       // Tertiary text
  light: "#6B5B52"       // Light text
  border: "#E8E0DA"      // Borders
  bgWarm: "#FAFAF7"      // Card backgrounds
  bgTan: "#F5F0EB"       // Page background
  accent: "#B85042"      // Operator accent (warm red)
  accentLight: "#FDF0ED" // Operator accent bg
  green: "#1B7D3A"       // Success
  greenBg: "#E6F4EA"     // Success bg
  yellowBg: "#FEF7E0"    // Warning bg
  yellowText: "#9A6C00"  // Warning text
  creator: "#1A6B5A"     // Creator accent (teal)
  creatorLight: "#E8F5F0" // Creator accent bg
  creatorAccent: "#0D9488" // Creator CTA

Fonts:
  display: "Playfair Display" (headings)
  body: "DM Sans" (everything else)
```

---

## 3. Application Architecture

### Monorepo Structure
```
locale/
├── client/                    # Vite + React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/               # Axios instance + API call functions
│   │   ├── assets/            # Static images, seed photos
│   │   ├── components/
│   │   │   ├── common/        # Btn, Chip, StatusBadge, ProgressBar, etc.
│   │   │   ├── layout/        # AppShell, Navbar, DemoSwitcher
│   │   │   ├── operator/      # Operator-specific components
│   │   │   └── creator/       # Creator-specific components
│   │   ├── contexts/          # AuthContext (demo user state)
│   │   ├── hooks/             # useAuth, useApi, etc.
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Homepage — "I'm a business" / "I'm a creator"
│   │   │   ├── operator/
│   │   │   │   ├── Onboarding.jsx  # Brand setup flow (multi-step)
│   │   │   │   ├── Dashboard.jsx   # Returning operator dashboard
│   │   │   │   ├── NewRequest.jsx  # Create content request → see matches
│   │   │   │   ├── MatchDetail.jsx # View match details + confirm
│   │   │   │   ├── ProjectView.jsx # Track project, review drafts
│   │   │   │   └── Library.jsx     # All approved content
│   │   │   └── creator/
│   │   │       ├── Onboarding.jsx  # Creator profile + portfolio upload
│   │   │       ├── Dashboard.jsx   # Earnings, briefs, active projects
│   │   │       ├── BriefDetail.jsx # View brief, accept/decline
│   │   │       └── ProjectView.jsx # Submit drafts, see revisions
│   │   ├── utils/             # Formatting, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js            # Demo data seeding script
│   │   └── migrations/
│   ├── src/
│   │   ├── index.js           # Express app entry
│   │   ├── config/
│   │   │   ├── db.js          # Prisma client singleton
│   │   │   ├── s3.js          # AWS S3 client
│   │   │   └── openai.js      # OpenAI client
│   │   ├── middleware/
│   │   │   ├── auth.js        # Demo auth (reads x-user-id header)
│   │   │   ├── cors.js
│   │   │   └── upload.js      # Multer S3 config
│   │   ├── routes/
│   │   │   ├── auth.js        # GET /api/auth/demo-users, POST /api/auth/login
│   │   │   ├── brands.js      # Brand profile CRUD
│   │   │   ├── creators.js    # Creator profile CRUD
│   │   │   ├── requests.js    # Content requests + matching
│   │   │   ├── projects.js    # Project lifecycle
│   │   │   ├── uploads.js     # S3 file uploads
│   │   │   └── ai.js          # AI analysis endpoints
│   │   ├── services/
│   │   │   ├── matching.js    # Matching algorithm
│   │   │   ├── ai.js          # OpenAI integration
│   │   │   └── payments.js    # Payment abstraction layer
│   │   └── utils/
│   │       └── constants.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 4. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS ───

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  role          UserRole
  isDemo        Boolean   @default(false)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  brandProfile   BrandProfile?
  creatorProfile CreatorProfile?
}

enum UserRole {
  OPERATOR
  CREATOR
}

// ─── BRAND (OPERATOR) PROFILE ───

model BrandProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  
  businessName      String
  neighborhood      String
  city              String   @default("Evanston")
  state             String   @default("IL")
  
  // Auto-import source
  googleMapsUrl     String?
  yelpUrl           String?
  
  // Brand identity (JSONB)
  vibe              Json     // ["Cozy & Warm", "Minimalist"]
  values            Json     // ["Community-first", "Sustainability"]
  contentComfortZones Json   // ["Ambiance / Interior", "Food & Drink"]
  
  // Budget
  budgetMin         Int?     // cents
  budgetMax         Int?     // cents
  
  // AI-generated
  vibeAnalysis      Json?    // OpenAI analysis of brand
  profilePhotoUrl   String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  contentRequests   ContentRequest[]
  projects          Project[]
}

// ─── CREATOR PROFILE ───

model CreatorProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  
  displayName       String
  bio               String?
  instagramHandle   String?
  tiktokHandle      String?
  
  // Creator identity (JSONB)
  contentStyles     Json     // ["Warm & Editorial", "Documentary"]
  strengths         Json     // ["Food photography", "Reels", "Ambiance"]
  neighborhoods     Json     // ["Evanston", "Logan Square"]
  dreamBrands       Json?    // ["Colectivo", "Metric Coffee"]
  
  // AI-generated vibe tags from portfolio analysis
  vibeTags          Json?    // ["warm-light", "minimalist", "community-feel"]
  
  profilePhotoUrl   String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  portfolioItems    PortfolioItem[]
  matches           Match[]
  projects          Project[]
}

// ─── PORTFOLIO ───

model PortfolioItem {
  id               String   @id @default(uuid())
  creatorProfileId String
  creatorProfile   CreatorProfile @relation(fields: [creatorProfileId], references: [id])
  
  imageUrl         String   // S3 URL
  caption          String?
  contentType      String?  // "food", "ambiance", "lifestyle"
  vibeTags         Json?    // AI-analyzed tags for this specific piece
  
  createdAt        DateTime @default(now())
}

// ─── CONTENT REQUESTS ───

model ContentRequest {
  id               String   @id @default(uuid())
  brandProfileId   String
  brandProfile     BrandProfile @relation(fields: [brandProfileId], references: [id])
  
  contentType      String   // "Ambiance / Interior", "Food & Drink", "Community / Culture"
  description      String?  // Optional notes from operator
  stylePreferences Json?    // Additional style hints
  budgetRange      String?  // "$150-250"
  
  status           RequestStatus @default(MATCHING)
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  matches          Match[]
}

enum RequestStatus {
  MATCHING     // AI is generating matches
  PRESENTED    // 3 matches shown to operator
  SELECTED     // Operator picked one
  COMPLETED    // Project finished
  CANCELLED
}

// ─── MATCHES (max 3 per request) ───

model Match {
  id                String   @id @default(uuid())
  contentRequestId  String
  contentRequest    ContentRequest @relation(fields: [contentRequestId], references: [id])
  creatorProfileId  String
  creatorProfile    CreatorProfile @relation(fields: [creatorProfileId], references: [id])
  
  matchScore        Int      // 0-100
  matchRationale    String   // "Similar warm aesthetic + Evanston neighborhood"
  
  // Content proposal
  contentPreview    String   // Description of proposed content
  deliverables      String   // "3 photos + 1 Reel (15s)"
  price             Int      // cents
  timeline          String   // "5 business days"
  usageRights       String   // "Organic social + in-store, 12 months"
  style             String   // "Warm, editorial, natural light"
  
  status            MatchStatus @default(PRESENTED)
  
  createdAt         DateTime @default(now())

  project           Project?
}

enum MatchStatus {
  PRESENTED   // Shown to operator
  SELECTED    // Operator chose this one
  DECLINED    // Operator didn't choose this one
}

// ─── PROJECTS ───

model Project {
  id               String   @id @default(uuid())
  matchId          String   @unique
  match            Match    @relation(fields: [matchId], references: [id])
  brandProfileId   String
  brandProfile     BrandProfile @relation(fields: [brandProfileId], references: [id])
  creatorProfileId String
  creatorProfile   CreatorProfile @relation(fields: [creatorProfileId], references: [id])
  
  status           ProjectStatus @default(BRIEF_SENT)
  
  // Copied from match for record-keeping
  deliverables     String
  price            Int      // cents
  timeline         String
  usageRights      String
  briefText        String?  // Additional instructions from operator
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  drafts           ProjectDraft[]
  transaction      Transaction?
}

enum ProjectStatus {
  BRIEF_SENT
  DRAFT_SUBMITTED
  REVISION_REQUESTED
  APPROVED
  DELIVERED
}

// ─── DRAFTS ───

model ProjectDraft {
  id          String   @id @default(uuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  
  version     Int      @default(1)
  fileUrls    Json     // ["https://s3.../draft1.jpg", ...]
  notes       String?  // Creator notes
  
  // Operator feedback
  feedback    String?  // Revision notes from operator
  status      DraftStatus @default(SUBMITTED)
  
  createdAt   DateTime @default(now())
}

enum DraftStatus {
  SUBMITTED
  REVISION_REQUESTED
  APPROVED
}

// ─── TRANSACTIONS (Stripe-ready) ───

model Transaction {
  id              String   @id @default(uuid())
  projectId       String   @unique
  project         Project  @relation(fields: [projectId], references: [id])
  
  amount          Int      // cents
  platformFee     Int      // cents (e.g., 15% commission)
  creatorPayout   Int      // cents (amount - platformFee)
  
  type            TransactionType
  status          TransactionStatus @default(PENDING)
  
  // Stripe fields (null in demo mode)
  stripePaymentIntentId String?
  stripeTransferId      String?
  
  demoMode        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum TransactionType {
  COMMISSION   // Brand pays
  PAYOUT       // Creator receives
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## 5. API Endpoints

### 5.1 Auth (Demo Mode)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/demo-users` | List all demo users (for switcher) |
| `POST` | `/api/auth/demo-login` | Body: `{ userId }` → returns user + profile |

**Demo auth mechanism:** Frontend sends `x-user-id` header with every request. Backend middleware reads this header, looks up the user, and attaches to `req.user`. No tokens, no sessions. Swap this layer for real auth later.

### 5.2 Brand Profiles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/brands/profile` | Get current operator's brand profile |
| `POST` | `/api/brands/profile` | Create brand profile (onboarding) |
| `PUT` | `/api/brands/profile` | Update brand profile |
| `POST` | `/api/brands/auto-import` | Body: `{ url }` — returns pre-seeded or AI-analyzed brand data |

**POST `/api/brands/profile` body:**
```json
{
  "businessName": "Colectivo Coffee",
  "neighborhood": "Evanston",
  "googleMapsUrl": "https://maps.google.com/...",
  "vibe": ["Cozy & Warm"],
  "values": ["Community-first", "Sustainability"],
  "contentComfortZones": ["Ambiance / Interior", "Staff & Culture"],
  "budgetMin": 15000,
  "budgetMax": 25000
}
```

**POST `/api/brands/auto-import` body:**
```json
{
  "url": "https://www.google.com/maps/place/Colectivo+Coffee"
}
```

**Response:** Returns AI-analyzed brand attributes. Works in both demo and production mode — always hits real APIs.

**How it works:**
1. Detect URL type (Google Maps or Yelp)
2. Extract Place ID (Google) or business alias (Yelp) from URL
3. Fetch business data from the appropriate API (name, address, categories, photos, reviews)
4. Send business data + up to 10 review excerpts to OpenAI for vibe analysis
5. Return structured brand profile suggestion

**Google Maps URL parsing:**
- Extract Place ID from URLs like `https://www.google.com/maps/place/...` or `https://maps.app.goo.gl/...`
- For shortened URLs, follow redirect to get the full URL first
- Call Places API: `GET https://places.googleapis.com/v1/places/{placeId}` with fields: `displayName,formattedAddress,types,reviews,photos,editorialSummary`

**Yelp URL parsing:**
- Extract business alias from `https://www.yelp.com/biz/{alias}`
- Call Yelp Fusion API: `GET https://api.yelp.com/v3/businesses/{alias}` and `GET https://api.yelp.com/v3/businesses/{alias}/reviews`

**OpenAI analysis prompt (fed with API data):**
```
You are a brand analyst for local food & beverage businesses.
Analyze this business based on its reviews and metadata.

Business: {name}
Address: {address}
Categories: {categories}
Review excerpts: {reviews (max 10, concatenated)}

Return JSON only:
{
  "vibe": ["pick 1-2 from: Cozy & Warm, Minimalist & Clean, Energetic & Bold, Rustic & Raw, Polished & Editorial"],
  "values": ["pick 1-3 from: Community-first, Sustainability, Quality-obsessed, Inclusive, Design-forward"],
  "contentComfortZones": ["pick 2-3 from: Ambiance / Interior, Food & Drink, Staff & Culture, Community / Events, Behind the Scenes"],
  "vibeAnalysis": {
    "primaryVibe": "2-3 word vibe summary",
    "aestheticTags": ["3-5 visual/aesthetic descriptors specific to this place"],
    "contentRecommendations": ["3-4 content themes that would resonate"],
    "avoidTags": ["2-3 content styles to avoid"]
  }
}

Be specific to this neighborhood and business. Think about what content would feel authentic here.
```

### 5.3 Creator Profiles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/creators/profile` | Get current creator's profile |
| `POST` | `/api/creators/profile` | Create creator profile (onboarding) |
| `PUT` | `/api/creators/profile` | Update creator profile |
| `POST` | `/api/creators/portfolio` | Upload portfolio images (multipart form) |
| `GET` | `/api/creators/portfolio` | Get creator's portfolio items |

**POST `/api/creators/profile` body:**
```json
{
  "displayName": "Shaurya G.",
  "bio": "Warm editorial content for neighborhood cafés",
  "instagramHandle": "@vibrant_lifestyle",
  "contentStyles": ["Warm & Editorial", "Natural Light"],
  "strengths": ["Food photography", "Ambiance", "Reels"],
  "neighborhoods": ["Evanston", "Rogers Park"],
  "dreamBrands": ["Colectivo Coffee", "Hewn Bread"]
}
```

**POST `/api/creators/portfolio`:** Multipart form with up to 6 images. Each uploaded to S3. Returns array of `PortfolioItem` objects.

### 5.4 Content Requests + Matching

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/requests` | Create content request → triggers matching |
| `GET` | `/api/requests` | List operator's content requests |
| `GET` | `/api/requests/:id` | Get request with matches |
| `POST` | `/api/requests/:id/select/:matchId` | Operator selects a match → creates project |

**POST `/api/requests` body:**
```json
{
  "contentType": "Ambiance / Interior",
  "description": "Morning light, latte art, cozy reading corner",
  "budgetRange": "$150-250"
}
```

**Response:** Returns the request with 3 generated matches. Matching happens synchronously (fast enough with pre-computed vibe tags).

**POST `/api/requests/:id/select/:matchId`:** Marks selected match, declines others, creates a Project with status `BRIEF_SENT`, creates a pending Transaction. Returns the new project.

### 5.5 Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List user's projects (operator or creator, based on role) |
| `GET` | `/api/projects/:id` | Get project detail with drafts |
| `POST` | `/api/projects/:id/drafts` | Creator submits a draft (multipart form) |
| `POST` | `/api/projects/:id/drafts/:draftId/approve` | Operator approves draft |
| `POST` | `/api/projects/:id/drafts/:draftId/revision` | Operator requests revision with notes |
| `POST` | `/api/projects/:id/deliver` | Mark project delivered, complete transaction |

### 5.6 Creator Briefs (Creator-Side View)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/briefs` | Get incoming briefs for current creator (matches with status PRESENTED where creator hasn't responded) |
| `POST` | `/api/briefs/:matchId/accept` | Creator accepts brief → project proceeds |
| `POST` | `/api/briefs/:matchId/decline` | Creator declines brief |

### 5.7 AI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/analyze-brand` | Analyze brand from Google Places / Yelp data (called internally by auto-import) |
| `POST` | `/api/ai/analyze-portfolio` | Analyze creator portfolio images via OpenAI Vision |

**POST `/api/ai/analyze-portfolio` body:**
```json
{
  "imageUrls": [
    "https://locale-uploads.s3.../creators/abc/portfolio/img1.jpg",
    "https://locale-uploads.s3.../creators/abc/portfolio/img2.jpg"
  ]
}
```

**Response:**
```json
{
  "vibeTags": ["warm-light", "minimalist", "community-feel"],
  "primaryStyle": "Warm & Editorial",
  "strengths": ["Food Photography", "Ambiance Shots"],
  "colorPalette": "warm",
  "compositionStyle": "mixed",
  "perImageTags": [
    ["latte-art", "warm-light", "close-up"],
    ["interior", "natural-light", "cozy"]
  ]
}
```

### 5.8 Uploads

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/uploads/image` | Upload single image to S3, returns URL |
| `POST` | `/api/uploads/images` | Upload multiple images to S3, returns URLs |

S3 bucket structure:
```
locale-uploads/
├── brands/{brandProfileId}/
│   └── profile.jpg
├── creators/{creatorProfileId}/
│   ├── profile.jpg
│   └── portfolio/
│       ├── {uuid}.jpg
│       └── ...
└── projects/{projectId}/
    └── drafts/
        ├── v1/{uuid}.jpg
        └── v2/{uuid}.jpg
```

### 5.9 Dashboard Stats

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/stats/operator` | Active projects count, content library count, posting rate |
| `GET` | `/api/stats/creator` | Monthly earnings, active projects, new brief count |

---

## 6. Frontend Routes

```
/                           → Landing (role selection)
/operator/onboarding        → Brand setup (multi-step)
/operator/dashboard         → Returning operator dashboard
/operator/request/new       → New content request flow
/operator/request/:id       → View request matches
/operator/match/:id         → Match detail + confirm
/operator/project/:id       → Project tracking + draft review
/operator/library           → Content library

/creator/onboarding         → Creator profile + portfolio
/creator/dashboard          → Creator dashboard
/creator/brief/:id          → Brief detail + accept/decline
/creator/project/:id        → Project detail + submit drafts
```

---

## 7. Frontend Component Details

### 7.1 Landing Page (`/`)

**Layout:** Full-width, centered content. Locale logo + tagline.

**Content:**
- Headline: "Fresh content for your feed" (operator) / "Brands pay you for your style" (creator)
- Two CTA cards side by side:
  - "I'm a Business" → warm accent palette → `/operator/onboarding` or `/operator/dashboard`
  - "I'm a Creator" → teal palette → `/creator/onboarding` or `/creator/dashboard`
- Stats bar: "3 curated options · <2 min setup · 100% usage rights"

**Demo Switcher:** Floating button (bottom-right corner) labeled "🎭 Demo". Opens a dropdown with pre-seeded accounts:

**Operator accounts:**
- Colectivo Coffee (returning — has active projects)
- Patisserie Coralie (returning — has content library)
- New Coffee Lab (new — no profile yet, triggers onboarding)

**Creator accounts:**
- Shaurya G. (returning — has active projects + earnings)
- Katelyn L. (returning — has incoming briefs)
- New Creator (new — no profile yet, triggers onboarding)

Selecting a demo account sets `userId` in context and navigates to the appropriate route.

### 7.2 Operator Onboarding (`/operator/onboarding`)

**Multi-step form with ProgressBar component.** Steps:

**Step 1 — Quick Setup (Auto-Import)**
- Input field: "Paste your Google Maps or Yelp link"
- Button: "Import" → calls `/api/brands/auto-import`
- On success, auto-fills Step 2 fields
- Skip link: "Set up manually instead"

**Step 2 — Brand Identity**
- Business Name (text input, pre-filled if imported)
- Neighborhood (text input or chip select: Evanston, Rogers Park, Wicker Park, Logan Square, West Loop, etc.)
- Vibe (chip multi-select): Cozy & Warm, Minimalist & Clean, Energetic & Bold, Rustic & Raw, Polished & Editorial
- Values (chip multi-select): Community-first, Sustainability, Quality-obsessed, Inclusive, Design-forward
- Content Comfort Zones (chip multi-select): Ambiance / Interior, Food & Drink, Staff & Culture, Community / Events, Behind the Scenes

**Step 3 — Budget & Preferences**
- Budget range slider: $100–$500 per piece
- Any content no-go's? (optional textarea)

**Step 4 — Confirmation**
- Summary of all selections
- "Create Profile" button
- On success → redirect to `/operator/dashboard`

### 7.3 Operator Dashboard (`/operator/dashboard`)

**Top section:**
- "Welcome back, {name}" + business name
- 3 stat cards:
  - Active Projects (count)
  - Content Library (count of approved content)
  - Posting Rate (% of approved content that's been marked as posted)

**New Request CTA:** Prominent button → `/operator/request/new`

**Active Projects list:** Cards showing project brand, content type, creator (once revealed), status badge, last updated. Click → `/operator/project/:id`

**Recent Content:** Horizontal scroll of approved content thumbnails. Click → `/operator/library`

### 7.4 New Content Request (`/operator/request/new`)

**Simple form:**
- Content Type (single select chips): Ambiance / Interior, Food & Drink, Community / Culture, Behind the Scenes, Seasonal Special
- "What are you looking for?" (optional textarea)
- "Find Matches" button

**On submit:** Calls `POST /api/requests`. Shows loading state ("Finding your best matches...") for 1-2 seconds (intentional delay for perceived AI work, even in demo mode). Then displays 3 match cards.

### 7.5 Match Results (inline in request view or `/operator/request/:id`)

**3 match cards displayed vertically.** Each card shows:
- Content type + style
- Match score badge (e.g., "94% match")
- Content preview description (what the creator would produce)
- Deliverables line
- Price
- Timeline
- Usage rights summary
- "View Details" button

**Creator identity is NOT shown at this stage.**

### 7.6 Match Detail (`/operator/match/:id`)

**Full detail view with all terms visible:**
- Content type
- Style description
- Deliverables (itemized)
- Price (bold, prominent)
- Timeline
- Usage rights (full text)
- Match rationale ("Warm editorial style matches your cozy neighborhood café aesthetic. Creator is active in Evanston.")

**Two CTAs:**
- "Confirm & Commission" (primary) → calls select endpoint → creates project → redirects to `/operator/project/:id`
- "Back to Options" (secondary)

**After confirmation:** Creator identity is revealed (name, photo, handles). Project summary with line items.

### 7.7 Operator Project View (`/operator/project/:id`)

**Project header:** Creator name + photo (now visible), content type, status badge, timeline

**Status tracker:** Visual step indicator: Brief Sent → Draft Submitted → Review → Approved → Delivered

**Draft review section (when status = DRAFT_SUBMITTED):**
- Image/video previews
- Creator notes
- Two CTAs: "Approve ✓" and "Request Revision"
- Revision: opens textarea for notes → calls revision endpoint

**Approved state:** Download button for final assets. "Mark as Posted" toggle (tracks posting rate metric).

### 7.8 Content Library (`/operator/library`)

**Grid of all approved content.** Each item shows:
- Thumbnail
- Creator attribution
- Date
- Content type
- Deliverables
- Posted/Ready to Post badge

Filter by: content type, date, posted status.

### 7.9 Creator Onboarding (`/creator/onboarding`)

**Multi-step form. Teal accent palette.**

**Step 1 — Profile**
- Display Name
- Bio (short textarea)
- Instagram handle (optional)
- TikTok handle (optional)

**Step 2 — Style & Neighborhoods**
- Content Styles (chip multi-select): Warm & Editorial, Documentary & Candid, Clean & Minimal, Bold & Energetic, Moody & Cinematic
- Strengths (chip multi-select): Food Photography, Reels/Short Video, Ambiance Shots, Lifestyle, Portraits, Behind the Scenes
- Neighborhoods (chip multi-select): Evanston, Rogers Park, Wicker Park, Logan Square, West Loop, Hyde Park, Lincoln Park, Uptown
- Dream Brands (optional text tags — type and press enter)

**Step 3 — Portfolio Upload**
- Drag-and-drop zone or click to upload
- 3–6 images required
- "Privacy note: Your portfolio is only shared with brands after you accept a brief."
- Upload goes to S3 via `/api/uploads/images`, then `POST /api/creators/portfolio`

**Step 4 — Confirmation**
- "You're In" screen
- How it works: Matched by style → Briefs arrive → Accept/Decline → Submit & Get Paid
- CTA: "Go to Dashboard"

### 7.10 Creator Dashboard (`/creator/dashboard`)

**Top section:**
- "Hey, {displayName} 📸"
- Location + style summary line
- 3 stat cards (teal bg):
  - Monthly Earnings ($)
  - Active Projects (count)
  - New Briefs (count)

**Incoming Briefs section:** Cards showing:
- Brand name (hidden until accepted) → shows as "Evanston Café" or content type hint
- Neighborhood
- Content type
- Match % with rationale
- Pay (prominent)
- Deliverables
- Timeline
- Click → `/creator/brief/:id`

**Active Projects section:** List with status badges. Click → `/creator/project/:id`

### 7.11 Brief Detail (`/creator/brief/:id`)

**Full brief with all terms in a grid:**
- Content type
- Style direction
- Deliverables
- Pay ($, bold and prominent — Shaurya interview: being undervalued is core pain)
- Timeline
- Usage rights

**Brand identity hidden.** Shows: "Evanston · Cozy & Warm · Community-first"

**Match rationale:** "94% match — Similar to your warm coffee portfolio + Evanston neighborhood"

**Two CTAs:**
- "Accept Brief" → brand name revealed, project starts
- "Decline" → brief removed from queue

### 7.12 Creator Project View (`/creator/project/:id`)

**Project header:** Brand name + photo (visible after acceptance), content type, status, pay

**Status tracker:** Same visual as operator side

**Draft submission area:**
- Upload zone for images/video
- Notes textarea
- "Submit Draft" button

**Revision view (if status = REVISION_REQUESTED):**
- Operator's revision notes displayed
- Upload zone for revised content
- "Submit Revision" button

---

## 8. Matching Algorithm

The matching algorithm runs when an operator creates a content request. It scores all creators and returns the top 3.

### Scoring (0–100 points total)

| Factor | Weight | How It's Calculated |
|--------|--------|---------------------|
| Vibe alignment | 30 | Cosine similarity between brand vibe tags and creator vibe tags |
| Content style match | 25 | Overlap between requested content type and creator strengths |
| Neighborhood proximity | 20 | Exact neighborhood match = 20, adjacent = 10, different = 0 |
| Dream brand match | 15 | If creator listed this brand (or similar) as a dream brand |
| Portfolio quality signal | 10 | Number of portfolio items + variety of content types |

### Implementation (MVP — Weighted Scoring)

```javascript
// services/matching.js

function scoreCreator(brand, request, creator) {
  let score = 0;
  
  // 1. Vibe alignment (30 pts)
  const brandVibes = brand.vibeAnalysis?.aestheticTags || brand.vibe;
  const creatorVibes = creator.vibeTags || creator.contentStyles;
  const vibeOverlap = intersect(brandVibes, creatorVibes).length;
  score += Math.min(30, vibeOverlap * 10);
  
  // 2. Content style match (25 pts)
  const styleMatch = creator.strengths.some(s => 
    s.toLowerCase().includes(request.contentType.toLowerCase().split('/')[0].trim())
  );
  score += styleMatch ? 25 : 8;
  
  // 3. Neighborhood (20 pts)
  const neighborhoodMatch = creator.neighborhoods.includes(brand.neighborhood);
  score += neighborhoodMatch ? 20 : 5;
  
  // 4. Dream brand (15 pts)
  const dreamMatch = creator.dreamBrands?.some(d => 
    d.toLowerCase().includes(brand.businessName.toLowerCase().split(' ')[0])
  );
  score += dreamMatch ? 15 : 0;
  
  // 5. Portfolio quality (10 pts)
  const portfolioCount = creator.portfolioItems?.length || 0;
  score += Math.min(10, portfolioCount * 2);
  
  return Math.min(100, score);
}

function generateMatches(brand, request, allCreators) {
  const scored = allCreators
    .map(creator => ({
      creator,
      score: scoreCreator(brand, request, creator),
      rationale: buildRationale(brand, request, creator)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  return scored.map(({ creator, score, rationale }, i) => ({
    creatorProfileId: creator.id,
    matchScore: score,
    matchRationale: rationale,
    contentPreview: CONTENT_TEMPLATES[request.contentType][i], // pre-written templates
    deliverables: DELIVERABLE_OPTIONS[i],
    price: calculatePrice(request.contentType, i),
    timeline: TIMELINE_OPTIONS[i],
    usageRights: USAGE_OPTIONS[i],
    style: creator.contentStyles[0] || "Natural, authentic"
  }));
}
```

### AI-Enhanced Matching (Real Feature)

When `POST /api/requests` is called, if AI is enabled:

1. Call OpenAI to generate a more nuanced match rationale
2. Call OpenAI to generate a content preview description tailored to the brand

**Prompt for match rationale:**
```
Given this brand and creator, explain in one sentence why they're a good match for {contentType} content. Be specific about aesthetic and neighborhood fit.

Brand: {businessName} in {neighborhood}. Vibe: {vibe}. Values: {values}.
Creator styles: {contentStyles}. Neighborhoods: {neighborhoods}. Strengths: {strengths}.

Return only the rationale sentence.
```

---

## 9. Seed Data

### 9.1 Operator Accounts (Evanston Businesses)

**1. Colectivo Coffee — Evanston**
- Neighborhood: Evanston
- Vibe: ["Cozy & Warm", "Rustic & Raw"]
- Values: ["Community-first", "Sustainability"]
- Content Comfort Zones: ["Ambiance / Interior", "Staff & Culture", "Community / Events"]
- Budget: $150–$250
- Status: Returning user — has 2 active projects, 3 items in content library
- Google Maps URL: real link to Colectivo Evanston

**2. Patisserie Coralie**
- Neighborhood: Evanston (Central St.)
- Vibe: ["Polished & Editorial", "Minimalist & Clean"]
- Values: ["Quality-obsessed", "Design-forward"]
- Content Comfort Zones: ["Food & Drink", "Ambiance / Interior"]
- Budget: $180–$300
- Status: Returning user — has content library with 5 approved items

**3. Hewn Bread**
- Neighborhood: Evanston
- Vibe: ["Rustic & Raw", "Cozy & Warm"]
- Values: ["Quality-obsessed", "Community-first", "Sustainability"]
- Content Comfort Zones: ["Food & Drink", "Behind the Scenes"]
- Budget: $120–$200
- Status: Returning user

**4. New Coffee Lab (Josie's on Noyes)**
- Neighborhood: Evanston (Noyes St.)
- Vibe: ["Energetic & Bold", "Minimalist & Clean"]
- Values: ["Inclusive", "Community-first"]
- Content Comfort Zones: ["Food & Drink", "Community / Events"]
- Budget: $100–$180
- Status: New user — no profile yet (triggers onboarding in demo)

### 9.2 Creator Accounts

**1. Shaurya G. (based on interview — Shaurya Garg)**
- Display Name: "Shaurya G."
- Bio: "Warm editorial content for neighborhood cafés and restaurants"
- Instagram: @vibrant_lifestyle
- Content Styles: ["Warm & Editorial", "Clean & Minimal"]
- Strengths: ["Food Photography", "Ambiance Shots", "Reels/Short Video"]
- Neighborhoods: ["Evanston", "Rogers Park"]
- Dream Brands: ["Colectivo Coffee", "Metric Coffee", "Daisies Chicago"]
- Vibe Tags: ["warm-light", "community-feel", "editorial", "cozy-spaces"]
- Portfolio: 5 seeded images (warm café interiors, latte art, natural light food shots)
- Status: Returning — $600 earned, 3 active projects, 2 incoming briefs

**2. Katelyn L. (based on interview — Katelyn Liu)**
- Display Name: "Katelyn L."
- Bio: "Beauty and lifestyle content with authentic neighborhood energy"
- TikTok: @kk.ameliu
- Content Styles: ["Bold & Energetic", "Documentary & Candid"]
- Strengths: ["Reels/Short Video", "Lifestyle", "Behind the Scenes"]
- Neighborhoods: ["Evanston", "Lincoln Park"]
- Dream Brands: ["Patisserie Coralie", "New Coffee Lab"]
- Vibe Tags: ["energetic", "candid", "lifestyle", "gen-z-aesthetic"]
- Portfolio: 4 seeded images (lifestyle shots, food close-ups, candid moments)
- Status: Returning — $380 earned, 1 active project, 1 incoming brief

**3. Demo Creator (new)**
- Status: New — no profile (triggers onboarding)

### 9.3 Seeded Projects

**Project 1: Colectivo × Shaurya — "Ambiance / Interior"**
- Status: DRAFT_SUBMITTED
- Match Score: 94%
- Deliverables: "3 photos + 1 Reel (15s)"
- Price: $180
- Timeline: "5 business days"
- Draft: 3 warm interior photos uploaded
- Operator hasn't reviewed yet

**Project 2: Colectivo × Katelyn — "Community / Culture"**
- Status: REVISION_REQUESTED
- Match Score: 81%
- Deliverables: "3 photos + 1 Reel (20s)"
- Price: $200
- Revision note: "Love the energy! Could we get one more shot of the barista interaction? The first set felt slightly too posed."

**Project 3: Patisserie Coralie × Shaurya — "Food & Drink"**
- Status: APPROVED
- Match Score: 91%
- Deliverables: "4 photos + 1 Story set"
- Price: $220
- Final assets in content library

**Project 4: Hewn × Shaurya — "Behind the Scenes"**
- Status: BRIEF_SENT
- Match Score: 88%
- Deliverables: "3 photos + 1 Reel (15s)"
- Price: $160

### 9.4 Seeded Transactions

Each completed/active project has a corresponding transaction:
- Platform fee: 15% of project price
- Creator payout: 85% of project price
- All marked `demoMode: true`

### 9.5 Auto-Import Fallback Table

If Google Places or Yelp API calls fail (rate limit, network issue), fall back to this pre-seeded data so the demo still works. The endpoint should try the real API first, catch errors, and return fallback data with a flag `{ source: "fallback" }`.

```javascript
const AUTOFILL_FALLBACK = {
  "colectivo": {
    businessName: "Colectivo Coffee",
    neighborhood: "Evanston",
    vibe: ["Cozy & Warm", "Rustic & Raw"],
    values: ["Community-first", "Sustainability"],
    contentComfortZones: ["Ambiance / Interior", "Staff & Culture"],
    profilePhotoUrl: "https://locale-uploads.s3.../brands/colectivo.jpg"
  },
  "coralie": {
    businessName: "Patisserie Coralie",
    neighborhood: "Evanston",
    vibe: ["Polished & Editorial", "Minimalist & Clean"],
    values: ["Quality-obsessed", "Design-forward"],
    contentComfortZones: ["Food & Drink", "Ambiance / Interior"],
    profilePhotoUrl: "https://locale-uploads.s3.../brands/coralie.jpg"
  },
  "hewn": {
    businessName: "Hewn Bread",
    neighborhood: "Evanston",
    vibe: ["Rustic & Raw", "Cozy & Warm"],
    values: ["Quality-obsessed", "Community-first", "Sustainability"],
    contentComfortZones: ["Food & Drink", "Behind the Scenes"],
    profilePhotoUrl: "https://locale-uploads.s3.../brands/hewn.jpg"
  },
  "coffee lab": {
    businessName: "New Coffee Lab",
    neighborhood: "Evanston",
    vibe: ["Energetic & Bold", "Minimalist & Clean"],
    values: ["Inclusive", "Community-first"],
    contentComfortZones: ["Food & Drink", "Community / Events"],
    profilePhotoUrl: "https://locale-uploads.s3.../brands/coffeelab.jpg"
  }
};
```

---

## 10. Demo Mode Architecture

### Mode Toggle

Environment variable `DEMO_MODE=true` controls behavior globally.

### What Changes in Demo Mode

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| Auth | `x-user-id` header, demo switcher | Google OAuth / email magic link |
| Auto-import | Real Google Places + Yelp API → OpenAI (with fallback table) | Same |
| Portfolio AI analysis | Real OpenAI Vision on uploaded images | Same |
| Matching | Weighted scoring + real OpenAI rationale generation | Same |
| Payments | DB writes only, `demoMode: true` | Stripe payment intents + transfers |
| Notifications | None | Email/push |

### Demo Switcher Component

Floating button, bottom-right corner. Opens a popover with:
- Section: "Operators" — list of demo operator accounts
- Section: "Creators" — list of demo creator accounts
- Each shows: name, avatar, status ("3 active projects" / "New user")
- Click → sets user context → navigates to appropriate route

The switcher should be visually distinct (dark overlay, not part of the normal UI) so it's clearly a presentation tool.

---

## 11. Payment Service Abstraction

```javascript
// services/payments.js

class PaymentService {
  constructor() {
    this.demoMode = process.env.DEMO_MODE === 'true';
  }

  async createCharge(projectId, amount) {
    if (this.demoMode) {
      return this.createDemoTransaction(projectId, amount);
    }
    // TODO: Stripe implementation
    // const paymentIntent = await stripe.paymentIntents.create({...});
    // return this.createTransaction(projectId, amount, paymentIntent.id);
  }

  async createPayout(projectId, creatorPayout) {
    if (this.demoMode) {
      return this.createDemoTransaction(projectId, creatorPayout, 'PAYOUT');
    }
    // TODO: Stripe Connect transfer
  }

  async createDemoTransaction(projectId, amount, type = 'COMMISSION') {
    const platformFee = Math.round(amount * 0.15);
    const creatorPayout = amount - platformFee;
    
    return prisma.transaction.create({
      data: {
        projectId,
        amount,
        platformFee,
        creatorPayout,
        type,
        status: 'COMPLETED',
        demoMode: true
      }
    });
  }
}
```

---

## 12. AI Integration Details

### OpenAI Configuration
- Model: `gpt-4o-mini` (text analysis + JSON generation)
- Model: `gpt-4o-mini` with vision (portfolio image analysis)
- Temperature: 0.7 (creative descriptions), 0.3 (structured analysis)
- Max tokens: 500
- Response format: JSON mode where applicable

### Feature 1: Brand Vibe Analysis via Google Places + Yelp (REAL)

**Trigger:** Operator pastes a Google Maps or Yelp URL during onboarding.

**Flow:**
1. Parse URL to determine source (Google or Yelp)
2. Hit appropriate API to fetch: business name, address, categories, reviews, photos
3. Send to OpenAI with structured prompt (see Section 5.2)
4. Return structured vibe analysis + suggested profile fields
5. Store result in `vibeAnalysis` JSONB field

**Google Places API setup:**
- Enable "Places API (New)" in Google Cloud Console
- API key restricted to Places API only
- Fields to request: `displayName`, `formattedAddress`, `types`, `reviews`, `photos`, `editorialSummary`, `googleMapsUri`
- Cost: $0 for first $200/month credit

**Yelp Fusion API setup:**
- Create app at yelp.com/developers
- Free tier: 5000 API calls/day
- Endpoints: `/v3/businesses/{alias}` + `/v3/businesses/{alias}/reviews`

**Implementation:**
```javascript
// services/ai.js

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeBrandFromUrl(url) {
  // 1. Detect source and fetch data
  let businessData;
  if (url.includes('google.com/maps') || url.includes('maps.app.goo.gl')) {
    businessData = await fetchGooglePlacesData(url);
  } else if (url.includes('yelp.com')) {
    businessData = await fetchYelpData(url);
  } else {
    throw new Error('Unsupported URL. Please use a Google Maps or Yelp link.');
  }

  // 2. Analyze with OpenAI
  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: BRAND_ANALYSIS_PROMPT },
      { role: 'user', content: JSON.stringify(businessData) }
    ]
  });

  const result = JSON.parse(analysis.choices[0].message.content);
  
  return {
    businessName: businessData.name,
    neighborhood: extractNeighborhood(businessData.address),
    profilePhotoUrl: businessData.photos?.[0] || null,
    ...result
  };
}

async function fetchGooglePlacesData(url) {
  const placeId = await extractGooglePlaceId(url);
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress,types,reviews,photos,editorialSummary`,
    { headers: { 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY } }
  );
  const data = await response.json();
  return {
    name: data.displayName?.text,
    address: data.formattedAddress,
    categories: data.types,
    reviews: data.reviews?.slice(0, 10).map(r => r.text?.text) || [],
    photos: data.photos?.slice(0, 3).map(p => 
      `https://places.googleapis.com/v1/${p.name}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxWidthPx=800`
    ) || []
  };
}

async function fetchYelpData(url) {
  const alias = url.split('/biz/')[1]?.split('?')[0];
  const headers = { Authorization: `Bearer ${process.env.YELP_API_KEY}` };
  
  const [bizRes, reviewRes] = await Promise.all([
    fetch(`https://api.yelp.com/v3/businesses/${alias}`, { headers }),
    fetch(`https://api.yelp.com/v3/businesses/${alias}/reviews?limit=10`, { headers })
  ]);
  
  const biz = await bizRes.json();
  const reviews = await reviewRes.json();
  
  return {
    name: biz.name,
    address: biz.location?.display_address?.join(', '),
    categories: biz.categories?.map(c => c.title),
    reviews: reviews.reviews?.map(r => r.text) || [],
    photos: biz.photos?.slice(0, 3) || []
  };
}
```

### Feature 2: Creator Portfolio AI Analysis (REAL)

**Trigger:** Creator uploads portfolio images during onboarding. After images are stored in S3, they are sent to OpenAI Vision for analysis.

**Flow:**
1. Creator uploads 3-6 images → stored in S3
2. S3 URLs passed to OpenAI Vision API
3. OpenAI analyzes visual style across the portfolio
4. Returns structured vibe tags stored in `vibeTags` JSONB on CreatorProfile
5. Individual image tags stored in `vibeTags` on each PortfolioItem

**Implementation:**
```javascript
async function analyzeCreatorPortfolio(imageUrls) {
  const imageMessages = imageUrls.map(url => ({
    type: 'image_url',
    image_url: { url, detail: 'low' } // 'low' = cheaper, sufficient for style analysis
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: `You are a visual style analyst for content creators in the food & beverage space.
Analyze this portfolio of images and classify the creator's visual style.

Return JSON only:
{
  "vibeTags": ["3-5 tags like: warm-light, minimalist, moody, community-feel, editorial, candid, bold-color, natural, rustic, polished"],
  "primaryStyle": "one of: Warm & Editorial, Documentary & Candid, Clean & Minimal, Bold & Energetic, Moody & Cinematic",
  "strengths": ["2-3 from: Food Photography, Ambiance Shots, Lifestyle, Portraits, Behind the Scenes, Reels/Short Video"],
  "colorPalette": "warm / cool / neutral / vibrant",
  "compositionStyle": "tight close-ups / wide environmental / mixed",
  "perImageTags": [["tags for image 1"], ["tags for image 2"], ...]
}`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this creator portfolio:' },
          ...imageMessages
        ]
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Cost estimate:** ~$0.01-0.02 per portfolio analysis (6 images at low detail = ~510 tokens input).

### Feature 3: AI-Enhanced Match Rationale (REAL)

**Trigger:** When matching algorithm returns top 3 creators, OpenAI generates a human-readable rationale for each match.

**Implementation:**
```javascript
async function generateMatchRationale(brand, creator, contentType, matchScore) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 100,
    messages: [
      {
        role: 'system',
        content: `Generate a one-sentence match rationale for why this creator is a good fit for this brand's content request. Be specific about aesthetic and neighborhood alignment. Keep it under 25 words.`
      },
      {
        role: 'user',
        content: `Brand: ${brand.businessName} in ${brand.neighborhood}. Vibe: ${JSON.stringify(brand.vibe)}. Values: ${JSON.stringify(brand.values)}.
Creator styles: ${JSON.stringify(creator.contentStyles)}. Neighborhoods: ${JSON.stringify(creator.neighborhoods)}. Vibe tags: ${JSON.stringify(creator.vibeTags)}.
Content type requested: ${contentType}. Match score: ${matchScore}%.`
      }
    ]
  });

  return response.choices[0].message.content.trim();
}
```

**Cost estimate:** ~$0.001 per rationale × 3 matches = $0.003 per content request. Negligible.

### Feature 4: AI-Generated Content Previews (REAL)

**Trigger:** Along with match rationale, generate a specific content description for what the creator would produce.

```javascript
async function generateContentPreview(brand, creator, contentType) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 150,
    messages: [
      {
        role: 'system',
        content: `You are writing a UGC content preview — a short description of what a creator would produce for a local F&B brand. Be vivid and specific (mention the actual business context). 2-3 sentences max. This should read like a creative brief summary, not a generic template.`
      },
      {
        role: 'user',
        content: `Brand: ${brand.businessName} (${brand.neighborhood}). Vibe: ${JSON.stringify(brand.vibe)}.
Creator style: ${JSON.stringify(creator.contentStyles)}. Strengths: ${JSON.stringify(creator.strengths)}.
Content type: ${contentType}.
Write a preview of what this creator would produce.`
      }
    ]
  });

  return response.choices[0].message.content.trim();
}
```

---

## 13. S3 Configuration

```javascript
// config/s3.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const folder = req.uploadPath || 'misc';
      cb(null, `${folder}/${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

---

## 14. Environment Variables

### Server (.env)
```
# Database
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/locale

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=locale-uploads

# OpenAI
OPENAI_API_KEY=sk-xxx

# Google Places API
GOOGLE_PLACES_API_KEY=xxx

# Yelp Fusion API
YELP_API_KEY=xxx

# App
PORT=3001
DEMO_MODE=true
CORS_ORIGIN=https://locale-app.netlify.app

# Stripe (for future)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Client (.env)
```
VITE_API_URL=https://your-ec2-ip:3001/api
```

---

## 15. Deployment

### Frontend (Netlify)
1. Connect GitHub repo, set build directory to `client/`
2. Build command: `npm run build`
3. Publish directory: `client/dist`
4. Environment variable: `VITE_API_URL`

### Backend (EC2)
1. Clone repo on EC2
2. `cd server && npm install`
3. Set up `.env` with RDS, S3, OpenAI credentials
4. `npx prisma migrate deploy`
5. `npx prisma db seed` (runs seed.js)
6. Run with PM2: `pm2 start src/index.js --name locale-api`
7. Nginx reverse proxy on port 80/443 → localhost:3001

### Database (RDS)
1. Create PostgreSQL 16 instance
2. Security group: allow port 5432 from EC2 security group only
3. Run Prisma migrations from EC2

---

## 16. Development Priorities (1-Week Sprint)

### Day 1: Foundation
- [ ] Initialize monorepo (client + server)
- [ ] Prisma schema + initial migration
- [ ] Express boilerplate with CORS, error handling
- [ ] Vite + Tailwind + design tokens setup
- [ ] Demo auth middleware + demo switcher component

### Day 2: Brand/Operator Flow
- [ ] Brand profile CRUD endpoints
- [ ] Auto-import endpoint (lookup table)
- [ ] Operator onboarding UI (multi-step form)
- [ ] Brand profile creation → DB write

### Day 3: Creator Flow
- [ ] Creator profile CRUD endpoints
- [ ] S3 upload endpoint + multer config
- [ ] Creator onboarding UI (multi-step form + portfolio upload)
- [ ] Portfolio upload → S3 + DB write

### Day 4: Matching + Request Flow
- [ ] Matching algorithm (weighted scoring)
- [ ] Content request endpoints
- [ ] OpenAI brand vibe analysis integration
- [ ] OpenAI match rationale generation
- [ ] New Request UI → match results display → match detail → confirm

### Day 5: Project Lifecycle
- [ ] Project CRUD endpoints
- [ ] Draft submission endpoints (creator side)
- [ ] Approve/revision endpoints (operator side)
- [ ] Project views for both operator and creator
- [ ] Transaction creation on project confirm

### Day 6: Dashboards + Seed Data
- [ ] Operator dashboard with real stats
- [ ] Creator dashboard with real stats
- [ ] Content library page
- [ ] Complete seed script with all demo data
- [ ] Run seed, verify all flows work end-to-end

### Day 7: Polish + Deploy
- [ ] Demo switcher final styling
- [ ] Loading states, error states, empty states
- [ ] Deploy frontend to Netlify
- [ ] Deploy backend to EC2 with PM2
- [ ] Run Prisma migrations on RDS
- [ ] Seed production DB
- [ ] End-to-end walkthrough test

---

## 17. Future Features (Post-Demo)

These are documented for continuity but explicitly OUT OF SCOPE for the demo sprint.

- **Real authentication:** Google OAuth + email magic links (passwordless)
- **Google Places API integration:** Real auto-import from Google Maps / Yelp
- **Creator portfolio AI analysis:** OpenAI Vision API on upload
- **Real-time notifications:** WebSocket or SSE for brief notifications
- **Email notifications:** SendGrid for brief arrivals, draft submissions
- **Stripe integration:** Real payment processing with Stripe Connect
- **Admin panel:** Platform metrics, user management, content moderation
- **Search & filters:** Operators search their content library
- **Creator ratings:** Post-project ratings from operators
- **Multi-location support:** Brands with multiple locations
- **Instagram API scraping:** Auto-populate creator profiles from Instagram
- **Mobile-responsive refinements:** Full responsive pass

---

## 18. Key Interview Insights (For Context)

These insights from user interviews should inform all UX decisions:

1. **"One wrong association can undo years of trust."** (Josh, Colectivo) — Brand safety is paramount. The 3-option limit and content-first matching aren't just features, they're trust mechanisms.

2. **"The stress wasn't about spending money—it was about spending it on the wrong person."** (Raghav, LunaVita) — Decision confidence over discovery volume. The platform should feel like it's reducing choices, not adding them.

3. **"I've been ghosted for asking fair charges, especially for usage or ad rights."** (Shaurya) — Creator pay must be front-and-center, visible at every step. Never hidden.

4. **"It's UGC, but they're telling you what to say."** (Katelyn) — Creative briefs should be directional, not prescriptive. The UI should frame it as guidance, not scripts.

5. **"If it's not obvious, I move on."** (Josh, Colectivo) — Alignment must be evaluable in seconds. Match scores, one-line rationales, clear visual previews.

6. **"Contracts are a barrier to entry."** (Katelyn) — All terms visible upfront in plain language. No legal jargon. No separate contract documents in MVP.

---

*End of PRD*
