/**
 * Rückfrage an den Vermittler.
 *
 * Fehlen Angaben für das Angebot, formuliert die Strecke die Rückfrage vor:
 * adressiert an den Ansprechpartner aus dem Eingang, mit genau den Punkten,
 * die die Prüfung als offen gemerkt hat. Der Text ist reiner Text ohne
 * Auszeichnung, weil er als E-Mail hinausgeht. Versendet wird erst nach
 * Freigabe durch die Sachbearbeitung.
 */

import { feld, layoutVon } from './layouts.js'
import { begriffe } from './branding.js'

export function baueRueckfrage(vorgang, lauf) {
  const B = begriffe()
  const an = feld(vorgang, 'vermittlerEmail').wert
  const person = feld(vorgang, 'ansprechpartner').wert
  const kunde = feld(vorgang, 'vnName').wert
  const zeichen = feld(vorgang, 'anfrageId').wert
  const layout = layoutVon(vorgang)
  const sparte = layout.name

  const betreff = [
    `Rückfrage zu Ihrer Angebotsanfrage ${sparte}`,
    kunde ? `– ${kunde}` : '',
    zeichen ? `(${zeichen})` : ''
  ].filter(Boolean).join(' ')

  const punkte = lauf.fragen.map((f, i) => `${i + 1}. ${f}`).join('\n')

  const text = [
    person ? `Guten Tag ${person},` : 'Guten Tag,',
    '',
    `vielen Dank für Ihre Anfrage vom ${vorgang.anfrageDatum || vorgang.eingang} zur ${layout.lang}${kunde ? ` für ${kunde}` : ''}. ` +
      `Damit wir das Angebot erstellen können, benötigen wir noch folgende ${lauf.fragen.length === 1 ? 'Angabe' : 'Angaben'}:`,
    '',
    punkte,
    '',
    'Sie können direkt auf diese E-Mail antworten.',
    '',
    'Mit freundlichen Grüßen',
    '',
    B.einheit,
    B.hausLang
  ].join('\n')

  return { an: an || '', cc: vorgang.rueckfrageCc || '', betreff, text }
}
