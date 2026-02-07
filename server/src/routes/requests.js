const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { generateMatches } = require("../services/matching");
const { createCharge } = require("../services/payments");

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/requests
 * Create a content request and trigger the matching algorithm.
 * Returns the request with top 3 matches.
 */
router.post("/", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can create content requests" });
    }

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile) {
      return res.status(404).json({ error: "Brand profile not found. Complete onboarding first." });
    }

    const { contentType, description, stylePreferences, budgetRange } = req.body;

    if (!contentType) {
      return res.status(400).json({ error: "contentType is required" });
    }

    // Create the content request
    const contentRequest = await prisma.contentRequest.create({
      data: {
        brandProfileId: brandProfile.id,
        contentType,
        description: description || null,
        stylePreferences: stylePreferences || null,
        budgetRange: budgetRange || null,
        status: "MATCHING",
      },
    });

    // Fetch all creator profiles for matching
    const allCreators = await prisma.creatorProfile.findMany({
      include: {
        portfolioItems: true,
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Generate top 3 matches
    const matchResults = generateMatches(brandProfile, contentRequest, allCreators);

    // Save matches to DB
    const createdMatches = [];
    for (const match of matchResults) {
      const created = await prisma.match.create({
        data: {
          contentRequestId: contentRequest.id,
          creatorProfileId: match.creatorProfileId,
          matchScore: match.matchScore,
          matchRationale: match.matchRationale,
          contentPreview: match.contentPreview,
          deliverables: match.deliverables,
          price: match.price,
          timeline: match.timeline,
          usageRights: match.usageRights,
          style: match.style,
          status: "PRESENTED",
        },
        include: {
          creatorProfile: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
              portfolioItems: {
                take: 3,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });
      createdMatches.push(created);
    }

    // Update request status
    await prisma.contentRequest.update({
      where: { id: contentRequest.id },
      data: { status: "PRESENTED" },
    });

    const result = await prisma.contentRequest.findUnique({
      where: { id: contentRequest.id },
      include: {
        matches: {
          include: {
            creatorProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
                portfolioItems: {
                  take: 3,
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
          orderBy: { matchScore: "desc" },
        },
      },
    });

    res.status(201).json({ request: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/requests
 * List operator's content requests.
 */
router.get("/", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can view content requests" });
    }

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile) {
      return res.status(404).json({ error: "Brand profile not found." });
    }

    const requests = await prisma.contentRequest.findMany({
      where: { brandProfileId: brandProfile.id },
      include: {
        matches: {
          include: {
            creatorProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { matchScore: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/requests/:id
 * Get a single content request with matches.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const request = await prisma.contentRequest.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: true,
        matches: {
          include: {
            creatorProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
                portfolioItems: {
                  take: 4,
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
          orderBy: { matchScore: "desc" },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Content request not found" });
    }

    // Verify the user owns this request
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile || request.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ request });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/requests/:id/select/:matchId
 * Operator selects a match. Creates a project and a transaction.
 */
router.post("/:id/select/:matchId", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can select matches" });
    }

    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId },
      include: {
        contentRequest: {
          include: { brandProfile: true },
        },
        creatorProfile: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.contentRequest.id !== req.params.id) {
      return res.status(400).json({ error: "Match does not belong to this request" });
    }

    // Verify ownership
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile || match.contentRequest.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (match.status !== "PRESENTED") {
      return res.status(400).json({ error: "Match has already been processed" });
    }

    // Mark the selected match
    await prisma.match.update({
      where: { id: match.id },
      data: { status: "SELECTED" },
    });

    // Decline other matches for this request
    await prisma.match.updateMany({
      where: {
        contentRequestId: match.contentRequestId,
        id: { not: match.id },
        status: "PRESENTED",
      },
      data: { status: "DECLINED" },
    });

    // Update request status
    await prisma.contentRequest.update({
      where: { id: match.contentRequestId },
      data: { status: "SELECTED" },
    });

    // Create the project
    const project = await prisma.project.create({
      data: {
        matchId: match.id,
        brandProfileId: brandProfile.id,
        creatorProfileId: match.creatorProfileId,
        status: "BRIEF_SENT",
        deliverables: match.deliverables,
        price: match.price,
        timeline: match.timeline,
        usageRights: match.usageRights,
        briefText: `Content request for ${match.contentRequest.contentType}. ${match.contentPreview}`,
      },
      include: {
        match: {
          include: {
            creatorProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
        },
        brandProfile: true,
      },
    });

    // Create transaction (charge)
    const transaction = await createCharge(project.id, match.price);

    res.status(201).json({ project, transaction });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
