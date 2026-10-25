// GET /api/forecast?lat=..&lon=..
// Proxy de Open-Meteo que aplica el plan del usuario en el servidor:
//  - sin sesión o plan "free"  → solo el día actual (1 día)
//  - plan "premium"             → pronóstico de 5 días
// Así los datos premium no quedan expuestos solo ocultándolos en el cliente.
const { createClient } = require('@supabase/supabase-js');

const DAYS_FREE = 1;
const DAYS_PREMIUM = 5;
// Lanzamiento gratuito (decidido 2026-10-25): con FREE_LAUNCH=1 en el entorno,
// todo el mundo recibe el pronóstico completo, sin login ni membresía.
// La membresía queda dormida: se activa poniendo FREE_LAUNCH=0 y configurando
// Supabase + los precios de Stripe.
const FREE_LAUNCH = process.env.FREE_LAUNCH === '1';

async function getPlan(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return 'free';
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return 'free';
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
    return profile?.plan === 'premium' ? 'premium' : 'free';
  } catch {
    return 'free';
  }
}

module.exports = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat/lon requeridos' });
    }

    const plan = FREE_LAUNCH ? 'premium' : await getPlan(req);
    const days = plan === 'premium' ? DAYS_PREMIUM : DAYS_FREE;

    const wxParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: 'temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,precipitation',
      forecast_days: String(days),
      timezone: 'auto',
    });
    const aqParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: 'us_aqi,pm2_5,pm10,ozone',
      forecast_days: String(days),
      timezone: 'auto',
    });

    const [wxRes, aqRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${wxParams}`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams}`),
    ]);
    if (!wxRes.ok) return res.status(502).json({ error: 'weather_upstream' });

    const weather = await wxRes.json();
    const air = aqRes.ok ? await aqRes.json() : { hourly: {} };

    res.setHeader('Cache-Control', 'private, max-age=600'); // 10 min
    return res.status(200).json({
      plan,
      days,
      timezone: weather.timezone,
      utc_offset_seconds: weather.utc_offset_seconds,
      hourly: weather.hourly || {},
      hourly_units: weather.hourly_units || {},
      air_hourly: air.hourly || {},
      attribution: 'Weather data by Open-Meteo.com (CC-BY 4.0)',
    });
  } catch (e) {
    console.error('forecast.js', e);
    return res.status(500).json({ error: 'server_error' });
  }
};
