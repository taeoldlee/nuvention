const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireCreatorToken } = require("../middleware/auth");

/**
 * GET /api/projects/:projectId/messages
 * Get project messages. Available to brand (via auth) or creator (via token).
 */
router.get("/:projectId/messages", async (req, res, next) => {
  try {
    // Try brand auth first
    const userId = req.headers["x-user-id"];
    const creatorToken = req.headers["x-creator-token"];

    let project;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { brandProfile: true },
      });
      if (!user) return res.status(401).json({ error: "User not found" });

      project = await prisma.project.findUnique({
        where: { id: req.params.projectId },
      });
      if (!project) return res.status(404).json({ error: "Project not found" });

      if (user.brandProfile && project.brandProfileId === user.brandProfile.id) {
        // Authorized as brand
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (creatorToken) {
      project = await prisma.project.findUnique({
        where: { creatorAccessToken: creatorToken },
      });
      if (!project || project.id !== req.params.projectId) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else {
      return res.status(401).json({ error: "Authentication required" });
    }

    const messages = await prisma.message.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:projectId/messages
 * Send a message. Available to brand (via auth) or creator (via token).
 */
router.post("/:projectId/messages", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const userId = req.headers["x-user-id"];
    const creatorToken = req.headers["x-creator-token"];

    let project;
    let senderType;
    let senderName;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { brandProfile: true },
      });
      if (!user) return res.status(401).json({ error: "User not found" });

      project = await prisma.project.findUnique({
        where: { id: req.params.projectId },
      });
      if (!project) return res.status(404).json({ error: "Project not found" });

      if (user.brandProfile && project.brandProfileId === user.brandProfile.id) {
        senderType = "BRAND";
        senderName = user.name;
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (creatorToken) {
      project = await prisma.project.findUnique({
        where: { creatorAccessToken: creatorToken },
      });
      if (!project || project.id !== req.params.projectId) {
        return res.status(403).json({ error: "Access denied" });
      }
      senderType = "CREATOR";
      senderName = project.creatorName;
    } else {
      return res.status(401).json({ error: "Authentication required" });
    }

    const message = await prisma.message.create({
      data: {
        projectId: req.params.projectId,
        senderType,
        senderName,
        text: text.trim(),
      },
    });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
