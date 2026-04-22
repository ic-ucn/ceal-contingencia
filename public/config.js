/*
  Configuración editable sin recompilar.
  - apiBase: "" usa el mismo dominio (ej: /api/reports). Si publicas solo estático, la app cae a localStorage.
  - Para backend propio: apiBase: "https://tu-dominio.cl"
*/
window.CEAL_CONFIG = {
  appName: "CEAL Contingencia",
  institutionName: "UCN · Ingeniería Civil · CEAL",
  subtitle: "Contingencia estudiantil",
  updateLabel: "Actualizado · Acta pleno 21 abr",
  apiBase: "",
  enableLocalFallback: true,
  maxFileMB: 10,
  maxFiles: 5,
  contactEmail: "",
  privacyCopy: "Este reporte es anónimo. No se solicitan datos personales y se utiliza para respaldo y seguimiento colectivo."
};
