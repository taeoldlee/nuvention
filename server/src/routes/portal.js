const express = require("express");
const router = express.Router();
const prisma = require("../config/db");

// ─── PUBLIC PORTAL ROUTES (no auth required) ───

/**
 * GET /api/portal/briefs
 * List all OPEN briefs for the public portal.
 */
router.get("/briefs", async (req, res, next) => {
  try {
    const briefs = await prisma.brief.findMany({
      where: { status: "OPEN" },
      include: {
        brandProfile: {
          select: {
            businessName: true,
            neighborhood: true,
            city: true,
            profilePhotoUrl: true,
            vibe: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ briefs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/portal/briefs/:id
 * Get a single brief's detail for the public portal.
 */
router.get("/briefs/:id", async (req, res, next) => {
  try {
    const brief = await prisma.brief.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: {
          select: {
            businessName: true,
            neighborhood: true,
            city: true,
            profilePhotoUrl: true,
            vibe: true,
          },
        },
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

/**
 * POST /api/portal/briefs/:id/apply
 * Submit an application to a brief (public, no auth).
 * Body: all Application fields per the schema.
 */
router.post("/briefs/:id/apply", async (req, res, next) => {
  try {
    const brief = await prisma.brief.findUnique({
      where: { id: req.params.id },
    });

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (brief.status !== "OPEN") {
      return res.status(400).json({ error: "This brief is no longer accepting applications" });
    }

    const {
      applicantType,
      agencyName,
      creatorName,
      creatorHandle,
      creatorPlatform,
      followerCount,
      engagementRate,
      audienceDemographics,
      topPostUrls,
      portfolioUrls,
      contentStyleTags,
      pitch,
      compensationAsk,
      availabilityConfirmed,
      contactEmail,
    } = req.body;

    // Validate required fields
    const missing = [];
    if (!creatorName) missing.push("creatorName");
    if (!creatorHandle) missing.push("creatorHandle");
    if (!creatorPlatform) missing.push("creatorPlatform");
    if (!pitch) missing.push("pitch");
    if (!contactEmail) missing.push("contactEmail");
    if (availabilityConfirmed === undefined || availabilityConfirmed === null) {
      missing.push("availabilityConfirmed");
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Validate availabilityConfirmed is true
    if (!availabilityConfirmed) {
      return res.status(400).json({
        error: "You must confirm your availability to apply",
      });
    }

    // Validate creatorPlatform enum
    const validPlatforms = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "REDNOTE", "OTHER"];
    if (!validPlatforms.includes(creatorPlatform)) {
      return res.status(400).json({
        error: `Invalid creatorPlatform. Must be one of: ${validPlatforms.join(", ")}`,
      });
    }

    // Validate applicantType enum if provided
    const validApplicantTypes = ["INDIVIDUAL", "AGENCY"];
    if (applicantType && !validApplicantTypes.includes(applicantType)) {
      return res.status(400).json({
        error: `Invalid applicantType. Must be one of: ${validApplicantTypes.join(", ")}`,
      });
    }

    const application = await prisma.application.create({
      data: {
        briefId: brief.id,
        applicantType: applicantType || "INDIVIDUAL",
        agencyName: agencyName || null,
        creatorName,
        creatorHandle,
        creatorPlatform,
        followerCount: followerCount ? parseInt(followerCount, 10) : null,
        engagementRate: engagementRate ? parseFloat(engagementRate) : null,
        audienceDemographics: audienceDemographics || null,
        topPostUrls: topPostUrls || null,
        portfolioUrls: portfolioUrls || null,
        contentStyleTags: contentStyleTags || null,
        pitch,
        compensationAsk: compensationAsk || null,
        availabilityConfirmed: true,
        contactEmail,
        status: "PENDING",
      },
    });

    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/portal/applications/:token
 * Look up application status by statusToken (public, no auth).
 */
router.get("/applications/:token", async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { statusToken: req.params.token },
      include: {
        brief: {
          select: {
            id: true,
            title: true,
            campaignGoal: true,
            contentTypes: true,
            compensationType: true,
            compensationAmount: true,
            deadline: true,
            status: true,
            brandProfile: {
              select: {
                businessName: true,
                neighborhood: true,
                city: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            creatorAccessToken: true,
            status: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Only expose project link (with creatorAccessToken) when selected
    const project =
      application.status === "SELECTED" && application.project
        ? application.project
        : null;

    res.json({
      application: {
        id: application.id,
        status: application.status,
        creatorName: application.creatorName,
        creatorHandle: application.creatorHandle,
        createdAt: application.createdAt,
        brief: application.brief,
        project,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
