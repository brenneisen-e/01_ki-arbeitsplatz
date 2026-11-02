import { useRef, useState } from 'react'
import { Download, Upload, RotateCcw, Check, CircleAlert, Palette } from 'lucide-react'
import { Schublade } from '../ui/Schublade'
import { Karte, KarteKopf, KarteKoerper, Btn, Badge, Segment, Hinweis, Schalter, WertZeile } from '../ui/basis'
import { useMarke } from './MarkeProvider'
import { Bildmarke, MarkenFeld } from './Wortmarke'
import { PRESETS, pruefeKontraste, farbskala, STANDARD_SPRACHE } from './marke'
import { zahl } from '../lib/format'

const WORTMARKEN = [
  { id: 'raute', label: 'Raute' },
  { id: 'balken', label: 'Balken' },
  { id: 'ring', label: 'Ring' },
]

const RADIEN = [
  { id: 'scharf', label: 'Scharf' },
  { id: 'normal', label: 'Normal' },
  { id: 'weich', label: 'Weich' },
]

function Farbfeld({ label, wert, onAendern, hinweis }) {
  return (
    <div>
      <label className="vg-label">{label}</label>
      <div className="vg-reihe" style={{ gap: 8 }}>
        <input
          type="color"
          value={wert}
          onChange={e => onAendern(e.target.value)}
          style={{
            width: 38, height: 32, padding: 2, border: '1px solid var(--vg-rand-stark)',
            borderRadius: 'var(--vg-r-sm)', background: 'var(--vg-flaeche)', cursor: 'pointer',
          }}
          aria-label={label}
        />
        <input
          className="vg-feld vg-mono vg-fuellen"
          value={wert}
          onChange={e => onAendern(e.target.value)}
          spellCheck={false}
        />
      </div>
      {hinweis && <p className="vg-t-xs vg-schwach" style={{ margin: '4px 0 0' }}>{hinweis}</p>}
    </div>
  )
}

export default function MarkenStudio({ offen, onSchliessen }) {
  const { marke, aendere, aendereSprache, setzePreset, zuruecksetzen, setzeMarke } = useMarke()
  const dateiRef = useRef(null)
  const [fehler, setFehler] = useState(null)

  const kontraste = pruefeKontraste(marke)
  const skala = farbskala(marke.primary)

  const exportieren = () => {
    const blob = new Blob([JSON.stringify({ schema: 'verguetungswerk.marke.v1', ...marke }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'marke.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importieren = (datei) => {
    const leser = new FileReader()
    leser.onload = () => {
      try {
        const d = JSON.parse(String(leser.result))
        if (d.schema !== 'verguetungswerk.marke.v1') throw new Error('Unbekanntes Format. Erwartet wird eine Markendatei dieses Werkzeugs.')
        const { schema, ...rest } = d
        setzeMarke(m => ({ ...m, ...rest, sprache: { ...STANDARD_SPRACHE, ...(rest.sprache || {}) } }))
        setFehler(null)
      } catch (e) {
        setFehler(e.message)
      }
    }
    leser.readAsText(datei)
  }

  return (
    <Schublade
      offen={offen}
      onSchliessen={onSchliessen}
      titel="Marken-Studio"
      unter="White-Label-Konfiguration — wirkt sofort und wird lokal gespeichert"
      fuss={
        <>
          <Btn ikone={RotateCcw} onClick={zuruecksetzen} variante="still">Zurücksetzen</Btn>
          <span className="vg-fuellen" />
          <input
            ref={dateiRef} type="file" accept="application/json" style={{ display: 'none' }}
            onChange={e => { const d = e.target.files?.[0]; if (d) importieren(d); e.target.value = '' }}
          />
          <Btn ikone={Upload} onClick={() => dateiRef.current?.click()}>Importieren</Btn>
          <Btn ikone={Download} onClick={exportieren}>Exportieren</Btn>
          <Btn variante="primaer" onClick={onSchliessen}>Fertig</Btn>
        </>
      }
    >
      <div className="vg-stapel">
        {fehler && <Hinweis ton="negativ">{fehler}</Hinweis>}

        <Karte ton="still">
          <KarteKoerper>
            <div className="vg-reihe" style={{ gap: 12 }}>
              <MarkenFeld size={44} />
              <div style={{ minWidth: 0 }}>
                <div className="vg-t-xl vg-fett vg-kappen" style={{ letterSpacing: '-.02em' }}>{marke.produktName}</div>
                <div className="vg-t-sm vg-schwach vg-kappen">{marke.mandantName}</div>
              </div>
            </div>
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Vorlagen" unter="Setzen Name, Farben und Form in einem Schritt" ikone={Palette} />
          <KarteKoerper>
            <div className="vg-reihe vg-wrap" style={{ gap: 7 }}>
              {Object.values(PRESETS).map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`vg-btn vg-btn-sm${marke.id === p.id ? ' vg-btn-primaer' : ''}`}
                  onClick={() => setzePreset(p.id)}
                >
                  <span className="vg-punkt" style={{ background: p.primary, width: 9, height: 9 }} />
                  {p.presetName}
                </button>
              ))}
            </div>
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Namen" />
          <KarteKoerper>
            <div className="vg-stapel" style={{ gap: 11 }}>
              <div>
                <label className="vg-label" htmlFor="m-produkt">Produktname</label>
                <input id="m-produkt" className="vg-feld" style={{ width: '100%' }}
                  value={marke.produktName} onChange={e => aendere({ produktName: e.target.value })} />
              </div>
              <div>
                <label className="vg-label" htmlFor="m-mandant">Mandant</label>
                <input id="m-mandant" className="vg-feld" style={{ width: '100%' }}
                  value={marke.mandantName} onChange={e => aendere({ mandantName: e.target.value })} />
              </div>
              <div>
                <label className="vg-label" htmlFor="m-kurz">Mandant kurz</label>
                <input id="m-kurz" className="vg-feld" style={{ width: '100%' }}
                  value={marke.mandantKurz} onChange={e => aendere({ mandantKurz: e.target.value })} />
              </div>
              <div>
                <label className="vg-label" htmlFor="m-claim">Untertitel</label>
                <input id="m-claim" className="vg-feld" style={{ width: '100%' }}
                  value={marke.claim} onChange={e => aendere({ claim: e.target.value })} />
              </div>
            </div>
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Farben" unter="Die Skala wird aus der Primärfarbe berechnet" />
          <KarteKoerper>
            <div className="vg-raster vg-raster-2" style={{ gap: 12 }}>
              <Farbfeld label="Primärfarbe" wert={marke.primary} onAendern={v => aendere({ primary: v })}
                hinweis="Trägt Schaltflächen, aktive Zustände und Diagrammlinien." />
              <Farbfeld label="Akzentfarbe" wert={marke.akzent} onAendern={v => aendere({ akzent: v })}
                hinweis="Sparsam eingesetzt für Hervorhebungen." />
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="vg-kpi-titel" style={{ marginBottom: 6 }}>Abgeleitete Skala</div>
              <div style={{ display: 'flex', borderRadius: 'var(--vg-r-sm)', overflow: 'hidden', border: '1px solid var(--vg-rand)' }}>
                {Object.entries(skala).map(([stufe, farbe]) => (
                  <div key={stufe} title={`${stufe}: ${farbe}`} style={{ flex: 1, height: 30, background: farbe }} />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="vg-kpi-titel" style={{ marginBottom: 6 }}>Lesbarkeit nach WCAG AA</div>
              {kontraste.map(k => (
                <div className="vg-reihe-weit" key={k.paar} style={{ padding: '4px 0' }}>
                  <span className="vg-reihe vg-t-sm" style={{ gap: 6 }}>
                    {k.bestanden
                      ? <Check size={13} strokeWidth={2.6} style={{ color: 'var(--vg-positiv)' }} />
                      : <CircleAlert size={13} strokeWidth={2.2} style={{ color: 'var(--vg-warnung)' }} />}
                    {k.paar}
                  </span>
                  <span className="vg-mono vg-t-sm" style={{ color: k.bestanden ? 'var(--vg-positiv)' : 'var(--vg-warnung)' }}>
                    {zahl(k.wert, 2)} : 1
                  </span>
                </div>
              ))}
              {kontraste.some(k => !k.bestanden) && (
                <p className="vg-t-xs vg-schwach" style={{ margin: '6px 0 0' }}>
                  Werte unter 4,5 sind für kleine Schrift zu kontrastarm. Eine dunklere Primärfarbe hilft.
                </p>
              )}
            </div>
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Form" />
          <KarteKoerper>
            <div className="vg-stapel" style={{ gap: 12 }}>
              <div>
                <label className="vg-label">Bildmarke</label>
                <div className="vg-reihe" style={{ gap: 8 }}>
                  {WORTMARKEN.map(w => (
                    <button
                      key={w.id}
                      type="button"
                      className={`vg-btn${marke.wortmarke === w.id ? ' vg-btn-primaer' : ''}`}
                      onClick={() => aendere({ wortmarke: w.id })}
                    >
                      <Bildmarke variante={w.id} size={16} />
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="vg-label">Ecken</label>
                <Segment wert={marke.radius} onWaehle={v => aendere({ radius: v })} optionen={RADIEN} />
              </div>
              <div>
                <label className="vg-label">Darstellung</label>
                <Segment
                  wert={marke.theme}
                  onWaehle={v => aendere({ theme: v })}
                  optionen={[
                    { id: 'auto', label: 'System' },
                    { id: 'light', label: 'Hell' },
                    { id: 'dark', label: 'Dunkel' },
                  ]}
                />
              </div>
              <div>
                <label className="vg-label">Dichte</label>
                <Segment
                  wert={marke.dichte}
                  onWaehle={v => aendere({ dichte: v })}
                  optionen={[
                    { id: 'normal', label: 'Komfortabel' },
                    { id: 'kompakt', label: 'Kompakt' },
                  ]}
                />
              </div>
            </div>
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf titel="Sprachbausteine" unter="Domänenbegriffe für andere Mandanten austauschen" />
          <KarteKoerper>
            <div className="vg-stapel" style={{ gap: 9 }}>
              {[
                ['partner', 'Partner (Einzahl)'],
                ['partnerPlural', 'Partner (Mehrzahl)'],
                ['berater', 'Beraterbezeichnung'],
                ['gremium', 'Verhandlungsgremium'],
                ['wertungsjahr', 'Abrechnungsperiode'],
                ['projekt', 'Projektbezeichnung'],
                ['modellZiel', 'Name des Zielmodells'],
              ].map(([id, label]) => (
                <div className="vg-reihe" key={id} style={{ gap: 10 }}>
                  <label className="vg-t-sm vg-gedaempft" style={{ width: 170, flex: 'none' }} htmlFor={`sp-${id}`}>{label}</label>
                  <input
                    id={`sp-${id}`}
                    className="vg-feld vg-fuellen"
                    value={marke.sprache[id] ?? ''}
                    onChange={e => aendereSprache({ [id]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </KarteKoerper>
        </Karte>
      </div>
    </Schublade>
  )
}
