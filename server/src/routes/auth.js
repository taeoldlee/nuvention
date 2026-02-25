const express = require("express");
const router = express.Router();
const prisma = require("../config/db");

/**
 * GET /api/auth/demo-users
 * List all demo users with their profiles.
 */
router.get("/demo-users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDemo: true },
      include: {
        brandProfile: true,
        agencyProfile: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/demo-login
 * Body: { userId }
 * Returns user with brand profile.
 */
router.post("/demo-login", async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brandProfile: true,
        agencyProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = user.brandProfile || user.agencyProfile || null;
    res.json({ user, profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
