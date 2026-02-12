const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Size limits: 10MB for images, 100MB for videos
const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILE_SIZE = VIDEO_MAX_SIZE; // multer limit set to largest allowed

let s3Client = null;
let upload = null;
let uploadMultiple = null;
let s3Configured = false;

// Shared file filter that enforces allowed types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

// Check if AWS credentials are available
// Supports both AWS_S3_BUCKET (preferred) and S3_BUCKET_NAME (legacy/.env.example)
const s3BucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;

if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  s3BucketName
) {
  try {
    const multerS3 = require("multer-s3");

    s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const s3Storage = multerS3({
      s3: s3Client,
      bucket: s3BucketName,
      acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const folder = req.uploadFolder || "uploads";
        const uniqueName = `${folder}/${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      },
    });

    upload = multer({
      storage: s3Storage,
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter,
    });

    uploadMultiple = upload.array("images", 6);
    upload = upload.single("image");
    s3Configured = true;

    console.log(`[S3] AWS S3 configured successfully (bucket: ${s3BucketName})`);
  } catch (err) {
    console.warn("[S3] Failed to initialize S3:", err.message);
  }
}

// Fallback: disk storage to avoid filling memory with large video files
if (!s3Configured) {
  console.log("[S3] Running in demo mode — using disk storage with placeholder URLs");

  const uploadDir = path.join(os.tmpdir(), "locale-uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  const demoUpload = multer({
    storage: diskStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
  });

  upload = demoUpload.single("image");
  uploadMultiple = demoUpload.array("images", 6);
}

/**
 * Generate a placeholder URL for demo mode.
 */
function placeholderUrl(filename) {
  const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  return `https://locale-demo.placeholder.dev/uploads/${id}-${filename || "image.jpg"}`;
}

/**
 * Get the URL from an uploaded file, handling both S3 and disk storage.
 */
function getFileUrl(file) {
  if (file.location) {
    // S3 upload — multer-s3 sets file.location
    return file.location;
  }
  if (file.key && s3BucketName) {
    // Construct S3 URL from bucket and key when location is not set
    const region = process.env.AWS_REGION || "us-east-1";
    return `https://${s3BucketName}.s3.${region}.amazonaws.com/${file.key}`;
  }
  // Disk storage — serve via Express static route
  if (file.filename) {
    return `/api/uploads/files/${file.filename}`;
  }
  return placeholderUrl(file.originalname);
}

module.exports = {
  s3Client,
  s3Configured,
  upload,
  uploadMultiple,
  placeholderUrl,
  getFileUrl,
};
