const express = require("express");
const router = express.Router();

/**
 * POST /api/admin/reseed
 * Re-runs the seed script to reset all demo data to its starting state.
 * No auth required — this is a demo-only admin endpoint.
 */
router.post("/reseed", async (req, res, next) => {
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
