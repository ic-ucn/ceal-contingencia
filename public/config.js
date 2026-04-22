/*
  Configuracion editable sin recompilar.
  - En localhost usa el backend local del mismo servidor.
  - En GitHub Pages usa el backend publico activo.
  - El fallback local solo se permite en desarrollo.
*/
const PUBLIC_API_BASE = "https://7b17963e46dab3.lhr.life";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const isLocalRuntime = LOCAL_HOSTS.has(window.location.hostname);

window.CEAL_CONFIG = {
  appName: "CEAL Contingencia",
  institutionName: "UCN · Ingenieria Civil · CEAL",
  subtitle: "Contingencia estudiantil",
  updateLabel: "Actualizado · Acta pleno 21 abr",
  apiBase: isLocalRuntime ? "" : PUBLIC_API_BASE,
  enableLocalFallback: isLocalRuntime,
  maxFileMB: 10,
  maxFiles: 5,
  contactEmail: "",
  privacyCopy: "Reporte anonimo para respaldo y seguimiento interno.",
  publicApiBase: PUBLIC_API_BASE
};
