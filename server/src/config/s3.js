const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");

let s3Client = null;
let upload = null;
let uploadMultiple = null;
let s3Configured = false;

// Check if AWS credentials are available
if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
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
      bucket: process.env.AWS_S3_BUCKET,
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
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image and video files are allowed"), false);
        }
      },
    });

    uploadMultiple = upload.array("images", 6);
    upload = upload.single("image");
    s3Configured = true;

    console.log("[S3] AWS S3 configured successfully");
  } catch (err) {
    console.warn("[S3] Failed to initialize S3:", err.message);
  }
}

// Fallback: memory storage with placeholder URLs
if (!s3Configured) {
  console.log("[S3] Running in demo mode — using memory storage with placeholder URLs");

  const memoryStorage = multer.memoryStorage();
  const memoryUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image and video files are allowed"), false);
      }
    },
  });

  upload = memoryUpload.single("image");
  uploadMultiple = memoryUpload.array("images", 6);
}

/**
 * Generate a placeholder URL for demo mode.
 */
function placeholderUrl(filename) {
  const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  return `https://locale-demo.placeholder.dev/uploads/${id}-${filename || "image.jpg"}`;
}

/**
 * Get the URL from an uploaded file, handling both S3 and memory storage.
 */
function getFileUrl(file) {
  if (file.location) {
    // S3 upload — multer-s3 sets file.location
    return file.location;
  }
  // Memory storage fallback
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
