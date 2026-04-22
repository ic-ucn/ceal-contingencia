import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.CEAL_ADMIN_TOKEN || "";
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 15 * 1024 * 1024);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 10 * 1024 * 1024);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.mkdir(UPLOAD_DIR, { recursive: true });

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    addSecurityHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === "/api/health") {
      sendJSON(res, 200, { ok: true, app: "ceal-contingencia-app", time: new Date().toISOString() });
      return;
    }

    if (url.pathname === "/api/reports" && req.method === "POST") {
      const payload = await readJSONBody(req);
      const record = await createReport(payload);
      sendJSON(res, 201, { ok: true, id: record.id, storedAt: record.createdAt });
      return;
    }

    if (url.pathname === "/api/questions" && req.method === "POST") {
      const payload = await readJSONBody(req);
      const record = await createQuestion(payload);
      sendJSON(res, 201, { ok: true, id: record.id, storedAt: record.createdAt });
      return;
    }

    if (url.pathname === "/api/reports" && req.method === "GET") {
      if (!isAuthorized(req, url)) {
        sendJSON(res, 401, { ok: false, error: "Admin token requerido." });
        return;
      }
      const records = await readNDJSON(path.join(DATA_DIR, "reports.ndjson"));
      sendJSON(res, 200, { ok: true, count: records.length, records });
      return;
    }

    if (url.pathname === "/api/questions" && req.method === "GET") {
      if (!isAuthorized(req, url)) {
        sendJSON(res, 401, { ok: false, error: "Admin token requerido." });
        return;
      }
      const records = await readNDJSON(path.join(DATA_DIR, "questions.ndjson"));
      sendJSON(res, 200, { ok: true, count: records.length, records });
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJSON(res, 405, { ok: false, error: "Método no permitido." });
      return;
    }

    await serveStatic(url, res, req.method === "HEAD");
  } catch (error) {
    const status = Number(error.statusCode || error.status || 500);
    const safeMessage = status >= 500 ? "Error interno del servidor." : error.message;
    sendJSON(res, status, { ok: false, error: safeMessage });
  }
});

server.listen(PORT, () => {
  console.log(`CEAL Contingencia listo en http://localhost:${PORT}`);
  if (!ADMIN_TOKEN) {
    console.log("Tip: define CEAL_ADMIN_TOKEN para consultar /api/reports y /api/questions de forma protegida.");
  }
});

function addSecurityHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

async function serveStatic(url, res, headOnly) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  let filePath = path.join(PUBLIC_DIR, pathname);
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(PUBLIC_DIR)) {
    sendJSON(res, 403, { ok: false, error: "Ruta no permitida." });
    return;
  }

  try {
    const stat = await fs.stat(normalized);
    if (stat.isDirectory()) filePath = path.join(normalized, "index.html");
  } catch (_) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const file = await fs.readFile(filePath);
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=86400"
  });
  if (!headOnly) res.end(file);
  else res.end();
}

function sendJSON(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function readJSONBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        const error = new Error("El payload supera el tamaño máximo permitido.");
        error.status = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw));
      } catch (_) {
        const error = new Error("JSON inválido.");
        error.status = 400;
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

async function createReport(payload) {
  const errors = validateReport(payload);
  if (errors.length) {
    const error = new Error(errors[0]);
    error.status = 400;
    throw error;
  }

  const id = sanitizeId(payload.id) || makeId("CEAL");
  const createdAt = new Date().toISOString();
  const evidence = await saveEvidenceFiles(id, payload.evidence || []);

  const record = {
    id,
    createdAt,
    problemType: String(payload.problemType || ""),
    problemTypeLabel: String(payload.problemTypeLabel || ""),
    subject: String(payload.subject || "").trim(),
    date: String(payload.date || ""),
    description: String(payload.description || "").trim(),
    followUp: Boolean(payload.followUp),
    evidence,
    source: String(payload.source || "web"),
    status: "received"
  };

  await appendNDJSON(path.join(DATA_DIR, "reports.ndjson"), record);
  return record;
}

async function createQuestion(payload) {
  const question = String(payload.question || "").trim();
  if (question.length < 8 || question.length > 500) {
    const error = new Error("La pregunta debe tener entre 8 y 500 caracteres.");
    error.status = 400;
    throw error;
  }

  const record = {
    id: sanitizeId(payload.id) || makeId("DUDA"),
    createdAt: new Date().toISOString(),
    category: String(payload.category || "contacto"),
    categoryLabel: String(payload.categoryLabel || "Contacto"),
    question,
    source: String(payload.source || "web"),
    status: "received"
  };

  await appendNDJSON(path.join(DATA_DIR, "questions.ndjson"), record);
  return record;
}

function validateReport(payload) {
  const errors = [];
  const subject = String(payload.subject || "").trim();
  const description = String(payload.description || "").trim();
  const date = String(payload.date || "");

  if (!payload.problemType) errors.push("Selecciona el tipo de problema.");
  if (!subject) errors.push("Indica asignatura o unidad.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("Fecha inválida.");
  if (date && new Date(`${date}T00:00:00`) > new Date()) errors.push("La fecha no puede ser futura.");
  if (description.length < 10 || description.length > 500) errors.push("La descripción debe tener entre 10 y 500 caracteres.");
  if (Array.isArray(payload.evidence) && payload.evidence.length > 5) errors.push("Máximo 5 archivos de evidencia.");

  return errors;
}

async function saveEvidenceFiles(reportId, evidence) {
  if (!Array.isArray(evidence) || !evidence.length) return [];

  const reportDir = path.join(UPLOAD_DIR, reportId);
  await fs.mkdir(reportDir, { recursive: true });
  const saved = [];

  for (const file of evidence.slice(0, 5)) {
    const name = safeFilename(file.name || "evidencia");
    const type = String(file.type || mimeFromName(name));
    if (!isAllowedMime(type, name)) continue;

    const dataUrl = String(file.dataUrl || "");
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      saved.push({ name, type, size: Number(file.size || 0), stored: false, reason: "sin contenido base64" });
      continue;
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_FILE_BYTES) {
      saved.push({ name, type, size: buffer.length, stored: false, reason: "supera tamaño máximo" });
      continue;
    }

    const storedName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${name}`;
    const destination = path.join(reportDir, storedName);
    await fs.writeFile(destination, buffer);
    saved.push({ name, type, size: buffer.length, stored: true, path: path.relative(DATA_DIR, destination) });
  }

  return saved;
}

function isAllowedMime(type, name) {
  return type.startsWith("image/")
    || type === "application/pdf"
    || type === "application/msword"
    || type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    || /\.(png|jpe?g|webp|gif|pdf|doc|docx)$/i.test(name);
}

function mimeFromName(name) {
  const ext = path.extname(name).toLowerCase();
  return MIME[ext] || "application/octet-stream";
}

function safeFilename(name) {
  const cleaned = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  return cleaned || "evidencia";
}

function sanitizeId(id) {
  return String(id || "").replace(/[^A-Z0-9_-]/gi, "").slice(0, 48);
}

function makeId(prefix) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${date}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function appendNDJSON(filePath, record) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

async function readNDJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function isAuthorized(req, url) {
  if (!ADMIN_TOKEN) return false;
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const token = bearer || url.searchParams.get("token") || "";
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(ADMIN_TOKEN));
  } catch (_) {
    return false;
  }
}
