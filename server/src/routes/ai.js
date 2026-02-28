const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const { generateBriefSuggestions, rankApplication, normalizeGoalText } = require("../services/ai");

/**
 * POST /api/ai/suggest-brief
 * AI suggestions during brief creation.
 * Body: { campaignGoal, contentTypes }
 */
router.post("/suggest-brief", requireAuth, requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { campaignGoal, contentTypes } = req.body;

    if (!campaignGoal) {
      return res.status(400).json({ error: "campaignGoal is required" });
    }

    const suggestions = await generateBriefSuggestions(req.brandProfile, campaignGoal, contentTypes);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/rank-applications
 * AI ranking of applications against a brief.
 * Body: { briefId }
 */
router.post("/rank-applications", requireAuth, requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { briefId } = req.body;

    if (!briefId) {
      return res.status(400).json({ error: "briefId is required" });
    }

    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      include: { brandProfile: true },
    });

    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }

    if (brief.brandProfileId !== req.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const applications = await prisma.application.findMany({
      where: { briefId, status: "PENDING" },
    });

    const ranked = [];
    for (const app of applications) {
      const { score, rationale } = await rankApplication(app, brief, brief.brandProfile);

      await prisma.application.update({
        where: { id: app.id },
        data: {
          aiMatchScore: score,
          aiMatchRationale: rationale,
        },
      });

      ranked.push({ id: app.id, score, rationale });
    }

    ranked.sort((a, b) => b.score - a.score);
    res.json({ ranked });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/normalize-goal
 * Normalize free-text goal to closest predefined goal.
 * Body: { customText }
 */
router.post("/normalize-goal", requireAuth, async (req, res, next) => {
  try {
    const { customText } = req.body;

    if (!customText || !customText.trim()) {
      return res.status(400).json({ error: "customText is required" });
    }

    const normalized = await normalizeGoalText(customText.trim());
    res.json({ normalized });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
