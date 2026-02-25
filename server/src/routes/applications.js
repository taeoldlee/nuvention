const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const { requireAuth, requireOperatorWithBrand } = require("../middleware/auth");
const { createNotification } = require("../services/notifications");
const crypto = require("crypto");

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/applications/:id
 * Get application detail. Marks viewedByBrandAt on first view.
 */
router.get("/:id", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { brief: true },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.brief.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!application.viewedByBrandAt) {
      const updated = await prisma.application.update({
        where: { id: application.id },
        data: { viewedByBrandAt: new Date() },
        include: { brief: true },
      });
      return res.json({ application: updated });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/applications/:id/select
 * Select an applicant. Creates a Project for them.
 */
router.post("/:id/select", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { brief: true },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.brief.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (application.status !== "PENDING") {
      return res.status(400).json({
        error: "Application must be in PENDING status to select",
      });
    }

    const brief = application.brief;

    const { project, updatedApplication } = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.application.update({
        where: { id: application.id },
        data: {
          status: "SELECTED",
          selectedAt: new Date(),
        },
      });

      const contentTypes = Array.isArray(brief.contentTypes)
        ? brief.contentTypes.join(", ")
        : String(brief.contentTypes || "");

      const project = await tx.project.create({
        data: {
          applicationId: application.id,
          brandProfileId: brandProfile.id,
          creatorName: application.creatorName,
          creatorEmail: application.contactEmail,
          creatorAccessToken: crypto.randomUUID(),
          status: "AWAITING_CREATOR_ACCEPTANCE",
          briefText: brief.title + "\n\n" + (brief.creativeDirection || ""),
          deliverables: brief.numberOfDeliverables + " " + contentTypes,
          price: brief.compensationAmount || 0,
          compensationType: brief.compensationType,
          compensationDetails: brief.compensationDetails,
          usageRights: brief.usageRights,
          revisionsIncluded: brief.revisionsIncluded,
          contentDueAt: brief.deadline,
        },
      });

      return { project, updatedApplication };
    });

    createNotification(brandProfile.userId, {
      type: "APPLICANT_SELECTED",
      title: "Creator selected",
      body: `You selected ${application.creatorName} for "${brief.title}".`,
      linkUrl: `/operator/project/${project.id}`,
    }).catch(() => {});

    res.status(201).json({ project, application: updatedApplication });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/applications/:id/reject
 * Reject an applicant.
 */
router.post("/:id/reject", requireOperatorWithBrand, async (req, res, next) => {
  try {
    const { brandProfile } = req;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { brief: true },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.brief.brandProfileId !== brandProfile.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: { status: "REJECTED" },
    });

    res.json({ application: updatedApplication });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
