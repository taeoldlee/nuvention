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
  "neighborhood": "string",
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
  "contentStyles": ["2-3 style descriptors from: Warm & Editorial, Bold & Vibrant, Documentary & Raw, Minimalist & Clean, Dark & Moody, Bright & Airy, Cinematic, Lifestyle & Candid"],
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
    contentStyles: ["Warm & Editorial", "Lifestyle & Candid"],
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
Creator: ${creator.displayName} (Styles: ${JSON.stringify(creator.contentStyles)}, Strengths: ${JSON.stringify(creator.strengths)})
Content type: ${contentType}
Match score: ${matchScore}/100

Be specific about why this creator is a great fit. Keep it conversational and confident. Return only the rationale text, no JSON.`,
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

  return `${creator.displayName}'s ${style.toLowerCase()} style is a natural fit for ${brand.businessName}'s ${vibe.toLowerCase()} aesthetic. Their expertise in ${contentType.toLowerCase()} content will authentically capture what makes your space special.`;
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
          content: `Write a brief content preview (2-3 sentences) describing what UGC content this creator would produce.

Brand: ${brand.businessName} (Vibes: ${JSON.stringify(brand.vibe)})
Creator: ${creator.displayName} (Styles: ${JSON.stringify(creator.contentStyles)})
Content type: ${contentType}

Describe the specific photos and Reel they would create. Be vivid and specific to this brand. Return only the preview text.`,
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

module.exports = {
  analyzeBrandFromUrl,
  analyzeCreatorPortfolio,
  generateMatchRationale,
  generateContentPreview,
  generateRequestSuggestions,
};
