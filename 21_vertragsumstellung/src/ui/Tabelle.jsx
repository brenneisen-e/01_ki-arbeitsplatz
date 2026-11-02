import { useMemo, useState, useCallback } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

/**
 * Dichte, sortierbare Datentabelle mit klebendem Kopf.
 * Spalten: { id, label, num, breite, wert(zeile), zelle(zeile), titel }
 * `klasse` hängt eine weitere Tabellenklasse an (z. B. vg-tabelle-lage).
 */
export default function Tabelle({
  spalten, zeilen, schluessel = (z) => z.id,
  standardSortierung, aufZeile, aktiveZeile, fusszeile, hoch, eng, klasse, leerText = 'Keine Einträge',
}) {
  const [sortierung, setSortierung] = useState(standardSortierung || null)

  const sortiere = useCallback((id) => {
    setSortierung(s => {
      if (!s || s.id !== id) return { id, richtung: 'ab' }
      if (s.richtung === 'ab') return { id, richtung: 'auf' }
      return null
    })
  }, [])

  const daten = useMemo(() => {
    if (!sortierung) return zeilen
    const sp = spalten.find(s => s.id === sortierung.id)
    if (!sp) return zeilen
    const holen = sp.wert || ((z) => z[sp.id])
    const faktor = sortierung.richtung === 'ab' ? -1 : 1
    return [...zeilen].sort((a, b) => {
      const va = holen(a), vb = holen(b)
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * faktor
      return String(va ?? '').localeCompare(String(vb ?? ''), 'de') * faktor
    })
  }, [zeilen, sortierung, spalten])

  return (
    <div className={`vg-tabelle-rahmen${hoch ? ' vg-tabelle-rahmen-hoch' : ''}`}>
      <table className={`vg-tabelle${eng ? ' vg-tabelle-eng' : ''}${klasse ? ` ${klasse}` : ''}`}>
        <thead>
          <tr>
            {spalten.map(sp => (
              <th
                key={sp.id}
                data-num={sp.num ? 'true' : undefined}
                style={sp.breite ? { width: sp.breite } : undefined}
                className={sp.sortierbar === false ? undefined : 'vg-sortierbar'}
                onClick={sp.sortierbar === false ? undefined : () => sortiere(sp.id)}
                title={sp.titel}
                scope="col"
              >
                <span className="vg-reihe" style={{ gap: 4, justifyContent: sp.num ? 'flex-end' : 'flex-start' }}>
                  {sp.label}
                  {sp.sortierbar !== false && (
                    sortierung?.id === sp.id
                      ? (sortierung.richtung === 'ab' ? <ChevronDown size={12} strokeWidth={2.4} /> : <ChevronUp size={12} strokeWidth={2.4} />)
                      : <ChevronsUpDown size={11} strokeWidth={2} style={{ opacity: .3 }} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daten.length === 0 && (
            <tr><td colSpan={spalten.length} style={{ textAlign: 'center', padding: 26, color: 'var(--vg-text-3)' }}>{leerText}</td></tr>
          )}
          {daten.map(z => {
            const id = schluessel(z)
            return (
              <tr
                key={id}
                data-klickbar={aufZeile ? 'true' : undefined}
                aria-selected={aktiveZeile === id || undefined}
                onClick={aufZeile ? () => aufZeile(z) : undefined}
                tabIndex={aufZeile ? 0 : undefined}
                onKeyDown={aufZeile ? (e) => { if (e.key === 'Enter') aufZeile(z) } : undefined}
              >
                {spalten.map((sp, i) => (
                  <td
                    key={sp.id}
                    data-num={sp.num ? 'true' : undefined}
                    className={i === 0 ? 'vg-erste-spalte' : undefined}
                  >
                    {sp.zelle ? sp.zelle(z) : (sp.wert ? sp.wert(z) : z[sp.id])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
        {fusszeile && (
          <tfoot>
            <tr>
              {spalten.map((sp, i) => (
                <td key={sp.id} data-num={sp.num ? 'true' : undefined}>
                  {fusszeile[sp.id] ?? (i === 0 ? 'Summe' : '')}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
