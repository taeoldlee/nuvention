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


module.exports = router;
