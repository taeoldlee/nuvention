const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const { closeExpiredBriefs } = require("../services/briefExpiry");

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
