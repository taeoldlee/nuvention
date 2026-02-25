// ─── Payment Service for Locale v2 ───
// Demo mode: all transactions are recorded in the database only.
// Production mode would integrate with Stripe Connect.

const prisma = require("../config/db");
const { PLATFORM_FEE_RATE } = require("../utils/constants");

/**
 * Create an escrow hold for a project.
 * Called when creator accepts a project.
 * In demo mode, this just records the transaction in the DB.
 *
 * @param {string} projectId
 * @param {number} amount - Total amount in cents (what brand pays)
 * @returns {Object} Transaction record
 */
async function createCharge(projectId, amount) {
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  const creatorPayout = amount - platformFee;

  const transaction = await prisma.transaction.create({
    data: {
      projectId,
      amount,
      platformFee,
      creatorPayout,
      status: "ESCROW_HELD",
      escrowStatus: "HELD",
      demoMode: true,
    },
  });

  return transaction;
}

/**
 * Release escrow to creator.
 * Called when brand approves content and completes project.
 *
 * @param {string} projectId
 * @returns {Object} Transaction record
 */
async function createPayout(projectId) {
  const existingTransaction = await prisma.transaction.findUnique({
    where: { projectId },
  });

  if (existingTransaction) {
    const updated = await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: { status: "RELEASED", escrowStatus: "RELEASED" },
    });
    return updated;
  }

  return null;
}

/**
 * Calculate the fee breakdown for a given amount.
 */
function calculateFees(amount) {
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  const creatorPayout = amount - platformFee;
  return { amount, platformFee, creatorPayout };
}

module.exports = {
  createCharge,
  createPayout,
  calculateFees,
};
