const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { closeExpiredBriefs } = require("../services/briefExpiry");

// ─── PUBLIC PORTAL ROUTES (no auth required) ───

/**
 * GET /api/portal/briefs
 * List all OPEN briefs for the public portal.
 */
router.get("/briefs", async (req, res, next) => {
  try {
    // Auto-close any OPEN briefs whose deadline has passed
    await closeExpiredBriefs();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, compensationType, contentType, campaignGoal, sort } = req.query;

    const where = {
      status: "OPEN",
      // Exclude briefs with a past deadline (belt-and-suspenders with auto-close above)
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    };

    // Search filter: title OR brand businessName (case-insensitive)
    if (search && search.trim()) {
      where.AND = [
        {
          OR: [
            { title: { contains: search.trim(), mode: "insensitive" } },
            { brandProfile: { businessName: { contains: search.trim(), mode: "insensitive" } } },
          ],
        },
      ];
    }

    // Compensation type filter
    if (compensationType) {
      where.compensationType = compensationType;
    }

    // Content type filter (JSON array contains)
    if (contentType) {
      where.contentTypes = { path: [], array_contains: [contentType] };
    }

    // Campaign goal filter
    if (campaignGoal) {
      where.campaignGoal = campaignGoal;
    }

    // Sort
    let orderBy;
    switch (sort) {
      case "deadline":
        orderBy = [{ deadline: { sort: "asc", nulls: "last" } }];
        break;
      case "compensation":
        orderBy = [{ compensationAmount: { sort: "desc", nulls: "last" } }];
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const include = {
      brandProfile: {
        select: {
          businessName: true,
          neighborhood: true,
          city: true,
          profilePhotoUrl: true,
          vibe: true,
        },
      },
    };

    const [briefs, total] = await Promise.all([
      prisma.brief.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.brief.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ briefs, total, page, totalPages });
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
    // Auto-close any OPEN briefs whose deadline has passed
    await closeExpiredBriefs();

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

    // Reject applications to briefs whose deadline has passed
    if (brief.deadline && new Date(brief.deadline) < new Date()) {
      // Auto-close the brief since it's past deadline
      await closeExpiredBriefs();
      return res.status(400).json({ error: "This brief's deadline has passed and it is no longer accepting applications" });
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
