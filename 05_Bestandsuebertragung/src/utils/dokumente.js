/**
 * Inhalt der Anhänge eines Eingangs.
 *
 * Die Demo-Eingänge tragen ihre Anhänge nur als Beschreibung. Damit im Detail
 * nachvollziehbar wird, warum eine Prüfung anschlägt, wird das Dokument hier
 * aus den Feldern des Vorgangs aufgebaut: Eine fehlende Unterschrift, eine
 * Blankovollmacht oder ein abweichender Name sind im Dokument selbst zu sehen.
 *
 * Es entsteht kein PDF – die Ansicht bildet nur nach, was im Anhang steht.
 */

const NAME = (vorname, nachname) => [vorname, nachname].filter(Boolean).join(' ')

/** Baut die Ansicht eines Anhangs. */
export function baueDokument(vorgang, anhang) {
  if (anhang.typ === 'Vollmacht') return baueVollmacht(vorgang, anhang)
  if (anhang.typ === 'Untervollmacht') return baueUntervollmacht(vorgang, anhang)
  return {
    titel: anhang.name,
    untertitel: anhang.typ,
    kopf: [],
    bloecke: [{ art: 'absatz', text: anhang.info }],
    maengel: [],
    gelesen: []
  }
}

function baueVollmacht(vorgang, anhang) {
  const d = vorgang.deckblatt
  const vollmachtgeber = NAME(d.mvVnVorname || d.kundeVorname, d.mvVnNachname || d.kundeNachname)
  const abweichenderName = (d.mvVnNachname || d.mvVnVorname) &&
    NAME(d.mvVnVorname, d.mvVnNachname) !== NAME(d.kundeVorname, d.kundeNachname)

  const blanko = d.mvAufMakler === 'nein'
  const nichtPruefbar = d.mvAufMakler === 'nicht prüfbar'
  const eingeschraenkt = d.mvVollumfaenglich === 'nein' || d.mvVollumfaenglich === 'teilweise'
  const unterschrieben = d.mvUnterschriftKunde === 'ja'
  const unleserlich = d.mvUnterschriftKunde === 'nicht prüfbar'

  const bloecke = [
    { art: 'absatz', text: 'Hiermit bevollmächtige ich,' },
    {
      art: 'partei',
      rolle: 'Vollmachtgeber (Versicherungsnehmer)',
      zeilen: [
        vollmachtgeber || '________________________',
        d.kundeGebdat ? `geboren am ${d.kundeGebdat}` : 'geboren am ____________',
        [d.kundeStrasse, [d.kundePlz, d.kundeOrt].filter(Boolean).join(' ')].filter(Boolean).join(', ')
      ].filter(Boolean),
      warnung: abweichenderName ? 'Der hier eingetragene Name weicht vom Versicherungsnehmer im Anschreiben ab.' : null
    },
    { art: 'absatz', text: 'den nachstehenden Versicherungsmakler,' },
    {
      art: 'partei',
      rolle: 'Bevollmächtigter (Versicherungsmakler)',
      zeilen: blanko
        ? ['________________________', '________________________']
        : [
            d.vermittlerName || '________________________',
            [d.maklerStrasse, [d.maklerPlz, d.maklerOrt].filter(Boolean).join(' ')].filter(Boolean).join(', '),
            d.agenturNr ? `Vermittlernummer ${d.agenturNr}` : d.vermittlerNr ? `Vermittlernummer ${d.vermittlerNr}` : ''
          ].filter(Boolean),
      warnung: blanko
        ? 'Kein Bevollmächtigter eingetragen – die Vollmacht ist blanko ausgestellt.'
        : nichtPruefbar ? 'Der Eintrag des Bevollmächtigten ist im Scan nicht lesbar.' : null
    },
    {
      art: 'absatz',
      text: 'mit sofortiger Wirkung und bis auf Widerruf, mich in allen Versicherungsangelegenheiten zu vertreten. ' +
        'Der bevollmächtigte Makler ist insbesondere berechtigt:'
    },
    {
      art: 'liste',
      punkte: eingeschraenkt
        ? [
            'Versicherungsverträge in meinem Namen zu verwalten und zu betreuen',
            'Versicherungsunterlagen einzuholen und einzusehen'
          ]
        : [
            'Versicherungsverträge in meinem Namen zu verwalten und zu betreuen',
            'Bestandsübertragungen zu beantragen und durchzuführen',
            'Versicherungsunterlagen einzuholen und einzusehen',
            'Korrespondenz mit Versicherungsgesellschaften zu führen',
            'Angebote einzuholen und Verträge abzuschließen'
          ]
    },
    {
      art: 'absatz',
      text: eingeschraenkt
        ? `Diese Vollmacht gilt ausschließlich für den Vertrag ${d.vnr || '____________'}. Weitere Verträge sind nicht umfasst.`
        : 'Diese Vollmacht gilt für alle bestehenden und zukünftigen Versicherungsverträge.',
      warnung: eingeschraenkt ? 'Die Vollmacht ist auf einen einzelnen Vertrag beschränkt.' : null
    }
  ]

  if (d.pool) {
    bloecke.push({
      art: 'absatz',
      text: d.uvFehlt === 'ja'
        ? 'Eine Weitergabe der Vollmacht an Dritte ist in diesem Dokument nicht geregelt.'
        : `Der Bevollmächtigte darf Untervollmacht an ${d.pool} erteilen.`,
      warnung: d.uvFehlt === 'ja' ? `${d.pool} ist in der Vollmacht nicht namentlich genannt.` : null
    })
  }

  bloecke.push({
    art: 'unterschrift',
    ortDatum: `${d.kundeOrt || '____________'}, den ${d.mvUnterschriftsdatum || '____________'}`,
    name: vollmachtgeber,
    zustand: unterschrieben ? 'gezeichnet' : unleserlich ? 'unleserlich' : 'leer'
  })

  const maengel = []
  if (!unterschrieben && !unleserlich) maengel.push('Das Unterschriftsfeld ist leer.')
  if (unleserlich) maengel.push('Die Unterschrift ist im Scan nicht lesbar.')
  if (!d.mvUnterschriftsdatum) maengel.push('Es ist kein Unterschriftsdatum eingetragen.')
  if (blanko) maengel.push('Die Vollmacht ist nicht auf den übernehmenden Makler ausgestellt.')
  if (eingeschraenkt) maengel.push('Die Vollmacht ist nicht vollumfänglich.')
  if (abweichenderName) maengel.push('Der Vollmachtgeber ist nicht der Versicherungsnehmer des Vertrags.')
  if (d.uvFehlt === 'ja') maengel.push('Die Untervollmacht für den Pool fehlt.')

  return {
    titel: 'Maklervollmacht',
    untertitel: anhang.name,
    kopf: [
      ['Dokumentart', 'Maklervollmacht'],
      ['Eingang', vorgang.mail.datum],
      ['Erfassung', anhang.info]
    ],
    bloecke,
    maengel,
    gelesen: [
      ['MV enthalten', d.mvEnthalten],
      ['MV auf Makler ausgestellt', d.mvAufMakler],
      ['MV vollumfänglich', d.mvVollumfaenglich],
      ['Unterschrift Kunde', d.mvUnterschriftKunde],
      ['Unterschriftsdatum', d.mvUnterschriftsdatum],
      ['Nachname laut Vollmacht', d.mvVnNachname],
      ['Vorname laut Vollmacht', d.mvVnVorname]
    ]
  }
}

function baueUntervollmacht(vorgang, anhang) {
  const d = vorgang.deckblatt
  const pool = d.pool || 'Maklerpool'

  return {
    titel: 'Untervollmacht',
    untertitel: anhang.name,
    kopf: [
      ['Dokumentart', 'Untervollmacht'],
      ['Eingang', vorgang.mail.datum],
      ['Erfassung', anhang.info]
    ],
    bloecke: [
      { art: 'absatz', text: `${pool} erteilt hiermit Untervollmacht an:` },
      {
        art: 'partei',
        rolle: 'Untervollmachtnehmer',
        zeilen: [
          d.vermittlerName || '________________________',
          [d.maklerStrasse, [d.maklerPlz, d.maklerOrt].filter(Boolean).join(' ')].filter(Boolean).join(', '),
          d.agenturNr ? `Vermittlernummer ${d.agenturNr}` : ''
        ].filter(Boolean)
      },
      {
        art: 'absatz',
        text: 'Die Untervollmacht umfasst die Betreuung der über den Pool angebundenen Versicherungsverträge, ' +
          'einschließlich der Beantragung von Bestandsübertragungen.'
      },
      {
        art: 'unterschrift',
        ortDatum: `${d.maklerOrt || '____________'}, den ${d.mvUnterschriftsdatum || '____________'}`,
        name: pool,
        zustand: 'gezeichnet'
      }
    ],
    maengel: d.uvFehlt === 'ja' ? ['Der Pool ist in der Maklervollmacht nicht namentlich genannt.'] : [],
    gelesen: [
      ['Pool', d.pool],
      ['Untervollmacht erteilt', d.uvErteilt],
      ['Untervollmacht fehlt', d.uvFehlt]
    ]
  }
}
