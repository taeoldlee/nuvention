const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

let reseedInProgress = false;

/**
 * POST /api/admin/reseed
 * Re-runs the seed script to reset all demo data to its starting state.
 * Requires authentication (any demo user).
 */
router.post("/reseed", requireAuth, async (req, res, next) => {
  if (reseedInProgress) {
    return res.status(409).json({ error: "A reseed is already in progress. Please wait." });
  }

  reseedInProgress = true;
  try {
    console.log("[Admin] Reseed requested — running seed script...");

    // Clear the require cache so the seed script runs fresh each time
    delete require.cache[require.resolve("../../prisma/seed")];
    const { main } = require("../../prisma/seed");
    await main();

    console.log("[Admin] Reseed completed successfully.");
    res.json({ success: true, message: "Demo data has been reset." });
  } catch (err) {
    console.error("[Admin] Reseed failed:", err);
    next(err);
  } finally {
    reseedInProgress = false;
  }
});

module.exports = router;
