// ═══════════════════════════════════════════════════════════════════════════
// AI STRATEGY HUB — Config Function
// Devuelve la configuración pública de Supabase al frontend
// (la anon key está diseñada para ser pública; la seguridad la maneja RLS)
// ═══════════════════════════════════════════════════════════════════════════

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
    }),
  };
};
