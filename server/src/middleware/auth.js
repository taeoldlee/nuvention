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

function requireOperatorWithBrand(req, res, next) {
  if (req.user.role !== "OPERATOR") {
    return res.status(403).json({ error: "Only operators can perform this action" });
  }
  if (!req.user.brandProfile) {
    return res.status(404).json({ error: "Brand profile not found. Complete onboarding first." });
  }
  req.brandProfile = req.user.brandProfile;
  next();
}

/**
 * Creator portal auth middleware.
 * Reads x-creator-token header, looks up project by creatorAccessToken.
 * Attaches project to req.creatorProject.
 */
async function requireCreatorToken(req, res, next) {
  try {
    const token = req.headers["x-creator-token"];

    if (!token) {
      return res.status(401).json({ error: "Creator access token required." });
    }

    const project = await prisma.project.findUnique({
      where: { creatorAccessToken: token },
      include: {
        application: { include: { brief: true } },
        brandProfile: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!project) {
      return res.status(401).json({ error: "Invalid or expired access token." });
    }

    req.creatorProject = project;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, optionalAuth, requireOperatorWithBrand, requireCreatorToken };
