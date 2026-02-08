export default function useBriefDisplayData(brief) {
  if (!brief) return {};

  const contentType =
    brief.contentRequest?.contentType ||
    brief.contentType ||
    brief.request?.contentType ||
    'Content Project';
  const styleDirection =
    brief.style ||
    brief.styleDirection ||
    brief.request?.styleDirection ||
    brief.request?.vibe ||
    '';
  const deliverables = brief.deliverables || brief.request?.deliverables || [];
  const pay = brief.price ?? brief.pay ?? brief.request?.budget ?? brief.budget ?? 0;
  const compensationType = brief.compensationType || brief.request?.compensationType || 'FLAT_FEE';
  const compensationDetails = brief.compensationDetails || brief.request?.compensationDetails || null;
  const timeline = brief.timeline || brief.request?.timeline || '';
  const usageRights =
    brief.usageRights || brief.request?.usageRights || '100% usage rights included';
  const matchRationale =
    brief.matchRationale ||
    brief.rationale ||
    'Matched based on your style, neighborhood, and portfolio.';
  const matchSignals = brief.matchSignals || null;

  const neighborhood =
    brief.brand?.neighborhood ||
    brief.neighborhood ||
    brief.request?.neighborhood ||
    '';
  const brandVibe =
    brief.brand?.vibe?.[0] || brief.brandVibe || brief.request?.vibe || '';
  const brandValues = brief.brandValues || brief.brand?.values?.[0] || '';
  const identityHints = [neighborhood, brandVibe, brandValues]
    .filter(Boolean)
    .join(' \u00B7 ');

  return {
    contentType, styleDirection, deliverables, pay,
    compensationType, compensationDetails, timeline, usageRights,
    matchRationale, matchSignals, identityHints,
  };
}
