import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { Home, User, Building2, FileText, AlertTriangle, Clock, Settings, Shield } from 'lucide-react';
import ReklamationFormView from './views/ReklamationFormView';
import BackofficeView from './views/BackofficeView';
import AdminView from './views/AdminView';
import { DEMO_VORGAENGE } from './data/demoData';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/provisionsreklamation/')) {
    return path.substring(0, path.indexOf('/provisionsreklamation/')) + '/';
  }
  return '/';
}

const TABS = [
  { id: 'formular', label: 'Reklamation einreichen', icon: User },
  { id: 'backoffice', label: 'Backoffice', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: Shield },
];

const HEADER_STATS = [
  { icon: FileText, text: '14 Offene Vorgänge' },
  { icon: AlertTriangle, text: '4 Auffälligkeiten (1 Cluster)', className: 'text-amber-300' },
  { icon: Clock, text: 'Ø 4,2 Tage Bearbeitung' },
];

export default function ProvisionsreklamationModule() {
  const [activeTab, setActiveTab] = useState('formular');
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
      {/* Header — orientiert am GlobalHeader des Vertriebsarbeitsplatzes */}
      <header className="transition-all duration-500" style={{ background: 'var(--mode-gradient)' }}>
        {/* Top Row */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { window.location.href = getBasePath(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zurück zur Startseite"
            >
              <Home size={16} strokeWidth={1.75} />
              <span className="text-xs font-medium hidden sm:inline">Startseite</span>
            </button>

            <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
              <FileText size={22} className="text-white" strokeWidth={1.75} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden bg-white/20">
                <img
                  src="./images/lisa-neumann.png"
                  alt="Lisa Neumann"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  Sachbearbeiterin: Lisa Neumann
                </div>
                <div className="text-white/60 text-xs">
                  Abt. Provisionsservice | Aktiv
                </div>
              </div>
            </div>

            {/* Header Stats — nur im Backoffice-Tab */}
            {activeTab === 'backoffice' && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                {HEADER_STATS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <span key={i} className="flex items-center gap-1 text-white/80 text-xs">
                      <Icon size={13} className={item.className || 'text-white/60'} />
                      {item.text}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs">
              <FileText size={16} className="text-white/80" />
              <span className="font-medium">Provisionsreklamation</span>
            </div>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Settings size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Demo-Hinweis */}
        <div className="px-6 flex justify-end -mt-1 pb-1">
          <span className="text-[11px] text-white/40 tracking-wide">
            Demo-Umgebung — Rein synthetische Daten, keine echten Kundendaten
          </span>
        </div>

        {/* Tab-Leiste */}
        <div className="px-6 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const badgeCount = tab.id === 'formular' ? inboxCount : tab.id === 'backoffice' ? backofficeRepliesCount : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 relative',
                  activeTab === tab.id
                    ? 'bg-white text-slate-800'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {tab.label}
                {badgeCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-red-500 text-white shadow-sm">
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
