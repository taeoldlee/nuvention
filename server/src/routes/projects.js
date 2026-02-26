const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand, requireCreatorToken } = require("../middleware/auth");
const { createPayout } = require("../services/payments");
const { generateUsageRightsPDF } = require("../services/documents");
const { createNotification } = require("../services/notifications");
const { createCharge } = require("../services/payments");

// ─── Brand routes (x-user-id auth) ─────────────────────────────────────────

/**
 * GET /api/projects
 * List brand's projects (operator only).
 */
router.get("/", requireAuth, requireOperatorWithBrand, async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { brandProfileId: req.brandProfile.id },
      include: {
        application: {
          include: {
            brief: { select: { id: true, title: true } },
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
 * Get project detail (brand access verified via brandProfileId).
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        application: {
          include: {
            brief: true,
          },
        },
        brandProfile: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        drafts: {
          orderBy: { version: "desc" },
        },
        transaction: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify the authenticated user's brand owns this project
    if (!req.user.brandProfile || project.brandProfileId !== req.user.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/projects/:id/usage-rights-pdf
 * Generate and download a PDF usage rights document.
 */
router.get("/:id/usage-rights-pdf", requireAuth, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        brandProfile: {
          include: { user: { select: { name: true } } },
        },
        application: {
          include: { brief: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify ownership
    if (!req.user.brandProfile || project.brandProfileId !== req.user.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const pdfBuffer = await generateUsageRightsPDF({
      businessName: project.brandProfile?.businessName,
      contentType: project.application?.brief?.contentTypes?.[0],
      usageRights: project.usageRights,
      timeline: project.contentDueAt
        ? `Due by ${new Date(project.contentDueAt).toLocaleDateString()}`
        : "Standard timeline",
      creatorName: project.creatorName,
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
 * POST /api/projects/:id/drafts/:draftId/approve
 * Brand approves a submitted draft.
 */
router.post("/:id/drafts/:draftId/approve", requireAuth, requireOperatorWithBrand, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.brandProfileId !== req.brandProfile.id) {
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

    const updatedDraft = await prisma.$transaction(async (tx) => {
      const d = await tx.projectDraft.update({
        where: { id: draft.id },
        data: { status: "APPROVED" },
      });

      await tx.project.update({
        where: { id: project.id },
        data: { status: "APPROVED" },
      });

      return d;
    });

    // Notify creator (no userId for creator-token users, just log)
    console.log(`[notification] Draft ${draft.id} approved for project ${project.id}`);

    res.json({ draft: updatedDraft });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/drafts/:draftId/revision
 * Brand requests a revision on a submitted draft.
 * Body: { feedback }
 */
router.post("/:id/drafts/:draftId/revision", requireAuth, requireOperatorWithBrand, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.brandProfileId !== req.brandProfile.id) {
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
        data: {
          status: "REVISION_REQUESTED",
          revisionsUsed: { increment: 1 },
        },
      });

      return d;
    });

    res.json({ draft: updatedDraft });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/complete
 * Mark project as complete and release escrow.
 * Project must be in APPROVED status.
 */
router.post("/:id/complete", requireAuth, requireOperatorWithBrand, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.brandProfileId !== req.brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (project.status !== "APPROVED") {
      return res.status(400).json({ error: "Project must be approved before it can be completed" });
    }

    // Update project status
    const completedAt = new Date();
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        status: "COMPLETED",
        completedAt,
      },
      include: {
        application: { include: { brief: true } },
        brandProfile: true,
        transaction: true,
      },
    });

    // Release escrow via payout
    if (project.transaction) {
      await createPayout(project.id, project.transaction.creatorPayout);
    }

    // ── Create CampaignData record for insights ──
    try {
      const brief = updatedProject.application?.brief;
      const brandProfile = updatedProject.brandProfile;
      const application = updatedProject.application;

      if (brief && brandProfile) {
        // Count applications for this brief
        const numberOfApplications = await prisma.application.count({
          where: { briefId: brief.id },
        });

        // Calculate time to first application (in minutes)
        const firstApplication = await prisma.application.findFirst({
          where: { briefId: brief.id },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });
        const timeToFirstApplication = firstApplication
          ? Math.round((firstApplication.createdAt.getTime() - brief.createdAt.getTime()) / 60000)
          : null;

        // Derive creator tier from follower count
        const followerCount = application?.followerCount || 0;
        let selectedCreatorTier;
        if (followerCount >= 100000) {
          selectedCreatorTier = "MACRO";
        } else if (followerCount >= 50000) {
          selectedCreatorTier = "MID";
        } else if (followerCount >= 10000) {
          selectedCreatorTier = "MICRO";
        } else {
          selectedCreatorTier = "NANO";
        }

        // Check if content was approved (project reached APPROVED -> COMPLETED)
        const wasContentApproved = true; // project must be APPROVED before completing

        // Count revisions requested on this project
        const revisionsRequested = updatedProject.revisionsUsed || 0;

        await prisma.campaignData.create({
          data: {
            briefId: brief.id,
            brandProfileId: brandProfile.id,
            campaignGoal: brief.campaignGoal,
            contentTypes: brief.contentTypes || [],
            compensationType: updatedProject.compensationType,
            compensationAmount: updatedProject.price || null,
            neighborhood: brandProfile.neighborhood,
            city: brandProfile.city || "Evanston",
            cuisineTypes: brandProfile.cuisineTypes || [],
            numberOfApplications,
            timeToFirstApplication,
            selectedCreatorTier,
            wasContentApproved,
            revisionsRequested,
            completedAt,
          },
        });
      }
    } catch (campaignDataErr) {
      // Log but don't fail the completion — insights are non-critical
      console.error("[projects/:id/complete] Failed to create CampaignData:", campaignDataErr);
    }

    res.json({ project: updatedProject });
  } catch (err) {
    next(err);
  }
});

// ─── Creator routes (x-creator-token auth) ──────────────────────────────────

/**
 * GET /api/projects/:id/creator
 * Creator views their project details (via x-creator-token).
 */
router.get("/:id/creator", requireCreatorToken, async (req, res, next) => {
  try {
    const { creatorProject } = req;

    if (creatorProject.id !== req.params.id) {
      return res.status(403).json({ error: "Token does not match this project" });
    }

    // Fetch full project with all relations
    const project = await prisma.project.findUnique({
      where: { id: creatorProject.id },
      include: {
        application: { include: { brief: true } },
        brandProfile: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        drafts: { orderBy: { version: "desc" } },
        transaction: {
          select: {
            status: true,
            escrowStatus: true,
            creatorPayout: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/accept
 * Creator accepts the project invitation.
 * Project must be AWAITING_CREATOR_ACCEPTANCE.
 */
router.post("/:id/accept", requireCreatorToken, async (req, res, next) => {
  try {
    const { creatorProject } = req;

    if (creatorProject.id !== req.params.id) {
      return res.status(403).json({ error: "Token does not match this project" });
    }

    if (creatorProject.status !== "AWAITING_CREATOR_ACCEPTANCE") {
      return res.status(400).json({ error: "Project is not awaiting creator acceptance" });
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: creatorProject.id },
      data: {
        status: "IN_PROGRESS",
        creatorAcceptedAt: new Date(),
      },
      include: {
        application: { include: { brief: true } },
        brandProfile: true,
        transaction: true,
      },
    });

    // Create charge (escrow hold)
    await createCharge(creatorProject.id, creatorProject.price);

    // Notify brand
    if (creatorProject.brandProfile?.user?.id) {
      createNotification(creatorProject.brandProfile.user.id, {
        type: "PROJECT_ACCEPTED",
        title: "Creator accepted your project!",
        body: `${creatorProject.creatorName} accepted the project.`,
        linkUrl: `/operator/project/${creatorProject.id}`,
      }).catch(() => {});
    }

    res.json({ project: updatedProject });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/decline
 * Creator declines the project invitation.
 */
router.post("/:id/decline", requireCreatorToken, async (req, res, next) => {
  try {
    const { creatorProject } = req;

    if (creatorProject.id !== req.params.id) {
      return res.status(403).json({ error: "Token does not match this project" });
    }

    // Set project status back and decline the application
    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: creatorProject.id },
        data: { status: "AWAITING_CREATOR_ACCEPTANCE" },
      });

      await tx.application.update({
        where: { id: creatorProject.applicationId },
        data: { status: "DECLINED" },
      });
    });

    // Notify brand
    if (creatorProject.brandProfile?.user?.id) {
      createNotification(creatorProject.brandProfile.user.id, {
        type: "PROJECT_DECLINED",
        title: "Creator declined your project",
        body: `${creatorProject.creatorName} declined the project invitation.`,
        linkUrl: `/operator/project/${creatorProject.id}`,
      }).catch(() => {});
    }

    res.json({ message: "Project declined" });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/drafts
 * Creator submits a draft.
 * Body: { fileUrls: [...], notes?: "string" }
 */
router.post("/:id/drafts", requireCreatorToken, async (req, res, next) => {
  try {
    const { creatorProject } = req;

    if (creatorProject.id !== req.params.id) {
      return res.status(403).json({ error: "Token does not match this project" });
    }

    if (!["IN_PROGRESS", "REVISION_REQUESTED"].includes(creatorProject.status)) {
      return res
        .status(400)
        .json({ error: "Cannot submit draft in current project status: " + creatorProject.status });
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
        where: { projectId: creatorProject.id },
        orderBy: { version: "desc" },
      });
      const version = latestDraft ? latestDraft.version + 1 : 1;

      const newDraft = await tx.projectDraft.create({
        data: {
          projectId: creatorProject.id,
          version,
          fileUrls,
          notes: notes || null,
          status: "SUBMITTED",
        },
      });

      await tx.project.update({
        where: { id: creatorProject.id },
        data: { status: "DRAFT_SUBMITTED" },
      });

      return newDraft;
    });

    // Notify brand about new draft
    if (creatorProject.brandProfile?.user?.id) {
      createNotification(creatorProject.brandProfile.user.id, {
        type: "DRAFT_SUBMITTED",
        title: "New draft submitted",
        body: `${creatorProject.creatorName} submitted a new draft for review.`,
        linkUrl: `/operator/project/${creatorProject.id}`,
      }).catch(() => {});
    }

    res.status(201).json({ draft });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
