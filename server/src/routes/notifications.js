const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

/** GET /api/notifications — user's notifications, newest first */
router.get("/", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

/** GET /api/notifications/unread-count */
router.get("/unread-count", async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

/** POST /api/notifications/read-all — mark all as read */
router.post("/read-all", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: "All marked as read" });
  } catch (err) {
    next(err);
  }
});

/** POST /api/notifications/:id/read — mark one as read */
router.post("/:id/read", async (req, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: "Notification not found" });
    }
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
