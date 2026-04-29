import { useScene } from '../../hooks/useScene'
import { useParallax } from '../../hooks/useParallax'
import { SceneLayer } from './SceneLayer'
import { Sky } from './Outdoor/Sky'
import { Trees } from './Outdoor/Trees'
import { Customers } from './Outdoor/Customers'
import { Floor } from './Floor'
import { BasementIT } from './floors/BasementIT'
import { GroundOperations } from './floors/GroundOperations'
import { TopBoardroom } from './floors/TopBoardroom'
import { DataPulse } from './effects/DataPulse'

/**
 * Master-Komponente: Frontalquerschnitt der Bank der Zukunft.
 *
 * Layout im SVG-viewBox (1600 × 1000):
 *   y =   0 – 540 : Himmel (mit Wolken / Sternen)
 *   y = 200 – 380 : Top-Etage (Vorstand / KI-Steuerung)
 *   y = 380 – 560 : Erdgeschoss (Operations / Process Mining)
 *   y = 560 – 740 : Keller (IT & Daten-Backbone)
 *   y = 740 – 1000 : Außenbereich (Vorplatz, Bäume, Kunden)
 *
 * Außerhalb des Gebäudes: Vorplatz, Customers, Trees, Sky.
 */
export function BankBuilding() {
  const theme = useScene((s) => s.theme)
  const setActiveFloor = useScene((s) => s.setActiveFloor)
  const stageRef = useParallax<HTMLDivElement>(0.6)

  return (
    <div
      ref={stageRef}
      className="tiltshift vignette relative w-full h-full"
      data-theme={theme}
      onClick={() => setActiveFloor(null)}
    >
      {/* Himmel (Asset-Slot mit Fallback) */}
      <SceneLayer
        slot="background-sky"
        src={`/assets/scene/sky-${theme}-4k.webp`}
        fallback={<Sky theme={theme} />}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hauptbühne */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid meet"
        className="relative w-full h-full"
        aria-label="Bank-Querschnitt 2035"
      >
        {/* Background-Hügel + Boden — sehr dezent */}
        <rect x="0" y="740" width="1600" height="260" fill={theme === 'night' ? '#0d2030' : '#a3b8c8'} />
        <ellipse cx="800" cy="760" rx="900" ry="40" fill={theme === 'night' ? '#15324e' : '#88a4bd'} opacity="0.55" />

        {/* Bäume + Customer-Bühne (außen) */}
        <Trees theme={theme} />
        <Customers />

        {/* Datenkabel-Pulse zwischen Etagen */}
        <DataPulse from={{ x: 800, y: 740 }} to={{ x: 800, y: 560 }} delay={0} />
        <DataPulse from={{ x: 800, y: 560 }} to={{ x: 800, y: 380 }} delay={1.4} />

        {/* Gebäude-Querschnitt */}
        <SceneLayerInline slot="building-facade" />

        {/* Etagen */}
        <Floor id="basement" x={420} y={560} width={760} height={180} label="Keller — IT & Daten">
          <BasementIT />
        </Floor>
        <Floor id="ground" x={420} y={380} width={760} height={180} label="Erdgeschoss — Operations">
          <GroundOperations />
        </Floor>
        <Floor id="top" x={420} y={200} width={760} height={180} label="Vorstand — AI Governance">
          <TopBoardroom />
        </Floor>

        {/* Dach */}
        <polygon points="380,200 800,90 1220,200" fill="var(--color-facade-dark)" stroke="var(--color-facade-accent)" strokeWidth="2" />
        {/* Fahnenmast */}
        <line x1="800" y1="90" x2="800" y2="40" stroke="var(--color-text-mid)" strokeWidth="1.6" />
        <polygon points="800,40 855,52 800,64" fill="var(--color-teal)" />
        <text x="862" y="58" fontSize="13" fontWeight="700" fill="var(--color-text-hi)" fontFamily="var(--font-display)">2035</text>
      </svg>
    </div>
  )
}

/** Hülle-Slot, derzeit kein eigener Default — Etagen sind die Fassade. */
function SceneLayerInline({ slot }: { slot: string }) {
  return <SceneLayer slot={slot} fallback={null} />
}
