const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { createNotification } = require("../services/notifications");

router.use(requireAuth);

/** GET /api/projects/:projectId/messages */
router.get("/:projectId/messages", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        brandProfile: { select: { userId: true } },
        creatorProfile: { select: { userId: true } },
      },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const isParty =
      project.brandProfile.userId === req.user.id ||
      project.creatorProfile.userId === req.user.id;
    if (!isParty) return res.status(403).json({ error: "Access denied" });

    const messages = await prisma.message.findMany({
      where: { projectId: req.params.projectId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

/** POST /api/projects/:projectId/messages */
router.post("/:projectId/messages", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        brandProfile: { select: { userId: true } },
        creatorProfile: { select: { userId: true } },
      },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const isParty =
      project.brandProfile.userId === req.user.id ||
      project.creatorProfile.userId === req.user.id;
    if (!isParty) return res.status(403).json({ error: "Access denied" });

    const message = await prisma.message.create({
      data: {
        projectId: req.params.projectId,
        userId: req.user.id,
        text: text.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });

    // Notify the other party
    const otherUserId =
      project.brandProfile.userId === req.user.id
        ? project.creatorProfile.userId
        : project.brandProfile.userId;

    createNotification(otherUserId, {
      type: "MESSAGE",
      title: `New message from ${req.user.name}`,
      body: text.trim().slice(0, 100),
      linkUrl:
        project.brandProfile.userId === otherUserId
          ? `/operator/project/${project.id}`
          : `/creator/project/${project.id}`,
    }).catch(() => {});

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
