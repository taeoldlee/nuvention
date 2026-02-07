const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/briefs
 * Get incoming briefs for the current creator.
 * Returns matches where this creator was selected or presented.
 */
router.get("/", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can view briefs" });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile) {
      return res.json({ briefs: [] });
    }

    const matches = await prisma.match.findMany({
      where: {
        creatorProfileId: creatorProfile.id,
        status: { in: ["PRESENTED", "SELECTED"] },
      },
      include: {
        contentRequest: {
          include: {
            brandProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
        },
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform into brief-friendly format
    const briefs = matches.map((match) => ({
      matchId: match.id,
      status: match.status,
      matchScore: match.matchScore,
      matchRationale: match.matchRationale,
      contentPreview: match.contentPreview,
      deliverables: match.deliverables,
      price: match.price,
      timeline: match.timeline,
      usageRights: match.usageRights,
      style: match.style,
      contentRequest: {
        id: match.contentRequest.id,
        contentType: match.contentRequest.contentType,
        description: match.contentRequest.description,
      },
      brand: {
        id: match.contentRequest.brandProfile.id,
        businessName: match.contentRequest.brandProfile.businessName,
        neighborhood: match.contentRequest.brandProfile.neighborhood,
        vibe: match.contentRequest.brandProfile.vibe,
        profilePhotoUrl: match.contentRequest.brandProfile.profilePhotoUrl,
        user: match.contentRequest.brandProfile.user,
      },
      hasProject: !!match.project,
      projectId: match.project?.id || null,
      createdAt: match.createdAt,
    }));

    res.json({ briefs });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/briefs/:matchId/accept
 * Creator accepts a brief (match).
 */
router.post("/:matchId/accept", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can accept briefs" });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile) {
      return res.status(404).json({ error: "Creator profile not found" });
    }

    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId },
      include: {
        contentRequest: true,
        project: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (match.creatorProfileId !== creatorProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (match.status !== "SELECTED") {
      return res.status(400).json({
        error: "Can only accept briefs that have been selected by the operator",
      });
    }

    // If a project already exists, just return it
    if (match.project) {
      return res.json({ message: "Brief already accepted", project: match.project });
    }

    res.json({ message: "Brief accepted", match });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/briefs/:matchId/decline
 * Creator declines a brief (match).
 */
router.post("/:matchId/decline", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can decline briefs" });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile) {
      return res.status(404).json({ error: "Creator profile not found" });
    }

    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId },
    });

    if (!match) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (match.creatorProfileId !== creatorProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (match.status === "DECLINED") {
      return res.status(400).json({ error: "Brief has already been declined" });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: match.id },
      data: { status: "DECLINED" },
    });

    res.json({ message: "Brief declined", match: updatedMatch });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
