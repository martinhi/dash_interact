// ═══════════════════════════════════════════════════════════════════════════
// AI STRATEGY HUB — Admin Function
// Gestión de usuarios: listar, agregar, actualizar
// Solo accesible para usuarios con rol 'admin'
// Variable de entorno adicional requerida:
//   SUPABASE_SERVICE_KEY → clave service_role de tu proyecto Supabase
// ═══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SVC_KEY  = process.env.SUPABASE_SERVICE_KEY;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Verifica que el token pertenezca a un admin activo
async function verifyAdmin(authHeader) {
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

  // 2. Chequear que esté en profiles con rol admin y activo
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(user.email)}&select=*`,
    {
      headers: {
        'apikey': SUPABASE_SVC_KEY,
        'Authorization': `Bearer ${SUPABASE_SVC_KEY}`,
      },
    }
  );
  const profiles = await profileRes.json();
  if (!Array.isArray(profiles) || !profiles[0]) return null;
  const profile = profiles[0];
  if (!profile.activo || profile.rol !== 'admin') return null;
  return profile;
}

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  // Verificar admin
  const admin = await verifyAdmin(event.headers.authorization);
  if (!admin) {
    return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  // ── GET: listar todos los usuarios ──────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.asc`,
        {
          headers: {
            'apikey': SUPABASE_SVC_KEY,
            'Authorization': `Bearer ${SUPABASE_SVC_KEY}`,
          },
        }
      );
      const text = await res.text();
      return { statusCode: 200, headers: HEADERS, body: text };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── POST: agregar nuevo usuario ──────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      if (!body.email || !body.rol) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Email y rol son requeridos' }) };
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SVC_KEY,
          'Authorization': `Bearer ${SUPABASE_SVC_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          email:  body.email.toLowerCase().trim(),
          nombre: body.nombre || '',
          rol:    body.rol,
          activo: true,
        }),
      });
      const data = await res.json();
      return { statusCode: res.ok ? 201 : 400, headers: HEADERS, body: JSON.stringify(data) };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── PATCH: actualizar usuario (rol o activo) ─────────────────────────────
  if (event.httpMethod === 'PATCH') {
    try {
      const body = JSON.parse(event.body);
      const { id, ...updates } = body;
      if (!id) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'ID requerido' }) };
      }
      // Protección: el admin no puede desactivarse a sí mismo
      if (updates.activo === false && id === admin.id) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No puedes desactivarte a ti mismo' }) };
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SVC_KEY,
          'Authorization': `Bearer ${SUPABASE_SVC_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
      });
      const text = await res.text();
      return { statusCode: 200, headers: HEADERS, body: text };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: 'Method not allowed' };
};
