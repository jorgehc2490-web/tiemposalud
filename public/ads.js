// Publicidad de TiempoSalud: de momento rotan las promos de las redes de LABMET
// (como en Avisos Cuba) junto al hueco de patrocinador disponible.
// - El espacio data-adslot="sponsor" rota esas promos; cuando se firme un patrocinador,
//   su banner fijo sustituirá esta rotación.
// - El espacio data-adslot="google" rota las mismas promos mientras no haya ID de editor
//   de AdSense (window.TS_ADS.client en index.html); al configurarlo, pasa a anuncios de Google.
(function () {
  var PROMOS = [
  { nom: "SU MARCA AQUÍ", txt: "Espacio publicitario disponible · Escríbenos: labmet22@gmail.com", url: "", ico: "★", col: "#b8860b" },
  { nom: "LABMET · YouTube", txt: "@labmet · 94,9 mil suscriptores — huracanes y pronóstico del tiempo", url: "https://www.youtube.com/@labmet", ico: "▶", col: "#c4302b" },
  { nom: "Meteorólogo Jorge F Hernández · TikTok", txt: "@jorgefelixmeteorologo · 233,7 mil seguidores", url: "https://www.tiktok.com/@jorgefelixmeteorologo", ico: "♪", col: "#111111" },
  { nom: "Jorge Felix Hernández · Instagram", txt: "@jorgefelix_met · 126 mil seguidores", url: "https://www.instagram.com/jorgefelix_met", ico: "◎", col: "#c13584" },
  { nom: "Meteorólogo Jorge Félix Hernández · Facebook", txt: "Síguenos en Facebook para el pronóstico diario", url: "", ico: "f", col: "#1877f2" },
  { nom: "Weather Latino USA · YouTube", txt: "@WeatherLatinoUSA · El tiempo para los hispanos en EE. UU.", url: "https://www.youtube.com/@WeatherLatinoUSA", ico: "▶", col: "#c4302b" },
  { nom: "Clima y Tiempo MX · YouTube", txt: "@ClimayTiempoMX · 12,1 mil suscriptores — el pronóstico para México", url: "https://www.youtube.com/@ClimayTiempoMX", ico: "▶", col: "#c4302b" }
];
  function paintPromo(box, p) {
    var inner = '<span class="adico" style="background:' + p.col + '">' + p.ico + '</span>' +
      '<span class="admarca">' + p.nom + '</span><span class="adsub">' + p.txt + '</span>';
    box.innerHTML = '<div class="adbox">' + (p.url
      ? '<a class="adlink" href="' + p.url + '" target="_blank" rel="noopener">' + inner + '</a>'
      : inner) + '</div>';
  }
  var sponsorBox = document.querySelector('[data-adslot="sponsor"]');
  var googleBox = document.querySelector('[data-adslot="google"]');
  var idx = 0;
  function paintAll() {
    if (sponsorBox) paintPromo(sponsorBox, PROMOS[idx % PROMOS.length]);
    if (googleBox && !window.__tsAdsenseOn) paintPromo(googleBox, PROMOS[(idx + 3) % PROMOS.length]);
  }
  paintAll();
  setInterval(function () { idx++; paintAll(); }, 9000);

  var cfg = window.TS_ADS || {};
  if (!cfg.client || !googleBox) return;
  window.__tsAdsenseOn = true;
  var s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(cfg.client);
  document.head.appendChild(s);
  googleBox.innerHTML = "";
  var ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.style.display = "block";
  ins.setAttribute("data-ad-client", cfg.client);
  if (cfg.slotMid) ins.setAttribute("data-ad-slot", cfg.slotMid);
  ins.setAttribute("data-ad-format", "auto");
  ins.setAttribute("data-full-width-responsive", "true");
  googleBox.appendChild(ins);
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})();
