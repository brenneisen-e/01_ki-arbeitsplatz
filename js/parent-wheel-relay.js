// parent-wheel-relay.js — Wheel event relay for iframe → parent communication
//
// Unterscheidet zwischen vertikalem und horizontalem Scrollrad:
//   - Vertikales Rad (deltaY) → an Parent weiterleiten (Speaker Notes scrollen)
//   - Horizontales Rad (deltaX) → Iframe selbst vertikal scrollen
// Wird nur aktiv wenn die App in einem Iframe läuft.
//
// Funktionsweise:
//   - Erkennt ob die App in einem Iframe läuft (window !== window.parent)
//   - Lauscht auf wheel-Events auf dem Document
//   - preventDefault() blockiert das native Scroll-Verhalten
//   - Horizontales Rad: scrollt den Iframe vertikal (deltaX → scrollBy top)
//   - Vertikales Rad: sendet { type: 'IFRAME_WHEEL', deltaX, deltaY, deltaMode } an Parent
//   - Verwendet '*' als targetOrigin da die Parent-Origin variieren kann (dev/prod)
(function initWheelRelay() {
  if (window === window.parent) return; // Nicht im Iframe → nichts tun
  document.addEventListener('wheel', function(e) {
    e.preventDefault(); // Natives Scroll-Verhalten blockieren

    var isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (isHorizontal) {
      // Horizontales Rad → Iframe vertikal scrollen
      var delta = e.deltaX;
      if (e.deltaMode === 1) delta *= 40;       // Zeilen → Pixel
      else if (e.deltaMode === 2) delta *= window.innerHeight; // Seiten → Pixel
      window.scrollBy({ top: delta, behavior: 'auto' });
    } else {
      // Vertikales Rad → an Parent weiterleiten (Speaker Notes)
      try {
        window.parent.postMessage({
          type: 'IFRAME_WHEEL',
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaMode: e.deltaMode,
        }, '*');
      } catch(err) {
        // parent not reachable — ignore
      }
    }
  }, { passive: false }); // passive: false nötig für preventDefault()
})();
