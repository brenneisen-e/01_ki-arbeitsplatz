import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Faengt Render-Fehler ab, damit ein einzelner Fehler nicht die gesamte Seite
 * leer laesst. Haeufigste Ursache ist ein gespeicherter Sitzungsstand, der
 * nicht mehr zur aktuellen Version passt — deshalb bietet die Ansicht direkt
 * an, ihn zu verwerfen.
 */
export default class FehlerGrenze extends Component {
  constructor(props) {
    super(props);
    this.state = { fehler: null };
  }

  static getDerivedStateFromError(fehler) {
    return { fehler };
  }

  componentDidCatch(fehler, info) {
    // Im Demo-Betrieb reicht die Konsole; hier waere der Platz fuer ein Logging-Backend.
    console.error('ControlHub: Renderfehler', fehler, info);
  }

  zuruecksetzen = () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('controlhub_') || k.startsWith('biks_') || k.startsWith('iks_'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
    window.location.reload();
  };

  render() {
    if (!this.state.fehler) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="card-base p-6 max-w-lg w-full">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
               style={{ background: '#FEF2F2', color: '#B91C1C' }}>
            <AlertTriangle size={22} strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Die Ansicht konnte nicht geladen werden</h1>
          <p className="text-[13.5px] text-slate-600 mt-1.5 leading-relaxed">
            Meist liegt es an einem gespeicherten Sitzungsstand aus einer älteren Version des Tools. Ein Zurücksetzen
            verwirft nur lokale Demo-Daten dieser Sitzung — es gehen keine echten Inhalte verloren.
          </p>
          <button
            onClick={this.zuruecksetzen}
            className="mt-4 px-4 py-2.5 rounded-xl text-white text-[14px] font-semibold inline-flex items-center gap-2 transition-all hover:brightness-110"
            style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}
          >
            <RotateCcw size={16} /> Sitzung zurücksetzen und neu laden
          </button>
          <pre className="mt-4 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap">
            {String(this.state.fehler?.message || this.state.fehler)}
          </pre>
        </div>
      </div>
    );
  }
}
