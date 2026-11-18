/**
 * Rollt ein Element in seinem nächsten scrollbaren Vorfahren ins Blickfeld.
 *
 * Bewusst ohne scrollIntoView: das würde auch äußere Rahmen bewegen (etwa
 * eine Seite, in die das Werkzeug eingebettet ist).
 */
export function rolleZu(element, { anteil = 0.32, immer = false } = {}) {
  if (!element) return
  let rahmen = element.parentElement
  while (rahmen && rahmen !== document.body) {
    const stil = getComputedStyle(rahmen)
    if (/(auto|scroll)/.test(stil.overflowY) && rahmen.scrollHeight > rahmen.clientHeight + 4) break
    rahmen = rahmen.parentElement
  }
  if (!rahmen || rahmen === document.body) return

  const e = element.getBoundingClientRect()
  const r = rahmen.getBoundingClientRect()
  const oben = e.top - r.top
  const unten = e.bottom - r.top
  // Liegt die Stelle schon bequem im Rahmen, bleibt alles stehen.
  if (!immer && oben > r.height * 0.12 && unten < r.height * 0.82) return
  rahmen.scrollTo({ top: Math.max(0, rahmen.scrollTop + oben - r.height * anteil), behavior: 'smooth' })
}

/** Erste Fundstelle eines Feldes innerhalb eines Behälters. */
export function findeMarke(behaelter, key) {
  if (!behaelter || !key) return null
  return behaelter.querySelector(`mark[data-felder~="${CSS.escape(key)}"]`)
}
