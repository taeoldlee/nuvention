# Locale v2 — Product Requirements Document
## Hyperlocal Creator Campaign Assistant for F&B Operators

---

## 1. Product Overview

Locale is a brand-side campaign tool for independent restaurants and coffee shops to post creator briefs, receive applications from creators and agencies, select the best fit, manage content delivery, and pay through escrow. Creators apply to briefs through a public portal — no creator accounts required until a creator is selected.

This is an **in-place refactor** of the existing Locale v1 codebase (two-sided marketplace). Same infrastructure — Railway deployment, RDS, S3, env vars all stay wired. See Section 12 for the refactoring prompt to run in Claude Code.

### What Changed from v1

| v1 (Two-Sided Marketplace) | v2 (Brand Campaign Assistant) |
|---|---|
| Creator accounts, onboarding, dashboard | No creator accounts — public application portal |
| Platform matches creators algorithmically | Brands post briefs, creators self-apply |
| In-platform brief acceptance by creators | Creators apply via public form |
| Creator portfolio management | Creator submits PR kit in application |
| Escrow on match selection | Escrow on mutual agreement (brand selects + creator accepts) |
| Content-first anonymous matching | Open applications ranked by AI alignment to brief |

### Tech Stack (Same as v1)

- **Frontend:** React 18 + Vite 5 + Tailwind CSS
- **Backend:** Express 4 + Prisma 5 + PostgreSQL
- **Storage:** AWS S3 (bucket: photoapp-tae, us-east-2)
- **AI:** OpenAI API (gpt-4o-mini)
- **APIs:** Google Places (client-side), Instagram Scraper Stable + TikTok Scraper7 (RapidAPI)
- **Infrastructure:** EC2 + RDS on AWS
- **Auth:** Demo mode (x-user-id header) for v1. Google OAuth in v2 roadmap.

---

## 2. User Roles

### Brand (Operator)
The paying customer. Restaurant owner, manager, or marketing person at an independent F&B business. They create briefs, review applications, select creators, review content, and approve deliverables.

**Account required:** Yes. Full onboarding with brand profile.

### Creator (Applicant)
Local content creators who browse open briefs and apply. They do NOT create accounts on Locale. They fill out a public application form per brief. If selected, they receive a temporary project portal login to upload deliverables and communicate with the brand.

**Account required:** No account to browse/apply. Temporary portal access after selection.

### Agency
Agencies submit creators on their behalf. For v1, this is handled via a form field ("Applying as: Individual / Agency"). If agency, they specify the creator name + handle they're submitting. Full agency portal is v2.

**Account required:** No. Same application flow with an "agency" flag.

---

## 3. Core User Flows

### Flow A: Brand Onboarding (PORT FROM v1)

This flow is largely built and should be ported from the existing codebase.

1. Brand lands on homepage, clicks "Get Started"
2. Google Places search — brand types business name, selects from autocomplete
3. AI auto-import — system analyzes Google/Yelp reviews to pre-fill brand profile:
   - Business name, neighborhood, city, state
   - Vibe tags (JSON array)
   - Vibe scales (JSON object: cozyEnergetic, quietBuzzy, classicModern, casualElevated — 0-100)
   - Guest experience keywords
   - Cuisine types
   - Budget range (min/max in cents)
   - Content comfort zones
   - Content no-gos
   - Values
4. Brand reviews and edits pre-filled profile
5. Brand optionally uploads reference images (past content they liked)
6. Brand submits → BrandProfile created in DB
7. Redirect to brand dashboard

**Port from v1:**
- `POST /api/brands/analyze-place` — Google Place data → AI vibe analysis
- `POST /api/brands/auto-import` — URL-based import
- `POST /api/brands/profile` — Create brand profile
- `PUT /api/brands/profile` — Update brand profile
- AI service functions: `analyzeBrandFromUrl`, `analyzeBrandFromPlaceData`
- Frontend: operator onboarding flow components

### Flow B: Brief Creation (NEW)

1. From dashboard, brand clicks "Create Brief"
2. Brand fills out brief form (see Section 5 for full field spec):
   - Campaign title
   - Campaign goal
   - Content type(s) requested
   - Number of deliverables
   - Creative direction (free text + reference image upload)
   - Dos and don'ts
   - Timeline / deadline
   - Compensation type and amount
   - Usage rights scope
   - Location requirement
   - Any additional notes
3. AI suggests field values based on brand profile and campaign goal (editable, NOT auto-filled — brand must review)
4. Brand previews brief
5. Brand publishes brief → Brief goes live on public portal
6. Brief status: OPEN

### Flow C: Creator Browses & Applies (NEW)

1. Creator (or anyone) visits public brief portal (e.g., `locale.com/briefs`)
2. Sees grid/list of open briefs with: brand name, campaign title, content type, compensation range, neighborhood, deadline
3. Clicks into brief detail — sees full brief info, brand vibe profile, reference images
4. Clicks "Apply"
5. Fills out application form (see Section 6 for full field spec):
   - Applying as: Individual / Agency
   - If agency: agency name, creator name being submitted, creator handle
   - If individual: name, platform handle(s)
   - Follower count
   - Engagement rate
   - PR Kit / Media Kit: audience demographics (age breakdown, location breakdown), top-performing posts (URLs or screenshots), content style tags
   - Portfolio links or upload of relevant past work (optional — previous content that aligns with brief)
   - Short pitch: "Why I'm a good fit for this brief" (free text)
   - Rate / compensation expectation (or "accepts offered terms")
   - Availability / timeline confirmation
   - Contact email
6. Application submitted → status: PENDING
7. AI ranks application against brief requirements and other applications (see Section 8)

### Flow D: Brand Reviews Applications & Selects Creator (NEW)

1. Brand receives notification (email for now) that applications are coming in
2. Brand opens brief detail → sees applications tab
3. Applications displayed in AI-ranked order (best fit first)
4. Each application card shows: creator name, handle, follower count, engagement rate, audience demographics summary, top posts preview, pitch text, compensation ask, AI match score + rationale
5. Brand can sort/filter by: AI ranking, follower count, engagement rate, location proximity, compensation ask
6. Brand clicks into individual application → full PR kit view, portfolio samples, all submitted data
7. Brand clicks "Select Creator" on chosen application
8. System sends notification to creator's contact email: "You've been selected for [Brief Title] by [Brand Name]"
9. Creator receives temporary portal login link
10. Creator logs into portal, reviews brief terms, clicks "Accept" or "Decline"
11. If accepted → escrow triggered (see Flow F), project created, status: IN_PROGRESS
12. If declined → brand notified, can select another applicant

### Flow E: Content Delivery & Review (PARTIAL PORT FROM v1)

1. Creator uploads deliverables through temporary project portal
2. Brand receives notification
3. Brand reviews uploaded content in project view
4. Brand either:
   - **Approves** → content marked as final, escrow released, final files stored in S3 (30-day retention)
   - **Requests revision** → brand writes feedback, creator receives notification, uploads revised content
5. Default: 1 revision included per brief. Additional revisions negotiable via in-app messaging.
6. If deliverable doesn't match brief spec at all → dispute flag (manual resolution for now, dispute system v2)
7. On approval → project status: COMPLETED, brand can download final assets

**Port from v1:**
- Draft submission flow (`POST /api/projects/:id/drafts`)
- Draft review/approval (`POST /api/projects/:id/drafts/:draftId/approve`)
- Revision request (`POST /api/projects/:id/drafts/:draftId/revision`)
- File upload handler (S3 integration)
- Adapt: remove old match-based project creation, wire to new application-based flow

### Flow F: Escrow & Payment (NEW — SIMULATED FOR DEMO)

1. Brand selects creator → creator accepts → brand is charged (full amount + 10% platform fee)
2. Funds held in escrow (simulated — Transaction record with escrowStatus: HELD)
3. Creator uploads final content → brand approves → escrow released to creator
4. Platform retains 10% fee
5. If brand doesn't approve within [X days], auto-reminder. If dispute, manual resolution.

For demo: all transactions are demoMode=true with simulated amounts. Stripe Connect integration is v2.

### Flow G: In-App Messaging (NEW)

1. After creator is selected and project is active, both parties can message within the project view
2. Messages are project-scoped (not global chat)
3. Simple text messages with timestamps and sender info
4. Notifications sent via email when new message received

**Port from v1:**
- Message model and routes (`POST /api/projects/:projectId/messages`)
- Adapt: wire to new project structure

---

## 4. Data Models (Prisma Schema)

### User
```
id          String   @id @default(uuid())
email       String   @unique
name        String
role        Enum     OPERATOR | ADMIN
isDemo      Boolean  @default(false)
avatarUrl   String?
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```
Relations: → BrandProfile (1:1), → Message (1:many), → Notification (1:many)

Note: No CREATOR role. Creators don't have accounts.

### BrandProfile (PORT FROM v1 — minor changes)
```
id                      String   @id @default(uuid())
userId                  String   @unique (FK→User)
businessName            String
neighborhood            String
city                    String
state                   String
googleMapsUrl           String?
yelpUrl                 String?
vibe                    Json     // string array
values                  Json     // string array
contentComfortZones     Json     // string array
vibeScales              Json     // {cozyEnergetic, quietBuzzy, classicModern, casualElevated: 0-100}
guestExperienceKeywords Json     // string array
visualRefUrls           Json     // string array — reference images
contentNoGos            String?
budgetMin               Int?     // cents
budgetMax               Int?     // cents
cuisineTypes            Json     // string array
vibeAnalysis            Json?    // AI-generated analysis object
profilePhotoUrl         String?
subscriptionTier        Enum     BASIC | PRO  @default(BASIC)
subscriptionStatus      Enum     ACTIVE | CANCELLED | TRIAL  @default(TRIAL)
createdAt               DateTime @default(now())
updatedAt               DateTime @updatedAt
```
Relations: → Brief (1:many), → Project (1:many)

### Brief (NEW — replaces ContentRequest)
```
id                  String   @id @default(uuid())
brandProfileId      String   (FK→BrandProfile)
title               String
campaignGoal        Enum     EVENT_PROMO | MENU_LAUNCH | SEASONAL_SPECIAL | GENERAL_CONTENT | GRAND_OPENING | SLOW_PERIOD_FILL
contentTypes        Json     // string array: ["REEL", "CAROUSEL", "STORY", "TIKTOK", "PHOTO_SET", "BLOG_POST"]
numberOfDeliverables Int
creativeDirection   String   // free text
referencImageUrls   Json     // string array — uploaded reference images
dos                 String?  // free text
donts               String?  // free text
deadline            DateTime?
compensationType    Enum     FREE_PRODUCT | FLAT_FEE | HYBRID | COMMISSION
compensationAmount  Int?     // cents (for flat fee / hybrid cash component)
compensationDetails Json?    // flexible: {description, cashAmount, productValue, etc.}
usageRights         Enum     ORGANIC_SOCIAL | PAID_ADS | IN_STORE | WEBSITE | ALL
locationRequirement Enum     IN_PERSON | REMOTE | FLEXIBLE
additionalNotes     String?
revisionsIncluded   Int      @default(1)
status              Enum     DRAFT | OPEN | CLOSED | CANCELLED
aiSuggestions       Json?    // AI-generated suggestions shown during creation
closedAt            DateTime?
createdAt           DateTime @default(now())
updatedAt           DateTime @updatedAt
```
Relations: → Application (1:many), → BrandProfile (many:1)

### Application (NEW — replaces Match)
```
id                  String   @id @default(uuid())
briefId             String   (FK→Brief)
applicantType       Enum     INDIVIDUAL | AGENCY
agencyName          String?
creatorName         String
creatorHandle       String   // primary platform handle
creatorPlatform     Enum     INSTAGRAM | TIKTOK | YOUTUBE | REDNOTE | OTHER
followerCount       Int?
engagementRate      Float?   // percentage
audienceDemographics Json?   // {ageBreakdown: {}, locationBreakdown: {}, genderBreakdown: {}}
topPostUrls         Json?    // string array
portfolioUrls       Json?    // string array — links or uploaded file URLs
contentStyleTags    Json?    // string array
pitch               String   // "why I'm a good fit"
compensationAsk     String?  // free text — their rate or "accepts offered terms"
availabilityConfirmed Boolean @default(false)
contactEmail        String
aiMatchScore        Float?   // 0-100 calculated by matching algo
aiMatchRationale    String?  // AI-generated explanation
status              Enum     PENDING | SELECTED | DECLINED | WITHDRAWN | REJECTED
viewedByBrandAt     DateTime?
selectedAt          DateTime?
createdAt           DateTime @default(now())
```
Relations: → Brief (many:1), → Project (1:1)

### Project (ADAPTED FROM v1)
```
id                  String   @id @default(uuid())
applicationId       String   @unique (FK→Application)
brandProfileId      String   (FK→BrandProfile)
creatorName         String
creatorEmail        String
creatorAccessToken  String   @unique // temporary portal access token
status              Enum     AWAITING_CREATOR_ACCEPTANCE | ACCEPTED | IN_PROGRESS | DRAFT_SUBMITTED | REVISION_REQUESTED | APPROVED | COMPLETED | DISPUTED
briefText           String   // snapshot of brief at time of project creation
deliverables        String
price               Int      // cents — agreed amount
compensationType    Enum     FREE_PRODUCT | FLAT_FEE | HYBRID | COMMISSION
compensationDetails Json?
usageRights         Enum     ORGANIC_SOCIAL | PAID_ADS | IN_STORE | WEBSITE | ALL
revisionsIncluded   Int      @default(1)
revisionsUsed       Int      @default(0)
creatorAcceptedAt   DateTime?
contentDueAt        DateTime?
completedAt         DateTime?
createdAt           DateTime @default(now())
updatedAt           DateTime @updatedAt
```
Relations: → Application (1:1), → BrandProfile (many:1), → ProjectDraft (1:many), → Transaction (1:1), → Message (1:many)

### ProjectDraft (PORT FROM v1)
```
id          String   @id @default(uuid())
projectId   String   (FK→Project)
version     Int      // auto-increment per project
fileUrls    Json     // string array — S3 URLs
notes       String?  // creator's notes on submission
feedback    String?  // brand's feedback
status      Enum     SUBMITTED | REVISION_REQUESTED | APPROVED
createdAt   DateTime @default(now())
```
Relations: → Project (many:1)

### Transaction (ADAPTED FROM v1)
```
id                    String   @id @default(uuid())
projectId             String   @unique (FK→Project)
amount                Int      // total in cents
platformFee           Int      // 10% in cents
creatorPayout         Int      // 90% in cents
status                Enum     PENDING | ESCROW_HELD | RELEASED | REFUNDED | FAILED
escrowStatus          Enum     HELD | RELEASED | CANCELLED | DISPUTED
demoMode              Boolean  @default(true)
stripePaymentIntentId String?  // v2
stripeTransferId      String?  // v2
createdAt             DateTime @default(now())
updatedAt             DateTime @updatedAt
```
Relations: → Project (1:1)

### Message (PORT FROM v1)
```
id          String   @id @default(uuid())
projectId   String   (FK→Project)
senderType  Enum     BRAND | CREATOR
senderName  String
text        String
createdAt   DateTime @default(now())
```
Index: (projectId, createdAt)
Relations: → Project (many:1)

Note: Messages use senderType instead of userId since creators don't have User accounts.

### Notification (ADAPTED FROM v1)
```
id        String   @id @default(uuid())
userId    String?  (FK→User) // null for creator notifications
email     String?  // for creator notifications sent via email
type      String
title     String
body      String
linkUrl   String?
read      Boolean  @default(false)
createdAt DateTime @default(now())
```
Index: (userId, read, createdAt)

### CampaignData (NEW — analytics/intelligence logging)
```
id                    String   @id @default(uuid())
briefId               String   (FK→Brief)
brandProfileId        String   (FK→BrandProfile)
campaignGoal          String
contentTypes          Json
compensationType      String
compensationAmount    Int?
neighborhood          String
city                  String
cuisineTypes          Json
numberOfApplications  Int      @default(0)
timeToFirstApplication Int?    // minutes
selectedCreatorTier   String?  // follower tier: NANO/MICRO/MID/MACRO
wasContentApproved    Boolean?
revisionsRequested    Int      @default(0)
brandSatisfaction     Int?     // 1-5 rating
completedAt           DateTime?
createdAt             DateTime @default(now())
```

This table logs passively as campaigns progress. No UI needed for v1 — purely backend data collection for v2 predictive intelligence.

---

## 5. Brief Fields (Detailed Spec)

| Field | Type | Required | Options / Notes |
|---|---|---|---|
| title | text | yes | "Trivia Night Launch", "Spring Menu Feature", etc. |
| campaignGoal | select | yes | Event Promo, Menu Launch, Seasonal Special, General Content, Grand Opening, Slow Period Fill |
| contentTypes | multi-select | yes | Reel, Carousel, Story, TikTok, Photo Set, Blog Post |
| numberOfDeliverables | number | yes | e.g., "2 Reels + 3 Stories" — specify per content type |
| creativeDirection | textarea | yes | Free text describing desired style, mood, angle |
| referenceImages | file upload | no | Up to 6 images — examples of desired aesthetic |
| dos | textarea | no | "Show the outdoor patio", "Feature the new cocktail menu" |
| donts | textarea | no | "No competitor logos visible", "Don't mention pricing" |
| deadline | date picker | no | Application rolling until brand closes, but content due date |
| compensationType | select | yes | Free Product, Flat Fee, Hybrid, Commission |
| compensationAmount | number | conditional | Required for Flat Fee and Hybrid |
| compensationDescription | textarea | no | "Free dinner for 2 + $75", "20% of tracked sales" |
| usageRights | select | yes | Organic Social Only, Paid Ads, In-Store, Website, All |
| locationRequirement | select | yes | Must Visit In Person, Remote OK, Flexible |
| revisionsIncluded | number | yes | Default: 1 |
| additionalNotes | textarea | no | Any other context |

### AI Suggestions During Brief Creation

When brand fills in campaign goal and content type, AI generates suggestions for:
- Creative direction based on brand's vibe profile and campaign goal
- Compensation range based on content type and market (hardcoded ranges for demo, data-driven in v2)
- Deliverable structure based on campaign goal (e.g., "Event promos typically do well with 1 reel + 2-3 stories")
- Dos/don'ts based on brand's content comfort zones and no-gos

These are displayed as dismissable suggestion cards — NOT auto-filled into fields. Brand must actively choose to use them.

---

## 6. Application Fields (Detailed Spec)

| Field | Type | Required | Notes |
|---|---|---|---|
| applicantType | radio | yes | Individual / Agency |
| agencyName | text | conditional | Required if Agency |
| creatorName | text | yes | Display name |
| creatorHandle | text | yes | Primary platform handle (e.g., @username) |
| creatorPlatform | select | yes | Instagram, TikTok, YouTube, RedNote, Other |
| followerCount | number | yes | Self-reported |
| engagementRate | number | no | Self-reported percentage |
| audienceDemographics | structured | yes | Age breakdown (dropdown ranges), primary audience location (city/region), gender split |
| topPostUrls | url list | yes (min 2) | Links to 2-5 top performing posts |
| portfolioUrls | url list or upload | no | Past work relevant to this brief |
| contentStyleTags | multi-select | no | Clean, Minimalist, Cinematic, Candid, Bright, Moody, Documentary, Lifestyle, Editorial, Raw, Playful |
| pitch | textarea | yes | "Why I'm a good fit" — max 500 chars |
| compensationAsk | text | no | Their rate, or "accepts offered terms" |
| availabilityConfirmed | checkbox | yes | "I can deliver by the deadline" |
| contactEmail | email | yes | For notifications and portal access |

---

## 7. API Endpoints

### Auth
- `POST /api/auth/demo-login` — Demo mode login (port from v1)

### Brand Profile
- `POST /api/brands/analyze-place` — AI vibe analysis from Google Place data (port from v1)
- `POST /api/brands/auto-import` — AI vibe analysis from URL (port from v1)
- `POST /api/brands/profile` — Create brand profile (port from v1)
- `PUT /api/brands/profile` — Update brand profile (port from v1)
- `GET /api/brands/profile` — Get current brand's profile

### Briefs
- `POST /api/briefs` — Create new brief (brand only)
- `GET /api/briefs` — List brand's briefs (brand only, with status filter)
- `GET /api/briefs/:id` — Get brief detail (brand sees applications, public sees brief info)
- `PUT /api/briefs/:id` — Update brief (brand only, DRAFT or OPEN status)
- `POST /api/briefs/:id/close` — Close brief to new applications (brand only)
- `DELETE /api/briefs/:id` — Cancel brief (brand only, DRAFT status only)

### Public Brief Portal
- `GET /api/portal/briefs` — List all OPEN briefs (public, no auth)
- `GET /api/portal/briefs/:id` — Get brief detail for public view (no auth)
- `POST /api/portal/briefs/:id/apply` — Submit application (no auth required)

### Applications
- `GET /api/briefs/:id/applications` — List applications for a brief (brand only, AI-ranked)
- `GET /api/applications/:id` — Get application detail (brand only)
- `POST /api/applications/:id/select` — Select an applicant (brand only → triggers project creation + notification)
- `POST /api/applications/:id/reject` — Reject an applicant (brand only)

### Projects
- `GET /api/projects` — List brand's projects (brand only)
- `GET /api/projects/:id` — Get project detail (brand or creator via access token)
- `POST /api/projects/:id/accept` — Creator accepts project (creator portal, via access token)
- `POST /api/projects/:id/decline` — Creator declines project (creator portal, via access token)

### Content Delivery
- `POST /api/uploads/images` — Upload files to S3 (port from v1)
- `POST /api/projects/:id/drafts` — Creator submits draft (creator portal)
- `POST /api/projects/:id/drafts/:draftId/approve` — Brand approves draft (port from v1)
- `POST /api/projects/:id/drafts/:draftId/revision` — Brand requests revision (port from v1)
- `POST /api/projects/:id/complete` — Mark project complete, release escrow

### Messaging
- `GET /api/projects/:id/messages` — Get project messages (brand or creator)
- `POST /api/projects/:id/messages` — Send message (brand or creator)

### Payments
- `POST /api/projects/:id/charge` — Create escrow hold (triggered on creator acceptance)
- `POST /api/projects/:id/release` — Release escrow (triggered on content approval)

### AI
- `POST /api/ai/suggest-brief` — AI suggestions during brief creation
- `POST /api/ai/rank-applications` — AI ranking of applications against brief (called automatically)

### Notifications
- `GET /api/notifications` — List user's notifications (brand only in v1)
- `POST /api/notifications/read-all` — Mark all read

### Stats / Dashboard
- `GET /api/stats/brand` — Dashboard stats (active briefs, total applications, active projects, completed projects)

### Admin
- `POST /api/admin/reseed` — Reset demo data (port from v1)
- `GET /api/admin/analytics` — Aggregate CampaignData view (admin only)

---

## 8. AI Matching / Application Ranking

When applications come in for a brief, the system scores each application against the brief requirements.

### Scoring Factors

| Factor | Weight | How It's Measured |
|---|---|---|
| Content style alignment | 25 | Compare applicant's contentStyleTags and top post aesthetic (AI vision analysis) to brief's creative direction and brand's vibe |
| Location proximity | 20 | Applicant's audience location breakdown vs brand's neighborhood. Bonus for local creators. |
| Portfolio relevance | 20 | AI analyzes linked top posts for relevance to brief's campaign goal and content type |
| Engagement quality | 15 | Engagement rate relative to follower count. Higher rate = higher score. |
| Compensation fit | 10 | How close applicant's ask is to brief's offered compensation |
| Audience demographics fit | 10 | Age/gender match to brand's target audience |

### Implementation

- On application submission, run `POST /api/ai/rank-applications` automatically
- Use OpenAI (gpt-4o-mini) to analyze top post URLs for style, quality, relevance
- Score 0-100, store in Application.aiMatchScore
- Generate 2-3 sentence rationale, store in Application.aiMatchRationale
- Re-rank all applications for a brief when new one comes in

### Brand-Side Sorting

In addition to AI ranking, brand can sort applications by:
- AI match score (default)
- Follower count (high to low)
- Engagement rate (high to low)
- Location proximity
- Compensation ask (low to high)

---

## 9. Screens

### Brand Side

1. **Landing Page** — Hero, value prop, CTA to sign up or log in
2. **Brand Onboarding** — Multi-step: Google Places search → AI import → vibe profile review/edit → reference images → submit (port from v1)
3. **Brand Dashboard** — Overview cards: active briefs count, total applications received, active projects, completed projects. List of recent briefs with status badges. Quick action: "Create Brief"
4. **Create Brief** — Form with all brief fields (Section 5). AI suggestion cards appear contextually. Preview before publish.
5. **Brief Detail** — Brief info at top, tabs: Applications (with count), Selected Creator, Messages. Applications tab shows AI-ranked list of applicant cards.
6. **Application Review** — Full applicant detail: PR kit data, top posts embed/preview, portfolio, pitch, AI match score with rationale, audience demographics charts. Actions: Select, Reject.
7. **Active Project View** — Project status tracker (visual pipeline), brief snapshot, creator info, draft submissions with review actions (approve / request revision), messaging panel, escrow status, download final assets.
8. **Brand Settings** — Edit brand profile, subscription info, notification preferences.

### Creator / Public Side

9. **Public Brief Portal** — Grid/list of open briefs. Each card: brand name, campaign title, content type icons, compensation range, neighborhood, deadline. Filter by: neighborhood, content type, compensation type.
10. **Brief Detail (Public)** — Full brief info, brand vibe profile, reference images. "Apply" CTA at bottom.
11. **Application Form** — All fields from Section 6. Submit button.
12. **Creator Project Portal** — Accessed via unique token link sent to email. Shows: brief details, agreed terms, draft upload area, revision feedback, messaging panel, escrow status.

### Admin

13. **Admin Dashboard** — Aggregate campaign data, platform stats, reseed button for demo.

**Total: 13 screens.**

---

## 10. Codebase Refactor Guide (In-Place)

This is an in-place refactor. No new repo. Railway deployment, RDS, S3, env vars all stay wired.

### Keep As-Is (minimal or no changes)
- Brand onboarding flow — frontend components + API routes for Google Places import, AI vibe analysis, brand profile CRUD
- AI service functions — `analyzeBrandFromUrl`, `analyzeBrandFromPlaceData`
- S3 upload configuration and routes (multer + multer-s3)
- File upload UI components (image upload with preview)
- PDFKit usage rights generation
- Prisma connection config
- Environment variable structure (.env)
- Express server setup, CORS, middleware patterns
- Shared UI components (buttons, cards, modals, form elements, layout, Tailwind config)
- Railway deployment config
- Package.json scripts and dev tooling (concurrently, nodemon)

### Keep and Adapt
- **Message model + routes** → change from userId-based to senderType (BRAND/CREATOR) enum since creators don't have User accounts
- **ProjectDraft model + routes** → same structure, wire to new Application-based project creation instead of Match-based
- **Transaction/payment service** → change fee from 15% to 10%, add escrow hold/release on different triggers (mutual acceptance, not match selection)
- **Dashboard stats routes** → rewrite queries for new Brief/Application schema instead of ContentRequest/Match
- **Matching algorithm** → rewrite as application scoring against brief requirements instead of creator-to-request matching. Keep weighted scoring concept, change factors per Section 8.
- **Notification service** → adapt for email-based creator notifications (creators don't have User accounts)
- **Seed data** → rewrite for new schema with demo briefs, applications, projects

### Delete
- All `/creator/*` routes and frontend pages/components
- Creator auth, onboarding, dashboard, settings
- CreatorProfile model
- PortfolioItem model (creator-managed)
- Match model
- ContentRequest model
- Brief acceptance UI (creator accepting incoming briefs)
- Social scraper as user-facing onboarding feature
- Any two-sided marketplace logic
- Creator-specific API routes (`/api/creators/*`, `/api/briefs/:matchId/accept`, `/api/briefs/:matchId/decline`, etc.)

### Build New
- Brief model + CRUD routes + form UI
- Application model + CRUD routes + form UI
- Public brief portal (no-auth pages at `/portal/*`)
- Application form (no-auth submission)
- AI application ranking service
- Creator project portal (token-based access)
- CampaignData analytics logging model
- Brand subscription tracking fields
- Admin analytics dashboard

---

## 11. File Handling

### S3 Storage
- **Reference images** (brief creation): uploaded to S3, URLs stored in Brief.referenceImageUrls
- **Application portfolio uploads**: uploaded to S3, URLs stored in Application.portfolioUrls
- **Draft submissions**: uploaded to S3, URLs stored in ProjectDraft.fileUrls
- **Final approved content**: same S3 objects as approved draft. Auto-delete after 30 days. Brand should download and keep.

### Upload Limits
- Max 6 files per upload
- Max 100MB total per upload
- Accepted types: jpg, jpeg, png, gif, mp4, mov, webp

### Fallback
- If AWS credentials missing, fall back to disk storage at `/tmp/locale-uploads`
- Serve via `GET /api/uploads/files/*` static route (same as v1)

---

## 12. Refactoring Prompt for Claude Code

Copy and paste this into Claude Code at the root of the existing Locale repository:

```
Read the PRD file in this repo (locale-v2-prd.md).

We are refactoring this repo IN PLACE. Same infra — Railway deployment, RDS, S3, env vars all stay wired. The product is pivoting from a two-sided marketplace to a brand-side campaign assistant where creators apply to briefs through a public portal.

Do this in order:

STEP 1 — AUDIT
Scan the entire codebase and categorize every file into:
A) KEEP AS-IS: brand onboarding (Google Places, AI vibe analysis, brand profile CRUD), AI service (analyzeBrandFromUrl, analyzeBrandFromPlaceData), S3 upload config + routes, file upload UI components, PDFKit, Prisma connection config, .env structure, Express server setup + CORS + middleware, shared UI components (buttons, cards, modals, forms, layout, Tailwind), Railway config, package.json scripts, concurrently/nodemon tooling
B) KEEP AND ADAPT: Message model + routes (change userId to senderType BRAND/CREATOR enum), ProjectDraft model + routes (wire to Application-based projects), Transaction/payment service (15% → 10%, escrow on mutual acceptance), dashboard stats (rewrite for Brief/Application schema), matching algorithm (rewrite as application scoring per PRD Section 8), notification service (add email-based creator notifications), seed data (rewrite for new schema)
C) DELETE: all /creator/* routes + frontend pages + components, creator auth/onboarding/dashboard/settings, CreatorProfile model, PortfolioItem model, Match model, ContentRequest model, brief acceptance UI (creator side), social scraper as user-facing feature, all two-sided marketplace logic, creator-specific API routes (/api/creators/*, /api/briefs/:matchId/accept, /api/briefs/:matchId/decline)
D) BUILD NEW: Brief model + CRUD + UI, Application model + CRUD + UI, public brief portal (no-auth /portal/* pages), application form (no-auth), AI application ranking service, creator project portal (token-based access), CampaignData logging model, brand subscription fields, admin analytics dashboard

Output the full file list for each category with exact file paths. DO NOT make any changes yet.

STEP 2 — CONFIRM
Stop and show me the audit. I will confirm before any code changes.

STEP 3 — EXECUTE (only after my confirmation)
a) Delete all files in category C
b) Update Prisma schema per the PRD Section 4:
   - Drop: CreatorProfile, PortfolioItem, ContentRequest, Match
   - Add: Brief, Application, CampaignData
   - Adapt: User (remove CREATOR role), BrandProfile (add subscription fields), Project (remove matchId, add applicationId + creatorAccessToken + creatorName + creatorEmail), Transaction (change to 10% fee + new escrow triggers), Message (senderType enum instead of userId), Notification (add email field for creators)
c) Run prisma migrate
d) Adapt all category B files per the PRD
e) Build all category D features per the PRD (Sections 3-9)
f) Create new seed data per PRD Section 16
g) DO NOT touch Railway config, .env, or infrastructure files
h) Verify the dev server starts and seed data loads
```

---

## 13. Revenue Model

### Brand Subscription
- **Basic:** $39/month — up to 3 active briefs, basic AI suggestions
- **Pro:** $59/month — unlimited briefs, advanced AI suggestions, priority support

### Platform Fee
- 10% on every completed transaction (taken from brand's payment, not creator's payout)
- Example: Brief offers $100 flat fee → brand pays $110 → creator receives $100 → Locale keeps $10

### Demo Mode
- All subscription and payment features simulated
- No real charges processed
- Transaction records created with demoMode=true

---

## 14. Data Logging (v2 Intelligence Prep)

Log the following passively in CampaignData on every brief lifecycle event. No UI surfaces this data in v1.

| Event | What Gets Logged |
|---|---|
| Brief published | campaignGoal, contentTypes, compensationType, compensationAmount, neighborhood, city, cuisineTypes |
| Application received | Increment numberOfApplications. On first: record timeToFirstApplication |
| Creator selected | selectedCreatorTier (calculated from follower count) |
| Content approved | wasContentApproved=true, revisionsRequested count |
| Project completed | completedAt timestamp |
| Brand rates experience | brandSatisfaction (1-5, prompted after completion) |

---

## 15. Notification Triggers

| Event | Who Gets Notified | Channel |
|---|---|---|
| New application received | Brand | Email + in-app |
| Selected for brief | Creator | Email (with portal link) |
| Creator accepted project | Brand | Email + in-app |
| Creator declined project | Brand | Email + in-app |
| Draft submitted | Brand | Email + in-app |
| Revision requested | Creator | Email |
| Content approved | Creator | Email |
| Escrow released | Creator | Email |
| New message | Other party | Email |
| Brief closed by brand | All pending applicants | Email (courtesy) |

---

## 16. Demo Seed Data

Create realistic demo data for class presentation:

### Demo Brands (2)
1. **Todoroki Evanston** — Japanese fusion, student-friendly, casual, 696 IG followers. Campaign: Trivia Night launch.
2. **Patisserie Coralie** — French bakery, upscale-casual, neighborhood gem. Campaign: Spring pastry collection.

### Demo Briefs (2, one per brand)
1. Todoroki: "Wednesday Trivia Night Launch" — 2 Reels + 3 Stories, free dinner for 2, in-person required
2. Coralie: "Spring Collection Feature" — 1 Carousel + 1 Reel, $75 flat fee, in-person required

### Demo Applications (4-6 per brief)
- Mix of individual and one agency submission
- Varying follower counts (500 to 15K), engagement rates, audience demographics
- AI match scores pre-calculated
- One application already selected and in active project state

### Demo Project (1 active)
- Todoroki brief → selected creator → project in DRAFT_SUBMITTED status
- 1 draft uploaded with sample images
- 2-3 messages exchanged
- Transaction in ESCROW_HELD status

---

## 17. Out of Scope (v2 Roadmap)

- Google OAuth (real auth)
- Mobile responsiveness
- Stripe Connect (real payments)
- Agency portal with multi-creator management
- Predictive acceptance rate intelligence
- Benchmark surfaces in UI
- Creator accounts and profiles
- Dispute resolution system
- Watermarked preview uploads (ffmpeg)
- Calendar / availability management
- Content licensing and repurposing
- Social scraper for internal creator scouting pipeline
- Automated brief-to-creator outreach
- Advanced subscription management
