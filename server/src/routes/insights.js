const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const openai = require("../config/openai");

router.use(requireAuth, requireOperatorWithBrand);

/**
 * GET /api/stats/insights
 * Returns aggregated campaign intelligence from CampaignData table.
 * Requires >= 3 records to unlock full analytics.
 */
router.get("/insights", async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const records = await prisma.campaignData.findMany({
      where: { brandProfileId: brandProfile.id },
      orderBy: { createdAt: "desc" },
    });

    if (records.length < 3) {
      return res.json({ unlocked: false, count: records.length });
    }

    const totalCampaigns = records.length;

    // ── Acceptance rate by offer type ──
    const offerTypeMap = {};
    for (const r of records) {
      const t = r.compensationType || "FREE_PRODUCT";
      if (!offerTypeMap[t]) offerTypeMap[t] = { accepted: 0, total: 0 };
      offerTypeMap[t].total++;
      if (r.wasContentApproved) offerTypeMap[t].accepted++;
    }

    const acceptanceByOfferType = {};
    let bestOfferType = null;
    let bestOfferRate = -1;
    for (const [type, data] of Object.entries(offerTypeMap)) {
      const rate = data.total > 0 ? Math.round((data.accepted / data.total) * 100) : 0;
      acceptanceByOfferType[type] = { ...data, rate };
      if (rate > bestOfferRate) { bestOfferRate = rate; bestOfferType = type; }
    }

    // ── Creator tier performance ──
    const tierMap = {};
    for (const r of records) {
      const tier = r.selectedCreatorTier || "NANO";
      if (!tierMap[tier]) tierMap[tier] = { accepted: 0, total: 0, responseTimes: [] };
      tierMap[tier].total++;
      if (r.wasContentApproved) tierMap[tier].accepted++;
      if (r.timeToFirstApplication) tierMap[tier].responseTimes.push(r.timeToFirstApplication);
    }

    const creatorTierPerformance = {};
    let bestTier = null;
    let bestTierRate = -1;
    for (const [tier, data] of Object.entries(tierMap)) {
      const rate = data.total > 0 ? Math.round((data.accepted / data.total) * 100) : 0;
      const avgResponseTime =
        data.responseTimes.length > 0
          ? Math.round(data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length)
          : null;
      creatorTierPerformance[tier] = { campaigns: data.total, avgAcceptanceRate: rate, avgResponseTime };
      if (rate > bestTierRate) { bestTierRate = rate; bestTier = tier; }
    }

    // ── Neighborhood benchmarks ──
    const neighborhoodMap = {};
    for (const r of records) {
      const n = r.neighborhood || "Unknown";
      if (!neighborhoodMap[n]) neighborhoodMap[n] = { campaigns: 0, accepted: 0, contentTypeCounts: {} };
      neighborhoodMap[n].campaigns++;
      if (r.wasContentApproved) neighborhoodMap[n].accepted++;
      const types = Array.isArray(r.contentTypes) ? r.contentTypes : [];
      for (const t of types) {
        neighborhoodMap[n].contentTypeCounts[t] = (neighborhoodMap[n].contentTypeCounts[t] || 0) + 1;
      }
    }

    const neighborhoodBenchmarks = Object.entries(neighborhoodMap).map(([neighborhood, data]) => {
      const acceptanceRate = data.campaigns > 0
        ? Math.round((data.accepted / data.campaigns) * 100)
        : 0;
      const topContentType =
        Object.entries(data.contentTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "REEL";
      return { neighborhood, campaigns: data.campaigns, acceptanceRate, topContentType };
    });

    // ── Overall avg acceptance rate ──
    const avgAcceptanceRate =
      records.length > 0
        ? Math.round((records.filter((r) => r.wasContentApproved).length / records.length) * 100)
        : 0;

    // ── Avg response time (minutes) ──
    const responseTimes = records
      .filter((r) => r.timeToFirstApplication)
      .map((r) => r.timeToFirstApplication);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null;

    // ── AI Recommendation ──
    const primaryNeighborhood =
      neighborhoodBenchmarks.sort((a, b) => b.campaigns - a.campaigns)[0]?.neighborhood ||
      brandProfile.neighborhood;
    const bestTopContent =
      neighborhoodBenchmarks[0]?.topContentType || "REEL";

    let aiRecommendation = null;

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Based on campaign data for a restaurant in ${primaryNeighborhood}, write a 2-sentence recommendation. Best offer type: ${bestOfferType} (${bestOfferRate}% acceptance). Best creator tier: ${bestTier} (${bestTierRate}% acceptance). Top content type: ${bestTopContent}. Start with "Based on ${records.length} campaigns in ${primaryNeighborhood}, we recommend:".`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        });
        aiRecommendation = completion.choices[0].message.content;
      } catch (e) {
        // fall through to computed recommendation
      }
    }

    if (!aiRecommendation) {
      const offerLabel = (bestOfferType || "free product").replace(/_/g, " ").toLowerCase();
      aiRecommendation = `Based on ${records.length} campaigns in ${primaryNeighborhood}, we recommend: ${offerLabel} compensation for a ${(bestTopContent || "REEL").toLowerCase()} campaign targeting ${(bestTier || "nano").toLowerCase()} creators. This configuration has a ~${bestOfferRate}% acceptance rate in your area.`;
    }

    res.json({
      unlocked: true,
      totalCampaigns,
      avgAcceptanceRate,
      bestOfferType,
      avgResponseTime,
      acceptanceByOfferType,
      creatorTierPerformance,
      neighborhoodBenchmarks,
      aiRecommendation,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
