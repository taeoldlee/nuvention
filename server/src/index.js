require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/auth");
const brandRoutes = require("./routes/brands");
const creatorRoutes = require("./routes/creators");
const requestRoutes = require("./routes/requests");
const projectRoutes = require("./routes/projects");
const briefRoutes = require("./routes/briefs");
const aiRoutes = require("./routes/ai");
const uploadRoutes = require("./routes/uploads");
const statsRoutes = require("./routes/stats");
const adminRoutes = require("./routes/admin");

const app = express();

// ─── CORS ───
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
  })
);

// ─── Body Parsing ───
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "locale-api",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ─── Upload timeout middleware ───
// Extend timeout to 5 minutes for upload routes (videos can be large)
const uploadTimeout = (req, res, next) => {
  req.setTimeout(5 * 60 * 1000); // 5 minutes
  res.setTimeout(5 * 60 * 1000);
  next();
};

// ─── Mount Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/creators", uploadTimeout, creatorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/briefs", briefRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/uploads", uploadTimeout, uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);

// ─── Serve Frontend (production) ───
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error("[Error]", err.stack || err.message || err);

  // Prisma known request error
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "A record with this unique value already exists",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Record not found",
    });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large. Maximum size is 100MB for videos, 10MB for images.",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Unexpected file field",
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error",
  });
});

// ─── Start Server ───
const PORT = parseInt(process.env.PORT, 10) || 3001;

app.listen(PORT, () => {
  console.log(`\n  Locale API running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`  CORS origin: ${corsOrigin}`);
  console.log(`  OpenAI: ${process.env.OPENAI_API_KEY ? "configured" : "not configured (using fallbacks)"}`);
  console.log(`  S3: ${process.env.AWS_S3_BUCKET ? "configured" : "not configured (using placeholders)"}`);
  console.log();
});

module.exports = app;
