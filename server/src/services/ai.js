// ─── AI Service for Locale ───
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

  // Try to extract a business name from URL
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
 * Analyze creator portfolio images using OpenAI Vision.
 * Falls back to generic analysis when API keys are missing.
 */
async function analyzeCreatorPortfolio(imageUrls) {
  if (!openai || !imageUrls || imageUrls.length === 0) {
    return fallbackPortfolioAnalysis();
  }

  try {
    const imageMessages = imageUrls.slice(0, 4).map((url) => ({
      type: "image_url",
      image_url: { url, detail: "low" },
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze these portfolio images from a UGC content creator. Return a JSON object:
{
  "contentStyles": ["3-4 from: Warm, Editorial, Documentary, Candid, Clean, Minimal, Bold, Energetic, Moody, Cinematic, Bright, Lifestyle"],
  "strengths": ["3-4 strengths from: Food photography, Interior / ambiance, Reels / short-form video, Story content, Community moments, Behind-the-scenes, Product close-ups, Lifestyle & people"],
  "vibeTags": ["5-6 lowercase hyphenated aesthetic tags"],
  "qualityScore": 1-10,
  "summary": "Brief 1-2 sentence summary of the creator's style"
}

Only return the JSON.`,
            },
            ...imageMessages,
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.warn("[AI] analyzeCreatorPortfolio failed:", err.message);
    return fallbackPortfolioAnalysis();
  }
}

function fallbackPortfolioAnalysis() {
  return {
    contentStyles: ["Warm", "Editorial", "Lifestyle", "Candid"],
    strengths: ["Food photography", "Interior / ambiance", "Community moments"],
    vibeTags: ["warm-light", "natural-tones", "authentic-moments", "local-vibes", "cozy-aesthetic"],
    qualityScore: 7,
    summary: "A versatile creator with a warm, authentic style well-suited for local F&B businesses.",
  };
}

/**
 * Generate a match rationale using AI.
 * Falls back to template-based rationale.
 */
async function generateMatchRationale(brand, creator, contentType, matchScore) {
  if (!openai) {
    return fallbackMatchRationale(brand, creator, contentType, matchScore);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a 2-sentence match rationale for pairing a UGC creator with a brand.

Brand: ${brand.businessName} (Vibes: ${JSON.stringify(brand.vibe)})
Creator styles: ${JSON.stringify(creator.contentStyles)}, Strengths: ${JSON.stringify(creator.strengths)}
Content type: ${contentType}
Match score: ${matchScore}/100

IMPORTANT: Do NOT use the creator's name. Refer to them as "this creator" or "the creator". Be specific about why they are a great fit. Keep it conversational and confident. Return only the rationale text, no JSON.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.warn("[AI] generateMatchRationale failed:", err.message);
    return fallbackMatchRationale(brand, creator, contentType, matchScore);
  }
}

function fallbackMatchRationale(brand, creator, contentType, matchScore) {
  const styles = Array.isArray(creator.contentStyles) ? creator.contentStyles : [];
  const style = styles[0] || "versatile";
  const brandVibes = Array.isArray(brand.vibe) ? brand.vibe : [];
  const vibe = brandVibes[0] || "unique";

  return `This creator's ${style.toLowerCase()} style is a natural fit for ${brand.businessName}'s ${vibe.toLowerCase()} aesthetic. Their expertise in ${contentType.toLowerCase()} content will authentically capture what makes your space special.`;
}

/**
 * Generate a content preview for a match.
 * Falls back to templates.
 */
async function generateContentPreview(brand, creator, contentType) {
  if (!openai) {
    return fallbackContentPreview(brand, contentType);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a brief content preview (2-3 sentences) describing what UGC content a creator would produce.

Brand: ${brand.businessName} (Vibes: ${JSON.stringify(brand.vibe)})
Creator styles: ${JSON.stringify(creator.contentStyles)}
Content type: ${contentType}

IMPORTANT: Do NOT use the creator's name. Refer to them as "this creator" or "the creator". Describe the specific photos and Reel they would create. Be vivid and specific to this brand. Return only the preview text.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.warn("[AI] generateContentPreview failed:", err.message);
    return fallbackContentPreview(brand, contentType);
  }
}

function fallbackContentPreview(brand, contentType) {
  const { CONTENT_TEMPLATES } = require("../utils/contentTemplates");
  const templates = CONTENT_TEMPLATES[contentType] || CONTENT_TEMPLATES["Food & Drink"];
  return templates[0];
}

/**
 * Generate content request suggestions based on a brand's profile.
 * Falls back to template-based suggestions.
 */
async function generateRequestSuggestions(brandProfile) {
  if (!openai) {
    return fallbackRequestSuggestions(brandProfile);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are a UGC content strategist for food & hospitality brands. Given this brand profile, suggest 3 content request ideas.

Brand: ${brandProfile.businessName}
Neighborhood: ${brandProfile.neighborhood || "Chicago"}
Vibe: ${JSON.stringify(brandProfile.vibe || [])}
Cuisine: ${JSON.stringify(brandProfile.cuisineTypes || [])}
Values: ${JSON.stringify(brandProfile.values || [])}

Return a JSON array of 3 objects, each with:
{
  "contentType": "EXACTLY one of: Ambiance / Interior, Food & Drink, Community / Culture, Behind the Scenes, Seasonal Special",
  "contentGoal": "EXACTLY one of: Menu item spotlight, Atmosphere / ambiance, Signature dish, Neighborhood vibe, Community moment",
  "subject": "specific subject to photograph/film",
  "creativeDirection": "1-2 sentence creative direction",
  "deliverables": "one of: 3 photos + 1 Reel (15s), 4 photos + 1 Story set, 3 photos + 1 Reel (20s), 2 Reels + 3 Stories",
  "title": "catchy 3-5 word title for this idea"
}

Only return the JSON array.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    // AI may wrap the array in various keys — extract the array
    const suggestions = Array.isArray(result)
      ? result
      : result.suggestions || result.contentRequests || Object.values(result).find(Array.isArray) || [];
    return suggestions;
  } catch (err) {
    console.warn("[AI] generateRequestSuggestions failed:", err.message);
    return fallbackRequestSuggestions(brandProfile);
  }
}

function fallbackRequestSuggestions(brandProfile) {
  const name = brandProfile.businessName || "your spot";
  const cuisine = (brandProfile.cuisineTypes || [])[0] || "signature";
  const vibe = (brandProfile.vibe || [])[0] || "unique";

  return [
    {
      title: "Signature Dish Spotlight",
      contentType: "Food & Drink",
      contentGoal: "Menu item spotlight",
      subject: `${cuisine} signature dish at ${name}`,
      creativeDirection: `Warm, close-up shots that highlight texture and presentation. Natural light preferred, styled with the ${vibe.toLowerCase()} atmosphere of the space.`,
      deliverables: "3 photos + 1 Reel (15s)",
    },
    {
      title: "Golden Hour Ambiance",
      contentType: "Interior & Ambiance",
      contentGoal: "Atmosphere / ambiance",
      subject: `Evening atmosphere at ${name}`,
      creativeDirection: "Capture the mood during golden hour or soft evening light. Focus on details that make the space feel inviting — lighting, textures, seating areas.",
      deliverables: "4 photos + 1 Story set",
    },
    {
      title: "Behind the Counter",
      contentType: "Behind the Scenes",
      contentGoal: "Community moment",
      subject: `Kitchen prep and team energy at ${name}`,
      creativeDirection: "Documentary-style, candid moments of the team in action. Show the craft and care that goes into each dish. Keep it real and unscripted.",
      deliverables: "3 photos + 1 Reel (20s)",
    },
  ];
}

/**
 * Analyze a brand from Google Places structured data.
 * Returns a complete brand profile pre-fill.
 * Falls back to template-based analysis when API keys are missing.
 */
async function analyzeBrandFromPlaceData(placeData) {
  if (!openai) {
    return fallbackPlaceAnalysis(placeData);
  }

  try {
    const { name, address, types, rating, reviews, photoUrls } = placeData;

    // Sort reviews by length (descriptive ones first) and take up to 10
    const sortedReviews = (reviews || [])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .slice(0, 10);

    const prompt = `You are a creative director building brand profiles for a hyperlocal UGC content marketplace. Your job is to analyze real Google Places data and distill it into an actionable brand identity that helps match creators to businesses.

## INPUT DATA
- Business: ${name}
- Address: ${address || "Unknown"}
- Google Place Types: ${JSON.stringify(types || [])}
- Rating: ${rating || "N/A"}
- Reviews (${sortedReviews.length}): ${JSON.stringify(sortedReviews)}
- Number of Google Photos: ${(photoUrls || []).length}

## STEP 1: EXTRACT SIGNAL
Before generating the profile, analyze the reviews for:
- Descriptive language about atmosphere/ambiance (lighting, noise, decor, music)
- Recurring themes (date night, study spot, brunch crowd, family-friendly)
- Standout menu items or signature offerings
- Staff/service mentions
- Negative patterns or complaints

List 5-8 key observations as bullet points in the "extractedSignal" field.

## STEP 2: GENERATE BRAND PROFILE
Based ONLY on the extracted signal and place data (not assumptions), return this JSON:

{
  "extractedSignal": ["5-8 bullet point observations from the reviews"],
  "businessName": "string",
  "neighborhood": "string — if Chicago area, use: Evanston, Rogers Park, Wicker Park, Logan Square, West Loop, Hyde Park, Lincoln Park, Uptown, Andersonville, Pilsen, Bucktown, Old Town, Lakeview, River North, Chinatown, Bridgeport, Ukrainian Village. Otherwise use actual neighborhood.",
  "vibe": ["2-3 tags from: Cozy & Warm, Minimalist & Clean, Energetic & Bold, Rustic & Raw, Polished & Editorial, Moody & Intimate, Bright & Airy, Eclectic & Curated, Neighborhood Staple, Fast & Functional"],
  "values": ["2-3 from: Community-first, Sustainability, Quality-obsessed, Inclusive, Design-forward, Heritage & Tradition, Innovation, Hospitality-driven, Locally-sourced, Creator-friendly"],
  "contentComfortZones": ["2-3 from: Ambiance / Interior, Food & Drink Close-ups, Staff & Culture, Community / Events, Behind the Scenes, Plating & Presentation, Street View / Exterior, Seasonal Specials"],
  "vibeScales": {
    "cozyEnergetic": 0-100,
    "quietBuzzy": 0-100,
    "classicModern": 0-100,
    "casualElevated": 0-100,
    "hiddenGemPopular": 0-100
  },
  "guestExperienceKeywords": ["3-5 lowercase keywords derived directly from review language"],
  "cuisineTypes": ["1-3 cuisine types"],
  "budgetMin": number (suggested min budget per content piece in dollars, 100-500),
  "budgetMax": number (suggested max budget, 200-1000),
  "contentNoGos": "string — things a creator should NOT post about this place, based on negative review patterns or brand sensitivity",
  "vibeAnalysis": {
    "primaryVibe": "one-phrase summary that a creator could immediately understand",
    "aestheticTags": ["5 lowercase hyphenated tags e.g. warm-lighting, exposed-brick — must be visually specific"],
    "contentRecommendations": ["4 specific filmable shot/content ideas grounded in what reviewers actually mention — think 'slow pour latte art in morning light' not 'show the food'"],
    "avoidTags": ["3 content styles that would clash with this brand"],
    "reviewEvidence": ["2-3 short quoted phrases from reviews that justify your vibe analysis"]
  }
}

## RULES
- Every field must be justified by the input data. Do not infer vibes that contradict reviews.
- If reviews are sparse or generic, say so in contentNoGos and keep vibeScales near 50 (uncertain).
- aestheticTags should be visually specific (not generic like "nice-place").
- contentRecommendations should be filmable — a creator should read one and know exactly what shot to set up.
- Return ONLY the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    // Strip extractedSignal from the response (internal reasoning, not needed in profile)
    delete result.extractedSignal;
    return result;
  } catch (err) {
    console.warn("[AI] analyzeBrandFromPlaceData failed:", err.message);
    return fallbackPlaceAnalysis(placeData);
  }
}

function fallbackPlaceAnalysis(placeData) {
  const { name, address, types } = placeData || {};
  const typeList = types || [];

  // Map Google Place types to cuisine types
  const cuisineMap = {
    bakery: "Bakery & Pastry",
    cafe: "Coffee & Beverage",
    coffee_shop: "Coffee & Beverage",
    restaurant: "American",
    italian_restaurant: "Italian",
    mexican_restaurant: "Mexican",
    japanese_restaurant: "Japanese",
    thai_restaurant: "Thai",
    french_restaurant: "French",
    indian_restaurant: "Indian",
    korean_restaurant: "Korean",
    chinese_restaurant: "Chinese",
    vietnamese_restaurant: "Vietnamese",
    mediterranean_restaurant: "Mediterranean",
    pizza_restaurant: "Italian",
    bar: "American",
  };

  const cuisineTypes = [];
  for (const t of typeList) {
    if (cuisineMap[t] && !cuisineTypes.includes(cuisineMap[t])) {
      cuisineTypes.push(cuisineMap[t]);
    }
  }
  if (cuisineTypes.length === 0) cuisineTypes.push("American");

  // Guess neighborhood from address
  let neighborhood = "Evanston";
  const addressLower = (address || "").toLowerCase();
  const neighborhoods = ["Rogers Park", "Wicker Park", "Logan Square", "West Loop", "Hyde Park", "Lincoln Park", "Uptown", "Evanston"];
  for (const n of neighborhoods) {
    if (addressLower.includes(n.toLowerCase())) {
      neighborhood = n;
      break;
    }
  }

  const isCafe = typeList.some((t) => ["cafe", "coffee_shop", "bakery"].includes(t));

  return {
    businessName: name || "Your Business",
    neighborhood,
    vibe: isCafe ? ["Cozy & Warm", "Minimalist & Clean"] : ["Cozy & Warm", "Rustic & Raw"],
    values: ["Community-first", "Quality-obsessed"],
    contentComfortZones: ["Food & Drink", "Ambiance / Interior"],
    vibeScales: {
      cozyEnergetic: isCafe ? 30 : 50,
      quietBuzzy: isCafe ? 35 : 55,
      classicModern: 50,
      casualElevated: isCafe ? 40 : 50,
      hiddenGemPopular: 50,
    },
    guestExperienceKeywords: isCafe
      ? ["cozy", "welcoming", "neighborhood"]
      : ["warm", "authentic", "local"],
    cuisineTypes,
    budgetMin: 150,
    budgetMax: 400,
    contentNoGos: "",
    vibeAnalysis: {
      primaryVibe: isCafe ? "Cozy Neighborhood Cafe" : "Welcoming Local Spot",
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
 * Analyze a creator from scraped social media posts + profile.
 * Merges caption analysis with optional vision analysis.
 * Falls back to template-based analysis.
 */
async function analyzeCreatorFromSocial(posts, profile) {
  if (!openai) {
    return fallbackCreatorSocialAnalysis(posts, profile);
  }

  try {
    const captions = (posts || [])
      .map((p) => p.caption)
      .filter(Boolean)
      .slice(0, 12);
    const bio = profile?.bio || "";

    const prompt = `Analyze this content creator's social media presence for a hyperlocal UGC platform focused on food & beverage businesses.

Bio: "${bio}"
Recent post captions:
${captions.map((c, i) => `${i + 1}. "${c}"`).join("\n")}

Return a JSON object:
{
  "bio": "string - a polished 1-2 sentence bio suggestion based on their content",
  "contentStyles": ["3-4 from: Warm, Editorial, Documentary, Candid, Clean, Minimal, Bold, Energetic, Moody, Cinematic, Bright, Lifestyle"],
  "strengths": ["3-4 from: Food Photography, Reels/Short Video, Ambiance Shots, Lifestyle, Portraits, Behind the Scenes"],
  "neighborhoods": ["1-3 from: Evanston, Rogers Park, Wicker Park, Logan Square, West Loop, Hyde Park, Lincoln Park, Uptown"],
  "cuisineSpecialties": ["1-3 from: Italian, Mexican, Japanese, Thai, French, American, Mediterranean, Indian, Korean, Chinese, Vietnamese, Ethiopian, Middle Eastern, Bakery & Pastry, Coffee & Beverage, Farm-to-Table, Fusion"],
  "vibeTags": ["5-6 lowercase hyphenated aesthetic tags"],
  "qualityScore": 1-10
}

Only return the JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const textResult = JSON.parse(completion.choices[0].message.content);

    // Optionally merge with vision analysis if images available
    const imageUrls = (posts || [])
      .map((p) => p.imageUrl)
      .filter((url) => url && url.startsWith("http"))
      .slice(0, 4);

    if (imageUrls.length > 0) {
      try {
        const visionResult = await analyzeCreatorPortfolio(imageUrls);
        // Merge: prefer vision for styles/strengths if available
        return {
          ...textResult,
          contentStyles: visionResult.contentStyles || textResult.contentStyles,
          strengths: visionResult.strengths || textResult.strengths,
          vibeTags: visionResult.vibeTags || textResult.vibeTags,
          qualityScore: visionResult.qualityScore || textResult.qualityScore,
        };
      } catch {
        // Vision failed, use text analysis only
      }
    }

    return textResult;
  } catch (err) {
    console.warn("[AI] analyzeCreatorFromSocial failed:", err.message);
    return fallbackCreatorSocialAnalysis(posts, profile);
  }
}

function fallbackCreatorSocialAnalysis(posts, profile) {
  const bio = profile?.bio || "Creative content creator passionate about food and local businesses.";
  const captions = (posts || []).map((p) => (p.caption || "").toLowerCase()).join(" ");

  // Infer styles from caption keywords
  let contentStyles = ["Warm", "Editorial", "Candid"];
  if (captions.includes("minimal") || captions.includes("clean")) {
    contentStyles = ["Clean", "Minimal", "Warm"];
  } else if (captions.includes("bold") || captions.includes("energy")) {
    contentStyles = ["Bold", "Energetic", "Candid"];
  } else if (captions.includes("moody") || captions.includes("dark") || captions.includes("cinematic")) {
    contentStyles = ["Moody", "Cinematic", "Documentary"];
  }

  return {
    bio,
    contentStyles,
    strengths: ["Food Photography", "Ambiance Shots", "Lifestyle"],
    neighborhoods: ["Evanston", "Lincoln Park"],
    cuisineSpecialties: ["Coffee & Beverage", "American"],
    vibeTags: ["warm-tones", "authentic-moments", "local-vibes", "natural-light", "cozy-aesthetic"],
    qualityScore: 7,
  };
}

module.exports = {
  analyzeBrandFromUrl,
  analyzeBrandFromPlaceData,
  analyzeCreatorPortfolio,
  analyzeCreatorFromSocial,
  generateMatchRationale,
  generateContentPreview,
  generateRequestSuggestions,
};
