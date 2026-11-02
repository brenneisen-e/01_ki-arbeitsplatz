import { useState, useMemo, useRef } from 'react'
import {
  Plus, Copy, Trash2, Download, Upload, GitCompare, Check, RotateCcw, ArrowRightLeft,
} from 'lucide-react'
import {
  Karte, KarteKopf, KarteKoerper, KarteFuss, Btn, Badge, Hinweis, Segment, Leer,
} from '../../ui/basis'
import Tabelle from '../../ui/Tabelle'
import { WaageBand, ton } from '../../ui/Waage'
import { berechnePortfolio } from '../../lib/modell'
import { EINHEITEN } from '../../data/einheiten'
import {
  FASSUNG_STATUS, STATUS_INDEX, fassungAlsJson, fassungAusJson, hebelUnterschiede,
  abweichungenVonStandard,
} from '../../lib/fassung'
import { standardHebel, istHebel, HEBEL_GRUPPEN } from '../../lib/hebel'
import { SZENARIEN } from '../../lib/szenarien'
import { euro, euroKompakt, prozentDelta, zahl, datum } from '../../lib/format'

function kennzahlen(hebel) {
  const p = berechnePortfolio(EINHEITEN, hebel, { jahre: 3 })
  return {
    ziel: p.ziel.gesamt,
    delta: p.delta.prozent,
    barwert: p.barwert.prozent,
    kumuliert: p.kumuliert.prozent,
    risiko: p.verhandlungsrisiko.index,
    verlierer: p.verteilung.verlierer,
  }
}

export default function Fassungsverwaltung({ fassungen, navigiere }) {
  const [vergleich, setVergleich] = useState([])
  const [fehler, setFehler] = useState(null)
  const dateiRef = useRef(null)

  const mitKennzahlen = useMemo(
    () => fassungen.fassungen.map(f => ({ f, k: kennzahlen(f.hebel) })),
    [fassungen.fassungen])

  const importieren = (datei) => {
    const leser = new FileReader()
    leser.onload = () => {
      try {
        const d = fassungAusJson(String(leser.result))
        fassungen.anlegen(d)
        setFehler(null)
      } catch (e) {
        setFehler(e.message)
      }
    }
    leser.readAsText(datei)
  }

  const exportieren = (f) => {
    const blob = new Blob([fassungAlsJson(f)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${f.name.replace(/[^\w\säöüÄÖÜß-]/g, '').trim().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const vergleichsDaten = useMemo(() => {
    if (vergleich.length !== 2) return null
    const a = fassungen.fassungen.find(f => f.id === vergleich[0])
    const b = fassungen.fassungen.find(f => f.id === vergleich[1])
    if (!a || !b) return null
    return { a, b, unterschiede: hebelUnterschiede(a.hebel, b.hebel), ka: kennzahlen(a.hebel), kb: kennzahlen(b.hebel) }
  }, [vergleich, fassungen.fassungen])

  return (
    <div className="vg-stapel">
      <div className="vg-reihe-weit vg-wrap" style={{ gap: 12 }}>
        <div>
          <h2 className="vg-t-2xl vg-fett" style={{ margin: 0, letterSpacing: '-.02em' }}>Fassungen</h2>
          <p className="vg-merkzeile" style={{ margin: '2px 0 0' }}>
            Eine Fassung ist ein benannter Hebelsatz mit Verhandlungsstand. Sie gilt in beiden Werkzeugen gleichzeitig.
          </p>
        </div>
        <div className="vg-reihe">
          <input
            ref={dateiRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={e => { const d = e.target.files?.[0]; if (d) importieren(d); e.target.value = '' }}
          />
          <Btn ikone={Upload} onClick={() => dateiRef.current?.click()}>Importieren</Btn>
          <Btn ikone={Plus} variante="primaer" onClick={() => fassungen.anlegen({ name: 'Neue Fassung', hebel: standardHebel() })}>
            Neue Fassung
          </Btn>
        </div>
      </div>

      {fehler && <Hinweis ton="negativ">{fehler}</Hinweis>}

      {fassungen.rueckname && (
        <Hinweis ton="warnung">
          Fassung „{fassungen.rueckname.fassung.name}“ gelöscht.
          <Btn groesse="sm" ikone={RotateCcw} style={{ marginLeft: 10 }} onClick={fassungen.rueckgaengig}>
            Rückgängig
          </Btn>
        </Hinweis>
      )}

      <Karte>
        <KarteKoerper eng>
          <Tabelle
            spalten={[
              {
                id: 'wahl', label: '', breite: 40, sortierbar: false,
                zelle: x => (
                  <input
                    type="checkbox"
                    checked={vergleich.includes(x.f.id)}
                    onChange={ev => {
                      ev.stopPropagation()
                      setVergleich(v => v.includes(x.f.id) ? v.filter(i => i !== x.f.id) : v.length < 2 ? [...v, x.f.id] : [v[1], x.f.id])
                    }}
                    onClick={ev => ev.stopPropagation()}
                    aria-label={`${x.f.name} vergleichen`}
                  />
                ),
              },
              {
                id: 'name', label: 'Fassung', wert: x => x.f.name,
                zelle: x => (
                  <span className="vg-reihe" style={{ gap: 8, minWidth: 0 }}>
                    {x.f.id === fassungen.aktiv?.id && <Check size={14} strokeWidth={2.6} className="vg-marke" />}
                    <input
                      className="vg-feld"
                      style={{ height: 26, width: '100%', minWidth: 140, maxWidth: 250, border: '1px solid transparent', background: 'transparent', fontWeight: 500 }}
                      value={x.f.name}
                      title={x.f.name}
                      onChange={e => fassungen.aendereFassung(x.f.id, { name: e.target.value })}
                      onClick={e => e.stopPropagation()}
                      aria-label="Name der Fassung"
                    />
                  </span>
                ),
              },
              {
                id: 'status', label: 'Status', breite: 150,
                wert: x => x.f.status,
                zelle: x => (
                  <select
                    className="vg-feld"
                    style={{ height: 26, fontSize: 'var(--vg-t-sm)' }}
                    value={x.f.status}
                    onChange={e => fassungen.aendereFassung(x.f.id, { status: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    aria-label="Status"
                  >
                    {FASSUNG_STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                ),
              },
              {
                id: 'geaendert', label: 'Regler', num: true, breite: 90,
                wert: x => abweichungenVonStandard(x.f.hebel).length,
                zelle: x => <Badge>{abweichungenVonStandard(x.f.hebel).length} verändert</Badge>,
              },
              { id: 'ziel', label: 'Zielvolumen', num: true, wert: x => x.k.ziel, zelle: x => <span className="vg-mono">{euroKompakt(x.k.ziel)}</span> },
              {
                id: 'delta', label: 'Budget', num: true, wert: x => x.k.delta,
                zelle: x => (
                  <span className="vg-reihe" style={{ justifyContent: 'flex-end', gap: 8 }}>
                    <span style={{ width: 76 }}><WaageBand prozent={x.k.delta} kompakt marke={x.k.barwert} /></span>
                    <span className="vg-delta" data-ton={ton(x.k.delta)}>{prozentDelta(x.k.delta)}</span>
                  </span>
                ),
              },
              { id: 'kumuliert', label: 'bis 2030 (Barwert)', num: true, wert: x => x.k.kumuliert, zelle: x => <span className="vg-delta" data-ton={ton(x.k.kumuliert)}>{prozentDelta(x.k.kumuliert)}</span> },
              { id: 'risiko', label: 'Risiko', num: true, wert: x => x.k.risiko, zelle: x => <span className="vg-mono">{x.k.risiko}</span> },
              {
                id: 'aktion', label: '', sortierbar: false, breite: 108,
                zelle: x => (
                  <span className="vg-reihe" style={{ gap: 3, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <Btn groesse="sm" variante="still" nurIkone ikone={Copy} onClick={() => fassungen.duplizieren(x.f.id)} aria-label="Duplizieren" />
                    <Btn groesse="sm" variante="still" nurIkone ikone={Download} onClick={() => exportieren(x.f)} aria-label="Exportieren" />
                    <Btn
                      groesse="sm" variante="still" nurIkone ikone={Trash2}
                      onClick={() => fassungen.loeschen(x.f.id)}
                      disabled={fassungen.fassungen.length <= 1}
                      aria-label="Löschen"
                    />
                  </span>
                ),
              },
            ]}
            zeilen={mitKennzahlen}
            klasse="vg-tabelle-fassungen"
            schluessel={x => x.f.id}
            aktiveZeile={fassungen.aktiv?.id}
            aufZeile={x => fassungen.waehle(x.f.id)}
          />
        </KarteKoerper>
        <KarteFuss>
          Kennzahlen werden für jede Fassung vollständig neu gerechnet. Ein Klick auf eine Zeile macht die Fassung aktiv.
        </KarteFuss>
      </Karte>

      <Karte>
        <KarteKopf titel="Aus Szenario anlegen" unter="Vordefinierte Hebelsätze als Ausgangspunkt" />
        <KarteKoerper>
          <div className="vg-reihe vg-wrap" style={{ gap: 7 }}>
            {SZENARIEN.map(s => (
              <Btn
                key={s.id}
                groesse="sm"
                onClick={() => fassungen.anlegen({ name: s.name, hebel: s.hebel, notiz: s.beschreibung })}
                title={s.beschreibung}
              >
                {s.name}
              </Btn>
            ))}
          </div>
        </KarteKoerper>
      </Karte>

      {vergleichsDaten && (
        <Karte>
          <KarteKopf
            titel="Fassungsvergleich"
            unter={`„${vergleichsDaten.a.name}“ gegen „${vergleichsDaten.b.name}“`}
            ikone={GitCompare}
            aktionen={<Btn groesse="sm" onClick={() => setVergleich([])}>Vergleich schließen</Btn>}
          />
          <KarteKoerper>
            <div className="vg-tabelle-rahmen" style={{ marginBottom: 14 }}>
              <table className="vg-tabelle">
                <thead>
                  <tr>
                    <th>Kennzahl</th>
                    <th data-num="true">{vergleichsDaten.a.name}</th>
                    <th data-num="true">{vergleichsDaten.b.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Zielvolumen', euroKompakt(vergleichsDaten.ka.ziel), euroKompakt(vergleichsDaten.kb.ziel)],
                    ['Budgetwirkung', prozentDelta(vergleichsDaten.ka.delta), prozentDelta(vergleichsDaten.kb.delta)],
                    ['Barwert je Jahrgang', prozentDelta(vergleichsDaten.ka.barwert), prozentDelta(vergleichsDaten.kb.barwert)],
                    ['kumuliert bis 2030 (Barwert)', prozentDelta(vergleichsDaten.ka.kumuliert), prozentDelta(vergleichsDaten.kb.kumuliert)],
                    ['Verhandlungsrisiko', vergleichsDaten.ka.risiko, vergleichsDaten.kb.risiko],
                    ['Verlierer', vergleichsDaten.ka.verlierer, vergleichsDaten.kb.verlierer],
                  ].map(([l, a, b]) => (
                    <tr key={l}>
                      <td className="vg-erste-spalte">{l}</td>
                      <td data-num="true" className="vg-mono">{a}</td>
                      <td data-num="true" className="vg-mono">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="vg-kpi-titel" style={{ marginBottom: 8 }}>
              {vergleichsDaten.unterschiede.length} unterschiedliche Regler
            </div>
            <div className="vg-tabelle-rahmen">
              <table className="vg-tabelle vg-tabelle-eng">
                <thead>
                  <tr>
                    <th>Regler</th><th>Gruppe</th>
                    <th data-num="true">{vergleichsDaten.a.name}</th>
                    <th style={{ width: 90 }}></th>
                    <th data-num="true">{vergleichsDaten.b.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {vergleichsDaten.unterschiede.map(u => (
                    <tr key={u.def.id}>
                      <td className="vg-erste-spalte">{u.def.label}</td>
                      <td className="vg-schwach">{HEBEL_GRUPPEN.find(g => g.id === u.def.gruppe)?.kurz}</td>
                      <td data-num="true" className="vg-mono">{zahl(u.a, 2)}</td>
                      <td>
                        <span className="vg-reihe" style={{ gap: 2, justifyContent: 'center' }}>
                          <Btn
                            groesse="sm" variante="still" nurIkone ikone={ArrowRightLeft}
                            onClick={() => {
                              fassungen.waehle(vergleichsDaten.a.id)
                              fassungen.aendereHebel(u.def.id, u.b)
                            }}
                            title="Wert von rechts nach links übernehmen"
                            aria-label="Wert übernehmen"
                          />
                        </span>
                      </td>
                      <td data-num="true" className="vg-mono">{zahl(u.b, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </KarteKoerper>
        </Karte>
      )}

      {vergleich.length === 1 && (
        <Hinweis>Eine zweite Fassung auswählen, um den Vergleich zu öffnen.</Hinweis>
      )}
    </div>
  )
}
