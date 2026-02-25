const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireAgencyWithProfile } = require("../middleware/auth");

// All routes require auth
router.use(requireAuth);

// ─── PROFILE ────────────────────────────────────────────────────

/**
 * GET /api/agencies/profile
 * Get current agency's profile.
 */
router.get("/profile", async (req, res, next) => {
  try {
    const profile = await prisma.agencyProfile.findUnique({
      where: { userId: req.user.id },
      include: { creators: true },
    });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/agencies/profile
 * Create agency profile (onboarding).
 */
router.post("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "AGENCY") {
      return res.status(403).json({ error: "Only agency users can create an agency profile" });
    }

    const existing = await prisma.agencyProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ error: "Agency profile already exists" });
    }

    const { agencyName, contactName, contactEmail, agencyType, serviceArea, bio, websiteUrl, specialties } = req.body;

    const profile = await prisma.agencyProfile.create({
      data: {
        userId: req.user.id,
        agencyName,
        contactName,
        contactEmail,
        agencyType,
        serviceArea: serviceArea || null,
        bio: bio || null,
        websiteUrl: websiteUrl || null,
        specialties: specialties || [],
      },
    });

    // Update user name if blank
    if (!req.user.name && contactName) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: contactName },
      });
    }

    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/agencies/profile
 * Update agency profile.
 */
router.put("/profile", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const { agencyName, contactName, contactEmail, agencyType, serviceArea, bio, websiteUrl, specialties } = req.body;

    const profile = await prisma.agencyProfile.update({
      where: { id: req.agencyProfile.id },
      data: {
        agencyName,
        contactName,
        contactEmail,
        agencyType,
        serviceArea: serviceArea || null,
        bio: bio || null,
        websiteUrl: websiteUrl || null,
        specialties: specialties || [],
      },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// ─── ROSTER ─────────────────────────────────────────────────────

/**
 * GET /api/agencies/roster
 * List all creators in the agency's roster.
 */
router.get("/roster", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const creators = await prisma.agencyCreator.findMany({
      where: { agencyProfileId: req.agencyProfile.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ creators });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/agencies/roster
 * Add a creator to the roster.
 */
router.post("/roster", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const { name, handle, platform, followerCount, engagementRate, topPostUrls, portfolioUrls, contentStyleTags, contactEmail, bio } = req.body;

    const creator = await prisma.agencyCreator.create({
      data: {
        agencyProfileId: req.agencyProfile.id,
        name,
        handle,
        platform,
        followerCount: followerCount ? parseInt(followerCount) : null,
        engagementRate: engagementRate ? parseFloat(engagementRate) : null,
        topPostUrls: topPostUrls || [],
        portfolioUrls: portfolioUrls || [],
        contentStyleTags: contentStyleTags || [],
        contactEmail: contactEmail || null,
        bio: bio || null,
      },
    });

    res.status(201).json({ creator });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/agencies/roster/:id
 * Update a roster creator.
 */
router.put("/roster/:id", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const existing = await prisma.agencyCreator.findFirst({
      where: { id: req.params.id, agencyProfileId: req.agencyProfile.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Creator not found in your roster" });
    }

    const { name, handle, platform, followerCount, engagementRate, topPostUrls, portfolioUrls, contentStyleTags, contactEmail, bio } = req.body;

    const creator = await prisma.agencyCreator.update({
      where: { id: req.params.id },
      data: {
        name,
        handle,
        platform,
        followerCount: followerCount ? parseInt(followerCount) : null,
        engagementRate: engagementRate ? parseFloat(engagementRate) : null,
        topPostUrls: topPostUrls || [],
        portfolioUrls: portfolioUrls || [],
        contentStyleTags: contentStyleTags || [],
        contactEmail: contactEmail || null,
        bio: bio || null,
      },
    });

    res.json({ creator });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/agencies/roster/:id
 * Remove a creator from the roster.
 */
router.delete("/roster/:id", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const existing = await prisma.agencyCreator.findFirst({
      where: { id: req.params.id, agencyProfileId: req.agencyProfile.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Creator not found in your roster" });
    }

    await prisma.agencyCreator.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ─── BRIEFS (Browse open briefs) ────────────────────────────────

/**
 * GET /api/agencies/briefs
 * List all open briefs for the agency to browse.
 */
router.get("/briefs", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const briefs = await prisma.brief.findMany({
      where: { status: "OPEN" },
      include: {
        brandProfile: {
          select: { businessName: true, neighborhood: true, city: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ briefs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/agencies/briefs/:id
 * Get a single brief detail.
 */
router.get("/briefs/:id", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const brief = await prisma.brief.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: {
          select: { businessName: true, neighborhood: true, city: true, vibe: true },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    res.json({ brief });
  } catch (err) {
    next(err);
  }
});

// ─── APPLY ──────────────────────────────────────────────────────

/**
 * POST /api/agencies/briefs/:id/apply
 * Apply to a brief on behalf of a roster creator.
 */
router.post("/briefs/:id/apply", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const brief = await prisma.brief.findUnique({ where: { id: req.params.id } });
    if (!brief || brief.status !== "OPEN") {
      return res.status(400).json({ error: "Brief is not open for applications" });
    }

    const { creatorId, pitch, compensationAsk, availabilityConfirmed } = req.body;

    const creator = await prisma.agencyCreator.findFirst({
      where: { id: creatorId, agencyProfileId: req.agencyProfile.id },
    });
    if (!creator) {
      return res.status(404).json({ error: "Creator not found in your roster" });
    }

    // Check for duplicate application from this creator to this brief
    const existing = await prisma.application.findFirst({
      where: {
        briefId: brief.id,
        agencyCreatorId: creator.id,
      },
    });
    if (existing) {
      return res.status(409).json({ error: "This creator has already applied to this brief" });
    }

    const application = await prisma.application.create({
      data: {
        briefId: brief.id,
        agencyProfileId: req.agencyProfile.id,
        agencyCreatorId: creator.id,
        applicantType: "AGENCY",
        agencyName: req.agencyProfile.agencyName,
        creatorName: creator.name,
        creatorHandle: creator.handle,
        creatorPlatform: creator.platform,
        followerCount: creator.followerCount,
        engagementRate: creator.engagementRate,
        topPostUrls: creator.topPostUrls || [],
        portfolioUrls: creator.portfolioUrls || [],
        contentStyleTags: creator.contentStyleTags || [],
        pitch,
        compensationAsk: compensationAsk || null,
        availabilityConfirmed: availabilityConfirmed ?? true,
        contactEmail: creator.contactEmail || req.agencyProfile.contactEmail,
      },
    });

    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
});

// ─── APPLICATIONS ───────────────────────────────────────────────

/**
 * GET /api/agencies/applications
 * List all applications submitted by this agency.
 */
router.get("/applications", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { agencyProfileId: req.agencyProfile.id },
      include: {
        brief: {
          select: { id: true, title: true, status: true, brandProfile: { select: { businessName: true } } },
        },
        agencyCreator: { select: { name: true, handle: true, platform: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

// ─── STATS ──────────────────────────────────────────────────────

/**
 * GET /api/agencies/stats
 * Agency dashboard stats.
 */
router.get("/stats", requireAgencyWithProfile, async (req, res, next) => {
  try {
    const [rosterCount, totalApplications, pendingApplications, selectedApplications] = await Promise.all([
      prisma.agencyCreator.count({ where: { agencyProfileId: req.agencyProfile.id } }),
      prisma.application.count({ where: { agencyProfileId: req.agencyProfile.id } }),
      prisma.application.count({ where: { agencyProfileId: req.agencyProfile.id, status: "PENDING" } }),
      prisma.application.count({ where: { agencyProfileId: req.agencyProfile.id, status: "SELECTED" } }),
    ]);

    res.json({
      rosterCount,
      totalApplications,
      pendingApplications,
      selectedApplications,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
