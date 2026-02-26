const prisma = require("../config/db");
const { createNotification } = require("./notifications");

/**
 * Find all OPEN briefs whose deadline has passed and transition them to CLOSED.
 * Sends a notification to the brand owner for each auto-closed brief.
 * This is called on-access (not a background job) to keep things simple.
 *
 * @returns {number} The number of briefs that were auto-closed.
 */
async function closeExpiredBriefs() {
  const now = new Date();

  const expiredBriefs = await prisma.brief.findMany({
    where: {
      status: "OPEN",
      deadline: { lt: now },
    },
    include: {
      brandProfile: {
        select: { userId: true, businessName: true },
      },
    },
  });

  if (expiredBriefs.length === 0) return 0;

  let closed = 0;
  for (const brief of expiredBriefs) {
    // Use updateMany with status guard so only one concurrent caller transitions the brief
    const result = await prisma.brief.updateMany({
      where: { id: brief.id, status: "OPEN" },
      data: { status: "CLOSED", closedAt: now },
    });

    if (result.count === 0) continue; // Another request already closed it
    closed++;

    // Notify the brand owner
    if (brief.brandProfile?.userId) {
      await createNotification(brief.brandProfile.userId, {
        type: "BRIEF_AUTO_CLOSED",
        title: "Brief deadline passed",
        body: `Your brief "${brief.title}" has been automatically closed because its deadline has passed.`,
        linkUrl: `/briefs/${brief.id}`,
      });
    }
  }

  if (closed > 0) {
    console.log(`[BriefExpiry] Auto-closed ${closed} expired brief(s)`);
  }

  return closed;
}

module.exports = { closeExpiredBriefs };
