// ===========================================================================
// ContentBlocks.jsx — rendert die Blöcke einer Lerneinheit.
//
// Vertrag (verbindlich, Brief §7 / Agent Kapitel):
//   <ContentBlocks bloecke={[{ block, tiefe, id }]} kapitel={kapitel} einheit={einheit} />
// Jeder Block wird in <section id={id} data-block data-tiefe={tiefe}
// className="block"> gehüllt (Abstand 24 px über bloecke.css).
// Rückwärtskompatibel: `blocks`/`chapter` (Übergangsseiten) werden zu
// `bloecke` mit ids b0…; sind beide da, gilt `bloecke`. Unbekannte Typen:
// console.warn nur in der Entwicklung, sonst ausgelassen. Ein Fehler in einem
// Block reißt nicht die Seite mit (Fehlergrenze je Block).
// Optional: `hervorgehoben={blockId}` setzt die Klasse block-hervor (Deeplink).
// ===========================================================================
import { Component, useMemo } from 'react';
import { BlockKontext } from './Kontext.jsx';
import { quellenNummern } from '../../utils/citeMap.js';
import Absatz from './Absatz.jsx';
import Hinweis from './Hinweis.jsx';
import Tabelle from './Tabelle.jsx';
import KachelRaster from './KachelRaster.jsx';
import Zeitleiste from './Zeitleiste.jsx';
import Heatmap from './Heatmap.jsx';
import Diagramm from './Diagramm.jsx';
import Flussdiagramm from './Flussdiagramm.jsx';
import RegulierungsPyramide from './RegulierungsPyramide.jsx';
import Wertschoepfungskette from './Wertschoepfungskette.jsx';
import CombinedRatioRechner from './CombinedRatioRechner.jsx';
import Provisionsrechner from './Provisionsrechner.jsx';
import TrendRadar from './TrendRadar.jsx';
import Netzwerk from './Netzwerk.jsx';
import Entscheidungsbaum from './Entscheidungsbaum.jsx';
import ArchetypenKarte from './ArchetypenKarte.jsx';
import StufenTabelle from './StufenTabelle.jsx';
import MorphologischerKasten from './MorphologischerKasten.jsx';
import FormelAufbau from './FormelAufbau.jsx';
import SimulationGrosseZahlen from './SimulationGrosseZahlen.jsx';
import Risikokette from './Risikokette.jsx';
import ProzessKette from './ProzessKette.jsx';

/** Blocktyp → Bauteil. Neue Typen hier registrieren. */
export const BLOCK_MAP = {
  paragraph: Absatz,
  callout: Hinweis,
  table: Tabelle,
  comparisonTable: Tabelle,
  infoKachelGrid: KachelRaster,
  timeline: Zeitleiste,
  heatmapGrid: Heatmap,
  chartLine: Diagramm,
  chartBar: Diagramm,
  chartDonut: Diagramm,
  sankey: Flussdiagramm,
  regulatoryPyramid: RegulierungsPyramide,
  valueChain: Wertschoepfungskette,
  combinedRatioCalc: CombinedRatioRechner,
  provisionCalc: Provisionsrechner,
  trendRadar: TrendRadar,
  networkGraph: Netzwerk,
  decisionTree: Entscheidungsbaum,
  // Grafiken des Sektortrainings (im Hausstil gezeichnet, keine Bilder)
  archetypenKarte: ArchetypenKarte,
  stufenTabelle: StufenTabelle,
  morphologischerKasten: MorphologischerKasten,
  formelAufbau: FormelAufbau,
  simulationGrosseZahlen: SimulationGrosseZahlen,
  risikokette: Risikokette,
  prozessKette: ProzessKette,
};

const gewarnt = new Set();
function warne(typ) {
  if (!import.meta.env.DEV || gewarnt.has(typ)) return;
  gewarnt.add(typ);
  console.warn(`[ContentBlocks] Unbekannter Blocktyp „${typ}“ wird ausgelassen.`);
}

/** Fängt Laufzeitfehler eines einzelnen Blocks ab; die übrigen Blöcke bleiben sichtbar. */
class Fehlergrenze extends Component {
  constructor(props) {
    super(props);
    this.state = { fehler: null };
  }

  static getDerivedStateFromError(fehler) {
    return { fehler };
  }

  componentDidCatch(fehler) {
    if (import.meta.env.DEV) console.warn(`[ContentBlocks] Block „${this.props.typ}“ konnte nicht gerendert werden:`, fehler);
  }

  render() {
    if (this.state.fehler) {
      return import.meta.env.DEV
        ? <p className="meta">Block „{this.props.typ}“ konnte nicht dargestellt werden.</p>
        : null;
    }
    return this.props.children;
  }
}

export default function ContentBlocks({ bloecke, kapitel, einheit, blocks, chapter, hervorgehoben }) {
  const liste = useMemo(() => {
    if (Array.isArray(bloecke)) return bloecke.filter((e) => e && e.block && typeof e.block === 'object');
    return (Array.isArray(blocks) ? blocks : [])
      .filter((b) => b && typeof b === 'object')
      .map((block, i) => ({ block, tiefe: 1, id: `b${i}` }));
  }, [bloecke, blocks]);
  const kap = kapitel || chapter || null;
  const nummern = useMemo(() => (einheit ? quellenNummern(einheit) : null), [einheit]);
  const kontext = useMemo(() => ({
    kapitel: kap,
    einheit: einheit || null,
    nummerFuer: (text) => (nummern ? (nummern.get(text) ?? null) : null),
  }), [kap, einheit, nummern]);

  if (liste.length === 0) return null;

  return (
    <BlockKontext.Provider value={kontext}>
      <div className="bloecke">
        {liste.map(({ block, tiefe, id }, i) => {
          const Bauteil = BLOCK_MAP[block.type];
          if (!Bauteil) { warne(block.type); return null; }
          const kennung = id || `b${i}`;
          const klassen = ['block', hervorgehoben && hervorgehoben === kennung ? 'block-hervor' : ''].filter(Boolean).join(' ');
          return (
            <section key={kennung} id={kennung} data-block="" data-tiefe={tiefe ?? 1} data-typ={block.type} className={klassen}>
              <Fehlergrenze typ={block.type}>
                <Bauteil block={block} kapitel={kap} einheit={einheit || null} blockId={kennung} />
              </Fehlergrenze>
            </section>
          );
        })}
      </div>
    </BlockKontext.Provider>
  );
}
