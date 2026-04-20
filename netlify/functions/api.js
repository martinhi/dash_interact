// ═══════════════════════════════════════════════════════════════════════════
// AI STRATEGY HUB — Netlify Function (Backend)
// Maneja GET (leer solicitudes) y POST (guardar nueva solicitud)
// Variables de entorno requeridas en Netlify:
//   SUPABASE_URL         → ej. https://xxxx.supabase.co
//   SUPABASE_ANON_KEY    → clave anon/public de tu proyecto Supabase
//   SUPABASE_SERVICE_KEY → clave service_role (para verificar perfiles)
// ═══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SVC_KEY  = process.env.SUPABASE_SERVICE_KEY;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Verifica JWT y que el usuario esté en profiles con activo = true
async function verifyUser(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];

  // 1. Verificar token con Supabase Auth
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });
  if (!userRes.ok) return null;
  const user = await userRes.json();
  if (!user?.email) return null;

  // 2. Verificar que esté autorizado en profiles
  const key = SUPABASE_SVC_KEY || SUPABASE_ANON_KEY;
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(user.email)}&select=rol,activo`,
    {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
    }
  );
  const profiles = await profileRes.json();
  if (!Array.isArray(profiles) || !profiles[0]?.activo) return null;
  return { ...user, profile: profiles[0] };
}

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  // Verificar usuario autenticado
  const user = await verifyUser(event.headers.authorization);
  if (!user) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  // ── POST: guardar nueva solicitud ────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          nombre:             data.nombre        || '',
          pais:               data.pais          || '',
          problema:           data.problema      || '',
          impacto_actual:     data.impacto       || '',
          usuarios:           data.usuarios      || '',
          medicion:           data.medicion      || '',
          equipo:             data.equipo        || '',
          urgencia:           data.urgencia           || '',
          compromiso_cliente: data.compromiso         || '',
          estado:             'Recibido',
          impacto_estimado:   data.impacto_estimado   || '',
        }),
      });

      return {
        statusCode: res.ok ? 200 : 500,
        headers: HEADERS,
        body: JSON.stringify({ success: res.ok }),
      };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── GET: devolver todas las solicitudes ──────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/solicitudes?select=*&order=timestamp.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      const rows = await res.json();

      // Mapear columnas de Supabase al formato que usa el frontend
      const data = rows.map(r => ({
        Timestamp:                r.timestamp,
        Nombre:                   r.nombre,
        País:                     r.pais,
        Problema:                 r.problema,
        'Impacto Actual':         r.impacto_actual,
        Usuarios:                 r.usuarios,
        'Medición':               r.medicion,
        Equipo:                   r.equipo,
        Urgencia:                 r.urgencia,
        'Compromiso con Cliente': r.compromiso_cliente,
        Estado:                   r.estado,
        'Impacto Estimado':       r.impacto_estimado,
      }));

      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: 'Method not allowed' };
};
