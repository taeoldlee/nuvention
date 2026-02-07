const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/stats/operator
 * Dashboard stats for operators:
 * - Active projects count
 * - Content library count (delivered projects)
 * - Posting rate (percentage of delivered content used)
 */
router.get("/operator", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can access operator stats" });
    }

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile) {
      return res.json({
        activeProjects: 0,
        contentLibrary: 0,
        postingRate: 0,
        totalSpent: 0,
        pendingRequests: 0,
      });
    }

    // Active projects (not delivered/cancelled)
    const activeProjects = await prisma.project.count({
      where: {
        brandProfileId: brandProfile.id,
        status: { in: ["BRIEF_SENT", "DRAFT_SUBMITTED", "REVISION_REQUESTED", "APPROVED"] },
      },
    });

    // Content library (delivered projects)
    const contentLibrary = await prisma.project.count({
      where: {
        brandProfileId: brandProfile.id,
        status: "DELIVERED",
      },
    });

    // Total delivered drafts (approved drafts across all delivered projects)
    const deliveredProjects = await prisma.project.findMany({
      where: {
        brandProfileId: brandProfile.id,
        status: "DELIVERED",
      },
      include: {
        drafts: {
          where: { status: "APPROVED" },
        },
      },
    });

    const totalApprovedDrafts = deliveredProjects.reduce(
      (sum, p) => sum + p.drafts.length,
      0
    );

    // Posting rate: ratio of delivered to total projects (simplified metric)
    const totalProjects = await prisma.project.count({
      where: { brandProfileId: brandProfile.id },
    });
    const postingRate = totalProjects > 0 ? Math.round((contentLibrary / totalProjects) * 100) : 0;

    // Total spent
    const transactions = await prisma.transaction.findMany({
      where: {
        project: { brandProfileId: brandProfile.id },
        type: "COMMISSION",
        status: "COMPLETED",
      },
    });
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Pending requests
    const pendingRequests = await prisma.contentRequest.count({
      where: {
        brandProfileId: brandProfile.id,
        status: { in: ["MATCHING", "PRESENTED"] },
      },
    });

    res.json({
      activeProjects,
      contentLibrary,
      postingRate,
      totalSpent,
      totalApprovedDrafts,
      pendingRequests,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/creator
 * Dashboard stats for creators:
 * - Monthly earnings
 * - Active projects count
 * - New brief count
 */
router.get("/creator", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can access creator stats" });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile) {
      return res.json({
        monthlyEarnings: 0,
        activeProjects: 0,
        newBriefs: 0,
        totalEarnings: 0,
        completedProjects: 0,
      });
    }

    // Active projects
    const activeProjects = await prisma.project.count({
      where: {
        creatorProfileId: creatorProfile.id,
        status: { in: ["BRIEF_SENT", "DRAFT_SUBMITTED", "REVISION_REQUESTED", "APPROVED"] },
      },
    });

    // New briefs (matches presented to this creator)
    const newBriefs = await prisma.match.count({
      where: {
        creatorProfileId: creatorProfile.id,
        status: { in: ["PRESENTED", "SELECTED"] },
      },
    });

    // Monthly earnings (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        project: { creatorProfileId: creatorProfile.id },
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
    });
    const monthlyEarnings = monthlyTransactions.reduce((sum, t) => sum + t.creatorPayout, 0);

    // Total earnings (all time)
    const allTransactions = await prisma.transaction.findMany({
      where: {
        project: { creatorProfileId: creatorProfile.id },
        status: "COMPLETED",
      },
    });
    const totalEarnings = allTransactions.reduce((sum, t) => sum + t.creatorPayout, 0);

    // Completed projects
    const completedProjects = await prisma.project.count({
      where: {
        creatorProfileId: creatorProfile.id,
        status: "DELIVERED",
      },
    });

    res.json({
      monthlyEarnings,
      activeProjects,
      newBriefs,
      totalEarnings,
      completedProjects,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
