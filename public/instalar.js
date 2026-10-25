// TiempoSalud instalable (PWA): registra el service worker y ofrece la
// instalación desde el propio sitio, sin pasar por ninguna tienda.
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
  var bar = document.getElementById('installBar');
  if (!bar) return;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return; // ya está instalada: no se ofrece nada
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    bar.classList.remove('hidden');
  });
  var btn = document.getElementById('installBtn');
  if (btn) btn.addEventListener('click', async function () {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    bar.classList.add('hidden');
  });
  window.addEventListener('appinstalled', function () { bar.classList.add('hidden'); });
  // iPhone/iPad: no hay aviso automático; se muestran las instrucciones.
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    var hint = document.getElementById('installHint');
    if (hint) hint.textContent = 'En iPhone: toca el botón Compartir y luego «Agregar a pantalla de inicio».';
    if (btn) btn.classList.add('hidden');
    bar.classList.remove('hidden');
  }
})();
