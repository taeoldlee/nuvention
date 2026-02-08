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

    const {
      contentType,
      description,
      brief,
      briefText,
      stylePreferences,
      budgetRange,
      contentGoal,
      subject,
      creativeDirection,
      deliverables,
      timeline,
      usageRights,
      briefTemplate,
      compensationType,
      compensationDetails,
    } = req.body;

    if (!contentType) {
      return res.status(400).json({ error: "contentType is required" });
    }

    // Create the content request
    const contentRequest = await prisma.contentRequest.create({
      data: {
        brandProfileId: brandProfile.id,
        contentType,
        description: description || briefText || brief || null,
        stylePreferences: stylePreferences || null,
        budgetRange: budgetRange || null,
        contentGoal: contentGoal || null,
        subject: subject || null,
        creativeDirection: creativeDirection || null,
        deliverables: deliverables || null,
        timeline: timeline || null,
        usageRights: usageRights || null,
        briefTemplate: briefTemplate || null,
        compensationType: compensationType || "FLAT_FEE",
        compensationDetails: compensationDetails || null,
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
        projects: {
          include: {
            brandProfile: {
              select: { id: true, neighborhood: true },
            },
          },
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

    res.status(201).json({ request: anonymizeRequest(result) });
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
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests: requests.map(anonymizeRequest) });
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

    res.json({ request: anonymizeRequest(request) });
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
    const usageRightsDoc = generateUsageRightsDoc({
      businessName: match.contentRequest?.brandProfile?.businessName,
      contentType: match.contentRequest?.contentType,
      usageRights: match.usageRights,
      timeline: match.timeline,
    });

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
        usageRightsDoc,
        compensationType: match.contentRequest.compensationType || "FLAT_FEE",
        compensationDetails: match.contentRequest.compensationDetails || null,
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
    const transaction = match.price > 0
      ? await createCharge(project.id, match.price)
      : null;

    res.status(201).json({ project, transaction });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

function generateUsageRightsDoc({ businessName, contentType, usageRights, timeline }) {
  const brand = businessName || "Brand";
  const rights = usageRights || "Organic social + in-store, 12 months";
  const timing = timeline || "Standard timeline";
  return [
    `Usage Rights Agreement`,
    `Brand: ${brand}`,
    `Content Type: ${contentType || "UGC content"}`,
    `Rights: ${rights}`,
    `Timeline: ${timing}`,
    `This agreement grants the brand non-exclusive usage rights as specified above.`,
  ].join("\n");
}

function anonymizeRequest(request) {
  if (!request) return request;
  const matches = Array.isArray(request.matches) ? request.matches : [];
  const anonymizedMatches = matches.map((match, idx) => {
    const alias = `Creator ${String.fromCharCode(65 + idx)}`;
    const portfolioSamples = (match.creatorProfile?.portfolioItems || []).map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      verified: !!p.verified,
    }));

    return {
      id: match.id,
      creatorAlias: alias,
      contentType: request.contentType,
      contentPreview: match.contentPreview,
      deliverables: match.deliverables,
      price: match.price,
      timeline: match.timeline,
      usageRights: match.usageRights,
      style: match.style,
      matchRationale: match.matchRationale,
      matchSignals: match.matchSignals,
      portfolioSamples,
      compensationType: request.compensationType,
      compensationDetails: request.compensationDetails,
    };
  });

  return {
    ...request,
    matches: anonymizedMatches,
  };
}
