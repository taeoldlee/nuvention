const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");

// All routes require authentication + operator with brand
router.use(requireAuth);
router.use(requireOperatorWithBrand);

/**
 * GET /api/creators
 * List/search/filter creators with pagination.
 */
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const {
      search,
      platform,
      neighborhood,
      style,
      minFollowers,
      maxFollowers,
      minEngagement,
      maxEngagement,
      sort,
    } = req.query;

    const where = { isActive: true };

    // Search: name or handle (case-insensitive OR)
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { handle: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Platform filter
    if (platform) {
      where.platform = platform;
    }

    // Neighborhood filter (JSON array contains)
    if (neighborhood) {
      where.neighborhoods = { path: [], array_contains: [neighborhood] };
    }

    // Content style tag filter (JSON array contains)
    if (style) {
      where.contentStyleTags = { path: [], array_contains: [style] };
    }

    // Follower range filters
    if (minFollowers) {
      where.followerCount = {
        ...where.followerCount,
        gte: parseInt(minFollowers, 10),
      };
    }
    if (maxFollowers) {
      where.followerCount = {
        ...where.followerCount,
        lte: parseInt(maxFollowers, 10),
      };
    }

    // Engagement range filters
    if (minEngagement) {
      where.engagementRate = {
        ...where.engagementRate,
        gte: parseFloat(minEngagement),
      };
    }
    if (maxEngagement) {
      where.engagementRate = {
        ...where.engagementRate,
        lte: parseFloat(maxEngagement),
      };
    }

    // Sort
    let orderBy;
    switch (sort) {
      case "followers":
        orderBy = { followerCount: { sort: "desc", nulls: "last" } };
        break;
      case "engagement":
        orderBy = { engagementRate: { sort: "desc", nulls: "last" } };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.creator.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ creators, total, page, totalPages });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/creators/:id
 * Get a single creator's full profile.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.id },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    res.json({ creator });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
