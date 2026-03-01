const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const { closeExpiredBriefs } = require("../services/briefExpiry");

// ─── Auto-populate applications from seeded creators ───

const PITCH_TEMPLATES = [
  "I'd love to create content for {brand}! My style is a perfect match for this brief — I specialize in {style} content and my audience is exactly who you're trying to reach.",
  "This brief really resonates with me. I've been following {brand} and have some great ideas for {style} content that would connect with my followers.",
  "I'm excited about this opportunity! I create {style} content regularly and think I can deliver something really special for {brand}.",
  "Hey! I think my {style} content style would be a great fit here. I know the {neighborhood} area well and can create authentic, engaging content for {brand}.",
  "Love this brief! My audience engages heavily with {style} content. I'd bring a fresh perspective that highlights what makes {brand} unique.",
];

async function autoPopulateApplications(brief, brandProfile) {
  const creators = await prisma.creator.findMany({
    where: { isActive: true },
    orderBy: { engagementRate: "desc" },
  });

  if (creators.length === 0) return;

  // Pick 3-5 random creators
  const shuffled = creators.sort(() => Math.random() - 0.5);
  const count = Math.min(3 + Math.floor(Math.random() * 3), shuffled.length);
  const selected = shuffled.slice(0, count);

  const applications = selected.map((creator, i) => {
    const styleTags = Array.isArray(creator.contentStyleTags) ? creator.contentStyleTags : [];
    const style = styleTags[0] || "food & lifestyle";
    const neighborhood = brandProfile.neighborhood || "the area";
    const brand = brandProfile.businessName || "your brand";
    const pitch = PITCH_TEMPLATES[i % PITCH_TEMPLATES.length]
      .replace("{brand}", brand)
      .replace("{style}", style.toLowerCase())
      .replace("{neighborhood}", neighborhood);

    // Generate a realistic match score (60-95)
    const baseScore = 60 + Math.random() * 35;
    const score = Math.round(baseScore * 10) / 10;

    return {
      briefId: brief.id,
      creatorName: creator.name,
      creatorHandle: creator.handle.replace("@", ""),
      creatorPlatform: creator.platform,
      followerCount: creator.followerCount,
      engagementRate: creator.engagementRate,
      audienceDemographics: creator.audienceDemographics,
      contentStyleTags: creator.contentStyleTags,
      portfolioUrls: creator.portfolioUrls,
      topPostUrls: creator.topPostUrls,
      pitch,
      contactEmail: creator.contactEmail || `${creator.handle.replace("@", "")}@example.com`,
      aiMatchScore: score,
      aiMatchRationale: `Content Style: ${Math.round(50 + Math.random() * 50)}/100\nLocation Fit: ${Math.round(50 + Math.random() * 50)}/100\nEngagement Quality: ${Math.round(50 + Math.random() * 50)}/100\nAudience Match: ${Math.round(50 + Math.random() * 50)}/100`,
      status: "PENDING",
    };
  });

  await prisma.application.createMany({ data: applications });
  console.log(`[Briefs] Auto-populated ${applications.length} applications for brief "${brief.title}"`);
}

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/briefs
 * Create a new brief (operator only).
 */
router.post("/", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const {
      title,
      campaignGoal,
      contentTypes,
      numberOfDeliverables,
      creativeDirection,
      referenceImageUrls,
      dos,
      donts,
      deadline,
      compensationType,
      compensationAmount,
      compensationDetails,
      usageRights,
      locationRequirement,
      additionalNotes,
      revisionsIncluded,
      status,
      aiSuggestions,
    } = req.body;

    const brief = await prisma.brief.create({
      data: {
        brandProfileId: req.brandProfile.id,
        title,
        campaignGoal,
        contentTypes,
        numberOfDeliverables,
        creativeDirection,
        referenceImageUrls: referenceImageUrls || null,
        dos: dos || null,
        donts: donts || null,
        deadline: deadline ? new Date(deadline) : null,
        compensationType,
        compensationAmount: compensationAmount || null,
        compensationDetails: compensationDetails || null,
        usageRights,
        locationRequirement,
        additionalNotes: additionalNotes || null,
        revisionsIncluded: revisionsIncluded ?? 1,
        status: status || "DRAFT",
        aiSuggestions: aiSuggestions || null,
      },
    });

    // Auto-populate applications from seeded creators when publishing
    if (status === "OPEN") {
      try {
        await autoPopulateApplications(brief, req.brandProfile);
      } catch (err) {
        console.error("[Briefs] Auto-populate applications failed:", err.message);
        // Non-blocking — brief is still created
      }
    }

    res.status(201).json({ brief });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/briefs
 * List the current brand's briefs. Optional ?status= filter.
 */
router.get("/", requireOperatorWithBrand, async (req, res, next) => {
  try {
    // Auto-close any OPEN briefs whose deadline has passed
    await closeExpiredBriefs();

    const where = { brandProfileId: req.brandProfile.id };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const briefs = await prisma.brief.findMany({
      where,
      include: {
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
 * GET /api/briefs/:id
 * Get brief detail. If the authenticated user is the owning operator,
 * include applications with AI ranking (sorted by aiMatchScore desc).
 */
router.get("/:id", async (req, res, next) => {
  try {
    const brief = await prisma.brief.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: true,
        _count: { select: { applications: true } },
      },
    });

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    // If the authenticated user is the owning operator, include ranked applications
    const isOwner =
      req.user.role === "OPERATOR" &&
      req.user.brandProfile &&
      brief.brandProfileId === req.user.brandProfile.id;

    if (isOwner) {
      const applications = await prisma.application.findMany({
        where: { briefId: brief.id },
        orderBy: { aiMatchScore: "desc" },
      });
      brief.applications = applications;
    }

    res.json({ brief });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/briefs/:id/applications
 * List applications for a brief, AI-ranked.
 */
router.get("/:id/applications", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const brief = await prisma.brief.findUnique({
      where: { id: req.params.id },
    });

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (brief.brandProfileId !== req.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const applications = await prisma.application.findMany({
      where: { briefId: brief.id },
      orderBy: { aiMatchScore: "desc" },
    });

    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/briefs/:id
 * Update a brief. Only allowed for DRAFT or OPEN status.
 */
router.put("/:id", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const existing = await prisma.brief.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (existing.brandProfileId !== req.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!["DRAFT", "OPEN"].includes(existing.status)) {
      return res
        .status(400)
        .json({ error: "Can only update briefs in DRAFT or OPEN status" });
    }

    const {
      title,
      campaignGoal,
      contentTypes,
      numberOfDeliverables,
      creativeDirection,
      referenceImageUrls,
      dos,
      donts,
      deadline,
      compensationType,
      compensationAmount,
      compensationDetails,
      usageRights,
      locationRequirement,
      additionalNotes,
      revisionsIncluded,
      status,
      aiSuggestions,
    } = req.body;

    const brief = await prisma.brief.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(campaignGoal !== undefined && { campaignGoal }),
        ...(contentTypes !== undefined && { contentTypes }),
        ...(numberOfDeliverables !== undefined && { numberOfDeliverables }),
        ...(creativeDirection !== undefined && { creativeDirection }),
        ...(referenceImageUrls !== undefined && { referenceImageUrls }),
        ...(dos !== undefined && { dos }),
        ...(donts !== undefined && { donts }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(compensationType !== undefined && { compensationType }),
        ...(compensationAmount !== undefined && { compensationAmount }),
        ...(compensationDetails !== undefined && { compensationDetails }),
        ...(usageRights !== undefined && { usageRights }),
        ...(locationRequirement !== undefined && { locationRequirement }),
        ...(additionalNotes !== undefined && { additionalNotes }),
        ...(revisionsIncluded !== undefined && { revisionsIncluded }),
        ...(status !== undefined && { status }),
        ...(aiSuggestions !== undefined && { aiSuggestions }),
      },
    });

    res.json({ brief });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/briefs/:id/close
 * Close a brief. Sets status to CLOSED and records closedAt timestamp.
 */
router.post("/:id/close", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const existing = await prisma.brief.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (existing.brandProfileId !== req.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const brief = await prisma.brief.update({
      where: { id: req.params.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    res.json({ brief });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/briefs/:id
 * Cancel (delete) a brief. Only allowed for DRAFT status.
 */
router.delete("/:id", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const existing = await prisma.brief.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (existing.brandProfileId !== req.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (existing.status !== "DRAFT") {
      return res
        .status(400)
        .json({ error: "Can only delete briefs in DRAFT status" });
    }

    await prisma.brief.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Brief deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
