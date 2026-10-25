// GET /api/me — devuelve el plan del usuario autenticado.
// Requiere: Authorization: Bearer <supabase_access_token>
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'unauthorized' });

    let { data: profile } = await supabase
      .from('profiles')
      .select('plan, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { data: created } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, plan: 'free' }, { onConflict: 'id' })
        .select('plan, email')
        .single();
      profile = created;
    }

    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ email: user.email, plan: profile?.plan || 'free' });
  } catch (e) {
    console.error('me.js', e);
    return res.status(500).json({ error: 'server_error' });
  }
};
