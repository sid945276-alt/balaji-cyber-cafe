const express = require("express");
const multer = require("multer");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-admin-key";

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const db = new Database(path.join(__dirname, "balaji.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id TEXT UNIQUE NOT NULL,
 name TEXT NOT NULL,
 mobile TEXT NOT NULL,
 service TEXT NOT NULL,
 message TEXT,
 files TEXT,
 payment_status TEXT DEFAULT 'Pending',
 status TEXT DEFAULT 'Received',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const storage = multer.diskStorage({
 destination: (_, __, cb) => cb(null, uploadDir),
 filename: (_, file, cb) => {
   const ext = path.extname(file.originalname);
   cb(null, Date.now() + "-" + crypto.randomBytes(5).toString("hex") + ext);
 }
});

const upload = multer({
 storage,
 limits: {
   files: 5,
   fileSize: 8 * 1024 * 1024
 }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/requests", upload.array("documents", 5), (req, res) => {
  try {
    const { name, mobile, service, message, payment_status = "Pending" } = req.body;

    if (!name || !mobile || !service) {
      return res.status(400).json({
        error: "नाम, मोबाइल और सेवा जरूरी हैं।"
      });
    }

    const requestId =
      "BCC-" +
      new Date().toISOString().slice(0, 10).replaceAll("-", "") +
      "-" +
      crypto.randomBytes(3).toString("hex").toUpperCase();

    const files = (req.files || []).map(f => f.filename);

    db.prepare(`
      INSERT INTO requests
      (request_id, name, mobile, service, message, files, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      requestId,
      name,
      mobile,
      service,
      message || "",
      JSON.stringify(files),
      payment_status
    );

    res.json({
      ok: true,
      requestId
    });

  } catch (e) {
    res.status(500).json({
      error: "आवेदन सेव नहीं हो पाया।"
    });
  }
});

app.get("/api/track/:id", (req, res) => {
  const r = db.prepare(`
    SELECT request_id, name, service, status, payment_status, created_at
    FROM requests
    WHERE request_id = ?
  `).get(req.params.id);

  if (!r) {
    return res.status(404).json({
      error: "आवेदन नहीं मिला।"
    });
  }

  res.json(r);
});

function admin(req, res, next) {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }
  next();
}

app.get("/api/admin/requests", admin, (req, res) => {
  res.json(
    db.prepare(`
      SELECT * FROM requests
      ORDER BY id DESC
    `).all()
  );
});

app.patch("/api/admin/requests/:id", admin, (req, res) => {
  const { status, payment_status } = req.body;

  db.prepare(`
    UPDATE requests
    SET status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status)
    WHERE request_id = ?
  `).run(
    status || null,
    payment_status || null,
    req.params.id
  );

  res.json({
    ok: true
  });
});

app.get("/api/admin/files/:filename", admin, (req, res) => {
  const safe = path.basename(req.params.filename);
  const full = path.join(uploadDir, safe);

  if (!fs.existsSync(full)) {
    return res.status(404).end();
  }

  res.download(full);
});

app.listen(PORT, () => {
  console.log(
    `Balaji Cyber Cafe running on http://localhost:${PORT}`
  );
});
