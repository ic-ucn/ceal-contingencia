import { test, expect } from "@playwright/test";

const LOCAL_ONLY_CONFIG = `
const PUBLIC_API_BASE = "";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const isLocalRuntime = LOCAL_HOSTS.has(window.location.hostname);
window.CEAL_CONFIG = {
  appName: "CEAL Contingencia",
  institutionName: "UCN - Ingenieria Civil - CEAL",
  subtitle: "Contingencia estudiantil",
  updateLabel: "Actualizado · test local",
  apiBase: "",
  enableLocalFallback: isLocalRuntime,
  maxFileMB: 10,
  maxFiles: 5,
  contactEmail: "",
  privacyCopy: "Reporte anonimo para respaldo.",
  publicApiBase: PUBLIC_API_BASE,
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseBucket: "ceal-evidence",
  supabaseQuestionsTable: "questions",
  supabaseReportsTable: "reports",
  supabaseEvidenceTable: "report_evidence",
  adminMembersTable: "admin_members",
  adminStatusTable: "site_status",
  adminFaqTable: "faq_entries",
  adminAgreementTable: "agreement_entries",
  adminChannelTable: "channel_links",
  adminDocumentTable: "source_documents",
  adminUpdateJobTable: "update_jobs",
  adminSourceBucket: "ceal-admin-sources",
  adminAllowedDomains: ["ucn.cl"],
  adminAllowedEmails: []
};
`;

async function forceLocalOnlyConfig(page) {
  await page.route("**/config.js*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/javascript; charset=utf-8",
      body: LOCAL_ONLY_CONFIG
    });
  });
}

test("home renderiza FAQ y navegación principal", async ({ page }) => {
  await forceLocalOnlyConfig(page);
  await page.goto("/?v=40#inicio");

  await expect(page.getByRole("heading", { name: "Estado de hoy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pendiente de confirmar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acciones rápidas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "FAQ" })).toBeVisible();
  await expect(page.getByPlaceholder("Buscar una pregunta...")).toBeVisible();
  await expect(page.getByRole("link", { name: "Reportar un caso" })).toBeVisible();
});

test("reportar permite enviar un reporte completo en modo local", async ({ page }) => {
  await forceLocalOnlyConfig(page);
  await page.goto("/?v=40#reportar");

  await expect(page.getByRole("heading", { name: "Contingencia estudiantil" })).toBeVisible();

  await page.locator("#curriculumInput").selectOption("general");
  await page.locator("#subjectSelect").selectOption({ label: "Unidad administrativa" });
  await page.locator("#dateInput").fill("2026-04-22");
  await page.locator("#descriptionInput").fill("E2E local: este reporte valida el flujo completo de envío con almacenamiento local.");
  await page.locator("#evidenceInput").setInputFiles({
    name: "captura-e2e.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% playwright local test\n")
  });

  await page.locator("#submitReportButton").click();

  await expect(page.getByRole("heading", { name: "Reporte recibido" })).toBeVisible();
  await expect(page.locator("#successFolio")).toContainText(/CEAL-/);
});

test("inicio permite abrir modal de duda y enviar una consulta", async ({ page }) => {
  await forceLocalOnlyConfig(page);
  await page.goto("/?v=40#inicio");

  await page.getByRole("button", { name: "Enviar duda" }).first().click();
  await expect(page.getByRole("heading", { name: /pregunta/i })).toBeVisible();

  await page.locator("#questionCategory").selectOption("otro");
  await page.locator("#questionText").fill("E2E local: esta duda valida el modal y la persistencia del flujo de preguntas.");
  await page.locator("#submitQuestionButton").click();

  await expect(page.getByRole("heading", { name: "Duda enviada" })).toBeVisible();
  await expect(page.locator("#successQuestionFolio")).toContainText(/DUDA-/);
});

test.describe("mobile shell", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("drawer móvil abre y navega a reportar", async ({ page }) => {
    await forceLocalOnlyConfig(page);
    await page.goto("/?v=40#inicio");

    await page.locator("#menuToggle").click();
    await expect(page.getByRole("link", { name: "Reportar incidencia" })).toBeVisible();
    await page.getByRole("link", { name: "Reportar incidencia" }).click();

    await expect(page).toHaveURL(/#reportar$/);
    await expect(page.getByRole("heading", { name: "Contingencia estudiantil" })).toBeVisible();
  });
});

test("admin local carga el acceso interno", async ({ page }) => {
  await page.goto("/admin.html?v=40");

  await expect(page.getByRole("heading", { name: "Actualizar sin redeploy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ingresar al panel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar acceso" })).toBeVisible();
});
