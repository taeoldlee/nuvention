const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { uploadMultiple, getFileUrl, placeholderUrl } = require("../config/s3");

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/creators/profile
 * Get current creator's profile with portfolio.
 */
router.get("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can access creator profiles" });
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        portfolioItems: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Creator profile not found. Complete onboarding first." });
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/creators/profile
 * Create creator profile.
 */
router.post("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can create creator profiles" });
    }

    const existing = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res.status(409).json({ error: "Creator profile already exists. Use PUT to update." });
    }

    const {
      displayName,
      bio,
      instagramHandle,
      tiktokHandle,
      contentStyles,
      strengths,
      neighborhoods,
      dreamBrands,
      vibeTags,
      profilePhotoUrl,
    } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: "displayName is required" });
    }

    const profile = await prisma.creatorProfile.create({
      data: {
        userId: req.user.id,
        displayName,
        bio: bio || null,
        instagramHandle: instagramHandle || null,
        tiktokHandle: tiktokHandle || null,
        contentStyles: contentStyles || [],
        strengths: strengths || [],
        neighborhoods: neighborhoods || [],
        dreamBrands: dreamBrands || null,
        vibeTags: vibeTags || null,
        profilePhotoUrl: profilePhotoUrl || null,
      },
      include: {
        portfolioItems: true,
      },
    });

    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/creators/profile
 * Update creator profile.
 */
router.put("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can update creator profiles" });
    }

    const existing = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Creator profile not found. Create one first." });
    }

    const {
      displayName,
      bio,
      instagramHandle,
      tiktokHandle,
      contentStyles,
      strengths,
      neighborhoods,
      dreamBrands,
      vibeTags,
      profilePhotoUrl,
    } = req.body;

    const profile = await prisma.creatorProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(instagramHandle !== undefined && { instagramHandle }),
        ...(tiktokHandle !== undefined && { tiktokHandle }),
        ...(contentStyles !== undefined && { contentStyles }),
        ...(strengths !== undefined && { strengths }),
        ...(neighborhoods !== undefined && { neighborhoods }),
        ...(dreamBrands !== undefined && { dreamBrands }),
        ...(vibeTags !== undefined && { vibeTags }),
        ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
      },
      include: {
        portfolioItems: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/creators/portfolio
 * Upload portfolio images (multipart form, up to 6 images).
 */
router.post("/portfolio", (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (req.user.role !== "CREATOR") {
        return res.status(403).json({ error: "Only creators can upload portfolio items" });
      }

      const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!creatorProfile) {
        return res.status(404).json({ error: "Creator profile not found. Complete onboarding first." });
      }

      const files = req.files || [];
      if (files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      // Parse captions and content types from body (optional)
      const captions = req.body.captions ? JSON.parse(req.body.captions) : [];
      const contentTypes = req.body.contentTypes ? JSON.parse(req.body.contentTypes) : [];

      const portfolioItems = [];
      for (let i = 0; i < files.length; i++) {
        const imageUrl = getFileUrl(files[i]);
        const item = await prisma.portfolioItem.create({
          data: {
            creatorProfileId: creatorProfile.id,
            imageUrl,
            caption: captions[i] || null,
            contentType: contentTypes[i] || null,
            verified: true,
          },
        });
        portfolioItems.push(item);
      }

      res.status(201).json({ portfolioItems });
    } catch (innerErr) {
      next(innerErr);
    }
  });
});

/**
 * GET /api/creators/portfolio
 * Get creator's portfolio items.
 */
router.get("/portfolio", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can access their portfolio" });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile) {
      return res.status(404).json({ error: "Creator profile not found." });
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: { creatorProfileId: creatorProfile.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ portfolioItems });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
