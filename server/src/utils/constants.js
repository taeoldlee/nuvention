// ─── Shared Constants for Locale v2 ───

const VIBE_OPTIONS = [
  "Cozy & Warm",
  "Minimalist & Clean",
  "Rustic & Raw",
  "Polished & Editorial",
  "Energetic & Bold",
  "Dark & Moody",
  "Bright & Playful",
  "Industrial & Urban",
];

const VALUE_OPTIONS = [
  "Community-first",
  "Sustainability",
  "Quality-obsessed",
  "Design-forward",
  "Inclusive",
  "Local-sourcing",
  "Innovation",
  "Tradition & Heritage",
];

const CONTENT_COMFORT_ZONES = [
  "Ambiance / Interior",
  "Food & Drink",
  "Community / Culture",
  "Behind the Scenes",
  "Seasonal Special",
  "Staff & Culture",
  "Customer Stories",
];

const CONTENT_STYLE_TAGS = [
  "Clean",
  "Minimalist",
  "Cinematic",
  "Candid",
  "Bright",
  "Moody",
  "Documentary",
  "Lifestyle",
  "Editorial",
  "Raw",
  "Playful",
];

const NEIGHBORHOODS = [
  "Evanston",
  "Logan Square",
  "Wicker Park",
  "Lincoln Park",
  "Andersonville",
  "Pilsen",
  "Hyde Park",
  "West Loop",
  "Ravenswood",
  "Bucktown",
  "Old Town",
  "Lakeview",
];

const CAMPAIGN_GOALS = [
  { value: "EVENT_PROMO", label: "Event Promo" },
  { value: "MENU_LAUNCH", label: "Menu Launch" },
  { value: "SEASONAL_SPECIAL", label: "Seasonal Special" },
  { value: "GENERAL_CONTENT", label: "General Content" },
  { value: "GRAND_OPENING", label: "Grand Opening" },
  { value: "SLOW_PERIOD_FILL", label: "Slow Period Fill" },
];

const CONTENT_TYPES = [
  "REEL",
  "CAROUSEL",
  "STORY",
  "TIKTOK",
  "PHOTO_SET",
  "BLOG_POST",
];

const COMPENSATION_TYPES = [
  { value: "FREE_PRODUCT", label: "Free Product" },
  { value: "FLAT_FEE", label: "Flat Fee" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "COMMISSION", label: "Commission" },
];

const USAGE_RIGHTS_OPTIONS = [
  { value: "ORGANIC_SOCIAL", label: "Organic Social Only" },
  { value: "PAID_ADS", label: "Paid Ads" },
  { value: "IN_STORE", label: "In-Store" },
  { value: "WEBSITE", label: "Website" },
  { value: "ALL", label: "All" },
];

const LOCATION_REQUIREMENTS = [
  { value: "IN_PERSON", label: "Must Visit In Person" },
  { value: "REMOTE", label: "Remote OK" },
  { value: "FLEXIBLE", label: "Flexible" },
];

const CREATOR_PLATFORMS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "REDNOTE", label: "RedNote" },
  { value: "OTHER", label: "Other" },
];

// Platform fee: 10% on every completed transaction
const PLATFORM_FEE_RATE = 0.10;

module.exports = {
  VIBE_OPTIONS,
  VALUE_OPTIONS,
  CONTENT_COMFORT_ZONES,
  CONTENT_STYLE_TAGS,
  NEIGHBORHOODS,
  CAMPAIGN_GOALS,
  CONTENT_TYPES,
  COMPENSATION_TYPES,
  USAGE_RIGHTS_OPTIONS,
  LOCATION_REQUIREMENTS,
  CREATOR_PLATFORMS,
  PLATFORM_FEE_RATE,
};
