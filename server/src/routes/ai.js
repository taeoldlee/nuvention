const express = require("express");
const router = express.Router();
const { analyzeBrandFromUrl, analyzeCreatorPortfolio } = require("../services/ai");

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

module.exports = router;
