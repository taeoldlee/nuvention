const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");

router.use(requireAuth);

/**
 * GET /api/transactions
 * List all transactions for the brand with project/brief/creator info.
 */
router.get("/", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const transactions = await prisma.transaction.findMany({
      where: {
        project: { brandProfileId: brandProfile.id },
      },
      include: {
        project: {
          select: {
            id: true,
            status: true,
            price: true,
            completedAt: true,
            createdAt: true,
            application: {
              select: {
                creatorName: true,
                creatorHandle: true,
                brief: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary stats
    const totalSpent = transactions
      .filter((t) => t.status === "RELEASED")
      .reduce((sum, t) => sum + t.amount, 0);

    const inEscrow = transactions
      .filter((t) => t.status === "ESCROW_HELD")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      transactions,
      summary: {
        totalSpent,
        inEscrow,
        totalTransactions: transactions.length,
        releasedCount: transactions.filter((t) => t.status === "RELEASED").length,
        heldCount: transactions.filter((t) => t.status === "ESCROW_HELD").length,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/transactions/:id
 * Single transaction detail.
 */
router.get("/:id", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        project: { brandProfileId: brandProfile.id },
      },
      include: {
        project: {
          select: {
            id: true,
            status: true,
            price: true,
            completedAt: true,
            createdAt: true,
            application: {
              select: {
                creatorName: true,
                creatorHandle: true,
                brief: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ transaction });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
