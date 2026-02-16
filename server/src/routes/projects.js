const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand, requireCreatorWithProfile } = require("../middleware/auth");
const { createPayout } = require("../services/payments");
const { generateUsageRightsPDF } = require("../services/documents");

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
 * GET /api/projects/:id/usage-rights-pdf
 * Generate and download a PDF usage rights document for a project.
 */
router.get("/:id/usage-rights-pdf", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: {
          include: { user: { select: { name: true } } },
        },
        creatorProfile: {
          include: { user: { select: { name: true } } },
        },
        match: {
          include: { contentRequest: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify access
    const isOperator =
      req.user.brandProfile && project.brandProfileId === req.user.brandProfile.id;
    const isCreator =
      req.user.creatorProfile && project.creatorProfileId === req.user.creatorProfile.id;

    if (!isOperator && !isCreator) {
      return res.status(403).json({ error: "Access denied" });
    }

    const pdfBuffer = await generateUsageRightsPDF({
      businessName: project.brandProfile?.businessName,
      contentType: project.match?.contentRequest?.contentType,
      usageRights: project.usageRights,
      timeline: project.timeline,
      creatorName: project.creatorProfile?.user?.name || project.creatorProfile?.displayName,
      deliverables: project.deliverables,
      compensationType: project.compensationType,
      compensationDetails: project.compensationDetails,
    });

    const filename = `usage-rights-${project.id.slice(0, 8)}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/drafts
 * Creator submits a draft.
 * Body: { fileUrls: [...], notes?: "string" }
 */
router.post("/:id/drafts", requireCreatorWithProfile, async (req, res, next) => {
  try {
    const { creatorProfile } = req;

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { drafts: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.creatorProfileId !== creatorProfile.id) {
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

    if (!fileUrls.every((url) => typeof url === "string" && url.length > 0)) {
      return res.status(400).json({ error: "All fileUrls must be non-empty strings" });
    }

    // Create draft and update project atomically
    const draft = await prisma.$transaction(async (tx) => {
      const latestDraft = await tx.projectDraft.findFirst({
        where: { projectId: project.id },
        orderBy: { version: "desc" },
      });
      const version = latestDraft ? latestDraft.version + 1 : 1;

      const newDraft = await tx.projectDraft.create({
        data: {
          projectId: project.id,
          version,
          fileUrls,
          notes: notes || null,
          status: "SUBMITTED",
        },
      });

      await tx.project.update({
        where: { id: project.id },
        data: { status: "DRAFT_SUBMITTED" },
      });

      return newDraft;
    });

    res.status(201).json({ draft });
  } catch (err) {
    next(err);
  }
});

/**
 * Shared guard: load project + draft, verify ownership + submitted status.
 */
async function findDraftForAction(req, res) {
  const { brandProfile } = req;

  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return null;
  }

  if (project.brandProfileId !== brandProfile.id) {
    res.status(403).json({ error: "Access denied" });
    return null;
  }

  const draft = await prisma.projectDraft.findUnique({
    where: { id: req.params.draftId },
  });

  if (!draft || draft.projectId !== project.id) {
    res.status(404).json({ error: "Draft not found" });
    return null;
  }

  if (draft.status !== "SUBMITTED") {
    res.status(400).json({ error: "Draft has already been reviewed" });
    return null;
  }

  return { project, draft };
}

/**
 * POST /api/projects/:id/drafts/:draftId/approve
 * Operator approves a draft.
 */
router.post("/:id/drafts/:draftId/approve", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const result = await findDraftForAction(req, res);
    if (!result) return;
    const { project, draft } = result;

    const updatedDraft = await prisma.$transaction(async (tx) => {
      const d = await tx.projectDraft.update({
        where: { id: draft.id },
        data: {
          status: "APPROVED",
          feedback: req.body.feedback || null,
        },
      });

      await tx.project.update({
        where: { id: project.id },
        data: { status: "APPROVED" },
      });

      return d;
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
router.post("/:id/drafts/:draftId/revision", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const result = await findDraftForAction(req, res);
    if (!result) return;
    const { project, draft } = result;

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

    const updatedDraft = await prisma.$transaction(async (tx) => {
      const d = await tx.projectDraft.update({
        where: { id: draft.id },
        data: {
          status: "REVISION_REQUESTED",
          feedback,
        },
      });

      await tx.project.update({
        where: { id: project.id },
        data: { status: "REVISION_REQUESTED" },
      });

      return d;
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
router.post("/:id/deliver", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.brandProfileId !== brandProfile.id) {
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
    if (updatedProject.match?.contentRequestId) {
      await prisma.contentRequest.update({
        where: { id: updatedProject.match.contentRequestId },
        data: { status: "COMPLETED" },
      });
    }

    res.json({ project: updatedProject });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
