const prisma = require("../config/db");

/**
 * Create a notification for a user.
 * @param {string} userId - The user to notify
 * @param {object} opts
 * @param {string} opts.type - BRIEF_RECEIVED, DRAFT_SUBMITTED, REVISION_REQUESTED, APPROVED, DELIVERED, MESSAGE
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {string} [opts.linkUrl]
 */
async function createNotification(userId, { type, title, body, linkUrl }) {
  return prisma.notification.create({
    data: { userId, type, title, body, linkUrl: linkUrl || null },
  });
}

module.exports = { createNotification };
