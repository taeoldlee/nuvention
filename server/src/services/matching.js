// ─── Matching Algorithm for Locale ───
// Connects operators with the best-fit creators based on
// vibe alignment, content style, neighborhood, dream brands, and portfolio quality.

const { generateMatchRationale, generateContentPreview } = require("./ai");

const CONTENT_TEMPLATES = {
  "Ambiance / Interior": [
    "Golden-hour interior shots capturing the warm atmosphere and signature details of your space. Includes a 15-second walkthrough Reel showing the full ambiance experience.",
    "Natural light photography showcasing your space's unique character — from cozy corners to statement pieces. Complemented by a short-form video of the morning setup ritual.",
    "Editorial-style interior captures focusing on textures, lighting, and the details that make your space special. Includes a cinematic pan Reel.",
  ],
  "Food & Drink": [
    "Close-up, beautifully styled shots of your signature dishes and drinks in natural light. Includes a 15-second Reel of a signature drink being crafted.",
    "Warm, editorial food photography highlighting plating details and ingredients. Complemented by a top-down prep process video.",
    "Bold, vibrant captures of your menu highlights with lifestyle context. Includes a Reel featuring a customer's first-bite reaction moment.",
  ],
  "Community / Culture": [
    "Candid community moments — regulars chatting, baristas laughing, the energy of a busy morning. Includes a day-in-the-life Reel.",
    "Documentary-style captures of your community events and daily interactions. Complemented by a behind-the-counter perspective Reel.",
    "Lifestyle shots weaving your space into the neighborhood story. Includes a 20-second Reel of a community event highlight.",
  ],
  "Behind the Scenes": [
    "Authentic behind-the-scenes of your craft — prep work, techniques, and the people behind the product. Includes a process Reel.",
    "Raw, intimate captures of your morning routine and preparation rituals. Complemented by a hands-at-work close-up Reel.",
    "Documentary-style BTS showing the passion and precision behind your offerings. Includes a start-to-finish process Reel.",
  ],
  "Seasonal Special": [
    "Seasonal menu or decoration showcase with lifestyle context. Includes a Reel announcing the seasonal feature.",
    "Limited-time offering photography with emphasis on seasonal ingredients and atmosphere. Complemented by a taste-test reaction Reel.",
    "Festive or seasonal ambiance captures showing how your space transforms. Includes a before/after seasonal transformation Reel.",
  ],
};

const DELIVERABLE_OPTIONS = [
  "3 photos + 1 Reel (15s)",
  "4 photos + 1 Story set",
  "3 photos + 1 Reel (20s)",
];

const TIMELINE_OPTIONS = [
  "5 business days",
  "7 business days",
  "4 business days",
];

const USAGE_OPTIONS = [
  "Organic social + in-store, 12 months",
  "All digital platforms, 12 months",
  "Organic social only, 6 months",
];

// Base prices per content type (in cents), each index maps to a deliverable option
const PRICE_RANGES = {
  "Ambiance / Interior": [18000, 22000, 24000],
  "Food & Drink":        [20000, 25000, 28000],
  "Community / Culture":  [17000, 21000, 23000],
  "Behind the Scenes":   [15000, 19000, 21000],
  "Seasonal Special":    [22000, 26000, 28000],
};

const DEFAULT_PRICE_RANGE = [18000, 22000, 25000];

// ─── Scoring Weights ───
const WEIGHTS = {
  vibeAlignment: 30,
  contentStyleMatch: 25,
  neighborhoodProximity: 20,
  dreamBrandMatch: 15,
  portfolioQuality: 10,
};

function titleCase(value) {
  return value
    .toString()
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Calculate vibe alignment score (0-1).
 * Compares brand vibe tags with creator vibe tags and content styles.
 */
function vibeAlignmentScore(brand, creator) {
  const brandVibes = Array.isArray(brand.vibe) ? brand.vibe : [];
  const creatorVibeTags = Array.isArray(creator.vibeTags) ? creator.vibeTags : [];
  const creatorStyles = Array.isArray(creator.contentStyles) ? creator.contentStyles : [];

  if (brandVibes.length === 0) return 0.5;

  // Map brand vibes to keywords for fuzzy matching
  const brandKeywords = brandVibes.flatMap((v) =>
    v.toLowerCase().split(/[&,\s]+/).filter(Boolean)
  );

  const creatorKeywords = [
    ...creatorVibeTags.map((t) => t.toLowerCase()),
    ...creatorStyles.flatMap((s) => s.toLowerCase().split(/[&,\s]+/).filter(Boolean)),
  ];

  if (creatorKeywords.length === 0) return 0.3;

  let matches = 0;
  for (const bk of brandKeywords) {
    for (const ck of creatorKeywords) {
      if (ck.includes(bk) || bk.includes(ck)) {
        matches++;
        break;
      }
    }
  }

  return Math.min(matches / Math.max(brandKeywords.length, 1), 1);
}

/**
 * Calculate content style match score (0-1).
 * Compares requested content type with creator strengths.
 */
function contentStyleMatchScore(contentType, creator) {
  const strengths = Array.isArray(creator.strengths) ? creator.strengths : [];
  if (strengths.length === 0) return 0.3;

  const typeKeywords = contentType.toLowerCase().split(/[&,/\s]+/).filter(Boolean);

  let matchCount = 0;
  for (const strength of strengths) {
    const sLower = strength.toLowerCase();
    for (const kw of typeKeywords) {
      if (sLower.includes(kw) || kw.includes(sLower.split(" ")[0])) {
        matchCount++;
        break;
      }
    }
  }

  // Bonus for having "Reels" strength (always valuable)
  const hasReels = strengths.some((s) => s.toLowerCase().includes("reel") || s.toLowerCase().includes("video"));
  const reelBonus = hasReels ? 0.15 : 0;

  return Math.min((matchCount / Math.max(typeKeywords.length, 1)) + reelBonus, 1);
}

/**
 * Calculate neighborhood proximity score (0-1).
 */
function neighborhoodProximityScore(brand, creator) {
  const brandNeighborhood = (brand.neighborhood || "").toLowerCase();
  const creatorNeighborhoods = Array.isArray(creator.neighborhoods)
    ? creator.neighborhoods.map((n) => n.toLowerCase())
    : [];

  if (creatorNeighborhoods.length === 0) return 0.3;

  // Exact match
  if (creatorNeighborhoods.includes(brandNeighborhood)) return 1.0;

  // Same city bonus
  const brandCity = (brand.city || "").toLowerCase();
  if (brandCity && creatorNeighborhoods.some((n) => n.includes(brandCity))) return 0.6;

  return 0.2;
}

/**
 * Calculate dream brand match score (0-1).
 */
function dreamBrandMatchScore(brand, creator) {
  const dreamBrands = Array.isArray(creator.dreamBrands) ? creator.dreamBrands : [];
  if (dreamBrands.length === 0) return 0.3;

  const brandName = (brand.businessName || "").toLowerCase();

  for (const dream of dreamBrands) {
    const dreamLower = dream.toLowerCase();
    if (dreamLower.includes(brandName) || brandName.includes(dreamLower)) {
      return 1.0;
    }
  }

  return 0.2;
}

/**
 * Calculate portfolio quality score (0-1).
 * Based on number of portfolio items.
 */
function portfolioQualityScore(creator) {
  const itemCount = creator.portfolioItems ? creator.portfolioItems.length : 0;
  if (itemCount >= 6) return 1.0;
  if (itemCount >= 4) return 0.8;
  if (itemCount >= 2) return 0.6;
  if (itemCount >= 1) return 0.4;
  return 0.2;
}

/**
 * Score a single creator against a brand and content request.
 * Returns a score from 0 to 100.
 */
function scoreCreator(brand, request, creator) {
  const vibe = vibeAlignmentScore(brand, creator);
  const style = contentStyleMatchScore(request.contentType, creator);
  const neighborhood = neighborhoodProximityScore(brand, creator);
  const dream = dreamBrandMatchScore(brand, creator);
  const portfolio = portfolioQualityScore(creator);

  const totalScore = Math.round(
    vibe * WEIGHTS.vibeAlignment +
    style * WEIGHTS.contentStyleMatch +
    neighborhood * WEIGHTS.neighborhoodProximity +
    dream * WEIGHTS.dreamBrandMatch +
    portfolio * WEIGHTS.portfolioQuality
  );

  return Math.min(Math.max(totalScore, 0), 100);
}

/**
 * Build the template-based rationale (used as fallback when AI is unavailable).
 */
function buildFallbackRationale(brand, request, creator, matchSignals) {
  const contentType = request.contentType;
  const vibeLabel = Array.isArray(brand.vibe) && brand.vibe.length > 0 ? brand.vibe[0] : "local";
  let rationale = `Strong fit for your ${vibeLabel.toLowerCase()} aesthetic and ${contentType.toLowerCase()} needs. `;
  if (matchSignals.communitySignals?.[0]) {
    rationale += `${matchSignals.communitySignals[0]}. `;
  }
  if (matchSignals.aestheticMarkers?.length) {
    rationale += `Aesthetic markers: ${matchSignals.aestheticMarkers.join(", ")}.`;
  }
  return rationale;
}

/**
 * Build a match package for a creator.
 * Uses AI for rationale and content preview when available, falls back to templates.
 */
async function buildMatchPackage(brand, request, creator, optionIndex, matchScore) {
  const contentType = request.contentType;
  const templates = CONTENT_TEMPLATES[contentType] || CONTENT_TEMPLATES["Food & Drink"];
  const prices = PRICE_RANGES[contentType] || DEFAULT_PRICE_RANGE;

  const idx = optionIndex % templates.length;

  const deliverables = request.deliverables || DELIVERABLE_OPTIONS[idx];
  const timeline = request.timeline || TIMELINE_OPTIONS[idx];
  const usageRights = request.usageRights || USAGE_OPTIONS[idx];

  let price = prices[idx];
  const compensationType = request.compensationType || "FLAT_FEE";
  const compensationDetails = request.compensationDetails || {};
  if (compensationType === "FREE_PRODUCT" || compensationType === "DISCOUNT_CODE") {
    price = 0;
  } else if (compensationType === "HYBRID" && compensationDetails.flatFeeCents) {
    price = compensationDetails.flatFeeCents;
  }

  // Determine style from creator's content styles
  const creatorStyles = Array.isArray(creator.contentStyles) ? creator.contentStyles : [];
  const style = creatorStyles[0] || "Warm & Editorial";

  // Build match signals (needed for fallback rationale and response)
  const matchSignals = buildMatchSignals(brand, request, creator);

  // Attempt AI-generated content preview and rationale in parallel,
  // falling back to templates if AI is unavailable or fails.
  const [contentPreview, rationale] = await Promise.all([
    generateContentPreview(brand, creator, contentType).catch(() => templates[idx]),
    generateMatchRationale(brand, creator, contentType, matchScore).catch(
      () => buildFallbackRationale(brand, request, creator, matchSignals)
    ),
  ]);

  return {
    contentPreview,
    deliverables: Array.isArray(deliverables) ? deliverables.join(" · ") : deliverables,
    timeline,
    usageRights,
    price,
    style,
    matchRationale: rationale,
    matchSignals,
  };
}

function buildVenueAlignment(brand, creator) {
  const brandNeighborhood = (brand.neighborhood || "").toLowerCase();
  const projects = Array.isArray(creator.projects) ? creator.projects : [];
  const venueNeighborhoods = new Set(
    projects
      .map((p) => p.brandProfile?.neighborhood)
      .filter(Boolean)
      .map((n) => n.toLowerCase())
  );
  const signals = [];
  if (venueNeighborhoods.size > 0) {
    signals.push(`Posted at ${venueNeighborhoods.size} venues nearby`);
  }
  if (brandNeighborhood && venueNeighborhoods.has(brandNeighborhood)) {
    signals.push(`Posted at venues in ${titleCase(brand.neighborhood)}`);
  }
  return signals;
}

function buildAestheticMarkers(creator) {
  const vibeTags = new Set();
  (Array.isArray(creator.vibeTags) ? creator.vibeTags : []).forEach((t) => vibeTags.add(t));
  (Array.isArray(creator.portfolioItems) ? creator.portfolioItems : []).forEach((item) => {
    if (Array.isArray(item.vibeTags)) {
      item.vibeTags.forEach((t) => vibeTags.add(t));
    }
  });
  return Array.from(vibeTags).slice(0, 3).map(titleCase);
}

function buildCommunitySignals(brand, creator) {
  const brandNeighborhood = (brand.neighborhood || "").toLowerCase();
  const creatorNeighborhoods = Array.isArray(creator.neighborhoods)
    ? creator.neighborhoods.map((n) => n.toLowerCase())
    : [];
  const signals = [];
  if (brandNeighborhood && creatorNeighborhoods.includes(brandNeighborhood)) {
    signals.push(`Lives or shoots in ${titleCase(brand.neighborhood)}`);
  }
  return signals;
}

function buildPastOutcomes(creator) {
  const projects = Array.isArray(creator.projects) ? creator.projects : [];
  const deliveredProjects = projects.filter((p) => p.status === "DELIVERED");
  const signals = [];
  if (projects.length > 0) {
    const postingRate = Math.round((deliveredProjects.length / projects.length) * 100);
    signals.push(`${postingRate}% posting rate across ${projects.length} projects`);
  }
  if (deliveredProjects.length > 0) {
    signals.push(`${deliveredProjects.length} businesses posted this creator's work`);
  }
  return signals;
}

function buildTrustSignals(creator) {
  const projects = Array.isArray(creator.projects) ? creator.projects : [];
  const deliveredProjects = projects.filter((p) => p.status === "DELIVERED");
  const uniqueVenues = new Set(projects.map((p) => p.brandProfileId)).size;
  const verifiedSamples = (Array.isArray(creator.portfolioItems) ? creator.portfolioItems : []).filter(
    (item) => item.verified
  ).length;
  const completed = deliveredProjects.filter((p) => p.updatedAt && p.createdAt);
  const avgTurnaroundDays = completed.length === 0
    ? null
    : Math.round(
        completed.reduce((sum, p) => sum + (p.updatedAt - p.createdAt) / (1000 * 60 * 60 * 24), 0) /
          completed.length
      );
  const signals = { verifiedVenues: uniqueVenues, verifiedSamples, avgTurnaroundDays };
  if (creator.tier) {
    signals.tier = titleCase(creator.tier.toString().toLowerCase());
  }
  return signals;
}

function buildMatchSignals(brand, request, creator) {
  return {
    venueAlignment: buildVenueAlignment(brand, creator),
    aestheticMarkers: buildAestheticMarkers(creator),
    communitySignals: buildCommunitySignals(brand, creator),
    pastOutcomes: buildPastOutcomes(creator),
    trustSignals: buildTrustSignals(creator),
  };
}

/**
 * Generate top 3 matches for a content request.
 * @param {Object} brand - BrandProfile
 * @param {Object} request - ContentRequest
 * @param {Array} allCreators - Array of CreatorProfile with portfolioItems included
 * @returns {Promise<Array>} Top 3 match objects
 */
async function generateMatches(brand, request, allCreators) {
  if (!allCreators || allCreators.length === 0) {
    return [];
  }

  // Score all creators
  const scored = allCreators.map((creator) => ({
    creator,
    score: scoreCreator(brand, request, creator),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Take top 3
  const top3 = scored.slice(0, 3);

  // Build match packages (AI calls run in parallel across all 3 matches)
  const matches = await Promise.all(
    top3.map(async (entry, idx) => {
      const pkg = await buildMatchPackage(brand, request, entry.creator, idx, entry.score);
      return {
        creatorProfileId: entry.creator.id,
        matchScore: entry.score,
        ...pkg,
      };
    })
  );

  return matches;
}

module.exports = {
  scoreCreator,
  generateMatches,
  CONTENT_TEMPLATES,
  DELIVERABLE_OPTIONS,
  TIMELINE_OPTIONS,
  USAGE_OPTIONS,
  PRICE_RANGES,
};
