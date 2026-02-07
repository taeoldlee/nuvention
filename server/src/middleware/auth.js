const prisma = require("../config/db");

/**
 * Required auth middleware.
 * Reads x-user-id header, looks up user, attaches to req.user.
 * Returns 401 if header is missing or user is not found.
 */
async function requireAuth(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ error: "Authentication required. Provide x-user-id header." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brandProfile: true,
        creatorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional auth middleware.
 * If x-user-id header is present, looks up user and attaches to req.user.
 * If not present, continues without error.
 */
async function optionalAuth(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          brandProfile: true,
          creatorProfile: true,
        },
      });
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, optionalAuth };
