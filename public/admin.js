(() => {
  "use strict";

  const config = {
    supabaseUrl: "",
    supabaseAnonKey: "",
    adminMembersTable: "admin_members",
    adminStatusTable: "site_status",
    adminFaqTable: "faq_entries",
    adminAgreementTable: "agreement_entries",
    adminChannelTable: "channel_links",
    adminDocumentTable: "source_documents",
    adminUpdateJobTable: "update_jobs",
    adminSourceBucket: "ceal-admin-sources",
    adminAllowedDomains: [],
    adminAllowedEmails: [],
    ...(window.CEAL_CONFIG || {})
  };

  const DEFAULT_STATUS_SEED = {
    id: "current",
    hero_eyebrow: "Centro CEAL",
    hero_title: "Estado hoy",
    hero_lead: "Paro vigente para el miercoles 22 de abril. Aqui se concentra el estado actual, los hitos del dia y el acceso a respuestas y acuerdos.",
    active_badge_label: "Paro vigente hoy",
    active_badge_tone: "review",
    source_badge_label: "Fuente base: Acta pleno 21 abr",
    source_badge_tone: "confirmed",
    update_label: "Actualizado · Acta pleno 21 abr",
    current_kicker: "Estado actual",
    current_title: "Paro valido para el miercoles 22 de abril",
    current_summary: "El acta del pleno del 21 de abril deja explicito que el paro es valido para el miercoles 22. La forma de revalidacion queda sujeta a la definicion posterior del proceso.",
    current_status_label: "Activo",
    current_status_tone: "review",
    events_kicker: "Hitos del 22 de abril",
    events_title: "Pintaton y marcha",
    events_json: [
      { bullet: "12:00", text: "Pintaton de lienzos en recreo FEUCN." },
      { bullet: "15:00", text: "Marcha convocada en la pergola de avenida Brasil." }
    ],
    last_update_kicker: "Ultima actualizacion",
    last_update_title: "Acta del pleno 21 de abril",
    last_update_body: "La portada usa esa acta como fuente base para el estado vigente y para las respuestas publicadas.",
    faq_title: "FAQ",
    faq_intro: "Respuestas publicadas.",
    channels_kicker: "Fuentes",
    channels_title: "Canales base",
    channels_intro: "Referencias y canales de coordinacion.",
    is_published: true
  };

  const DEFAULT_FAQ_SEED = [
    {
      id: "faq-asistencia-1",
      category: "asistencia",
      question: "¿El paro sigue vigente para el miercoles 22 de abril?",
      answer: "Si. El acta del pleno deja explicito que el paro es valido para el miercoles 22 y que luego debe definirse la forma de revalidacion.",
      status: "confirmed",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 10,
      is_published: true
    },
    {
      id: "faq-evaluaciones-1",
      category: "evaluaciones",
      question: "¿Se recalendarizaron las evaluaciones?",
      answer: "En el pleno se informo que la universidad rechazo inicialmente recalendarizar evaluaciones y luego autorizo la recalendarizacion solo para la jornada del martes 21. No se informaron garantias explicitas para los dias siguientes si continuaba la paralizacion.",
      status: "review",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 20,
      is_published: true
    },
    {
      id: "faq-evaluaciones-2",
      category: "evaluaciones",
      question: "¿Que hago si un docente mantiene una evaluacion sin claridad publica?",
      answer: "Guarda la instruccion, la fecha y cualquier respaldo. En el pleno se levanto expresamente la tension por recalendarizaciones y por posibles presiones a estudiantes movilizados, por lo que conviene reportarlo con evidencia.",
      status: "review",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 30,
      is_published: true
    },
    {
      id: "faq-pleno-1",
      category: "pleno",
      question: "¿Que se comprometio la universidad en seguridad?",
      answer: "Federacion informo que el Director de Servicios, Cristian Zuleta, se comprometio a actualizar el Protocolo de Emergencias con indicaciones para amenazas como tiroteo a mas tardar el lunes 27 de abril, y a presentar un Plan de Seguridad Integral durante la semana del 25 de mayo.",
      status: "confirmed",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 40,
      is_published: true
    },
    {
      id: "faq-pleno-2",
      category: "pleno",
      question: "¿Cuando son la pintaton y la marcha del miercoles 22?",
      answer: "El acta indica pintaton de lienzos el miercoles 22 a las 12:00 en el recreo FEUCN y marcha convocada a las 15:00 en la pergola de avenida Brasil. La ruta no se difundiria publicamente por seguridad.",
      status: "confirmed",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 50,
      is_published: true
    },
    {
      id: "faq-pleno-3",
      category: "pleno",
      question: "Cual es la finalidad del paro y hay petitorio redactado?",
      answer: "Con lo informado en los plenos, el paro busca presionar por garantias reales de seguridad, actualizacion y cumplimiento de protocolos, y resguardo academico frente a la contingencia. Tambien se ha usado para evitar la desarticulacion de la movilizacion mientras siguen las negociaciones. Hasta ahora no esta incorporado en la app un petitorio unico y cerrado como documento rector; lo que si tenemos son actas, acuerdos y referencias a petitorios o propuestas discutidas en pleno.",
      status: "review",
      updated_label: "Plenos 20 y 21 abr",
      source_label: "Acta Pleno 21 de abril + Pleno extraordinario 20 abril",
      display_order: 55,
      is_published: true
    },
    {
      id: "faq-contacto-1",
      category: "contacto",
      question: "¿Por donde se bajan acuerdos y consultas de base?",
      answer: "El pleno reafirma que los alcances de las bases deben levantarse a traves de los centros de estudiantes y que los acuerdos deben difundirse a las carreras para evitar desinformacion.",
      status: "confirmed",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 60,
      is_published: true
    },
    {
      id: "faq-asistencia-2",
      category: "asistencia",
      question: "¿Hay garantias para los dias siguientes si sigue la paralizacion?",
      answer: "No. En el pleno se transparento que, si continuaba la paralizacion de actividades, no existian garantias explicitas para los otros dias respecto de recalendarizaciones y resguardo academico.",
      status: "review",
      updated_label: "Acta pleno 21 abr",
      source_label: "Acta Pleno 21 de abril",
      display_order: 70,
      is_published: true
    }
  ];

  const DEFAULT_AGREEMENT_SEED = [
    {
      id: "agr-1",
      area: "Seguridad",
      title: "Actualizacion del protocolo de emergencias",
      summary: "Direccion de Servicios se comprometio a actualizar el Protocolo de Emergencias con indicaciones para amenazas como tiroteo a mas tardar el lunes 27 de abril.",
      status: "confirmed",
      date_label: "21 abr 2026",
      source_label: "Acta Pleno 21 de abril",
      display_order: 10,
      is_published: true
    },
    {
      id: "agr-2",
      area: "Seguridad",
      title: "Plan de seguridad integral",
      summary: "Se informo el compromiso de presentar durante la semana del 25 de mayo una propuesta de plan de seguridad integral con medidas como registro de ingreso al campus.",
      status: "review",
      date_label: "Semana 25 may 2026",
      source_label: "Acta Pleno 21 de abril",
      display_order: 20,
      is_published: true
    },
    {
      id: "agr-3",
      area: "Evaluaciones",
      title: "Recalendarizacion de evaluaciones",
      summary: "La recalendarizacion fue autorizada para la jornada del martes 21 tras presion estudiantil, pero el pleno dejo explicito que no habia garantias para los dias siguientes si seguia la paralizacion.",
      status: "review",
      date_label: "21 abr 2026",
      source_label: "Acta Pleno 21 de abril",
      display_order: 30,
      is_published: true
    },
    {
      id: "agr-4",
      area: "Movilizacion",
      title: "Paro y movilizacion del 22 de abril",
      summary: "El pleno reafirma que el paro es valido para el miercoles 22. Ademas, se convoca pintaton a las 12:00 en el recreo FEUCN y marcha a las 15:00 en la pergola de avenida Brasil.",
      status: "confirmed",
      date_label: "22 abr 2026",
      source_label: "Acta Pleno 21 de abril",
      display_order: 40,
      is_published: true
    }
  ];

  const DEFAULT_CHANNEL_SEED = [
    {
      id: "channel-whatsapp",
      label: "WhatsApp",
      meta: "Comunicados",
      href: "https://chat.whatsapp.com/KIxFl5bAHBuHnOnyZb6wUH?mode=gi_t",
      display_order: 10,
      is_published: true
    },
    {
      id: "channel-instagram",
      label: "Instagram",
      meta: "@ceicucn",
      href: "https://instagram.com/ceicucn",
      display_order: 20,
      is_published: true
    },
    {
      id: "channel-assemblies",
      label: "Asambleas",
      meta: "y plenos",
      href: "",
      display_order: 30,
      is_published: true
    },
    {
      id: "channel-ucn",
      label: "Comunicados",
      meta: "UCN",
      href: "",
      display_order: 40,
      is_published: true
    }
  ];

  if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
    document.body.innerHTML = '<main class="admin-shell"><div class="card"><h1>Admin no disponible</h1><p>Falta configurar Supabase en <code>public/config.js</code>.</p></div></main>';
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

  const state = {
    session: null,
    member: null,
    authorized: false,
    status: null,
    faqs: [],
    agreements: [],
    channels: [],
    documents: [],
    jobs: []
  };

  const els = {
    toastRegion: document.getElementById("adminToastRegion"),
    authForm: document.getElementById("authForm"),
    authEmail: document.getElementById("authEmail"),
    authSubmitButton: document.getElementById("authSubmitButton"),
    refreshAdminButton: document.getElementById("refreshAdminButton"),
    seedDefaultsButton: document.getElementById("seedDefaultsButton"),
    signOutButton: document.getElementById("signOutButton"),
    sessionStatus: document.getElementById("sessionStatus"),
    sessionEmail: document.getElementById("sessionEmail"),
    sessionRole: document.getElementById("sessionRole"),
    authHint: document.getElementById("authHint"),
    workspace: document.getElementById("adminWorkspace"),
    statusForm: document.getElementById("statusForm"),
    saveStatusButton: document.getElementById("saveStatusButton"),
    faqForm: document.getElementById("faqForm"),
    faqMode: document.getElementById("faqMode"),
    faqTargetWrap: document.getElementById("faqTargetWrap"),
    faqTargetId: document.getElementById("faqTargetId"),
    faqList: document.getElementById("faqList"),
    saveFaqButton: document.getElementById("saveFaqButton"),
    agreementForm: document.getElementById("agreementForm"),
    agreementMode: document.getElementById("agreementMode"),
    agreementTargetWrap: document.getElementById("agreementTargetWrap"),
    agreementTargetId: document.getElementById("agreementTargetId"),
    agreementList: document.getElementById("agreementList"),
    saveAgreementButton: document.getElementById("saveAgreementButton"),
    channelForm: document.getElementById("channelForm"),
    channelMode: document.getElementById("channelMode"),
    channelTargetWrap: document.getElementById("channelTargetWrap"),
    channelTargetId: document.getElementById("channelTargetId"),
    channelList: document.getElementById("channelList"),
    saveChannelButton: document.getElementById("saveChannelButton"),
    documentForm: document.getElementById("documentForm"),
    uploadDocumentButton: document.getElementById("uploadDocumentButton"),
    documentList: document.getElementById("documentList"),
    jobDocumentPicker: document.getElementById("jobDocumentPicker"),
    jobForm: document.getElementById("jobForm"),
    queueJobButton: document.getElementById("queueJobButton"),
    jobList: document.getElementById("jobList")
  };

  function toast(message, type = "info") {
    if (!els.toastRegion) return;
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    els.toastRegion.appendChild(node);
    setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(8px)";
      setTimeout(() => node.remove(), 220);
    }, 3600);
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cryptoId(prefix) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const bytes = new Uint8Array(4);
    window.crypto.getRandomValues(bytes);
    const random = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    return `${prefix}-${date}-${random}`;
  }

  function setButtonLoading(button, isLoading, label) {
    if (!button) return;
    button.disabled = isLoading;
    button.innerHTML = isLoading ? `<span class="loader" aria-hidden="true"></span>${escapeHTML(label)}` : label;
  }

  function setValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value ?? "";
  }

  function isFallbackAllowed(email) {
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) return false;
    if (Array.isArray(config.adminAllowedEmails) && config.adminAllowedEmails.map((item) => item.toLowerCase()).includes(normalized)) {
      return true;
    }
    const domain = normalized.split("@")[1] || "";
    return Array.isArray(config.adminAllowedDomains) && config.adminAllowedDomains.map((item) => item.toLowerCase()).includes(domain);
  }

  async function readMembership(email) {
    try {
      const { data, error } = await client
        .from(config.adminMembersTable)
        .select("email, role, is_active, full_name")
        .eq("email", String(email || "").toLowerCase())
        .maybeSingle();
      if (error) throw error;
      if (data?.is_active) return data;
    } catch (_) {
      // fallback below
    }

    if (isFallbackAllowed(email)) {
      return {
        email,
        role: "editor",
        is_active: true,
        full_name: ""
      };
    }

    return null;
  }

  function sortByOrder(items) {
    return [...items].sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999));
  }

  function sortByNewest(items, key = "updated_at") {
    return [...items].sort((a, b) => String(b?.[key] || "").localeCompare(String(a?.[key] || "")));
  }

  async function loadTable(table, options = {}) {
    const {
      select = "*",
      orderColumn = "updated_at",
      ascending = false
    } = options;
    const { data, error } = await client.from(table).select(select).order(orderColumn, { ascending });
    if (error) throw error;
    return data || [];
  }

  async function loadStatus() {
    const { data, error } = await client
      .from(config.adminStatusTable)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    state.status = data;
  }

  async function loadAdminData() {
    await Promise.allSettled([
      loadStatus(),
      loadTable(config.adminFaqTable).then((data) => { state.faqs = sortByOrder(data); }),
      loadTable(config.adminAgreementTable).then((data) => { state.agreements = sortByOrder(data); }),
      loadTable(config.adminChannelTable).then((data) => { state.channels = sortByOrder(data); }),
      loadTable(config.adminDocumentTable, { orderColumn: "created_at", ascending: false }).then((data) => { state.documents = sortByNewest(data, "created_at"); }),
      loadTable(config.adminUpdateJobTable, { orderColumn: "updated_at", ascending: false }).then((data) => { state.jobs = sortByNewest(data, "updated_at"); })
    ]);
  }

  function updateSessionUI() {
    els.sessionStatus.textContent = state.session ? "Activa" : "Sin iniciar";
    els.sessionEmail.textContent = state.session?.user?.email || "-";
    els.sessionRole.textContent = state.member?.role || (state.authorized ? "editor" : "Pendiente");
    els.signOutButton.hidden = !state.session;
    els.workspace.hidden = !state.authorized;

    if (!state.session) {
      els.authHint.textContent = "Solicita el enlace y abre el correo en este mismo navegador para habilitar el panel.";
      return;
    }

    if (!state.authorized) {
      els.authHint.textContent = "La sesion existe, pero este correo aun no esta habilitado como editor. Debe pasar la regla del dominio permitido o existir en admin_members.";
      return;
    }

    els.authHint.textContent = "Los cambios publicados se reflejan en la app publica sin redeploy. Los documentos y pedidos IA quedan solo en el panel interno.";
  }

  function fillSelect(select, items, formatter) {
    if (!select) return;
    select.innerHTML = `<option value="">Selecciona un item</option>${items.map((item) => `<option value="${escapeHTML(item.id)}">${escapeHTML(formatter(item))}</option>`).join("")}`;
  }

  function renderList(container, items, formatter, emptyLabel) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `<div class="admin-empty">${escapeHTML(emptyLabel)}</div>`;
      return;
    }
    container.innerHTML = items.map(formatter).join("");
  }

  function renderFaqList() {
    fillSelect(els.faqTargetId, state.faqs, (item) => item.question || item.id);
    renderList(
      els.faqList,
      state.faqs,
      (item) => `
        <article class="admin-item">
          <div class="admin-item-head">
            <div>
              <strong>${escapeHTML(item.question)}</strong>
              <p>${escapeHTML(item.answer || "").slice(0, 180)}</p>
            </div>
            <span class="status-badge status-${escapeHTML(item.status || "review")}">${escapeHTML(item.is_published ? "Publicado" : "Borrador")}</span>
          </div>
          <div class="admin-meta">
            <span>${escapeHTML(item.category || "otro")}</span>
            <span>Orden ${escapeHTML(item.display_order || 100)}</span>
            <span>${escapeHTML(item.updated_label || item.updated_at || "")}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-soft" type="button" data-edit-faq="${escapeHTML(item.id)}">Cargar para reemplazar</button>
          </div>
        </article>`,
      "Aun no hay FAQ administradas desde el panel."
    );
  }

  function renderAgreementList() {
    fillSelect(els.agreementTargetId, state.agreements, (item) => item.title || item.id);
    renderList(
      els.agreementList,
      state.agreements,
      (item) => `
        <article class="admin-item">
          <div class="admin-item-head">
            <div>
              <strong>${escapeHTML(item.title)}</strong>
              <p>${escapeHTML(item.summary || "").slice(0, 180)}</p>
            </div>
            <span class="status-badge status-${escapeHTML(item.status || "review")}">${escapeHTML(item.is_published ? "Publicado" : "Borrador")}</span>
          </div>
          <div class="admin-meta">
            <span>${escapeHTML(item.area || "General")}</span>
            <span>${escapeHTML(item.date_label || "")}</span>
            <span>Orden ${escapeHTML(item.display_order || 100)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-soft" type="button" data-edit-agreement="${escapeHTML(item.id)}">Cargar para reemplazar</button>
          </div>
        </article>`,
      "Aun no hay acuerdos administrados desde el panel."
    );
  }

  function renderChannelList() {
    fillSelect(els.channelTargetId, state.channels, (item) => item.label || item.id);
    renderList(
      els.channelList,
      state.channels,
      (item) => `
        <article class="admin-item">
          <div class="admin-item-head">
            <div>
              <strong>${escapeHTML(item.label)}</strong>
              <p>${escapeHTML(item.meta || "")}</p>
            </div>
            <span class="status-badge status-${item.is_published ? "confirmed" : "none"}">${item.is_published ? "Publicado" : "Oculto"}</span>
          </div>
          <div class="admin-meta">
            <span>${escapeHTML(item.href || "Sin URL")}</span>
            <span>Orden ${escapeHTML(item.display_order || 100)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-soft" type="button" data-edit-channel="${escapeHTML(item.id)}">Cargar para reemplazar</button>
          </div>
        </article>`,
      "Aun no hay canales administrados desde el panel."
    );
  }

  function renderDocumentList() {
    renderList(
      els.documentList,
      state.documents,
      (item) => `
        <article class="admin-item">
          <div class="admin-item-head">
            <div>
              <strong>${escapeHTML(item.title || item.id)}</strong>
              <p>${escapeHTML(item.notes || "")}</p>
            </div>
            <span class="status-badge status-confirmed">${escapeHTML(item.document_kind || "doc")}</span>
          </div>
          <div class="admin-meta">
            <span>${escapeHTML(item.storage_path || "")}</span>
            <span>${escapeHTML(item.mime_type || "")}</span>
            <span>${escapeHTML(item.file_size || 0)} bytes</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-soft" type="button" data-open-document="${escapeHTML(item.id)}">Abrir archivo</button>
          </div>
        </article>`,
      "Aun no hay documentos cargados."
    );

    if (!state.documents.length) {
      els.jobDocumentPicker.className = "admin-picker empty";
      els.jobDocumentPicker.textContent = "Sube documentos o recarga la lista.";
      return;
    }

    els.jobDocumentPicker.className = "admin-picker";
    els.jobDocumentPicker.innerHTML = state.documents.map((doc) => `
      <label class="admin-check">
        <input type="checkbox" value="${escapeHTML(doc.id)}" />
        <span><strong>${escapeHTML(doc.title || doc.id)}</strong><br>${escapeHTML(doc.document_kind || "otro")} · ${escapeHTML(doc.storage_path || "")}</span>
      </label>
    `).join("");
  }

  function jobStatusBadge(status) {
    const normalized = String(status || "queued").toLowerCase();
    if (normalized === "done") return { className: "status-confirmed", label: "Lista" };
    if (normalized === "processing") return { className: "status-review", label: "En progreso" };
    if (normalized === "blocked") return { className: "status-none", label: "Bloqueada" };
    return { className: "status-review", label: "En cola" };
  }

  function findDocumentTitles(ids) {
    const selected = Array.isArray(ids) ? ids : [];
    return selected
      .map((id) => state.documents.find((doc) => doc.id === id))
      .filter(Boolean)
      .map((doc) => `${doc.title} (${doc.document_kind})`);
  }

  function buildJobBrief(job) {
    const documentTitles = findDocumentTitles(job.source_document_ids);
    const docsBlock = documentTitles.length
      ? documentTitles.map((title) => `- ${title}`).join("\n")
      : "- Sin documentos adjuntos";
    return [
      `Titulo: ${job.title || job.id}`,
      `Objetivo: ${job.target_type || "mixed"}`,
      `Operacion: ${job.action_mode || "sumar"}`,
      "",
      "Instrucciones:",
      job.instructions || "",
      "",
      "Documentos asociados:",
      docsBlock,
      "",
      "Regla clave:",
      "Actualiza solo el contenido publico del CEAL. No expongas datos internos ni metadata privada."
    ].join("\n");
  }

  function renderJobList() {
    renderList(
      els.jobList,
      state.jobs,
      (item) => {
        const badge = jobStatusBadge(item.status);
        return `
          <article class="admin-item">
            <div class="admin-item-head">
              <div>
                <strong>${escapeHTML(item.title || item.id)}</strong>
                <p>${escapeHTML(item.instructions || "").slice(0, 180)}</p>
              </div>
              <span class="status-badge ${badge.className}">${escapeHTML(badge.label)}</span>
            </div>
            <div class="admin-meta">
              <span>${escapeHTML(item.target_type || "mixed")}</span>
              <span>${escapeHTML(item.action_mode || "sumar")}</span>
              <span>${escapeHTML(item.requested_by || "")}</span>
            </div>
            <div class="admin-actions">
              <button class="btn btn-soft" type="button" data-copy-job="${escapeHTML(item.id)}">Copiar brief</button>
              <button class="btn btn-soft" type="button" data-job-status="${escapeHTML(item.id)}" data-next-status="processing">Marcar en progreso</button>
              <button class="btn btn-soft" type="button" data-job-status="${escapeHTML(item.id)}" data-next-status="done">Marcar lista</button>
            </div>
          </article>`;
      },
      "Aun no hay solicitudes IA."
    );
  }

  function hydrateStatusForm() {
    const row = state.status || {};
    const mapping = {
      statusHeroEyebrow: row.hero_eyebrow || DEFAULT_STATUS_SEED.hero_eyebrow,
      statusHeroTitle: row.hero_title || DEFAULT_STATUS_SEED.hero_title,
      statusHeroLead: row.hero_lead || DEFAULT_STATUS_SEED.hero_lead,
      statusActiveBadgeLabel: row.active_badge_label || DEFAULT_STATUS_SEED.active_badge_label,
      statusActiveBadgeTone: row.active_badge_tone || DEFAULT_STATUS_SEED.active_badge_tone,
      statusSourceBadgeLabel: row.source_badge_label || DEFAULT_STATUS_SEED.source_badge_label,
      statusSourceBadgeTone: row.source_badge_tone || DEFAULT_STATUS_SEED.source_badge_tone,
      statusUpdateLabel: row.update_label || DEFAULT_STATUS_SEED.update_label,
      statusCurrentKicker: row.current_kicker || DEFAULT_STATUS_SEED.current_kicker,
      statusCurrentTitle: row.current_title || DEFAULT_STATUS_SEED.current_title,
      statusCurrentSummary: row.current_summary || DEFAULT_STATUS_SEED.current_summary,
      statusCurrentStatusLabel: row.current_status_label || DEFAULT_STATUS_SEED.current_status_label,
      statusCurrentStatusTone: row.current_status_tone || DEFAULT_STATUS_SEED.current_status_tone,
      statusEventsKicker: row.events_kicker || DEFAULT_STATUS_SEED.events_kicker,
      statusEventsTitle: row.events_title || DEFAULT_STATUS_SEED.events_title,
      statusEventsJson: JSON.stringify(Array.isArray(row.events_json) ? row.events_json : DEFAULT_STATUS_SEED.events_json, null, 2),
      statusLastUpdateKicker: row.last_update_kicker || DEFAULT_STATUS_SEED.last_update_kicker,
      statusLastUpdateTitle: row.last_update_title || DEFAULT_STATUS_SEED.last_update_title,
      statusLastUpdateBody: row.last_update_body || DEFAULT_STATUS_SEED.last_update_body,
      statusFaqTitle: row.faq_title || DEFAULT_STATUS_SEED.faq_title,
      statusFaqIntro: row.faq_intro || DEFAULT_STATUS_SEED.faq_intro,
      statusChannelsKicker: row.channels_kicker || DEFAULT_STATUS_SEED.channels_kicker,
      statusChannelsTitle: row.channels_title || DEFAULT_STATUS_SEED.channels_title,
      statusChannelsIntro: row.channels_intro || DEFAULT_STATUS_SEED.channels_intro
    };

    Object.entries(mapping).forEach(([id, value]) => setValue(id, value));
  }

  function loadFaqIntoForm(id) {
    const item = state.faqs.find((entry) => entry.id === id);
    if (!item) return;
    els.faqMode.value = "reemplazar";
    toggleTargetWrap(els.faqMode, els.faqTargetWrap);
    els.faqTargetId.value = item.id;
    setValue("faqCategory", item.category);
    setValue("faqStatus", item.status);
    setValue("faqQuestion", item.question);
    setValue("faqAnswer", item.answer);
    setValue("faqUpdatedLabel", item.updated_label || "");
    setValue("faqSourceLabel", item.source_label || "");
    setValue("faqOrder", item.display_order ?? 100);
    document.getElementById("faqPublished").checked = Boolean(item.is_published);
    toast("FAQ cargada para reemplazo.", "info");
  }

  function loadAgreementIntoForm(id) {
    const item = state.agreements.find((entry) => entry.id === id);
    if (!item) return;
    els.agreementMode.value = "reemplazar";
    toggleTargetWrap(els.agreementMode, els.agreementTargetWrap);
    els.agreementTargetId.value = item.id;
    setValue("agreementArea", item.area);
    setValue("agreementStatus", item.status);
    setValue("agreementTitle", item.title);
    setValue("agreementSummary", item.summary);
    setValue("agreementDateLabel", item.date_label || "");
    setValue("agreementSourceLabel", item.source_label || "");
    setValue("agreementOrder", item.display_order ?? 100);
    document.getElementById("agreementPublished").checked = Boolean(item.is_published);
    toast("Acuerdo cargado para reemplazo.", "info");
  }

  function loadChannelIntoForm(id) {
    const item = state.channels.find((entry) => entry.id === id);
    if (!item) return;
    els.channelMode.value = "reemplazar";
    toggleTargetWrap(els.channelMode, els.channelTargetWrap);
    els.channelTargetId.value = item.id;
    setValue("channelLabel", item.label);
    setValue("channelMeta", item.meta);
    setValue("channelHref", item.href);
    setValue("channelOrder", item.display_order ?? 100);
    document.getElementById("channelPublished").checked = Boolean(item.is_published);
    toast("Canal cargado para reemplazo.", "info");
  }

  function renderWorkspace() {
    renderFaqList();
    renderAgreementList();
    renderChannelList();
    renderDocumentList();
    renderJobList();
    hydrateStatusForm();
    els.seedDefaultsButton.hidden = Boolean(state.status || state.faqs.length || state.agreements.length || state.channels.length);
  }

  function toggleTargetWrap(select, wrap) {
    if (!select || !wrap) return;
    wrap.hidden = select.value !== "reemplazar";
  }

  function sanitizeStorageName(name) {
    return String(name || "archivo")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function uploadFileToStorage(file, prefix) {
    const cleanName = sanitizeStorageName(file.name);
    const path = `${prefix}/${Date.now()}-${cleanName || "archivo"}`;
    const { error } = await client.storage
      .from(config.adminSourceBucket)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream"
      });

    if (error) throw error;
    return path;
  }

  async function openDocument(id) {
    const item = state.documents.find((entry) => entry.id === id);
    if (!item) {
      toast("No se encontro el documento.", "error");
      return;
    }

    const { data, error } = await client.storage
      .from(config.adminSourceBucket)
      .createSignedUrl(item.storage_path, 60);

    if (error || !data?.signedUrl) {
      toast(error?.message || "No se pudo abrir el archivo.", "error");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function saveStatus(event) {
    event.preventDefault();
    setButtonLoading(els.saveStatusButton, true, "Guardando...");

    let eventsJson = [];
    try {
      eventsJson = JSON.parse(document.getElementById("statusEventsJson").value || "[]");
      if (!Array.isArray(eventsJson)) throw new Error("El JSON de eventos debe ser un arreglo.");
    } catch (error) {
      setButtonLoading(els.saveStatusButton, false, "Guardar estado vigente");
      toast(error.message || "Eventos invalidos.", "error");
      return;
    }

    const row = {
      id: "current",
      hero_eyebrow: document.getElementById("statusHeroEyebrow").value.trim(),
      hero_title: document.getElementById("statusHeroTitle").value.trim(),
      hero_lead: document.getElementById("statusHeroLead").value.trim(),
      active_badge_label: document.getElementById("statusActiveBadgeLabel").value.trim(),
      active_badge_tone: document.getElementById("statusActiveBadgeTone").value,
      source_badge_label: document.getElementById("statusSourceBadgeLabel").value.trim(),
      source_badge_tone: document.getElementById("statusSourceBadgeTone").value,
      update_label: document.getElementById("statusUpdateLabel").value.trim(),
      current_kicker: document.getElementById("statusCurrentKicker").value.trim(),
      current_title: document.getElementById("statusCurrentTitle").value.trim(),
      current_summary: document.getElementById("statusCurrentSummary").value.trim(),
      current_status_label: document.getElementById("statusCurrentStatusLabel").value.trim(),
      current_status_tone: document.getElementById("statusCurrentStatusTone").value,
      events_kicker: document.getElementById("statusEventsKicker").value.trim(),
      events_title: document.getElementById("statusEventsTitle").value.trim(),
      events_json: eventsJson,
      last_update_kicker: document.getElementById("statusLastUpdateKicker").value.trim(),
      last_update_title: document.getElementById("statusLastUpdateTitle").value.trim(),
      last_update_body: document.getElementById("statusLastUpdateBody").value.trim(),
      faq_title: document.getElementById("statusFaqTitle").value.trim(),
      faq_intro: document.getElementById("statusFaqIntro").value.trim(),
      channels_kicker: document.getElementById("statusChannelsKicker").value.trim(),
      channels_title: document.getElementById("statusChannelsTitle").value.trim(),
      channels_intro: document.getElementById("statusChannelsIntro").value.trim(),
      is_published: true,
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await client.from(config.adminStatusTable).upsert(row, { onConflict: "id" });
      if (error) throw error;
      toast("Estado vigente actualizado.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo guardar el estado.", "error");
    } finally {
      setButtonLoading(els.saveStatusButton, false, "Guardar estado vigente");
    }
  }

  async function saveFaq(event) {
    event.preventDefault();
    setButtonLoading(els.saveFaqButton, true, "Guardando...");
    const mode = els.faqMode.value;
    const targetId = els.faqTargetId.value;
    const now = new Date().toISOString();
    const row = {
      id: mode === "reemplazar" && targetId ? targetId : cryptoId("FAQ"),
      category: document.getElementById("faqCategory").value,
      question: document.getElementById("faqQuestion").value.trim(),
      answer: document.getElementById("faqAnswer").value.trim(),
      status: document.getElementById("faqStatus").value,
      updated_label: document.getElementById("faqUpdatedLabel").value.trim(),
      source_label: document.getElementById("faqSourceLabel").value.trim(),
      display_order: Number(document.getElementById("faqOrder").value || 100),
      is_published: document.getElementById("faqPublished").checked,
      updated_at: now
    };

    try {
      if (!row.question || !row.answer) throw new Error("La FAQ necesita pregunta y respuesta.");
      const { error } = await client.from(config.adminFaqTable).upsert(row, { onConflict: "id" });
      if (error) throw error;
      els.faqForm.reset();
      document.getElementById("faqPublished").checked = true;
      els.faqMode.value = "sumar";
      toggleTargetWrap(els.faqMode, els.faqTargetWrap);
      toast("FAQ guardada.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo guardar la FAQ.", "error");
    } finally {
      setButtonLoading(els.saveFaqButton, false, "Guardar FAQ");
    }
  }

  async function saveAgreement(event) {
    event.preventDefault();
    setButtonLoading(els.saveAgreementButton, true, "Guardando...");
    const mode = els.agreementMode.value;
    const targetId = els.agreementTargetId.value;
    const now = new Date().toISOString();
    const row = {
      id: mode === "reemplazar" && targetId ? targetId : cryptoId("AGR"),
      area: document.getElementById("agreementArea").value.trim(),
      title: document.getElementById("agreementTitle").value.trim(),
      summary: document.getElementById("agreementSummary").value.trim(),
      status: document.getElementById("agreementStatus").value,
      date_label: document.getElementById("agreementDateLabel").value.trim(),
      source_label: document.getElementById("agreementSourceLabel").value.trim(),
      display_order: Number(document.getElementById("agreementOrder").value || 100),
      is_published: document.getElementById("agreementPublished").checked,
      updated_at: now
    };

    try {
      if (!row.title || !row.summary) throw new Error("El acuerdo necesita titulo y resumen.");
      const { error } = await client.from(config.adminAgreementTable).upsert(row, { onConflict: "id" });
      if (error) throw error;
      els.agreementForm.reset();
      document.getElementById("agreementPublished").checked = true;
      els.agreementMode.value = "sumar";
      toggleTargetWrap(els.agreementMode, els.agreementTargetWrap);
      toast("Acuerdo guardado.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo guardar el acuerdo.", "error");
    } finally {
      setButtonLoading(els.saveAgreementButton, false, "Guardar acuerdo");
    }
  }

  async function saveChannel(event) {
    event.preventDefault();
    setButtonLoading(els.saveChannelButton, true, "Guardando...");
    const mode = els.channelMode.value;
    const targetId = els.channelTargetId.value;
    const now = new Date().toISOString();
    const row = {
      id: mode === "reemplazar" && targetId ? targetId : cryptoId("CH"),
      label: document.getElementById("channelLabel").value.trim(),
      meta: document.getElementById("channelMeta").value.trim(),
      href: document.getElementById("channelHref").value.trim(),
      display_order: Number(document.getElementById("channelOrder").value || 100),
      is_published: document.getElementById("channelPublished").checked,
      updated_at: now
    };

    try {
      if (!row.label) throw new Error("El canal necesita nombre.");
      const { error } = await client.from(config.adminChannelTable).upsert(row, { onConflict: "id" });
      if (error) throw error;
      els.channelForm.reset();
      document.getElementById("channelPublished").checked = true;
      els.channelMode.value = "sumar";
      toggleTargetWrap(els.channelMode, els.channelTargetWrap);
      toast("Canal guardado.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo guardar el canal.", "error");
    } finally {
      setButtonLoading(els.saveChannelButton, false, "Guardar canal");
    }
  }

  async function uploadDocument(event) {
    event.preventDefault();
    setButtonLoading(els.uploadDocumentButton, true, "Subiendo...");
    const file = document.getElementById("documentFile").files?.[0];
    const title = document.getElementById("documentTitle").value.trim();
    const kind = document.getElementById("documentKind").value;
    const notes = document.getElementById("documentNotes").value.trim();

    try {
      if (!file) throw new Error("Selecciona un archivo.");
      if (!title) throw new Error("Indica un titulo corto.");
      const docId = cryptoId("DOC");
      const now = new Date().toISOString();
      const path = await uploadFileToStorage(file, docId);
      const row = {
        id: docId,
        title,
        document_kind: kind,
        notes,
        storage_bucket: config.adminSourceBucket,
        storage_path: path,
        mime_type: file.type || "application/octet-stream",
        file_size: file.size,
        uploaded_by: state.session?.user?.email || "",
        created_at: now,
        updated_at: now
      };
      const { error } = await client.from(config.adminDocumentTable).insert(row);
      if (error) throw error;
      els.documentForm.reset();
      toast("Documento subido.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo subir el documento.", "error");
    } finally {
      setButtonLoading(els.uploadDocumentButton, false, "Subir documento");
    }
  }

  async function createUpdateJob(event) {
    event.preventDefault();
    setButtonLoading(els.queueJobButton, true, "Encolando...");
    const selectedDocs = Array.from(els.jobDocumentPicker.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
    const now = new Date().toISOString();
    const row = {
      id: cryptoId("JOB"),
      target_type: document.getElementById("jobTargetType").value,
      action_mode: document.getElementById("jobActionMode").value,
      status: "queued",
      title: document.getElementById("jobTitle").value.trim(),
      instructions: document.getElementById("jobInstructions").value.trim(),
      requested_by: state.session?.user?.email || "",
      source_document_ids: selectedDocs,
      result_summary: "",
      created_at: now,
      updated_at: now
    };

    try {
      if (!row.title || !row.instructions) throw new Error("La solicitud IA necesita titulo e instrucciones.");
      const { error } = await client.from(config.adminUpdateJobTable).insert(row);
      if (error) throw error;
      els.jobForm.reset();
      toast("Solicitud IA encolada.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo crear la solicitud IA.", "error");
    } finally {
      setButtonLoading(els.queueJobButton, false, "Solicitar actualizacion IA");
    }
  }

  async function updateJobStatus(id, nextStatus) {
    const row = state.jobs.find((entry) => entry.id === id);
    if (!row) return;
    const { error } = await client
      .from(config.adminUpdateJobTable)
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    if (error) {
      toast(error.message || "No se pudo actualizar la solicitud.", "error");
      return;
    }
    toast(`Solicitud marcada como ${nextStatus}.`, "success");
    await refreshWorkspace();
  }

  async function copyJobBrief(id) {
    const row = state.jobs.find((entry) => entry.id === id);
    if (!row) return;
    const brief = buildJobBrief(row);
    try {
      await navigator.clipboard.writeText(brief);
      toast("Brief copiado.", "success");
    } catch (_) {
      toast("No se pudo copiar el brief.", "error");
    }
  }

  async function seedDefaults() {
    if (state.status || state.faqs.length || state.agreements.length || state.channels.length) {
      toast("La base editable ya existe. No se importo contenido inicial para no mezclar datos.", "info");
      return;
    }

    setButtonLoading(els.seedDefaultsButton, true, "Cargando...");
    const now = new Date().toISOString();

    try {
      const { error: statusError } = await client.from(config.adminStatusTable).upsert({
        ...DEFAULT_STATUS_SEED,
        updated_at: now
      }, { onConflict: "id" });
      if (statusError) throw statusError;

      const faqRows = DEFAULT_FAQ_SEED.map((item) => ({
        ...item,
        created_at: now,
        updated_at: now
      }));
      const agreementRows = DEFAULT_AGREEMENT_SEED.map((item) => ({
        ...item,
        created_at: now,
        updated_at: now
      }));
      const channelRows = DEFAULT_CHANNEL_SEED.map((item) => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const operations = [
        client.from(config.adminFaqTable).upsert(faqRows, { onConflict: "id" }),
        client.from(config.adminAgreementTable).upsert(agreementRows, { onConflict: "id" }),
        client.from(config.adminChannelTable).upsert(channelRows, { onConflict: "id" })
      ];

      const results = await Promise.all(operations);
      const firstError = results.find((result) => result.error)?.error;
      if (firstError) throw firstError;

      toast("Base inicial cargada. Desde ahora el contenido queda editable online.", "success");
      await refreshWorkspace();
    } catch (error) {
      toast(error.message || "No se pudo cargar la base inicial.", "error");
    } finally {
      setButtonLoading(els.seedDefaultsButton, false, "Cargar base inicial");
    }
  }

  async function refreshWorkspace() {
    if (!state.authorized) return;
    await loadAdminData();
    renderWorkspace();
  }

  async function sendMagicLink(event) {
    event.preventDefault();
    setButtonLoading(els.authSubmitButton, true, "Enviando...");
    const email = String(els.authEmail.value || "").trim().toLowerCase();

    try {
      if (!email) throw new Error("Indica un correo.");
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href.split("#")[0]
        }
      });
      if (error) throw error;
      toast("Revisa el correo para abrir el enlace de acceso.", "success");
    } catch (error) {
      toast(error.message || "No se pudo enviar el acceso.", "error");
    } finally {
      setButtonLoading(els.authSubmitButton, false, "Enviar acceso");
    }
  }

  async function signOut() {
    await client.auth.signOut();
    state.session = null;
    state.member = null;
    state.authorized = false;
    updateSessionUI();
  }

  async function handleSession(session) {
    state.session = session;
    state.member = null;
    state.authorized = false;

    if (session?.user?.email) {
      const member = await readMembership(session.user.email);
      state.member = member;
      state.authorized = Boolean(member?.is_active);
    }

    updateSessionUI();

    if (state.authorized) {
      await refreshWorkspace();
    }
  }

  function handleDynamicClick(event) {
    const faqButton = event.target.closest("[data-edit-faq]");
    if (faqButton) {
      loadFaqIntoForm(faqButton.dataset.editFaq);
      return;
    }

    const agreementButton = event.target.closest("[data-edit-agreement]");
    if (agreementButton) {
      loadAgreementIntoForm(agreementButton.dataset.editAgreement);
      return;
    }

    const channelButton = event.target.closest("[data-edit-channel]");
    if (channelButton) {
      loadChannelIntoForm(channelButton.dataset.editChannel);
      return;
    }

    const openDocumentButton = event.target.closest("[data-open-document]");
    if (openDocumentButton) {
      openDocument(openDocumentButton.dataset.openDocument);
      return;
    }

    const jobStatusButton = event.target.closest("[data-job-status]");
    if (jobStatusButton) {
      updateJobStatus(jobStatusButton.dataset.jobStatus, jobStatusButton.dataset.nextStatus);
      return;
    }

    const copyJobButton = event.target.closest("[data-copy-job]");
    if (copyJobButton) {
      copyJobBrief(copyJobButton.dataset.copyJob);
    }
  }

  function bindEvents() {
    els.authForm?.addEventListener("submit", sendMagicLink);
    els.signOutButton?.addEventListener("click", signOut);
    els.refreshAdminButton?.addEventListener("click", () => refreshWorkspace());
    els.seedDefaultsButton?.addEventListener("click", seedDefaults);
    els.statusForm?.addEventListener("submit", saveStatus);
    els.faqForm?.addEventListener("submit", saveFaq);
    els.agreementForm?.addEventListener("submit", saveAgreement);
    els.channelForm?.addEventListener("submit", saveChannel);
    els.documentForm?.addEventListener("submit", uploadDocument);
    els.jobForm?.addEventListener("submit", createUpdateJob);
    document.addEventListener("click", handleDynamicClick);

    els.faqMode?.addEventListener("change", () => toggleTargetWrap(els.faqMode, els.faqTargetWrap));
    els.agreementMode?.addEventListener("change", () => toggleTargetWrap(els.agreementMode, els.agreementTargetWrap));
    els.channelMode?.addEventListener("change", () => toggleTargetWrap(els.channelMode, els.channelTargetWrap));

    els.faqTargetId?.addEventListener("change", () => {
      if (els.faqTargetId.value) loadFaqIntoForm(els.faqTargetId.value);
    });
    els.agreementTargetId?.addEventListener("change", () => {
      if (els.agreementTargetId.value) loadAgreementIntoForm(els.agreementTargetId.value);
    });
    els.channelTargetId?.addEventListener("change", () => {
      if (els.channelTargetId.value) loadChannelIntoForm(els.channelTargetId.value);
    });
  }

  async function boot() {
    bindEvents();
    const { data } = await client.auth.getSession();
    await handleSession(data.session || null);
    client.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
    });
  }

  boot().catch((error) => {
    toast(error.message || "No se pudo iniciar el panel.", "error");
  });
})();
