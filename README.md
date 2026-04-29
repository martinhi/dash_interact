# AI Strategy Hub

Sitio web para centralizar solicitudes de iniciativas AI por país.
**Stack:** Netlify (hosting) + Supabase (base de datos) — ambos gratuitos.

---

## Setup en 4 pasos

### Paso 1 — Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) → **Start your project** → crea una cuenta
2. Crea un nuevo proyecto (elige cualquier región)
3. Ve a **SQL Editor** y ejecuta este SQL para crear la tabla:

```sql
create table solicitudes (
  id               uuid default gen_random_uuid() primary key,
  timestamp        timestamptz default now(),
  nombre           text,
  pais             text,
  problema         text,
  impacto_actual   text,
  usuarios         text,
  medicion         text,
  equipo           text,
  urgencia         text,
  compromiso_cliente text,
  estado           text default 'Recibido',
  impacto_estimado text default ''
);

create table comentarios (
  id           uuid default gen_random_uuid() primary key,
  solicitud_id uuid references solicitudes(id) on delete cascade,
  autor        text,
  texto        text not null,
  created_at   timestamptz default now()
);
create index on comentarios (solicitud_id, created_at);
```

4. Ve a **Project Settings → API** y anota:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `SUPABASE_ANON_KEY`

### Paso 2 — Publicar en Netlify

1. Ve a [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
2. Conecta tu repositorio de GitHub (`martinhi/dash_interact`)
3. En **Build settings** deja todo en blanco (es un sitio estático con funciones)
4. Clic en **Deploy site**

### Paso 3 — Agregar variables de entorno en Netlify

1. En Netlify: **Site configuration → Environment variables → Add a variable**
2. Agrega las dos variables:

| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJh...` (clave anon de Supabase) |

3. Redespliega el sitio: **Deploys → Trigger deploy**

### Paso 4 — Listo

Tu sitio estará en `https://TU-NOMBRE.netlify.app`

---

## Administrar solicitudes

Edita los datos directamente en el **Table Editor de Supabase**:

| Columna | Qué hace el equipo |
|---|---|
| `estado` | `Recibido` / `En Evaluación` / `Priorizado` / `En Desarrollo` / `Completado` / `Rechazado` |
| `impacto_estimado` | `Alto` / `Medio` / `Bajo` (aparece en la Matriz) |

---

## Estructura de archivos

```
/
├── index.html                  ← Página principal
├── css/style.css               ← Estilos
├── js/app.js                   ← Lógica del frontend
├── netlify/functions/api.js    ← Backend serverless
├── netlify.toml                ← Configuración de Netlify
└── README.md
```
