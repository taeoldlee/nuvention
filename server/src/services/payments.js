// ─── Payment Service for Mise ───
// Demo mode: all transactions are recorded in the database only.
// Production mode would integrate with Stripe.

const prisma = require("../config/db");
const { PLATFORM_FEE_RATE } = require("../utils/constants");

/**
 * Create a commission charge for a project.
 * In demo mode, this just records the transaction in the DB.
 *
 * @param {string} projectId
 * @param {number} amount - Total amount in cents
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
      type: "COMMISSION",
      status: "PENDING",
      escrowStatus: "HELD",
      demoMode: true,
    },
  });

  return transaction;
}

/**
 * Create a payout record for the creator.
 * In demo mode, this just records the transaction in the DB.
 *
 * @param {string} projectId
 * @param {number} creatorPayout - Payout amount in cents
 * @returns {Object} Transaction record
 */
async function createPayout(projectId, creatorPayout) {
  // In production, this would trigger a Stripe Transfer
  // For demo mode, we just update the existing transaction status

  const existingTransaction = await prisma.transaction.findUnique({
    where: { projectId },
  });

  if (existingTransaction) {
    const updated = await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: { status: "COMPLETED", escrowStatus: "RELEASED" },
    });
    return updated;
  }

  // If no existing transaction, create a payout record
  const transaction = await prisma.transaction.create({
    data: {
      projectId,
      amount: creatorPayout,
      platformFee: 0,
      creatorPayout,
      type: "PAYOUT",
      status: "COMPLETED",
      escrowStatus: "RELEASED",
      demoMode: true,
    },
  });

  return transaction;
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
