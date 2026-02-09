const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { generateUsageRightsDoc } = require("../services/documents");
const { createCharge } = require("../services/payments");

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

    // Only show briefs that don't have a project yet (not yet accepted)
    const pendingMatches = matches.filter((match) => !match.project);

    // Transform into brief-friendly format
    const briefs = pendingMatches.map((match) => ({
      matchId: match.id,
      status: match.status,
      matchRationale: match.matchRationale,
      matchSignals: match.matchSignals,
      contentPreview: match.contentPreview,
      deliverables: match.deliverables,
      price: match.price,
      timeline: match.timeline,
      usageRights: match.usageRights,
      style: match.style,
      compensationType: match.contentRequest?.compensationType || "FLAT_FEE",
      compensationDetails: match.contentRequest?.compensationDetails || null,
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
        contentRequest: {
          include: {
            brandProfile: true,
          },
        },
        project: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (match.creatorProfileId !== creatorProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!["PRESENTED", "SELECTED"].includes(match.status)) {
      return res.status(400).json({
        error: "This brief has already been processed",
      });
    }

    // If a project already exists, just return it
    if (match.project) {
      return res.json({ message: "Brief already accepted", project: match.project });
    }

    // Update match status to SELECTED if it was PRESENTED
    if (match.status === "PRESENTED") {
      await prisma.match.update({
        where: { id: match.id },
        data: { status: "SELECTED" },
      });
    }

    // Update content request status
    await prisma.contentRequest.update({
      where: { id: match.contentRequestId },
      data: { status: "SELECTED" },
    });

    // Create the project
    const usageRightsDoc = generateUsageRightsDoc({
      businessName: match.contentRequest?.brandProfile?.businessName,
      contentType: match.contentRequest?.contentType,
      usageRights: match.usageRights,
      timeline: match.timeline,
    });

    const project = await prisma.project.create({
      data: {
        matchId: match.id,
        brandProfileId: match.contentRequest.brandProfileId,
        creatorProfileId: creatorProfile.id,
        status: "BRIEF_SENT",
        deliverables: match.deliverables,
        price: match.price,
        timeline: match.timeline,
        usageRights: match.usageRights,
        briefText: `Content request for ${match.contentRequest.contentType}. ${match.contentPreview || ""}`.trim(),
        usageRightsDoc,
        compensationType: match.contentRequest.compensationType || "FLAT_FEE",
        compensationDetails: match.contentRequest.compensationDetails || null,
      },
      include: {
        brandProfile: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    // Create transaction if there's a price
    if (match.price > 0) {
      await createCharge(project.id, match.price);
    }

    res.json({
      message: "Brief accepted",
      project,
      brandName: project.brandProfile?.businessName || project.brandProfile?.user?.name,
      projectId: project.id,
    });
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
