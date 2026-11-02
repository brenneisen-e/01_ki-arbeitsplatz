// parent-keyboard-relay.js — Keyboard event relay for iframe → parent communication
//
// Leitet bestimmte Tastenkürzel (Ö, Ä) an Parent-Window weiter,
// damit Moderator-Shortcuts auch bei Iframe-Focus funktionieren.
// Wird nur aktiv wenn die App in einem Iframe läuft.
//
// Funktionsweise:
//   - Erkennt ob die App in einem Iframe läuft (window !== window.parent)
//   - Lauscht auf keydown-Events auf dem Document
//   - Filtert auf spezielle Tasten (Ö, Ä)
//   - Sendet { type: 'IFRAME_KEYDOWN', key } an Parent via postMessage
//   - Parent (EikeCase) dispatcht ein synthetisches keydown-Event auf document
(function initKeyboardRelay() {
  if (window === window.parent) return; // Nicht im Iframe → nichts tun
  var FORWARDED_KEYS = ['ö', 'ä'];
  document.addEventListener('keydown', function(e) {
    if (FORWARDED_KEYS.indexOf(e.key.toLowerCase()) === -1) return;
    try {
      window.parent.postMessage({
        type: 'IFRAME_KEYDOWN',
        key: e.key,
      }, '*');
    } catch(err) {
      // parent not reachable — ignore
    }
  });
})();
