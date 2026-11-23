import { useEffect } from 'react';
import { useMode } from '../hooks/useMode';
import { useDayAdvanced } from '../utils/demoClock';
import { FENSTER_NAME, HERZSCHLAG_MS, NOTIZEN_KANAL, STAND_KEY } from './kanal';
import { NOTIZEN_MOEGLICH, useNotizenZusatz } from './stand';

// Kopplung des Arbeitsplatzes an das Notizfenster (speakernotes.html), das
// Gegenstück zu Notizen.jsx:
//
//  · schreibt den Stand nach localStorage, damit die Notizen der Navigation
//    folgen (storage-Ereignis im anderen Fenster),
//  · leitet das Mausrad um, solange das Notizfenster per Herzschlag als offen
//    gilt: senkrechtes Radeln scrollt die Notizen, waagerechtes (oder
//    Umschalt + Rad) scrollt den Arbeitsplatz senkrecht, wie in der Einbettung
//    in Banking Horizon (utils/notizenRelay.js). Im Notizfenster lässt sich das
//    abschalten.
//
// Läuft nur, wenn es ein Notizfenster geben kann (NOTIZEN_MOEGLICH).

let fenster = null;

/** Öffnet das Notizfenster; ist es schon offen, kommt es nach vorn. */
export function oeffneNotizen() {
  if (!NOTIZEN_MOEGLICH) return;
  if (fenster && !fenster.closed) {
    try { fenster.focus(); } catch { /* nicht erreichbar */ }
    return;
  }
  let adresse;
  try { adresse = new URL('speakernotes.html', document.baseURI).href; } catch { return; }
  const breite = 540;
  const hoehe = 780;
  const links = Math.max(0, window.screenX + window.outerWidth - breite - 40);
  const oben = Math.max(0, window.screenY + 60);
  fenster = window.open(
    adresse,
    FENSTER_NAME,
    `popup=yes,width=${breite},height=${hoehe},left=${links},top=${oben},resizable=yes,scrollbars=yes`,
  );
}

// Der nächste senkrecht scrollbare Rahmen unter dem Zeiger (Chat des
// Assistenten, Inhalt eines Fensters); sonst scrollt die Seite.
function scrollRahmen(el) {
  for (let n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    if (n.scrollHeight > n.clientHeight + 1) {
      const art = getComputedStyle(n).overflowY;
      if (art === 'auto' || art === 'scroll') return n;
    }
  }
  return null;
}

function scrolleArbeitsplatz(ziel, delta) {
  const rahmen = ziel instanceof Element ? scrollRahmen(ziel) : null;
  (rahmen || window).scrollBy({ top: delta, behavior: 'auto' });
}

export default function NotizenKopplung() {
  const { modeId, currentView, activeTab } = useMode();
  const tagWeiter = useDayAdvanced();
  const zusatz = useNotizenZusatz();

  // Stand für das Notizfenster. Auf der Landing Page gilt das dort gewählte
  // Modul: die Adresse bleibt beim Startmodus, auch wenn die Landing Page die
  // Zukunftsbank zeigt.
  useEffect(() => {
    if (!NOTIZEN_MOEGLICH) return;
    const stand = {
      modus: currentView === 'landing' && zusatz.landingModus ? zusatz.landingModus : modeId,
      ansicht: currentView,
      reiter: activeTab,
      assistent: zusatz.assistent,
      topLead: zusatz.topLead,
      anschreiben: zusatz.anschreiben,
      vorbereitung: zusatz.vorbereitung,
      praesSchritt: zusatz.praesSchritt,
      tagWeiter,
      t: Date.now(),
    };
    try { localStorage.setItem(STAND_KEY, JSON.stringify(stand)); } catch { /* ohne Speicher keine Kopplung */ }
  }, [modeId, currentView, activeTab, tagWeiter, zusatz]);

  // Kanal zum Notizfenster und Mausrad
  useEffect(() => {
    if (!NOTIZEN_MOEGLICH) return undefined;
    const kanal = new BroadcastChannel(NOTIZEN_KANAL);
    let offen = false;
    let rad = true;
    let zuletzt = 0;
    kanal.onmessage = (e) => {
      const d = e.data;
      if (d?.typ === 'offen') { offen = true; rad = d.rad !== false; zuletzt = Date.now(); }
      if (d?.typ === 'zu') offen = false;
    };
    // Bleibt der Herzschlag aus (Fenster abgestürzt, Rechner im Ruhezustand),
    // gehört das Rad wieder dem Arbeitsplatz.
    const pruefer = window.setInterval(() => {
      if (offen && Date.now() - zuletzt > HERZSCHLAG_MS * 2.5) offen = false;
    }, HERZSCHLAG_MS);
    const normiert = (delta, art) => (art === 1 ? delta * 40 : art === 2 ? delta * window.innerHeight : delta);
    const onWheel = (e) => {
      if (!offen || !rad) return;
      if (e.ctrlKey || e.metaKey) return; // Zoomen bleibt beim Browser
      const dx = normiert(e.deltaX, e.deltaMode);
      const dy = normiert(e.deltaY, e.deltaMode);
      // Umschalt + Rad kommt je nach Browser als deltaX oder mit deltaY an.
      const quer = Math.abs(dx) > Math.abs(dy) || (e.shiftKey && dx === 0);
      if (!quer && dy === 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (quer) scrolleArbeitsplatz(e.target, dx !== 0 ? dx : dy);
      else {
        try { kanal.postMessage({ typ: 'scroll', deltaY: dy }); } catch { /* Kanal zu */ }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      window.clearInterval(pruefer);
      window.removeEventListener('wheel', onWheel, { capture: true });
      kanal.close();
    };
  }, []);

  return null;
}
