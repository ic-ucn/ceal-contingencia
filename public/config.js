/*
  Configuracion editable sin recompilar.

  Modos soportados:
  - Pages + Supabase: la opcion mas simple para produccion sin backend propio.
  - Backend HTTP externo: usa apiBase.
  - Localhost: usa el backend local del mismo servidor y permite fallback local.
*/
const PUBLIC_API_BASE = "https://7b17963e46dab3.lhr.life";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const isLocalRuntime = LOCAL_HOSTS.has(window.location.hostname);

window.CEAL_CONFIG = {
  appName: "CEAL Contingencia",
  institutionName: "UCN - Ingenieria Civil - CEAL",
  subtitle: "Contingencia estudiantil",
  updateLabel: "Actualizado · Reunión JC 22 abr",
  apiBase: isLocalRuntime ? "" : PUBLIC_API_BASE,
  enableLocalFallback: isLocalRuntime,
  maxFileMB: 10,
  maxFiles: 5,
  contactEmail: "",
  privacyCopy: "Reporte anonimo para respaldo.",
  publicApiBase: PUBLIC_API_BASE,

  /*
    Completa estos campos para usar Pages + Supabase y eliminar el backend local.
    Con supabaseUrl + supabaseAnonKey, la app escribe directo en Postgres/Storage.
  */
  supabaseUrl: "https://phfosnvqqorcbilcojfz.supabase.co",
  supabaseAnonKey: "sb_publishable_EMPr6rvxY27jMo1ruzjQwA_4YamZpP4",
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

