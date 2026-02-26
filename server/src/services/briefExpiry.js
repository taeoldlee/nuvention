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

  for (const brief of expiredBriefs) {
    await prisma.brief.update({
      where: { id: brief.id },
      data: { status: "CLOSED", closedAt: now },
    });

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

  console.log(
    `[BriefExpiry] Auto-closed ${expiredBriefs.length} expired brief(s)`
  );

  return expiredBriefs.length;
}

module.exports = { closeExpiredBriefs };
