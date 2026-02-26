// parent-wheel-relay.js — Wheel event relay for iframe → parent communication
//
// Leitet Scroll-Events an Parent-Window weiter damit die Speaker Notes scrollen,
// NICHT die kiarbeitsplatz-App im Iframe.
// Wird nur aktiv wenn die App in einem Iframe läuft.
//
// Funktionsweise:
//   - Erkennt ob die App in einem Iframe läuft (window !== window.parent)
//   - Lauscht auf wheel-Events auf dem Document
//   - preventDefault() blockiert das Scrollen im Iframe
//   - Sendet { type: 'IFRAME_WHEEL', deltaX, deltaY, deltaMode } an Parent via postMessage
//   - Parent (EikeCase) empfängt die Nachricht und entscheidet:
//     - Vertikales Rad → Speaker Notes scrollen
//     - Horizontales Rad → PARENT_SCROLL zurück an Iframe → parent-scroll-relay.js scrollt vertikal
//   - Verwendet '*' als targetOrigin da die Parent-Origin variieren kann (dev/prod)
(function initWheelRelay() {
  if (window === window.parent) return; // Nicht im Iframe → nichts tun
  document.addEventListener('wheel', function(e) {
    e.preventDefault(); // Scroll im Iframe blockieren
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
  }, { passive: false }); // passive: false nötig für preventDefault()
})();
