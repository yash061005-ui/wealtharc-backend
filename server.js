// server.js — WealthArc Backend API
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-token"],
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: "Too many submissions. Please try again in an hour." },
});

app.use("/api/", apiLimiter);
app.use("/api/leads", formLimiter);
app.use("/api/subscribe", formLimiter);

// ── Static Admin Panel ────────────────────────────────────────────────────────
app.use("/admin", express.static(path.join(__dirname, "public", "admin")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/leads",       require("./routes/leads"));
app.use("/api",             require("./routes/subscribers"));
app.use("/api/posts",       require("./routes/posts"));
app.use("/api/admin",       require("./routes/admin"));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[error]", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   WealthArc Backend — Running            ║
  ║   http://localhost:${PORT}                  ║
  ║   Admin Panel: http://localhost:${PORT}/admin ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
