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

  // ── Extract business name from URL ──
  let businessName = "Your Business";
  if (urlLower.includes("google.com/maps") || urlLower.includes("maps.app.goo.gl")) {
    const placeMatch = url.match(/place\/([^/@?]+)/);
    if (placeMatch) {
      businessName = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ").trim();
    }
  } else if (urlLower.includes("yelp.com")) {
    const bizMatch = url.match(/biz\/([^/?]+)/);
    if (bizMatch) {
      businessName = bizMatch[1]
        .split("-")
        .filter((w) => !/^\d{5,}$/.test(w)) // strip trailing IDs
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .trim();
    }
  }

  // ── Extract neighborhood from Google Maps URL ──
  const KNOWN_NEIGHBORHOODS = [
    "Evanston", "Rogers Park", "Wicker Park", "Logan Square", "West Loop",
    "Hyde Park", "Lincoln Park", "Uptown", "Bucktown", "River North",
    "Gold Coast", "Pilsen", "Andersonville", "Lakeview", "Old Town",
    "Bridgeport", "South Loop", "Streeterville", "Fulton Market",
  ];
  let neighborhood = "Evanston";
  for (const n of KNOWN_NEIGHBORHOODS) {
    if (urlLower.includes(n.toLowerCase().replace(/\s+/g, "+")) ||
        urlLower.includes(n.toLowerCase().replace(/\s+/g, "-")) ||
        urlLower.includes(n.toLowerCase().replace(/\s+/g, "%20"))) {
      neighborhood = n;
      break;
    }
  }

  // ── Detect cuisine / concept type from name + URL ──
  const combined = (businessName + " " + urlLower).toLowerCase();

  const CUISINE_SIGNALS = [
    { keywords: ["ramen", "noodle", "udon", "soba", "tonkotsu", "miso"],      cuisine: "Japanese",            vibeKeys: ["cozy-steam", "warm-broth", "handcrafted-noodles"] },
    { keywords: ["sushi", "omakase", "izakaya", "japanese"],                   cuisine: "Japanese",            vibeKeys: ["minimalist-plating", "clean-lines", "umami-close-ups"] },
    { keywords: ["taco", "burrito", "mexican", "taquer", "enchilada"],         cuisine: "Mexican",             vibeKeys: ["vibrant-color", "street-food-energy", "fresh-ingredients"] },
    { keywords: ["pizza", "italian", "pasta", "trattoria", "osteria"],         cuisine: "Italian",             vibeKeys: ["rustic-warmth", "wood-fired", "family-style"] },
    { keywords: ["burger", "bbq", "smokehouse", "brisket", "wings"],           cuisine: "American",            vibeKeys: ["bold-portions", "comfort-vibes", "smoky-texture"] },
    { keywords: ["pastry", "patisserie", "patisseri", "macaron", "croissant"], cuisine: "Bakery & Pastry",     vibeKeys: ["pastel-palette", "artisan-detail", "morning-light"] },
    { keywords: ["bakery", "bread", "sourdough", "loaf", "hewn"],              cuisine: "Bakery & Pastry",     vibeKeys: ["flour-dusted", "golden-crusts", "hands-at-work"] },
    { keywords: ["cafe", "coffee", "espresso", "latte", "roaster", "brew"],    cuisine: "Coffee & Beverage",   vibeKeys: ["warm-mug", "third-wave", "community-tables"] },
    { keywords: ["thai", "pad thai", "curry", "basil"],                        cuisine: "Thai",                vibeKeys: ["aromatic-herbs", "street-food-energy", "bold-color"] },
    { keywords: ["indian", "tandoor", "curry", "biryani", "naan"],             cuisine: "Indian",              vibeKeys: ["spice-warmth", "rich-color", "family-recipes"] },
    { keywords: ["chinese", "dim sum", "dumpling", "peking"],                  cuisine: "Chinese",             vibeKeys: ["community-dishes", "steam-baskets", "family-style"] },
    { keywords: ["korean", "kbbq", "bibimbap", "galbi", "banchan"],            cuisine: "Korean",              vibeKeys: ["grill-smoke", "colorful-banchan", "sharing-plates"] },
    { keywords: ["french", "brasserie", "bistro", "bordeaux"],                 cuisine: "French",              vibeKeys: ["elegant-plating", "warm-candles", "refined-detail"] },
    { keywords: ["mediterranean", "greek", "mezze", "hummus", "falafel"],      cuisine: "Mediterranean",       vibeKeys: ["fresh-herbs", "olive-warmth", "communal-spread"] },
    { keywords: ["seafood", "oyster", "sushi", "fish", "lobster", "crab"],     cuisine: "Seafood",             vibeKeys: ["ocean-fresh", "clean-presentation", "coastal-vibes"] },
    { keywords: ["vegan", "plant-based", "vegetarian"],                        cuisine: "Vegan & Plant-Based", vibeKeys: ["fresh-green", "earthy-tones", "wholesome-bowls"] },
    { keywords: ["bar", "cocktail", "speakeasy", "lounge", "pub"],             cuisine: "Bar & Cocktails",     vibeKeys: ["moody-lighting", "craft-cocktails", "intimate-corners"] },
    { keywords: ["brunch", "breakfast", "pancake", "waffle", "omelet"],        cuisine: "Brunch & Breakfast",  vibeKeys: ["golden-morning", "stacked-plates", "weekend-energy"] },
    { keywords: ["ice cream", "gelato", "dessert", "sweet", "donut"],          cuisine: "Desserts & Sweets",   vibeKeys: ["pastel-scoops", "playful-texture", "sweet-moments"] },
  ];

  // ── Vibe / Values / Content maps by concept ──
  const CONCEPT_PROFILES = {
    "Japanese":            { vibe: ["Minimalist & Clean", "Cozy & Warm"],       values: ["Quality-obsessed", "Tradition & Heritage"],  zones: ["Food & Drink", "Behind the Scenes", "Ambiance / Interior"] },
    "Mexican":             { vibe: ["Energetic & Bold", "Bright & Playful"],    values: ["Community-first", "Local-sourcing"],          zones: ["Food & Drink", "Community / Culture", "Ambiance / Interior"] },
    "Italian":             { vibe: ["Rustic & Raw", "Cozy & Warm"],             values: ["Tradition & Heritage", "Quality-obsessed"],   zones: ["Food & Drink", "Ambiance / Interior", "Behind the Scenes"] },
    "American":            { vibe: ["Rustic & Raw", "Energetic & Bold"],        values: ["Community-first", "Local-sourcing"],          zones: ["Food & Drink", "Ambiance / Interior", "Community / Culture"] },
    "Bakery & Pastry":     { vibe: ["Minimalist & Clean", "Polished & Editorial"], values: ["Quality-obsessed", "Design-forward"],      zones: ["Food & Drink", "Behind the Scenes", "Ambiance / Interior"] },
    "Coffee & Beverage":   { vibe: ["Cozy & Warm", "Minimalist & Clean"],       values: ["Community-first", "Sustainability"],          zones: ["Ambiance / Interior", "Food & Drink", "Community / Culture"] },
    "Thai":                { vibe: ["Energetic & Bold", "Cozy & Warm"],         values: ["Local-sourcing", "Quality-obsessed"],         zones: ["Food & Drink", "Ambiance / Interior", "Behind the Scenes"] },
    "Indian":              { vibe: ["Cozy & Warm", "Rustic & Raw"],             values: ["Tradition & Heritage", "Community-first"],    zones: ["Food & Drink", "Behind the Scenes", "Ambiance / Interior"] },
    "Chinese":             { vibe: ["Cozy & Warm", "Energetic & Bold"],         values: ["Tradition & Heritage", "Community-first"],    zones: ["Food & Drink", "Community / Culture", "Ambiance / Interior"] },
    "Korean":              { vibe: ["Energetic & Bold", "Rustic & Raw"],        values: ["Community-first", "Quality-obsessed"],        zones: ["Food & Drink", "Community / Culture", "Behind the Scenes"] },
    "French":              { vibe: ["Polished & Editorial", "Minimalist & Clean"], values: ["Quality-obsessed", "Design-forward"],      zones: ["Food & Drink", "Ambiance / Interior", "Seasonal Special"] },
    "Mediterranean":       { vibe: ["Cozy & Warm", "Rustic & Raw"],             values: ["Local-sourcing", "Community-first"],          zones: ["Food & Drink", "Ambiance / Interior", "Community / Culture"] },
    "Seafood":             { vibe: ["Minimalist & Clean", "Polished & Editorial"], values: ["Quality-obsessed", "Local-sourcing"],      zones: ["Food & Drink", "Ambiance / Interior", "Seasonal Special"] },
    "Vegan & Plant-Based": { vibe: ["Minimalist & Clean", "Bright & Playful"],  values: ["Sustainability", "Inclusive"],                zones: ["Food & Drink", "Behind the Scenes", "Community / Culture"] },
    "Bar & Cocktails":     { vibe: ["Dark & Moody", "Polished & Editorial"],    values: ["Innovation", "Design-forward"],               zones: ["Ambiance / Interior", "Food & Drink", "Community / Culture"] },
    "Brunch & Breakfast":  { vibe: ["Bright & Playful", "Cozy & Warm"],         values: ["Community-first", "Quality-obsessed"],        zones: ["Food & Drink", "Ambiance / Interior", "Community / Culture"] },
    "Desserts & Sweets":   { vibe: ["Bright & Playful", "Minimalist & Clean"],  values: ["Design-forward", "Quality-obsessed"],         zones: ["Food & Drink", "Ambiance / Interior", "Seasonal Special"] },
  };

  // ── Match detected cuisine ──
  let detectedCuisine = "American";
  let detectedVibeKeys = ["warm-light", "community-focused", "local-charm", "clean-aesthetic", "inviting"];
  for (const signal of CUISINE_SIGNALS) {
    if (signal.keywords.some((k) => combined.includes(k))) {
      detectedCuisine = signal.cuisine;
      detectedVibeKeys = signal.vibeKeys;
      break;
    }
  }

  const profile = CONCEPT_PROFILES[detectedCuisine] || CONCEPT_PROFILES["American"];

  // ── Content recommendations by cuisine ──
  const CONTENT_RECS = {
    "Japanese":            ["Steam rising from a fresh bowl", "Noodle pull close-up", "Chef at work behind the counter", "Golden hour interior shots"],
    "Mexican":             ["Vibrant taco spread flat lay", "Sizzling skillet moment", "Colorful ingredient close-ups", "Lively patio or dining room energy"],
    "Italian":             ["Pasta twirl close-up", "Wood-fired oven glow", "Rustic table setting with candles", "Fresh ingredient prep behind the scenes"],
    "American":            ["Hero burger or dish shot", "Crowd energy during service", "Behind-the-bar or kitchen moments", "Comfort food close-ups with texture"],
    "Bakery & Pastry":     ["Golden loaf fresh from oven", "Baker's hands shaping dough", "Morning light through display case", "Cross-section of layered pastry"],
    "Coffee & Beverage":   ["Latte art pour sequence", "Cozy corner with laptop and cup", "Barista at work close-up", "Seasonal drink launch reveal"],
    "French":              ["Elegant plating close-up", "Pastry case in morning light", "Champagne pour or wine pairing", "Refined table setting detail"],
    "Korean":              ["Korean BBQ grill smoke and sizzle", "Colorful banchan spread", "Sharing plates moment between friends", "Marinated meat close-up"],
    "Bar & Cocktails":     ["Cocktail pour in moody light", "Ice detail and garnish close-up", "Intimate booth conversation", "Bartender craft behind the bar"],
    "Brunch & Breakfast":  ["Golden stack of pancakes", "Table spread in morning light", "Eggs benedict close-up", "Cozy weekend brunch energy"],
  };

  const contentRecs = CONTENT_RECS[detectedCuisine] || [
    "Interior ambiance shots during golden hour",
    "Signature menu item close-ups",
    "Community moments with regulars",
    "Behind-the-scenes preparation",
  ];

  return {
    businessName,
    neighborhood,
    vibe: profile.vibe,
    values: profile.values,
    contentComfortZones: profile.zones,
    cuisineTypes: [detectedCuisine],
    budgetMin: 100,
    budgetMax: 400,
    vibeScales: { cozyEnergetic: 40, quietBuzzy: 45, classicModern: 50, casualElevated: 45 },
    guestExperienceKeywords: ["welcoming", "neighborhood", "authentic"],
    contentNoGos: "",
    vibeAnalysis: {
      primaryVibe: `${detectedCuisine} — ${profile.vibe[0]}`,
      aestheticTags: [...detectedVibeKeys, "local-charm", "inviting"],
      contentRecommendations: contentRecs,
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

/**
 * Normalize free-text goal input to closest predefined goal.
 * Uses gpt-4o-mini when available, falls back to keyword matching.
 */
async function normalizeGoalText(customText) {
  const GOAL_MAP = [
    { key: 'fill_slow_days', category: 'GET_MORE_CUSTOMERS', label: 'Fill slow days (weekday lunches, off-peak hours)', keywords: ['slow', 'weekday', 'lunch', 'off-peak', 'empty', 'dead', 'quiet hours'] },
    { key: 'attract_new_faces', category: 'GET_MORE_CUSTOMERS', label: 'Attract new faces in my neighborhood', keywords: ['new customers', 'new faces', 'foot traffic', 'walk-in', 'neighborhood', 'locals', 'discover'] },
    { key: 'reach_different_crowd', category: 'GET_MORE_CUSTOMERS', label: 'Reach a different crowd (younger, families, etc.)', keywords: ['younger', 'families', 'college', 'students', 'different crowd', 'demographic', 'gen z', 'millennials'] },
    { key: 'launch_menu_item', category: 'PROMOTE_SOMETHING', label: 'Launch a new menu item or seasonal special', keywords: ['menu', 'new dish', 'seasonal', 'special', 'launch', 'new item', 'recipe'] },
    { key: 'hype_event', category: 'PROMOTE_SOMETHING', label: 'Hype up an event or grand opening', keywords: ['event', 'opening', 'grand opening', 'trivia', 'party', 'night', 'celebration', 'hype', 'pop-up'] },
    { key: 'grow_social_media', category: 'BUILD_MY_BRAND_ONLINE', label: 'Grow my social media presence', keywords: ['social media', 'instagram', 'tiktok', 'followers', 'engagement', 'presence', 'grow'] },
    { key: 'get_quality_content', category: 'BUILD_MY_BRAND_ONLINE', label: 'Get quality content for ads, website, or socials', keywords: ['content', 'photos', 'videos', 'ads', 'website', 'quality', 'professional'] },
    { key: 'stand_out_competitors', category: 'BUILD_MY_BRAND_ONLINE', label: 'Stand out from competitors in my area', keywords: ['stand out', 'competitors', 'competition', 'differentiate', 'unique', 'brand'] },
  ];

  if (openai) {
    try {
      const goalList = GOAL_MAP.map((g) => `${g.key} (${g.category}): ${g.label}`).join('\n');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `A restaurant owner typed this as their #1 goal:\n"${customText}"\n\nMatch it to the closest goal from this list:\n${goalList}\n\nReturn JSON: { "key": "goal_key", "category": "CATEGORY", "label": "Goal label", "confidence": 0-1 }\nOnly return the JSON.`,
        }],
        temperature: 0.2,
        max_tokens: 150,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn('[AI] normalizeGoalText failed:', err.message);
    }
  }

  // Fallback: keyword matching
  const textLower = customText.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const goal of GOAL_MAP) {
    const score = goal.keywords.filter((kw) => textLower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = goal;
    }
  }
  if (bestMatch) {
    return { key: bestMatch.key, category: bestMatch.category, label: bestMatch.label, confidence: 0.6 };
  }
  return { key: 'get_quality_content', category: 'BUILD_MY_BRAND_ONLINE', label: 'Get quality content for ads, website, or socials', confidence: 0.3 };
}

module.exports = {
  analyzeBrandFromUrl,
  analyzeBrandFromPlaceData,
  generateBriefSuggestions,
  rankApplication,
  normalizeGoalText,
};
