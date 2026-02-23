// parent-scroll-relay.js — Scroll relay for parent → iframe communication
//
// Empfängt Scroll-Befehle vom Parent-Window (EikeCase) und scrollt die App.
// Wird nur aktiv wenn die App in einem Iframe läuft.
//
// Funktionsweise:
//   - Erkennt ob die App in einem Iframe läuft (window !== window.parent)
//   - Lauscht auf 'message'-Events
//   - Filtert auf { type: 'PARENT_SCROLL', deltaY: number }
//   - Scrollt die Seite um deltaY Pixel vertikal
//   - Ermöglicht dem Presenter, den Iframe mit dem horizontalen Scrollrad zu scrollen
(function initScrollRelay() {
  if (window === window.parent) return; // Nicht im Iframe → nichts tun
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'PARENT_SCROLL' && typeof e.data.deltaY === 'number') {
      window.scrollBy({ top: e.data.deltaY, behavior: 'auto' });
    }
  });
})();
