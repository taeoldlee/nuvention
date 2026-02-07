const express = require("express");
const router = express.Router();
const { upload, uploadMultiple, getFileUrl, placeholderUrl, s3Configured } = require("../config/s3");

/**
 * POST /api/uploads/image
 * Upload a single image. Returns the URL.
 */
router.post("/image", (req, res, next) => {
  upload(req, res, (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const url = getFileUrl(req.file);

      res.json({
        url,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        s3: s3Configured,
      });
    } catch (innerErr) {
      next(innerErr);
    }
  });
});

/**
 * POST /api/uploads/images
 * Upload multiple images (up to 6). Returns URLs.
 */
router.post("/images", (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const files = req.files || [];
      if (files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      const results = files.map((file) => ({
        url: getFileUrl(file),
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));

      res.json({
        images: results,
        count: results.length,
        s3: s3Configured,
      });
    } catch (innerErr) {
      next(innerErr);
    }
  });
});

module.exports = router;
