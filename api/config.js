// GET /api/config — configuración pública para el frontend (la anon key es pública por diseño).
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    freeLaunch: process.env.FREE_LAUNCH === '1',
  });
};
