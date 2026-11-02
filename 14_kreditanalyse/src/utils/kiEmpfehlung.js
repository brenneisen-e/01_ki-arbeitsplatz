import { formatCurrency, formatNumber } from './formatters';

// =============================================================================
// Convert plain-text KI result to structured HTML
// =============================================================================

export function convertKiResultToHtml(text) {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Double-line header (═══)
    if (/^═+$/.test(trimmed)) {
      html += '<hr style="border:none;border-top:2px solid var(--mode-accent);margin:12px 0;" />';
      continue;
    }

    // Section dividers (───)
    if (/^─+$/.test(trimmed)) {
      html += '<hr style="border:none;border-top:1px solid var(--border-light);margin:8px 0;" />';
      continue;
    }

    // Main title (KREDITEMPFEHLUNG)
    if (trimmed === 'KREDITEMPFEHLUNG') {
      html += `<h2 style="text-align:center;font-size:16px;font-weight:500;letter-spacing:0.04em;color:var(--mode-primary);margin:4px 0;">${trimmed}</h2>`;
      continue;
    }

    // Section headings (1. KUNDENPROFIL, etc.)
    if (/^\d+\.\s+[A-ZÄÖÜ\s()–-]+$/.test(trimmed)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 style="font-size:13px;font-weight:500;color:var(--mode-primary-light);margin:16px 0 6px 0;">${trimmed}</h3>`;
      continue;
    }

    // Key:Value rows (like "Firma:  Wert")
    if (/^[A-ZÄÖÜa-zäöüß][\w\s()-]*:\s{2,}/.test(trimmed)) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim();
      html += `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;"><span style="color:var(--text-secondary);">${key}</span><span style="font-weight:500;color:var(--text-primary);font-family:var(--font-mono);">${val}</span></div>`;
      continue;
    }

    // Bullet points (• or numbered like "1." at start of indent)
    if (/^\s*•/.test(line) || /^\s*\d+\.\s/.test(line) && trimmed.length < 120) {
      if (!inList) { html += '<ul style="margin:4px 0;padding-left:20px;font-size:12px;">'; inList = true; }
      html += `<li style="margin:2px 0;color:var(--text-secondary);">${trimmed.replace(/^[•]\s*/, '').replace(/^\d+\.\s*/, '')}</li>`;
      continue;
    }

    // SWOT table headings
    if (/STÄRKEN|SCHWÄCHEN|CHANCEN|RISIKEN/.test(trimmed)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p style="font-size:12px;font-weight:500;color:var(--mode-primary);margin:8px 0 2px 0;">${trimmed}</p>`;
      continue;
    }

    // Empty line
    if (trimmed === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<div style="height:6px;"></div>';
      continue;
    }

    // Regular paragraph text
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p style="font-size:12px;color:var(--text-secondary);margin:3px 0;line-height:1.6;">${trimmed}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}

// =============================================================================
// KI Kreditempfehlung generator (hardcoded realistic demo text)
// =============================================================================

export function generateKiKreditempfehlung(company, kredit, betrag, bilanz, b23, rating, bestVerbind, kundenZins) {
  const firma = company.firma || 'Unternehmen';
  const branche = company.branche || 'k.A.';
  const gruendung = company.gruendung || '–';
  const ort = company.adresse?.ort || '–';
  const mitarbeiter = company.mitarbeiter || '–';
  const gf = company.gf || [];
  const sicherheiten = company.sicherheiten || [];

  const sumSicherheiten = sicherheiten.reduce((s, si) => s + ((si.wert || 0) - (si.vorlasten || 0)), 0);
  const deckungsquote = betrag > 0 ? Math.round(sumSicherheiten / betrag * 100) : 0;

  const totalBestehend = bestVerbind.reduce((s, v) => s + (v.restschuld || 0), 0);
  const neuObligo = totalBestehend + betrag;

  return `═══════════════════════════════════════════════════════════════
                    KREDITEMPFEHLUNG
             ${firma}
             Erstellt: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} | Vertraulich
═══════════════════════════════════════════════════════════════

1. KUNDENPROFIL
───────────────────────────────────────────────────────────────
Firma:              ${firma}
Rechtsform:         ${company.rechtsform || '–'}
HRB:                ${company.hrb || '–'}
Sitz:               ${ort}
Gründungsjahr:      ${gruendung}
Branche:            ${branche} (WZ-Code: ${company.wz_code || '–'})
Mitarbeiter:        ${mitarbeiter}
Geschäftsführung:   ${gf.map(g => `${g.name} (${g.funktion}, ${g.anteil}%, seit ${g.seit})`).join('; ')}
Hauptbankverbindung: ${company.hauptbank ? 'Ja' : 'Nein'}
SCHUFA GF:          ${company.schufa ? Object.values(company.schufa).join(' / ') : '–'}
Creditreform-Index: ${company.creditreform_index || '–'}

2. FINANZIERUNGSANLASS
───────────────────────────────────────────────────────────────
Kreditart:          ${kredit.art || '–'}
Kreditbetrag:       ${formatCurrency(betrag)}
Laufzeit:           ${kredit.laufzeit || '–'} Monate
Tilgungsfrei:       ${kredit.tilgungsfrei || 0} Monate
Verwendungszweck:   ${kredit.verwendung || '–'}

Das Unternehmen plant eine strategische Investition zur Erweiterung der
Produktionskapazitäten bzw. zur Modernisierung des Geschäftsbetriebs.
Die Investition steht im Einklang mit der langfristigen Unternehmensstrategie
und soll die Wettbewerbsfähigkeit nachhaltig stärken. Die Investitionssumme
beträgt ca. ${formatCurrency(betrag * 1.2)}, wovon der Kunde einen Eigenanteil
von ${formatCurrency(betrag * 0.2)} (ca. 16,7%) einbringt.

3. FINANZIELLE KENNZAHLEN (Jahresabschluss 2023)
───────────────────────────────────────────────────────────────
Umsatzerlöse:           ${formatCurrency(b23.umsatz || 0)}
Materialaufwand:        ${formatCurrency(b23.materialaufwand || 0)}
Personalaufwand:        ${formatCurrency(b23.personalaufwand || 0)}
EBITDA:                 ${formatCurrency((b23.umsatz || 0) + (b23.sonstige_ertraege || 0) - (b23.materialaufwand || 0) - (b23.personalaufwand || 0) - (b23.sonstige_aufwendungen || 0))}
Jahresüberschuss:       ${formatCurrency(b23.jahresueberschuss || 0)}
Bilanzsumme:            ${formatCurrency((b23.immateriell || 0) + (b23.sachanlagen || 0) + (b23.finanzanlagen || 0) + (b23.vorraete || 0) + (b23.forderungen || 0) + (b23.liquide || 0))}
Eigenkapital:           ${formatCurrency(b23.eigenkapital || 0)}
Eigenkapitalquote:      ${b23.eigenkapital && b23.umsatz ? formatNumber(b23.eigenkapital / ((b23.immateriell || 0) + (b23.sachanlagen || 0) + (b23.finanzanlagen || 0) + (b23.vorraete || 0) + (b23.forderungen || 0) + (b23.liquide || 0)) * 100, 1) + '%' : '–'}
Verschuldungsgrad:      ${b23.eigenkapital ? formatNumber(((b23.verb_kurz || 0) + (b23.verb_lang || 0)) / b23.eigenkapital * 100, 1) + '%' : '–'}

Die Umsatzentwicklung der letzten drei Geschäftsjahre zeigt einen positiven
Trend mit kontinuierlichem Wachstum. Die Ertragslage ist stabil, und die
Margen bewegen sich im branchenüblichen Rahmen. Die Liquiditätssituation
ist geordnet mit ausreichenden Reserven für den laufenden Geschäftsbetrieb.

4. RATING-ERGEBNIS
───────────────────────────────────────────────────────────────
Internes Rating:        Klasse ${rating}
Bezeichnung:            ${rating <= 3 ? 'Gut' : rating <= 6 ? 'Befriedigend' : rating <= 9 ? 'Ausreichend' : 'Mangelhaft'}
Ausfallwahrscheinlichkeit (PD): ${rating <= 3 ? '0,07' : rating <= 6 ? '0,35' : rating <= 9 ? '1,35' : '5,00'}%
IFD-Masterskala:        ${rating <= 5 ? 'Klasse III (BBB)' : rating <= 9 ? 'Klasse IV (BB)' : 'Klasse V (B)'}

Das Rating basiert auf der quantitativen Bilanzanalyse (Gewichtung 60%),
der qualitativen Bewertung von Management, Marktposition und Geschäfts-
modell (Gewichtung 25%) sowie den Kontoinformationen und externen
Bonitätsdaten (Gewichtung 15%). Die Rating-Klasse ${rating} entspricht einer
${rating <= 3 ? 'guten' : rating <= 6 ? 'befriedigenden' : 'ausreichenden'} Bonität des Kreditnehmers.

5. SICHERHEITENÜBERSICHT
───────────────────────────────────────────────────────────────
${sicherheiten.length > 0 ? sicherheiten.map((s, i) =>
`${i + 1}. ${s.art}
   Bezeichnung:    ${s.bezeichnung}
   Marktwert:      ${formatCurrency(s.wert)}
   Vorlasten:      ${formatCurrency(s.vorlasten || 0)}
   Nettowert:      ${formatCurrency((s.wert || 0) - (s.vorlasten || 0))}
   Rang:           ${s.rang}. Rang
   Bewertung:      ${s.bewertung} vom ${s.datum ? new Date(s.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'}`
).join('\n\n') : 'Keine Sicherheiten erfasst.'}

Sicherheitenwert gesamt:     ${formatCurrency(sumSicherheiten)}
Kreditbetrag:                ${formatCurrency(betrag)}
Rechnerische Deckungsquote:  ${deckungsquote}%
Blankoanteil:                ${formatCurrency(Math.max(0, betrag - sumSicherheiten))}

6. BESTEHENDES OBLIGO
───────────────────────────────────────────────────────────────
${bestVerbind.length > 0 ? bestVerbind.map(v =>
`• ${v.glaeubiger}: ${v.art}, Restschuld ${formatCurrency(v.restschuld)}, Zins ${formatNumber(v.zins, 1)}%, Ende ${v.ende}`
).join('\n') : 'Keine bestehenden Verbindlichkeiten.'}

Bestehendes Obligo:          ${formatCurrency(totalBestehend)}
Neues Engagement:            ${formatCurrency(betrag)}
Gesamtobligo nach Kredit:    ${formatCurrency(neuObligo)}

7. SWOT-ANALYSE
───────────────────────────────────────────────────────────────

  STÄRKEN (Strengths)                 SCHWÄCHEN (Weaknesses)
  ─────────────────────               ─────────────────────────
  • Langjährige Marktpräsenz          • Abhängigkeit von konjunktur-
    seit ${gruendung}                       sensitivem ${branche}-Sektor
  • Erfahrene Geschäftsführung        • Begrenzte Diversifikation
    mit > ${gf[0]?.erfahrung || 15} Jahren Expertise       der Kundenbasis
  • Stabile Eigenkapitalbasis         • Steigende Personalkosten
  • Gute regionale Marktposition      • Investitionsstau in Teilbereichen
    im Raum ${ort}

  CHANCEN (Opportunities)             RISIKEN (Threats)
  ─────────────────────               ─────────────────────────
  • Kapazitätserweiterung durch       • Zunehmender Wettbewerbsdruck
    geplante Investition                durch internationale Anbieter
  • Digitalisierungspotenziale        • Rohstoffpreisvolatilität
  • Wachsende Nachfrage im            • Fachkräftemangel in der Region
    regionalen Marktumfeld            • Regulatorische Verschärfungen
  • Cross-Selling-Potenzial           • Zinsänderungsrisiko bei
    für Bankprodukte                    variablem Anteil

8. EMPFEHLUNG UND AUFLAGEN
───────────────────────────────────────────────────────────────
Auf Basis der durchgeführten Kredit- und Risikoanalyse wird die
GENEHMIGUNG des beantragten Kreditengagements empfohlen.

Konditionen:
  • Kundenzins:       ${formatNumber(kundenZins, 2)}% p.a.
  • Laufzeit:         ${kredit.laufzeit || '–'} Monate
  • Tilgungsfreie Z.: ${kredit.tilgungsfrei || 0} Monate
  • Auszahlungskurs:  100%

Auflagen und Bedingungen:
  1. Quartalsweise Einreichung der BWA und SuSa
  2. Jährliche Einreichung des testierten Jahresabschlusses
     innerhalb von 6 Monaten nach Geschäftsjahresende
  3. Nachweis der zweckgebundenen Mittelverwendung
  4. Halbjährliche Überprüfung der Sicherheitenwerte
  5. Einhaltung der Financial Covenants:
     - Eigenkapitalquote > 25%
     - Dynamischer Verschuldungsgrad < 7 Jahre
     - Kapitaldienstdeckungsgrad > 1,2x
  6. Negativerklärung: Keine Bestellung weiterer dinglicher
     Sicherheiten zugunsten Dritter ohne Zustimmung der Bank
  7. Informationspflicht bei wesentlichen Änderungen der
     Gesellschafterstruktur oder Geschäftsführung

Nächste Überprüfung: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}

═══════════════════════════════════════════════════════════════
Erstellt durch KI-Kreditanalysemodul | ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
Dieses Dokument dient als Entscheidungsvorlage und ersetzt
nicht die individuelle Prüfung durch den Kompetenzträger.
═══════════════════════════════════════════════════════════════`;
}
