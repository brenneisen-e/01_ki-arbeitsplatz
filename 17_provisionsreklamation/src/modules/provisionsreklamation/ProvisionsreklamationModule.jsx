import { useState, useCallback, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { Home, User, Building2, FileText, AlertTriangle, Clock, Settings, Shield, Download, Workflow, Play } from 'lucide-react';
import ReklamationFormView from './views/ReklamationFormView';
import BackofficeView from './views/BackofficeView';
import AdminView from './views/AdminView';
import ProzessUebersicht from './components/ProzessUebersicht';
import Praesentation from './components/Praesentation';
import DemoWasserzeichen from './components/DemoWasserzeichen';
import { DEMO_VORGAENGE } from './data/demoData';
import lisaNeumannBild from './lisa-neumann.png';

// Wird im Offline-Build (vite.config.offline.js) auf 'true' gesetzt. In diesem
// Modus versteckt sich der Download-Button — die Datei liegt dem Kunden ja
// bereits als offline-Demo vor.
const IS_OFFLINE_BUILD = import.meta.env.VITE_OFFLINE_BUILD === 'true';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/17_provisionsreklamation/')) {
    return path.substring(0, path.indexOf('/17_provisionsreklamation/')) + '/';
  }
  return '/';
}

const TABS = [
  { id: 'formular', label: 'Reklamation einreichen', icon: User },
  { id: 'backoffice', label: 'Backoffice', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'prozess', label: 'Prozess', icon: Workflow },
];

const TAB_IDS = TABS.map(t => t.id);

/** Ansicht aus dem URL-Hash, z. B. „#prozess“ – damit sich eine Seite direkt verlinken lässt. */
function tabAusHash() {
  const h = window.location.hash.replace('#', '');
  return TAB_IDS.includes(h) ? h : 'formular';
}

const HEADER_STATS = [
  { icon: FileText, text: '14 Offene Vorgänge' },
  { icon: AlertTriangle, text: '4 Auffälligkeiten (1 Cluster)', className: 'text-amber-300' },
  { icon: Clock, text: 'Ø 4,2 Tage Bearbeitung' },
];

export default function ProvisionsreklamationModule() {
  const [activeTab, setActiveTabState] = useState(tabAusHash);
  const [praesentation, setPraesentation] = useState({ offen: false, start: 0 });

  // Reiter und URL-Hash laufen synchron: Ein Wechsel schreibt den Hash, ein
  // Deep Link oder Zurück im Browser setzt den Reiter.
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    if (window.location.hash !== `#${tab}`) window.history.replaceState(null, '', `#${tab}`);
  }, []);
  useEffect(() => {
    const h = () => setActiveTabState(tabAusHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  // Alle Vorgänge (Demo + selbst eingereichte) leben jetzt hier, damit sowohl
  // das Backoffice-Tab als auch der Vermittler-Inbox im „Reklamation
  // einreichen"-Tab vom selben Datenstand lesen können.
  const [vorgaenge, setVorgaenge] = useState(DEMO_VORGAENGE);

  const addVorgang = useCallback((vorgang) => {
    setVorgaenge(prev => [vorgang, ...prev]);
  }, []);

  // Wenn der Sachbearbeiter im Backoffice eine Antwort verschickt, speichern
  // wir den neuen Status plus den Antworttext auf dem Vorgang und markieren
  // ihn als „vom Vermittler noch nicht gesichtet" (antwortGelesen: false).
  const handleVorgangStatusChange = useCallback((vorgangId, newStatus, antwortText) => {
    setVorgaenge(prev => prev.map(v => {
      if (v.id !== vorgangId) return v;
      return {
        ...v,
        status: newStatus,
        antwortText: antwortText || v.antwortText || null,
        antwortStatus: newStatus,
        antwortGelesen: false,
      };
    }));
  }, []);

  const handleMarkAntwortGelesen = useCallback((vorgangId) => {
    setVorgaenge(prev => prev.map(v =>
      v.id === vorgangId ? { ...v, antwortGelesen: true } : v
    ));
  }, []);

  // Vermittler beantwortet ein Ticket zurück an das Backoffice: Antworttext
  // wird gespeichert, Status wieder auf „In Bearbeitung", Inbox-Eintrag gilt
  // als gelesen (Vermittler hat reagiert), Backoffice erhält eine
  // ungelesene Rückmeldung.
  const handleVermittlerAntwort = useCallback((vorgangId, replyText) => {
    const nowIso = new Date().toISOString().split('T')[0];
    setVorgaenge(prev => prev.map(v => {
      if (v.id !== vorgangId) return v;
      return {
        ...v,
        status: 'In Bearbeitung',
        vermittlerAntwort: replyText,
        vermittlerAntwortDatum: nowIso,
        antwortGelesen: true,
        backofficeUnreadReply: true,
      };
    }));
    setActiveTab('backoffice');
  }, []);

  // „Neu eingereicht"-Flag + Rückmeldungs-Flag werden gecleared, sobald der
  // Sachbearbeiter im Backoffice einen Vorgang aktiv auswählt — der Eingang
  // bzw. die Rückmeldung gilt damit als gesichtet.
  const handleMarkVorgangSighted = useCallback((vorgangId) => {
    setVorgaenge(prev => {
      const hasNeuEingereicht = prev.some(v => v.isNeuEingereicht);
      const hasUnreadReplyOnSelected = vorgangId && prev.some(v => v.id === vorgangId && v.backofficeUnreadReply);
      if (!hasNeuEingereicht && !hasUnreadReplyOnSelected) return prev;
      return prev.map(v => {
        let next = v;
        if (v.isNeuEingereicht) next = { ...next, isNeuEingereicht: false };
        if (v.id === vorgangId && v.backofficeUnreadReply) next = { ...next, backofficeUnreadReply: false };
        return next;
      });
    });
  }, []);

  // Inbox-Vorgänge = alle Vorgänge mit Antwort, die noch nicht vom Vermittler
  // quittiert wurden.
  const inboxVorgaenge = useMemo(
    () => vorgaenge.filter(v => v.antwortText && !v.antwortGelesen),
    [vorgaenge]
  );
  const inboxCount = inboxVorgaenge.length;
  const backofficeRepliesCount = useMemo(
    () => vorgaenge.filter(v => v.backofficeUnreadReply).length,
    [vorgaenge]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header — dieselben Maße wie der GlobalHeader des Vertriebsarbeitsplatzes
          (163 px: Kopfzeile mit pt-14 unter der Wasserzeichen-Lasche, Reiter
          mit goldener Linie), Farbe Navy. Die Kopfzeile bricht nie um. */}
      <header className="transition-all duration-500 text-white" style={{ background: 'var(--mode-gradient)' }}>
        {/* Top Row */}
        <div className="px-6 pt-14 pb-3 flex items-center justify-between gap-4 whitespace-nowrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { window.location.href = getBasePath(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zurück zur Startseite"
            >
              <Home size={16} strokeWidth={1.75} />
              <span className="text-xs font-medium hidden sm:inline">Startseite</span>
            </button>

            <div className="w-10 h-10 rounded-lg header-glass flex items-center justify-center">
              <FileText size={22} strokeWidth={1.75} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10">
                <img
                  src={lisaNeumannBild}
                  alt="Lisa Neumann"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  Sachbearbeiterin: Lisa Neumann
                </div>
                <div className="text-white/70 text-xs">
                  Abt. Provisionsservice | Aktiv
                </div>
              </div>
            </div>

            {/* Header Stats — nur im Backoffice-Tab und ab 1600 px Breite */}
            {activeTab === 'backoffice' && (
              <div className="hidden min-[1600px]:flex items-center gap-3 ml-4 pl-4 border-l border-white/15">
                {HEADER_STATS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <span key={i} className="flex items-center gap-1 text-white/70 text-xs">
                      <Icon size={13} className={item.className || 'text-white/50'} />
                      {item.text}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!IS_OFFLINE_BUILD && (
              <a
                href="./provisionsreklamation-offline-demo.html"
                download="provisionsreklamation-offline-demo.html"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium"
                title="Komplette Demo als einzelne HTML-Datei herunterladen (offline nutzbar)"
              >
                <Download size={15} strokeWidth={1.75} />
                <span className="max-[1279px]:hidden">Offline-Demo herunterladen</span>
              </a>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium">
              <FileText size={15} strokeWidth={1.75} className="text-white/80" />
              <span>Provisionsreklamation</span>
            </div>
            <button className="p-2 rounded-lg header-glass">
              <Settings size={18} strokeWidth={1.75} />
            </button>
            {/* Play-Knopf ganz rechts: startet die Präsentation von jedem Reiter aus */}
            <button
              onClick={() => setPraesentation({ offen: true, start: 0 })}
              title="Präsentation starten"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white bg-white text-(--mode-primary) text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              <Play size={14} strokeWidth={2} fill="currentColor" />
              Präsentation
            </button>
          </div>
        </div>

        <DemoWasserzeichen />

        {/* Tab-Leiste */}
        <div className="px-6 flex gap-1 overflow-x-auto pb-0 border-t border-white/10 mt-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const badgeCount = tab.id === 'formular' ? inboxCount : tab.id === 'backoffice' ? backofficeRepliesCount : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-(--mode-accent) text-white'
                    : 'border-transparent text-white/65 hover:text-white'
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {tab.label}
                {badgeCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {activeTab === 'formular' && (
          <ReklamationFormView
            onSubmit={addVorgang}
            inboxVorgaenge={inboxVorgaenge}
            onMarkAntwortGelesen={handleMarkAntwortGelesen}
            onVermittlerAntwort={handleVermittlerAntwort}
          />
        )}
        {activeTab === 'backoffice' && (
          <BackofficeView
            vorgaenge={vorgaenge}
            onStatusChange={handleVorgangStatusChange}
            onMarkVorgangSighted={handleMarkVorgangSighted}
          />
        )}
        {activeTab === 'admin' && (
          <AdminView />
        )}
        {activeTab === 'prozess' && (
          <div className="p-6">
            <ProzessUebersicht aufAbspielen={(i) => setPraesentation({ offen: true, start: i })} />
          </div>
        )}
        <Praesentation
          offen={praesentation.offen}
          startSchritt={praesentation.start}
          onClose={() => setPraesentation(p => ({ ...p, offen: false }))}
          aufBackoffice={() => setActiveTab('backoffice')}
        />
      </main>

      {/* Datenschutz-Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-slate-400">
          Demo-Modus. Alle dargestellten Personen, Verträge und Provisionen sind fiktiv.
          In einer produktiven Umgebung gelten die Anforderungen der DSGVO (Art. 6 Abs. 1 lit. b/f),
          des GDV-Datenschutzkodex sowie eine Aufbewahrungspflicht von 6–10 Jahren gem. HGB/AO.
        </p>
      </footer>
    </div>
  );
}
