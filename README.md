# CEAL Contingencia App

App responsive para:

- Estado oficial y FAQ
- Reporte anónimo de incidencias
- Acuerdos del pleno

La interfaz está pensada primero para smartphone, pero también funciona en escritorio y tablet.

## Ejecutar en local

Requiere Node.js 22 o superior.

```bash
npm install
npm start
```

Abre:

```text
http://localhost:3000
```

No hay dependencias npm externas obligatorias para el frontend; el backend local usa APIs nativas de Node 22.

## Modos de operación

### 1. Backend local completo

Usa `server.mjs` con SQLite y adjuntos en disco.

- preguntas: `data/ceal.sqlite`
- reportes: `data/ceal.sqlite`
- adjuntos: `data/uploads/<folio>/`

Sirve para uso local, pruebas rápidas o una instalación institucional pequeña.

### 2. GitHub Pages + Supabase

Esta es la opción más simple para producción sin mantener un servidor Node propio.

- `GitHub Pages`: sirve el frontend
- `Supabase Postgres`: guarda `questions`, `reports` y `report_evidence`
- `Supabase Storage`: guarda adjuntos

La app ya soporta este modo desde `public/config.js`.

### 3. Hosting estático sin backend

La app puede abrirse solo con `public/`, pero en ese caso únicamente usa respaldo local en el navegador si no existe API ni Supabase.

## API local incluida

El servidor Node incluido expone:

```text
POST /api/reports
POST /api/questions
GET  /api/health
GET  /api/reports    requiere CEAL_ADMIN_TOKEN
GET  /api/questions  requiere CEAL_ADMIN_TOKEN
```

Para consultar reportes o dudas desde backend:

```bash
CEAL_ADMIN_TOKEN="cambia-este-token" npm start
curl -H "Authorization: Bearer cambia-este-token" http://localhost:3000/api/reports
```

## Configuración rápida

Edita `public/config.js`.

### Backend HTTP

```js
window.CEAL_CONFIG = {
  apiBase: "https://tu-backend.example.com",
  enableLocalFallback: false
};
```

### Pages + Supabase

```js
window.CEAL_CONFIG = {
  apiBase: "",
  enableLocalFallback: false,
  supabaseUrl: "https://TU-PROYECTO.supabase.co",
  supabaseAnonKey: "TU_ANON_KEY",
  supabaseBucket: "ceal-evidence",
  supabaseQuestionsTable: "questions",
  supabaseReportsTable: "reports",
  supabaseEvidenceTable: "report_evidence"
};
```

## Supabase: paso mínimo

1. Crea un proyecto en Supabase.
2. Abre el SQL editor.
3. Ejecuta `supabase/ceal_pages_schema.sql`.
4. Copia `Project URL` y `anon key`.
5. Pega esos valores en `public/config.js`.
6. Publica el frontend en GitHub Pages.

Con eso la app ya puede recibir preguntas, reportes y adjuntos sin backend Node propio.

## Scripts de activación rápida

### Opción más simple: un solo script

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\finalizar-pages-supabase.ps1
```

Ese script te pedirá solamente:

- `Project URL`
- `anon key`

Y después hará todo lo demás:

- actualizar `public/config.js`
- commit
- push
- smoke test local
- espera activa del deploy en GitHub Pages

### Configurar Pages + Supabase

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configure-supabase-pages.ps1 `
  -SupabaseUrl "https://TU-PROYECTO.supabase.co" `
  -SupabaseAnonKey "TU_ANON_KEY"
```

Si quieres que además haga commit y push:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configure-supabase-pages.ps1 `
  -SupabaseUrl "https://TU-PROYECTO.supabase.co" `
  -SupabaseAnonKey "TU_ANON_KEY" `
  -CommitAndPush
```

### Smoke test

```bash
npm run smoke:local
npm run smoke:public
```

El smoke test valida homepage local, `api/health` local y, opcionalmente, la homepage pública.

## Despliegue

### Opción A: Node completo

1. Sube la carpeta completa al servidor.
2. Define variables:

```bash
PORT=3000
CEAL_ADMIN_TOKEN="token-seguro"
```

3. Ejecuta:

```bash
npm start
```

### Opción B: GitHub Pages + Supabase

1. Configura `public/config.js` con tu proyecto Supabase.
2. Ejecuta el schema de `supabase/ceal_pages_schema.sql`.
3. Empuja el repo a GitHub.
4. Activa `Pages > Source = GitHub Actions`.

Esta es la ruta recomendada si quieres algo simple y funcional sin depender de un PC con túnel.

## Accesibilidad y compatibilidad

- Responsive desde 320px hasta escritorio.
- Navegación inferior móvil y navegación superior en desktop.
- Targets táctiles de 44px o más.
- Estados de foco visibles.
- Respeta `prefers-reduced-motion`.
- PWA con manifest y service worker.
