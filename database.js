// db/database.js — SQLite setup using better-sqlite3
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "wealtharc.db"));

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    mobile      TEXT    NOT NULL,
    city        TEXT,
    goal        TEXT,
    budget      TEXT,
    message     TEXT,
    source      TEXT    DEFAULT 'contact_page',
    status      TEXT    DEFAULT 'new',        -- new | contacted | converted | closed
    created_at  TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    name        TEXT,
    status      TEXT    DEFAULT 'active',     -- active | unsubscribed
    created_at  TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    title       TEXT    NOT NULL,
    category    TEXT    DEFAULT 'Insight',    -- Daily Report | Market Outlook | Investment Thesis | Insight
    summary     TEXT,
    body        TEXT,
    author      TEXT    DEFAULT 'WealthArc Research Desk',
    published   INTEGER DEFAULT 0,            -- 0 = draft, 1 = published
    created_at  TEXT    DEFAULT (datetime('now','localtime')),
    published_at TEXT
  );
`);

// Seed a sample post if table is empty
const postCount = db.prepare("SELECT COUNT(*) as n FROM posts").get();
if (postCount.n === 0) {
  db.prepare(`
    INSERT INTO posts (slug, title, category, summary, body, published, published_at)
    VALUES (?, ?, ?, ?, ?, 1, datetime('now','localtime'))
  `).run(
    "welcome-to-wealtharc",
    "Welcome to WealthArc Insights",
    "Insight",
    "Our research desk covers daily market reports, fund outlooks, and long-term investment thesis.",
    "We publish daily market reports, sector outlooks, and fund-level commentary. Subscribe to stay informed."
  );
}

module.exports = db;
