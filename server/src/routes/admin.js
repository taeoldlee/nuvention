const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");

/**
 * POST /api/admin/reseed
 * Re-runs the seed script to reset all demo data to its starting state.
 * Requires ADMIN role. Disabled entirely in production.
 */
router.post("/reseed", requireAuth, requireAdmin, async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Reseed is disabled in production." });
  }

  try {
    console.log("[Admin] Reseed requested — running seed script...");

    // Import the seed main() function (uses its own PrismaClient)
    const { main } = require("../../prisma/seed");
    await main();

    console.log("[Admin] Reseed completed successfully.");
    res.json({ success: true, message: "Demo data has been reset." });
  } catch (err) {
    console.error("[Admin] Reseed failed:", err);
    next(err);
  }
});

module.exports = router;
