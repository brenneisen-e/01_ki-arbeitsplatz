import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
  Bot, Send, X, Search, BarChart3, Download, FileSpreadsheet, User, ListFilter,
  FolderOpen, Copy, FileText,
} from 'lucide-react';
import { processQuery, CHAT_BEISPIELE, KONTEXT_BEISPIELE } from '../../data/chat';
import { getFullCustomerData } from '../../data/customerDetails';
import { useCollections } from '../../hooks/useCollections';
import { downloadCsv } from '../../utils/exportDoc';

function AntwortBlock({ block, onKunde }) {
  if (block.art === 'text') {
    return (
      <p className={clsx('text-[13px] leading-relaxed', block.betont ? 'font-semibold text-slate-900' : 'text-slate-700')}>
        {block.text}
      </p>
    );
  }

  if (block.art === 'kunden') {
    return (
      <ol className="space-y-1.5">
        {block.items.map((k, i) => (
          <li key={`${k.id}-${i}`} className="text-[13px]">
            <button
              onClick={() => onKunde(k.id)}
              className="font-semibold hover:underline text-left"
              style={{ color: 'var(--mode-primary)' }}
            >
              {block.nummeriert ? `${i + 1}. ` : '• '}{k.name}
            </button>
            <div className="text-[11px] text-slate-500 ml-3.5">{k.zeilen.join(' · ')}</div>
          </li>
        ))}
      </ol>
    );
  }

  if (block.art === 'kennzahlen') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {block.items.map(k => (
          <div key={k.label} className="rounded-lg bg-white border border-slate-200 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{k.label}</div>
            <div className="text-[13px] font-semibold text-slate-900 mt-0.5">{k.wert}</div>
          </div>
        ))}
      </div>
    );
  }

  if (block.art === 'entwurf') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
          <FileText size={13} className="text-slate-400 shrink-0" strokeWidth={1.9} />
          <span className="text-[12px] font-semibold text-slate-800 flex-1">{block.entwurf.titel}</span>
          <span className="text-[10px] text-slate-400">{block.entwurf.kanal}</span>
          <button
            onClick={() => navigator.clipboard?.writeText(block.entwurf.text).catch(() => {})}
            title="In die Zwischenablage kopieren"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Copy size={12} strokeWidth={1.9} />
          </button>
        </div>
        <pre className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap font-sans px-3 py-2.5 max-h-48 overflow-y-auto">{block.entwurf.text}</pre>
      </div>
    );
  }

  if (block.art === 'liste') {
    return (
      <div>
        {block.titel && <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">{block.titel}</div>}
        <ul className="space-y-1">
          {block.items.map(i => (
            <li key={i.label} className="flex items-center justify-between gap-3 text-[13px] text-slate-700">
              <span className="flex items-center gap-2">
                {i.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: i.color }} />}
                {i.label}
              </span>
              {i.wert && <span className="font-medium text-slate-900 shrink-0">{i.wert}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

const AKTION_ICON = { 'filter-kunden': Search, segment: ListFilter, 'dpd-bucket': BarChart3, 'kunde-oeffnen': User, 'akte-oeffnen': FolderOpen };

export default function CollectionsAssistant() {
  const {
    chatOffen, setChatOffen, oeffneKunde, oeffneCrm, zeigeKunden, setzeFilter, gotoSection, toast,
    crmKunde, detailKunde,
  } = useCollections();
  // Kontext des Assistenten: die gerade geoeffnete Akte bzw. der Schnellblick.
  const akteId = crmKunde?.id || detailKunde?.id || null;
  const akteName = akteId ? getFullCustomerData(akteId).name : null;
  const [verlauf, setVerlauf] = useState([]);
  const [eingabe, setEingabe] = useState('');
  const [tippt, setTippt] = useState(false);
  const endeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => { endeRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [verlauf, tippt]);

  const senden = text => {
    const frage = (text ?? eingabe).trim();
    if (!frage) return;
    setVerlauf(v => [...v, { rolle: 'user', text: frage }]);
    setEingabe('');
    setTippt(true);
    timerRef.current = setTimeout(() => {
      setTippt(false);
      setVerlauf(v => [...v, { rolle: 'assistent', antwort: processQuery(frage, { akteId, akteName }) }]);
    }, 550);
  };

  const aktionAusfuehren = a => {
    if (a.art === 'filter-kunden') { zeigeKunden(a.ids); return; }
    if (a.art === 'segment') { setzeFilter({ segment: a.segment, ids: null }); gotoSection('portfolio'); setChatOffen(false); return; }
    if (a.art === 'dpd-bucket') { setzeFilter({ dpdBucket: a.bucket, ids: null }); gotoSection('portfolio'); setChatOffen(false); return; }
    if (a.art === 'kunde-oeffnen') { oeffneKunde(a.id); return; }
    if (a.art === 'akte-oeffnen') { setChatOffen(false); oeffneCrm(a.id, { sektion: a.sektion }); }
  };

  if (!chatOffen) return null;

  return (
    <aside
      className="fixed bottom-6 right-6 z-[75] w-[440px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-fade-in-up"
      role="complementary"
      aria-label="Collections Assistent"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-t-2xl text-white shrink-0"
        style={{ background: 'var(--mode-gradient)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={18} strokeWidth={1.9} className="shrink-0" />
          <span className="text-sm font-semibold shrink-0">Collections Assistent</span>
          {akteName && (
            <span className="text-[10px] font-semibold bg-white/20 rounded-full px-2 py-0.5 truncate">
              Akte: {akteName}
            </span>
          )}
        </div>
        <button
          onClick={() => setChatOffen(false)}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
          aria-label="Assistent schließen"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {!verlauf.length && (
          <div className="text-center py-4">
            <span
              className="w-12 h-12 rounded-2xl inline-flex items-center justify-center mb-3"
              style={{ background: 'var(--mode-pastel)', color: 'var(--mode-primary)' }}
            >
              <Bot size={24} strokeWidth={1.7} />
            </span>
            <h4 className="text-sm font-semibold text-slate-800">Collections Assistent</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {akteName
                ? `Die Akte ${akteName} ist geöffnet — fragen Sie direkt zum Fall.`
                : 'Fragen Sie mich zu Kunden, Forderungen oder Portfolio-Daten.'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(akteName ? [...KONTEXT_BEISPIELE, ...CHAT_BEISPIELE.slice(0, 2)] : CHAT_BEISPIELE).map(b => (
                <button
                  key={b}
                  onClick={() => senden(b)}
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {verlauf.map((m, i) => m.rolle === 'user' ? (
          <div key={i} className="flex justify-end">
            <div
              className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-br-sm text-[13px] text-white"
              style={{ background: 'var(--mode-primary)' }}
            >
              {m.text}
            </div>
          </div>
        ) : (
          <div key={i} className="rounded-2xl rounded-bl-sm bg-slate-50 border border-slate-200 p-3.5 space-y-3">
            <div className="text-[13px] font-bold text-slate-900">{m.antwort.titel}</div>
            {m.antwort.bloecke.map((b, j) => <AntwortBlock key={j} block={b} onKunde={oeffneKunde} />)}

            {!!m.antwort.aktionen?.length && (
              <div className="flex flex-col gap-1.5 pt-1">
                {m.antwort.aktionen.map((a, j) => {
                  const Icon = AKTION_ICON[a.art] || Search;
                  return (
                    <button
                      key={j}
                      onClick={() => aktionAusfuehren(a)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-left"
                    >
                      <Icon size={13} strokeWidth={1.9} className="shrink-0" /> {a.label}
                    </button>
                  );
                })}
              </div>
            )}

            {m.antwort.exportItems?.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => {
                    downloadCsv(
                      m.antwort.exportItems.map(c => ({
                        Kundennummer: c.id, Name: c.name, Forderung: c.forderung,
                        Verzugstage: c.dpd, Segment: c.segment, Status: c.status,
                      })),
                      `${m.antwort.exportName}.csv`,
                    );
                    toast('Ergebnis als CSV heruntergeladen.', 'success');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-white transition-colors"
                >
                  <FileSpreadsheet size={12} strokeWidth={1.9} /> CSV
                </button>
                <button
                  onClick={() => { window.print(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-white transition-colors"
                >
                  <Download size={12} strokeWidth={1.9} /> Drucken/PDF
                </button>
              </div>
            )}

            {!!m.antwort.folgefragen?.length && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200">
                {m.antwort.folgefragen.map(f => (
                  <button
                    key={f}
                    onClick={() => senden(f)}
                    className="text-[11px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors mt-1.5"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {tippt && (
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-slate-50 border border-slate-200 w-fit">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse-soft"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={endeRef} />
      </div>

      <div className="p-3 border-t border-slate-200 flex items-end gap-2 shrink-0">
        <textarea
          value={eingabe}
          onChange={e => setEingabe(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); senden(); } }}
          rows={1}
          placeholder="Frage stellen …"
          aria-label="Frage an den Collections Assistenten"
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none max-h-24 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <button
          onClick={() => senden()}
          disabled={!eingabe.trim()}
          className="p-2.5 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ background: 'var(--mode-primary)' }}
          aria-label="Frage senden"
        >
          <Send size={16} strokeWidth={1.9} />
        </button>
      </div>
    </aside>
  );
}
