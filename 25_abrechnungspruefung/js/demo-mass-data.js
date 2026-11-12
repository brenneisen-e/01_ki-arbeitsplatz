/**
 * Alpha Provisionsanalyse-System - Mass Data Generator
 * =====================================================
 * Generiert realistische Massen-Daten für Demo-Zwecke:
 * - 50 Agenturen
 * - 1000 Abrechnungen
 * - 30.000 Transaktionen
 * - 300 Auffälligkeiten (1%)
 */

class MassDataGenerator {
  constructor() {
    this.agenturen = [];
    this.abrechnungen = [];
    this.transaktionen = [];
    this.isInitialized = false;
  }

  /**
   * Hauptfunktion: Generiert alle Daten
   */
  async generateAllData() {
    console.log('🎲 Starte Massen-Daten-Generierung...');

    const startTime = Date.now();

    // Schritt 0: Lösche alle existierenden Daten
    await db.clearAllData();
    console.log('✓ Alte Daten gelöscht');

    // Schritt 1: Generiere 30 Agenturen (Production)
    this.generateAgenturen(30);
    console.log(`✓ ${this.agenturen.length} Agenturen generiert`);

    // Schritt 2: Generiere 300 Abrechnungen (Production)
    this.generateAbrechnungen(300);
    console.log(`✓ ${this.abrechnungen.length} Abrechnungen generiert`);

    // Schritt 3: Generiere ~9.000 Transaktionen (Production)
    this.generateTransaktionen();
    console.log(`✓ ${this.transaktionen.length} Transaktionen generiert`);

    // Schritt 4: Flagge 3% als auffällig (~270 Transaktionen)
    this.flagAuffaelligkeiten(0.03);
    const auffaellig = this.transaktionen.filter(t => t.ist_auffaellig).length;
    console.log(`✓ ${auffaellig} Auffälligkeiten geflaggt`);

    // Schritt 5: In Datenbank speichern
    await this.saveToDatabase();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Fertig! Dauer: ${duration}s`);

    this.isInitialized = true;

    return {
      agenturen: this.agenturen.length,
      abrechnungen: this.abrechnungen.length,
      transaktionen: this.transaktionen.length,
      auffaelligkeiten: auffaellig,
      duration: duration
    };
  }

  /**
   * Generiert 50 Agenturen mit realistischen Namen
   */
  generateAgenturen(count) {
    const namen = [
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
      'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter',
      'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun',
      'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz',
      'Krause', 'Meier', 'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler',
      'Herrmann', 'König', 'Walter', 'Mayer', 'Huber', 'Kaiser', 'Fuchs',
      'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Vogel'
    ];

    const zusaetze = [
      'Versicherungen', 'Finanzberatung', 'Makler', 'Insurance', 'Assekuranz',
      'Vorsorge', 'Service', 'Partner', 'Consulting', 'Dienste'
    ];

    const rechtsformen = ['GmbH', 'AG', 'KG', 'e.K.', ''];

    for (let i = 0; i < count; i++) {
      const name = namen[i];
      const zusatz = zusaetze[Math.floor(Math.random() * zusaetze.length)];
      const rechtsform = rechtsformen[Math.floor(Math.random() * rechtsformen.length)];

      this.agenturen.push({
        agentur_id: `AG-${String(i + 1).padStart(3, '0')}`,
        agentur_name: `${name} ${zusatz} ${rechtsform}`.trim(),
        region: this.randomRegion(),
        aktiv_seit: this.randomDate('2018-01-01', '2023-12-31'),
        mitarbeiter: Math.floor(Math.random() * 20) + 1
      });
    }
  }

  /**
   * Generiert 1000 Abrechnungen verteilt über 12 Monate
   */
  generateAbrechnungen(count) {
    const perioden = this.generatePerioden(12); // Letzte 12 Monate

    // Verteile Abrechnungen auf Agenturen und Perioden
    for (let i = 0; i < count; i++) {
      const agentur = this.agenturen[i % this.agenturen.length];
      const periode = perioden[Math.floor(Math.random() * perioden.length)];

      this.abrechnungen.push({
        abrechnung_id: `ABR-${String(i + 1).padStart(4, '0')}`,
        agentur_id: agentur.agentur_id,
        agentur_name: agentur.agentur_name,
        periode: periode,
        anzahl_transaktionen: Math.floor(Math.random() * 41) + 10, // 10-50
        gesamt_provision: 0, // Wird später berechnet
        erstellt_am: this.randomDateInPeriode(periode)
      });
    }
  }

  /**
   * Generiert ~30.000 Transaktionen
   */
  generateTransaktionen() {
    let txnCounter = 1;

    this.abrechnungen.forEach(abrechnung => {
      const anzahl = abrechnung.anzahl_transaktionen;
      let gesamtProvision = 0;

      for (let i = 0; i < anzahl; i++) {
        const txn = this.generateRandomTransaktion(
          `TXN-${String(txnCounter).padStart(6, '0')}`,
          abrechnung
        );

        gesamtProvision += txn.betrag;
        this.transaktionen.push(txn);
        txnCounter++;
      }

      abrechnung.gesamt_provision = Math.round(gesamtProvision * 100) / 100;
    });
  }

  /**
   * Generiert eine einzelne zufällige Transaktion
   */
  generateRandomTransaktion(txnId, abrechnung) {
    // REALISTISCHE Provisionssätze Deutschland 2024/2025
    // Quelle: Praxisdaten von Versicherungsvertretern
    const produktTypen = [
      // KV: 3-6 Monatsbeiträge Abschlussprovision
      { typ: 'KV', name: 'Krankenversicherung', avg_beitrag: 5000, berechnungsart: 'monatsbeiträge', range: [3, 6] },

      // LV: 20-40‰ der Beitragssumme (bei 20-35 Jahren Laufzeit)
      { typ: 'LV', name: 'Lebensversicherung', avg_beitrag: 3000, berechnungsart: 'promille_beitragssumme', range: [20, 40], laufzeit: [20, 35] },

      // BU: 4-7 Jahresbeiträge Abschlussprovision
      { typ: 'BU', name: 'Berufsunfähigkeit', avg_beitrag: 2400, berechnungsart: 'jahresbeiträge', range: [4, 7] },

      // SACH: 40-60% des Jahresbeitrags (bei 3 Jahren Laufzeit)
      { typ: 'SACH', name: 'Sachversicherung', avg_beitrag: 800, berechnungsart: 'prozent_jahresbeitrag', range: [40, 60] },

      // KFZ: 10-20% des Jahresbeitrags (meist 1 Jahr)
      { typ: 'KFZ', name: 'Kfz-Versicherung', avg_beitrag: 600, berechnungsart: 'prozent_jahresbeitrag', range: [10, 20] },

      // HAUS: 40-60% des Jahresbeitrags (bei 3 Jahren Laufzeit)
      { typ: 'HAUS', name: 'Hausratversicherung', avg_beitrag: 400, berechnungsart: 'prozent_jahresbeitrag', range: [40, 60] }
    ];

    const produkt = produktTypen[Math.floor(Math.random() * produktTypen.length)];

    const jahresbeitrag = Math.round(
      (produkt.avg_beitrag + (Math.random() - 0.5) * produkt.avg_beitrag * 0.4) * 100
    ) / 100;

    // Berechne Provision produktspezifisch
    let provision_betrag = 0;

    switch(produkt.berechnungsart) {
      case 'monatsbeiträge': {
        // z.B. KV: 3-6 Monatsbeiträge
        const monatsbeitrag = jahresbeitrag / 12;
        const anzahlMonate = produkt.range[0] + Math.random() * (produkt.range[1] - produkt.range[0]);
        provision_betrag = monatsbeitrag * anzahlMonate;
        break;
      }

      case 'promille_beitragssumme': {
        // z.B. LV: 20-40‰ der Beitragssumme
        const laufzeit = produkt.laufzeit[0] + Math.floor(Math.random() * (produkt.laufzeit[1] - produkt.laufzeit[0]));
        const beitragssumme = jahresbeitrag * laufzeit;
        const promille = produkt.range[0] + Math.random() * (produkt.range[1] - produkt.range[0]);
        provision_betrag = (beitragssumme * promille) / 1000;
        break;
      }

      case 'jahresbeiträge': {
        // z.B. BU: 4-7 Jahresbeiträge
        const anzahlJahre = produkt.range[0] + Math.random() * (produkt.range[1] - produkt.range[0]);
        provision_betrag = jahresbeitrag * anzahlJahre;
        break;
      }

      case 'prozent_jahresbeitrag': {
        // z.B. SACH: 40-60% des Jahresbeitrags
        const prozent = produkt.range[0] + Math.random() * (produkt.range[1] - produkt.range[0]);
        provision_betrag = jahresbeitrag * (prozent / 100);
        break;
      }
    }

    provision_betrag = Math.round(provision_betrag * 100) / 100;

    // Provision in Prozent des Jahresbeitrags (für Vergleichbarkeit)
    const provision_prozent = Math.round((provision_betrag / jahresbeitrag) * 100 * 100) / 100;

    const vornamen = ['Max', 'Anna', 'Michael', 'Julia', 'Peter', 'Laura', 'Thomas', 'Sarah', 'David', 'Maria'];
    const nachnamen = ['Müller', 'Schmidt', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'];

    const kunde = `${vornamen[Math.floor(Math.random() * vornamen.length)]} ${nachnamen[Math.floor(Math.random() * nachnamen.length)]}`;

    return {
      transaktion_id: txnId,
      agentur_id: abrechnung.agentur_id,
      agentur_name: abrechnung.agentur_name,
      abrechnung_id: abrechnung.abrechnung_id,
      periode: abrechnung.periode,

      // Transaktionsdetails
      transaktion_typ: 'Provision',
      kunde: kunde,
      vertrag_nr: `${produkt.typ}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`, // Format: KV-2025-1234
      produkt_typ: produkt.typ,
      produkt: produkt.name,
      jahresbeitrag: jahresbeitrag,
      provision_prozent: provision_prozent,
      betrag: provision_betrag,

      // Status
      ist_auffaellig: false,
      auffaelligkeits_grund: null,
      status: 'OK',
      erstellt_am: abrechnung.erstellt_am,
      geprueft_am: null,
      geprueft_von: null
    };
  }

  /**
   * Gibt die Stornohaftungsdauer in Monaten basierend auf Produkttyp zurück
   */
  getStornohaftungsdauer(produktTyp) {
    const haftungsdauer = {
      'KV': 60,   // Krankenversicherung: 60 Monate
      'LV': 60,   // Lebensversicherung: 60 Monate
      'BU': 60,   // Berufsunfähigkeit: 60 Monate (wie LV)
      'SACH': 12, // Sachversicherung: 12 Monate
      'KFZ': 12,  // Kfz-Versicherung: 12 Monate
      'HAUS': 12  // Hausratversicherung: 12 Monate
    };
    return haftungsdauer[produktTyp] || 12; // Default: 12 Monate
  }

  /**
   * Auffälligkeitskategorien mit detaillierten Erklärungen
   */
  getAuffaelligkeitsKategorien() {
    return {
      STORNO_NEUABSCHLUSS: {
        titel: 'Storno-Neuabschluss-Zyklus',
        kurz: 'Systematisches Muster: Storno kurz nach Haftungsende mit sofortigem Neuabschluss identischen Vertrags.',
        detail: (txn) => {
          // Haftungsdauer basierend auf Produkttyp
          const haftungsdauerMonate = this.getStornohaftungsdauer(txn.produkt_typ);
          const haftungsdauerJahre = Math.floor(haftungsdauerMonate / 12);
          const restMonate = haftungsdauerMonate % 12;
          const haftungsdauerText = haftungsdauerJahre > 0
            ? `${haftungsdauerJahre} ${haftungsdauerJahre === 1 ? 'Jahr' : 'Jahre'}${restMonate > 0 ? ` und ${restMonate} Monate` : ''}`
            : `${haftungsdauerMonate} Monate`;

          // Berechne Daten chronologisch
          const altvertragAbschluss = new Date(txn.erstellt_am);
          altvertragAbschluss.setMonth(altvertragAbschluss.getMonth() - (haftungsdauerMonate + 1)); // Haftungsdauer + 1 Monat zurück

          const haftungsendeAlt = new Date(altvertragAbschluss);
          haftungsendeAlt.setMonth(haftungsendeAlt.getMonth() + haftungsdauerMonate); // Haftungsende

          const stornoDate = new Date(haftungsendeAlt);
          stornoDate.setDate(stornoDate.getDate() + 5); // 5 Tage nach Haftungsende

          const neuvertragDate = new Date(stornoDate);
          neuvertragDate.setDate(neuvertragDate.getDate() + 2); // 2 Tage nach Storno

          const altvertragProvision = txn.betrag * 0.95; // Leicht weniger
          const neuvertragProvision = txn.betrag; // Aktuelle

          return `
<strong>🚩 SYSTEMATISCHES MUSTER: Storno-Neuabschluss-Zyklus</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B;">
<strong>Auffälligkeit:</strong> Kunde "${txn.kunde}" hatte bereits einen ähnlichen ${txn.produkt_typ}-Vertrag, der am <strong>${stornoDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong> gekündigt wurde – genau 5 Tage nach Ablauf der Stornohaftung. Am <strong>${neuvertragDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong> wurde ein nahezu identischer Neuvertrag abgeschlossen.
</div>

<div style="margin: 1.5rem 0;">
<strong>Chronologischer Ablauf des Storno-Neuabschluss-Zyklus:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.9rem;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Datum</th>
    <th style="padding: 0.5rem; text-align: left;">Ereignis</th>
    <th style="padding: 0.5rem; text-align: left;">Details</th>
    <th style="padding: 0.5rem; text-align: right;">Provision</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">${altvertragAbschluss.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td style="padding: 0.5rem;">Altvertrag Abschluss</td>
    <td style="padding: 0.5rem;">${txn.produkt_typ} - Vertrag ${txn.vertrag_nr.substring(0, 6)}...</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(altvertragProvision)}</td>
  </tr>
  <tr style="background: #FEF3C7;">
    <td style="padding: 0.5rem;">${haftungsendeAlt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td style="padding: 0.5rem;"><strong>Ende Stornohaftung</strong></td>
    <td style="padding: 0.5rem;">${haftungsdauerText} abgelaufen - Provision gesichert</td>
    <td style="padding: 0.5rem; text-align: right;">-</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>${stornoDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></td>
    <td style="padding: 0.5rem;"><strong>⚠️ Storno Altvertrag</strong></td>
    <td style="padding: 0.5rem;">Kündigung nur 5 Tage nach Haftungsende</td>
    <td style="padding: 0.5rem; text-align: right;">Keine Rückzahlung</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>${neuvertragDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></td>
    <td style="padding: 0.5rem;"><strong>✓ Neuabschluss</strong></td>
    <td style="padding: 0.5rem;">Identischer ${txn.produkt_typ}-Vertrag</td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(neuvertragProvision)}</strong></td>
  </tr>
  <tr style="background: #F3F4F6; font-weight: bold;">
    <td colspan="3" style="padding: 0.5rem;">GESAMT-PROVISION (doppelt kassiert):</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(altvertragProvision + neuvertragProvision)}</td>
  </tr>
</table>
</div>

<strong>Warum ist das hochproblematisch?</strong><br>
• Die Agentur kassiert <strong>zweimal</strong> volle Abschlussprovision für den gleichen Versicherungsschutz<br>
• Kein wirtschaftlicher Vorteil für den Kunden erkennbar<br>
• Zeitlicher Zusammenhang (nur 7 Tage) deutet auf <strong>systematisches Vorgehen</strong> hin<br>
• Stornoreserve aus Altvertrag wurde bereits freigegeben (keine Rückzahlung)<br>
• Kunde zahlt erneut Abschlusskosten ohne Mehrwert

<div style="margin: 1.5rem 0;">
<strong>Finanzieller Impact:</strong><br>
• Agentur verdient: <strong>${UTILS.formatCurrency(altvertragProvision + neuvertragProvision)}</strong> für faktisch den gleichen Versicherungsschutz<br>
• Bei Bestandspflege (kein Neuabschluss): Nur ${UTILS.formatCurrency(txn.betrag * 0.15)}/Jahr Bestandsprovision<br>
• <strong>Differenz: ${UTILS.formatCurrency(altvertragProvision + neuvertragProvision - (txn.betrag * 0.15 * haftungsdauerJahre))}</strong> Mehrprovision durch Zyklus
</div>

<div style="margin: 1.5rem 0; padding: 1rem; background: #FEE2E2; border-radius: 4px;">
<strong>Empfehlung:</strong> SOFORTIGE Prüfung der Beratungsprotokolle und Kundengespräche. Historische Analyse zeigt: Mehrere ähnliche Fälle bei diesem Vermittler in den letzten 12 Monaten. Mögliche Sanktionen gegen Vermittler und Rückforderung der doppelt gezahlten Provision prüfen.
</div>
          `;
        }
      },

      AUFFÄLLIGE_PROVISIONSHÖHE: {
        titel: 'Auffällige Provisionshöhe',
        kurz: 'Agentur zeigt ungewöhnlich hohe Provisionen im Vergleich zu historischen Durchschnittswerten.',
        detail: (txn) => {
          // Berechne durchschnittliche Provision der letzten 18 Monate
          const historischerDurchschnitt = 6152;
          const aktuell = 24000;
          const steigerung = ((aktuell - historischerDurchschnitt) / historischerDurchschnitt * 100).toFixed(1);
          const faktor = (aktuell / historischerDurchschnitt).toFixed(1);

          return `
<strong>🚩 AUFFÄLLIGE PROVISIONSHÖHE: Erhebliche Abweichung vom historischen Muster</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B;">
<strong>Auffälligkeit:</strong> Die Agentur "${txn.agentur_name}" hat im aktuellen Monat eine Provision von <strong>${UTILS.formatCurrency(aktuell)}</strong> generiert. Dies stellt eine erhebliche Abweichung vom historischen Durchschnitt dar.
</div>

<strong>Vergleichsanalyse (letzte 18 Monate):</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Zeitraum</th>
    <th style="padding: 0.5rem; text-align: right;">Durchschnittliche Provision</th>
    <th style="padding: 0.5rem; text-align: right;">Anzahl Monate</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Letzte 18 Monate</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(historischerDurchschnitt)}/Monat</td>
    <td style="padding: 0.5rem; text-align: right;">18</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>Aktueller Monat</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(aktuell)}</strong></td>
    <td style="padding: 0.5rem; text-align: right;">1</td>
  </tr>
  <tr style="background: #F3F4F6;">
    <td style="padding: 0.5rem;"><strong>Steigerung</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>+${steigerung}%</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>Faktor ${faktor}x</strong></td>
  </tr>
</table>

<strong>Warum ist das auffällig?</strong>
• Die Provision ist <strong>${faktor}-mal höher</strong> als der bisherige Monatsdurchschnitt
• Steigerung von <strong>+${UTILS.formatCurrency(aktuell - historischerDurchschnitt)}</strong> in einem Monat
• Keine saisonalen Muster erkennbar, die diese Abweichung erklären würden
• Bisherige Schwankungen lagen im Bereich ±15%, diese Abweichung ist ${steigerung}%

<div style="margin: 1.5rem 0;">
<strong>Monatlicher Provisionsverlauf (geschätzt):</strong>
<div style="display: flex; align-items: flex-end; gap: 0.5rem; height: 100px; margin: 1rem 0;">
  ${Array.from({length: 18}, (_, i) => {
    const variance = (Math.random() - 0.5) * 2000;
    const value = historischerDurchschnitt + variance;
    const height = (value / aktuell * 100).toFixed(0);
    return `<div style="flex: 1; background: #10B981; height: ${height}%; min-height: 2px;" title="Monat ${i+1}: ${UTILS.formatCurrency(value)}"></div>`;
  }).join('')}
  <div style="flex: 1; background: #EF4444; height: 100%;" title="Aktuell: ${UTILS.formatCurrency(aktuell)}"></div>
</div>
<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #666;">
  <span>18 Monate zurück</span>
  <span style="color: #EF4444; font-weight: bold;">Aktueller Monat</span>
</div>
</div>

<strong>Mögliche Ursachen:</strong>
✓ <strong>Großauftrag:</strong> Firmenkunden-Vertrag oder Gruppen-Abschluss
✓ <strong>Sonderaktion:</strong> Temporäre Erhöhung der Provisionssätze
⚠️ <strong>Nachholeffekt:</strong> Verzögerte Buchung von Altverträgen
✗ <strong>Ungewöhnliches Verhalten:</strong> Manipulation oder fehlerhafte Abrechnung
✗ <strong>Churning:</strong> Massenhafte Neuabschlüsse ohne echten Bedarf

<strong>Empfehlung:</strong>
Es empfiehlt sich, die <strong>gesamte Agentur einmal detailliert zu prüfen</strong>:
• Analyse aller Verträge des aktuellen Monats
• Prüfung auf Großkundengeschäft oder Firmenkunden-Verträge
• Vergleich mit Vorjahresmonat zur Identifikation saisonaler Effekte
• Stichprobenprüfung der Beratungsprotokolle
• Kontaktaufnahme mit der Agentur zur Klärung der Hintergründe

<div style="margin: 1.5rem 0; padding: 1rem; background: #E0E7FF; border-radius: 4px;">
<strong>📊 Handlungsempfehlung:</strong> Bei einer derartigen Abweichung sollte das gesamte Portfolio der Agentur einer Compliance-Prüfung unterzogen werden. Eine Steigerung um ${steigerung}% deutet auf strukturelle Veränderungen hin, die verstanden werden müssen.
</div>
          `;
        }
      },

      UEBERHÖHTE_PROVISION: {
        titel: 'Provision über Branchendurchschnitt',
        kurz: 'Provisionssatz liegt deutlich über dem statistischen Mittelwert für vergleichbare Verträge.',
        detail: (txn) => {
          // REALISTISCHE Durchschnittswerte nach Produkttyp (basierend auf Marktpraxis)
          const benchmarks = {
            'KV': { durchschnitt: 37.5, obereBenchmark: 50, beschreibung: '4,5 Monatsbeiträge (Ø)' },
            'LV': { durchschnitt: 75, obereBenchmark: 100, beschreibung: '30‰ bei 25 Jahren (Ø)' },
            'BU': { durchschnitt: 550, obereBenchmark: 700, beschreibung: '5,5 Jahresbeiträge (Ø)' },
            'SACH': { durchschnitt: 50, obereBenchmark: 70, beschreibung: '50% bei 3 Jahren (Ø)' },
            'KFZ': { durchschnitt: 15, obereBenchmark: 25, beschreibung: '15% JB (Ø)' },
            'HAUS': { durchschnitt: 50, obereBenchmark: 70, beschreibung: '50% bei 3 Jahren (Ø)' }
          };

          const benchmark = benchmarks[txn.produkt_typ] || { durchschnitt: 50, obereBenchmark: 100, beschreibung: 'Durchschnittswert' };
          const differenz = txn.provision_prozent - benchmark.durchschnitt;

          return `
<strong>🚩 PROVISION ÜBER BRANCHENDURCHSCHNITT</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEE2E2; border-left: 4px solid #EF4444;">
<strong>Auffälligkeit:</strong> Der Provisionssatz von ${txn.provision_prozent}% des Jahresbeitrags liegt deutlich über dem Branchendurchschnitt (${benchmark.beschreibung}) für ${txn.produkt_typ}-Verträge.
</div>

<strong>Vergleichsanalyse (Marktdaten 2024/2025):</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Kategorie</th>
    <th style="padding: 0.5rem; text-align: right;">Provision (%&nbsp;JB)</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Branchendurchschnitt ${txn.produkt_typ}</td>
    <td style="padding: 0.5rem; text-align: right;">${benchmark.durchschnitt}%</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Obere Benchmark</td>
    <td style="padding: 0.5rem; text-align: right;">${benchmark.obereBenchmark}%</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>Dieser Vertrag</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${txn.provision_prozent}% (+${differenz > 0 ? differenz.toFixed(1) : '0'}%-Punkte)</strong></td>
  </tr>
</table>

<strong>Warum ist das bedenklich?</strong>
• Abweichung von +${differenz > 0 ? differenz.toFixed(1) : '0'}%-Punkten des Jahresbeitrags ohne erkennbaren Grund
• Keine schriftliche Genehmigung für Sonderprovision dokumentiert
• Überdurchschnittliche Vergütung im Vergleich zu Marktstandards
• Provision absolut: ${UTILS.formatCurrency(txn.betrag)} (erwartet: ca. ${UTILS.formatCurrency(txn.jahresbeitrag * benchmark.durchschnitt / 100)})

<strong>Mögliche Ursachen:</strong>
✗ Persönliche Beziehung Vermittler ↔ Kunde?
✗ "Gefälligkeitsprovision" ohne Berechtigung?
✗ Manipulation der Provisionssystematik?
✗ Fehlerhafte Eingabe oder Datenübertragung?

<strong>Empfehlung:</strong> Prüfung der Direktionsgenehmigung, Vier-Augen-Prinzip bei Sonderprovisionen einführen, ggf. Rückforderung der Überzahlung.
          `;
        }
      },

      HOHER_JAHRESBEITRAG: {
        titel: 'Ungewöhnlich hoher Jahresbeitrag',
        kurz: 'Vertragsbeitrag überschreitet typische Beitragshöhen für diese Produktkategorie um mehr als 40%.',
        detail: (txn) => `
<strong>🚩 UNGEWÖHNLICH HOHER JAHRESBEITRAG</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #DBEAFE; border-left: 4px solid #3B82F6;">
<strong>Auffälligkeit:</strong> Der monatliche Beitrag von ${UTILS.formatCurrency(txn.jahresbeitrag / 12)} liegt ${Math.round(((txn.jahresbeitrag / 2400) - 1) * 100)}% über dem Durchschnitt vergleichbarer ${txn.produkt_typ}-Verträge.
</div>

<strong>Vergleichsanalyse:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Kategorie</th>
    <th style="padding: 0.5rem; text-align: right;">Monatsbeitrag</th>
    <th style="padding: 0.5rem; text-align: right;">Jahresbeitrag</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Durchschnitt ${txn.produkt_typ}</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(2400 / 12)}/Monat</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(2400)}</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>Dieser Vertrag</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(txn.jahresbeitrag / 12)}/Monat</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(txn.jahresbeitrag)}</strong></td>
  </tr>
  <tr style="background: #F3F4F6;">
    <td style="padding: 0.5rem;"><strong>Abweichung</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>+${UTILS.formatCurrency((txn.jahresbeitrag - 2400) / 12)}/Monat</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>+${Math.round(((txn.jahresbeitrag / 2400) - 1) * 100)}%</strong></td>
  </tr>
</table>

<strong>Plausibilitätsprüfung:</strong>
⚠️ Ist der Kunde ein Großverdiener? (>100.000 EUR/Jahr erforderlich)
⚠️ Gibt es eine Familienversicherung? (Partner, Kinder)
⚠️ Sind Zusatzbausteine enthalten?

<strong>Red Flags:</strong>
✗ Keine Einkommensnachweise in Akte
✗ Keine Vermögensauskunft dokumentiert
✗ Keine Bedarfsanalyse für diesen Beitragsrahmen
✓ Nur Standard-Beratungsprotokoll

<strong>Verdacht:</strong>
Vertrag wurde möglicherweise mit unnötig hohem Beitrag gestaltet, um Provisionsmaximierung zu erreichen (${UTILS.formatCurrency(txn.betrag)}). Der Kunde wurde eventuell über die tatsächlich notwendige Beitragshöhe nicht ausreichend beraten.

<strong>Mögliche Erklärungen:</strong>
1. ✗ Unnötige Zusatzbausteine eingebaut
2. ✗ Selbstbeteiligung künstlich niedrig gesetzt (→ höherer Beitrag)
3. ✗ Familienangehörige ohne Bedarf mitversichert

<strong>Empfehlung:</strong> Sofortige Kontaktaufnahme mit Kunden, Prüfung ob Widerrufsrecht noch besteht, Untersuchung möglicher Beratungsfehler.
        `
      },

      DUPLIKAT_KUNDE: {
        titel: 'Mehrfache Verträge für gleichen Kunden',
        kurz: '3 oder mehr Verträge mit identischem Kundennamen innerhalb kurzer Zeit abgeschlossen.',
        detail: (txn) => `
<strong>🚩 MEHRFACHE VERTRÄGE: Duplikatserkennung</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #E0E7FF; border-left: 4px solid #6366F1;">
<strong>Auffälligkeit:</strong> Für den Kunden "${txn.kunde}" wurden innerhalb von 90 Tagen mindestens 3 Verträge abgeschlossen.
</div>

<strong>Erkannte Verträge (identischer Name):</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.9rem;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Datum</th>
    <th style="padding: 0.5rem; text-align: left;">Produkt</th>
    <th style="padding: 0.5rem; text-align: right;">Provision</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">${new Date(new Date(txn.erstellt_am).getTime() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td style="padding: 0.5rem;">Ähnlicher Vertrag</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag * 0.85)}</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">${new Date(new Date(txn.erstellt_am).getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td style="padding: 0.5rem;">Ähnlicher Vertrag</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag * 0.9)}</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>${new Date(txn.erstellt_am).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></td>
    <td style="padding: 0.5rem;"><strong>${txn.produkt_typ}</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(txn.betrag)}</strong></td>
  </tr>
  <tr style="background: #F3F4F6; font-weight: bold;">
    <td colspan="2" style="padding: 0.5rem;">GESAMT-PROVISION (90 Tage):</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag + txn.betrag * 0.9 + txn.betrag * 0.85)}</td>
  </tr>
</table>

<strong>Warum ist das auffällig?</strong>
• Die KI-Duplikatserkennung hat identische Kundennamen erkannt
• Zeitlicher Abstand: <90 Tage zwischen allen Abschlüssen
• Alle vom gleichen Vermittler abgeschlossen
• Keine dokumentierten Bedarfsänderungen

<strong>Mögliche Szenarien:</strong>
✓ <strong>Legitim:</strong> Unterschiedliche Personen mit gleichem Namen
✓ <strong>Legitim:</strong> Tatsächlich 3 verschiedene Bedarfe (BU, LV, KV)
⚠️ <strong>Prüfenswert:</strong> Doppelerfassung durch Systemfehler
✗ <strong>Kritisch:</strong> Mehrfachverkauf ohne Bedarf zur Provisionsmaximierung

<strong>Empfehlung:</strong>
Die KI-Duplikatserkennung schlägt eine manuelle Prüfung vor:
• Vergleich der Vertragsdaten (Adresse, Geburtsdatum, Kontaktdaten)
• Prüfung ob legitime Mehrfachverträge oder potenzielle Fehleingaben
• Bei Bestätigung: Klärung mit Kunde und ggf. Vertragskorrektur
        `
      },

      COMPLIANCE_LIMIT: {
        titel: 'Compliance-Limit überschritten',
        kurz: 'Provisionshöhe liegt über der festgelegten Compliance-Grenze für diese Produktkategorie.',
        detail: (txn) => {
          // Produktspezifische Compliance-Limits
          const limits = {
            'BU': { limit: 700, beschreibung: '7 Jahresbeiträge' },
            'LV': { limit: 100, beschreibung: '100% des Jahresbeitrags (entspricht ca. 40‰ bei 25 Jahren)' },
            'KV': { limit: 50, beschreibung: '6 Monatsbeiträge' },
            'SACH': { limit: 70, beschreibung: '70% des Jahresbeitrags' },
            'HAUS': { limit: 70, beschreibung: '70% des Jahresbeitrags' },
            'KFZ': { limit: 25, beschreibung: '25% des Jahresbeitrags' }
          };

          const complianceData = limits[txn.produkt_typ] || { limit: 100, beschreibung: '100% des Jahresbeitrags' };
          const complianceLimit = complianceData.limit;
          const isVerstoss = txn.provision_prozent > complianceLimit;
          const differenz = Math.abs(txn.provision_prozent - complianceLimit);

          if (!isVerstoss) {
            // Fallback für Fälle wo Provision UNTER Limit liegt
            return `
<strong>⚠️ COMPLIANCE-PRÜFUNG: Grenzwertnahe Provision</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B;">
<strong>Hinweis:</strong> Die Provisionshöhe von ${txn.provision_prozent}% des Jahresbeitrags liegt unter der Compliance-Grenze (${complianceData.beschreibung}), wurde aber zur Prüfung vorgemerkt.
</div>

<strong>Compliance-Analyse:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Grenzwert</th>
    <th style="padding: 0.5rem; text-align: right;">Wert</th>
    <th style="padding: 0.5rem; text-align: center;">Status</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Compliance-Limit (${txn.produkt_typ})</td>
    <td style="padding: 0.5rem; text-align: right;">${complianceLimit}%</td>
    <td style="padding: 0.5rem; text-align: center;">📋 Richtlinie</td>
  </tr>
  <tr style="background: #E0F2FE;">
    <td style="padding: 0.5rem;"><strong>Dieser Vertrag</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${txn.provision_prozent}%</strong></td>
    <td style="padding: 0.5rem; text-align: center;"><strong>✓ -${differenz.toFixed(1)}%-Punkte</strong></td>
  </tr>
</table>

<strong>Warum wurde dies markiert?</strong><br>
Die KI-Anomalieerkennung hat diesen Vertrag aufgrund anderer Faktoren zur Prüfung vorgemerkt. Die Provisionshöhe selbst liegt im zulässigen Bereich.

<div style="margin: 1.5rem 0; padding: 1rem; background: #E0F2FE; border-radius: 4px;">
<strong>Empfehlung:</strong> Routineprüfung durchführen. Vertrag ist formal compliant.
</div>
            `;
          }

          // Standard-Fall: Provision überschreitet Limit
          return `
<strong>🚩 COMPLIANCE-LIMIT ÜBERSCHRITTEN</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEE2E2; border-left: 4px solid #DC2626;">
<strong>Kritische Auffälligkeit:</strong> Die Provisionshöhe von ${txn.provision_prozent}% des Jahresbeitrags überschreitet die festgelegte Compliance-Grenze (${complianceData.beschreibung}) für ${txn.produkt_typ}-Verträge.
</div>

<strong>Compliance-Analyse:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Grenzwert</th>
    <th style="padding: 0.5rem; text-align: right;">Wert</th>
    <th style="padding: 0.5rem; text-align: center;">Status</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Compliance-Limit (${txn.produkt_typ})</td>
    <td style="padding: 0.5rem; text-align: right;">${complianceLimit}%</td>
    <td style="padding: 0.5rem; text-align: center;">✓ Richtlinie</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>Dieser Vertrag</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${txn.provision_prozent}%</strong></td>
    <td style="padding: 0.5rem; text-align: center;"><strong>✗ +${differenz.toFixed(1)}%-Punkte</strong></td>
  </tr>
</table>

<strong>Warum ist das kritisch?</strong><br>
Gemäß interner Richtlinien (Compliance-Handbuch §12.3) muss jede Provision über der Grenze (${complianceData.beschreibung}) durch das Compliance-Team geprüft und genehmigt werden.

<div style="margin: 1.5rem 0;">
<strong>Dokumentationspflicht:</strong><br>
✗ Keine Compliance-Genehmigung in Akte<br>
✗ Keine schriftliche Ausnahmeregelung<br>
✗ Keine Dokumentation besonderer Umstände<br>
✗ Keine Vier-Augen-Freigabe erkennbar
</div>

<strong>Regulatorische Anforderungen:</strong><br>
• IDD (Insurance Distribution Directive): Interessenkonflikt-Prüfung erforderlich<br>
• Vermittlerregisterverordnung: Dokumentationspflicht bei Sonderprovisionen<br>
• BaFin-Rundschreiben 6/2021: Transparenz über Provisionshöhen

<div style="margin: 1.5rem 0;">
<strong>Finanzieller Impact:</strong><br>
• Provision: ${UTILS.formatCurrency(txn.betrag)} (${txn.provision_prozent}%)<br>
• Compliance-konforme Provision (${complianceLimit}%): ${UTILS.formatCurrency(txn.jahresbeitrag * (complianceLimit/100))}<br>
• Überschreitung: ${UTILS.formatCurrency(txn.betrag - (txn.jahresbeitrag * (complianceLimit/100)))}
</div>

<div style="margin: 1.5rem 0; padding: 1rem; background: #FEE2E2; border-radius: 4px;">
<strong>Empfehlung:</strong> SOFORTIGE Vorlage beim Compliance-Team erforderlich. Bei fehlender Genehmigung: Rückforderung der Überzahlung und Vermittlerbelehrung.
</div>
          `;
        }
      },

      STORNOQUOTE_ERHÖHT: {
        titel: 'Erhöhte Stornoquote im Zeitraum',
        kurz: 'Überdurchschnittliche Anzahl an Stornierungen (>15%) im Abrechnungszeitraum festgestellt.',
        detail: (txn) => `
<strong>🚩 ERHÖHTE STORNOQUOTE IM ZEITRAUM</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B;">
<strong>Auffälligkeit:</strong> Im Abrechnungszeitraum ${txn.periode} wurde eine überdurchschnittliche Anzahl an Stornierungen festgestellt.
</div>

<strong>Stornoquoten-Analyse:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Periode</th>
    <th style="padding: 0.5rem; text-align: right;">Stornoquote</th>
    <th style="padding: 0.5rem; text-align: center;">Bewertung</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Branchendurchschnitt</td>
    <td style="padding: 0.5rem; text-align: right;">5-8%</td>
    <td style="padding: 0.5rem; text-align: center;">✓ Normal</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Akzeptable Obergrenze</td>
    <td style="padding: 0.5rem; text-align: right;">12%</td>
    <td style="padding: 0.5rem; text-align: center;">⚠️ Grenzwertig</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>Dieser Zeitraum</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>18%</strong></td>
    <td style="padding: 0.5rem; text-align: center;"><strong>✗ Kritisch</strong></td>
  </tr>
</table>

<strong>Warum ist das problematisch?</strong>
Eine Stornoquote von >15% deutet auf potenzielle Vertriebspraktiken hin, die einer Überprüfung bedürfen:

<strong>Mögliche Ursachen:</strong>
1. ✗ <strong>Fehlberatung:</strong> Kunden wurden in unpassende Produkte "verkauft"
2. ✗ <strong>Überdimensionierung:</strong> Beiträge zu hoch für Kundenbuconstget
3. ✗ <strong>Druckverkauf:</strong> Abschlüsse unter Zeitdruck ohne echte Bedarfsprüfung
4. ⚠️ <strong>Marktbedingungen:</strong> Wirtschaftliche Veränderungen (z.B. Inflation)

<strong>Finanzieller Impact:</strong>
• Bei 18% Stornoquote: ~${Math.round(txn.betrag * 0.18)} Provisionsrückforderungen zu erwarten
• Durchschnittliche Rückzahlung: 80% der Abschlussprovision
• Langfristiger Reputationsschaden

<strong>Historische Entwicklung:</strong>
Diese Agentur zeigt eine steigende Stornoquote:
• 2023: 9% (normal)
• 2024 H1: 12% (grenzwertig)
• 2024 H2: 15% (kritisch)
• 2025: 18% (hochkritisch) ← TREND VERSCHÄRFT SICH

<strong>Stornierte Verträge im Zeitraum ${txn.periode}:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.875rem;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Vertrag</th>
    <th style="padding: 0.5rem; text-align: left;">Kunde</th>
    <th style="padding: 0.5rem; text-align: left;">Produkt</th>
    <th style="padding: 0.5rem; text-align: right;">Jahresbeitrag</th>
    <th style="padding: 0.5rem; text-align: right;">Provision</th>
    <th style="padding: 0.5rem; text-align: center;">Stornogrund</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">KV-2025-3421</td>
    <td style="padding: 0.5rem;">Max Müller</td>
    <td style="padding: 0.5rem;">Krankenversicherung</td>
    <td style="padding: 0.5rem; text-align: right;">5.200 €</td>
    <td style="padding: 0.5rem; text-align: right;">2.100 €</td>
    <td style="padding: 0.5rem; text-align: center;">Beitrag zu hoch</td>
  </tr>
  <tr style="background: #FAFAFA;">
    <td style="padding: 0.5rem;">BU-2025-7834</td>
    <td style="padding: 0.5rem;">Anna Schmidt</td>
    <td style="padding: 0.5rem;">Berufsunfähigkeit</td>
    <td style="padding: 0.5rem; text-align: right;">2.800 €</td>
    <td style="padding: 0.5rem; text-align: right;">14.000 €</td>
    <td style="padding: 0.5rem; text-align: center;">Fehlberatung</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">LV-2025-2134</td>
    <td style="padding: 0.5rem;">Julia Weber</td>
    <td style="padding: 0.5rem;">Lebensversicherung</td>
    <td style="padding: 0.5rem; text-align: right;">3.400 €</td>
    <td style="padding: 0.5rem; text-align: right;">2.380 €</td>
    <td style="padding: 0.5rem; text-align: center;">Widerruf</td>
  </tr>
  <tr style="background: #FAFAFA;">
    <td style="padding: 0.5rem;">KV-2025-4512</td>
    <td style="padding: 0.5rem;">Thomas Meyer</td>
    <td style="padding: 0.5rem;">Krankenversicherung</td>
    <td style="padding: 0.5rem; text-align: right;">4.900 €</td>
    <td style="padding: 0.5rem; text-align: right;">1.960 €</td>
    <td style="padding: 0.5rem; text-align: center;">Überdimensionierung</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">SACH-2025-9871</td>
    <td style="padding: 0.5rem;">Michael Wagner</td>
    <td style="padding: 0.5rem;">Sachversicherung</td>
    <td style="padding: 0.5rem; text-align: right;">650 €</td>
    <td style="padding: 0.5rem; text-align: right;">325 €</td>
    <td style="padding: 0.5rem; text-align: center;">Druckverkauf</td>
  </tr>
  <tr style="background: #FAFAFA;">
    <td style="padding: 0.5rem;">BU-2025-5623</td>
    <td style="padding: 0.5rem;">Sarah Becker</td>
    <td style="padding: 0.5rem;">Berufsunfähigkeit</td>
    <td style="padding: 0.5rem; text-align: right;">2.600 €</td>
    <td style="padding: 0.5rem; text-align: right;">13.000 €</td>
    <td style="padding: 0.5rem; text-align: center;">Widerruf</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">LV-2025-7891</td>
    <td style="padding: 0.5rem;">Peter Schulz</td>
    <td style="padding: 0.5rem;">Lebensversicherung</td>
    <td style="padding: 0.5rem; text-align: right;">3.100 €</td>
    <td style="padding: 0.5rem; text-align: right;">2.170 €</td>
    <td style="padding: 0.5rem; text-align: center;">Fehlberatung</td>
  </tr>
  <tr style="background: #FAFAFA;">
    <td style="padding: 0.5rem;">KV-2025-3298</td>
    <td style="padding: 0.5rem;">Laura Hoffmann</td>
    <td style="padding: 0.5rem;">Krankenversicherung</td>
    <td style="padding: 0.5rem; text-align: right;">5.600 €</td>
    <td style="padding: 0.5rem; text-align: right;">2.240 €</td>
    <td style="padding: 0.5rem; text-align: center;">Beitrag zu hoch</td>
  </tr>
</table>

<div style="margin: 1rem 0; padding: 0.75rem; background: #FEE2E2; border-left: 4px solid #DC2626;">
<strong>⚠️ Provisionsrückforderungen:</strong> Bei diesen 8 stornierten Verträgen sind voraussichtlich Rückzahlungen von ca. 38.175 € zu erwarten (80% der Abschlussprovision).
</div>

<strong>Empfehlung:</strong>
Sofortige Qualitätsprüfung der Beratungsprozesse, Schulung der Vermittler zu realistischer Bedarfsermittlung, verschärfte Kontrolle bei Neuabschlüssen.
        `
      },

      ZEITLICHE_AUFFÄLLIGKEIT: {
        titel: 'Zeitliche Auffälligkeit',
        kurz: 'Vertragsabschluss außerhalb üblicher Geschäftszeiten (nach 20:00 Uhr oder am Wochenende).',
        detail: (txn) => `
<strong>🚩 ZEITLICHE AUFFÄLLIGKEIT</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #E0E7FF; border-left: 4px solid #6366F1;">
<strong>Auffälligkeit:</strong> Der Vertragsabschluss erfolgte am ${new Date(txn.erstellt_am).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${new Date(txn.erstellt_am).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr.
</div>

<strong>Zeitanalyse:</strong>
• Abschlusszeitpunkt: ${new Date(txn.erstellt_am).toLocaleTimeString('de-DE')} Uhr
• Wochentag: ${new Date(txn.erstellt_am).toLocaleDateString('de-DE', { weekday: 'long' })}
• Übliche Geschäftszeiten: Mo-Fr 09:00-18:00 Uhr
• Status: ✗ Außerhalb üblicher Zeiten

<strong>Warum wird dies geprüft?</strong>
Die KI-Anomalieerkennung markiert Abschlüsse außerhalb typischer Geschäftszeiten, da sie statistisch mit folgenden Risiken korrelieren:

<strong>Potenzielle Red Flags:</strong>
⚠️ <strong>Druckverkauf:</strong> "Nur heute gültig" / "Sonderaktion endet heute"
⚠️ <strong>Unvollständige Beratung:</strong> Kunde hatte keine Zeit für ausführliches Gespräch
⚠️ <strong>Emotionaler Verkauf:</strong> Abschluss in privater Atmosphäre (Küchentisch-Verkauf)
⚠️ <strong>Vordatierung:</strong> Vertrag wurde früher besprochen, Antrag aber erst später ausgefüllt

<strong>Branchenstatistik:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Zeitfenster</th>
    <th style="padding: 0.5rem; text-align: right;">% der Abschlüsse</th>
    <th style="padding: 0.5rem; text-align: right;">Stornoquote</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Geschäftszeiten (Mo-Fr 9-18h)</td>
    <td style="padding: 0.5rem; text-align: right;">75%</td>
    <td style="padding: 0.5rem; text-align: right;">6%</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Abends (18-22h)</td>
    <td style="padding: 0.5rem; text-align: right;">20%</td>
    <td style="padding: 0.5rem; text-align: right;">11%</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;">Nachts/Wochenende</td>
    <td style="padding: 0.5rem; text-align: right;">5%</td>
    <td style="padding: 0.5rem; text-align: right;"><strong>18%</strong></td>
  </tr>
</table>

→ Verträge außerhalb Geschäftszeiten haben 3x höhere Stornoquote!

<strong>Empfehlung:</strong>
Plausibilitätsprüfung des Beratungsgesprächs. War ausreichend Zeit für vollständige Bedarfsanalyse? Wurden alle Unterlagen vollständig ausgefüllt?
        `
      },

      PRODUKTKOMBINATION: {
        titel: 'Ungewöhnliche Produktkombination',
        kurz: 'Kombination der abgeschlossenen Produkte weicht vom typischen Abschlussmuster ab.',
        detail: (txn) => `
<strong>🚩 UNGEWÖHNLICHE PRODUKTKOMBINATION</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B;">
<strong>Auffälligkeit:</strong> Die Kombination der für Kunde "${txn.kunde}" abgeschlossenen Produkte weicht vom typischen Abschlussmuster signifikant ab.
</div>

<strong>Erkannte Produktkombination (letzte 90 Tage):</strong><br>
• ${txn.produkt_typ} (${UTILS.formatCurrency(txn.betrag)})<br>
• Weitere 2-3 hochpreisige Produkte im gleichen Zeitraum<br>
• Gesamtbeitrag: ~${UTILS.formatCurrency(txn.jahresbeitrag * 3)}/Jahr

<div style="margin: 1.5rem 0;">
<strong>Warum ist das auffällig?</strong><br>
Die KI hat folgende Muster erkannt:<br>
• Mehrere hochprovisionierte Produkte auf einmal<br>
• Gesamtbeitragsbelastung überschreitet typisches Kundenbudget<br>
• Keine dokumentierte Schrittweise-Beratung über mehrere Termine
</div>

<strong>Branchenvergleich - Typisches Abschlussmuster:</strong><br>
✓ <strong>Normal:</strong> 1-2 Produkte pro Beratungsgespräch<br>
✓ <strong>Normal:</strong> Gesamtbeitrag 8-15% des Nettoeinkommens<br>
✗ <strong>Hier:</strong> 3-5 Produkte gleichzeitig<br>
✗ <strong>Hier:</strong> Gesamtbeitrag vermutlich >20% des Einkommens

<div style="margin: 1.5rem 0;">
<strong>Häufige Probleme bei "Produktbündeln":</strong><br>
1. ✗ Kunde wird von Produktvielfalt überfordert<br>
2. ✗ Keine Zeit für detaillierte Erklärung jedes Produkts<br>
3. ✗ Risiko der Fehlberatung steigt exponentiell<br>
4. ✗ Kunde versteht nicht alle abgeschlossenen Verträge
</div>

<strong>Provisions-Motivation erkennbar?</strong><br>
• Einzelprodukt ${txn.produkt_typ}: ${UTILS.formatCurrency(txn.betrag)}<br>
• Geschätzte Gesamt-Provision bei Bündel: ${UTILS.formatCurrency(txn.betrag * 3)}<br>
• Normale gestaffelte Beratung (über 6-12 Monate): ${UTILS.formatCurrency(txn.betrag * 1.5)}<br>
• <strong>Differenz: ${UTILS.formatCurrency(txn.betrag * 1.5)} mehr durch Bündelung</strong>

<div style="margin: 1.5rem 0; padding: 1rem; background: #FEF3C7; border-radius: 4px;">
<strong>Empfehlung:</strong> Prüfung der Beratungsqualität und Bedarfsermittlung. Wurden alle Produkte einzeln erklärt? Gab es ausreichend Bedenkzeit? Kunde sollte kontaktiert werden: "Sind Sie mit allen Verträgen zufrieden?"
</div>
        `
      },

      CHURNING_VERDACHT: {
        titel: 'Verdacht auf Churning',
        kurz: 'Innerhalb von 6 Monaten mehr als 2 Vertragsänderungen für denselben Kunden.',
        detail: (txn) => {
          // Chronologisch korrekte Daten - basierend auf txn.erstellt_am
          const datum3 = new Date(txn.erstellt_am); // Aktuell (neueste)
          const datum2 = new Date(txn.erstellt_am);
          datum2.setMonth(datum2.getMonth() - 3); // 3 Monate zurück
          const datum1 = new Date(txn.erstellt_am);
          datum1.setMonth(datum1.getMonth() - 6); // 6 Monate zurück (älteste)

          return `
<strong>🚩 CHURNING-VERDACHT</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEE2E2; border-left: 4px solid #DC2626;">
<strong>Kritische Auffälligkeit:</strong> Die Analyse zeigt, dass für Kunde "${txn.kunde}" innerhalb von 6 Monaten mehr als 2 Vertragsänderungen erfolgten.
</div>

<strong>Was ist Churning?</strong><br>
Churning bezeichnet das künstliche Erzeugen von Provisionsereignissen durch:<br>
• Unnötige Vertragswechsel<br>
• Storno + Neuabschluss ohne Mehrwert<br>
• Mehrfache "Optimierungen" in kurzer Zeit

<div style="margin: 1.5rem 0;">
<strong>Erkannte Churning-Aktivität (chronologisch):</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.9rem;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Datum</th>
    <th style="padding: 0.5rem; text-align: left;">Aktion</th>
    <th style="padding: 0.5rem; text-align: right;">Provision</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">${datum1.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td style="padding: 0.5rem;">Original-Vertrag ${txn.produkt_typ}</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag * 0.9)}</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">${datum2.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td style="padding: 0.5rem;">Umdeckung auf "besseren Tarif"</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag * 0.95)}</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>${datum3.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></td>
    <td style="padding: 0.5rem;"><strong>Erneute "Optimierung"</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(txn.betrag)}</strong></td>
  </tr>
  <tr style="background: #F3F4F6; font-weight: bold;">
    <td colspan="2" style="padding: 0.5rem;">GESAMT-PROVISION (6 Monate):</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag * 2.85)}</td>
  </tr>
</table>
</div>

<strong>Warum ist das hochproblematisch?</strong><br>
• Kunde zahlt faktisch für den gleichen Versicherungsschutz<br>
• Jeder Wechsel kostet Abschlussprovisionen<br>
• Vermittler generiert künstlich Provisionen ohne Kundennutzen<br>
• Langfristig: Kunde verliert Vertrauen, höhere Stornowahrscheinlichkeit

<div style="margin: 1.5rem 0; padding: 1rem; background: #FEE2E2; border-radius: 4px;">
<strong>Regulatorische Bewertung:</strong><br>
⚖️ <strong>IDD-Verstoß:</strong> Interessenkonflikt zulasten des Kunden<br>
⚖️ <strong>§ 63 VVG:</strong> Beratungspflichten nicht eingehalten<br>
⚖️ <strong>BaFin-Richtlinien:</strong> Churning als unzulässige Geschäftspraxis
</div>

<div style="margin: 1.5rem 0; padding: 1rem; background: #DC2626; color: white; border-radius: 4px;">
<strong>Empfehlung:</strong> SOFORTIGE Compliance-Prüfung. Kontaktaufnahme mit Kunde zur Schadensfeststellung. Meldung an BaFin erwägen. Provisionsrückforderung prüfen.
</div>
          `;
        }
      },

      SUPERPROVISION: {
        titel: 'Superprovisions-Verstoß',
        kurz: 'Gesamtprovision (inkl. Überprovision) überschreitet marktübliche Grenzen von 25% des Jahresbeitrags.',
        detail: (txn) => {
          const provisionProzent = txn.provision_prozent;
          const basisProvision = 12; // Marktübliche Basis-Provision
          const superProvision = provisionProzent - basisProvision;
          const limit = 25; // Compliance-Limit

          return `
<strong>🚩 SUPERPROVISIONS-VERSTOSS</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #FEE2E2; border-left: 4px solid #DC2626;">
<strong>Kritische Compliance-Verletzung:</strong> Die KI hat ein hierarchisches Provisionsmuster erkannt, bei dem die Gesamtprovision (inkl. Überprovision) ${provisionProzent}% des Jahresbeitrags überschreitet.
</div>

<strong>Provisions-Aufschlüsselung:</strong>
<table style="width: 100%; margin: 1rem 0; border-collapse: collapse;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Provisionsteil</th>
    <th style="padding: 0.5rem; text-align: right;">Betrag</th>
    <th style="padding: 0.5rem; text-align: right;">% von JB</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Basis-Abschlussprovision</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.jahresbeitrag * (basisProvision/100))}</td>
    <td style="padding: 0.5rem; text-align: right;">${basisProvision}%</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Superprovision (Hierarchie)</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.jahresbeitrag * (superProvision/100))}</td>
    <td style="padding: 0.5rem; text-align: right;">${superProvision.toFixed(1)}%</td>
  </tr>
  <tr style="background: #FEE2E2; font-weight: bold;">
    <td style="padding: 0.5rem;">GESAMT-PROVISION</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.betrag)}</td>
    <td style="padding: 0.5rem; text-align: right;">${provisionProzent}%</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Fachliche Vorgabe (max)</td>
    <td style="padding: 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.jahresbeitrag * (limit/100))}</td>
    <td style="padding: 0.5rem; text-align: right;">${limit}%</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>ÜBERSCHREITUNG</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>${UTILS.formatCurrency(txn.betrag - (txn.jahresbeitrag * (limit/100)))}</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>+${(provisionProzent - limit).toFixed(1)}%</strong></td>
  </tr>
</table>

<strong>Warum ist das kritisch?</strong>
Die Summe aus Basis- und Superprovision darf laut Fachvorgabe maximal ${limit}% des Jahresbeitrags betragen, um:
• Wirtschaftlich vertretbar zu sein für den Versicherer
• Missbrauch von Hierarchie-Strukturen zu verhindern
• Churning unattraktiv zu machen

<strong>Verdachtsmomente:</strong>
✗ Überhöhte Superprovision deutet auf künstliche Hierarchie-Struktur hin
✗ Möglicherweise "Strohmann-Hierarchien" zur Provisionsmaximierung
✗ Wirtschaftlich nicht tragbar → Versicherer trägt Verlust

<strong>Regulatorische Konsequenzen:</strong>
• Verstoß gegen Strukturvertriebs-Compliance
• BaFin-Meldepflicht bei systematischen Verstößen
• Mögliche Rückforderungen durch Versicherer

<strong>Empfehlung:</strong>
SOFORTIGE Compliance-Prüfung. Überprüfung der Hierarchie-Struktur. Rückforderung der Überzahlung (${UTILS.formatCurrency(txn.betrag - (txn.jahresbeitrag * (limit/100)))}). Verschärfte Kontrolle künftiger Superprovisionen.
          `;
        }
      },

      SYSTEMATISCH: {
        titel: 'Systematisches Anomalie-Muster',
        kurz: 'Wiederkehrendes Muster über mehrere Verträge erkannt, das von der Normalverteilung abweicht.',
        detail: (txn) => `
<strong>🚩 SYSTEMATISCHES ANOMALIE-MUSTER</strong>

<div style="margin: 1rem 0; padding: 1rem; background: #DBEAFE; border-left: 4px solid #3B82F6;">
<strong>Auffälligkeit:</strong> Die KI hat über mehrere Verträge hinweg ein wiederkehrendes Muster erkannt, das von der statistischen Normalverteilung signifikant abweicht.
</div>

<strong>Erkanntes Muster:</strong>
Die folgenden Auffälligkeiten wurden MEHRFACH bei dieser Agentur/diesem Vermittler festgestellt:

<table style="width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.9rem;">
  <tr style="background: #F3F4F6;">
    <th style="padding: 0.5rem; text-align: left;">Merkmal</th>
    <th style="padding: 0.5rem; text-align: right;">Häufigkeit</th>
    <th style="padding: 0.5rem; text-align: center;">Bewertung</th>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Identische Beitragshöhen</td>
    <td style="padding: 0.5rem; text-align: right;">8 von 10 Verträgen</td>
    <td style="padding: 0.5rem; text-align: center;">⚠️</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Gleiche Provisionssätze (abweichend)</td>
    <td style="padding: 0.5rem; text-align: right;">7 von 10 Verträgen</td>
    <td style="padding: 0.5rem; text-align: center;">⚠️</td>
  </tr>
  <tr>
    <td style="padding: 0.5rem;">Zeitliches Clustering (Monatsende)</td>
    <td style="padding: 0.5rem; text-align: right;">6 von 10 Verträgen</td>
    <td style="padding: 0.5rem; text-align: center;">⚠️</td>
  </tr>
  <tr style="background: #FEE2E2;">
    <td style="padding: 0.5rem;"><strong>Systematische Auffälligkeit</strong></td>
    <td style="padding: 0.5rem; text-align: right;"><strong>Kombination mehrerer Muster</strong></td>
    <td style="padding: 0.5rem; text-align: center;"><strong>✗</strong></td>
  </tr>
</table>

<strong>Statistische Analyse:</strong>
• Bei zufälliger Verteilung: Wahrscheinlichkeit <1% für diese Musterkombination
• Die KI-Mustererkennung stuft dies als "statistisch hochsignifikant" ein
• Verdacht auf systematische Manipulation oder strukturellen Beratungsfehler

<strong>Beispiele identischer Muster:</strong>
1. <strong>Beitragshöhen:</strong> 8 Verträge mit exakt ${UTILS.formatCurrency(txn.jahresbeitrag)} Jahresbeitrag
   → Statistisch unwahrscheinlich ohne "Runde-Zahlen-Verkauf"

2. <strong>Provisionssätze:</strong> 7 Verträge mit ${txn.provision_prozent}% Provision
   → Deutet auf Sonderkondition oder System-Manipulation hin

3. <strong>Zeitliche Muster:</strong> 6 Verträge am Monatsende (Provisionszielerreichung?)
   → Korreliert mit "Target-Druck" am Monatsende

<strong>Mögliche Ursachen:</strong>
✗ <strong>Systematische Fehlberatung:</strong> "One-size-fits-all" statt individuelle Beratung
✗ <strong>Provisions-Optimierung:</strong> Bewusste Auswahl provisionsmaximierender Tarife
✗ <strong>System-Manipulation:</strong> Technische Eingriffe in Provisionsberechnung
⚠️ <strong>Zufall:</strong> Sehr unwahrscheinlich (P < 0,01)

<strong>Empfehlung:</strong>
Tiefgehende Analyse ALLER Verträge dieser Agentur/dieses Vermittlers der letzten 12 Monate. Muster-Matching über gesamten Datenbestand. Bei Bestätigung: Compliance-Untersuchung und mögliche Sanktionen.
        `
      }
    };
  }

  /**
   * Flaggt Transaktionen als auffällig mit Kategorien
   */
  flagAuffaelligkeiten(prozent = 0.01) {
    const anzahl = Math.floor(this.transaktionen.length * prozent);
    const kategorien = this.getAuffaelligkeitsKategorien();
    const kategorieKeys = Object.keys(kategorien);

    // Finde ZUERST eine KV-Transaktion für STORNO_NEUABSCHLUSS (Position 0)
    const kvTransaktionen = this.transaktionen
      .map((txn, idx) => ({ txn, idx }))
      .filter(item => item.txn.produkt_typ === 'KV');

    const indicesArray = [];

    if (kvTransaktionen.length > 0) {
      // Wähle zufällige KV-Transaktion für Position 0
      const randomKV = kvTransaktionen[Math.floor(Math.random() * kvTransaktionen.length)];
      indicesArray.push(randomKV.idx);
    }

    // Fülle restliche Positionen mit zufälligen Transaktionen
    const indices = new Set(indicesArray);
    while (indices.size < anzahl) {
      indices.add(Math.floor(Math.random() * this.transaktionen.length));
    }

    // Konvertiere zu Array (erste Position ist bereits KV)
    if (indicesArray.length === 0) {
      // Fallback: Falls keine KV gefunden, nehme erste zufällige
      indicesArray.push(...Array.from(indices));
    } else {
      // Füge restliche hinzu
      indicesArray.push(...Array.from(indices).filter(idx => !indicesArray.includes(idx)));
    }

    // Kategorien verteilen - mit fester Reihenfolge
    indicesArray.forEach((index, i) => {
      const txn = this.transaktionen[index];

      // Die ERSTE (Position 0) wird IMMER STORNO_NEUABSCHLUSS (KV mit 60 Monaten)
      // Die ZWEITE (Position 1) wird IMMER AUFFÄLLIGE_PROVISIONSHÖHE
      let kategorieKey;
      if (i === 0) {
        kategorieKey = 'STORNO_NEUABSCHLUSS';
      } else if (i === 1) {
        kategorieKey = 'AUFFÄLLIGE_PROVISIONSHÖHE';
      } else if (i < 20) {
        // Die nächsten 18 (Positionen 2-19) bekommen verschiedene Kategorien
        // Verteile gleichmäßig über alle Kategorien außer STORNO_NEUABSCHLUSS und AUFFÄLLIGE_PROVISIONSHÖHE
        const otherKeys = kategorieKeys.filter(k => k !== 'STORNO_NEUABSCHLUSS' && k !== 'AUFFÄLLIGE_PROVISIONSHÖHE');
        kategorieKey = this._getBestMatchingCategory(txn, otherKeys, i);
      } else {
        // Restliche: Intelligente Kategorie basierend auf Transaktion
        kategorieKey = this._getBestMatchingCategory(txn, kategorieKeys);
      }

      const kategorie = kategorien[kategorieKey];

      txn.ist_auffaellig = true;
      txn.auffaelligkeits_kategorie = kategorieKey;
      txn.auffaelligkeits_grund = kategorie.kurz;
      txn.status = 'GEFLAGGT';

      // Setze Datum: Erste Transaktion (KV STORNO) bekommt 31.10.2025, Rest frühere Daten
      if (i === 0) {
        // Erste Transaktion: 31.10.2025 (neueste)
        txn.erstellt_am = new Date(2025, 9, 31).toISOString(); // 31. Oktober 2025
      } else {
        // Alle anderen: Zufälliges Datum zwischen November 2024 und 30.10.2025
        const startDate = new Date(2024, 10, 1); // 1. November 2024
        const endDate = new Date(2025, 9, 30); // 30. Oktober 2025
        const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
        txn.erstellt_am = new Date(randomTime).toISOString();
      }
    });
  }

  /**
   * Findet die beste passende Kategorie für eine Transaktion
   */
  _getBestMatchingCategory(txn, availableKeys, position = null) {
    const matches = [];

    availableKeys.forEach(key => {
      let score = 0;

      switch(key) {
        case 'COMPLIANCE_LIMIT':
          // Produktspezifische Compliance-Limits
          if (txn.produkt_typ === 'BU' && txn.provision_prozent > 700) score = 100; // BU >7 JB
          else if (txn.produkt_typ === 'LV' && txn.provision_prozent > 100) score = 100; // LV >100%
          else if (txn.produkt_typ === 'KV' && txn.provision_prozent > 50) score = 100; // KV >6 MB
          else if ((txn.produkt_typ === 'SACH' || txn.produkt_typ === 'HAUS') && txn.provision_prozent > 70) score = 100;
          else if (txn.produkt_typ === 'KFZ' && txn.provision_prozent > 25) score = 100;
          break;

        case 'AUFFÄLLIGE_PROVISIONSHÖHE':
          // Agentur-basierte Auffälligkeit: hohe Provisionsabweichungen
          // Diese Kategorie passt grundsätzlich immer, da sie agentur-bezogen ist
          score = 95;
          break;

        case 'UEBERHÖHTE_PROVISION':
          // Produktspezifisch über Durchschnitt
          if (txn.produkt_typ === 'BU' && txn.provision_prozent > 600 && txn.provision_prozent <= 700) score = 90;
          else if (txn.produkt_typ === 'LV' && txn.provision_prozent > 90 && txn.provision_prozent <= 100) score = 90;
          else if (txn.produkt_typ === 'KV' && txn.provision_prozent > 45 && txn.provision_prozent <= 50) score = 90;
          else if ((txn.produkt_typ === 'SACH' || txn.produkt_typ === 'HAUS') && txn.provision_prozent > 60 && txn.provision_prozent <= 70) score = 90;
          else if (txn.produkt_typ === 'KFZ' && txn.provision_prozent > 20 && txn.provision_prozent <= 25) score = 90;
          break;

        case 'HOHER_JAHRESBEITRAG':
          // Nur für hohe Beiträge
          if (txn.jahresbeitrag > 3000) score = 85;
          break;

        case 'SUPERPROVISION':
          // Sehr hohe Provisionen (über oberem Limit)
          if (txn.produkt_typ === 'BU' && txn.provision_prozent > 650) score = 80;
          else if (txn.produkt_typ === 'LV' && txn.provision_prozent > 95) score = 80;
          else if (txn.produkt_typ === 'KV' && txn.provision_prozent > 47) score = 80;
          else if ((txn.produkt_typ === 'SACH' || txn.produkt_typ === 'HAUS') && txn.provision_prozent > 65) score = 80;
          else if (txn.produkt_typ === 'KFZ' && txn.provision_prozent > 22) score = 80;
          break;

        case 'CHURNING_VERDACHT':
        case 'DUPLIKAT_KUNDE':
        case 'STORNOQUOTE_ERHÖHT':
        case 'ZEITLICHE_AUFFÄLLIGKEIT':
        case 'PRODUKTKOMBINATION':
        case 'SYSTEMATISCH':
          // Diese können immer passen
          score = 50;
          break;
      }

      if (score > 0) {
        matches.push({ key, score });
      }
    });

    // Sortiere nach Score und wähle beste Übereinstimmung
    matches.sort((a, b) => b.score - a.score);

    if (matches.length > 0) {
      // Für die ersten 20: Rotiere durch verfügbare Keys für Vielfalt
      if (position !== null && matches.length > 1) {
        return matches[position % matches.length].key;
      }
      return matches[0].key;
    }

    // Fallback: Erste verfügbare Kategorie
    return availableKeys[0] || 'SYSTEMATISCH';
  }

  /**
   * Speichert alle Daten in IndexedDB
   */
  async saveToDatabase() {
    console.log('💾 Speichere Daten in IndexedDB...');

    try {
      // Speichere Abrechnungen (für Stats)
      for (const abrechnung of this.abrechnungen) {
        await db.saveAbrechnung({
          agentur_id: abrechnung.agentur_id,
          agentur_name: abrechnung.agentur_name,
          periode: abrechnung.periode,
          upload_datum: abrechnung.erstellt_am,
          pdf_name: `Demo_${abrechnung.abrechnung_id}.pdf`,
          extracted_data: {
            agentur_id: abrechnung.agentur_id,
            agentur_name: abrechnung.agentur_name,
            periode: abrechnung.periode,
            gesamt_provision: abrechnung.gesamt_provision
          },
          ki_analyse: null,
          metadaten: {
            is_demo: true,
            anzahl_transaktionen: abrechnung.anzahl_transaktionen
          }
        });
      }
      console.log(`✓ ${this.abrechnungen.length} Abrechnungen gespeichert`);

      // Speichere Transaktionen (Bulk)
      const saved = await db.saveTransaktionenBulk(this.transaktionen);
      console.log(`✓ ${saved} Transaktionen gespeichert`);

      return true;
    } catch (error) {
      console.error('❌ Fehler beim Speichern:', error);
      throw error;
    }
  }

  /**
   * Hilfsfunktion: Generiert Perioden für letzte N Monate
   */
  generatePerioden(months) {
    const perioden = [];
    // Maximal Oktober 2025 (Monat 9 = Oktober, 0-basiert)
    const maxDate = new Date(2025, 9, 1); // 1. Oktober 2025

    for (let i = 0; i < months; i++) {
      const date = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);
      const jahr = date.getFullYear();
      const monat = String(date.getMonth() + 1).padStart(2, '0');
      perioden.push(`${jahr}-${monat}`);
    }

    return perioden;
  }

  /**
   * Hilfsfunktion: Zufälliges Datum in Periode
   */
  randomDateInPeriode(periode) {
    const [jahr, monat] = periode.split('-').map(Number);
    const startDate = new Date(jahr, monat - 1, 1);
    const endDate = new Date(jahr, monat, 0);

    const timestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(timestamp).toISOString();
  }

  /**
   * Hilfsfunktion: Zufälliges Datum
   */
  randomDate(start, end) {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const randomTime = startDate + Math.random() * (endDate - startDate);
    return new Date(randomTime).toISOString().split('T')[0];
  }

  /**
   * Hilfsfunktion: Zufällige Region
   */
  randomRegion() {
    const regionen = [
      'Nord', 'Süd', 'Ost', 'West', 'Nordwest', 'Nordost', 'Südwest', 'Südost',
      'Mitte', 'Bayern', 'NRW', 'Baden-Württemberg', 'Hessen', 'Niedersachsen'
    ];
    return regionen[Math.floor(Math.random() * regionen.length)];
  }

  /**
   * Prüft ob Daten bereits geladen sind
   */
  async checkIfDataExists() {
    try {
      console.log('Prüfe ob db verfügbar ist:', typeof db);
      const stats = await db.getTransaktionenStats();
      console.log('Stats erhalten:', stats);
      return stats.gesamt > 0;
    } catch (error) {
      console.error('Fehler beim Prüfen der Daten:', error);
      return false;
    }
  }

  /**
   * Lädt Daten beim App-Start falls noch nicht vorhanden
   */
  async autoLoadIfNeeded() {
    console.log('🔍 autoLoadIfNeeded aufgerufen');
    const exists = await this.checkIfDataExists();
    console.log('Daten existieren bereits?', exists);

    if (!exists) {
      console.log('📊 Keine Daten gefunden. Lade Massen-Daten...');
      return await this.generateAllData();
    } else {
      console.log('✓ Daten bereits vorhanden. Überspringe Generierung.');
      this.isInitialized = true;
      return null;
    }
  }
}

// Singleton-Instanz
const massDataGenerator = new MassDataGenerator();
