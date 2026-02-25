const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");

router.use(requireAuth);

/**
 * GET /api/stats/brand
 * Dashboard stats for brands:
 * - Active briefs count
 * - Total applications received
 * - Active projects count
 * - Completed projects count
 */
router.get("/brand", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    // Active briefs (OPEN status)
    const activeBriefs = await prisma.brief.count({
      where: {
        brandProfileId: brandProfile.id,
        status: "OPEN",
      },
    });

    // Total applications across all briefs
    const totalApplications = await prisma.application.count({
      where: {
        brief: { brandProfileId: brandProfile.id },
      },
    });

    // Active projects (not completed/disputed)
    const activeProjects = await prisma.project.count({
      where: {
        brandProfileId: brandProfile.id,
        status: {
          in: [
            "AWAITING_CREATOR_ACCEPTANCE",
            "ACCEPTED",
            "IN_PROGRESS",
            "DRAFT_SUBMITTED",
            "REVISION_REQUESTED",
            "APPROVED",
          ],
        },
      },
    });

    // Completed projects
    const completedProjects = await prisma.project.count({
      where: {
        brandProfileId: brandProfile.id,
        status: "COMPLETED",
      },
    });

    // Total spent
    const transactions = await prisma.transaction.findMany({
      where: {
        project: { brandProfileId: brandProfile.id },
        status: "RELEASED",
      },
    });
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      activeBriefs,
      totalApplications,
      activeProjects,
      completedProjects,
      totalSpent,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
