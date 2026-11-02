// parent-mouse-relay.js — Mouse position relay for iframe → parent communication
//
// Sendet Mausposition an Parent-Window für Speaker-Notes Mouse-Follow.
// Wird nur aktiv wenn die App in einem Iframe läuft.
//
// Funktionsweise:
//   - Erkennt ob die App in einem Iframe läuft (window !== window.parent)
//   - Lauscht auf mousemove-Events auf dem Document
//   - Sendet { type: 'IFRAME_MOUSE_MOVE', screenX, screenY } an Parent via postMessage
//   - screenX/screenY sind ABSOLUTE Bildschirmkoordinaten — keine Umrechnung nötig
//   - Throttled auf ~60fps um den Message-Channel nicht zu überfluten
//   - Verwendet { passive: true } um Scroll/Touch-Events nicht zu blockieren
//   - Verwendet '*' als targetOrigin da die Parent-Origin variieren kann (dev/prod)
(function initMouseRelay() {
  if (window === window.parent) return; // Nicht im Iframe → nichts tun
  let lastSent = 0;
  var THROTTLE_MS = 16; // ~60fps
  document.addEventListener('mousemove', function(e) {
    var now = Date.now();
    if (now - lastSent < THROTTLE_MS) return;
    lastSent = now;
    try {
      window.parent.postMessage({
        type: 'IFRAME_MOUSE_MOVE',
        screenX: e.screenX,
        screenY: e.screenY,
      }, '*');
    } catch(err) {
      // parent not reachable — ignore
    }
  }, { passive: true });
})();
