/**
 * Generate a usage rights document for a project.
 */
function generateUsageRightsDoc({ businessName, contentType, usageRights, timeline }) {
  const brand = businessName || "Brand";
  const rights = usageRights || "Organic social + in-store, 12 months";
  const timing = timeline || "Standard timeline";
  return [
    `Usage Rights Agreement`,
    `Brand: ${brand}`,
    `Content Type: ${contentType || "UGC content"}`,
    `Rights: ${rights}`,
    `Timeline: ${timing}`,
    `This agreement grants the brand non-exclusive usage rights as specified above.`,
  ].join("\n");
}

module.exports = { generateUsageRightsDoc };
