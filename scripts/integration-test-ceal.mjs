import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const dataDir = path.join(projectRoot, "data");
const dbPath = path.join(dataDir, "ceal.sqlite");
const uploadsDir = path.join(dataDir, "uploads");

const LOCAL_BASE = "http://localhost:3000";
const PUBLIC_BASE = "https://ic-ucn.github.io/ceal-contingencia";

const cleanupTargets = {
  reportIds: [],
  questionIds: [],
  uploadDirs: []
};
const warnings = [];

function logStep(message) {
  console.log(`\n[ceal:test] ${message}`);
}

function randomId(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`.replace(/[^A-Z0-9_-]/gi, "");
}

function getString(configText, key, fallback = "") {
  const matcher = new RegExp(`${key}:\\s*"([^"]*)"`);
  const match = configText.match(matcher);
  return match ? match[1] : fallback;
}

async function httpJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    json = null;
  }
  return { response, text, json };
}

async function httpText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

async function cleanupLocalArtifacts() {
  const db = new DatabaseSync(dbPath);
  try {
    if (cleanupTargets.reportIds.length) {
      const deleteEvidence = db.prepare("DELETE FROM report_evidence WHERE report_id = ?");
      const deleteReport = db.prepare("DELETE FROM reports WHERE id = ?");
      for (const reportId of cleanupTargets.reportIds) {
        deleteEvidence.run(reportId);
        deleteReport.run(reportId);
      }
    }

    if (cleanupTargets.questionIds.length) {
      const deleteQuestion = db.prepare("DELETE FROM questions WHERE id = ?");
      for (const questionId of cleanupTargets.questionIds) {
        deleteQuestion.run(questionId);
      }
    }
  } finally {
    db.close();
  }

  for (const target of cleanupTargets.uploadDirs) {
    await fs.rm(target, { recursive: true, force: true });
  }
}

async function main() {
  const configText = await fs.readFile(path.join(publicDir, "config.js"), "utf8");
  const appHtmlPath = path.join(publicDir, "index.html");
  const adminHtmlPath = path.join(publicDir, "admin.html");
  const swPath = path.join(publicDir, "sw.js");

  const supabaseUrl = getString(configText, "supabaseUrl");
  const supabaseAnonKey = getString(configText, "supabaseAnonKey");
  const adminStatusTable = getString(configText, "adminStatusTable", "site_status");
  const adminFaqTable = getString(configText, "adminFaqTable", "faq_entries");
  const adminAgreementTable = getString(configText, "adminAgreementTable", "agreement_entries");
  const adminChannelTable = getString(configText, "adminChannelTable", "channel_links");

  const appHtml = await fs.readFile(appHtmlPath, "utf8");
  const adminHtml = await fs.readFile(adminHtmlPath, "utf8");
  const swText = await fs.readFile(swPath, "utf8");

  const appVersionMatch = appHtml.match(/app\.js\?v=(\d+)/);
  const adminVersionMatch = adminHtml.match(/admin\.js\?v=(\d+)/);
  assert.ok(appVersionMatch, "No se encontró versión de app.js en index.html");
  assert.ok(adminVersionMatch, "No se encontró versión de admin.js en admin.html");
  const shellVersion = appVersionMatch[1];
  assert.equal(adminVersionMatch[1], shellVersion, "index.html y admin.html deben compartir la misma versión de shell");
  assert.match(swText, new RegExp(`ceal-contingencia-v${shellVersion}`), "sw.js debe usar la misma versión de caché que la shell");

  logStep(`Shell version detectada: v${shellVersion}`);

  logStep("Validando rutas locales estáticas");
  const localRoot = await httpText(`${LOCAL_BASE}/?v=${shellVersion}#inicio`);
  assert.equal(localRoot.response.status, 200, "La homepage local debe responder 200");
  assert.match(localRoot.text, new RegExp(`app\\.js\\?v=${shellVersion}`), "La homepage local debe servir la shell vigente");

  const localAdmin = await httpText(`${LOCAL_BASE}/admin.html?v=${shellVersion}`);
  assert.equal(localAdmin.response.status, 200, "admin.html local debe responder 200");
  assert.match(localAdmin.text, new RegExp(`admin\\.js\\?v=${shellVersion}`), "admin.html local debe servir la shell vigente");

  const localHealth = await httpJson(`${LOCAL_BASE}/api/health`);
  assert.equal(localHealth.response.status, 200, "api/health local debe responder 200");
  assert.equal(localHealth.json?.ok, true, "api/health local debe indicar ok=true");

  logStep("Validando errores esperados del backend local");
  const invalidQuestion = await httpJson(`${LOCAL_BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: randomId("BADQ"),
      category: "otro",
      categoryLabel: "Otro",
      question: "corta",
      source: "integration-test"
    })
  });
  assert.equal(invalidQuestion.response.status, 400, "La API local debe rechazar preguntas demasiado cortas");

  const invalidReport = await httpJson(`${LOCAL_BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: randomId("BADR"),
      problemType: "otro",
      problemTypeLabel: "Otro",
      curriculum: "",
      curriculumLabel: "",
      subject: "",
      date: "2099-01-01",
      description: "corto",
      source: "integration-test"
    })
  });
  assert.equal(invalidReport.response.status, 400, "La API local debe rechazar reportes inválidos");

  logStep("Creando registros locales y verificando persistencia");
  const questionId = randomId("ITQ");
  cleanupTargets.questionIds.push(questionId);
  const validQuestion = await httpJson(`${LOCAL_BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: questionId,
      category: "otro",
      categoryLabel: "Otro",
      question: "Integración local: esta duda valida la persistencia en SQLite.",
      source: "integration-test"
    })
  });
  assert.equal(validQuestion.response.status, 201, "La pregunta válida debe crearse en local");
  assert.equal(validQuestion.json?.ok, true, "La respuesta de pregunta local debe indicar ok=true");
  assert.equal(validQuestion.json?.id, questionId, "La respuesta debe devolver el id de la pregunta creada");

  const reportId = randomId("ITR");
  cleanupTargets.reportIds.push(reportId);
  const reportUploadDir = path.join(uploadsDir, reportId);
  cleanupTargets.uploadDirs.push(reportUploadDir);
  const pdfBuffer = Buffer.from("%PDF-1.4\n% CEAL integration test\n");
  const validReport = await httpJson(`${LOCAL_BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: reportId,
      problemType: "otro",
      problemTypeLabel: "Otro",
      curriculum: "general",
      curriculumLabel: "General / unidad",
      subject: "Unidad administrativa",
      subjectKey: "Unidad administrativa",
      subjectOther: "",
      date: "2026-04-22",
      description: "Integración local: este reporte valida escritura en SQLite y almacenamiento de evidencia.",
      followUp: false,
      source: "integration-test",
      evidence: [
        {
          name: "verificacion-evidence.pdf",
          type: "application/pdf",
          size: pdfBuffer.length,
          dataUrl: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
        }
      ]
    })
  });
  assert.equal(validReport.response.status, 201, "El reporte válido debe crearse en local");
  assert.equal(validReport.json?.ok, true, "La respuesta de reporte local debe indicar ok=true");
  assert.equal(validReport.json?.id, reportId, "La respuesta debe devolver el id del reporte creado");

  const db = new DatabaseSync(dbPath);
  try {
    const questionRow = db.prepare("SELECT id, category, question, stored_in FROM questions WHERE id = ?").get(questionId);
    assert.ok(questionRow, "La pregunta local debe existir en SQLite");
    assert.equal(questionRow.id, questionId);
    assert.equal(questionRow.stored_in, "db");

    const reportRow = db.prepare("SELECT id, problem_type, curriculum, subject, stored_in, follow_up FROM reports WHERE id = ?").get(reportId);
    assert.ok(reportRow, "El reporte local debe existir en SQLite");
    assert.equal(reportRow.id, reportId);
    assert.equal(reportRow.curriculum, "general");
    assert.equal(reportRow.stored_in, "db");
    assert.equal(reportRow.follow_up, 0);

    const evidenceRows = db.prepare("SELECT original_name, mime_type, stored, stored_path, reason FROM report_evidence WHERE report_id = ?").all(reportId);
    assert.equal(evidenceRows.length, 1, "Debe existir una fila de metadata en report_evidence");
    assert.equal(evidenceRows[0].original_name, "verificacion-evidence.pdf");
    assert.equal(evidenceRows[0].mime_type, "application/pdf");
    assert.equal(evidenceRows[0].stored, 1);
    assert.ok(evidenceRows[0].stored_path, "La metadata debe incluir stored_path");

    const storedFile = path.join(dataDir, evidenceRows[0].stored_path);
    const storedStat = await fs.stat(storedFile);
    assert.ok(storedStat.isFile(), "El archivo físico de evidencia debe existir");
  } finally {
    db.close();
  }

  logStep("Validando restricciones de administración local");
  const localReportsNoToken = await httpJson(`${LOCAL_BASE}/api/reports`);
  assert.equal(localReportsNoToken.response.status, 401, "GET /api/reports debe exigir token admin");
  const localQuestionsNoToken = await httpJson(`${LOCAL_BASE}/api/questions`);
  assert.equal(localQuestionsNoToken.response.status, 401, "GET /api/questions debe exigir token admin");

  logStep("Validando despliegue público");
  const publicRoot = await httpText(`${PUBLIC_BASE}/?v=${shellVersion}#inicio`);
  assert.equal(publicRoot.response.status, 200, "La homepage pública debe responder 200");
  assert.match(publicRoot.text, new RegExp(`app\\.js\\?v=${shellVersion}`), "La homepage pública debe servir la shell vigente");

  const publicAdmin = await httpText(`${PUBLIC_BASE}/admin.html?v=${shellVersion}`);
  assert.equal(publicAdmin.response.status, 200, "admin.html público debe responder 200");
  assert.match(publicAdmin.text, new RegExp(`admin\\.js\\?v=${shellVersion}`), "admin.html público debe servir la shell vigente");

  if (supabaseUrl && supabaseAnonKey) {
    logStep("Validando lectura pública desde Supabase");
    const supabaseHeaders = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json"
    };

    const statusRead = await httpJson(`${supabaseUrl}/rest/v1/${adminStatusTable}?select=id,hero_title,update_label&id=eq.current&is_published=eq.true`, {
      headers: supabaseHeaders
    });
    if (statusRead.response.status === 404) {
      warnings.push("Supabase no expone todavía las tablas del panel admin en Data API; la app pública seguirá funcionando con contenido embebido, pero el contenido vivo desde admin no está validado.");
    } else {
      assert.equal(statusRead.response.status, 200, "La lectura pública de site_status debe responder 200");
      assert.ok(Array.isArray(statusRead.json) && statusRead.json.length >= 1, "Debe existir al menos un site_status publicado");
      assert.equal(statusRead.json[0].id, "current", "El estado vigente publicado debe usar id=current");

      const faqRead = await httpJson(`${supabaseUrl}/rest/v1/${adminFaqTable}?select=id,question,status&is_published=eq.true&limit=3&order=display_order.asc`, {
        headers: supabaseHeaders
      });
      assert.equal(faqRead.response.status, 200, "La lectura pública de FAQ debe responder 200");
      assert.ok(Array.isArray(faqRead.json) && faqRead.json.length >= 1, "Debe existir al menos una FAQ publicada");

      const agreementRead = await httpJson(`${supabaseUrl}/rest/v1/${adminAgreementTable}?select=id,title,status&is_published=eq.true&limit=3&order=display_order.asc`, {
        headers: supabaseHeaders
      });
      assert.equal(agreementRead.response.status, 200, "La lectura pública de acuerdos debe responder 200");
      assert.ok(Array.isArray(agreementRead.json) && agreementRead.json.length >= 1, "Debe existir al menos un acuerdo publicado");

      const channelRead = await httpJson(`${supabaseUrl}/rest/v1/${adminChannelTable}?select=id,label,meta&is_published=eq.true&limit=4&order=display_order.asc`, {
        headers: supabaseHeaders
      });
      assert.equal(channelRead.response.status, 200, "La lectura pública de canales debe responder 200");
      assert.ok(Array.isArray(channelRead.json) && channelRead.json.length >= 1, "Debe existir al menos un canal publicado");
    }
  } else {
    console.warn("[ceal:test] Supabase no configurado; se omiten chequeos de lectura pública.");
  }

  if (warnings.length) {
    console.warn("\n[ceal:test] Advertencias:");
    for (const warning of warnings) console.warn(` - ${warning}`);
  }

  console.log("\n[ceal:test] Integración validada: local, pública y persistencia.");
}

try {
  await main();
} finally {
  await cleanupLocalArtifacts();
}
