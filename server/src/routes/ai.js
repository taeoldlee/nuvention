const express = require("express");
const router = express.Router();
const { analyzeBrandFromUrl, analyzeCreatorPortfolio, generateRequestSuggestions } = require("../services/ai");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * POST /api/ai/analyze-brand
 * Analyze brand from submitted data using OpenAI.
 * Body: { url: "https://..." } or { businessName, neighborhood, vibe, etc. }
 */
router.post("/analyze-brand", async (req, res, next) => {
  try {
    const { url, businessName, neighborhood, vibe } = req.body;

    if (url) {
      // Analyze from URL
      const analysis = await analyzeBrandFromUrl(url);
      return res.json({ analysis });
    }

    // If no URL, return a vibe analysis based on submitted data
    if (!businessName) {
      return res.status(400).json({ error: "Either url or businessName is required" });
    }

    const vibeArray = Array.isArray(vibe) ? vibe : [];
    const analysis = {
      businessName,
      neighborhood: neighborhood || "Evanston",
      vibe: vibeArray,
      vibeAnalysis: {
        primaryVibe: vibeArray[0] || "Unique Local Spot",
        aestheticTags: vibeArray.flatMap((v) =>
          v
            .toLowerCase()
            .split(/[&,]+/)
            .map((s) => s.trim().replace(/\s+/g, "-"))
            .filter(Boolean)
        ),
        contentRecommendations: [
          "Signature interior shots during golden hour",
          "Close-up menu highlights",
          "Community moments",
          "Behind-the-scenes preparation",
        ],
        avoidTags: ["stock-photo-style", "overly-corporate", "generic"],
      },
    };

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/analyze-portfolio
 * Analyze creator portfolio images via OpenAI Vision.
 * Body: { imageUrls: ["https://...", ...] }
 */
router.post("/analyze-portfolio", async (req, res, next) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ error: "imageUrls array is required" });
    }

    const analysis = await analyzeCreatorPortfolio(imageUrls);
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/suggest-request
 * Generate content request suggestions based on the user's brand profile.
 */
router.post("/suggest-request", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const brand = await prisma.brandProfile.findFirst({
      where: { userId },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand profile not found. Complete onboarding first." });
    }

    const suggestions = await generateRequestSuggestions(brand);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
