/* ─── TiempoSalud · app ─── */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* ═══ i18n ═══ */
const I18N = {
es: {
  units_metric:'Métrico', units_imperial:'Imperial', login:'Entrar', logout:'Salir',
  search_placeholder:'Buscar ciudad… (ej. San Cristóbal, Cuba)',
  no_results:'Sin resultados. Prueba agregando el país, por ejemplo "San Cristóbal, Cuba".',
  today:'HOY', tomorrow:'MAÑANA',
  plan_free_badge:'PLAN GRATUITO', plan_premium_badge:'PREMIUM',
  lvl_bien:'BIEN', lvl_cuidado:'CUIDADO', lvl_alerta:'ALERTA',
  forecast_title:'PRONÓSTICO 5 DÍAS', trusted:'Tu meteorólogo de confianza:',
  sig_migrana:'Migraña', sig_artritis:'Artritis', sig_alergias:'Alergias',
  sig_asma:'Asma', sig_polen:'Polen', sig_aire:'Calidad Aire',
  col_day:'DÍA', col_temp:'TEMP', col_migrana:'MIGRAÑA', col_artritis:'ARTRITIS',
  col_alergia:'ALERGIA', col_asma:'ASMA', col_polen:'POLEN', col_aire:'AIRE',
  estimated:'estimado',
  paywall_title:'Desbloquea el pronóstico de 5 días', paywall_cta:'Ver planes',
  paywall_text:'Con Premium ves los 5 días, guardas varias ciudades y recibes alertas de salud.',
  pricing_title:'Planes', plan_free:'Gratis', plan_premium:'Premium', plan_current:'Tu plan actual',
  per_month:'/mes', per_year:'/año',
  free_1:'1 ciudad guardada', free_2:'Pronóstico de hoy', free_3:'Las 6 señales de salud',
  prem_1:'Pronóstico de 5 días', prem_2:'Ciudades ilimitadas', prem_3:'Alertas de salud', prem_4:'Sin límites',
  subscribe_monthly:'Suscribirme mensual', subscribe_annual:'Suscribirme anual',
  pricing_note:'Pago seguro con Stripe. Cancela cuando quieras.',
  method_title:'Metodología y fuentes',
  disclaimer:'TiempoSalud es una herramienta informativa: muestra cómo las condiciones meteorológicas se asocian en la literatura científica con ciertas dolencias. No es un diagnóstico médico ni sustituye el consejo de un profesional de la salud. Consulta a tu médico.',
  data_by:'Datos meteorológicos y de calidad del aire por',
  auth_title:'Entrar a TiempoSalud', auth_text:'Escribe tu correo y te enviaremos un enlace mágico para entrar, sin contraseña.',
  auth_send:'Enviar enlace', auth_sent:'Revisa tu correo: te enviamos el enlace de acceso.',
  auth_error:'No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.',
  close:'Cerrar', login_required:'Entra con tu correo para suscribirte.',
  checkout_error:'No pudimos iniciar el pago. Inténtalo de nuevo.',
  checkout_success:'¡Pago completado! Tu plan Premium se activará en unos segundos.',
  checkout_cancelled:'El pago se canceló. Puedes intentarlo cuando quieras.',
  need_login_alerts:'Entra para activar las alertas.',
  alerts_on:'Alertas activadas', alerts_off:'Alertas desactivadas',
  alerts_btn:'Activar alertas', alerts_btn_off:'Desactivar alertas',
  alert_msg:'TiempoSalud: nivel ALERTA de {sig} el {day} en {city}.',
  loading:'Cargando datos reales…', pick_city:'Busca una ciudad para comenzar.',
  free_city_limit:'El plan gratuito permite 1 ciudad. Hazte Premium para guardar más.',
},
en: {
  units_metric:'Metric', units_imperial:'Imperial', login:'Sign in', logout:'Sign out',
  search_placeholder:'Search city… (e.g. San Cristóbal, Cuba)',
  no_results:'No results. Try adding the country, e.g. "San Cristóbal, Cuba".',
  today:'TODAY', tomorrow:'TOMORROW',
  plan_free_badge:'FREE PLAN', plan_premium_badge:'PREMIUM',
  lvl_bien:'GOOD', lvl_cuidado:'CAUTION', lvl_alerta:'ALERT',
  forecast_title:'5-DAY FORECAST', trusted:'Your trusted meteorologist:',
  sig_migrana:'Migraine', sig_artritis:'Arthritis', sig_alergias:'Allergies',
  sig_asma:'Asthma', sig_polen:'Pollen', sig_aire:'Air Quality',
  col_day:'DAY', col_temp:'TEMP', col_migrana:'MIGRAINE', col_artritis:'ARTHRITIS',
  col_alergia:'ALLERGY', col_asma:'ASTHMA', col_polen:'POLLEN', col_aire:'AIR',
  estimated:'estimated',
  paywall_title:'Unlock the 5-day forecast', paywall_cta:'See plans',
  paywall_text:'With Premium you get all 5 days, save multiple cities and receive health alerts.',
  pricing_title:'Plans', plan_free:'Free', plan_premium:'Premium', plan_current:'Your current plan',
  per_month:'/mo', per_year:'/yr',
  free_1:'1 saved city', free_2:"Today's forecast", free_3:'All 6 health signals',
  prem_1:'5-day forecast', prem_2:'Unlimited cities', prem_3:'Health alerts', prem_4:'No limits',
  subscribe_monthly:'Subscribe monthly', subscribe_annual:'Subscribe annual',
  pricing_note:'Secure payment with Stripe. Cancel anytime.',
  method_title:'Methodology & sources',
  disclaimer:'TiempoSalud is an informational tool: it shows how weather conditions are associated in the scientific literature with certain ailments. It is not a medical diagnosis and does not replace professional health advice. Consult your doctor.',
  data_by:'Weather and air quality data by',
  auth_title:'Sign in to TiempoSalud', auth_text:'Enter your email and we will send you a magic link to sign in, no password needed.',
  auth_send:'Send link', auth_sent:'Check your inbox: we sent you the sign-in link.',
  auth_error:'Could not send the link. Check the email and try again.',
  close:'Close', login_required:'Sign in with your email to subscribe.',
  checkout_error:'Could not start checkout. Please try again.',
  checkout_success:'Payment complete! Your Premium plan will activate in a few seconds.',
  checkout_cancelled:'Payment cancelled. You can try again anytime.',
  need_login_alerts:'Sign in to enable alerts.',
  alerts_on:'Alerts enabled', alerts_off:'Alerts disabled',
  alerts_btn:'Enable alerts', alerts_btn_off:'Disable alerts',
  alert_msg:'TiempoSalud: ALERT level for {sig} on {day} in {city}.',
  loading:'Loading live data…', pick_city:'Search a city to begin.',
  free_city_limit:'The free plan allows 1 city. Go Premium to save more.',
}};

/* ═══ Estado ═══ */
const state = {
  lang: localStorage.getItem('vitalair_lang') || 'es',
  units: localStorage.getItem('vitalair_units') || 'metric', // metric | imperial
  user: null, plan: 'free',
  cities: JSON.parse(localStorage.getItem('vitalair_cities') || '[]'),
  city: null, days: [],
  supabase: null, accessToken: null,
  alertsEnabled: localStorage.getItem('vitalair_alerts') === '1',
  freeLaunch: false,
};
const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) || I18N.es[k] || k;
let repaintAlerts = () => {}; // la define init() cuando crea el botón de alertas

/* ═══ Unidades ═══ */
const U = {
  temp: (c) => state.units === 'imperial' ? c * 9/5 + 32 : c,
  tempDelta: (d) => state.units === 'imperial' ? d * 9/5 : d, // deltas: sin +32
  tempUnit: () => state.units === 'imperial' ? '°F' : '°C',
  wind: (kmh) => state.units === 'imperial' ? kmh * 0.621371 : kmh,
  windUnit: () => state.units === 'imperial' ? 'mph' : 'km/h',
  rain: (mm) => state.units === 'imperial' ? mm / 25.4 : mm,
  rainUnit: () => state.units === 'imperial' ? 'in' : 'mm',
  pressureUnit: () => 'mb', // 1 hPa = 1 mb
};
const fmt = (n, d = 1) => Number(n).toFixed(d);

/* ═══ Iconos SVG ═══ */
const ICONS = {
  migrana: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h4l3-8 4 16 3-8h6"/></svg>',
  artritis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
  alergias: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h9a3 3 0 1 0-3-3"/><path d="M3 12h13a3 3 0 1 1-3 3"/><path d="M3 16h6a2 2 0 1 1-2 2"/></svg>',
  asma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M3.5 12h4l2-3 3 6 2-3h4"/></svg>',
  polen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21c-5 0-8-3.5-8-8 0-5 4-9 12-9 0 8-1 17-4 17z"/><path d="M12 21c0-6 1-11 4-14"/></svg>',
  aire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.5 18a4.5 4.5 0 0 0 .4-8.98A6 6 0 0 0 6.2 10.5 3.5 3.5 0 0 0 7 17.5h10.5z"/><path d="M8 21h8"/></svg>',
};

/* ═══ Umbrales (del informe de investigación) ═══
   Migraña: caída ΔP≥5 hPa/24h → CUIDADO; ≥10 → ALERTA (Kimoto 2011 — evidencia débil).
   Artritis: HR alta + presión baja/en caída + viento → más molestias (Dixon 2019 — evidencia débil).
   Polen: escala NAB/AAAAI (granos/m³): gramíneas 5–19 mod / ≥20 alto; árboles 15–89 / ≥90; malezas 10–49 / ≥50.
   Asma: AQI≥101 precaución para asmáticos (EPA — evidencia sólida). Presión NO se usa (sin asociación).
   Aire: cortes EPA 2024: 0–50 bueno, 51–100 moderado, 101–150 sensible, 151+ insalubre. */
function pollenEstimate(month, lat, windKmh, humMean, rainMm) {
  // Open-Meteo no publica polen en Latinoamérica: estimación por proxies, etiquetada como tal.
  const south = lat < 0;
  const m = south ? ((month + 5) % 12) + 1 : month; // desplazar estación en hemisferio sur
  let s = 15;
  if ([3, 4, 5].includes(m)) s = 65;
  else if ([6, 7, 8].includes(m)) s = 45;
  else if ([9, 10].includes(m)) s = 35;
  if (windKmh > 30) s += 15; else if (windKmh > 15) s += 7;
  if (rainMm > 2) s -= 25;
  if (humMean > 80) s -= 10;
  s = Math.max(0, Math.min(100, Math.round(s)));
  const band = s < 20 ? 'bajo' : s < 45 ? 'moderado' : s < 75 ? 'alto' : 'muy alto';
  return { score: s, band };
}

function signalFor(day, prev, lat) {
  const out = {};
  const dp = day.pMax - day.pMin; // oscilación de presión en 24 h (hPa)
  const tempRise = prev ? day.tMax - prev.tMax : 0;

  // Migraña (evidencia débil)
  let mLvl = 'bien', mNote = 'low';
  if (dp >= 10) { mLvl = 'alerta'; mNote = 'low'; }
  else if (dp >= 5 || tempRise >= 5) { mLvl = 'cuidado'; mNote = 'low'; }
  out.migrana = { level: mLvl, metric: `${fmt(dp)} hPa Δ`, certainty: mNote };

  // Artritis (evidencia débil): combinación humedad + presión + viento
  const falling = prev ? day.pMean < prev.pMean - 1.5 : dp >= 4;
  let aLvl = 'bien';
  if (day.humMean > 80 && (day.pMean < 1005 || falling) && day.windMax > 30) aLvl = 'alerta';
  else if (day.humMean >= 60 || falling || day.windMax >= 15) aLvl = 'cuidado';
  out.artritis = { level: aLvl, metric: `${Math.round(day.humMean)}% Hum`, certainty: 'low' };

  // Polen estimado + Alergias
  const pe = pollenEstimate(day.month, lat, day.windMax, day.humMean, day.rainSum);
  const bandLvl = pe.band === 'bajo' ? 'bien' : pe.band === 'moderado' ? 'cuidado' : 'alerta';
  out.polen = { level: bandLvl, metric: `${pe.band} <span class="est">${t('estimated')}</span>`, certainty: 'mid', extra: pe };
  let alLvl = bandLvl;
  if (day.windMax > 30 && (pe.band === 'alto' || pe.band === 'muy alto')) alLvl = 'alerta';
  out.alergias = { level: alLvl, metric: `${fmt(U.wind(day.windMax))} ${U.windUnit()}`, certainty: 'mid' };

  // Asma: AQI manda (EPA, evidencia sólida); humedad extrema suma
  const aqi = day.aqiMax == null ? 0 : Math.round(day.aqiMax);
  let asLvl = aqi >= 101 ? 'alerta' : aqi >= 51 ? 'cuidado' : 'bien';
  if (asLvl === 'bien' && (day.humMean < 30 || day.humMean > 80)) asLvl = 'cuidado';
  out.asma = { level: asLvl, metric: `AQI ${aqi}`, certainty: 'high' };

  // Calidad del aire: cortes EPA 2024
  const airLvl = aqi <= 50 ? 'bien' : aqi <= 100 ? 'cuidado' : 'alerta';
  out.aire = { level: airLvl, metric: `AQI ${aqi}`, certainty: 'high' };
  return out;
}

/* ═══ Agregación diaria ═══ */
function aggregateDaily(payload) {
  const h = payload.hourly || {}, ah = payload.air_hourly || {};
  const n = (h.time || []).length;
  const byDay = {};
  for (let i = 0; i < n; i++) {
    const date = h.time[i].slice(0, 10);
    (byDay[date] = byDay[date] || []).push(i);
  }
  const aqiByTime = {};
  (ah.time || []).forEach((tt, i) => { aqiByTime[tt] = ah.us_aqi ? ah.us_aqi[i] : null; });

  return Object.keys(byDay).sort().map((date) => {
    const idx = byDay[date];
    const pick = (arr) => idx.map((i) => arr[i]).filter((v) => v != null);
    const T = pick(h.temperature_2m), H = pick(h.relative_humidity_2m),
          P = pick(h.pressure_msl), W = pick(h.wind_speed_10m), R = pick(h.precipitation);
    const aqis = idx.map((i) => aqiByTime[h.time[i]]).filter((v) => v != null);
    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    return {
      date, month: parseInt(date.slice(5, 7), 10),
      tMax: Math.max(...T), tMin: Math.min(...T),
      humMean: avg(H), windMax: Math.max(...W),
      pMax: Math.max(...P), pMin: Math.min(...P), pMean: avg(P),
      rainSum: R.reduce((x, y) => x + y, 0),
      aqiMax: aqis.length ? Math.max(...aqis) : null,
    };
  });
}

/* ═══ Render ═══ */
const SIG_ORDER = ['migrana', 'artritis', 'alergias', 'asma', 'polen', 'aire'];
const $ = (id) => document.getElementById(id);

function lvlClass(l) { return l; }

function renderCards(day, lat) {
  const sigs = signalFor(day, null, lat);
  $('cards').innerHTML = SIG_ORDER.map((k) => `
    <div class="card ${sigs[k].level === 'bien' ? '' : sigs[k].level}">
      <div class="card-top">${ICONS[k]}<span>${t('sig_' + k)}</span></div>
      <div class="lvl ${lvlClass(sigs[k].level)}">${t('lvl_' + sigs[k].level)}</div>
      <div class="metric">${sigs[k].metric}</div>
    </div>`).join('');
  return sigs;
}

function renderHero(city, day) {
  $('cityName').textContent = city.name;
  $('cityCountry').textContent = [city.admin1, city.country].filter(Boolean).join(', ');
  $('bigTemp').textContent = `${Math.round(U.temp(day.tMax))}${U.tempUnit()}`;
  const d = new Date(day.date + 'T12:00:00');
  const locale = state.lang === 'es' ? 'es-MX' : 'en-US';
  const isToday = day.date === state.days[0]?.date;
  $('dayLabel').textContent = isToday ? t('today') : new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d).toUpperCase();
  $('dateLabel').textContent = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d);
  $('heroSummary').textContent =
    `${Math.round(U.temp(day.tMin))}–${Math.round(U.temp(day.tMax))}${U.tempUnit()} · ${Math.round(day.humMean)}% Hum · ${fmt(U.wind(day.windMax))} ${U.windUnit()} · ${fmt(U.rain(day.rainSum))} ${U.rainUnit()}`;
}

function renderTable(city, days, lat) {
  const head = ['col_day', 'col_temp', 'col_migrana', 'col_artritis', 'col_alergia', 'col_asma', 'col_polen', 'col_aire'];
  $('forecastHead').innerHTML = head.map((k) => `<th>${t(k)}</th>`).join('');
  const locale = state.lang === 'es' ? 'es-MX' : 'en-US';
  $('forecastCity').textContent = city.name;
  $('forecastBody').innerHTML = days.map((day, i) => {
    const prev = i > 0 ? days[i - 1] : null;
    const s = signalFor(day, prev, lat);
    const d = new Date(day.date + 'T12:00:00');
    const wd = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).toUpperCase().replace('.', '');
    const dm = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d);
    const cell = (k) => `<td><i class="dot ${s[k].level}" title="${t('sig_' + k)}: ${t('lvl_' + s[k].level)}"></i></td>`;
    return `<tr>
      <td><div class="day-name">${wd}</div><div class="day-date">${dm}</div></td>
      <td class="temp-cell">${Math.round(U.temp(day.tMax))}°</td>
      ${cell('migrana')}${cell('artritis')}${cell('alergias')}${cell('asma')}${cell('polen')}${cell('aire')}
    </tr>`;
  }).join('');
  checkAlerts(city, days, lat);
}

function renderMethod() {
  $('methodBody').innerHTML = `
    <h4>${state.lang === 'es' ? 'Cómo se calcula cada señal' : 'How each signal is computed'}</h4>
    <table><tr><th>${state.lang === 'es' ? 'Señal' : 'Signal'}</th><th>${state.lang === 'es' ? 'Regla' : 'Rule'}</th></tr>
    <tr><td>${t('sig_migrana')}</td><td>ΔP ≥ 5 hPa/24h → ${t('lvl_cuidado')}; ≥ 10 hPa → ${t('lvl_alerta')}</td></tr>
    <tr><td>${t('sig_artritis')}</td><td>HR &gt; 80% + presión baja/en caída + viento &gt; 30 km/h → ${t('lvl_alerta')}</td></tr>
    <tr><td>${t('sig_polen')}</td><td>${state.lang === 'es' ? 'Estimación por proxies (temporada, viento, humedad, lluvia). Escala NAB/AAAAI como referencia.' : 'Proxy-based estimate (season, wind, humidity, rain). NAB/AAAAI scale as reference.'}</td></tr>
    <tr><td>${t('sig_asma')}</td><td>AQI ≥ 101 → ${t('lvl_alerta')} (EPA)</td></tr>
    <tr><td>${t('sig_aire')}</td><td>AQI EPA 2024: 0–50 / 51–100 / 101–150 / 151+</td></tr></table>
    <h4>${state.lang === 'es' ? 'Fuentes' : 'Sources'}</h4>
    <ul>
      <li>Kimoto K. et al. (2011). Influence of Barometric Pressure in Patients with Migraine Headache. <i>Internal Medicine</i> 50(18):1923–1928.</li>
      <li>Mukamal KJ. et al. (2009). Weather and air pollution as triggers of severe headache. <i>Neurology</i> 72(10):922–927.</li>
      <li>Dixon WG. et al. (2019). How the weather affects the pain of citizen scientists using a smartphone app. <i>npj Digital Medicine</i> 2:105 (“Cloudy with a Chance of Pain”).</li>
      <li>Mireku N. et al. (2009). Changes in weather and the effects on pediatric asthma exacerbations. <i>Ann Allergy Asthma Immunol</i>.</li>
      <li>National Allergy Bureau / AAAAI — escalas de conteo de polen (granos/m³).</li>
      <li>US EPA — Air Quality Index, actualización de PM2.5 (2024); guías OMS de calidad del aire (2021) como referencia.</li>
      <li>Open-Meteo — pronóstico, calidad del aire y geocodificación (CC-BY 4.0).</li>
    </ul>
    <p>${state.lang === 'es'
      ? 'Nota sobre el polen: Open-Meteo solo publica conteos de polen en Europa. En Latinoamérica TiempoSalud estima el riesgo con proxies (temporada del año, viento, humedad y lluvia reciente) y lo etiqueta siempre como estimación.'
      : 'Note on pollen: Open-Meteo only publishes pollen counts in Europe. In Latin America TiempoSalud estimates risk from proxies (season, wind, humidity, recent rain) and always labels it as an estimate.'}</p>`;
}

/* ═══ Búsqueda de ciudades ═══ */
let searchTimer = null;
async function onSearchInput(e) {
  const q = e.target.value.trim();
  clearTimeout(searchTimer);
  if (q.length < 2) { $('searchResults').classList.add('hidden'); return; }
  searchTimer = setTimeout(async () => {
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=20&language=${state.lang}&format=json`);
      const d = await r.json();
      const box = $('searchResults');
      if (!d.results || !d.results.length) {
        box.innerHTML = `<button type="button" disabled><span class="sub">${t('no_results')}</span></button>`;
      } else {
        box.innerHTML = d.results.map((x, i) =>
          `<button type="button" data-i="${i}"><strong>${x.name}</strong><span class="sub">${[x.admin1, x.country].filter(Boolean).join(', ')}</span></button>`).join('');
        box.querySelectorAll('button[data-i]').forEach((b) =>
          b.addEventListener('click', () => selectCity(d.results[+b.dataset.i])));
      }
      box.classList.remove('hidden');
    } catch { /* red caída: no hacer nada ruidoso */ }
  }, 300);
}

function selectCity(r) {
  $('searchResults').classList.add('hidden');
  $('cityInput').value = '';
  const city = { name: r.name, country: r.country, admin1: r.admin1, lat: r.latitude, lon: r.longitude };
  if (state.plan !== 'premium') {
    state.cities = [city]; // gratis: 1 ciudad
  } else if (!state.cities.some((c) => Math.abs(c.lat - city.lat) < 0.01 && Math.abs(c.lon - city.lon) < 0.01)) {
    state.cities.push(city);
  } else {
    state.cities = state.cities.filter((c) => !(Math.abs(c.lat - city.lat) < 0.01 && Math.abs(c.lon - city.lon) < 0.01));
    state.cities.push(city);
  }
  if (state.plan !== 'premium' && state.cities.length > 1) { toast(t('free_city_limit')); state.cities = [city]; }
  localStorage.setItem('vitalair_cities', JSON.stringify(state.cities));
  state.city = city;
  renderChips();
  loadForecast();
}

function renderChips() {
  $('cityChips').innerHTML = state.cities.map((c, i) =>
    `<button class="chip ${state.city && Math.abs(state.city.lat - c.lat) < 0.01 ? 'active' : ''}" data-i="${i}" type="button">${c.name}<span class="x" data-x="${i}">×</span></button>`).join('');
  $('cityChips').querySelectorAll('.chip').forEach((ch) => {
    ch.addEventListener('click', (e) => {
      const x = e.target.closest('.x');
      if (x) {
        e.stopPropagation();
        const removedIdx = +x.dataset.x;
        const removed = state.cities[removedIdx];
        const removedActive = state.city && removed && Math.abs(removed.lat - state.city.lat) < 0.01 && Math.abs(removed.lon - state.city.lon) < 0.01;
        state.cities.splice(removedIdx, 1);
        localStorage.setItem('vitalair_cities', JSON.stringify(state.cities));
        if (removedActive) state.city = state.cities[0] || null;
        renderChips();
        if (state.city) loadForecast(); else clearView();
        return;
      }
      state.city = state.cities[+ch.dataset.i];
      renderChips();
      loadForecast();
    });
  });
}

/* ═══ Datos ═══ */
function clearView() {
  $('cityName').textContent = 'TiempoSalud';
  $('cityCountry').textContent = t('pick_city');
  $('bigTemp').textContent = '—';
  $('dayLabel').textContent = '';
  $('dateLabel').textContent = '';
  $('heroSummary').textContent = '';
  $('cards').innerHTML = '';
  $('forecastBody').innerHTML = '';
  $('planBadge').classList.add('hidden');
}

async function loadForecast() {
  if (!state.city) return;
  $('cards').innerHTML = `<p class="muted">${t('loading')}</p>`;
  try {
    const headers = state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};
    const r = await fetch(`/api/forecast?lat=${state.city.lat}&lon=${state.city.lon}`, { headers });
    const payload = await r.json();
    if (payload.error) throw new Error(payload.error);
    state.plan = payload.plan || state.plan;
    updatePlanUI();
    state.days = aggregateDaily(payload);
    const today = state.days[0];
    renderHero(state.city, today);
    renderCards(today, state.city.lat);
    if (state.plan === 'premium') {
      $('paywall').classList.add('hidden');
      $('forecastBlock').querySelector('.table-wrap').classList.remove('hidden');
      $('forecastBlock').querySelector('.legend').classList.remove('hidden');
      renderTable(state.city, state.days, state.city.lat);
    } else {
      $('paywall').classList.remove('hidden');
      $('forecastBlock').querySelector('.table-wrap').classList.add('hidden');
      $('forecastBlock').querySelector('.legend').classList.add('hidden');
    }
  } catch (e) {
    $('cards').innerHTML = `<p class="muted">Error: ${e.message}</p>`;
  }
}

/* ═══ Alertas (premium, notificaciones del navegador) ═══ */
function checkAlerts(city, days, lat) {
  if ((state.plan !== 'premium' && !state.freeLaunch) || !state.alertsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  const names = { migrana: t('sig_migrana'), artritis: t('sig_artritis'), alergias: t('sig_alergias'), asma: t('sig_asma'), polen: t('sig_polen'), aire: t('sig_aire') };
  days.slice(1).forEach((day, i) => {
    const prev = days[i];
    const s = signalFor(day, prev, lat);
    Object.keys(names).forEach((k) => {
      if (s[k].level === 'alerta') {
        const key = `alert_${city.lat}_${day.date}_${k}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          const dstr = new Date(day.date + 'T12:00:00').toLocaleDateString(state.lang === 'es' ? 'es-MX' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' });
          new Notification('TiempoSalud', { body: t('alert_msg').replace('{sig}', names[k]).replace('{day}', dstr).replace('{city}', city.name) });
        }
      }
    });
  });
}

/* ═══ Auth (Supabase magic links) + plan ═══ */
function applyFreeLaunchUI() {
  // Lanzamiento gratuito: sin botón de entrar, sin sección de planes, sin insignia de plan.
  // El botón de alertas se mueve al bloque del pronóstico para que siga accesible para todos.
  $('authBtn').classList.add('hidden');
  $('pricing').classList.add('hidden');
  $('planBadge').classList.add('hidden');
  const alertsBtn = $('alertsBtn');
  if (alertsBtn) $('forecastBlock').appendChild(alertsBtn);
}

async function initAuth() {
  let cfg = {};
  try { cfg = await (await fetch('/api/config')).json(); } catch { cfg = {}; }
  state.freeLaunch = !!cfg.freeLaunch;
  if (state.freeLaunch) applyFreeLaunchUI();
  if (!cfg.supabaseUrl) return;
  state.supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const { data: { session } } = await state.supabase.auth.getSession();
  if (session) {
    state.accessToken = session.access_token;
    await refreshPlan();
  }
  state.supabase.auth.onAuthStateChange(async (_ev, sess) => {
    state.accessToken = sess?.access_token || null;
    if (sess) { $('authModal').classList.add('hidden'); await refreshPlan(); if (state.city) loadForecast(); }
    updateAuthUI();
  });
  updateAuthUI();
}

async function refreshPlan() {
  if (!state.accessToken) { state.plan = 'free'; state.user = null; updatePlanUI(); return; }
  try {
    const r = await fetch('/api/me', { headers: { Authorization: `Bearer ${state.accessToken}` } });
    const d = await r.json();
    state.plan = d.plan || 'free';
    state.user = { email: d.email };
  } catch { state.plan = 'free'; }
  updatePlanUI();
}

function updateAuthUI() {
  $('authBtn').textContent = state.user ? `${state.user.email} · ${t('logout')}` : t('login');
}
function updatePlanUI() {
  const badge = $('planBadge');
  if (state.city && !state.freeLaunch) {
    badge.classList.remove('hidden');
    badge.textContent = state.plan === 'premium' ? t('plan_premium_badge') : t('plan_free_badge');
  } else badge.classList.add('hidden');
  $('freeBtn').textContent = state.plan === 'free' ? t('plan_current') : t('plan_free');
  document.querySelectorAll('[data-goto-pricing]').forEach((b) =>
    b.onclick = () => $('pricing').scrollIntoView({ behavior: 'smooth' }));
}

async function startCheckout(billing) {
  if (!state.accessToken) { toast(t('login_required')); $('authModal').classList.remove('hidden'); return; }
  try {
    const r = await fetch('/api/create-checkout-session', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.accessToken}` },
      body: JSON.stringify({ billing }),
    });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else toast(t('checkout_error'));
  } catch { toast(t('checkout_error')); }
}

/* ═══ Idioma / unidades ═══ */
function applyI18n() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('langEs').classList.toggle('active', state.lang === 'es');
  $('langEn').classList.toggle('active', state.lang === 'en');
  $('unitMetric').classList.toggle('active', state.units === 'metric');
  $('unitImperial').classList.toggle('active', state.units === 'imperial');
  renderMethod();
  updateAuthUI();
  repaintAlerts();
  if (state.city && state.days.length) {
    renderHero(state.city, state.days[0]);
    renderCards(state.days[0], state.city.lat);
    if (state.plan === 'premium') renderTable(state.city, state.days, state.city.lat);
  }
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ═══ Init ═══ */
function init() {
  applyI18n();
  $('langEs').onclick = () => { state.lang = 'es'; localStorage.setItem('vitalair_lang', 'es'); applyI18n(); };
  $('langEn').onclick = () => { state.lang = 'en'; localStorage.setItem('vitalair_lang', 'en'); applyI18n(); };
  $('unitMetric').onclick = () => { state.units = 'metric'; localStorage.setItem('vitalair_units', 'metric'); applyI18n(); };
  $('unitImperial').onclick = () => { state.units = 'imperial'; localStorage.setItem('vitalair_units', 'imperial'); applyI18n(); };
  $('cityInput').addEventListener('input', onSearchInput);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) $('searchResults').classList.add('hidden');
  });
  $('authBtn').onclick = () => {
    if (state.user) { state.supabase.auth.signOut().then(() => { state.user = null; state.plan = 'free'; updatePlanUI(); updateAuthUI(); if (state.city) loadForecast(); }); }
    else $('authModal').classList.remove('hidden');
  };
  $('authClose').onclick = () => $('authModal').classList.add('hidden');
  $('authSend').onclick = async () => {
    const email = $('authEmail').value.trim();
    if (!email || !state.supabase) return;
    const { error } = await state.supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    $('authMsg').textContent = error ? t('auth_error') : t('auth_sent');
  };
  $('buyMonthly').onclick = () => startCheckout('monthly');
  $('buyAnnual').onclick = () => startCheckout('annual');
  $('methodToggle').onclick = () => {
    const body = $('methodBody');
    const open = body.classList.toggle('hidden');
    $('methodToggle').setAttribute('aria-expanded', String(!open));
  };
  // Alertas: botón en la tarjeta de pricing premium
  const alertsBtn = document.createElement('button');
  alertsBtn.className = 'btn-ghost'; alertsBtn.type = 'button'; alertsBtn.id = 'alertsBtn';
  alertsBtn.style.marginTop = '10px';
  document.querySelector('.plan-card.highlight .plan-actions').appendChild(alertsBtn);
  const paintAlerts = () => { alertsBtn.textContent = state.alertsEnabled ? t('alerts_btn_off') : t('alerts_btn'); };
  repaintAlerts = paintAlerts;
  paintAlerts();
  alertsBtn.onclick = async () => {
    if (state.plan !== 'premium' && !state.freeLaunch) { toast(t('need_login_alerts')); return; }
    if (!state.alertsEnabled) {
      if (!('Notification' in window)) return;
      const p = await Notification.requestPermission();
      if (p !== 'granted') return;
      state.alertsEnabled = true; localStorage.setItem('vitalair_alerts', '1');
      toast(t('alerts_on'));
      if (state.city && state.days.length) renderTable(state.city, state.days, state.city.lat);
    } else {
      state.alertsEnabled = false; localStorage.setItem('vitalair_alerts', '0');
      toast(t('alerts_off'));
    }
    paintAlerts();
  };
  // Resultado del checkout
  const qs = new URLSearchParams(window.location.search);
  if (qs.get('checkout') === 'success') { toast(t('checkout_success')); setTimeout(refreshPlan, 4000); }
  if (qs.get('checkout') === 'cancelled') toast(t('checkout_cancelled'));
  window.history.replaceState({}, '', window.location.pathname);

  renderChips();
  if (!state.cities.length) {
    $('cityName').textContent = 'TiempoSalud';
    $('cityCountry').textContent = t('pick_city');
  } else {
    state.city = state.cities[0];
    renderChips();
  }
  initAuth().then(() => { if (state.city) loadForecast(); });
}

init();
