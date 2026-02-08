const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { createPayout } = require("../services/payments");

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/projects
 * List user's projects (operator or creator based on role).
 */
router.get("/", async (req, res, next) => {
  try {
    let whereClause = {};

    if (req.user.role === "OPERATOR") {
      const brandProfile = await prisma.brandProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!brandProfile) {
        return res.json({ projects: [] });
      }
      whereClause = { brandProfileId: brandProfile.id };
    } else if (req.user.role === "CREATOR") {
      const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!creatorProfile) {
        return res.json({ projects: [] });
      }
      whereClause = { creatorProfileId: creatorProfile.id };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        match: {
          include: {
            contentRequest: true,
          },
        },
        brandProfile: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        creatorProfile: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        drafts: {
          orderBy: { version: "desc" },
          take: 1,
        },
        transaction: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/projects/:id
 * Get project detail with all drafts.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        match: {
          include: {
            contentRequest: true,
            creatorProfile: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
                portfolioItems: {
                  take: 4,
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
        brandProfile: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        creatorProfile: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        drafts: {
          orderBy: { version: "desc" },
        },
        transaction: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify access: user must be the operator or creator on this project
    const isOperator =
      req.user.brandProfile && project.brandProfileId === req.user.brandProfile.id;
    const isCreator =
      req.user.creatorProfile && project.creatorProfileId === req.user.creatorProfile.id;

    if (!isOperator && !isCreator) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/drafts
 * Creator submits a draft.
 * Body: { fileUrls: [...], notes?: "string" }
 */
router.post("/:id/drafts", async (req, res, next) => {
  try {
    if (req.user.role !== "CREATOR") {
      return res.status(403).json({ error: "Only creators can submit drafts" });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { drafts: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify the creator owns this project
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile || project.creatorProfileId !== creatorProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!["BRIEF_SENT", "REVISION_REQUESTED"].includes(project.status)) {
      return res
        .status(400)
        .json({ error: "Cannot submit draft in current project status: " + project.status });
    }

    const { fileUrls, notes } = req.body;

    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return res.status(400).json({ error: "fileUrls array is required" });
    }

    // Determine version number
    const latestDraft = project.drafts[0];
    const version = latestDraft ? latestDraft.version + 1 : 1;

    const draft = await prisma.projectDraft.create({
      data: {
        projectId: project.id,
        version,
        fileUrls,
        notes: notes || null,
        status: "SUBMITTED",
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: project.id },
      data: { status: "DRAFT_SUBMITTED" },
    });

    res.status(201).json({ draft });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/drafts/:draftId/approve
 * Operator approves a draft.
 */
router.post("/:id/drafts/:draftId/approve", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can approve drafts" });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify ownership
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile || project.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const draft = await prisma.projectDraft.findUnique({
      where: { id: req.params.draftId },
    });

    if (!draft || draft.projectId !== project.id) {
      return res.status(404).json({ error: "Draft not found" });
    }

    if (draft.status !== "SUBMITTED") {
      return res.status(400).json({ error: "Draft has already been reviewed" });
    }

    // Approve the draft
    const updatedDraft = await prisma.projectDraft.update({
      where: { id: draft.id },
      data: {
        status: "APPROVED",
        feedback: req.body.feedback || null,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: project.id },
      data: { status: "APPROVED" },
    });

    res.json({ draft: updatedDraft });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/drafts/:draftId/revision
 * Operator requests a revision on a draft.
 * Body: { feedback: "string" }
 */
router.post("/:id/drafts/:draftId/revision", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can request revisions" });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify ownership
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile || project.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const draft = await prisma.projectDraft.findUnique({
      where: { id: req.params.draftId },
    });

    if (!draft || draft.projectId !== project.id) {
      return res.status(404).json({ error: "Draft not found" });
    }

    if (draft.status !== "SUBMITTED") {
      return res.status(400).json({ error: "Draft has already been reviewed" });
    }

    const priorRevision = await prisma.projectDraft.findFirst({
      where: {
        projectId: project.id,
        feedback: { not: null },
      },
    });
    if (priorRevision) {
      return res.status(400).json({
        error: "Only one revision round is included for this project",
      });
    }

    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ error: "feedback is required for revision requests" });
    }

    // Mark draft as revision requested
    const updatedDraft = await prisma.projectDraft.update({
      where: { id: draft.id },
      data: {
        status: "REVISION_REQUESTED",
        feedback,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: project.id },
      data: { status: "REVISION_REQUESTED" },
    });

    res.json({ draft: updatedDraft });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/deliver
 * Mark project as delivered. Triggers creator payout.
 */
router.post("/:id/deliver", async (req, res, next) => {
  try {
    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ error: "Only operators can mark projects as delivered" });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify ownership
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!brandProfile || project.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (project.status !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Project must be approved before it can be delivered" });
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: { status: "DELIVERED" },
      include: {
        match: { include: { contentRequest: true } },
        brandProfile: true,
        creatorProfile: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        transaction: true,
      },
    });

    // Trigger payout
    if (project.transaction) {
      await createPayout(project.id, project.transaction.creatorPayout);
    }

    // Update the content request status
    await prisma.contentRequest.update({
      where: { id: updatedProject.match.contentRequestId },
      data: { status: "COMPLETED" },
    });

    res.json({ project: updatedProject });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
