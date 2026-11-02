// KapitelKopf — „Kapitel 01“, h1, Untertitel, Metazeile (Lerneinheiten,
// Lesezeit, gelesen) und die Kennzahlenleiste aus heroStat + quickStats:
// weiße Kacheln mit 1-px-Rand, Dezimalen aus dem Wert, CountUp nur beim
// ersten Erscheinen, Trend als Lucide-Icon. quickStats der Einheit gehen
// denen des Kapitels vor (Brief §11).
import { TrendingUp, TrendingDown, Clock, Layers } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import CountUp from '../ui/CountUp.jsx';
import Fortschrittsring from '../ui/Fortschrittsring.jsx';
import { minuten, mehrzahl } from '../../lib/format.js';
import { nummer } from '../../lib/text.js';

/**
 * Ein Trendpfeil steht nur an echten Vergleichen („+6,6 % vs. 2024“).
 * Freitexte wie „LVRG-Deckel: 25 ‰“ oder „davon 46 Mio. Renten“ sind keine
 * Entwicklung — sie stehen als neutrale Zusatzzeile ohne Pfeil (UX-Audit M4).
 */
function trendArt(trend) {
  const wert = String(trend?.value || '').trim();
  if (!wert) return null;
  if (!/^[+\-−]\s?\d/.test(wert)) return { ton: 'neutral', Pfeil: null };
  return trend.direction === 'down' ? { ton: 'fehler', Pfeil: TrendingDown } : { ton: 'erfolg', Pfeil: TrendingUp };
}

function Kennzahl({ wert, einheit, label, trend, gross = false, kennung }) {
  const art = trendArt(trend);
  return (
    <div className={`kennzahl-kachel ${gross ? 'kennzahl-kachel-gross' : ''}`.trim()} role="listitem">
      <span className="kennzahl-kachel-wert">
        <CountUp wert={wert} kennung={kennung} />
        {einheit ? <small>{einheit}</small> : null}
      </span>
      <span className="kennzahl-kachel-label">{label}</span>
      {art ? (
        <span className="kennzahl-kachel-trend" data-ton={art.ton}>
          {art.Pfeil ? <art.Pfeil size={14} aria-label={trend.direction === 'down' ? 'fallend' : 'steigend'} /> : null}
          {trend.value}
        </span>
      ) : null}
    </div>
  );
}

export default function KapitelKopf({ kapitel, kapitelIndex, einheit }) {
  const { fortschrittKapitel, lesezeitKapitel } = useWissen();
  const einheiten = kapitel.subChapters || [];
  const f = fortschrittKapitel(kapitel.id);
  const heroStat = kapitel.heroStat && Number.isFinite(Number(kapitel.heroStat.value)) ? kapitel.heroStat : null;
  const eigene = Array.isArray(einheit?.quickStats) && einheit.quickStats.length > 0;
  // Dieselbe Zahl nicht zweimal in einer Leiste: die Einheit „Leben & Rente“
  // führte „84 Mio. LV-Verträge“ neben dem Hero „84 Mio.
  // Lebensversicherungsverträge“ des Kapitels.
  const quickStats = ((eigene ? einheit.quickStats : kapitel.quickStats) || [])
    .filter((q) => q && Number.isFinite(Number(q.value)))
    .filter((q) => !heroStat || String(q.value) !== String(heroStat.value) || String(q.unit || '') !== String(heroStat.unit || ''))
    .slice(0, 3);
  const statKennung = eigene ? `${kapitel.id}/${einheit.id}` : kapitel.id;

  return (
    <header className="kapitel-kopf">
      <div className="ueberschrift-meta">Kapitel {nummer(kapitelIndex)}</div>
      <h1>{kapitel.title}</h1>
      {kapitel.subtitle ? <p className="kapitel-untertitel">{kapitel.subtitle}</p> : null}
      <div className="kapitel-meta">
        <span><Layers size={14} aria-hidden="true" />{mehrzahl(einheiten.length, 'Lerneinheit', 'Lerneinheiten')}</span>
        <span><Clock size={14} aria-hidden="true" />{minuten(lesezeitKapitel(kapitel.id))} Lesezeit</span>
        <span>
          <Fortschrittsring anteil={f.anteil} groesse={16} fertig={f.bestanden} label={f.bestanden ? 'Wissenscheck bestanden' : `${f.gelesen} von ${f.gesamt} gelesen`} />
          {f.gelesen} von {f.gesamt} gelesen
        </span>
      </div>
      {(heroStat || quickStats.length > 0) && (
        <div className="kapitel-kennzahlen" role="list" aria-label={`Kennzahlen zu ${kapitel.title}`} data-hero={heroStat ? 'true' : 'false'}>
          {heroStat && (
            <Kennzahl wert={heroStat.value} einheit={heroStat.unit} label={heroStat.label} trend={heroStat.trend} gross kennung={`${kapitel.id}-hero`} />
          )}
          {quickStats.map((q, i) => (
            <Kennzahl key={`${q.label}-${i}`} wert={q.value} einheit={q.unit} label={q.label} kennung={`${statKennung}-q${i}`} />
          ))}
        </div>
      )}
    </header>
  );
}
