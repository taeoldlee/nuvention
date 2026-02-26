# Issue #48: Consolidate to 2 Demo Brands

**Link**: https://github.com/taeoldlee/nuvention/issues/48

## Decision Summary
- **Keep**: Todoroki Ramen (Josh) as the fully-loaded brand + blank operator for onboarding
- **Delete**: Marie/Coralie, Ellen/Hewn
- **Data shape**: More briefs, ~1 project each, all briefs clickable
- **Edge cases**: Include ALL enum values (FAILED, REFUNDED, DISPUTED, CANCELLED)

## Data Design

### Users (2)
1. `demo-operator-new` — blank, for onboarding demo
2. `demo-operator-josh` — Josh Rivera, Todoroki Ramen, fully loaded (PRO/ACTIVE)

### Brand Profile (1)
- Todoroki Ramen (Evanston, IL) — complete profile with vibes, cuisines, budget, etc.

### Briefs (12 total: 1 DRAFT, 5 OPEN, 4 CLOSED, 2 CANCELLED)

| # | Title | Goal | Status | Apps | Project |
|---|-------|------|--------|------|---------|
| 1 | Late Night Ramen TikTok | SLOW_PERIOD_FILL | DRAFT | 0 | — |
| 2 | Summer Ramen Launch | MENU_LAUNCH | OPEN | 4 | P1: AWAITING_CREATOR |
| 3 | Lincoln Park Grand Opening | GRAND_OPENING | OPEN | 3 | P2: ACCEPTED |
| 4 | Weeknight Happy Hour Promo | SLOW_PERIOD_FILL | OPEN | 3 | P3: IN_PROGRESS |
| 5 | Fall Menu Refresh | SEASONAL_SPECIAL | OPEN | 3 | P4: DRAFT_SUBMITTED |
| 6 | Behind the Counter Series | GENERAL_CONTENT | OPEN | 3 | P5: REVISION_REQUESTED |
| 7 | Ramen Festival Coverage | EVENT_PROMO | CLOSED | 2 | P6: APPROVED |
| 8 | Valentine's Special Set | EVENT_PROMO | CLOSED | 3 | P7: COMPLETED (3 revisions) |
| 9 | Holiday Catering Push | SEASONAL_SPECIAL | CLOSED | 2 | P8: DISPUTED |
| 10 | Staff Spotlight Series | GENERAL_CONTENT | CLOSED | 2 | P9: COMPLETED (refunded) |
| 11 | New Year's Countdown | EVENT_PROMO | CANCELLED | 2 | — |
| 12 | Anniversary Celebration | GRAND_OPENING | CANCELLED | 0 | P10: payment failed |

Note: Brief 12 had a project where payment failed before brief was cancelled.

### Applications (27 total)

**Status coverage:**
- SELECTED: 10 (one per project)
- PENDING: 9
- DECLINED: 4
- REJECTED: 2
- WITHDRAWN: 2

### Projects (10 total — all 8 ProjectStatus + 2 extra for REFUNDED/FAILED tx)

| # | Brief | Creator | Status | Drafts | Tx Status | Escrow |
|---|-------|---------|--------|--------|-----------|--------|
| P1 | Summer Ramen | Shaurya | AWAITING_CREATOR_ACCEPTANCE | 0 | PENDING | HELD |
| P2 | LP Grand Opening | Katelyn | ACCEPTED | 0 | ESCROW_HELD | HELD |
| P3 | Weeknight Happy Hour | Dani | IN_PROGRESS | 0 | ESCROW_HELD | HELD |
| P4 | Fall Menu Refresh | Emma | DRAFT_SUBMITTED | 1: SUBMITTED | ESCROW_HELD | HELD |
| P5 | Behind Counter | Marcus | REVISION_REQUESTED | 1: REV_REQ | ESCROW_HELD | HELD |
| P6 | Ramen Festival | Priya | APPROVED | 1: APPROVED | ESCROW_HELD | HELD |
| P7 | Valentine's | Lucy | COMPLETED | v1:REV_REQ, v2:REV_REQ, v3:APPROVED | RELEASED | RELEASED |
| P8 | Holiday Catering | Sam | DISPUTED | 1: SUBMITTED | ESCROW_HELD | DISPUTED |
| P9 | Staff Spotlight | Ava | COMPLETED | 1: APPROVED | REFUNDED | CANCELLED |
| P10 | Anniversary | Jin | AWAITING_CREATOR_ACCEPTANCE | 0 | FAILED | HELD |

**Enum coverage:**
- ProjectStatus: all 8 ✓
- DraftStatus: SUBMITTED(2), REVISION_REQUESTED(3), APPROVED(3) ✓
- TransactionStatus: PENDING, ESCROW_HELD(4), RELEASED, REFUNDED, FAILED ✓
- EscrowStatus: HELD(6), RELEASED, CANCELLED, DISPUTED ✓

### Messages (across 4 projects: P3, P5, P7, P8)
- ~12-15 messages total

### Notifications (12+ for Josh)
- NEW_APPLICATION: ~6 (unread + read mix)
- DRAFT_SUBMITTED: 2
- PROJECT_COMPLETED: 1
- Mix of read/unread

### CampaignData (6+ records for Todoroki)
- Historical completed campaigns
- Enough to unlock Insights page (need ≥ 3)

## Implementation Steps

1. **Create branch** `issue-48-consolidate-demo-brands`
2. **Rewrite `server/prisma/seed.js`** — complete rewrite with new data model
3. **Verify**: `prisma db push` + `prisma db seed` + start server
4. **Test API endpoints**: demo-users (2), briefs, projects, insights
5. **Create PR**
