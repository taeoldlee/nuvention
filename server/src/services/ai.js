// ─── AI Service for Locale v2 ───
// Handles OpenAI integration with graceful fallbacks.

const openai = require("../config/openai");

/**
 * Analyze a brand from a Google Maps or Yelp URL.
 * Falls back to generic analysis when API keys are missing.
 */
async function analyzeBrandFromUrl(url) {
  if (!openai) {
    return fallbackBrandAnalysis(url);
  }

  try {
    const prompt = `Analyze this business URL and extract brand information for a UGC content platform.
URL: ${url}

Return a JSON object with:
{
  "businessName": "string",
  "neighborhood": "string - use one of these if the business is in the Chicago area: Evanston, Rogers Park, Wicker Park, Logan Square, West Loop, Hyde Park, Lincoln Park, Uptown. Otherwise return the actual city/neighborhood name.",
  "vibe": ["array of 2-3 vibe descriptors from: Cozy & Warm, Minimalist & Clean, Rustic & Raw, Polished & Editorial, Energetic & Bold, Dark & Moody, Bright & Playful, Industrial & Urban"],
  "values": ["array of 2-3 values from: Community-first, Sustainability, Quality-obsessed, Design-forward, Inclusive, Local-sourcing, Innovation, Tradition & Heritage"],
  "contentComfortZones": ["array of 2-3 from: Ambiance / Interior, Food & Drink, Community / Culture, Behind the Scenes, Seasonal Special, Staff & Culture, Customer Stories"],
  "vibeAnalysis": {
    "primaryVibe": "string - one-phrase summary of the brand's aesthetic",
    "aestheticTags": ["5 lowercase hyphenated tags"],
    "contentRecommendations": ["4 specific content ideas"],
    "avoidTags": ["3 things to avoid in content"]
  }
}

Only return the JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (err) {
    console.warn("[AI] analyzeBrandFromUrl failed:", err.message);
    return fallbackBrandAnalysis(url);
  }
}

function fallbackBrandAnalysis(url) {
  const urlLower = (url || "").toLowerCase();
  let businessName = "Your Business";
  if (urlLower.includes("google.com/maps")) {
    const placeMatch = url.match(/place\/([^/]+)/);
    if (placeMatch) {
      businessName = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
    }
  } else if (urlLower.includes("yelp.com")) {
    const bizMatch = url.match(/biz\/([^/?]+)/);
    if (bizMatch) {
      businessName = bizMatch[1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }

  return {
    businessName,
    neighborhood: "Evanston",
    vibe: ["Cozy & Warm", "Minimalist & Clean"],
    values: ["Community-first", "Quality-obsessed"],
    contentComfortZones: ["Food & Drink", "Ambiance / Interior"],
    vibeAnalysis: {
      primaryVibe: "Welcoming Local Spot",
      aestheticTags: ["warm-light", "community-focused", "local-charm", "clean-aesthetic", "inviting"],
      contentRecommendations: [
        "Interior ambiance shots during golden hour",
        "Signature menu item close-ups",
        "Community moments with regulars",
        "Behind-the-scenes preparation",
      ],
      avoidTags: ["corporate", "chain-feel", "stock-photo-style"],
    },
  };
}

/**
 * Analyze a brand from Google Places structured data.
 */
async function analyzeBrandFromPlaceData(placeData) {
  if (!openai) {
    return fallbackPlaceAnalysis(placeData);
  }

  try {
    const { name, address, types, rating, reviews, photoUrls } = placeData;
    const sortedReviews = (reviews || [])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .slice(0, 10);

    const prompt = `You are a creative director building brand profiles for a hyperlocal UGC content marketplace. Analyze this Google Places data and return a brand identity.

## INPUT DATA
- Business: ${name}
- Address: ${address || "Unknown"}
- Google Place Types: ${JSON.stringify(types || [])}
- Rating: ${rating || "N/A"}
- Reviews (${sortedReviews.length}): ${JSON.stringify(sortedReviews)}

Return this JSON:
{
  "businessName": "string",
  "neighborhood": "string",
  "vibe": ["2-3 vibe tags"],
  "values": ["2-3 values"],
  "contentComfortZones": ["2-3 zones"],
  "vibeScales": { "cozyEnergetic": 0-100, "quietBuzzy": 0-100, "classicModern": 0-100, "casualElevated": 0-100 },
  "guestExperienceKeywords": ["3-5 keywords"],
  "cuisineTypes": ["1-3 cuisine types"],
  "budgetMin": number (100-500),
  "budgetMax": number (200-1000),
  "contentNoGos": "string",
  "vibeAnalysis": {
    "primaryVibe": "string",
    "aestheticTags": ["5 tags"],
    "contentRecommendations": ["4 specific ideas"],
    "avoidTags": ["3 things to avoid"]
  }
}

Return ONLY the JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.warn("[AI] analyzeBrandFromPlaceData failed:", err.message);
    return fallbackPlaceAnalysis(placeData);
  }
}

function fallbackPlaceAnalysis(placeData) {
  const { name, address, types } = placeData || {};
  const typeList = types || [];
  const cuisineMap = {
    bakery: "Bakery & Pastry",
    cafe: "Coffee & Beverage",
    coffee_shop: "Coffee & Beverage",
    restaurant: "American",
    japanese_restaurant: "Japanese",
    french_restaurant: "French",
  };
  const cuisineTypes = [];
  for (const t of typeList) {
    if (cuisineMap[t] && !cuisineTypes.includes(cuisineMap[t])) cuisineTypes.push(cuisineMap[t]);
  }
  if (cuisineTypes.length === 0) cuisineTypes.push("American");

  let neighborhood = "Evanston";
  const addressLower = (address || "").toLowerCase();
  for (const n of ["Rogers Park", "Wicker Park", "Logan Square", "West Loop", "Hyde Park", "Lincoln Park", "Evanston"]) {
    if (addressLower.includes(n.toLowerCase())) { neighborhood = n; break; }
  }

  const isCafe = typeList.some((t) => ["cafe", "coffee_shop", "bakery"].includes(t));
  return {
    businessName: name || "Your Business",
    neighborhood,
    vibe: isCafe ? ["Cozy & Warm", "Minimalist & Clean"] : ["Cozy & Warm", "Rustic & Raw"],
    values: ["Community-first", "Quality-obsessed"],
    contentComfortZones: ["Food & Drink", "Ambiance / Interior"],
    vibeScales: { cozyEnergetic: isCafe ? 30 : 50, quietBuzzy: isCafe ? 35 : 55, classicModern: 50, casualElevated: isCafe ? 40 : 50 },
    guestExperienceKeywords: isCafe ? ["cozy", "welcoming", "neighborhood"] : ["warm", "authentic", "local"],
    cuisineTypes,
    budgetMin: 150,
    budgetMax: 400,
    contentNoGos: "",
    vibeAnalysis: {
      primaryVibe: isCafe ? "Cozy Neighborhood Cafe" : "Welcoming Local Spot",
      aestheticTags: ["warm-light", "community-focused", "local-charm", "clean-aesthetic", "inviting"],
      contentRecommendations: ["Interior ambiance shots during golden hour", "Signature menu item close-ups", "Community moments with regulars", "Behind-the-scenes preparation"],
      avoidTags: ["corporate", "chain-feel", "stock-photo-style"],
    },
  };
}

/**
 * Generate AI suggestions during brief creation.
 * Based on brand profile and campaign goal.
 */
async function generateBriefSuggestions(brandProfile, campaignGoal, contentTypes) {
  if (!openai) {
    return fallbackBriefSuggestions(brandProfile, campaignGoal);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `You are a campaign strategist for local F&B businesses. Generate brief suggestions.

Brand: ${brandProfile.businessName}
Neighborhood: ${brandProfile.neighborhood}
Vibe: ${JSON.stringify(brandProfile.vibe || [])}
Cuisine: ${JSON.stringify(brandProfile.cuisineTypes || [])}
Campaign Goal: ${campaignGoal}
Content Types: ${JSON.stringify(contentTypes || [])}

Return JSON:
{
  "creativeDirection": "2-3 sentence creative direction",
  "compensationRange": { "min": number, "max": number, "note": "string" },
  "deliverableStructure": "suggested deliverable breakdown",
  "dos": "2-3 suggested dos",
  "donts": "2-3 suggested don'ts"
}

Only return JSON.`,
      }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.warn("[AI] generateBriefSuggestions failed:", err.message);
    return fallbackBriefSuggestions(brandProfile, campaignGoal);
  }
}

function fallbackBriefSuggestions(brandProfile, campaignGoal) {
  const name = brandProfile.businessName || "your spot";
  const vibe = (brandProfile.vibe || [])[0] || "welcoming";

  const suggestions = {
    EVENT_PROMO: {
      creativeDirection: `Capture the energy and excitement of the event at ${name}. Focus on crowd moments, featured items, and the ${vibe.toLowerCase()} atmosphere.`,
      compensationRange: { min: 0, max: 15000, note: "Free dinner for 2 is common for event promos" },
      deliverableStructure: "2 Reels + 3 Stories",
      dos: "Show the crowd energy, feature any special items or performances",
      donts: "Don't show empty spaces or unflattering angles",
    },
    MENU_LAUNCH: {
      creativeDirection: `Highlight the new menu items with close-up, appetizing shots. Emphasize texture, color, and the ${vibe.toLowerCase()} plating style.`,
      compensationRange: { min: 5000, max: 15000, note: "$50-$150 typical for menu launches" },
      deliverableStructure: "1 Carousel + 1 Reel",
      dos: "Show plating details, include the dining atmosphere",
      donts: "Don't use flash photography, avoid cluttered backgrounds",
    },
    GENERAL_CONTENT: {
      creativeDirection: `Create authentic, lifestyle content that shows what it's like to visit ${name}. Capture the ${vibe.toLowerCase()} vibe naturally.`,
      compensationRange: { min: 5000, max: 10000, note: "$50-$100 for general content" },
      deliverableStructure: "1 Reel + 2-3 Photos",
      dos: "Show genuine moments, capture the atmosphere during peak hours",
      donts: "Don't stage overly polished shots, avoid competitor logos",
    },
  };

  return suggestions[campaignGoal] || suggestions.GENERAL_CONTENT;
}

/**
 * Rank an application against a brief using AI.
 * Returns a score (0-100) and rationale.
 */
async function rankApplication(application, brief, brandProfile) {
  if (!openai) {
    return fallbackApplicationRanking(application, brief);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Score this creator application against a brand's campaign brief.

BRIEF:
- Title: ${brief.title}
- Goal: ${brief.campaignGoal}
- Content Types: ${JSON.stringify(brief.contentTypes)}
- Creative Direction: ${brief.creativeDirection}
- Location: ${brief.locationRequirement}
- Brand Vibe: ${JSON.stringify(brandProfile.vibe || [])}
- Neighborhood: ${brandProfile.neighborhood}

APPLICATION:
- Creator: ${application.creatorName} (@${application.creatorHandle})
- Platform: ${application.creatorPlatform}
- Followers: ${application.followerCount || "N/A"}
- Engagement: ${application.engagementRate || "N/A"}%
- Content Style Tags: ${JSON.stringify(application.contentStyleTags || [])}
- Top Posts: ${JSON.stringify(application.topPostUrls || [])}
- Pitch: ${application.pitch}
- Compensation Ask: ${application.compensationAsk || "accepts offered terms"}

Score 0-100 based on:
- Content style alignment (25%): style tags vs creative direction & brand vibe
- Location proximity (20%): audience location vs brand neighborhood
- Portfolio relevance (20%): top posts relevance to brief goal
- Engagement quality (15%): engagement rate relative to follower count
- Compensation fit (10%): ask vs offered amount
- Audience demographics fit (10%): overall match

Return JSON:
{ "score": number, "rationale": "2-3 sentence explanation" }`,
      }],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.warn("[AI] rankApplication failed:", err.message);
    return fallbackApplicationRanking(application, brief);
  }
}

function fallbackApplicationRanking(application, brief) {
  let score = 50;

  // Boost for style alignment
  const styleTags = application.contentStyleTags || [];
  if (styleTags.length > 0) score += 5;

  // Boost for engagement
  const engagement = application.engagementRate || 0;
  if (engagement > 5) score += 10;
  else if (engagement > 3) score += 5;

  // Boost for follower count (nano/micro preferred for local)
  const followers = application.followerCount || 0;
  if (followers >= 1000 && followers <= 15000) score += 10;
  else if (followers >= 500) score += 5;

  // Boost for accepting offered terms
  if (!application.compensationAsk || application.compensationAsk.toLowerCase().includes("accept")) {
    score += 5;
  }

  // Boost for having portfolio
  if ((application.portfolioUrls || []).length > 0) score += 5;
  if ((application.topPostUrls || []).length >= 2) score += 5;

  // Add some variance
  score += Math.floor(Math.random() * 10) - 5;
  score = Math.max(20, Math.min(95, score));

  const rationale = `This creator shows potential alignment with the brief. Their ${application.creatorPlatform.toLowerCase()} presence with ${followers.toLocaleString()} followers and ${engagement}% engagement rate suggests a solid local following suitable for this campaign.`;

  return { score, rationale };
}

module.exports = {
  analyzeBrandFromUrl,
  analyzeBrandFromPlaceData,
  generateBriefSuggestions,
  rankApplication,
};
