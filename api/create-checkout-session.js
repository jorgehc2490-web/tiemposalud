// POST /api/create-checkout-session  { "billing": "monthly" | "annual" }
// Crea una sesión de Stripe Checkout para la suscripción premium.
// Requiere: Authorization: Bearer <supabase_access_token>
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) return res.status(401).json({ error: 'unauthorized' });

    const billing = req.body?.billing === 'annual' ? 'annual' : 'monthly';
    const priceId = billing === 'annual' ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
    if (!priceId) return res.status(500).json({ error: 'price_not_configured' });

    // Reutilizar cliente de Stripe si ya existe
    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
      locale: 'es',
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session.js', e);
    return res.status(500).json({ error: 'server_error' });
  }
};
