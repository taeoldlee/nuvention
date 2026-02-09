const prisma = require("../config/db");
const { generateMatches } = require("./matching");

async function createRequestWithMatches(brandProfile, body) {
  const {
    contentType,
    description,
    brief,
    briefText,
    stylePreferences,
    budgetRange,
    contentGoal,
    subject,
    creativeDirection,
    deliverables,
    timeline,
    usageRights,
    briefTemplate,
    compensationType,
    compensationDetails,
  } = body;

  // Create the content request
  const contentRequest = await prisma.contentRequest.create({
    data: {
      brandProfileId: brandProfile.id,
      contentType,
      description: description || briefText || brief || null,
      stylePreferences: stylePreferences || null,
      budgetRange: budgetRange || null,
      contentGoal: contentGoal || null,
      subject: subject || null,
      creativeDirection: creativeDirection || null,
      deliverables: deliverables || null,
      timeline: timeline || null,
      usageRights: usageRights || null,
      briefTemplate: briefTemplate || null,
      compensationType: compensationType || "FLAT_FEE",
      compensationDetails: compensationDetails || null,
      status: "MATCHING",
    },
  });

  // Fetch all creator profiles for matching
  const allCreators = await prisma.creatorProfile.findMany({
    include: {
      portfolioItems: true,
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
      projects: {
        include: {
          brandProfile: {
            select: { id: true, neighborhood: true },
          },
        },
      },
    },
  });

  // Generate top 3 matches
  const matchResults = generateMatches(brandProfile, contentRequest, allCreators);

  // Save matches to DB
  for (const match of matchResults) {
    await prisma.match.create({
      data: {
        contentRequestId: contentRequest.id,
        creatorProfileId: match.creatorProfileId,
        matchScore: match.matchScore,
        matchRationale: match.matchRationale,
        matchSignals: match.matchSignals || undefined,
        matchInsights: match.matchInsights || undefined,
        contentPreview: match.contentPreview,
        deliverables: match.deliverables,
        price: match.price,
        timeline: match.timeline,
        usageRights: match.usageRights,
        style: match.style,
        status: "PRESENTED",
      },
    });
  }

  // Update request status
  await prisma.contentRequest.update({
    where: { id: contentRequest.id },
    data: { status: "PRESENTED" },
  });

  // Return the full request with anonymized matches
  return prisma.contentRequest.findUnique({
    where: { id: contentRequest.id },
    include: {
      matches: {
        include: {
          creatorProfile: {
            select: {
              portfolioItems: {
                select: { id: true, imageUrl: true, verified: true },
                take: 3,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
        orderBy: { matchScore: "desc" },
      },
    },
  });
}

module.exports = { createRequestWithMatches };
