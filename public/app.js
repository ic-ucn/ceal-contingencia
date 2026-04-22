(() => {
  "use strict";

  const config = {
    appName: "CEAL Contingencia",
    institutionName: "UCN - Ingenieria Civil - CEAL",
    subtitle: "Contingencia estudiantil",
    updateLabel: "Actualizado hoy · 10:15",
    apiBase: "",
    enableLocalFallback: true,
    maxFileMB: 10,
    maxFiles: 5,
    contactEmail: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseBucket: "ceal-evidence",
    supabaseQuestionsTable: "questions",
    supabaseReportsTable: "reports",
    supabaseEvidenceTable: "report_evidence",
    privacyCopy: "Este reporte es anónimo. No se solicitan datos personales.",
    ...(window.CEAL_CONFIG || {})
  };

  const STORAGE = {
    reports: "ceal.reports.v1",
    questions: "ceal.questions.v1",
    reportDraft: "ceal.reportDraft.v1"
  };

  const SUPABASE_ENABLED = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  let supabaseClient = null;

  const ROUTES = new Set(["inicio", "reportar", "acuerdos"]);

  const FAQ_CATEGORIES = [
    { id: "todas", label: "Todas", icon: "=" },
    { id: "asistencia", label: "Asistencia", icon: "A" },
    { id: "evaluaciones", label: "Evaluaciones", icon: "E" },
    { id: "pleno", label: "Pleno", icon: "P" },
    { id: "contacto", label: "Contacto", icon: "C" },
    { id: "otro", label: "Otro", icon: "..." }
  ];

  const ISSUE_TYPES = [
    { id: "asistencia", label: "Asistencia", icon: "A" },
    { id: "evaluacion", label: "Evaluacion", icon: "E" },
    { id: "informacion", label: "Informacion contradictoria", icon: "I" },
    { id: "presion", label: "Presion docente", icon: "P" },
    { id: "tramite", label: "Tramite", icon: "T" },
    { id: "otro", label: "Otro", icon: "O" }
  ];

  const SUBJECTS = [
    "Cálculo I",
    "Cálculo II",
    "Álgebra",
    "Física",
    "Química",
    "Mecánica de sólidos",
    "Topografía",
    "Hidráulica",
    "Materiales de construcción",
    "Programación",
    "Práctica / trámite académico",
    "Unidad administrativa",
    "Otro"
  ];

  const CURRICULUMS = [
    { id: "malla_o", label: "Malla O" },
    { id: "malla_p", label: "Malla P" },
    { id: "general", label: "General / unidad" }
  ];

  const CURRICULUM_SUBJECTS = {
    malla_o: [
      "Introducción a la Física",
      "Mecánica",
      "Ecuaciones Diferenciales",
      "Electromagnetismo",
      "Optica y Fisica Moderna",
      "Cálculo I",
      "Cálculo II",
      "Cálculo III",
      "Estadística",
      "Métodos Numéricos",
      "Álgebra I",
      "Álgebra II",
      "Dinámica",
      "Estática",
      "Mecánica de Fluidos",
      "Mecánica de Suelos I",
      "Mecánica de Suelos II",
      "Análisis y Diseño Sísmico de Edificios",
      "Comunicación Efectiva I",
      "Comunicación Efectiva II",
      "Química General",
      "Materiales de Ingeniería",
      "Termodinámica",
      "Análisis Estructural",
      "Hidráulica",
      "Diseño en Acero",
      "Fundaciones",
      "Mecánica de Rocas",
      "Inglés 1",
      "Inglés 2",
      "Inglés 3",
      "Inglés 4",
      "Dibujo de Ingeniería",
      "Metodologías Constructivas",
      "Mecánica de Sólidos",
      "Hormigón Armado",
      "Programación",
      "Electrotecnia",
      "Ingeniería Económica",
      "Ingeniería y Desarrollo Sustentable",
      "Ingeniería Sanitaria y Ambiental",
      "Modelos de Tráfico",
      "Elementos Finitos Aplicados",
      "Construcción de Obras Industriales",
      "Programación y Gestión de Obras",
      "Dinámica de Estructuras",
      "Proyecto Gestión y Administración de Construcción",
      "Proyecto Diseño de Infraestructura Vial",
      "Proyecto Diseño de Estructuras Industriales",
      "Proyecto Diseño de Obras Hidráulicas",
      "Proyecto Introducción a la Ingeniería I",
      "Proyecto Introducción a la Ingeniería II",
      "Emprendimiento",
      "Etica y Moral Profesional",
      "Electivo Profesional I",
      "Electivo Profesional II",
      "Capstone Project",
      "Formación General Electiva",
      "Diálogo FE-Cultura",
      "Diálogo FE-Ciencia",
      "Identidad, Universidad y Equidad de Género",
      "__other__"
    ],
    malla_p: [
      "Introducción al Cálculo",
      "Geometría Euclidiana",
      "Introducción a la Física",
      "Introducción a la Ingeniería",
      "Inglés I",
      "Formación en Identidad UCN Nivel I",
      "Comunicación Efectiva I",
      "Cálculo 1",
      "Álgebra 1",
      "Física 1",
      "Química General",
      "Inglés II",
      "Dibujo Planimétrico de Ingeniería",
      "Comunicación Efectiva II",
      "Cálculo 2",
      "Álgebra 2",
      "Física 2",
      "Introducción a la Programación",
      "Mecánica Racional",
      "Geomensura",
      "Probabilidad y Estadística",
      "Ecuaciones Diferenciales",
      "Termodinámica",
      "Geología para Ingeniería",
      "Estática Aplicada",
      "Formación en Identidad UCN Nivel II",
      "Formación General Electiva",
      "Cálculo Numérico",
      "Ingeniería Económica",
      "Mecánica de Fluidos",
      "Mecánica de Sólidos",
      "Análisis Estructural",
      "Máquinas y Equipos",
      "Diseño en Hormigón Armado",
      "Materiales de Ingeniería",
      "Hidráulica General",
      "Mecánica de Suelos 1",
      "Ingeniería en Tránsito",
      "Hidrología",
      "Procesos Constructivos",
      "Diseño en Acero",
      "Ingeniería Sanitaria y Ambiental",
      "Mecánica de Suelos 2",
      "BIM Aplicado a Ingeniería Civil",
      "Formación en Identidad UCN Nivel III",
      "Práctica en Obras",
      "Dinámica de Estructuras",
      "Fundaciones",
      "Programación de Obras",
      "Ingeniería para el Desarrollo Sustentable",
      "Formación Profesional Electiva",
      "Proyecto de Infraestructura Vial",
      "Diseño Sísmico de Edificios",
      "Gestión y Administración de Obras",
      "Construcción y Montaje de Obras Industriales",
      "Proyecto de Estructuras Industriales",
      "Proyecto de Obras Hidráulicas",
      "Proyecto Integrador 1",
      "Aspectos Legales de Ingeniería Civil",
      "Proyecto Integrador 2",
      "Práctica Ingeniero Ayudante",
      "__other__"
    ],
    general: SUBJECTS.map((subject) => subject === "Otro" ? "__other__" : subject)
  };

  const FAQS = [
    {
      id: "faq-asistencia-1",
      category: "asistencia",
      question: "¿El paro sigue vigente para el miércoles 22 de abril?",
      answer: "Sí. El acta del pleno deja explícito que el paro es válido para el miércoles 22 y que luego debe definirse la forma de revalidación.",
      status: "confirmed",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "faq-evaluaciones-1",
      category: "evaluaciones",
      question: "¿Se recalendarizaron las evaluaciones?",
      answer: "En el pleno se informó que la universidad rechazó inicialmente recalendarizar evaluaciones y luego autorizó la recalendarización solo para la jornada del martes 21. No se informaron garantías explícitas para los días siguientes si continuaba la paralización.",
      status: "review",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "faq-evaluaciones-2",
      category: "evaluaciones",
      question: "¿Qué hago si un docente mantiene una evaluación sin claridad pública?",
      answer: "Guarda la instrucción, la fecha y cualquier respaldo. En el pleno se levantó expresamente la tensión por recalendarizaciones y por posibles presiones a estudiantes movilizados, por lo que conviene reportarlo con evidencia.",
      status: "review",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "faq-pleno-1",
      category: "pleno",
      question: "¿Qué se comprometió la universidad en seguridad?",
      answer: "Federación informó que el Director de Servicios, Cristian Zuleta, se comprometió a actualizar el Protocolo de Emergencias con indicaciones para amenazas como tiroteo a más tardar el lunes 27 de abril, y a presentar un Plan de Seguridad Integral durante la semana del 25 de mayo.",
      status: "confirmed",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "faq-pleno-2",
      category: "pleno",
      question: "¿Cuándo son la pintatón y la marcha del miércoles 22?",
      answer: "El acta indica pintatón de lienzos el miércoles 22 a las 12:00 en el recreo FEUCN y marcha convocada a las 15:00 en la pérgola de avenida Brasil. La ruta no se difundiría públicamente por seguridad.",
      status: "confirmed",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "faq-contacto-1",
      category: "contacto",
      question: "¿Por dónde se bajan acuerdos y consultas de base?",
      answer: "El pleno reafirma que los alcances de las bases deben levantarse a través de los centros de estudiantes y que los acuerdos deben difundirse a las carreras para evitar desinformación.",
      status: "confirmed",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "faq-asistencia-2",
      category: "asistencia",
      question: "¿Hay garantías para los días siguientes si sigue la paralización?",
      answer: "No. En el pleno se transparentó que, si continuaba la paralización de actividades, no existían garantías explícitas para los otros días respecto de recalendarizaciones y resguardo académico.",
      status: "review",
      updated: "Acta pleno 21 abr",
      source: "Acta Pleno 21 de abril"
    }
  ];

  const AGREEMENTS = [
    {
      id: "agr-1",
      title: "Actualización del protocolo de emergencias",
      summary: "Dirección de Servicios se comprometió a actualizar el Protocolo de Emergencias con indicaciones para amenazas como tiroteo a más tardar el lunes 27 de abril.",
      status: "confirmed",
      date: "21 abr 2026",
      area: "Seguridad",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "agr-2",
      title: "Plan de seguridad integral",
      summary: "Se informó el compromiso de presentar durante la semana del 25 de mayo una propuesta de plan de seguridad integral con medidas como registro de ingreso al campus.",
      status: "review",
      date: "Semana 25 may 2026",
      area: "Seguridad",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "agr-3",
      title: "Recalendarización de evaluaciones",
      summary: "La recalendarización fue autorizada para la jornada del martes 21 tras presión estudiantil, pero el pleno dejó explícito que no había garantías para los días siguientes si seguía la paralización.",
      status: "review",
      date: "21 abr 2026",
      area: "Evaluaciones",
      source: "Acta Pleno 21 de abril"
    },
    {
      id: "agr-4",
      title: "Paro y movilización del 22 de abril",
      summary: "El pleno reafirma que el paro es válido para el miércoles 22. Además, se convoca pintatón a las 12:00 en el recreo FEUCN y marcha a las 15:00 en la pérgola de avenida Brasil.",
      status: "confirmed",
      date: "22 abr 2026",
      area: "Movilización",
      source: "Acta Pleno 21 de abril"
    }
  ];

  function emptyReportDraft() {
    return {
      type: "asistencia",
      curriculum: "",
      subject: "",
      subjectOther: "",
      date: "",
      description: "",
      followUp: false
    };
  }

  const state = {
    route: getRouteFromHash(),
    faqFilter: "todas",
    faqQuery: "",
    openFaqId: "faq-asistencia-1",
    agreementFilter: "todos",
    report: { ...emptyReportDraft(), ...loadJSON(STORAGE.reportDraft, emptyReportDraft()) },
    files: [],
    isSubmitting: false
  };

  const main = document.getElementById("main");
  const modalRoot = document.getElementById("modalRoot");
  const toastRegion = document.getElementById("toastRegion");
  const drawer = document.getElementById("drawer");
  const menuToggle = document.getElementById("menuToggle");

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      // El almacenamiento local puede fallar si el navegador está en modo privado o si se supera la cuota.
      return false;
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getRouteFromHash() {
    const route = window.location.hash.replace("#", "").trim() || "inicio";
    return ROUTES.has(route) ? route : "inicio";
  }

  function statusBadge(status) {
    const map = {
      confirmed: { label: "Confirmado", className: "status-confirmed", icon: "OK" },
      review: { label: "En revision", className: "status-review", icon: "REV" },
      none: { label: "Sin respuesta publicada", className: "status-none", icon: "?" }
    };
    const item = map[status] || map.review;
    return `<span class="status-badge ${item.className}"><span aria-hidden="true">${item.icon}</span>${item.label}</span>`;
  }

  function iconSearch() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path>
      </svg>`;
  }

  function iconChevron() {
    return `
      <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6"></path>
      </svg>`;
  }

  function iconShield() {
    return `
      <svg class="shield-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3.5 5.8 6v5.1c0 4.3 2.6 8.2 6.2 9.4 3.6-1.2 6.2-5.1 6.2-9.4V6L12 3.5Z"></path>
        <path d="m9.7 12.2 1.6 1.6 3.3-3.5"></path>
      </svg>`;
  }

  function render() {
    state.route = getRouteFromHash();

    const renderers = {
      inicio: renderHome,
      reportar: renderReport,
      acuerdos: renderAgreements
    };

    main.innerHTML = renderers[state.route]();
    updateActiveNavigation();
    wireCurrentPage();
  }

  function updateActiveNavigation() {
    document.querySelectorAll("[data-route]").forEach((link) => {
      const isActive = link.dataset.route === state.route;
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function renderHome() {
    const reports = loadJSON(STORAGE.reports, []);
    const questions = loadJSON(STORAGE.questions, []);
    const filteredFaqs = getFilteredFaqs();
    const officialSources = [
      {
        label: "WhatsApp",
        meta: "Comunicados",
        href: "https://chat.whatsapp.com/KIxFl5bAHBuHnOnyZb6wUH?mode=gi_t"
      },
      {
        label: "Instagram",
        meta: "@ceicucn",
        href: "https://instagram.com/ceicucn"
      },
      {
        label: "Asambleas",
        meta: "y plenos"
      },
      {
        label: "Comunicados",
        meta: "UCN"
      }
    ];

    return `
      <div class="page-stack">
        <section class="hero-grid" aria-labelledby="faq-title">
          <div class="hero-main">
            <div class="hero-copy">
              <p class="eyebrow">Centro CEAL</p>
              <h1 id="faq-title">Estado hoy</h1>
              <p class="lead">Paro vigente para el miércoles 22 de abril. Aquí se concentra el estado actual, los hitos del día y el acceso a respuestas y acuerdos.</p>
              <div class="status-inline-row">
                <span class="status-badge status-review"><span aria-hidden="true">REV</span>Paro vigente hoy</span>
                <span class="status-badge status-confirmed"><span aria-hidden="true">OK</span>Fuente base: Acta pleno 21 abr</span>
              </div>
              <div class="meta-row" aria-label="Estado de actualización">
                <span aria-hidden="true">UPD</span><span>${escapeHTML(config.updateLabel)}</span><span class="dot"></span><span>${FAQS.length} respuestas cargadas</span>
              </div>
            </div>

            <div class="search-card hero-search" aria-label="Buscar preguntas frecuentes">
              <label class="search-input">
                ${iconSearch()}
                <input id="faqSearch" type="search" inputmode="search" autocomplete="off" placeholder="Buscar una pregunta..." value="${escapeHTML(state.faqQuery)}" />
              </label>
            </div>
          </div>
        </section>

        <section class="status-dashboard" aria-label="Resumen de contingencia">
          <article class="card status-highlight">
            <div class="status-highlight-head">
              <div>
                <p class="section-kicker">Estado actual</p>
                <h2>Paro válido para el miércoles 22 de abril</h2>
              </div>
              <span class="status-badge status-review">Activo</span>
            </div>
            <p>El acta del pleno del 21 de abril deja explícito que el paro es válido para el miércoles 22. La forma de revalidación queda sujeta a la definición posterior del proceso.</p>
          </article>

          <div class="status-mini-grid">
            <article class="card status-mini-card">
              <p class="section-kicker">Hitos del 22 de abril</p>
              <h3>Pintatón y marcha</h3>
              <ul class="help-list compact-list">
                <li><span class="bullet">12:00</span><span>Pintatón de lienzos en recreo FEUCN.</span></li>
                <li><span class="bullet">15:00</span><span>Marcha convocada en la pérgola de avenida Brasil.</span></li>
              </ul>
            </article>

            <article class="card status-mini-card">
              <p class="section-kicker">Ultima actualizacion</p>
              <h3>Acta del pleno 21 de abril</h3>
              <p>La portada usa esa acta como fuente base para el estado vigente y para las respuestas publicadas.</p>
            </article>
          </div>
        </section>

        <section class="category-row" aria-label="Filtros de preguntas frecuentes">
          ${FAQ_CATEGORIES.map((category) => `
            <button class="category-chip" type="button" data-faq-filter="${category.id}" aria-pressed="${state.faqFilter === category.id}">
              <span class="chip-icon" aria-hidden="true">${category.icon}</span>${escapeHTML(category.label)}
            </button>`).join("")}
        </section>

        <section class="card faq-section-intro" aria-labelledby="faq-section-title">
          <div>
            <h2 id="faq-section-title">FAQ</h2>
            <p>Respuestas publicadas.</p>
          </div>
          <div class="meta-row">
            <span>${filteredFaqs.length} resultado${filteredFaqs.length === 1 ? "" : "s"}</span>
            <span class="dot"></span>
            <span>Filtro: ${escapeHTML(categoryLabel(state.faqFilter))}</span>
          </div>
        </section>

        <section class="content-grid">
          <div class="faq-list" aria-live="polite">
            ${filteredFaqs.length ? filteredFaqs.map(renderFaqCard).join("") : renderEmpty("No encontramos preguntas con ese filtro.", "Prueba otra búsqueda o envía una nueva duda para que el CEAL pueda responderla.")}
          </div>

          <aside class="rail" aria-label="Acciones rápidas">
            <div class="rail-card">
              <h2>Acciones rápidas</h2>
              <p>Elige una acción.</p>
              <div class="quick-actions">
                <a class="btn btn-primary" href="#reportar" data-route="reportar">Enviar reporte</a>
                <button class="btn btn-soft" type="button" data-open-question>Enviar nueva duda</button>
                <a class="btn btn-soft" href="#acuerdos" data-route="acuerdos">Ver acuerdos</a>
              </div>
            </div>
            <div class="rail-card">
              <h3>Estado de respuestas</h3>
              <ul class="help-list">
                <li><span class="bullet">OK</span><span><strong>Confirmado:</strong> con respaldo.</span></li>
                <li><span class="bullet">REV</span><span><strong>En revision:</strong> pendiente de validacion.</span></li>
                <li><span class="bullet">?</span><span><strong>Sin respuesta:</strong> sin definición publicada.</span></li>
              </ul>
            </div>
          </aside>
        </section>

        <section class="cta-card" aria-label="Enviar otra duda">
          <div class="cta-icon" aria-hidden="true">?</div>
          <div>
            <h2>Nueva duda</h2>
            <p>Si no aparece aquí, envíala.</p>
          </div>
          <button class="btn btn-primary" type="button" data-open-question>Enviar nueva duda</button>
        </section>

        <section class="card sources-card sources-card-secondary" aria-label="Fuentes principales">
          <div class="sources-head">
            <div>
              <p class="section-kicker">Fuentes</p>
              <h2>Canales base</h2>
              <p>Referencias y canales de coordinación.</p>
            </div>
          </div>
          <div class="sources-grid">
            ${officialSources.map((source) => {
              const cardBody = `<strong>${escapeHTML(source.label)}</strong><span>${escapeHTML(source.meta)}</span>`;
              return source.href
                ? `<a class="source-link source-link-plain" href="${escapeHTML(source.href)}" target="_blank" rel="noreferrer">${cardBody}</a>`
                : `<div class="source-link source-link-plain is-static">${cardBody}</div>`;
            }).join("")}
          </div>
        </section>
      </div>
    `;
  }

  function getFilteredFaqs() {
    const query = normalizeText(state.faqQuery);
    return FAQS.filter((faq) => {
      const matchesCategory = state.faqFilter === "todas" || faq.category === state.faqFilter;
      const haystack = normalizeText(`${faq.question} ${faq.answer} ${faq.updated}`);
      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesQuery;
    });
  }

  function renderFaqCard(faq) {
    const isOpen = state.openFaqId === faq.id;
    return `
      <article class="faq-card ${isOpen ? "is-open" : ""}">
        <button class="faq-question" type="button" data-toggle-faq="${faq.id}" aria-expanded="${isOpen}" aria-controls="answer-${faq.id}">
          <strong>${escapeHTML(faq.question)}</strong>
          ${statusBadge(faq.status)}
          ${iconChevron()}
        </button>
        <div id="answer-${faq.id}" class="faq-answer">
          <p>${escapeHTML(faq.answer)}</p>
          <div class="meta-row"><span>${escapeHTML(faq.updated)}</span><span class="dot"></span><span>Categoría: ${escapeHTML(categoryLabel(faq.category))}</span>${faq.source ? `<span class="dot"></span><span>Fuente: ${escapeHTML(faq.source)}</span>` : ""}</div>
        </div>
      </article>`;
  }

  function categoryLabel(id) {
    if (id === "otro") return "Otro";
    return FAQ_CATEGORIES.find((item) => item.id === id)?.label || id;
  }

  function curriculumLabel(id) {
    return CURRICULUMS.find((item) => item.id === id)?.label || "General / unidad";
  }

  function getCurriculumSubjects(curriculum) {
    if (!curriculum) return [];
    return CURRICULUM_SUBJECTS[curriculum] || CURRICULUM_SUBJECTS.general;
  }

  function subjectOptionLabel(subject) {
    return subject === "__other__" ? "Otro" : subject;
  }

  function resolveReportSubject(report) {
    if (report.subject === "__other__") return String(report.subjectOther || "").trim();
    return String(report.subject || "").trim();
  }

  function getSupabaseClient() {
    if (!SUPABASE_ENABLED) return null;
    if (supabaseClient) return supabaseClient;
    if (!window.supabase?.createClient) {
      throw new Error("Supabase no esta disponible en esta carga.");
    }
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    return supabaseClient;
  }

  function sanitizeStorageName(name) {
    return String(name || "archivo")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function dataUrlToBlob(dataUrl, mimeType) {
    const parts = String(dataUrl || "").split(",");
    const base64 = parts[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mimeType || "application/octet-stream" });
  }

  async function submitQuestionSupabase(client, payload) {
    const row = {
      id: payload.id,
      created_at: payload.createdAt,
      category: payload.category,
      category_label: payload.categoryLabel,
      question: payload.question,
      source: payload.source || "web",
      status: "received",
      stored_in: "supabase"
    };
    const { error } = await client.from(config.supabaseQuestionsTable).insert(row);
    if (error) throw error;
    return { id: payload.id, storedIn: "supabase" };
  }

  async function uploadEvidenceToSupabase(client, reportId, file) {
    const cleanName = sanitizeStorageName(file.name);
    const path = `${reportId}/${Date.now()}-${cleanName || "archivo"}`;
    const blob = dataUrlToBlob(file.dataUrl, file.type || guessMimeByName(file.name));
    const { error } = await client.storage
      .from(config.supabaseBucket)
      .upload(path, blob, {
        contentType: file.type || guessMimeByName(file.name),
        upsert: false
      });
    if (error) throw error;
    return path;
  }

  async function submitReportSupabase(client, payload) {
    const reportRow = {
      id: payload.id,
      created_at: payload.createdAt,
      problem_type: payload.problemType,
      problem_type_label: payload.problemTypeLabel,
      curriculum: payload.curriculum,
      curriculum_label: payload.curriculumLabel,
      subject: payload.subject,
      subject_key: payload.subjectKey,
      subject_other: payload.subjectOther,
      incident_date: payload.date,
      description: payload.description,
      follow_up: payload.followUp,
      source: payload.source || "web",
      status: "received",
      stored_in: "supabase"
    };
    const { error: reportError } = await client.from(config.supabaseReportsTable).insert(reportRow);
    if (reportError) throw reportError;

    for (const file of payload.evidence || []) {
      const storedPath = await uploadEvidenceToSupabase(client, payload.id, file);
      const evidenceRow = {
        id: cryptoRandomId("EVID"),
        report_id: payload.id,
        original_name: file.name,
        mime_type: file.type || guessMimeByName(file.name),
        size_bytes: file.size,
        stored: "supabase_storage",
        stored_path: storedPath,
        reason: "user_attachment"
      };
      const { error: evidenceError } = await client.from(config.supabaseEvidenceTable).insert(evidenceRow);
      if (evidenceError) throw evidenceError;
    }

    return { id: payload.id, storedIn: "supabase" };
  }

  async function submitRecordSupabase(resource, payload) {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase no esta configurado.");
    if (resource === "questions") return submitQuestionSupabase(client, payload);
    if (resource === "reports") return submitReportSupabase(client, payload);
    throw new Error("Recurso no soportado.");
  }

  function renderReport() {
    const descriptionLength = state.report.description?.length || 0;
    const reports = loadJSON(STORAGE.reports, []);
    const reportSubjects = getCurriculumSubjects(state.report.curriculum);
    const showOtherSubject = state.report.subject === "__other__";

    return `
      <div class="page-stack">
        <section aria-labelledby="report-title">
          <p class="eyebrow">Reporte de incidencias</p>
          <h1 id="report-title">Contingencia estudiantil</h1>
            <p class="lead">Formulario para reportar incidencias.</p>
        </section>

        <section class="report-grid">
          <form class="form-card" id="reportForm" novalidate>
            <div class="confidential-card">
              <div class="shield" aria-hidden="true">${iconShield()}</div>
              <div>
                <h3>Confidencial.</h3>
                <p>Describe el hecho y adjunta respaldo si cuentas con él.</p>
              </div>
            </div>

            <div class="section-step">
              <div class="step-label"><span class="step-number">1</span> Tipo de problema</div>
              <div class="option-grid" role="group" aria-label="Tipo de problema">
                ${ISSUE_TYPES.map((type) => `
                  <button class="option-button" type="button" data-report-type="${type.id}" aria-pressed="${state.report.type === type.id}">
                    <span class="chip-icon" aria-hidden="true">${type.icon}</span>${escapeHTML(type.label)}
                  </button>`).join("")}
              </div>
            </div>

            <div class="section-step">
              <div class="step-label"><span class="step-number">2</span> Malla y ramo</div>
              <div class="field-grid">
                <label class="field-label" for="curriculumInput">Malla</label>
                <select class="select" id="curriculumInput" name="curriculum" required>
                  <option value="">Selecciona una malla</option>
                  ${CURRICULUMS.map((curriculum) => `<option value="${curriculum.id}" ${curriculum.id === state.report.curriculum ? "selected" : ""}>${escapeHTML(curriculum.label)}</option>`).join("")}
                </select>
                <label class="field-label" for="subjectSelect">Ramo o unidad</label>
                <select class="select" id="subjectSelect" name="subjectSelect" required ${state.report.curriculum ? "" : "disabled"}>
                  <option value="">Selecciona un ramo</option>
                  ${reportSubjects.map((subject) => `<option value="${escapeHTML(subject)}" ${subject === state.report.subject ? "selected" : ""}>${escapeHTML(subjectOptionLabel(subject))}</option>`).join("")}
                </select>
                ${showOtherSubject ? `<input class="form-control" id="subjectOtherInput" name="subjectOther" placeholder="Especifica ramo o unidad" value="${escapeHTML(state.report.subjectOther || "")}" autocomplete="off" />` : ""}
                <span class="input-icon" aria-hidden="true">SEL</span>
                <input type="hidden" id="subjectInput" name="subject" value="${escapeHTML(resolveReportSubject(state.report))}" />
                <span class="sr-only">Selección de ramo controlada por los selectores superiores.</span>
              </div>
            </div>

            <div class="section-step">
              <label class="step-label" for="dateInput"><span class="step-number">3</span> Fecha</label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">CAL</span>
                <input class="form-control" id="dateInput" name="date" type="date" value="${escapeHTML(state.report.date)}" required />
              </div>
            </div>

            <div class="section-step">
              <label class="step-label" for="descriptionInput"><span class="step-number">4</span> Descripción breve</label>
              <div class="textarea-wrap">
                <textarea class="textarea" id="descriptionInput" name="description" maxlength="500" placeholder="Cuéntanos brevemente qué ocurrió." required>${escapeHTML(state.report.description)}</textarea>
                <span class="counter" id="descriptionCounter">${descriptionLength}/500</span>
              </div>
            </div>

            <div class="section-step">
              <div class="step-label"><span class="step-number">5</span> Adjuntar evidencia <span style="color: var(--muted); font-weight: 800;">(opcional)</span></div>
              <div class="dropzone" id="dropzone">
                <div class="dropzone-copy">
                  <div class="dropzone-icon" aria-hidden="true">UP</div>
                  <div>
                    <h3>Sube archivos o capturas de pantalla</h3>
                    <p>Formatos: imagen, PDF, Word. Máx. ${Number(config.maxFileMB)} MB por archivo.</p>
                  </div>
                </div>
                <button class="btn btn-soft" type="button" tabindex="-1">Seleccionar</button>
                <input class="file-input" id="evidenceInput" type="file" multiple accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-label="Seleccionar evidencia" />
              </div>
              <div class="file-list" id="fileList">${renderFiles()}</div>
            </div>


            <div class="form-actions">
              <button class="btn btn-primary btn-full" id="submitReportButton" type="submit">Enviar reporte</button>
              <div class="form-note"><span aria-hidden="true">INFO</span><span>${escapeHTML(config.privacyCopy)}</span></div>
            </div>
          </form>

          <aside class="rail" aria-label="Ayuda del reporte">
            <div class="rail-card">
              <h2>Guía</h2>
              <ul class="help-list">
                <li><span class="bullet">1</span><span>Indica malla, ramo, fecha y hecho.</span></li>
                <li><span class="bullet">2</span><span>Adjunta respaldo si existe.</span></li>
                <li><span class="bullet">3</span><span>No agregues datos sensibles.</span></li>
              </ul>
            </div>
            <div class="rail-card">
              <h2>Tus envíos</h2>
              <p><strong>${reports.length}</strong> reporte${reports.length === 1 ? "" : "s"} guardado${reports.length === 1 ? "" : "s"} en este equipo.</p>
              <div class="quick-actions">
                <button class="btn btn-soft" type="button" data-open-history>Ver tus envíos</button>
                <a class="btn btn-soft" href="#inicio" data-route="inicio">Ver preguntas frecuentes</a>
              </div>
            </div>
            <div class="rail-card">
              <h2>Siguiente paso</h2>
              <p>Revisión y publicación cuando corresponda.</p>
            </div>
          </aside>
        </section>
      </div>`;
  }

  function renderFiles() {
    if (!state.files.length) return "";
    return state.files.map((file) => `
      <div class="file-item">
        <div style="min-width:0;">
          <strong>${escapeHTML(file.name)}</strong>
          <span>${escapeHTML(file.type || "archivo")} · ${formatBytes(file.size)}</span>
        </div>
        <button class="file-remove" type="button" data-remove-file="${file.id}" aria-label="Quitar ${escapeHTML(file.name)}">x</button>
      </div>`).join("");
  }

  function getFilteredAgreements() {
    return state.agreementFilter === "todos"
      ? AGREEMENTS
      : AGREEMENTS.filter((item) => item.area === state.agreementFilter);
  }

  function renderAgreements() {
    const filters = ["todos", "Seguridad", "Evaluaciones", "Movilización"];
    const agreements = getFilteredAgreements();

    return `
      <div class="page-stack">
        <section>
          <p class="eyebrow">Acuerdos</p>
          <h1>Acuerdos del pleno</h1>
          <p class="lead">Acuerdos publicados y su estado.</p>
        </section>

        <div class="segmented" role="group" aria-label="Filtrar acuerdos">
          ${filters.map((filter) => `<button type="button" data-agreement-filter="${escapeHTML(filter)}" aria-pressed="${state.agreementFilter === filter}">${escapeHTML(filter === "todos" ? "Todos" : filter)}</button>`).join("")}
        </div>

        <section class="content-grid">
          <div class="agreement-grid">
              ${agreements.map((agreement, index) => `
                <article class="agreement-card">
                  <header>
                    <div>
                      <h2>${escapeHTML(agreement.title)}</h2>
                      <div class="meta-row"><span>${escapeHTML(agreement.area)}</span><span class="dot"></span><span>${escapeHTML(agreement.date)}</span>${agreement.source ? `<span class="dot"></span><span>Fuente: ${escapeHTML(agreement.source)}</span>` : ""}</div>
                    </div>
                    ${statusBadge(agreement.status)}
                  </header>
                  <p>${escapeHTML(agreement.summary)}</p>
                  <div class="agreement-actions">
                    <button class="btn btn-soft" type="button" data-open-agreement="${index}">Abrir detalle</button>
                  </div>
                </article>`).join("")}
          </div>

          <aside class="rail">
            <div class="timeline-card">
              <h2>Proceso</h2>
              <ul class="timeline-list">
                <li><span class="bullet">1</span><span>Recepción.</span></li>
                <li><span class="bullet">2</span><span>Revisión.</span></li>
                <li><span class="bullet">3</span><span>Publicación.</span></li>
              </ul>
            </div>
            <div class="rail-card">
              <h2>¿Falta algo?</h2>
              <p>Envía una duda o un reporte.</p>
              <div class="quick-actions">
                <button class="btn btn-primary" type="button" data-open-question>Enviar duda</button>
                <a class="btn btn-soft" href="#reportar" data-route="reportar">Enviar reporte</a>
              </div>
            </div>
          </aside>
        </section>
      </div>`;
  }

  function openAgreementModal(index) {
    const agreements = getFilteredAgreements();
    if (!agreements.length) return;
    const safeIndex = Math.max(0, Math.min(index, agreements.length - 1));
    const agreement = agreements[safeIndex];
    const previousDisabled = safeIndex === 0;
    const nextDisabled = safeIndex === agreements.length - 1;

    showModal(`
      <div class="detail-modal" data-agreement-index="${safeIndex}">
        <div class="modal-head">
          <div>
            <p class="eyebrow" style="margin-bottom:8px;">Acuerdo del pleno</p>
            <h2>${escapeHTML(agreement.title)}</h2>
            <div class="meta-row">
              <span>${escapeHTML(agreement.area)}</span>
              <span class="dot"></span>
              <span>${escapeHTML(agreement.date)}</span>
              ${agreement.source ? `<span class="dot"></span><span>Fuente: ${escapeHTML(agreement.source)}</span>` : ""}
            </div>
          </div>
          <button class="icon-button modal-close" type="button" data-close-modal aria-label="Cerrar">x</button>
        </div>
        <div class="detail-status-row">
          ${statusBadge(agreement.status)}
          <span class="detail-count">${safeIndex + 1} de ${agreements.length}</span>
        </div>
        <div class="detail-body">
          <p>${escapeHTML(agreement.summary)}</p>
        </div>
        <div class="detail-nav">
          <button class="btn btn-soft" type="button" data-prev-agreement ${previousDisabled ? "disabled" : ""}>&lt; Anterior</button>
          <button class="btn btn-soft" type="button" data-next-agreement ${nextDisabled ? "disabled" : ""}>Siguiente &gt;</button>
        </div>
      </div>`);
  }

  function renderEmpty(title, body) {
    return `
      <div class="empty-state">
        <h2>${escapeHTML(title)}</h2>
        <p>${escapeHTML(body)}</p>
        <button class="btn btn-primary" type="button" data-open-question>Enviar nueva duda</button>
      </div>`;
  }

  function wireCurrentPage() {
    const faqSearch = document.getElementById("faqSearch");
    if (faqSearch) {
      faqSearch.addEventListener("input", (event) => {
        state.faqQuery = event.target.value;
        render();
        const input = document.getElementById("faqSearch");
        if (input) {
          input.focus();
          const end = input.value.length;
          input.setSelectionRange(end, end);
        }
      });
    }

    const reportForm = document.getElementById("reportForm");
    if (reportForm) {
      reportForm.addEventListener("input", updateReportDraftFromDOM);
      reportForm.addEventListener("change", updateReportDraftFromDOM);
      reportForm.addEventListener("submit", submitReport);

      const curriculumInput = document.getElementById("curriculumInput");
      const subjectSelect = document.getElementById("subjectSelect");
      if (curriculumInput) {
        curriculumInput.addEventListener("change", () => {
          state.report.curriculum = curriculumInput.value;
          const subjects = getCurriculumSubjects(state.report.curriculum);
          if (!subjects.includes(state.report.subject)) {
            state.report.subject = "";
            state.report.subjectOther = "";
          }
          saveJSON(STORAGE.reportDraft, state.report);
          render();
        });
      }
      if (subjectSelect) {
        subjectSelect.addEventListener("change", () => {
          state.report.subject = subjectSelect.value;
          if (state.report.subject !== "__other__") state.report.subjectOther = "";
          saveJSON(STORAGE.reportDraft, state.report);
          render();
        });
      }

      const dropzone = document.getElementById("dropzone");
      const evidenceInput = document.getElementById("evidenceInput");
      if (evidenceInput) evidenceInput.addEventListener("change", (event) => addFiles(event.target.files));
      if (dropzone) {
        ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
          event.preventDefault();
          dropzone.classList.add("is-dragover");
        }));
        ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
          event.preventDefault();
          dropzone.classList.remove("is-dragover");
        }));
        dropzone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
      }
    }
  }

  function updateReportDraftFromDOM() {
    const curriculum = document.getElementById("curriculumInput");
    const subjectSelect = document.getElementById("subjectSelect");
    const subject = document.getElementById("subjectInput");
    const subjectOther = document.getElementById("subjectOtherInput");
    const date = document.getElementById("dateInput");
    const description = document.getElementById("descriptionInput");
    const counter = document.getElementById("descriptionCounter");

    if (curriculum) state.report.curriculum = curriculum.value;
    if (subjectSelect) state.report.subject = subjectSelect.value;
    if (subjectOther) state.report.subjectOther = subjectOther.value;
    else if (state.report.subject !== "__other__") state.report.subjectOther = "";
    if (subject) subject.value = resolveReportSubject(state.report);
    if (date) state.report.date = date.value;
    if (description) {
      state.report.description = description.value;
      if (counter) counter.textContent = `${description.value.length}/500`;
    }
    saveJSON(STORAGE.reportDraft, state.report);
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    for (const file of files) {
      if (state.files.length >= Number(config.maxFiles)) {
        toast(`Puedes adjuntar hasta ${config.maxFiles} archivos.`, "error");
        break;
      }
      if (!isAllowedFile(file)) {
        toast(`Formato no permitido: ${file.name}`, "error");
        continue;
      }
      if (file.size > Number(config.maxFileMB) * 1024 * 1024) {
        toast(`${file.name} supera ${config.maxFileMB} MB.`, "error");
        continue;
      }
      try {
        const dataUrl = await readFileAsDataURL(file);
        state.files.push({
          id: cryptoRandomId("file"),
          name: file.name,
          type: file.type || guessMimeByName(file.name),
          size: file.size,
          dataUrl
        });
      } catch (_) {
        toast(`No se pudo leer ${file.name}.`, "error");
      }
    }
    render();
  }

  function isAllowedFile(file) {
    const type = file.type || guessMimeByName(file.name);
    const byMime = type.startsWith("image/")
      || type === "application/pdf"
      || type === "application/msword"
      || type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const byExt = /\.(png|jpe?g|webp|gif|pdf|doc|docx)$/i.test(file.name);
    return byMime || byExt;
  }

  function guessMimeByName(name) {
    const lower = String(name || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".doc")) return "application/msword";
    if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return "application/octet-stream";
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitReport(event) {
    event.preventDefault();
    updateReportDraftFromDOM();

    const errors = validateReport(state.report);
    if (errors.length) {
      toast(errors[0], "error");
      return;
    }

    const button = document.getElementById("submitReportButton");
    setButtonLoading(button, true, "Enviando...");

    const payload = {
      id: cryptoRandomId("CEAL"),
      createdAt: new Date().toISOString(),
      problemType: state.report.type,
      problemTypeLabel: ISSUE_TYPES.find((item) => item.id === state.report.type)?.label || state.report.type,
      curriculum: state.report.curriculum,
      curriculumLabel: curriculumLabel(state.report.curriculum),
      subject: resolveReportSubject(state.report),
      subjectKey: state.report.subject,
      subjectOther: String(state.report.subjectOther || "").trim(),
      date: state.report.date,
      description: state.report.description.trim(),
      followUp: Boolean(state.report.followUp),
      evidence: state.files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: file.dataUrl
      })),
      source: "web"
    };

    try {
      const result = await submitRecord("reports", payload);
      const stored = storeLocalSummary(STORAGE.reports, {
        id: result.id || payload.id,
        createdAt: payload.createdAt,
        problemTypeLabel: payload.problemTypeLabel,
        curriculumLabel: payload.curriculumLabel,
        subject: payload.subject,
        date: payload.date,
        followUp: payload.followUp,
        evidenceCount: payload.evidence.length,
        storedIn: result.storedIn || "api"
      });
      if (!stored) throw new Error("No se pudo guardar el reporte en este dispositivo.");
      state.report = emptyReportDraft();
      state.files = [];
      saveJSON(STORAGE.reportDraft, state.report);
      render();
      showSuccessModal(result.id || payload.id, result.storedIn || "api");
    } catch (error) {
      toast(error.message || "No se pudo enviar el reporte.", "error");
    } finally {
      setButtonLoading(button, false, "Enviar reporte");
    }
  }

  function validateReport(report) {
    const errors = [];
    const subject = resolveReportSubject(report);
    if (!report.type) errors.push("Selecciona el tipo de problema.");
    if (!report.curriculum) errors.push("Selecciona la malla.");
    if (!subject) errors.push("Indica el ramo o unidad.");
    if (!report.date) errors.push("Selecciona la fecha del incidente.");
    if (report.date && new Date(`${report.date}T00:00:00`) > new Date()) errors.push("La fecha no puede ser futura.");
    const description = String(report.description || "").trim();
    if (description.length < 10) errors.push("La descripción debe tener al menos 10 caracteres.");
    if (description.length > 500) errors.push("La descripción no puede superar 500 caracteres.");
    return errors;
  }

  async function submitRecord(resource, payload) {
    if (SUPABASE_ENABLED) {
      try {
        return await submitRecordSupabase(resource, payload);
      } catch (error) {
        if (!config.enableLocalFallback) throw error;
      }
    }

    const endpoint = `${String(config.apiBase || "").replace(/\/$/, "")}/api/${resource}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Error ${response.status}`);
      }
      const json = await response.json().catch(() => ({}));
      return { ...json, storedIn: "api" };
    } catch (error) {
      if (!config.enableLocalFallback) throw error;
      const safePayload = stripLargeEvidence(payload);
      const saved = storeLocalSummary(resource === "reports" ? STORAGE.reports : STORAGE.questions, {
        ...safePayload,
        storedIn: "local"
      });
      if (!saved) throw new Error("No se pudo guardar el envío localmente.");
      return { id: payload.id, storedIn: "local" };
    }
  }

  function stripLargeEvidence(payload) {
    const clone = structuredCloneSafe(payload);
    if (Array.isArray(clone.evidence)) {
      clone.evidence = clone.evidence.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));
    }
    return clone;
  }

  function structuredCloneSafe(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function storeLocalSummary(key, record) {
    const list = loadJSON(key, []);
    const exists = list.some((item) => item.id === record.id);
    if (!exists) {
      list.unshift(record);
      return saveJSON(key, list.slice(0, 100));
    }
    return true;
  }

  function setButtonLoading(button, isLoading, label) {
    if (!button) return;
    button.disabled = isLoading;
    button.innerHTML = isLoading ? `<span class="loader" aria-hidden="true"></span>${escapeHTML(label)}` : label;
  }

  function showSuccessModal(folio, storedIn) {
    const storageLabel = storedIn === "local"
      ? "No se pudo enviar al servidor. Quedó guardado solo en este dispositivo."
      : "Tu reporte fue recibido correctamente.";

    showModal(`
      <div class="success-panel">
        <div class="success-icon" aria-hidden="true">OK</div>
        <h2>Reporte recibido</h2>
        <p>${escapeHTML(storageLabel)}</p>
        <div class="folio" id="successFolio">${escapeHTML(folio)}</div>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" data-copy="${escapeHTML(folio)}">Copiar folio</button>
          <button class="btn btn-soft" type="button" data-close-modal>Volver</button>
        </div>
      </div>`);
  }

  function showQuestionSuccessModal(folio, storedIn) {
    const storageLabel = storedIn === "local"
      ? "No se pudo enviar al servidor. Quedó guardada solo en este dispositivo."
      : "Tu duda fue recibida para revisión.";

    showModal(`
      <div class="success-panel">
        <div class="success-icon" aria-hidden="true">OK</div>
        <h2>Duda enviada</h2>
        <p>${escapeHTML(storageLabel)}</p>
        <div class="folio" id="successQuestionFolio">${escapeHTML(folio)}</div>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" data-copy="${escapeHTML(folio)}">Copiar folio</button>
          <button class="btn btn-soft" type="button" data-close-modal>Volver</button>
        </div>
      </div>`);
  }

  function openQuestionModal() {
    const suggestedCategory = state.faqFilter !== "todas" ? state.faqFilter : "";
    showModal(`
      <div class="modal-head">
        <div>
          <p class="eyebrow" style="margin-bottom:8px;">Nueva duda</p>
          <h2>Envíanos tu pregunta</h2>
          <p style="color: var(--text-soft); margin-bottom: 0;">La duda se registra para revisión y posible publicación en las FAQ.</p>
        </div>
        <button class="icon-button modal-close" type="button" data-close-modal aria-label="Cerrar">x</button>
      </div>
      <form id="questionForm" class="field-grid" novalidate>
        <label class="field-grid">
          <strong>Categoría</strong>
          <select class="select" id="questionCategory" required>
            <option value="" disabled ${!suggestedCategory ? "selected" : ""}>Selecciona categoría</option>
            ${FAQ_CATEGORIES.filter((category) => category.id !== "todas").map((category) => `<option value="${category.id}" ${category.id === suggestedCategory ? "selected" : ""}>${escapeHTML(category.label)}</option>`).join("")}
          </select>
        </label>
        <label class="field-grid">
          <strong>Pregunta</strong>
          <textarea class="textarea" id="questionText" maxlength="500" placeholder="Escribe tu duda con el mayor contexto posible." required></textarea>
        </label>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit" id="submitQuestionButton">Enviar duda</button>
          <button class="btn btn-soft" type="button" data-close-modal>Cancelar</button>
        </div>
      </form>`);

    const form = document.getElementById("questionForm");
    form?.addEventListener("submit", submitQuestion);
    document.getElementById("questionText")?.focus();
  }

  async function submitQuestion(event) {
    event.preventDefault();
    const category = document.getElementById("questionCategory")?.value || "";
    const question = document.getElementById("questionText")?.value.trim() || "";
    if (!category) {
      toast("Selecciona una categoría.", "error");
      return;
    }
    if (question.length < 8) {
      toast("La pregunta debe tener al menos 8 caracteres.", "error");
      return;
    }

    const button = document.getElementById("submitQuestionButton");
    setButtonLoading(button, true, "Enviando...");
    const payload = {
      id: cryptoRandomId("DUDA"),
      createdAt: new Date().toISOString(),
      category,
      categoryLabel: categoryLabel(category),
      question,
      source: "web"
    };

    try {
      const result = await submitRecord("questions", payload);
      const stored = storeLocalSummary(STORAGE.questions, {
        id: result.id || payload.id,
        createdAt: payload.createdAt,
        categoryLabel: payload.categoryLabel,
        question: payload.question,
        storedIn: result.storedIn || "api"
      });
      if (!stored) throw new Error("No se pudo guardar la duda en este dispositivo.");
      closeModal();
      render();
      showQuestionSuccessModal(result.id || payload.id, result.storedIn || "api");
    } catch (error) {
      toast(error.message || "No se pudo enviar la duda.", "error");
    } finally {
      setButtonLoading(button, false, "Enviar duda");
    }
  }

  function openHistoryModal() {
    const reports = loadJSON(STORAGE.reports, []);
    const questions = loadJSON(STORAGE.questions, []);
    const reportItems = reports.length ? reports.slice(0, 12).map((item) => `
      <li>
        <span class="bullet">R</span>
        <span><strong>${escapeHTML(item.id || "Reporte")}</strong><br>${escapeHTML(item.problemTypeLabel || item.problemType || "Reporte")} · ${escapeHTML(item.subject || "Sin asignatura")}</span>
      </li>`).join("") : `<p style="color: var(--text-soft);">Aún no hay envíos recientes.</p>`;
    const questionItems = questions.length ? questions.slice(0, 8).map((item) => `
      <li>
        <span class="bullet">D</span>
        <span><strong>${escapeHTML(item.categoryLabel || "Duda")}</strong><br>${escapeHTML(item.question || "")}</span>
      </li>`).join("") : `<p style="color: var(--text-soft);">Aún no hay dudas enviadas desde este dispositivo.</p>`;

    showModal(`
      <div class="modal-head">
        <div>
          <h2>Tus envíos recientes</h2>
          <p style="color: var(--text-soft); margin-bottom: 0;">Consulta los folios y resúmenes más recientes enviados desde este dispositivo.</p>
        </div>
        <button class="icon-button modal-close" type="button" data-close-modal aria-label="Cerrar">x</button>
      </div>
      <h3>Reportes</h3>
      <ul class="help-list">${reportItems}</ul>
      <h3 style="margin-top: 22px;">Dudas</h3>
      <ul class="help-list">${questionItems}</ul>
      <div class="form-actions">
        <button class="btn btn-soft" type="button" data-close-modal>Cerrar</button>
      </div>`);
  }

  function showModal(innerHTML) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal" role="dialog" aria-modal="true" aria-label="Ventana" data-modal-panel>
          ${innerHTML}
        </section>
      </div>`;
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    modalRoot.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function toast(message, type = "info") {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    toastRegion.appendChild(node);
    window.setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(8px)";
      window.setTimeout(() => node.remove(), 220);
    }, 3600);
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  function cryptoRandomId(prefix) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let random = "";
    if (window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(4);
      window.crypto.getRandomValues(bytes);
      random = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    } else {
      random = Math.random().toString(16).slice(2, 10).toUpperCase();
    }
    return `${prefix}-${date}-${random}`;
  }

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  document.addEventListener("click", async (event) => {
    const target = event.target;
    const routeLink = target.closest?.("[data-route]");
    if (routeLink) closeDrawer();

    const filter = target.closest?.("[data-faq-filter]");
    if (filter) {
      state.faqFilter = filter.dataset.faqFilter;
      state.openFaqId = state.faqFilter === "todas"
        ? (FAQS[0]?.id || "")
        : (FAQS.find((faq) => faq.category === state.faqFilter)?.id || "");
      render();
      return;
    }

    const faqToggle = target.closest?.("[data-toggle-faq]");
    if (faqToggle) {
      const id = faqToggle.dataset.toggleFaq;
      state.openFaqId = state.openFaqId === id ? "" : id;
      render();
      return;
    }

    const reportType = target.closest?.("[data-report-type]");
    if (reportType) {
      state.report.type = reportType.dataset.reportType;
      saveJSON(STORAGE.reportDraft, state.report);
      render();
      return;
    }

    const removeFile = target.closest?.("[data-remove-file]");
    if (removeFile) {
      state.files = state.files.filter((file) => file.id !== removeFile.dataset.removeFile);
      render();
      return;
    }

    const agreementFilter = target.closest?.("[data-agreement-filter]");
    if (agreementFilter) {
      state.agreementFilter = agreementFilter.dataset.agreementFilter;
      render();
      return;
    }

    if (target.closest?.("[data-open-question]")) {
      openQuestionModal();
      return;
    }

    if (target.closest?.("[data-open-history]")) {
      openHistoryModal();
      return;
    }

    const openAgreement = target.closest?.("[data-open-agreement]");
    if (openAgreement) {
      openAgreementModal(Number(openAgreement.dataset.openAgreement || 0));
      return;
    }

    const previousAgreement = target.closest?.("[data-prev-agreement]");
    if (previousAgreement) {
      const index = Number(document.querySelector("[data-agreement-index]")?.dataset.agreementIndex || 0);
      openAgreementModal(index - 1);
      return;
    }

    const nextAgreement = target.closest?.("[data-next-agreement]");
    if (nextAgreement) {
      const index = Number(document.querySelector("[data-agreement-index]")?.dataset.agreementIndex || 0);
      openAgreementModal(index + 1);
      return;
    }

    const copy = target.closest?.("[data-copy]");
    if (copy) {
      try {
        await navigator.clipboard.writeText(copy.dataset.copy);
        toast("Folio copiado.", "success");
      } catch (_) {
        toast("No se pudo copiar automáticamente.", "error");
      }
      return;
    }

    const closeModalButton = target.closest?.("[data-close-modal]");
    const clickedBackdrop = target.matches?.(".modal-backdrop");
    if (closeModalButton || clickedBackdrop) {
      if (!target.closest?.("[data-modal-panel]") || closeModalButton) closeModal();
      return;
    }

    if (target.closest?.("[data-close-drawer]")) {
      closeDrawer();
    }
  });

  menuToggle.addEventListener("click", openDrawer);
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
  });

  document.addEventListener("keydown", (event) => {
    if (document.querySelector("[data-agreement-index]")) {
      const index = Number(document.querySelector("[data-agreement-index]")?.dataset.agreementIndex || 0);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        openAgreementModal(index - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        openAgreementModal(index + 1);
        return;
      }
    }
    if (event.key === "Escape") {
      closeModal();
      closeDrawer();
    }
  });

  window.addEventListener("hashchange", () => {
    render();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js?v=31").catch(() => {});
      });
  }

  render();
})();

