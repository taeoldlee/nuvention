export const VIBE_OPTIONS = [
  'Cozy & Warm',
  'Minimalist & Clean',
  'Energetic & Bold',
  'Rustic & Raw',
  'Polished & Editorial',
  'Moody & Intimate',
  'Bright & Airy',
  'Eclectic & Curated',
  'Neighborhood Staple',
  'Fast & Functional',
];

export const VALUE_OPTIONS = [
  'Community-first',
  'Sustainability',
  'Quality-obsessed',
  'Inclusive',
  'Design-forward',
  'Heritage & Tradition',
  'Innovation',
  'Hospitality-driven',
  'Locally-sourced',
  'Creator-friendly',
];

export const CONTENT_COMFORT_ZONES = [
  'Ambiance / Interior',
  'Food & Drink Close-ups',
  'Staff & Culture',
  'Community / Events',
  'Behind the Scenes',
  'Plating & Presentation',
  'Street View / Exterior',
  'Seasonal Specials',
];

export const CONTENT_STYLES = [
  'Warm',
  'Editorial',
  'Documentary',
  'Candid',
  'Clean',
  'Minimal',
  'Bold',
  'Energetic',
  'Moody',
  'Cinematic',
  'Bright',
  'Lifestyle',
];

export const CREATOR_STRENGTHS = [
  'Food Photography',
  'Reels/Short Video',
  'Ambiance Shots',
  'Lifestyle',
  'Portraits',
  'Behind the Scenes',
];

export const NEIGHBORHOODS = [
  'Evanston',
  'Rogers Park',
  'Wicker Park',
  'Logan Square',
  'West Loop',
  'Hyde Park',
  'Lincoln Park',
  'Uptown',
  'Andersonville',
  'Pilsen',
  'Bucktown',
  'Old Town',
  'Lakeview',
  'River North',
  'Chinatown',
  'Bridgeport',
  'Ukrainian Village',
];

export const VIBE_SCALES = [
  { key: 'cozyEnergetic', left: 'Cozy', right: 'Energetic' },
  { key: 'quietBuzzy', left: 'Quiet', right: 'Buzzy' },
  { key: 'classicModern', left: 'Classic', right: 'Modern' },
  { key: 'casualElevated', left: 'Casual', right: 'Elevated' },
  { key: 'hiddenGemPopular', left: 'Hidden Gem', right: 'Popular Spot' },
];

export const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Japanese', 'Thai', 'French', 'American',
  'Mediterranean', 'Indian', 'Korean', 'Chinese', 'Vietnamese',
  'Ethiopian', 'Middle Eastern', 'Bakery & Pastry', 'Coffee & Beverage',
  'Farm-to-Table', 'Fusion',
];

export const CONTENT_TYPES = [
  'Ambiance / Interior',
  'Food & Drink',
  'Community / Culture',
  'Behind the Scenes',
  'Seasonal Special',
];

export const PROJECT_STATUS_LABELS = {
  BRIEF_SENT: 'Brief Sent',
  DRAFT_SUBMITTED: 'Draft Submitted',
  REVISION_REQUESTED: 'Revision Requested',
  APPROVED: 'Approved',
  DELIVERED: 'Delivered',
};

export const PROJECT_STATUS_STEPS = [
  'BRIEF_SENT',
  'DRAFT_SUBMITTED',
  'REVISION_REQUESTED',
  'APPROVED',
  'DELIVERED',
];

export const REQUEST_STATUS_LABELS = {
  MATCHING: 'Matching',
  PRESENTED: 'Options Ready',
  SELECTED: 'Creator Selected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function formatCents(cents) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatCompensation(type, details, fallbackPrice) {
  if (type === 'FREE_PRODUCT') {
    return details?.note ? `Free product: ${details.note}` : 'Free product/meal';
  }
  if (type === 'DISCOUNT_CODE') {
    return details?.note ? `Discount: ${details.note}` : 'Discount code';
  }
  if (type === 'HYBRID') {
    const cash = details?.minCents ? `${formatCents(details.minCents)}+` : 'Cash +';
    const note = details?.note ? details.note : 'product/benefit';
    return `${cash} ${note}`;
  }
  if (type === 'COMMISSION') {
    return details?.note ? `Commission: ${details.note}` : 'Commission-based';
  }
  if (type === 'COUPON_CODE') {
    return details?.note ? `Coupon: ${details.note}` : 'Coupon code';
  }
  if (type === 'BONUS') {
    return details?.note ? `Bonus: ${details.note}` : 'Performance bonus';
  }
  if (details?.minCents && details?.maxCents) {
    return `${formatCents(details.minCents)} - ${formatCents(details.maxCents)}`;
  }
  if (fallbackPrice != null) return formatCents(fallbackPrice);
  return 'Flat fee';
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseRightsDuration(rights) {
  if (!rights) return 12;
  const match = rights.match(/(\d+)\s*(month|year)/i);
  if (!match) return 12;
  return match[2].toLowerCase().startsWith('year') ? parseInt(match[1]) * 12 : parseInt(match[1]);
}

export function formatRelativeDate(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}
