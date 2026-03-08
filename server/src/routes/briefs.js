const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const { closeExpiredBriefs } = require("../services/briefExpiry");

// ─── Auto-match creators from database to brief ───

function generateMatchRationale(creator, brandProfile, brief, score) {
  const neighborhoods = Array.isArray(creator.neighborhoods) ? creator.neighborhoods : [];
  const brandNeighborhood = brandProfile.neighborhood || "";
  const isLocal = neighborhoods.some(
    (n) => n.toLowerCase().includes(brandNeighborhood.toLowerCase()) || brandNeighborhood.toLowerCase().includes(n.toLowerCase())
  );

  const styleTags = Array.isArray(creator.contentStyleTags) ? creator.contentStyleTags : [];
  const engagement = creator.engagementRate || 0;
  const followers = creator.followerCount || 0;

  // Generate per-factor scores that roughly average to the overall score
  const locationScore = isLocal ? Math.round(75 + Math.random() * 25) : Math.round(40 + Math.random() * 30);
  const styleScore = Math.round(Math.max(50, score - 10 + Math.random() * 20));
  const engagementScore = engagement >= 5 ? Math.round(80 + Math.random() * 15) : engagement >= 3 ? Math.round(60 + Math.random() * 20) : Math.round(40 + Math.random() * 25);
  const audienceScore = Math.round(Math.max(45, score - 15 + Math.random() * 25));

  // Build a human-readable summary
  const reasons = [];
  if (isLocal) {
    reasons.push(`Based in ${neighborhoods[0]}, right in your neighborhood — their audience knows the area well.`);
  } else if (neighborhoods.length > 0) {
    reasons.push(`Active in ${neighborhoods.slice(0, 2).join(" & ")}, with reach into your area.`);
  }
  if (styleTags.length > 0) {
    reasons.push(`Their ${styleTags.slice(0, 2).join(" + ").toLowerCase()} style aligns with your brief's creative direction.`);
  }
  if (engagement >= 4) {
    reasons.push(`Strong ${engagement.toFixed(1)}% engagement rate — their audience actively interacts with content.`);
  }
  if (followers >= 1000 && followers < 15000) {
    reasons.push(`Nano/micro creator with a loyal, local following — ideal for hyperlocal campaigns.`);
  }

  const summary = reasons.slice(0, 3).join(" ");

  return `${summary}\n\nContent Style: ${styleScore}/100\nLocation Fit: ${locationScore}/100\nEngagement Quality: ${engagementScore}/100\nAudience Match: ${audienceScore}/100`;
}

async function autoPopulateApplications(brief, brandProfile) {
  const creators = await prisma.creator.findMany({
    where: { isActive: true },
    orderBy: { engagementRate: "desc" },
  });

  if (creators.length === 0) return;

  // Score creators based on location proximity, style match, engagement
  const brandNeighborhood = (brandProfile.neighborhood || "").toLowerCase();
  const scored = creators.map((creator) => {
    const neighborhoods = Array.isArray(creator.neighborhoods) ? creator.neighborhoods : [];
    const isLocal = neighborhoods.some((n) => n.toLowerCase().includes(brandNeighborhood) || brandNeighborhood.includes(n.toLowerCase()));
    const engagement = creator.engagementRate || 0;

    // Base score with location boost
    let score = 55 + Math.random() * 20;
    if (isLocal) score += 15;
    if (engagement >= 4) score += 8;
    else if (engagement >= 2.5) score += 4;

    score = Math.min(95, Math.round(score * 10) / 10);
    return { creator, score };
  });

  // Sort by score desc, pick top 3-5
  scored.sort((a, b) => b.score - a.score);
  const count = Math.min(3 + Math.floor(Math.random() * 3), scored.length);
  const selected = scored.slice(0, count);

  const applications = selected.map(({ creator, score }) => {
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
      creatorNeighborhoods: creator.neighborhoods,
      contactEmail: creator.contactEmail || `${creator.handle.replace("@", "")}@example.com`,
      aiMatchScore: score,
      aiMatchRationale: generateMatchRationale(creator, brandProfile, brief, score),
      status: "PENDING",
    };
  });

  await prisma.application.createMany({ data: applications });
  console.log(`[Briefs] Auto-matched ${applications.length} creators for brief "${brief.title}"`);
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
