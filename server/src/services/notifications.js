const prisma = require("../config/db");

/**
 * Create a notification for a user (brand).
 * @param {string} userId - The user to notify
 * @param {object} opts
 * @param {string} opts.type - Notification type
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {string} [opts.linkUrl]
 */
async function createNotification(userId, { type, title, body, linkUrl }) {
  return prisma.notification.create({
    data: { userId, type, title, body, linkUrl: linkUrl || null },
  });
}

/**
 * Create a notification for a creator (no user account — email-based).
 * In v1 demo, this just logs. In v2, this would send an email.
 * @param {string} email - Creator's contact email
 * @param {object} opts
 */
async function createCreatorNotification(email, { type, title, body, linkUrl }) {
  console.log(`[Notification] Creator email notification: to=${email} type=${type} title="${title}"`);
  // Store in DB with null userId for tracking
  return prisma.notification.create({
    data: { userId: null, email, type, title, body, linkUrl: linkUrl || null },
  });
}

module.exports = { createNotification, createCreatorNotification };
