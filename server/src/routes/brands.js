const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { analyzeBrandFromUrl } = require("../services/ai");

// ─── Autofill Fallback Data ───

const AUTOFILL_FALLBACK = {
  colectivo: {
    businessName: "Colectivo Coffee",
    neighborhood: "Evanston",
    vibe: ["Cozy & Warm", "Rustic & Raw"],
    values: ["Community-first", "Sustainability"],
    contentComfortZones: ["Ambiance / Interior", "Staff & Culture"],
    vibeAnalysis: {
      primaryVibe: "Warm Community Hub",
      aestheticTags: ["exposed-brick", "warm-wood", "community-tables", "craft-coffee", "local-art"],
      contentRecommendations: [
        "Morning ritual moments",
        "Barista craft close-ups",
        "Community gathering shots",
        "Seasonal drink launches",
      ],
      avoidTags: ["corporate", "chain-feel", "overly-polished"],
    },
  },
  coralie: {
    businessName: "Patisserie Coralie",
    neighborhood: "Evanston",
    vibe: ["Polished & Editorial", "Minimalist & Clean"],
    values: ["Quality-obsessed", "Design-forward"],
    contentComfortZones: ["Food & Drink", "Ambiance / Interior"],
    vibeAnalysis: {
      primaryVibe: "Refined European Elegance",
      aestheticTags: ["clean-lines", "pastel-palette", "artisan-detail", "natural-light", "curated-displays"],
      contentRecommendations: [
        "Close-up pastry artistry",
        "Morning light through windows",
        "Plating details",
        "Seasonal specialties",
      ],
      avoidTags: ["casual", "rustic", "dark-moody"],
    },
  },
  hewn: {
    businessName: "Hewn Bread",
    neighborhood: "Evanston",
    vibe: ["Rustic & Raw", "Cozy & Warm"],
    values: ["Quality-obsessed", "Community-first", "Sustainability"],
    contentComfortZones: ["Food & Drink", "Behind the Scenes"],
    vibeAnalysis: {
      primaryVibe: "Artisan Craft Story",
      aestheticTags: ["flour-dusted", "golden-crusts", "wood-fired", "hands-at-work", "morning-light"],
      contentRecommendations: [
        "Dough-to-loaf process",
        "Golden hour bread shots",
        "Baker's hands close-ups",
        "Fresh-from-oven moments",
      ],
      avoidTags: ["mass-produced", "sterile", "corporate"],
    },
  },
  "coffee lab": {
    businessName: "New Coffee Lab",
    neighborhood: "Evanston",
    vibe: ["Energetic & Bold", "Minimalist & Clean"],
    values: ["Inclusive", "Community-first"],
    contentComfortZones: ["Food & Drink", "Community / Events"],
    vibeAnalysis: {
      primaryVibe: "Modern Third Wave",
      aestheticTags: ["clean-minimal", "bold-color-pops", "student-energy", "modern-equipment", "community-vibe"],
      contentRecommendations: [
        "Latte art competitions",
        "Study session ambiance",
        "Community board close-ups",
        "Pour-over process",
      ],
      avoidTags: ["traditional", "dark-academia", "luxury"],
    },
  },
};

/**
 * Try to find a matching fallback business from a URL.
 */
function findFallbackMatch(url) {
  const urlLower = (url || "").toLowerCase();
  for (const [key, data] of Object.entries(AUTOFILL_FALLBACK)) {
    if (urlLower.includes(key.replace(/\s+/g, "")) || urlLower.includes(key.replace(/\s+/g, "-"))) {
      return data;
    }
  }
  return null;
}

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/brands/profile
 * Get current operator's brand profile.
 */
router.get("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can access brand profiles" });
    }

    const profile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Brand profile not found. Complete onboarding first." });
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/brands/profile
 * Create brand profile (onboarding).
 */
router.post("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can create brand profiles" });
    }

    // Check if profile already exists
    const existing = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res.status(409).json({ error: "Brand profile already exists. Use PUT to update." });
    }

    const {
      businessName,
      neighborhood,
      city,
      state,
      googleMapsUrl,
      yelpUrl,
      vibe,
      values,
      contentComfortZones,
      budgetMin,
      budgetMax,
      vibeAnalysis,
      profilePhotoUrl,
    } = req.body;

    if (!businessName || !neighborhood) {
      return res.status(400).json({ error: "businessName and neighborhood are required" });
    }

    const profile = await prisma.brandProfile.create({
      data: {
        userId: req.user.id,
        businessName,
        neighborhood,
        city: city || "Evanston",
        state: state || "IL",
        googleMapsUrl: googleMapsUrl || null,
        yelpUrl: yelpUrl || null,
        vibe: vibe || [],
        values: values || [],
        contentComfortZones: contentComfortZones || [],
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        vibeAnalysis: vibeAnalysis || null,
        profilePhotoUrl: profilePhotoUrl || null,
      },
    });

    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/brands/profile
 * Update brand profile.
 */
router.put("/profile", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can update brand profiles" });
    }

    const existing = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Brand profile not found. Create one first." });
    }

    const {
      businessName,
      neighborhood,
      city,
      state,
      googleMapsUrl,
      yelpUrl,
      vibe,
      values,
      contentComfortZones,
      budgetMin,
      budgetMax,
      vibeAnalysis,
      profilePhotoUrl,
    } = req.body;

    const profile = await prisma.brandProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(businessName !== undefined && { businessName }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(googleMapsUrl !== undefined && { googleMapsUrl }),
        ...(yelpUrl !== undefined && { yelpUrl }),
        ...(vibe !== undefined && { vibe }),
        ...(values !== undefined && { values }),
        ...(contentComfortZones !== undefined && { contentComfortZones }),
        ...(budgetMin !== undefined && { budgetMin }),
        ...(budgetMax !== undefined && { budgetMax }),
        ...(vibeAnalysis !== undefined && { vibeAnalysis }),
        ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
      },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/brands/auto-import
 * Body: { url }
 * Auto-import brand data from Google Maps/Yelp URL.
 */
router.post("/auto-import", async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    // Detect URL type
    const urlLower = url.toLowerCase();
    let urlType = "unknown";
    if (urlLower.includes("google.com/maps") || urlLower.includes("goo.gl/maps") || urlLower.includes("maps.app.goo.gl")) {
      urlType = "google_maps";
    } else if (urlLower.includes("yelp.com")) {
      urlType = "yelp";
    }

    // Step 1: Try fallback data for known businesses
    const fallbackData = findFallbackMatch(url);
    if (fallbackData) {
      return res.json({
        source: "fallback",
        urlType,
        data: fallbackData,
      });
    }

    // Step 2: Try AI-powered analysis
    const aiResult = await analyzeBrandFromUrl(url);

    return res.json({
      source: openaiAvailable() ? "ai" : "fallback",
      urlType,
      data: aiResult,
    });
  } catch (err) {
    next(err);
  }
});

function openaiAvailable() {
  return !!process.env.OPENAI_API_KEY;
}

module.exports = router;
