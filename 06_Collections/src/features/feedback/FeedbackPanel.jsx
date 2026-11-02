import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Lightbulb, AlertCircle, HelpCircle, ThumbsUp, Download, RotateCcw, Trash2, MessageSquare } from 'lucide-react';
import { useCollections } from '../../hooks/useCollections';
import { Drawer, EmptyState } from '../../components/ui/primitives';
import { downloadBlob } from '../../utils/exportDoc';
import { datumZeit } from '../../utils/format';

const SPEICHER = 'collections_feedback';

const TYPEN = [
  { id: 'verbesserung', label: 'Verbesserung', icon: Lightbulb },
  { id: 'fehler', label: 'Fehler', icon: AlertCircle },
  { id: 'frage', label: 'Frage', icon: HelpCircle },
  { id: 'lob', label: 'Lob', icon: ThumbsUp },
];

const BEREICHE = [
  { value: 'allgemein', label: 'Allgemein' },
  { value: 'dashboard', label: 'Dashboard-Übersicht' },
  { value: 'npl', label: 'NPL Dashboard' },
  { value: 'stage2', label: 'Stage 2 Monitoring' },
  { value: 'aufgaben', label: 'Aufgaben' },
  { value: 'kundenakte', label: 'Kundenakte' },
  { value: 'konten', label: 'Konten & Finanzen' },
  { value: 'kommunikation', label: 'Kommunikation' },
  { value: 'ki-analyse', label: 'KI-Analyse' },
  { value: 'design', label: 'Design / UI' },
  { value: 'daten', label: 'Daten / Konsistenz' },
  { value: 'funktion', label: 'Funktionalität' },
];

const AUTOREN = ['Eike', 'Bianca'];

function lesen() {
  try {
    const roh = localStorage.getItem(SPEICHER);
    return roh ? JSON.parse(roh) : [];
  } catch {
    return [];
  }
}

function schreiben(liste) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(liste));
  } catch {
    // Privater Modus oder gesperrter Speicher: Eintraege bleiben nur in dieser Sitzung.
  }
}

export default function FeedbackPanel() {
  const { feedbackOffen, setFeedbackOffen, toast } = useCollections();
  const [liste, setListe] = useState([]);
  const [autor, setAutor] = useState('');
  const [eigenerName, setEigenerName] = useState('');
  const [bereich, setBereich] = useState('allgemein');
  const [typ, setTyp] = useState('verbesserung');
  const [text, setText] = useState('');

  useEffect(() => { if (feedbackOffen) setListe(lesen()); }, [feedbackOffen]);

  const speichern = () => {
    const name = autor === 'custom' ? eigenerName.trim() : autor;
    if (!name) { toast('Bitte wählen Sie einen Autor aus.', 'error'); return; }
    if (!text.trim()) { toast('Bitte geben Sie einen Kommentar ein.', 'error'); return; }

    const eintrag = {
      id: `${Date.now()}`,
      autor: name, bereich, typ, text: text.trim(),
      zeitpunkt: new Date().toISOString(),
    };
    const neu = [eintrag, ...liste];
    setListe(neu);
    schreiben(neu);
    setText('');
    toast('Feedback gespeichert.', 'success');
  };

  const loeschen = id => {
    const neu = liste.filter(e => e.id !== id);
    setListe(neu);
    schreiben(neu);
  };

  const exportieren = () => {
    if (!liste.length) { toast('Es liegt noch kein Feedback vor.', 'info'); return; }
    downloadBlob(JSON.stringify(liste, null, 2), 'collections-feedback.json', 'application/json;charset=utf-8');
    toast('Feedback als JSON exportiert.', 'success');
  };

  return (
    <Drawer
      offen={feedbackOffen}
      onClose={() => setFeedbackOffen(false)}
      titel="Feedback & Kommentare"
      subtitel="Hinweise und Verbesserungsvorschläge zum Dashboard"
      ikone={<MessageSquare size={20} strokeWidth={1.8} />}
    >
      <div className="p-5 space-y-4 border-b border-slate-100">
        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">Autor</span>
          <div className="flex gap-2">
            <select
              value={autor}
              onChange={e => setAutor(e.target.value)}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-label="Autor auswählen"
            >
              <option value="">– Wählen –</option>
              {AUTOREN.map(a => <option key={a} value={a}>{a}</option>)}
              <option value="custom">Anderer Name …</option>
            </select>
            {autor === 'custom' && (
              <input
                type="text" value={eigenerName} onChange={e => setEigenerName(e.target.value)}
                placeholder="Ihr Name"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Eigenen Namen eingeben"
              />
            )}
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">Bereich</span>
          <select
            value={bereich} onChange={e => setBereich(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {BEREICHE.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </label>

        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">Typ</span>
          <div className="grid grid-cols-4 gap-1.5">
            {TYPEN.map(t => {
              const Icon = t.icon;
              const aktiv = typ === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTyp(t.id)}
                  className={clsx('flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] font-medium transition-colors',
                    aktiv ? 'text-white border-transparent' : 'text-slate-600 border-slate-200 hover:bg-slate-50')}
                  style={aktiv ? { background: 'var(--mode-primary)' } : undefined}
                >
                  <Icon size={15} strokeWidth={1.9} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">Kommentar</span>
          <textarea
            rows={4} value={text} onChange={e => setText(e.target.value)}
            placeholder="Beschreiben Sie Ihr Feedback …"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <button
          onClick={speichern}
          className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'var(--mode-primary)' }}
        >
          Feedback speichern
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-semibold text-slate-800">Bisherige Kommentare ({liste.length})</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setListe(lesen())}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Aktualisieren"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={exportieren}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Als JSON exportieren"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {liste.length ? (
          <div className="space-y-2.5">
            {liste.map(e => {
              const t = TYPEN.find(x => x.id === e.typ) || TYPEN[0];
              const Icon = t.icon;
              return (
                <div key={e.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={13} className="text-slate-400 shrink-0" strokeWidth={1.9} />
                    <span className="text-[12px] font-semibold text-slate-800">{e.autor}</span>
                    <span className="text-[11px] text-slate-400">
                      {BEREICHE.find(b => b.value === e.bereich)?.label} · {datumZeit(e.zeitpunkt)}
                    </span>
                    <button
                      onClick={() => loeschen(e.id)}
                      className="ml-auto p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="Kommentar löschen"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">{e.text}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState text="Noch kein Feedback erfasst." />
        )}
      </div>
    </Drawer>
  );
}
