// Notiz-Relay für die Einbettung in Banking Horizon (und EikeCase): läuft nur,
// wenn die App in einem iframe steckt. Schaltet der Elternrahmen das Relay ein
// (NOTES_RELAY, weil dort das Notizfenster offen ist), geht das Mausrad als
// IFRAME_WHEEL an ihn: senkrecht scrollt er damit die Speakernotes, waagerecht
// kommt als PARENT_SCROLL zurück und scrollt diese Seite senkrecht. Ohne
// Elternrahmen oder ausgeschaltet verhält sich die App wie gewohnt.
export function initNotizenRelay() {
  if (window === window.parent) return;
  let aktiv = false;
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === 'NOTES_RELAY') aktiv = Boolean(d.on);
    if (d.type === 'PARENT_SCROLL' && typeof d.deltaY === 'number') {
      window.scrollBy({ top: d.deltaY, behavior: 'auto' });
    }
  });
  document.addEventListener('wheel', (e) => {
    if (!aktiv) return;
    e.preventDefault();
    try {
      window.parent.postMessage({ type: 'IFRAME_WHEEL', deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode }, '*');
    } catch {
      // Elternrahmen nicht erreichbar
    }
  }, { passive: false, capture: true });
}
