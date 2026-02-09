const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const { createCharge } = require("../services/payments");
const { generateUsageRightsDoc } = require("../services/documents");
const { createRequestWithMatches } = require("../services/requests");

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/requests
 * Create a content request and trigger the matching algorithm.
 * Returns the request with top 3 matches.
 */
router.post("/", requireOperatorWithBrand, async (req, res, next) => {
  try {
    if (!req.body.contentType) {
      return res.status(400).json({ error: "contentType is required" });
    }

    const result = await createRequestWithMatches(req.brandProfile, req.body);
    res.status(201).json({ request: anonymizeRequest(result) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/requests
 * List operator's content requests.
 */
router.get("/", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const requests = await prisma.contentRequest.findMany({
      where: { brandProfileId: brandProfile.id },
      include: {
        matches: {
          include: {
            creatorProfile: {
              select: {
                portfolioItems: {
                  select: { id: true, imageUrl: true, verified: true },
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
router.get("/:id", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const request = await prisma.contentRequest.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: true,
        matches: {
          include: {
            creatorProfile: {
              select: {
                portfolioItems: {
                  select: { id: true, imageUrl: true, verified: true },
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

    if (request.brandProfileId !== brandProfile.id) {
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
router.post("/:id/select/:matchId", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

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

    if (match.contentRequest.brandProfileId !== brandProfile.id) {
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

function anonymizeRequest(request) {
  if (!request) return request;
  const matches = Array.isArray(request.matches) ? request.matches : [];
  const anonymizedMatches = matches.map((match) => {
    const suffix = (match.creatorProfileId || "").slice(0, 4).toUpperCase() || "XXXX";
    const alias = `Creator_${suffix}`;
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
      matchInsights: match.matchInsights,
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
