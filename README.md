# CEAL Contingencia App

App responsive para:

- FAQ
- Reporte anonimo de incidencias
- Acuerdos

La interfaz esta pensada para movil y escritorio.

## Ejecutar en local

Requiere Node.js 18 o superior.

```bash
npm install
npm start
```

Abre:

```text
http://localhost:3000
```

No hay dependencias externas, por lo que `npm install` no descarga paquetes; solo deja el proyecto listo para scripts estandar.

## Uso estatico

Tambien puedes abrir directamente:

```text
public/index.html
```

En modo estatico, la app funciona con respaldo en `localStorage`. Para persistencia en servidor, usa `npm start` o conecta un endpoint propio.

## API incluida

El servidor Node incluido expone:

```text
POST /api/reports
POST /api/questions
GET  /api/health
GET  /api/reports    requiere CEAL_ADMIN_TOKEN
GET  /api/questions  requiere CEAL_ADMIN_TOKEN
```

Los reportes se guardan en:

```text
data/reports.ndjson
data/uploads/<folio>/
```

Las dudas se guardan en:

```text
data/questions.ndjson
```

Para consultar reportes o dudas desde backend:

```bash
CEAL_ADMIN_TOKEN="cambia-este-token" npm start
curl -H "Authorization: Bearer cambia-este-token" http://localhost:3000/api/reports
```

## Configuracion rapida

Edita `public/config.js`:

```js
window.CEAL_CONFIG = {
  appName: "CEAL Contingencia",
  institutionName: "UCN · Ingenieria Civil · CEAL",
  updateLabel: "Actualizado",
  apiBase: "",
  enableLocalFallback: true,
  maxFileMB: 10,
  maxFiles: 5,
  contactEmail: ""
};
```

## Despliegue

### Opcion A: Node completo

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

### Opcion B: Hosting estatico

Sube solo la carpeta `public/` a Netlify, Vercel, GitHub Pages o un hosting institucional. En este modo no existe persistencia real en servidor; la app conserva un resumen en el navegador.

## Produccion recomendada

Para operacion institucional a largo plazo, conviene reemplazar el guardado `ndjson` por base de datos y almacenamiento de archivos.

## Accesibilidad y compatibilidad

- Responsive desde 320px hasta escritorio.
- Navegacion inferior movil y top navigation en desktop.
- Targets tactiles de 44px o mas.
- Estados de foco visibles.
- Respeta `prefers-reduced-motion`.
- PWA con manifest y service worker.
- Sin librerias externas.
