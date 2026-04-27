(() => {
  "use strict";

  const config = {
    appName: "CEAL",
    institutionName: "Ingenieria Civil UCN",
    subtitle: "Contingencia estudiantil",
    updateLabel: "Actualizado 23/04 · 18:40 hrs",
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
    adminStatusTable: "site_status",
    adminFaqTable: "faq_entries",
    adminAgreementTable: "agreement_entries",
    adminChannelTable: "channel_links",
    enablePublishedContentSync: false,
    privacyCopy: "Este reporte es anónimo. No se solicitan datos personales.",
    ...(window.CEAL_CONFIG || {})
  };

  const STORAGE = {
    reports: "ceal.reports.v1",
    questions: "ceal.questions.v1",
    reportDraft: "ceal.reportDraft.v1",
    academicSaved: "ceal.academic.saved.v1",
    academicDownloads: "ceal.academic.downloads.v1",
    academicContributions: "ceal.academic.contributions.v1",
    academicReports: "ceal.academic.reports.v1"
  };

  const SUPABASE_ENABLED = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const PUBLISHED_CONTENT_SYNC_ENABLED = SUPABASE_ENABLED && Boolean(config.enablePublishedContentSync);
  let supabaseClient = null;

  const ROUTES = new Set(["inicio", "material", "dudas", "reportar", "acuerdos"]);

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

  const ACADEMIC_TYPES = [
    { id: "todos", label: "Todo", icon: "folder" },
    { id: "prueba", label: "Pruebas", icon: "clipboard" },
    { id: "ejercicio", label: "Ejercicios", icon: "pencil" },
    { id: "apunte", label: "Apuntes", icon: "notebook" },
    { id: "ppt", label: "PPTs", icon: "presentation" },
    { id: "pdf", label: "PDFs", icon: "document" },
    { id: "guia", label: "Guías", icon: "book" },
    { id: "resumen", label: "Resúmenes", icon: "list" }
  ];

  const ACADEMIC_SORTS = [
    { id: "recent", label: "Más reciente" },
    { id: "downloads", label: "Más descargado" },
    { id: "rating", label: "Mejor valorado" },
    { id: "course", label: "Por ramo" }
  ];

  const ACADEMIC_COURSE_ALIAS = {
    "calculo 1": "Cálculo I",
    "calculo i": "Cálculo I",
    "calculo 2": "Cálculo II",
    "calculo ii": "Cálculo II",
    "algebra 1": "Álgebra I",
    "algebra i": "Álgebra I",
    "algebra 2": "Álgebra II",
    "algebra ii": "Álgebra II",
    "fisica 1": "Física",
    "fisica": "Física",
    "introduccion a la programacion": "Programación",
    "programacion": "Programación",
    "estatica aplicada": "Estática",
    "estatica": "Estática",
    "mecanica de suelos 1": "Mecánica de Suelos I",
    "mecanica de suelos i": "Mecánica de Suelos I",
    "mecanica de suelos 2": "Mecánica de Suelos II",
    "mecanica de suelos ii": "Mecánica de Suelos II",
    "hidraulica general": "Hidráulica",
    "hidraulica": "Hidráulica",
    "diseno en hormigon armado": "Hormigón Armado",
    "hormigon armado": "Hormigón Armado",
    "analisis estructural": "Análisis Estructural",
    "mecanica de solidos": "Mecánica de Sólidos",
    "mecanica racional": "Mecánica",
    "diseno en acero": "Diseño en Acero",
    "geomensura": "Topografía",
    "probabilidad y estadistica": "Estadística",
    "calculo numerico": "Métodos Numéricos",
    "programacion de obras": "Programación y Gestión de Obras",
    "gestion y administracion de obras": "Proyecto Gestión y Administración de Construcción",
    "construccion y montaje de obras industriales": "Construcción de Obras Industriales",
    "construccion de obras industriales": "Construcción de Obras Industriales",
    "proyecto de infraestructura vial": "Proyecto Diseño de Infraestructura Vial",
    "proyecto de estructuras industriales": "Proyecto Diseño de Estructuras Industriales",
    "proyecto de obras hidraulicas": "Proyecto Diseño de Obras Hidráulicas",
    "diseno sismico de edificios": "Análisis y Diseño Sísmico de Edificios"
  };

  const ACADEMIC_COURSE_META = {
    "calculo-i": { semester: 1, area: "Ciencias básicas", icon: "x²", accent: "blue", description: "Límites, derivadas e introducción al cálculo diferencial aplicado a problemas de ingeniería." },
    "calculo-ii": { semester: 2, area: "Ciencias básicas", icon: "∫x", accent: "orange", description: "Integrales, series y herramientas de cálculo para modelar fenómenos físicos y estructurales." },
    "algebra-i": { semester: 2, area: "Ciencias básicas", icon: "x²", accent: "blue", description: "Matrices, sistemas lineales, espacios vectoriales y bases para cursos posteriores." },
    "fisica": { semester: 2, area: "Ciencias básicas", icon: "⚛", accent: "blue", description: "Mecánica, energía y conceptos físicos base para entender sistemas de ingeniería." },
    "programacion": { semester: 3, area: "Computación", icon: "</>", accent: "green", description: "Pensamiento algorítmico, código y resolución computacional de problemas." },
    "estatica": { semester: 3, area: "Estructuras", icon: "△", accent: "blue", description: "Equilibrio de cuerpos, diagramas, reacciones y análisis de estructuras simples." },
    "mecanica-de-solidos": { semester: 4, area: "Estructuras", icon: "σ", accent: "blue", description: "Esfuerzos, deformaciones y comportamiento interno de elementos estructurales." },
    "mecanica-de-suelos-i": { semester: 4, area: "Geotecnia", icon: "▤", accent: "orange", description: "Propiedades de suelos, clasificación, compactación, permeabilidad y esfuerzos efectivos." },
    "hidraulica": { semester: 5, area: "Hidráulica", icon: "◌", accent: "blue", description: "Flujo en conductos, energía, pérdidas y fundamentos para obras hidráulicas." },
    "analisis-estructural": { semester: 5, area: "Estructuras", icon: "⌂", accent: "blue", description: "Cálculo de esfuerzos internos, deformaciones y métodos de análisis de estructuras." },
    "hormigon-armado": { semester: 6, area: "Estructuras", icon: "▥", accent: "orange", description: "Diseño y verificación de elementos de hormigón armado bajo criterios normativos." },
    "fundaciones": { semester: 7, area: "Geotecnia", icon: "▰", accent: "orange", description: "Criterios de diseño y revisión de fundaciones superficiales y profundas." },
    "diseno-en-acero": { semester: 6, area: "Estructuras", icon: "Ⅰ", accent: "blue", description: "Diseño de elementos de acero, conexiones y criterios resistentes." },
    "topografia": { semester: 3, area: "Terreno", icon: "⌖", accent: "green", description: "Medición, levantamientos, curvas de nivel y herramientas para obras civiles." },
    "programacion-y-gestion-de-obras": { semester: 7, area: "Construcción", icon: "▦", accent: "orange", description: "Planificación, programación y control de obras de ingeniería civil." }
  };

  const ACADEMIC_RESOURCE_SEED = [
    { id: "res-ae-p2-2024", course: "Análisis Estructural", title: "Prueba 2 - Análisis Estructural", type: "prueba", year: 2024, unit: "Sistemas isostáticos e hiperestáticos", format: "PDF", size: "1.2 MB", rating: 4.7, downloads: 1210, updatedDays: 3, source: "Aporte estudiantil", status: "published" },
    { id: "res-hid-guia-2024", course: "Hidráulica", title: "Guía de ejercicios - Hidráulica", type: "ejercicio", year: 2024, unit: "Pérdidas de carga", format: "PDF", size: "980 KB", rating: 4.6, downloads: 980, updatedDays: 1, source: "Recopilación CEAL", status: "published" },
    { id: "res-ha-resumen-2024", course: "Hormigón Armado", title: "Resumen de fórmulas - Hormigón Armado", type: "resumen", year: 2024, unit: "Flexión y corte", format: "PDF", size: "760 KB", rating: 4.8, downloads: 1600, updatedDays: 4, source: "Aporte estudiantil", status: "published" },
    { id: "res-suelos-apunte-u3", course: "Mecánica de Suelos I", title: "Apuntes Unidad 3 - Mecánica de Suelos", type: "apunte", year: 2024, unit: "Esfuerzos efectivos", format: "PDF", size: "2.4 MB", rating: 4.5, downloads: 870, updatedDays: 2, source: "Recopilación histórica", status: "published" },
    { id: "res-sismo-ppt-2023", course: "Análisis y Diseño Sísmico de Edificios", title: "PPT repaso - Sismología", type: "ppt", year: 2023, unit: "Espectros y respuesta", format: "PPTX", size: "5.8 MB", rating: 4.7, downloads: 760, updatedDays: 9, source: "Aporte estudiantil", status: "published" },
    { id: "res-hid-p1-2024", course: "Hidráulica", title: "Prueba 1 - Hidráulica", type: "prueba", year: 2024, unit: "Energía específica", format: "PDF", size: "1.1 MB", rating: 4.4, downloads: 653, updatedDays: 6, source: "Recopilación histórica", status: "published" },
    { id: "res-ms-ej-2023", course: "Mecánica de Sólidos", title: "Ejercicios - Resistencia de Materiales", type: "ejercicio", year: 2023, unit: "Torsión y flexión", format: "PDF", size: "1.5 MB", rating: 4.6, downloads: 598, updatedDays: 12, source: "Aporte estudiantil", status: "published" },
    { id: "res-ae-apunte-u2", course: "Análisis Estructural", title: "Apuntes Unidad 2 - Análisis Estructural", type: "apunte", year: 2023, unit: "Método de fuerzas", format: "PDF", size: "2.1 MB", rating: 4.3, downloads: 512, updatedDays: 8, source: "Aporte estudiantil", status: "published" },
    { id: "res-caminos-ppt", course: "Proyecto Diseño de Infraestructura Vial", title: "PPT introducción - Caminos", type: "ppt", year: 2023, unit: "Diseño geométrico", format: "PPTX", size: "6.2 MB", rating: 4.5, downloads: 430, updatedDays: 20, source: "Recopilación CEAL", status: "published" },
    { id: "res-suelos-final-2023", course: "Mecánica de Suelos I", title: "Prueba final - Mecánica de Suelos 2023", type: "prueba", year: 2023, unit: "Consolidación y corte", format: "PDF", size: "1.8 MB", rating: 4.7, downloads: 1100, updatedDays: 5, source: "Recopilación histórica", status: "published" },
    { id: "res-calculo2-prueba-2024", course: "Cálculo II", title: "Prueba Cálculo II 2024", type: "prueba", year: 2024, unit: "Integrales impropias", format: "PDF", size: "920 KB", rating: 4.4, downloads: 720, updatedDays: 3, source: "Aporte estudiantil", status: "published" },
    { id: "res-fisica-pruebas", course: "Física", title: "Pack pruebas de Física", type: "prueba", year: 2024, unit: "Mecánica", format: "PDF", size: "3.2 MB", rating: 4.6, downloads: 256, updatedDays: 1, source: "Recopilación CEAL", status: "published" },
    { id: "res-programacion-apuntes", course: "Programación", title: "Apuntes de Programación", type: "apunte", year: 2024, unit: "Funciones y arreglos", format: "PDF", size: "1.9 MB", rating: 4.5, downloads: 198, updatedDays: 2, source: "Aporte estudiantil", status: "published" },
    { id: "res-estatica-guia-u2", course: "Estática", title: "Guía de estática - Unidad 2", type: "guia", year: 2024, unit: "Reacciones y equilibrio", format: "PDF", size: "1.4 MB", rating: 4.8, downloads: 310, updatedDays: 2, source: "Docencia CEAL", status: "published" },
    { id: "res-algebra-ejercicios", course: "Álgebra I", title: "Ejercicios resueltos - Álgebra I", type: "ejercicio", year: 2024, unit: "Matrices", format: "PDF", size: "840 KB", rating: 4.6, downloads: 690, updatedDays: 7, source: "Aporte estudiantil", status: "published" },
    { id: "res-fundaciones-pdf", course: "Fundaciones", title: "PDF criterios de fundaciones", type: "pdf", year: 2023, unit: "Capacidad de soporte", format: "PDF", size: "2.8 MB", rating: 4.2, downloads: 355, updatedDays: 18, source: "Recopilación histórica", status: "review" }
  ];

  const ACADEMIC_BACKEND_CONTRACT = {
    tables: ["academic_courses", "academic_resources", "academic_contributions", "academic_resource_reports", "academic_download_events", "academic_saved_resources"],
    statuses: ["pending", "review", "published", "needs_fix", "archived", "reported"],
    endpoints: [
      "GET /api/academic/courses",
      "GET /api/academic/resources",
      "POST /api/academic/contributions",
      "POST /api/academic/resource-reports",
      "POST /api/academic/download-events",
      "POST /api/academic/saved-resources"
    ]
  };

  const ACADEMIC_COURSES = buildAcademicCourses();
  const ACADEMIC_RESOURCES = buildAcademicResources();

  const FAQS = [
    {
      id: "faq-asistencia-1",
      category: "asistencia",
      question: "¿Cuál es el estado del paro hoy?",
      answer: "El paro sigue vigente mientras se revisa el petitorio y se espera una bajada formal de actualizaciones para votar y ordenar los próximos pasos.",
      status: "review",
      updated: "Actualización 23 abr",
      source: "Actualización CEAL 23/04"
    },
    {
      id: "faq-evaluaciones-1",
      category: "evaluaciones",
      question: "¿Se recalendarizaron las evaluaciones?",
      answer: "Sigue pendiente de confirmar. El petitorio solicita recalendarizar evaluaciones, laboratorios, talleres y clases programadas desde el martes 21/04, además de una marcha blanca de un día al terminar la paralización.",
      status: "review",
      updated: "Petitorio 23 abr",
      source: "Petitorio FEUCN Garantías y Seguridad"
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
      question: "¿Qué medidas de seguridad están sobre la mesa?",
      answer: "Se están discutiendo actualización de protocolos, responsables claros, simulacros, capacitaciones, cámaras, sala de control y medidas de control de acceso como torniquetes o lectores QR. Siguen como puntos en revisión.",
      status: "review",
      updated: "Actualización 23 abr",
      source: "Petitorio FEUCN + actualización 23/04"
    },
    {
      id: "faq-pleno-2",
      category: "pleno",
      question: "¿Qué incluye el petitorio?",
      answer: "Incluye fuero estudiantil, recalendarización, marcha blanca, uso de Transparente UCN para acuerdos y avances, actualización de protocolos de seguridad, prevencionista de riesgos para estudiantes y refuerzo de canales institucionales.",
      status: "review",
      updated: "Petitorio 23 abr",
      source: "Petitorio FEUCN Garantías y Seguridad"
    },
    {
      id: "faq-pleno-3",
      category: "pleno",
      question: "¿El petitorio ya fue entregado formalmente?",
      answer: "Según la actualización recibida, todavía debe bajarse y votarse antes de entregarse formalmente. Se informó que Vicerrectoría ya habría visto una versión filtrada, pero eso no reemplaza la entrega formal.",
      status: "review",
      updated: "Actualización 23 abr",
      source: "Actualización 23/04"
    },
    {
      id: "faq-evaluaciones-3",
      category: "evaluaciones",
      question: "¿Cómo están operando evaluaciones y presentaciones en estos días?",
      answer: "No hay un criterio único publicado. Se reportan dudas en evaluaciones próximas, incluyendo Álgebra I. Revisa cada ramo por canales oficiales y reporta cambios, presiones o instrucciones contradictorias con respaldo.",
      status: "review",
      updated: "Actualización 23 abr",
      source: "Actualización CEAL 23/04"
    },
    {
      id: "faq-pleno-4",
      category: "pleno",
      question: "¿Qué se espera como próximo paso?",
      answer: "Se espera una nueva bajada de información para votar, ajustar acuerdos y actualizar el estado del petitorio. Mientras no exista confirmación formal, los puntos se mantienen en revisión.",
      status: "review",
      updated: "Actualización 23 abr",
      source: "Actualización CEAL 23/04"
    },
    {
      id: "faq-contacto-2",
      category: "contacto",
      question: "¿Qué se pidió levantar desde Ingeniería Civil para seguir gestionando?",
      answer: "Jefatura necesita actas de plenos y petitorios para coordinar con otras jefaturas y direcciones. Además, se pidió recopilar todas las fechas de pruebas, revisar qué hizo COPRE con la actualización de protocolos tras el paro anterior y mantener comunicación con los otros CEALES de la facultad.",
      status: "review",
      updated: "Reunión JC 22 abr",
      source: "Reunión con Jefe de Carrera"
    },
    {
      id: "faq-contacto-1",
      category: "contacto",
      question: "¿Dónde deberían publicarse acuerdos y avances?",
      answer: "El petitorio solicita que acuerdos de paralizaciones y avances queden disponibles en Transparente UCN para evitar confusiones y mejorar el seguimiento.",
      status: "confirmed",
      updated: "Petitorio 23 abr",
      source: "Petitorio FEUCN Garantías y Seguridad"
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
      title: "Petitorio FEUCN en revisión",
      summary: "El petitorio de garantías y seguridad está en revisión y debe bajarse a las bases antes de su entrega formal. Incluye fuero estudiantil, recalendarización, marcha blanca, protocolos, transparencia y medidas de seguridad.",
      status: "review",
      date: "23 abr 2026",
      area: "Petitorio",
      source: "Petitorio FEUCN Garantías y Seguridad + actualización 23/04"
    },
    {
      id: "agr-2",
      title: "Recalendarización y marcha blanca solicitadas",
      summary: "El petitorio solicita recalendarizar evaluaciones, laboratorios, talleres y clases desde el martes 21/04, y sumar una marcha blanca de un día después de finalizada la paralización.",
      status: "review",
      date: "23 abr 2026",
      area: "Evaluaciones",
      source: "Petitorio FEUCN Garantías y Seguridad"
    },
    {
      id: "agr-3",
      title: "Actualización de protocolos de seguridad",
      summary: "Se pide actualizar protocolos institucionales, incorporar escenarios como amenazas, artefactos explosivos y ataques armados, y aclarar medidas de evacuación o confinamiento según el tipo de emergencia.",
      status: "review",
      date: "23 abr 2026",
      area: "Seguridad",
      source: "Petitorio FEUCN Garantías y Seguridad"
    },
    {
      id: "agr-4",
      title: "Transparente UCN y seguimiento",
      summary: "Se solicita que acuerdos, avances, protocolos y seguimiento de compromisos estén disponibles para la comunidad, idealmente con trazabilidad y carta Gantt.",
      status: "review",
      date: "23 abr 2026",
      area: "Transparencia",
      source: "Petitorio FEUCN Garantías y Seguridad + actualización 23/04"
    },
    {
      id: "agr-5",
      title: "Medidas preventivas en evaluación",
      summary: "Se discutieron medidas como control de acceso, torniquetes, lectores QR, cámaras y sala de control. Siguen como puntos en evaluación, no como medidas confirmadas.",
      status: "review",
      date: "23 abr 2026",
      area: "Seguridad",
      source: "Actualización 23/04"
    },
    {
      id: "agr-6",
      title: "Prevencionista para estudiantes",
      summary: "El petitorio plantea incorporar una figura de prevención de riesgos enfocada en el estamento estudiantil, con funciones de comunicación, simulacros, capacitaciones y seguimiento.",
      status: "review",
      date: "23 abr 2026",
      area: "Seguridad",
      source: "Petitorio FEUCN Garantías y Seguridad"
    }
  ];

  const CHANNEL_LINKS = [
    {
      id: "channel-whatsapp",
      label: "WhatsApp",
      meta: "Comunicados",
      href: "https://chat.whatsapp.com/KIxFl5bAHBuHnOnyZb6wUH?mode=gi_t"
    },
    {
      id: "channel-instagram",
      label: "Instagram",
      meta: "@ceicucn",
      href: "https://instagram.com/ceicucn"
    },
    {
      id: "channel-assemblies",
      label: "Asambleas",
      meta: "y plenos",
      href: ""
    },
    {
      id: "channel-ucn",
      label: "Comunicados",
      meta: "UCN",
      href: ""
    }
  ];

  const SITE_STATUS = {
    heroEyebrow: "Centro CEAL",
    heroTitle: "Inicio",
    heroLead: "El paro sigue vigente mientras se revisa el petitorio y se espera una bajada formal de actualizaciones.",
    activeBadgeLabel: "Paro vigente",
    activeBadgeTone: "review",
    sourceBadgeLabel: "Petitorio en revisión",
    sourceBadgeTone: "review",
    updateLabel: config.updateLabel,
    currentKicker: "Estado de hoy",
    currentTitle: "Estado de hoy",
    currentSummary: "El paro sigue vigente mientras se revisa el petitorio y se espera una bajada formal de actualizaciones.",
    currentStatusLabel: "En revisión",
    currentStatusTone: "review",
    eventsKicker: "Pendiente",
    eventsTitle: "Pendiente de confirmar",
    events: [
      { bullet: "1", text: "Entrega formal del petitorio." },
      { bullet: "2", text: "Respuesta de vicerrectoría." },
      { bullet: "3", text: "Criterio para evaluaciones próximas." }
    ],
    lastUpdateKicker: "Seguimiento",
    lastUpdateTitle: "Próximo paso",
    lastUpdateBody: "Se espera nueva bajada de información para votar y actualizar acuerdos.",
    faqTitle: "FAQ",
    faqIntro: "Respuestas publicadas y puntos en revisión.",
    channelsKicker: "Fuentes",
    channelsTitle: "Canales base",
    channelsIntro: "Referencias y canales de coordinación."
  };

  const DASHBOARD_IMPORTANT_ITEMS = [
    {
      id: "petitorio",
      title: "Petitorio",
      body: "Incluye garantías, recalendarización, marcha blanca, protocolos y transparencia.",
      icon: "document"
    },
    {
      id: "evaluaciones",
      title: "Evaluaciones",
      body: "No hay criterio único publicado. Revisa cada ramo y reporta cambios o presiones.",
      icon: "clipboard"
    },
    {
      id: "seguridad",
      title: "Seguridad",
      body: "Se discuten protocolos, cámaras, control de acceso, simulacros y responsables.",
      icon: "shield-lock"
    }
  ];

  const DASHBOARD_PENDING_ITEMS = [
    "Entrega formal del petitorio",
    "Respuesta de vicerrectoría",
    "Criterio para evaluaciones próximas",
    "Protocolo actualizado",
    "Próximos pasos de votación"
  ];

  const DASHBOARD_QUICK_ACTIONS = [
    {
      id: "petition",
      label: "Ver petitorio",
      icon: "document",
      href: "assets/petitorio-paralizacion-2026.pdf",
      primary: true
    },
    {
      id: "agreements",
      label: "Ver acuerdos",
      icon: "handshake",
      route: "acuerdos",
      soft: true
    },
    {
      id: "report",
      label: "Reportar un caso",
      icon: "alert",
      route: "reportar"
    },
    {
      id: "question",
      label: "Enviar duda",
      icon: "message",
      question: true
    }
  ];

  const HOME_SECTION_LINKS = [
    {
      id: "material",
      title: "Material por ramo",
      body: "Busca pruebas, apuntes, guías y ejercicios por malla.",
      icon: "folder",
      route: "material"
    },
    {
      id: "dudas",
      title: "Dudas frecuentes",
      body: "Busca respuestas y envía una pregunta si falta algo.",
      icon: "message",
      route: "dudas"
    },
    {
      id: "acuerdos",
      title: "Acuerdos",
      body: "Revisa puntos publicados, pendientes y fuentes.",
      icon: "handshake",
      route: "acuerdos"
    },
    {
      id: "reportar",
      title: "Reportes",
      body: "Registra evaluaciones, presión o información contradictoria.",
      icon: "alert",
      route: "reportar"
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
    academic: {
      view: "library",
      query: "",
      course: "todos",
      curriculum: "todos",
      semester: "todos",
      area: "todos",
      type: "todos",
      format: "todos",
      sort: "recent",
      selectedResourceId: "res-ae-p2-2024"
    },
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

  function slugify(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function canonicalCourseName(name) {
    const key = normalizeText(name);
    return ACADEMIC_COURSE_ALIAS[key] || name;
  }

  function buildAcademicCourses() {
    const bySlug = new Map();
    ["malla_o", "malla_p"].forEach((curriculumId) => {
      const subjects = CURRICULUM_SUBJECTS[curriculumId] || [];
      subjects.forEach((rawName, index) => {
        if (!rawName || rawName === "__other__") return;
        const name = canonicalCourseName(rawName);
        const slug = slugify(name);
        const existing = bySlug.get(slug) || {
          id: slug,
          name,
          aliases: [],
          mallaIds: [],
          mallas: [],
          sourceOrder: index,
          semester: Math.max(1, Math.min(10, Math.ceil((index + 1) / 6))),
          area: guessCourseArea(name),
          description: `Recursos para estudiar ${name}: pruebas anteriores, ejercicios, apuntes y material de repaso.`,
          icon: "□",
          accent: "blue"
        };
        const meta = ACADEMIC_COURSE_META[slug] || {};
        existing.semester = meta.semester || existing.semester;
        existing.area = meta.area || existing.area;
        existing.description = meta.description || existing.description;
        existing.icon = meta.icon || existing.icon;
        existing.accent = meta.accent || existing.accent;
        existing.sourceOrder = Math.min(existing.sourceOrder, index);
        if (!existing.aliases.includes(rawName)) existing.aliases.push(rawName);
        if (!existing.mallaIds.includes(curriculumId)) existing.mallaIds.push(curriculumId);
        const label = curriculumLabel(curriculumId);
        if (!existing.mallas.includes(label)) existing.mallas.push(label);
        bySlug.set(slug, existing);
      });
    });
    return Array.from(bySlug.values()).sort((a, b) => a.semester - b.semester || a.name.localeCompare(b.name, "es"));
  }

  function buildAcademicResources() {
    return ACADEMIC_RESOURCE_SEED.map((item) => {
      const courseName = canonicalCourseName(item.course);
      const courseId = slugify(courseName);
      const course = ACADEMIC_COURSES.find((entry) => entry.id === courseId);
      return {
        ...item,
        courseId,
        courseName,
        semester: course?.semester || 0,
        area: course?.area || "General",
        mallaIds: course?.mallaIds || [],
        mallas: course?.mallas || [],
        typeLabel: academicTypeLabel(item.type),
        format: String(item.format || "PDF").toUpperCase(),
        updatedLabel: item.updatedDays === 1 ? "ayer" : `hace ${item.updatedDays || 1} días`
      };
    });
  }

  function guessCourseArea(name) {
    const key = normalizeText(name);
    if (/suelo|fundacion|geotec|roca/.test(key)) return "Geotecnia";
    if (/hidraul|hidrolog|sanitaria|ambiental/.test(key)) return "Hidráulica";
    if (/estructura|hormigon|acero|sism|solido|estatica|dinamica/.test(key)) return "Estructuras";
    if (/calculo|algebra|fisica|quimica|estadistica|ecuaciones|numerico/.test(key)) return "Ciencias básicas";
    if (/programacion|bim|modelo/.test(key)) return "Computación";
    if (/obra|construccion|gestion|industrial|transito|vial/.test(key)) return "Construcción";
    if (/topografia|geomensura|dibujo|camino/.test(key)) return "Terreno";
    return "General";
  }

  function academicTypeLabel(type) {
    return ACADEMIC_TYPES.find((item) => item.id === type)?.label || type;
  }

  function academicFormatClass(format) {
    const value = normalizeText(format);
    if (value.includes("ppt")) return "format-ppt";
    if (value.includes("doc")) return "format-doc";
    if (value.includes("xls")) return "format-xls";
    return "format-pdf";
  }

  function getAcademicSavedIds() {
    const value = loadJSON(STORAGE.academicSaved, []);
    return Array.isArray(value) ? value : [];
  }

  function getAcademicDownloads() {
    const value = loadJSON(STORAGE.academicDownloads, []);
    return Array.isArray(value) ? value : [];
  }

  function getAcademicContributions() {
    const value = loadJSON(STORAGE.academicContributions, []);
    return Array.isArray(value) ? value : [];
  }

  function getCourseStats(courseId) {
    const resources = ACADEMIC_RESOURCES.filter((item) => item.courseId === courseId);
    const types = [...new Set(resources.map((item) => item.type))];
    const updatedDays = resources.length ? Math.min(...resources.map((item) => item.updatedDays || 20)) : 30;
    const coverage = resources.length >= 8 ? "actualizado" : resources.length >= 3 ? "con material" : "faltan recursos";
    return { resources, count: resources.length, types, updatedDays, coverage };
  }

  function getFilteredAcademicResources() {
    const filters = state.academic;
    const query = normalizeText(filters.query);
    let items = ACADEMIC_RESOURCES.filter((item) => {
      const haystack = normalizeText(`${item.title} ${item.courseName} ${item.unit} ${item.typeLabel} ${item.year} ${item.format}`);
      if (query && !haystack.includes(query)) return false;
      if (filters.course !== "todos" && item.courseId !== filters.course) return false;
      if (filters.curriculum !== "todos" && !item.mallaIds.includes(filters.curriculum)) return false;
      if (filters.semester !== "todos" && String(item.semester) !== String(filters.semester)) return false;
      if (filters.area !== "todos" && item.area !== filters.area) return false;
      if (filters.type !== "todos" && item.type !== filters.type) return false;
      if (filters.format !== "todos" && normalizeText(item.format) !== normalizeText(filters.format)) return false;
      return true;
    });
    items = items.slice().sort((a, b) => {
      if (filters.sort === "downloads") return b.downloads - a.downloads;
      if (filters.sort === "rating") return b.rating - a.rating;
      if (filters.sort === "course") return a.courseName.localeCompare(b.courseName, "es") || b.year - a.year;
      return (a.updatedDays || 99) - (b.updatedDays || 99);
    });
    return items;
  }

  function getFilteredAcademicCourses() {
    const filters = state.academic;
    const query = normalizeText(filters.query);
    return ACADEMIC_COURSES.filter((course) => {
      const stats = getCourseStats(course.id);
      const haystack = normalizeText(`${course.name} ${course.aliases.join(" ")} ${course.area} ${course.mallas.join(" ")}`);
      if (query && !haystack.includes(query) && !stats.resources.some((resource) => normalizeText(resource.title).includes(query))) return false;
      if (filters.course !== "todos" && course.id !== filters.course) return false;
      if (filters.curriculum !== "todos" && !course.mallaIds.includes(filters.curriculum)) return false;
      if (filters.semester !== "todos" && String(course.semester) !== String(filters.semester)) return false;
      if (filters.area !== "todos" && course.area !== filters.area) return false;
      if (filters.type !== "todos" && !stats.types.includes(filters.type)) return false;
      return true;
    });
  }

  function selectedAcademicResource(resources = getFilteredAcademicResources()) {
    return ACADEMIC_RESOURCES.find((item) => item.id === state.academic.selectedResourceId)
      || resources[0]
      || ACADEMIC_RESOURCES[0];
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

  function dashboardIcon(name) {
    const icons = {
      "shield-check": `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3.2 5.4 5.8v5.4c0 4.6 2.8 8.5 6.6 9.8 3.8-1.3 6.6-5.2 6.6-9.8V5.8L12 3.2Z"></path>
          <path d="m8.8 12 2.1 2.2 4.5-5"></path>
        </svg>`,
      "shield-lock": `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3.2 5.4 5.8v5.4c0 4.6 2.8 8.5 6.6 9.8 3.8-1.3 6.6-5.2 6.6-9.8V5.8L12 3.2Z"></path>
          <rect x="9" y="10.4" width="6" height="4.8" rx="1.2"></rect>
          <path d="M10.4 10.4V9a1.6 1.6 0 0 1 3.2 0v1.4"></path>
        </svg>`,
      document: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 3.8h7l3 3v13.4H7z"></path>
          <path d="M14 3.8v3h3"></path>
          <path d="M9.5 11h5"></path>
          <path d="M9.5 14h5"></path>
          <path d="M9.5 17h3"></path>
        </svg>`,
      clipboard: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.8 4.8H6.5A1.5 1.5 0 0 0 5 6.3v13.2A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V6.3a1.5 1.5 0 0 0-1.5-1.5h-2.3"></path>
          <rect x="8.8" y="3" width="6.4" height="3.6" rx="1.2"></rect>
          <path d="m8.8 12 1.3 1.3 2.3-2.5"></path>
          <path d="M14.5 12h2"></path>
          <path d="m8.8 16.2 1.3 1.3 2.3-2.5"></path>
          <path d="M14.5 16.2h2"></path>
        </svg>`,
      handshake: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="m7.4 12.6 3.1-3.1a2 2 0 0 1 2.8 0l.8.8"></path>
          <path d="m14.2 10.4 2.4 2.4a2 2 0 0 1 0 2.8l-2.1 2.1a2.4 2.4 0 0 1-3.4 0l-3.7-3.7"></path>
          <path d="M3.5 10.8 7 7.3l3.2 3.2-3.5 3.5z"></path>
          <path d="m20.5 10.8-3.5-3.5-3.2 3.2 3.5 3.5z"></path>
        </svg>`,
      alert: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.4 4.4 2.9 17.3A1.8 1.8 0 0 0 4.5 20h15a1.8 1.8 0 0 0 1.6-2.7L13.6 4.4a1.8 1.8 0 0 0-3.2 0Z"></path>
          <path d="M12 8.7v4.5"></path>
          <path d="M12 16.8h.01"></path>
        </svg>`,
      message: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 5.4h14a1.8 1.8 0 0 1 1.8 1.8v7.6a1.8 1.8 0 0 1-1.8 1.8h-7.2L7 20v-3.4H5a1.8 1.8 0 0 1-1.8-1.8V7.2A1.8 1.8 0 0 1 5 5.4Z"></path>
          <path d="M8 10.4h.01"></path>
          <path d="M12 10.4h.01"></path>
          <path d="M16 10.4h.01"></path>
        </svg>`,
      folder: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3.8 7.3a2 2 0 0 1 2-2h4l2 2h6.4a2 2 0 0 1 2 2v7.4a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2Z"></path>
        </svg>`,
      pencil: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="m4.5 16.8-.7 3.4 3.4-.7L18.7 8a2.3 2.3 0 0 0-3.3-3.3Z"></path>
          <path d="m14.8 5.3 3.9 3.9"></path>
        </svg>`,
      notebook: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 4.2h10.2A1.8 1.8 0 0 1 19 6v12a1.8 1.8 0 0 1-1.8 1.8H7z"></path>
          <path d="M5 6h3"></path><path d="M5 10h3"></path><path d="M5 14h3"></path><path d="M5 18h3"></path>
          <path d="M11.2 8.5h4.5"></path><path d="M11.2 12h4.5"></path>
        </svg>`,
      presentation: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4.5h16"></path><path d="M5.8 4.5v10.2h12.4V4.5"></path>
          <path d="M12 14.7v4.8"></path><path d="m8.6 20 3.4-3 3.4 3"></path>
        </svg>`,
      book: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.5 5.8A2.8 2.8 0 0 1 7.3 3h12.2v15.6H7.3a2.8 2.8 0 0 0-2.8 2.8Z"></path>
          <path d="M4.5 5.8v15.6"></path><path d="M8 7h7"></path>
        </svg>`,
      list: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6h12"></path><path d="M8 12h12"></path><path d="M8 18h12"></path>
          <path d="M4 6h.01"></path><path d="M4 12h.01"></path><path d="M4 18h.01"></path>
        </svg>`,
      star: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3.8 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.1l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8Z"></path>
        </svg>`,
      download: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 4v10"></path><path d="m8 10 4 4 4-4"></path><path d="M5 19h14"></path>
        </svg>`,
      upload: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20V10"></path><path d="m8 14 4-4 4 4"></path><path d="M5 5h14"></path>
        </svg>`,
      clock: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="8.2"></circle>
          <path d="M12 7.5v5l3 1.8"></path>
        </svg>`,
      flag: `
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 21V4"></path>
          <path d="M6 5h10.2l-1 3.2 1 3.2H6"></path>
        </svg>`
    };
    return icons[name] || icons.document;
  }

  function render() {
    state.route = getRouteFromHash();

    const renderers = {
      inicio: renderHome,
      material: renderMaterial,
      dudas: renderFaqPage,
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
    const filteredFaqs = getFilteredFaqs();

    return `
      <div class="page-stack home-dashboard">
        <section class="dashboard-title" aria-labelledby="home-title">
          <h1 id="home-title">Inicio</h1>
        </section>

        <section class="dashboard-top-grid" aria-label="Resumen principal">
          <article class="dashboard-status-card">
            <div class="dashboard-status-icon" aria-hidden="true">${dashboardIcon("shield-check")}</div>
            <div class="dashboard-status-copy">
              <h2>${escapeHTML(SITE_STATUS.currentTitle)}</h2>
              <p>${escapeHTML(SITE_STATUS.currentSummary)}</p>
              <div class="dashboard-badges">
                <span class="dashboard-badge dashboard-badge-primary">${escapeHTML(SITE_STATUS.activeBadgeLabel)}</span>
                <span class="dashboard-badge dashboard-badge-info">${escapeHTML(SITE_STATUS.sourceBadgeLabel)}</span>
                <span class="dashboard-badge dashboard-badge-warning">Recalendarización pendiente</span>
              </div>
              <div class="dashboard-updated">
                ${dashboardIcon("clock")}
                <span>${escapeHTML(SITE_STATUS.updateLabel)}</span>
              </div>
            </div>
          </article>

          <article class="dashboard-pending-card">
            <h2>Pendiente de confirmar</h2>
            <ul>
              ${DASHBOARD_PENDING_ITEMS.map((item) => `<li><span aria-hidden="true"></span>${escapeHTML(item)}</li>`).join("")}
            </ul>
          </article>
        </section>

        <section class="dashboard-main-grid">
          <section class="dashboard-important-section" aria-labelledby="important-title">
            <h2 id="important-title" class="dashboard-section-title">Lo más importante</h2>
            <div class="dashboard-important-grid">
              ${DASHBOARD_IMPORTANT_ITEMS.map((item) => `
                <article class="dashboard-info-card">
                  <div class="dashboard-info-icon" aria-hidden="true">${dashboardIcon(item.icon)}</div>
                  <div>
                    <h3>${escapeHTML(item.title)}</h3>
                    <p>${escapeHTML(item.body)}</p>
                  </div>
                </article>`).join("")}
            </div>
          </section>

          <aside class="dashboard-actions-panel" aria-labelledby="quick-actions-title">
            <h2 id="quick-actions-title" class="dashboard-section-title">Acciones rápidas</h2>
            <div class="dashboard-action-grid">
              ${DASHBOARD_QUICK_ACTIONS.map(renderDashboardAction).join("")}
            </div>
          </aside>

          <section class="dashboard-follow-section" aria-labelledby="follow-title">
            <h2 id="follow-title" class="dashboard-section-title">Seguimiento</h2>
            <article class="dashboard-follow-card">
              <div class="dashboard-follow-icon" aria-hidden="true">${dashboardIcon("flag")}</div>
              <div>
                <h3>${escapeHTML(SITE_STATUS.lastUpdateTitle)}</h3>
                <p>${escapeHTML(SITE_STATUS.lastUpdateBody)}</p>
              </div>
              <span class="dashboard-follow-arrow" aria-hidden="true">${iconChevron()}</span>
            </article>
          </section>
        </section>

        <section class="dashboard-sections-panel" aria-labelledby="sections-title">
          <h2 id="sections-title" class="dashboard-section-title">Secciones</h2>
          <div class="dashboard-section-grid">
            ${HOME_SECTION_LINKS.map(renderHomeSectionLink).join("")}
          </div>
        </section>

        ${renderFaqPanel()}
      </div>
    `;
  }

  function renderFaqPage() {
    return `
      <div class="page-stack">
        <section class="dashboard-title" aria-labelledby="dudas-title">
          <p class="eyebrow">Dudas</p>
          <h1 id="dudas-title">Preguntas frecuentes</h1>
        </section>
        ${renderFaqPanel({ panelClass: "dashboard-faq-panel is-standalone", titleId: "faq-page-title", showAskAction: true })}
      </div>
    `;
  }

  function renderFaqPanel({ panelClass = "dashboard-faq-panel", titleId = "faq-section-title", showAskAction = false } = {}) {
    const filteredFaqs = getFilteredFaqs();
    return `
      <section class="${panelClass}" aria-labelledby="${titleId}">
        <div class="faq-section-intro">
          <div>
            <h2 id="${titleId}">${escapeHTML(SITE_STATUS.faqTitle)}</h2>
            <p>${escapeHTML(SITE_STATUS.faqIntro)}</p>
          </div>
          <label class="search-input dashboard-search">
            ${iconSearch()}
            <input id="faqSearch" type="search" inputmode="search" autocomplete="off" placeholder="Buscar una pregunta..." value="${escapeHTML(state.faqQuery)}" />
          </label>
          ${showAskAction ? `<button class="btn btn-primary" type="button" data-open-question>Enviar duda</button>` : ""}
        </div>

        <div class="category-row" aria-label="Filtros de preguntas frecuentes">
          ${FAQ_CATEGORIES.map((category) => `
            <button class="category-chip" type="button" data-faq-filter="${category.id}" aria-pressed="${state.faqFilter === category.id}">
              <span class="chip-icon" aria-hidden="true">${category.icon}</span>${escapeHTML(category.label)}
            </button>`).join("")}
        </div>

        <div class="faq-list" aria-live="polite">
          ${filteredFaqs.length ? filteredFaqs.map(renderFaqCard).join("") : renderEmpty("No encontramos preguntas con ese filtro.", "Prueba otra búsqueda o envía una nueva duda para que el CEAL pueda responderla.")}
        </div>
      </section>
    `;
  }

  function renderHomeSectionLink(item) {
    return `
      <a class="dashboard-section-card" href="#${escapeHTML(item.route)}" data-route="${escapeHTML(item.route)}">
        <span class="dashboard-section-icon" aria-hidden="true">${dashboardIcon(item.icon)}</span>
        <span>
          <strong>${escapeHTML(item.title)}</strong>
          <small>${escapeHTML(item.body)}</small>
        </span>
        <span class="dashboard-section-arrow" aria-hidden="true">${iconChevron()}</span>
      </a>
    `;
  }

  function renderMaterial() {
    const resources = getFilteredAcademicResources();
    const courses = getFilteredAcademicCourses();
    const selected = selectedAcademicResource(resources);
    if (selected && state.academic.selectedResourceId !== selected.id) state.academic.selectedResourceId = selected.id;
    const view = state.academic.view;

    return `
      <div class="academic-layout">
        ${renderAcademicSidebar()}
        <section class="academic-workspace" aria-labelledby="academic-title">
          <header class="academic-hero">
            <div>
              <p class="eyebrow">Apoyo académico</p>
              <h1 id="academic-title">Biblioteca académica</h1>
              <p>Recursos útiles para estudiar Ingeniería Civil UCN.</p>
            </div>
            <div class="academic-hero-actions">
              <button class="btn btn-soft" type="button" data-open-contribution>Subir aporte</button>
              <button class="btn btn-primary" type="button" data-academic-view="manage">Gestión Docencia CEAL</button>
            </div>
          </header>

          ${renderAcademicFilters()}

          <div class="academic-mobile-tabs" aria-label="Vistas de material">
            ${renderAcademicViewButton("library", "Biblioteca")}
            ${renderAcademicViewButton("courses", "Por ramo")}
            ${renderAcademicViewButton("saved", "Guardados")}
            ${renderAcademicViewButton("downloads", "Descargas")}
          </div>

          ${view === "courses" ? renderAcademicCoursesView(courses) : ""}
          ${view === "saved" ? renderAcademicSavedView() : ""}
          ${view === "downloads" ? renderAcademicDownloadsView() : ""}
          ${view === "uploads" ? renderAcademicUploadsView() : ""}
          ${view === "requests" ? renderAcademicRequestsView() : ""}
          ${view === "manage" ? renderAcademicManageView() : ""}
          ${view === "library" ? renderAcademicLibraryView(resources, selected) : ""}
        </section>
      </div>
    `;
  }

  function renderAcademicSidebar() {
    const items = [
      ["library", "Biblioteca académica", "book"],
      ["courses", "Por ramo", "folder"],
      ["saved", "Mis guardados", "star"],
      ["downloads", "Mis descargas", "download"],
      ["uploads", "Subidas", "upload"],
      ["requests", "Solicitudes", "message"],
      ["manage", "Gestión Docencia CEAL", "clipboard"]
    ];
    return `
      <aside class="academic-sidebar" aria-label="Material académico">
        <div class="academic-sidebar-brand">
          <img src="assets/logo-ingenieria-civil.png?v=43" alt="" />
          <strong>CEAL</strong>
          <span>Ingeniería Civil UCN</span>
        </div>
        <nav>
          ${items.map(([view, label, icon]) => `
            <button class="academic-side-link" type="button" data-academic-view="${view}" aria-current="${state.academic.view === view ? "page" : "false"}">
              ${dashboardIcon(icon)}<span>${escapeHTML(label)}</span>
            </button>
          `).join("")}
        </nav>
        <div class="academic-sidebar-card">
          <strong>¿No encuentras algo?</strong>
          <span>Solicita o sube un recurso para revisión.</span>
          <button class="btn btn-soft" type="button" data-open-contribution>Subir aporte</button>
        </div>
      </aside>
    `;
  }

  function renderAcademicViewButton(view, label) {
    return `<button class="academic-view-chip" type="button" data-academic-view="${view}" aria-pressed="${state.academic.view === view}">${escapeHTML(label)}</button>`;
  }

  function renderAcademicFilters() {
    const semesters = [...new Set(ACADEMIC_COURSES.map((course) => course.semester))].sort((a, b) => a - b);
    const areas = [...new Set(ACADEMIC_COURSES.map((course) => course.area))].sort((a, b) => a.localeCompare(b, "es"));
    const formats = [...new Set(ACADEMIC_RESOURCES.map((resource) => resource.format))].sort();
    return `
      <section class="academic-filters" aria-label="Filtros de biblioteca">
        <label class="academic-search">
          ${iconSearch()}
          <input id="academicSearch" type="search" autocomplete="off" placeholder="Buscar prueba, apunte, guía o ejercicio" value="${escapeHTML(state.academic.query)}" />
          <span>/</span>
        </label>
        <div class="academic-filter-row">
          ${renderAcademicSelect("academicCourseFilter", "Ramo", state.academic.course, [["todos", "Ramo"], ...ACADEMIC_COURSES.map((course) => [course.id, course.name])])}
          ${renderAcademicSelect("academicSemesterFilter", "Semestre", state.academic.semester, [["todos", "Semestre"], ...semesters.map((semester) => [String(semester), `Semestre ${semester}`])])}
          ${renderAcademicSelect("academicCurriculumFilter", "Malla", state.academic.curriculum, [["todos", "Malla"], ...CURRICULUMS.filter((item) => item.id !== "general").map((item) => [item.id, item.label])])}
          ${renderAcademicSelect("academicAreaFilter", "Área", state.academic.area, [["todos", "Área"], ...areas.map((area) => [area, area])])}
          ${renderAcademicSelect("academicFormatFilter", "Formato", state.academic.format, [["todos", "Formato"], ...formats.map((format) => [format, format])])}
          <button class="academic-clear" type="button" data-clear-academic-filters>Limpiar filtros</button>
        </div>
        <div class="academic-type-row" aria-label="Tipos de recurso">
          ${ACADEMIC_TYPES.map((type) => `
            <button class="academic-type-chip" type="button" data-academic-type="${type.id}" aria-pressed="${state.academic.type === type.id}">
              ${dashboardIcon(type.icon)}<span>${escapeHTML(type.label)}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderAcademicSelect(id, label, value, options) {
    return `
      <label class="academic-select" for="${id}">
        <span class="sr-only">${escapeHTML(label)}</span>
        <select id="${id}">
          ${options.map(([optionValue, optionLabel]) => `<option value="${escapeHTML(optionValue)}" ${String(value) === String(optionValue) ? "selected" : ""}>${escapeHTML(optionLabel)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderAcademicLibraryView(resources, selected) {
    return `
      <section class="academic-library-grid">
        <div class="academic-results">
          <div class="academic-sortbar">
            <span>Ordenar por:</span>
            <div class="segmented-control">
              ${ACADEMIC_SORTS.map((sort) => `<button type="button" data-academic-sort="${sort.id}" aria-pressed="${state.academic.sort === sort.id}">${escapeHTML(sort.label)}</button>`).join("")}
            </div>
            <strong>${resources.length} recursos</strong>
          </div>
          <div class="academic-resource-list" role="list">
            ${resources.length ? resources.map(renderAcademicResourceRow).join("") : renderEmpty("No hay recursos con esos filtros.", "Prueba limpiar filtros o solicita material a Docencia CEAL.")}
          </div>
        </div>
        ${renderAcademicPreview(selected)}
      </section>
    `;
  }

  function renderAcademicResourceRow(resource) {
    const isSelected = state.academic.selectedResourceId === resource.id;
    return `
      <button class="academic-resource-row ${isSelected ? "is-selected" : ""}" type="button" data-select-resource="${escapeHTML(resource.id)}" role="listitem">
        <span class="academic-file-icon ${academicFormatClass(resource.format)}">${escapeHTML(resource.format)}</span>
        <span class="academic-resource-title">
          <strong>${escapeHTML(resource.title)}</strong>
          <small>${escapeHTML(resource.courseName)} · ${escapeHTML(resource.typeLabel)} · ${escapeHTML(resource.unit)}</small>
        </span>
        <span>${escapeHTML(resource.courseName)}</span>
        <span>${resource.semester}</span>
        <span>${resource.year}</span>
        <span class="academic-format ${academicFormatClass(resource.format)}">${escapeHTML(resource.format)}</span>
        <span>★ ${resource.rating.toFixed(1)}</span>
        <span>${formatCompactNumber(resource.downloads)}</span>
      </button>
    `;
  }

  function renderAcademicPreview(resource) {
    if (!resource) return `<aside class="academic-preview">${renderEmpty("Selecciona un recurso.", "El panel mostrará una vista previa y acciones rápidas.")}</aside>`;
    const saved = getAcademicSavedIds().includes(resource.id);
    return `
      <aside class="academic-preview" aria-label="Vista previa de recurso">
        <header>
          <div class="academic-preview-title">
            <span class="academic-file-icon ${academicFormatClass(resource.format)}">${escapeHTML(resource.format)}</span>
            <div>
              <h2>${escapeHTML(resource.title)}</h2>
              <p>${escapeHTML(resource.courseName)} · ${resource.semester}° semestre · ${resource.year}</p>
            </div>
          </div>
          <button class="icon-button" type="button" data-clear-preview aria-label="Cerrar vista previa">x</button>
        </header>
        <div class="academic-preview-meta">
          <span>${escapeHTML(resource.typeLabel)}</span>
          <span>${escapeHTML(resource.format)}</span>
          <span>${escapeHTML(resource.size)}</span>
          <span>★ ${resource.rating.toFixed(1)}</span>
          <span>${formatCompactNumber(resource.downloads)} descargas</span>
        </div>
        <div class="academic-pdf-preview" aria-hidden="true">
          <div class="academic-preview-toolbar"><span>1 / 6</span><span>100%</span><span>+</span><span>↧</span></div>
          <div class="academic-paper">
            <strong>${escapeHTML(resource.title)}</strong>
            <small>${escapeHTML(resource.unit)}</small>
            <div class="academic-diagram">
              <span></span><span></span><span></span>
            </div>
            <p>1. Determine las reacciones y desarrolle el procedimiento principal.</p>
            <p>2. Justifique supuestos, unidades y resultado final.</p>
            <div class="academic-diagram is-secondary">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
        <div class="academic-preview-actions">
          <button class="btn btn-soft" type="button" data-save-resource="${escapeHTML(resource.id)}">${saved ? "Guardado" : "Guardar"}</button>
          <button class="btn btn-primary" type="button" data-download-resource="${escapeHTML(resource.id)}">Descargar</button>
          <button class="btn btn-danger" type="button" data-report-resource="${escapeHTML(resource.id)}">Reportar error</button>
        </div>
        <footer>
          <span>Fuente: ${escapeHTML(resource.source)}</span>
          <span class="academic-verified">Publicado</span>
        </footer>
      </aside>
    `;
  }

  function renderAcademicCoursesView(courses) {
    const popular = ["algebra-i", "calculo-ii", "fisica", "programacion"].map((id) => ACADEMIC_COURSES.find((course) => course.id === id)).filter(Boolean);
    return `
      <section class="academic-courses-view">
        <div class="academic-section-head">
          <h2>Material por ramo</h2>
          <p>${courses.length} ramos cruzados con malla O/P y recursos disponibles.</p>
        </div>
        <div class="academic-popular-row">
          ${popular.map((course) => `<button type="button" data-select-course="${course.id}"><span>${escapeHTML(course.icon)}</span>${escapeHTML(course.name)}</button>`).join("")}
        </div>
        <div class="academic-course-list">
          ${courses.map(renderAcademicCourseCard).join("")}
        </div>
      </section>
    `;
  }

  function renderAcademicCourseCard(course) {
    const stats = getCourseStats(course.id);
    return `
      <article class="academic-course-card">
        <button type="button" data-select-course="${escapeHTML(course.id)}">
          <span class="academic-course-icon accent-${escapeHTML(course.accent)}">${escapeHTML(course.icon)}</span>
          <span>
            <strong>${escapeHTML(course.name)}</strong>
            <small>Semestre ${course.semester} · ${stats.count} recursos · ${stats.updatedDays === 1 ? "actualizado ayer" : `actualizado hace ${stats.updatedDays} días`}</small>
            <em>${escapeHTML(course.mallas.join(" · "))}</em>
          </span>
          ${iconChevron()}
        </button>
      </article>
    `;
  }

  function renderAcademicSavedView() {
    const savedIds = getAcademicSavedIds();
    const resources = ACADEMIC_RESOURCES.filter((resource) => savedIds.includes(resource.id));
    return `<section class="academic-simple-panel"><h2>Mis guardados</h2><div class="academic-resource-list">${resources.length ? resources.map(renderAcademicResourceRow).join("") : renderEmpty("Aún no guardas recursos.", "Usa Guardar en cualquier recurso para verlo acá.")}</div></section>`;
  }

  function renderAcademicDownloadsView() {
    const downloads = getAcademicDownloads();
    const resources = downloads.map((item) => ACADEMIC_RESOURCES.find((resource) => resource.id === item.resourceId)).filter(Boolean);
    return `<section class="academic-simple-panel"><h2>Mis descargas</h2><p class="muted-copy">${downloads.length} eventos guardados en este dispositivo.</p><div class="academic-resource-list">${resources.length ? resources.map(renderAcademicResourceRow).join("") : renderEmpty("Todavía no descargas recursos.", "Las descargas demo se registran localmente.")}</div></section>`;
  }

  function renderAcademicUploadsView() {
    const contributions = getAcademicContributions();
    return `
      <section class="academic-simple-panel">
        <div class="academic-section-head">
          <h2>Subidas</h2>
          <button class="btn btn-primary" type="button" data-open-contribution>Subir aporte</button>
        </div>
        <div class="academic-submission-list">
          ${contributions.length ? contributions.map((item) => `
            <article>
              <strong>${escapeHTML(item.title)}</strong>
              <span>${escapeHTML(item.courseName)} · ${escapeHTML(item.typeLabel)} · pendiente de revisión</span>
            </article>`).join("") : renderEmpty("Sin aportes enviados.", "Sube pruebas, apuntes, guías o ejercicios para que Docencia CEAL los revise.")}
        </div>
      </section>
    `;
  }

  function renderAcademicRequestsView() {
    const lowCoverage = ACADEMIC_COURSES.filter((course) => getCourseStats(course.id).count < 2).slice(0, 8);
    return `
      <section class="academic-simple-panel">
        <h2>Solicitudes de material</h2>
        <p class="muted-copy">Ramos con poca cobertura para priorizar recopilación.</p>
        <div class="academic-course-list compact">
          ${lowCoverage.map(renderAcademicCourseCard).join("")}
        </div>
      </section>
    `;
  }

  function renderAcademicManageView() {
    const contributions = getAcademicContributions();
    const reports = loadJSON(STORAGE.academicReports, []);
    const operationalBlocks = ["Ramos normalizados", "Recursos publicados", "Aportes pendientes", "Reportes de archivo", "Descargas", "Guardados"];
    return `
      <section class="academic-manage-grid">
        <article class="academic-manage-card">
          <h2>Gestión Docencia CEAL</h2>
          <p>Base lista para ordenar recursos por ramo, revisar aportes y mantener el material actualizado.</p>
          <div class="academic-contract-list">
            ${operationalBlocks.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}
          </div>
        </article>
        <article class="academic-manage-card">
          <h3>Aportes pendientes</h3>
          <strong>${contributions.length}</strong>
          <p>Revisar, corregir datos del recurso y publicar.</p>
        </article>
        <article class="academic-manage-card">
          <h3>Archivos reportados</h3>
          <strong>${Array.isArray(reports) ? reports.length : 0}</strong>
          <p>Errores, links caídos o material mal clasificado.</p>
        </article>
        <article class="academic-manage-card">
          <h3>Ramos con poco material</h3>
          <strong>${ACADEMIC_COURSES.filter((course) => getCourseStats(course.id).count < 2).length}</strong>
          <p>Prioridad para campaña de aportes.</p>
        </article>
      </section>
    `;
  }

  function renderDashboardAction(action) {
    const className = [
      "dashboard-action-card",
      action.primary ? "is-primary" : "",
      action.soft ? "is-soft" : ""
    ].filter(Boolean).join(" ");
    const body = `
      <span class="dashboard-action-icon" aria-hidden="true">${dashboardIcon(action.icon)}</span>
      <strong>${escapeHTML(action.label)}</strong>
    `;
    if (action.href) {
      return `<a class="${className}" href="${escapeHTML(action.href)}" target="_blank" rel="noreferrer">${body}</a>`;
    }
    if (action.route) {
      return `<a class="${className}" href="#${escapeHTML(action.route)}" data-route="${escapeHTML(action.route)}">${body}</a>`;
    }
    return `<button class="${className}" type="button" data-open-question>${body}</button>`;
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
    const effectiveStatus = faq.id === "faq-asistencia-1" && faq.status === "none" ? "review" : faq.status;
    return `
      <article class="faq-card ${isOpen ? "is-open" : ""}">
        <button class="faq-question" type="button" data-toggle-faq="${faq.id}" aria-expanded="${isOpen}" aria-controls="answer-${faq.id}">
          <strong>${escapeHTML(faq.question)}</strong>
          ${statusBadge(effectiveStatus)}
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

  function replaceArray(target, items) {
    target.splice(0, target.length, ...items);
  }

  function normalizeStatusTone(value, fallback = "review") {
    const tone = String(value || "").trim().toLowerCase();
    if (tone === "confirmed" || tone === "review" || tone === "none") return tone;
    return fallback;
  }

  function mapFaqRow(row) {
    const status = normalizeStatusTone(row.status, "review");
    return {
      id: row.id,
      category: row.category || "otro",
      question: row.question || "",
      answer: row.answer || "",
      status: row.id === "faq-asistencia-1" && status === "none" ? "review" : status,
      updated: row.updated_label || row.updated || config.updateLabel,
      source: row.source_label || row.source || ""
    };
  }

  function mapAgreementRow(row) {
    return {
      id: row.id,
      title: row.title || "",
      summary: row.summary || "",
      status: normalizeStatusTone(row.status, "review"),
      date: row.date_label || row.date || "",
      area: row.area || "General",
      source: row.source_label || row.source || ""
    };
  }

  function mapChannelRow(row) {
    return {
      id: row.id,
      label: row.label || "",
      meta: row.meta || "",
      href: row.href || ""
    };
  }

  function applySiteStatusRow(row) {
    if (!row) return;
    SITE_STATUS.heroEyebrow = row.hero_eyebrow || SITE_STATUS.heroEyebrow;
    SITE_STATUS.heroTitle = row.hero_title || SITE_STATUS.heroTitle;
    SITE_STATUS.heroLead = row.hero_lead || SITE_STATUS.heroLead;
    SITE_STATUS.activeBadgeLabel = row.active_badge_label || SITE_STATUS.activeBadgeLabel;
    SITE_STATUS.activeBadgeTone = normalizeStatusTone(row.active_badge_tone, SITE_STATUS.activeBadgeTone);
    SITE_STATUS.sourceBadgeLabel = row.source_badge_label || SITE_STATUS.sourceBadgeLabel;
    SITE_STATUS.sourceBadgeTone = normalizeStatusTone(row.source_badge_tone, SITE_STATUS.sourceBadgeTone);
    SITE_STATUS.updateLabel = row.update_label || SITE_STATUS.updateLabel;
    SITE_STATUS.currentKicker = row.current_kicker || SITE_STATUS.currentKicker;
    SITE_STATUS.currentTitle = row.current_title || SITE_STATUS.currentTitle;
    SITE_STATUS.currentSummary = row.current_summary || SITE_STATUS.currentSummary;
    SITE_STATUS.currentStatusLabel = row.current_status_label || SITE_STATUS.currentStatusLabel;
    SITE_STATUS.currentStatusTone = normalizeStatusTone(row.current_status_tone, SITE_STATUS.currentStatusTone);
    SITE_STATUS.eventsKicker = row.events_kicker || SITE_STATUS.eventsKicker;
    SITE_STATUS.eventsTitle = row.events_title || SITE_STATUS.eventsTitle;
    if (Array.isArray(row.events_json) && row.events_json.length) {
      SITE_STATUS.events = row.events_json.map((item) => ({
        bullet: String(item.bullet || ""),
        text: String(item.text || "")
      }));
    }
    SITE_STATUS.lastUpdateKicker = row.last_update_kicker || SITE_STATUS.lastUpdateKicker;
    SITE_STATUS.lastUpdateTitle = row.last_update_title || SITE_STATUS.lastUpdateTitle;
    SITE_STATUS.lastUpdateBody = row.last_update_body || SITE_STATUS.lastUpdateBody;
    SITE_STATUS.faqTitle = row.faq_title || SITE_STATUS.faqTitle;
    SITE_STATUS.faqIntro = row.faq_intro || SITE_STATUS.faqIntro;
    SITE_STATUS.channelsKicker = row.channels_kicker || SITE_STATUS.channelsKicker;
    SITE_STATUS.channelsTitle = row.channels_title || SITE_STATUS.channelsTitle;
    SITE_STATUS.channelsIntro = row.channels_intro || SITE_STATUS.channelsIntro;
  }

  async function loadPublishedContent() {
    if (!PUBLISHED_CONTENT_SYNC_ENABLED) return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: statusRow } = await client
        .from(config.adminStatusTable)
        .select("hero_eyebrow, hero_title, hero_lead, active_badge_label, active_badge_tone, source_badge_label, source_badge_tone, update_label, current_kicker, current_title, current_summary, current_status_label, current_status_tone, events_kicker, events_title, events_json, last_update_kicker, last_update_title, last_update_body, faq_title, faq_intro, channels_kicker, channels_title, channels_intro")
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (statusRow) applySiteStatusRow(statusRow);
    } catch (_) {
      // fallback a contenido embebido
    }

    try {
      const { data } = await client
        .from(config.adminFaqTable)
        .select("id, category, question, answer, status, updated_label, source_label")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (Array.isArray(data) && data.length) replaceArray(FAQS, data.map(mapFaqRow));
    } catch (_) {
      // fallback a contenido embebido
    }

    try {
      const { data } = await client
        .from(config.adminAgreementTable)
        .select("id, title, summary, status, date_label, area, source_label")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (Array.isArray(data) && data.length) replaceArray(AGREEMENTS, data.map(mapAgreementRow));
    } catch (_) {
      // fallback a contenido embebido
    }

    try {
      const { data } = await client
        .from(config.adminChannelTable)
        .select("id, label, meta, href")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (Array.isArray(data) && data.length) replaceArray(CHANNEL_LINKS, data.map(mapChannelRow));
    } catch (_) {
      // fallback a contenido embebido
    }

    if (!FAQS.some((faq) => faq.id === state.openFaqId)) {
      state.openFaqId = FAQS[0]?.id || "";
    }
  }

  async function refreshPublishedContentAndRender() {
    try {
      await loadPublishedContent();
      if (state.route !== "reportar" && !modalRoot.innerHTML) render();
    } catch (_) {
      // Sin bloquear la UI si falla la sincronizacion.
    }
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
    const filters = ["todos", ...new Set(AGREEMENTS.map((item) => item.area))];
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

    const academicSearch = document.getElementById("academicSearch");
    if (academicSearch) {
      academicSearch.addEventListener("input", (event) => {
        state.academic.query = event.target.value;
        render();
        const input = document.getElementById("academicSearch");
        if (input) {
          input.focus();
          const end = input.value.length;
          input.setSelectionRange(end, end);
        }
      });
    }

    [
      ["academicCourseFilter", "course"],
      ["academicSemesterFilter", "semester"],
      ["academicCurriculumFilter", "curriculum"],
      ["academicAreaFilter", "area"],
      ["academicFormatFilter", "format"]
    ].forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("change", (event) => {
          state.academic[key] = event.target.value;
          if (key === "course" && event.target.value !== "todos") {
            const resource = ACADEMIC_RESOURCES.find((item) => item.courseId === event.target.value);
            if (resource) state.academic.selectedResourceId = resource.id;
          }
          render();
        });
      }
    });

    const contributionForm = document.getElementById("academicContributionForm");
    if (contributionForm) contributionForm.addEventListener("submit", submitAcademicContribution);

    const resourceReportForm = document.getElementById("academicResourceReportForm");
    if (resourceReportForm) resourceReportForm.addEventListener("submit", submitAcademicResourceReport);

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

  function toggleAcademicSaved(resourceId) {
    const saved = getAcademicSavedIds();
    const next = saved.includes(resourceId)
      ? saved.filter((id) => id !== resourceId)
      : [...saved, resourceId];
    saveJSON(STORAGE.academicSaved, next);
    toast(next.includes(resourceId) ? "Recurso guardado." : "Recurso quitado de guardados.", "success");
  }

  function recordAcademicDownload(resourceId) {
    const resource = ACADEMIC_RESOURCES.find((item) => item.id === resourceId);
    const downloads = getAcademicDownloads();
    downloads.unshift({
      id: cryptoRandomId("DESC"),
      resourceId,
      title: resource?.title || "Recurso",
      courseName: resource?.courseName || "",
      createdAt: new Date().toISOString()
    });
    saveJSON(STORAGE.academicDownloads, downloads.slice(0, 80));
  }

  function openAcademicContributionModal() {
    const courseOptions = ACADEMIC_COURSES.map((course) => `<option value="${escapeHTML(course.id)}" ${state.academic.course === course.id ? "selected" : ""}>${escapeHTML(course.name)}</option>`).join("");
    showModal(`
      <div class="modal-head">
        <div>
          <p class="eyebrow" style="margin-bottom:8px;">Apoyo académico</p>
          <h2>Subir aporte</h2>
          <p style="color: var(--text-soft); margin-bottom: 0;">Queda pendiente de revisión por Docencia CEAL antes de publicarse.</p>
        </div>
        <button class="icon-button modal-close" type="button" data-close-modal aria-label="Cerrar">x</button>
      </div>
      <form id="academicContributionForm" class="field-grid" novalidate>
        <label class="field-grid">
          <strong>Ramo</strong>
          <select id="academicContributionCourse" required>
            <option value="">Selecciona ramo</option>
            ${courseOptions}
          </select>
        </label>
        <label class="field-grid">
          <strong>Tipo de recurso</strong>
          <select id="academicContributionType" required>
            ${ACADEMIC_TYPES.filter((type) => type.id !== "todos").map((type) => `<option value="${escapeHTML(type.id)}">${escapeHTML(type.label)}</option>`).join("")}
          </select>
        </label>
        <label class="field-grid">
          <strong>Título</strong>
          <input id="academicContributionTitle" class="form-control" type="text" placeholder="Ej: Prueba 1 Hidráulica 2024" required />
        </label>
        <div class="form-two">
          <label class="field-grid">
            <strong>Año</strong>
            <input id="academicContributionYear" class="form-control" type="number" min="2018" max="2026" value="2024" />
          </label>
          <label class="field-grid">
            <strong>Formato</strong>
            <select id="academicContributionFormat">
              <option>PDF</option>
              <option>PPTX</option>
              <option>DOCX</option>
              <option>XLSX</option>
              <option>Link</option>
            </select>
          </label>
        </div>
        <label class="field-grid">
          <strong>Unidad o tema</strong>
          <input id="academicContributionUnit" class="form-control" type="text" placeholder="Ej: energía específica, matrices, flexión" />
        </label>
        <label class="field-grid">
          <strong>Archivo o link</strong>
          <input id="academicContributionLink" class="form-control" type="text" placeholder="Pega un link o escribe nombre del archivo" />
        </label>
        <label class="check-row">
          <input id="academicContributionConsent" type="checkbox" required />
          <span>Confirmo que este material puede compartirse con fines académicos.</span>
        </label>
        <div class="form-actions">
          <button class="btn btn-primary" id="academicSubmitContribution" type="submit">Enviar aporte</button>
          <button class="btn btn-soft" type="button" data-close-modal>Cancelar</button>
        </div>
      </form>
    `);
    wireCurrentPage();
  }

  function submitAcademicContribution(event) {
    event.preventDefault();
    const courseId = document.getElementById("academicContributionCourse")?.value || "";
    const course = ACADEMIC_COURSES.find((item) => item.id === courseId);
    const type = document.getElementById("academicContributionType")?.value || "pdf";
    const title = String(document.getElementById("academicContributionTitle")?.value || "").trim();
    const consent = document.getElementById("academicContributionConsent")?.checked;
    if (!courseId || !title || !consent) {
      toast("Completa ramo, título y confirmación para enviar.", "error");
      return;
    }
    const contributions = getAcademicContributions();
    contributions.unshift({
      id: cryptoRandomId("APORTE"),
      courseId,
      courseName: course?.name || "Ramo",
      type,
      typeLabel: academicTypeLabel(type),
      title,
      year: document.getElementById("academicContributionYear")?.value || "",
      format: document.getElementById("academicContributionFormat")?.value || "",
      unit: document.getElementById("academicContributionUnit")?.value || "",
      link: document.getElementById("academicContributionLink")?.value || "",
      status: "pending",
      createdAt: new Date().toISOString()
    });
    saveJSON(STORAGE.academicContributions, contributions.slice(0, 80));
    closeModal();
    state.academic.view = "uploads";
    render();
    toast("Aporte recibido en demo.", "success");
  }

  function openAcademicResourceReportModal(resourceId) {
    const resource = ACADEMIC_RESOURCES.find((item) => item.id === resourceId);
    if (!resource) return;
    showModal(`
      <div class="modal-head">
        <div>
          <p class="eyebrow" style="margin-bottom:8px;">Reportar recurso</p>
          <h2>${escapeHTML(resource.title)}</h2>
          <p style="color: var(--text-soft); margin-bottom: 0;">Avísanos si está caído, mal clasificado o tiene información incorrecta.</p>
        </div>
        <button class="icon-button modal-close" type="button" data-close-modal aria-label="Cerrar">x</button>
      </div>
      <form id="academicResourceReportForm" class="field-grid" data-resource-id="${escapeHTML(resource.id)}" novalidate>
        <label class="field-grid">
          <strong>Problema</strong>
          <select id="academicResourceReportReason">
            <option value="caido">Archivo caído</option>
            <option value="mal-clasificado">Mal clasificado</option>
            <option value="duplicado">Duplicado</option>
            <option value="contenido">Contenido incorrecto</option>
          </select>
        </label>
        <label class="field-grid">
          <strong>Detalle opcional</strong>
          <textarea id="academicResourceReportDetail" class="form-control" rows="4" maxlength="400" placeholder="Describe brevemente el problema"></textarea>
        </label>
        <div class="form-actions">
          <button class="btn btn-danger" type="submit">Reportar error</button>
          <button class="btn btn-soft" type="button" data-close-modal>Cancelar</button>
        </div>
      </form>
    `);
    wireCurrentPage();
  }

  function submitAcademicResourceReport(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const reports = loadJSON(STORAGE.academicReports, []);
    reports.unshift({
      id: cryptoRandomId("MAT-REP"),
      resourceId: form.dataset.resourceId,
      reason: document.getElementById("academicResourceReportReason")?.value || "caido",
      detail: document.getElementById("academicResourceReportDetail")?.value || "",
      createdAt: new Date().toISOString()
    });
    saveJSON(STORAGE.academicReports, reports.slice(0, 80));
    closeModal();
    toast("Reporte registrado en demo.", "success");
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

  function formatCompactNumber(value) {
    const number = Number(value || 0);
    if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`;
    return String(number);
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

    if (target.closest?.("[data-open-drawer]")) {
      openDrawer();
      return;
    }

    if (target.closest?.("[data-show-notifications]")) {
      toast("Sin notificaciones nuevas.", "success");
      return;
    }

    const academicView = target.closest?.("[data-academic-view]");
    if (academicView) {
      state.academic.view = academicView.dataset.academicView;
      render();
      return;
    }

    const academicType = target.closest?.("[data-academic-type]");
    if (academicType) {
      state.academic.type = academicType.dataset.academicType;
      render();
      return;
    }

    const academicSort = target.closest?.("[data-academic-sort]");
    if (academicSort) {
      state.academic.sort = academicSort.dataset.academicSort;
      render();
      return;
    }

    const selectResource = target.closest?.("[data-select-resource]");
    if (selectResource) {
      state.academic.selectedResourceId = selectResource.dataset.selectResource;
      state.academic.view = "library";
      render();
      return;
    }

    const selectCourse = target.closest?.("[data-select-course]");
    if (selectCourse) {
      state.academic.course = selectCourse.dataset.selectCourse;
      state.academic.view = "library";
      const resource = ACADEMIC_RESOURCES.find((item) => item.courseId === state.academic.course);
      if (resource) state.academic.selectedResourceId = resource.id;
      render();
      return;
    }

    if (target.closest?.("[data-clear-academic-filters]")) {
      state.academic = {
        ...state.academic,
        query: "",
        course: "todos",
        curriculum: "todos",
        semester: "todos",
        area: "todos",
        type: "todos",
        format: "todos",
        sort: "recent"
      };
      render();
      return;
    }

    const saveResource = target.closest?.("[data-save-resource]");
    if (saveResource) {
      toggleAcademicSaved(saveResource.dataset.saveResource);
      render();
      return;
    }

    const downloadResource = target.closest?.("[data-download-resource]");
    if (downloadResource) {
      recordAcademicDownload(downloadResource.dataset.downloadResource);
      toast("Descarga registrada en demo.", "success");
      render();
      return;
    }

    const reportResource = target.closest?.("[data-report-resource]");
    if (reportResource) {
      openAcademicResourceReportModal(reportResource.dataset.reportResource);
      return;
    }

    if (target.closest?.("[data-open-contribution]")) {
      openAcademicContributionModal();
      return;
    }

    if (target.closest?.("[data-clear-preview]")) {
      state.academic.selectedResourceId = getFilteredAcademicResources()[0]?.id || ACADEMIC_RESOURCES[0]?.id || "";
      render();
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
      navigator.serviceWorker.register("sw.js?v=43").then((registration) => {
        registration.update().catch(() => {});

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      }).catch(() => {});

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (sessionStorage.getItem("ceal-sw-reloaded") === "1") return;
        sessionStorage.setItem("ceal-sw-reloaded", "1");
        window.location.reload();
      });
    });
  }

  if (PUBLISHED_CONTENT_SYNC_ENABLED) {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshPublishedContentAndRender();
    });

    window.addEventListener("focus", () => {
      refreshPublishedContentAndRender();
    });

    window.setInterval(() => {
      refreshPublishedContentAndRender();
    }, 60000);
  }

  render();
  loadPublishedContent().then(() => {
    render();
  }).catch(() => {});
})();

