# AI Strategy Hub

Sitio web para centralizar y gestionar solicitudes de iniciativas AI por país.

## Setup en 5 pasos

### Paso 1 — Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva
2. Anota el **ID** de la URL: `https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`
3. Nombra la hoja `Solicitudes` (la pestaña inferior)

### Paso 2 — Configurar el Apps Script

1. En el Google Sheet: menú **Extensiones → Apps Script**
2. Borra el contenido por defecto y pega el contenido de `Code.gs`
3. Reemplaza `REEMPLAZA_CON_TU_SHEET_ID` con el ID de tu hoja
4. Guarda con **Ctrl+S**
5. En el menú: **Ejecutar → setupSheet** (esto crea los encabezados automáticamente)
   - La primera vez pedirá permisos → acepta

### Paso 3 — Publicar el Apps Script como Web App

1. Menú **Implementar → Nueva implementación**
2. Tipo: **Aplicación web**
3. Configurar:
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier usuario
4. Clic en **Implementar** y copia la **URL** que aparece

### Paso 4 — Conectar el sitio al Apps Script

1. Abre el archivo `js/app.js`
2. Busca la línea: `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Reemplaza con la URL del paso anterior

### Paso 5 — Publicar en GitHub Pages

1. Crea un repositorio en [github.com](https://github.com)
2. Sube todos los archivos (excepto `README.md` si prefieres)
3. En el repositorio: **Settings → Pages → Branch: main → Save**
4. Tu sitio estará en: `https://TU_USUARIO.github.io/NOMBRE_REPO`

---

## Estructura de archivos

```
/
├── index.html        ← Página principal (no modificar)
├── css/
│   └── style.css     ← Estilos (no modificar)
├── js/
│   └── app.js        ← Lógica principal (modificar SCRIPT_URL)
├── Code.gs           ← Script de Google (pegar en Apps Script)
└── README.md         ← Este archivo
```

## Administrar solicitudes

Una vez que el sitio esté conectado, administra los pedidos directamente en Google Sheets:

| Columna | Qué hace el equipo |
|---|---|
| **Estado** | Cambiar a: `Recibido` / `En Evaluación` / `Priorizado` / `En Desarrollo` / `Completado` |
| **Impacto Estimado** | Asignar: `Alto` / `Medio` / `Bajo` (aparece en la Matriz) |

Los demás campos los llena automáticamente el formulario del sitio.

## Columnas del Google Sheet

| # | Columna | Fuente |
|---|---|---|
| 1 | Timestamp | Automático |
| 2 | Nombre | Formulario |
| 3 | País | Formulario |
| 4 | Problema | Formulario |
| 5 | Impacto Actual | Formulario |
| 6 | Usuarios | Formulario |
| 7 | Medición | Formulario |
| 8 | Equipo | Formulario |
| 9 | Urgencia | Formulario |
| 10 | Compromiso con Cliente | Formulario |
| 11 | Estado | **Manual (equipo AI)** |
| 12 | Impacto Estimado | **Manual (equipo AI)** |
