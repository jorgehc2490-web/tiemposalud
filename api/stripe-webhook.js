// POST /api/stripe-webhook — eventos de Stripe → actualiza el plan en Supabase.
// Configura este endpoint en Stripe Dashboard → Developers → Webhooks:
//   https://TU-DOMINIO/api/stripe-webhook
// Eventos a escuchar: checkout.session.completed, customer.subscription.deleted
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports.config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('method_not_allowed');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let event;
  try {
    const rawBody = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('webhook signature', e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const userId = s.metadata?.supabase_user_id || s.subscription_data?.metadata?.supabase_user_id;
      const subscriptionId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
      if (userId) {
        await supabase.from('profiles').update({
          plan: 'premium',
          stripe_customer_id: typeof s.customer === 'string' ? s.customer : s.customer?.id,
          stripe_subscription_id: subscriptionId || null,
        }).eq('id', userId);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await supabase.from('profiles').update({ plan: 'free', stripe_subscription_id: null }).eq('id', userId);
      } else if (sub.customer) {
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        await supabase.from('profiles').update({ plan: 'free', stripe_subscription_id: null }).eq('stripe_customer_id', customerId);
      }
    }
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('webhook handler', e);
    return res.status(500).json({ error: 'server_error' });
  }
};
