# Issue #47: Remove All Agency Infrastructure

**Issue**: https://github.com/taeoldlee/nuvention/issues/47
**Branch**: `issue-47-remove-agency-infrastructure`

## Plan

### Step 1: Schema cleanup
- Delete `AgencyProfile` model
- Delete `AgencyCreator` model
- Remove `AGENCY` from `UserRole` enum
- Remove `agencyProfile` relation from `User`
- Remove `agencyProfileId`, `agencyCreatorId`, `agencyName`, `applicantType` fields from `Application`
- Delete `ApplicantType` enum entirely

### Step 2: Server route + middleware cleanup
- Delete `server/src/routes/agencies.js`
- Remove agency route import + mount from `server/src/index.js`
- Remove `requireAgencyWithProfile` from `server/src/middleware/auth.js`
- Remove `agencyProfile: true` from `requireAuth` and `optionalAuth` includes
- Clean up `portal.js` — remove `applicantType`, `agencyName` from apply endpoint

### Step 3: Seed data cleanup
- Remove agency users (`demo-agency-sarah`, `demo-agency-new`)
- Remove North Shore Creators agency profile
- Remove 6 agency roster creators
- Remove agency-type applications (9 total)
- Replace with individual creator applications to keep briefs populated
- Remove `agencyCreator.deleteMany()` and `agencyProfile.deleteMany()` from clean slate
- Remove agency console.log lines

### Step 4: Frontend — delete agency pages + routes
- Delete `client/src/pages/agency/` directory (5 files)
- Remove agency imports + routes from `App.jsx`
- Remove `isAgency` logic from `HomeRedirect`

### Step 5: Frontend — clean up layout + auth
- Remove `isAgency` from `AuthContext`
- Remove agency nav links + purple badge from `Navbar.jsx`
- Remove agency section from `DemoSwitcher.jsx`
- Remove agency API functions from `client/src/api/index.js`

### Step 6: Landing page update
- Rewrite to reflect pivot: "we help you know which content works + we have creator database"
- Reduce clutter (user said it's too crowded)
- Remove "For Creators" section (or simplify dramatically)
- Update "How it works" steps to reflect new flow
- Simplify pricing, FAQ, features

### Step 7: Push schema + test
- Run `npx prisma db push` to sync schema
- Run `npx prisma db seed` to verify seed works
- Start dev server and verify no errors
