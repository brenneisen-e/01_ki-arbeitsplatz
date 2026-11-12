/**
 * Alpha Provisionsanalyse-System - Demo Data
 * ===========================================
 * Mock-Daten und Demo-Modus für Präsentationen
 * ERWEITERT MIT 6 AUFFÄLLIGKEITSMUSTERN
 */

const DEMO_DATA = {
  /**
   * NEUE ERWEITERTE DEMO-SZENARIEN MIT HIERARCHIEN
   * ===============================================
   */
  hierarchical_scenarios: {
    // SZENARIO 1: Die auffällige Superprovision
    superprovision_violation: {
      name: 'Superprovisions-Compliance-Verstoß',
      beschreibung: 'Einzeln unauffällig, kombiniert über Compliance-Grenze',
      agenturen: [
        {
          agentur_id: '001',
          vermittler_nummer: '0300/0005',
          agentur_name: 'Meyer Finanzberatung (Hauptvermittler)',
          periode: '2025-01',
          rolle: 'Hauptvermittler',
          extracted_data: {
            vermittler_nummer: '0300/0005',
            vermittler_name: 'Thomas Meyer',
            provisionssumme_gesamt: 48000,
            vertragsanzahl_gesamt: 125,
            stornoquote_gesamt: 5.2,
            neugeschaeft_provision: 20000,
            bestand_provision: 28000,
            // SUPERPROVISIONEN von Untervermittlern
            superprovisionen: [
              {
                untervermittler_nummer: '0300/0187',
                untervermittler_name: 'Frank Müller',
                vertraege: [
                  {
                    vsnr: 'KV-2025-4401',
                    kunde: 'Anna Schmidt',
                    produkt: 'Private Krankenversicherung Premium',
                    jahresbeitrag: 6000,
                    vermittler_provision_prozent: 60,
                    superprovision_prozent: 20,
                    superprovision_betrag: 1200,
                    abschlussdatum: '2025-01-15'
                  },
                  {
                    vsnr: 'KV-2025-4402',
                    kunde: 'Michael Weber',
                    produkt: 'Private Krankenversicherung Komfort',
                    jahresbeitrag: 4800,
                    vermittler_provision_prozent: 60,
                    superprovision_prozent: 20,
                    superprovision_betrag: 960,
                    abschlussdatum: '2025-01-18'
                  }
                ],
                superprovision_gesamt: 2160
              },
              {
                untervermittler_nummer: '0300/0211',
                untervermittler_name: 'Andrea Schmidt',
                vertraege: [
                  {
                    vsnr: 'BU-2025-7701',
                    kunde: 'Julia Fischer',
                    produkt: 'Berufsunfähigkeitsversicherung',
                    jahresbeitrag: 2400,
                    vermittler_provision_prozent: 60,
                    superprovision_prozent: 20,
                    superprovision_betrag: 480,
                    abschlussdatum: '2025-01-20'
                  }
                ],
                superprovision_gesamt: 480
              }
            ],
            auszahlungsbetrag: 50640,
            auszahlungsdatum: '2025-02-05'
          },
          ki_analyse: {
            agentur_id: '001',
            agentur_name: 'Meyer Finanzberatung (Hauptvermittler)',
            vermittler_nummer: '0300/0005',
            abrechnungsperiode: '2025-01',
            analyse_datum: new Date().toISOString(),
            risiko_score: 1,
            risiko_kategorie: 'gruen',
            zusammenfassung: 'Hauptvermittler-Abrechnung ohne erkennbare Einzelauffälligkeiten. Superprovisionen im üblichen Rahmen.',
            auffaelligkeiten: [],
            kennzahlen_vergleich: {
              provisionssumme: { aktuell: 48000, vorperiode: 46500, veraenderung_prozent: 3.2 }
            },
            handlungsempfehlung: 'Keine Maßnahme erforderlich',
            details: 'Einzeln betrachtet unauffällig.'
          }
        },
        {
          agentur_id: '001',
          vermittler_nummer: '0300/0187',
          agentur_name: 'Müller Versicherungsservice (Untervermittler)',
          periode: '2025-01',
          rolle: 'Untervermittler',
          extracted_data: {
            vermittler_nummer: '0300/0187',
            vermittler_name: 'Frank Müller',
            vorgesetzter: '0300/0005',
            provisionssumme_gesamt: 21600,
            vertragsanzahl_gesamt: 45,
            stornoquote_gesamt: 6.1,
            // EIGENE PROVISIONEN
            vertraege: [
              {
                vsnr: 'KV-2025-4401',
                kunde: 'Anna Schmidt',
                produkt: 'Private Krankenversicherung Premium',
                jahresbeitrag: 6000,
                provision_prozent: 60,
                provision_betrag: 3600,
                abschlussdatum: '2025-01-15'
              },
              {
                vsnr: 'KV-2025-4402',
                kunde: 'Michael Weber',
                produkt: 'Private Krankenversicherung Komfort',
                jahresbeitrag: 4800,
                provision_prozent: 60,
                provision_betrag: 2880,
                abschlussdatum: '2025-01-18'
              },
              {
                vsnr: 'SACH-2025-8801',
                kunde: 'Peter Hoffmann',
                produkt: 'Hausratversicherung',
                jahresbeitrag: 480,
                provision_prozent: 55,
                provision_betrag: 264,
                abschlussdatum: '2025-01-22'
              }
            ],
            auszahlungsbetrag: 21600,
            auszahlungsdatum: '2025-02-05'
          },
          ki_analyse: {
            agentur_id: '001',
            agentur_name: 'Müller Versicherungsservice (Untervermittler)',
            vermittler_nummer: '0300/0187',
            abrechnungsperiode: '2025-01',
            analyse_datum: new Date().toISOString(),
            risiko_score: 1,
            risiko_kategorie: 'gruen',
            zusammenfassung: 'Untervermittler-Abrechnung ohne Auffälligkeiten. Provisionssätze im Rahmen.',
            auffaelligkeiten: [],
            kennzahlen_vergleich: {
              provisionssumme: { aktuell: 21600, vorperiode: 20800, veraenderung_prozent: 3.8 }
            },
            handlungsempfehlung: 'Keine Maßnahme erforderlich',
            details: 'Einzeln betrachtet unauffällig.'
          }
        }
      ],
      combined_analysis: {
        risiko_score: 4,
        risiko_kategorie: 'rot',
        zusammenfassung: 'COMPLIANCE-VERSTOSS: Kombination von Vermittler- und Superprovision überschreitet Höchstgrenze',
        auffaelligkeiten: [
          {
            id: 'SUPER-001',
            kategorie: 'Superprovisions-Compliance',
            schweregrad: 'kritisch',
            titel: 'Gesamtprovision überschreitet KV-Limit von 75%',
            beschreibung: 'Bei Vertrag KV-2025-4401: Vermittlerprovision 60% + Superprovision Vorgesetzter 20% = 80% Gesamtprovision. Erlaubt sind max. 75% bei Krankenversicherungen. Überschreitung: 5 Prozentpunkte (6.7%).',
            betroffene_daten: {
              vertrag: 'KV-2025-4401',
              kunde: 'Anna Schmidt',
              jahresbeitrag: 6000,
              vermittler_provision: '60% (3.600€)',
              superprovision: '20% (1.200€)',
              gesamt_provision: '80% (4.800€)',
              max_erlaubt: '75% (4.500€)',
              ueberschreitung: '5% (300€)'
            },
            empfehlung: 'Sofortige Compliance-Prüfung und Anpassung der Provisionssätze erforderlich. Prüfung aller weiteren Verträge in dieser Hierarchie.'
          },
          {
            id: 'SUPER-002',
            kategorie: 'Superprovisions-Compliance',
            schweregrad: 'hoch',
            titel: 'Zweiter Compliance-Verstoß bei KV-2025-4402',
            beschreibung: 'Auch bei Vertrag KV-2025-4402: 60% + 20% = 80% Gesamtprovision bei KV (Limit: 75%).',
            betroffene_daten: {
              vertrag: 'KV-2025-4402',
              gesamt_provision: '80%',
              ueberschreitung: '5%'
            },
            empfehlung: 'Systematisches Problem - gesamte Provisionsstaffel prüfen.'
          }
        ],
        handlungsempfehlung: 'Sofortige Prüfung erforderlich'
      }
    },

    // SZENARIO 2: Storno-Clustering
    storno_clustering: {
      name: 'Storno-Clustering Pattern',
      beschreibung: 'Vermittler mit auffälliger Häufung von Stornierungen an einem Tag',
      agentur_id: '003',
      vermittler_nummer: '0300/0156',
      agentur_name: 'Meier Versicherungsmakler',
      periode: '2025-01',
      extracted_data: {
        vermittler_nummer: '0300/0156',
        vermittler_name: 'Frank Meier',
        provisionssumme_gesamt: 38500,
        vertragsanzahl_gesamt: 280,
        stornoquote_gesamt: 14.3,
        neugeschaeft_provision: 22000,
        bestand_provision: 16500,
        // Stornierungen mit Clustering
        stornierungen: [
          { vsnr: 'LV-2023-1101', kunde: 'Otto Schulz', stornodatum: '2025-01-15', abschlussdatum: '2023-06-10', provision_zurueck: 850 },
          { vsnr: 'LV-2023-1105', kunde: 'Emma Klein', stornodatum: '2025-01-15', abschlussdatum: '2023-06-12', provision_zurueck: 920 },
          { vsnr: 'LV-2023-1108', kunde: 'Felix Braun', stornodatum: '2025-01-15', abschlussdatum: '2023-06-15', provision_zurueck: 780 },
          { vsnr: 'LV-2023-1112', kunde: 'Laura Weiß', stornodatum: '2025-01-15', abschlussdatum: '2023-06-18', provision_zurueck: 1100 },
          { vsnr: 'LV-2023-1116', kunde: 'Tim Grau', stornodatum: '2025-01-15', abschlussdatum: '2023-06-20', provision_zurueck: 650 },
          { vsnr: 'LV-2023-1120', kunde: 'Nina Rot', stornodatum: '2025-01-15', abschlussdatum: '2023-06-22', provision_zurueck: 890 },
          { vsnr: 'LV-2023-1124', kunde: 'Paul Gelb', stornodatum: '2025-01-15', abschlussdatum: '2023-06-25', provision_zurueck: 740 },
          { vsnr: 'LV-2023-1128', kunde: 'Sarah Blau', stornodatum: '2025-01-15', abschlussdatum: '2023-06-28', provision_zurueck: 980 },
          { vsnr: 'BU-2023-2201', kunde: 'David Grün', stornodatum: '2025-01-15', abschlussdatum: '2023-07-05', provision_zurueck: 1250 },
          { vsnr: 'BU-2023-2205', kunde: 'Maria Schwarz', stornodatum: '2025-01-15', abschlussdatum: '2023-07-08', provision_zurueck: 1150 },
          { vsnr: 'BU-2023-2209', kunde: 'Jonas Silber', stornodatum: '2025-01-15', abschlussdatum: '2023-07-10', provision_zurueck: 1320 },
          { vsnr: 'KV-2023-3301', kunde: 'Lisa Gold', stornodatum: '2025-01-15', abschlussdatum: '2023-07-12', provision_zurueck: 890 },
          { vsnr: 'KV-2023-3305', kunde: 'Max Bronze', stornodatum: '2025-01-15', abschlussdatum: '2023-07-15', provision_zurueck: 760 },
          { vsnr: 'KV-2023-3309', kunde: 'Sophie Kupfer', stornodatum: '2025-01-15', abschlussdatum: '2023-07-18', provision_zurueck: 820 },
          { vsnr: 'SACH-2023-4401', kunde: 'Ben Eisen', stornodatum: '2025-01-15', abschlussdatum: '2023-07-20', provision_zurueck: 340 },
          { vsnr: 'SACH-2023-4405', kunde: 'Clara Stahl', stornodatum: '2025-01-15', abschlussdatum: '2023-07-22', provision_zurueck: 280 }
        ],
        auszahlungsbetrag: 25980,
        auszahlungsdatum: '2025-02-05'
      },
      ki_analyse: {
        agentur_id: '003',
        agentur_name: 'Meier Versicherungsmakler',
        vermittler_nummer: '0300/0156',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 5,
        risiko_kategorie: 'rot',
        zusammenfassung: 'KRITISCHES MUSTER: 16 Stornierungen an einem einzigen Tag (15.01.2025). Extrem auffälliges Storno-Clustering.',
        auffaelligkeiten: [
          {
            id: 'STORNO-CLUSTER-001',
            kategorie: 'Anomalie',
            schweregrad: 'kritisch',
            titel: 'Massives Storno-Clustering am 15.01.2025',
            beschreibung: '16 Verträge wurden am gleichen Tag (15.01.2025) storniert. Dies entspricht 5.7% aller Verträge des Vermittlers. Alle Verträge stammen aus dem Zeitraum Juni-Juli 2023 und waren ca. 18 Monate alt. Rückforderungssumme: 13.520€.',
            betroffene_daten: {
              storno_datum: '15.01.2025',
              anzahl_stornos: 16,
              anteil_gesamtbestand: '5.7%',
              vertragslaufzeit_durchschnitt: '18 Monate',
              rueckforderung_gesamt: '13.520€',
              betroffene_sparten: 'Leben (8), BU (3), KV (3), Sach (2)'
            },
            empfehlung: 'Sofortige Ursachenanalyse erforderlich. Mögliche Szenarien: (1) Systematische Beratungsfehler aus Juni/Juli 2023, (2) Externes Ereignis (Konkurrenz-Aktion, negative Publicity), (3) Manipulation/Betrug. Kundenbefragung und Compliance-Prüfung dringend empfohlen.'
          },
          {
            id: 'STORNO-QUOTE-001',
            kategorie: 'Historischer Vergleich',
            schweregrad: 'kritisch',
            titel: 'Stornoquote massiv erhöht',
            beschreibung: 'Gesamtstornoquote von 14.3% liegt weit über historischem Durchschnitt (6.1%) und Branchenbenchmark (<10%).',
            betroffene_daten: {
              aktuell: '14.3%',
              historisch: '6.1%',
              benchmark: '<10%',
              abweichung: '+8.2 Prozentpunkte'
            },
            empfehlung: 'Bestandsschutz-Maßnahmen prüfen, Vermittler-Schulung, ggf. Vertragsanbahnung überprüfen.'
          }
        ],
        handlungsempfehlung: 'Sofortige Prüfung erforderlich',
        details: 'Extremfall von Storno-Clustering mit systematischem Muster.'
      }
    },

    // SZENARIO 3: Systematische Umdeckungen
    umdeckungen: {
      name: 'Systematische Umdeckungen',
      beschreibung: 'Vermittlerin ersetzt bestehende Verträge durch neue bei anderem Versicherer',
      agentur_id: '002',
      vermittler_nummer: '0300/0102',
      agentur_name: 'Weber Finanzberatung',
      periode: '2025-01',
      extracted_data: {
        vermittler_nummer: '0300/0102',
        vermittler_name: 'Lisa Weber',
        provisionssumme_gesamt: 52000,
        vertragsanzahl_gesamt: 195,
        stornoquote_gesamt: 8.2,
        neugeschaeft_provision: 38000,
        bestand_provision: 14000,
        // Umdeckungen (Storno + Neuabschluss beim gleichen Kunden)
        umdeckungen: [
          {
            kunde: 'Familie Schneider',
            alt_vsnr: 'SACH-2021-5501',
            alt_versicherer: 'Alte Leipziger',
            alt_jahresbeitrag: 850,
            stornodatum: '2025-01-10',
            neu_vsnr: 'SACH-2025-9901',
            neu_versicherer: 'Allianz',
            neu_jahresbeitrag: 920,
            neu_provision: 506,
            abschlussdatum: '2025-01-12',
            zeitdifferenz_tage: 2
          },
          {
            kunde: 'Dr. Hartmann',
            alt_vsnr: 'KV-2020-6601',
            alt_versicherer: 'Debeka',
            alt_jahresbeitrag: 5200,
            stornodatum: '2025-01-14',
            neu_vsnr: 'KV-2025-9902',
            neu_versicherer: 'Hallesche',
            neu_jahresbeitrag: 5400,
            neu_provision: 3240,
            abschlussdatum: '2025-01-16',
            zeitdifferenz_tage: 2
          },
          {
            kunde: 'Thomas und Petra Bauer',
            alt_vsnr: 'LV-2019-7701',
            alt_versicherer: 'Generali',
            alt_jahresbeitrag: 3600,
            stornodatum: '2025-01-18',
            neu_vsnr: 'LV-2025-9903',
            neu_versicherer: 'Cosmos Direkt',
            neu_jahresbeitrag: 3750,
            neu_provision: 11250,
            abschlussdatum: '2025-01-20',
            zeitdifferenz_tage: 2
          },
          {
            kunde: 'Sabine Keller',
            alt_vsnr: 'BU-2022-8801',
            alt_versicherer: 'Alte Leipziger',
            alt_jahresbeitrag: 1800,
            stornodatum: '2025-01-22',
            neu_vsnr: 'BU-2025-9904',
            neu_versicherer: 'Nürnberger',
            neu_jahresbeitrag: 1850,
            neu_provision: 5550,
            abschlussdatum: '2025-01-24',
            zeitdifferenz_tage: 2
          },
          {
            kunde: 'Familie Richter',
            alt_vsnr: 'SACH-2020-9901',
            alt_versicherer: 'HUK',
            alt_jahresbeitrag: 1200,
            stornodatum: '2025-01-25',
            neu_vsnr: 'SACH-2025-9905',
            neu_versicherer: 'ERGO',
            neu_jahresbeitrag: 1280,
            neu_provision: 704,
            abschlussdatum: '2025-01-27',
            zeitdifferenz_tage: 2
          }
        ],
        auszahlungsbetrag: 52000,
        auszahlungsdatum: '2025-02-05'
      },
      ki_analyse: {
        agentur_id: '002',
        agentur_name: 'Weber Finanzberatung',
        vermittler_nummer: '0300/0102',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 4,
        risiko_kategorie: 'rot',
        zusammenfassung: 'SYSTEMATISCHES UMDECKUNGSMUSTER: 5 Fälle identifiziert, bei denen bestehende Verträge innerhalb von 2 Tagen durch Neuabschlüsse ersetzt wurden.',
        auffaelligkeiten: [
          {
            id: 'UMDECKUNG-001',
            kategorie: 'Anomalie',
            schweregrad: 'kritisch',
            titel: 'Systematische Umdeckungen erkannt',
            beschreibung: '5 Kunden haben innerhalb von jeweils 2 Tagen einen Altvertrag gekündigt und einen Neuvertrag bei einem anderen Versicherer abgeschlossen. Dieses Muster ist hochgradig auffällig und deutet auf aggressive Umdeckungspraktiken hin. Gesamtprovision aus Umdeckungen: 21.250€ (41% der Gesamtprovision).',
            betroffene_daten: {
              anzahl_umdeckungen: 5,
              zeitdifferenz_durchschnitt: '2 Tage',
              provision_aus_umdeckungen: '21.250€',
              anteil_gesamtprovision: '41%',
              betroffene_kunden: 'Familie Schneider, Dr. Hartmann, Familie Bauer, Sabine Keller, Familie Richter'
            },
            empfehlung: 'Sofortige Compliance-Prüfung: (1) War Umdeckung im Kundeninteresse? (2) Wurde vollständige Beratung dokumentiert? (3) Wurden Nachteile (Gesundheitsprüfung, Wartezeiten, Kosten) offengelegt? (4) Liegt Provisionsgier vor? Kundenbefragung dringend empfohlen.'
          },
          {
            id: 'UMDECKUNG-002',
            kategorie: 'Branchenbenchmark',
            schweregrad: 'hoch',
            titel: 'Neugeschäft-Quote ungewöhnlich hoch',
            beschreibung: 'Neugeschäft macht 73% der Gesamtprovision aus (Normalbereich: 30-40%). Dies korreliert mit den identifizierten Umdeckungen.',
            betroffene_daten: {
              neugeschaeft_anteil: '73%',
              normalbereich: '30-40%',
              abweichung: '+33-43 Prozentpunkte'
            },
            empfehlung: 'Prüfung der Vertriebspraktiken und Schulung zur kundenorientierten Beratung.'
          }
        ],
        handlungsempfehlung: 'Sofortige Prüfung erforderlich',
        details: 'Systematisches Umdeckungsmuster mit klarer Provisionsorientierung statt Kundenorientierung.'
      }
    },

    // SZENARIO 4: Storno-Neuabschluss-Trick
    storno_neuabschluss: {
      name: 'Storno-Neuabschluss-Optimierung',
      beschreibung: 'Kombination aus Storno-Clustering und Umdeckungen zur Provisionsmaximierung',
      agentur_id: '007',
      vermittler_nummer: '0300/0299',
      agentur_name: 'Hoffmann Versicherungsdienst',
      periode: '2025-01',
      extracted_data: {
        vermittler_nummer: '0300/0299',
        vermittler_name: 'Stefan Hoffmann',
        provisionssumme_gesamt: 78000,
        vertragsanzahl_gesamt: 320,
        stornoquote_gesamt: 11.9,
        neugeschaeft_provision: 62000,
        bestand_provision: 16000,
        // Kombiniertes Muster
        pattern_details: {
          systematische_neuabschluesse: 12,
          davon_ersatz_fuer_stornos: 8,
          durchschnittliche_provision_neuabschluss: 5166,
          durchschnittliche_rueckforderung_storno: 2100,
          netto_gewinn_pro_zyklus: 3066
        },
        auszahlungsbetrag: 78000,
        auszahlungsdatum: '2025-02-05'
      },
      ki_analyse: {
        agentur_id: '007',
        agentur_name: 'Hoffmann Versicherungsdienst',
        vermittler_nummer: '0300/0299',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 5,
        risiko_kategorie: 'rot',
        zusammenfassung: 'KRITISCHER BETRUGSFALL: Systematischer Storno-Neuabschluss-Zyklus zur Provisionsoptimierung erkannt.',
        auffaelligkeiten: [
          {
            id: 'CHURNING-001',
            kategorie: 'Anomalie',
            schweregrad: 'kritisch',
            titel: 'Systematisches Churning erkannt',
            beschreibung: '12 Neuabschlüsse im Bereich Lebens- und BU-Versicherung, davon 8 als direkter Ersatz für eigene Altverträge aus 2023-2024 (18-24 Monate Laufzeit). Durchschnittlicher Netto-Provisionsgewinn pro Zyklus: 3.066€. Gesamtschaden durch Churning: ca. 24.500€.',
            betroffene_daten: {
              churning_faelle: 8,
              neuabschluss_provision_gesamt: '41.333€',
              rueckforderung_gesamt: '16.800€',
              netto_gewinn: '24.533€',
              durchschnittliche_vertragslaufzeit_alt: '21 Monate'
            },
            empfehlung: 'SOFORTIGE SPERRUNG des Vermittlers und vollständige Compliance-Untersuchung. Kundenbefragung aller 8 betroffenen Kunden. Prüfung auf strafrechtliche Relevanz (Betrug). Provisionsstopp und Rückforderung prüfen.'
          },
          {
            id: 'CHURNING-002',
            kategorie: 'Mathematische Validierung',
            schweregrad: 'kritisch',
            titel: 'Extrem hohe Neugeschäft-Quote',
            beschreibung: 'Neugeschäft macht 79% der Gesamtprovision aus - ein klares Indiz für Churning-Praktiken.',
            betroffene_daten: {
              neugeschaeft_anteil: '79%',
              normalbereich: '30-40%'
            },
            empfehlung: 'Systematische Überprüfung aller Neuabschlüsse der letzten 24 Monate.'
          },
          {
            id: 'CHURNING-003',
            kategorie: 'Historischer Vergleich',
            schweregrad: 'kritisch',
            titel: 'Stornoquote erhöht bei gleichzeitig hohem Neugeschäft',
            beschreibung: 'Stornoquote von 11.9% (historisch: 6.5%) bei gleichzeitig massivem Neugeschäft ist typisch für Churning.',
            betroffene_daten: {
              stornoquote_aktuell: '11.9%',
              stornoquote_historisch: '6.5%'
            },
            empfehlung: 'Gesamtes Portfolio prüfen.'
          }
        ],
        handlungsempfehlung: 'Sofortige Prüfung erforderlich',
        details: 'Schwerwiegender Fall von systematischem Churning mit klarer Betrugsverdacht.'
      }
    },

    // SZENARIO 5: Omnikanal-Kickback
    omnikanal_kickback: {
      name: 'Omnikanal-Kickback Schema',
      beschreibung: 'Großmakler leitet Geschäft an eigenen Alpha-Vermittler weiter (verstecktes Eigengeschäft)',
      agenturen: [
        {
          agentur_id: '099',
          vermittler_nummer: '9999/0001',
          agentur_name: 'Hanseatischer Finanzservice GmbH (Großmakler)',
          periode: '2025-01',
          rolle: 'Großmakler',
          extracted_data: {
            vermittler_nummer: '9999/0001',
            vermittler_name: 'Hanseatischer Finanzservice GmbH',
            typ: 'Großmakler',
            provisionssumme_gesamt: 85000,
            vertragsanzahl_gesamt: 95,
            durchschnittsprovision_pro_vertrag: 894.74,
            // Weitergeleitete Geschäfte
            weiterleitungen: [
              {
                ziel_vermittler: '0300/0005',
                ziel_name: 'Thomas Meyer',
                anzahl_vertraege: 12,
                provision_gesamt: 18500,
                kickback_verdacht: true,
                zeitraum: '2025-01-05 bis 2025-01-28'
              }
            ],
            auszahlungsbetrag: 85000,
            auszahlungsdatum: '2025-02-05'
          },
          ki_analyse: {
            agentur_id: '099',
            agentur_name: 'Hanseatischer Finanzservice GmbH',
            vermittler_nummer: '9999/0001',
            abrechnungsperiode: '2025-01',
            analyse_datum: new Date().toISOString(),
            risiko_score: 2,
            risiko_kategorie: 'gelb',
            zusammenfassung: 'Großmakler mit üblicher Geschäftstätigkeit. Auffällig: Weiterleitung von Geschäften an einen spezifischen Alpha-Vermittler.',
            auffaelligkeiten: [
              {
                id: 'OMNI-MAKLER-001',
                kategorie: 'Anomalie',
                schweregrad: 'mittel',
                titel: 'Auffällige Geschäftsweiterleitung',
                beschreibung: '12 Verträge wurden an Alpha-Vermittler 0300/0005 weitergeleitet. Bei einem Großmakler mit eigenem Courtage-Anspruch ungewöhnlich.',
                betroffene_daten: {
                  weiterleitungen: 12,
                  ziel: 'Alpha-Vermittler 0300/0005 (Thomas Meyer)',
                  provision_weitergeleitet: '18.500€'
                },
                empfehlung: 'Prüfung: Besteht eine versteckte Verbindung zwischen Makler und Vermittler?'
              }
            ],
            handlungsempfehlung: 'Beobachten',
            details: 'Einzeln betrachtet noch nicht kritisch, aber im Kontext mit Vermittler-Abrechnung prüfen.'
          }
        },
        {
          agentur_id: '001',
          vermittler_nummer: '0300/0005',
          agentur_name: 'Meyer Finanzberatung',
          periode: '2025-01',
          rolle: 'Alpha-Vermittler',
          extracted_data: {
            vermittler_nummer: '0300/0005',
            vermittler_name: 'Thomas Meyer',
            provisionssumme_gesamt: 68500,
            vertragsanzahl_gesamt: 145,
            // Geschäfte vom Großmakler
            geschaefte_von_makler: [
              {
                makler_nummer: '9999/0001',
                makler_name: 'Hanseatischer Finanzservice',
                anzahl_vertraege: 12,
                provision_erhalten: 18500,
                provision_makler_geschaetzt: 37000,
                verdacht_kickback: true
              }
            ],
            auszahlungsbetrag: 68500,
            auszahlungsdatum: '2025-02-05'
          },
          ki_analyse: {
            agentur_id: '001',
            agentur_name: 'Meyer Finanzberatung',
            vermittler_nummer: '0300/0005',
            abrechnungsperiode: '2025-01',
            analyse_datum: new Date().toISOString(),
            risiko_score: 2,
            risiko_kategorie: 'gelb',
            zusammenfassung: 'Alpha-Vermittler mit leicht erhöhter Provisionssumme. Auffällig: Geschäfte von Großmakler.',
            auffaelligkeiten: [
              {
                id: 'OMNI-VERMITTLER-001',
                kategorie: 'Anomalie',
                schweregrad: 'mittel',
                titel: 'Geschäftszuführung von Großmakler',
                beschreibung: '12 Verträge stammen von Großmakler 9999/0001. Alpha-Vermittler erhält 18.500€ Provision.',
                betroffene_daten: {
                  geschaefte_von_makler: 12,
                  provision_erhalten: '18.500€',
                  makler: 'Hanseatischer Finanzservice (9999/0001)'
                },
                empfehlung: 'Prüfung der Geschäftsbeziehung.'
              }
            ],
            handlungsempfehlung: 'Beobachten',
            details: 'Einzeln betrachtet noch unkritisch.'
          }
        }
      ],
      combined_analysis: {
        risiko_score: 4,
        risiko_kategorie: 'rot',
        zusammenfassung: 'KICKBACK-VERDACHT: Großmakler leitet Geschäfte an Alpha-Vermittler weiter, obwohl eigene Courtage möglich. Verdacht auf verstecktes Eigengeschäft und Kickback-Zahlungen.',
        auffaelligkeiten: [
          {
            id: 'OMNIKANAL-001',
            kategorie: 'Anomalie',
            schweregrad: 'kritisch',
            titel: 'Omnikanal-Kickback-Schema identifiziert',
            beschreibung: 'Großmakler "Hanseatischer Finanzservice" (9999/0001) leitet 12 Verträge an Alpha-Vermittler Thomas Meyer (0300/0005) weiter. Bei üblicher Courtage-Struktur würde der Makler 100% Provision erhalten (geschätzt: 37.000€). Stattdessen erhält der Alpha-Vermittler 18.500€. VERDACHT: (1) Makler und Vermittler sind wirtschaftlich verbunden, (2) Vermittler zahlt Kickback an Makler, (3) Verschleierung von Eigengeschäft zur Umgehung von Compliance-Regeln.',
            betroffene_daten: {
              makler: 'Hanseatischer Finanzservice (9999/0001)',
              vermittler: 'Thomas Meyer (0300/0005)',
              weitergeleitete_vertraege: 12,
              provision_vermittler: '18.500€',
              geschaetzte_courtage_makler: '37.000€',
              geschaetzter_kickback: '18.500€ (50%)',
              modus_operandi: 'Omnikanal-Arbitrage'
            },
            empfehlung: 'DRINGENDE COMPLIANCE-PRÜFUNG: (1) Gesellschafterstruktur beider Unternehmen prüfen, (2) Zahlungsflüsse zwischen Makler und Vermittler untersuchen, (3) Verträge prüfen (Wer hatte Kundenkontakt?), (4) Frühere Perioden analysieren. Bei Bestätigung: Vertragskündigung und ggf. Strafanzeige.'
          }
        ],
        handlungsempfehlung: 'Sofortige Prüfung erforderlich'
      }
    }
  },

  /**
   * KLASSISCHE DEMO-SZENARIEN (Behalten für Rückwärtskompatibilität)
   */
  scenarios: {
    normal: {
      name: 'Normale Abrechnung',
      agentur_id: '001',
      agentur_name: 'Mustermann Versicherungen GmbH',
      periode: '2025-01',
      extracted_data: {
        provisionssumme_gesamt: 42000,
        provisionssumme_sparten: {
          leben: 12000,
          sach: 16000,
          kranken: 8000,
          kfz: 6000
        },
        vertragsanzahl_gesamt: 420,
        vertragsanzahl_sparten: {
          leben: 80,
          sach: 180,
          kranken: 100,
          kfz: 60
        },
        stornoquote_gesamt: 7.5,
        stornoquote_sparten: {
          leben: 6.2,
          sach: 8.1,
          kranken: 7.0,
          kfz: 8.5
        },
        neugeschaeft_provision: 16800,
        bestand_provision: 25200,
        bonuszahlungen: 1500,
        auszahlungsbetrag: 40500,
        auszahlungsdatum: '2025-02-01'
      },
      ki_analyse: {
        agentur_id: '001',
        agentur_name: 'Mustermann Versicherungen GmbH',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 1,
        risiko_kategorie: 'gruen',
        zusammenfassung: 'Keine nennenswerten Auffälligkeiten. Normale Geschäftsentwicklung im erwarteten Rahmen.',
        auffaelligkeiten: [],
        kennzahlen_vergleich: {
          provisionssumme: { aktuell: 42000, vorperiode: 40500, veraenderung_prozent: 3.7 },
          vertragsanzahl: { aktuell: 420, vorperiode: 415, veraenderung_prozent: 1.2 },
          stornoquote: { aktuell: 7.5, vorperiode: 7.8, veraenderung_prozentpunkte: -0.3 }
        },
        handlungsempfehlung: 'Keine Maßnahme erforderlich',
        details: 'Alle Kennzahlen im Normbereich.'
      }
    },

    high_deviation: {
      name: 'Starke Abweichungen',
      agentur_id: '002',
      agentur_name: 'Schmidt & Partner AG',
      periode: '2025-01',
      extracted_data: {
        provisionssumme_gesamt: 68000,
        provisionssumme_sparten: {
          leben: 25000,
          sach: 20000,
          kranken: 13000,
          kfz: 10000
        },
        vertragsanzahl_gesamt: 380,
        vertragsanzahl_sparten: {
          leben: 120,
          sach: 140,
          kranken: 70,
          kfz: 50
        },
        stornoquote_gesamt: 6.2,
        stornoquote_sparten: {
          leben: 5.1,
          sach: 6.8,
          kranken: 6.5,
          kfz: 6.9
        },
        neugeschaeft_provision: 34000,
        bestand_provision: 34000,
        bonuszahlungen: 3000,
        auszahlungsbetrag: 65000,
        auszahlungsdatum: '2025-02-05'
      },
      ki_analyse: {
        agentur_id: '002',
        agentur_name: 'Schmidt & Partner AG',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 3,
        risiko_kategorie: 'orange',
        zusammenfassung: 'Deutlich erhöhte Provisionssumme bei gleichzeitig rückläufiger Vertragsanzahl. Dies deutet auf überdurchschnittlich hohe Einzelprovisionen hin.',
        auffaelligkeiten: [
          {
            id: UTILS.generateId(),
            kategorie: 'Historischer Vergleich',
            schweregrad: 'hoch',
            titel: 'Provisionssumme deutlich erhöht',
            beschreibung: 'Die Gesamtprovision ist um 42% gegenüber dem Vorjahresmonat gestiegen (von 48.000€ auf 68.000€), bei gleichzeitig leicht rückläufiger Vertragsanzahl (-8%).',
            betroffene_daten: {
              aktuell: 68000,
              referenz: 48000,
              abweichung: '+42%'
            },
            empfehlung: 'Prüfung der Einzelverträge auf außergewöhnlich hohe Abschlussprovisionen empfohlen. Insbesondere Sparte Leben zeigt starke Zunahme.'
          },
          {
            id: UTILS.generateId(),
            kategorie: 'Branchenbenchmark',
            schweregrad: 'mittel',
            titel: 'Überdurchschnittliche Provision pro Vertrag',
            beschreibung: 'Die durchschnittliche Provision pro Vertrag beträgt 179€, was 35% über dem historischen Mittelwert liegt.',
            betroffene_daten: {
              aktuell: 179,
              referenz: 133,
              abweichung: '+35%'
            },
            empfehlung: 'Prüfen Sie, ob vermehrt hochwertige Lebensversicherungen abgeschlossen wurden.'
          }
        ],
        kennzahlen_vergleich: {
          provisionssumme: { aktuell: 68000, vorperiode: 48000, veraenderung_prozent: 41.7 },
          vertragsanzahl: { aktuell: 380, vorperiode: 412, veraenderung_prozent: -7.8 },
          stornoquote: { aktuell: 6.2, vorperiode: 6.5, veraenderung_prozentpunkte: -0.3 }
        },
        handlungsempfehlung: 'Prüfung empfohlen',
        details: 'Ungewöhnliche Konstellation: stark steigende Provision bei sinkender Vertragszahl.'
      }
    },

    new_agency: {
      name: 'Neue Agentur',
      agentur_id: '008',
      agentur_name: 'Neumann Finanzberatung',
      periode: '2025-01',
      extracted_data: {
        provisionssumme_gesamt: 15000,
        provisionssumme_sparten: {
          leben: 5000,
          sach: 6000,
          kranken: 2500,
          kfz: 1500
        },
        vertragsanzahl_gesamt: 85,
        vertragsanzahl_sparten: {
          leben: 15,
          sach: 40,
          kranken: 20,
          kfz: 10
        },
        stornoquote_gesamt: 0,
        stornoquote_sparten: {
          leben: 0,
          sach: 0,
          kranken: 0,
          kfz: 0
        },
        neugeschaeft_provision: 15000,
        bestand_provision: 0,
        bonuszahlungen: 0,
        auszahlungsbetrag: 15000,
        auszahlungsdatum: '2025-02-01'
      },
      ki_analyse: {
        agentur_id: '008',
        agentur_name: 'Neumann Finanzberatung',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 1,
        risiko_kategorie: 'gruen',
        zusammenfassung: 'Erste Abrechnung für diese Agentur. Alle Werte im Rahmen der Branchenbenchmarks für Neugeschäft.',
        auffaelligkeiten: [],
        kennzahlen_vergleich: {
          provisionssumme: { aktuell: 15000, vorperiode: 0, veraenderung_prozent: 0 },
          vertragsanzahl: { aktuell: 85, vorperiode: 0, veraenderung_prozent: 0 },
          stornoquote: { aktuell: 0, vorperiode: 0, veraenderung_prozentpunkte: 0 }
        },
        handlungsempfehlung: 'Keine Maßnahme erforderlich',
        details: 'Erstes Reporting - historischer Vergleich nicht möglich. Provisionsstruktur entspricht typischem Neugeschäft.'
      }
    },

    critical: {
      name: 'Kritische Auffälligkeiten',
      agentur_id: '005',
      agentur_name: 'Finanz-Profi GmbH',
      periode: '2025-01',
      extracted_data: {
        provisionssumme_gesamt: 125000,
        provisionssumme_sparten: {
          leben: 60000,
          sach: 35000,
          kranken: 20000,
          kfz: 10000
        },
        vertragsanzahl_gesamt: 280,
        vertragsanzahl_sparten: {
          leben: 80,
          sach: 100,
          kranken: 60,
          kfz: 40
        },
        stornoquote_gesamt: 18.5,
        stornoquote_sparten: {
          leben: 22.3,
          sach: 17.1,
          kranken: 15.8,
          kfz: 19.2
        },
        neugeschaeft_provision: 90000,
        bestand_provision: 35000,
        bonuszahlungen: 5000,
        auszahlungsbetrag: 120000,
        auszahlungsdatum: '2025-02-10'
      },
      ki_analyse: {
        agentur_id: '005',
        agentur_name: 'Finanz-Profi GmbH',
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: 5,
        risiko_kategorie: 'rot',
        zusammenfassung: 'Mehrere kritische Auffälligkeiten: Extrem hohe Stornoquote, ungewöhnlich hohe Provisionen, unplausibles Neugeschäft/Bestand-Verhältnis.',
        auffaelligkeiten: [
          {
            id: UTILS.generateId(),
            kategorie: 'Anomalie',
            schweregrad: 'kritisch',
            titel: 'Extrem hohe Stornoquote',
            beschreibung: 'Die Stornoquote von 18.5% liegt massiv über dem Branchendurchschnitt (<10%) und über dem historischen Durchschnitt dieser Agentur (7.2%). Besonders kritisch in Sparte Leben mit 22.3%.',
            betroffene_daten: {
              aktuell: 18.5,
              referenz: 7.2,
              abweichung: '+11.3 Prozentpunkte'
            },
            empfehlung: 'Sofortige detaillierte Prüfung erforderlich. Mögliche Hinweise auf Churn-Problematik, Qualitätsprobleme im Vertrieb oder unzulässige Verkaufspraktiken.'
          },
          {
            id: UTILS.generateId(),
            kategorie: 'Mathematische Validierung',
            schweregrad: 'hoch',
            titel: 'Unplausibles Provisions-Vertrags-Verhältnis',
            beschreibung: 'Durchschnittsprovision pro Vertrag beträgt 446€, was 180% über dem historischen Mittel liegt. Dies ist bei sinkender Vertragszahl besonders bedenklich.',
            betroffene_daten: {
              aktuell: 446,
              referenz: 160,
              abweichung: '+180%'
            },
            empfehlung: 'Prüfung auf Eingabefehler, Doppelerfassungen oder ungewöhnliche Großverträge.'
          },
          {
            id: UTILS.generateId(),
            kategorie: 'Branchenbenchmark',
            schweregrad: 'kritisch',
            titel: 'Neugeschäft-Quote extrem hoch',
            beschreibung: 'Neugeschäft macht 72% der Gesamtprovision aus (Normalbereich: 30-40%). Bei gleichzeitig hoher Stornoquote deutet dies auf Churning hin.',
            betroffene_daten: {
              aktuell: '72%',
              referenz: '30-40%',
              abweichung: '+32-42 Prozentpunkte'
            },
            empfehlung: 'Dringende Compliance-Prüfung: Werden bewusst Verträge gekündigt und neu abgeschlossen, um höhere Abschlussprovisionen zu generieren?'
          }
        ],
        kennzahlen_vergleich: {
          provisionssumme: { aktuell: 125000, vorperiode: 45000, veraenderung_prozent: 177.8 },
          vertragsanzahl: { aktuell: 280, vorperiode: 412, veraenderung_prozent: -32.0 },
          stornoquote: { aktuell: 18.5, vorperiode: 7.2, veraenderung_prozentpunkte: 11.3 }
        },
        handlungsempfehlung: 'Sofortige Prüfung erforderlich',
        details: 'Mehrfach kritische Konstellation. Kombination aus hoher Stornoquote, sinkendem Bestand und extrem hohem Neugeschäft erfordert sofortige Klärung.'
      }
    }
  },

  /**
   * Generiert gemischtes Demo-Szenario
   */
  generateMixedScenario() {
    const agenturen = [
      { id: '001', name: 'Mustermann Versicherungen GmbH', risk: 1 },
      { id: '002', name: 'Schmidt & Partner AG', risk: 3 },
      { id: '003', name: 'Weber Finanzberatung', risk: 1 },
      { id: '004', name: 'Fischer Versicherungsmakler', risk: 2 },
      { id: '005', name: 'Finanz-Profi GmbH', risk: 5 },
      { id: '006', name: 'Becker & Co KG', risk: 2 },
      { id: '007', name: 'Hoffmann Versicherungen', risk: 1 },
      { id: '008', name: 'Neumann Finanzberatung', risk: 1 },
      { id: '009', name: 'Schulz Maklerservice', risk: 3 },
      { id: '010', name: 'Meyer Insurance Group', risk: 2 },
    ];

    return agenturen.map(ag => this._generateRandomAbrechnung(ag));
  },

  /**
   * Generiert zufällige Abrechnung
   */
  _generateRandomAbrechnung(agentur) {
    const baseProvision = 30000 + Math.random() * 70000;
    const baseVertraege = 200 + Math.floor(Math.random() * 400);
    const baseStorno = 5 + Math.random() * (agentur.risk === 5 ? 15 : 5);

    const extracted_data = {
      provisionssumme_gesamt: Math.round(baseProvision),
      provisionssumme_sparten: {
        leben: Math.round(baseProvision * 0.3),
        sach: Math.round(baseProvision * 0.35),
        kranken: Math.round(baseProvision * 0.2),
        kfz: Math.round(baseProvision * 0.15),
      },
      vertragsanzahl_gesamt: baseVertraege,
      vertragsanzahl_sparten: {
        leben: Math.floor(baseVertraege * 0.2),
        sach: Math.floor(baseVertraege * 0.4),
        kranken: Math.floor(baseVertraege * 0.25),
        kfz: Math.floor(baseVertraege * 0.15),
      },
      stornoquote_gesamt: Math.round(baseStorno * 10) / 10,
      stornoquote_sparten: {
        leben: Math.round(baseStorno * 0.9 * 10) / 10,
        sach: Math.round(baseStorno * 1.1 * 10) / 10,
        kranken: Math.round(baseStorno * 0.95 * 10) / 10,
        kfz: Math.round(baseStorno * 1.05 * 10) / 10,
      },
      neugeschaeft_provision: Math.round(baseProvision * 0.4),
      bestand_provision: Math.round(baseProvision * 0.6),
    };

    const risiko_kategorie = UTILS.getRiskCategory(agentur.risk);

    return {
      agentur_id: agentur.id,
      agentur_name: agentur.name,
      periode: '2025-01',
      extracted_data: extracted_data,
      ki_analyse: {
        agentur_id: agentur.id,
        agentur_name: agentur.name,
        abrechnungsperiode: '2025-01',
        analyse_datum: new Date().toISOString(),
        risiko_score: agentur.risk,
        risiko_kategorie: risiko_kategorie,
        zusammenfassung: this._getRandomSummary(agentur.risk),
        auffaelligkeiten: [],
        kennzahlen_vergleich: {},
        handlungsempfehlung: this._getRecommendation(agentur.risk),
        details: 'Demo-Daten',
      }
    };
  },

  _getRandomSummary(risk) {
    const summaries = {
      1: 'Keine Auffälligkeiten. Normale Geschäftsentwicklung.',
      2: 'Leichte Abweichungen, die beobachtet werden sollten.',
      3: 'Mehrere Auffälligkeiten erkannt, Prüfung empfohlen.',
      5: 'Kritische Auffälligkeiten, sofortige Prüfung erforderlich.',
    };
    return summaries[risk] || summaries[2];
  },

  _getRecommendation(risk) {
    const recommendations = {
      1: 'Keine Maßnahme erforderlich',
      2: 'Beobachten',
      3: 'Prüfung empfohlen',
      5: 'Sofortige Prüfung erforderlich',
    };
    return recommendations[risk] || recommendations[2];
  }
};

/**
 * Demo-Modus Controller
 */
class DemoMode {
  constructor() {
    this.active = false;
  }

  /**
   * Lädt Demo-Szenario (erweitert für hierarchische Szenarien)
   */
  async loadScenario(scenarioKey) {
    this.active = true;

    // ALLE HIERARCHISCHEN SZENARIEN
    if (scenarioKey === 'all_hierarchical') {
      return await this.loadAllHierarchicalScenarios();
    }

    // NEUE HIERARCHISCHE SZENARIEN
    if (DEMO_DATA.hierarchical_scenarios[scenarioKey]) {
      return await this.loadHierarchicalScenario(scenarioKey);
    }

    if (scenarioKey === 'mixed') {
      // Lade gemischtes Szenario
      const abrechnungen = DEMO_DATA.generateMixedScenario();

      for (const abr of abrechnungen) {
        await db.saveAbrechnung({
          ...abr,
          upload_datum: new Date().toISOString(),
          pdf_name: `Demo_${abr.agentur_id}_2025-01.pdf`,
          metadaten: {
            demo_mode: true,
            verarbeitet_am: new Date().toISOString(),
            verarbeitungsdauer_ms: 0,
          }
        });

        await UTILS.sleep(100); // Kleine Verzögerung
      }

      return abrechnungen.length;

    } else {
      // Lade einzelnes Szenario
      const scenario = DEMO_DATA.scenarios[scenarioKey];

      if (!scenario) {
        throw new Error('Unbekanntes Szenario');
      }

      await db.saveAbrechnung({
        ...scenario,
        upload_datum: new Date().toISOString(),
        pdf_name: `Demo_${scenario.agentur_id}_2025-01.pdf`,
        metadaten: {
          demo_mode: true,
          verarbeitet_am: new Date().toISOString(),
          verarbeitungsdauer_ms: 0,
        }
      });

      return 1;
    }
  }

  /**
   * Lädt hierarchisches Szenario mit mehreren Abrechnungen
   */
  async loadHierarchicalScenario(scenarioKey) {
    const scenario = DEMO_DATA.hierarchical_scenarios[scenarioKey];
    let count = 0;

    // Szenarien mit mehreren Agenturen (superprovision_violation, omnikanal_kickback)
    if (scenario.agenturen && Array.isArray(scenario.agenturen)) {
      for (const agentur of scenario.agenturen) {
        await db.saveAbrechnung({
          ...agentur,
          upload_datum: new Date().toISOString(),
          pdf_name: `Demo_${agentur.vermittler_nummer.replace('/', '_')}_${agentur.periode}.pdf`,
          metadaten: {
            demo_mode: true,
            hierarchical_scenario: true,
            scenario_key: scenarioKey,
            scenario_name: scenario.name,
            rolle: agentur.rolle,
            verarbeitet_am: new Date().toISOString(),
            verarbeitungsdauer_ms: 0,
          }
        });
        count++;
        await UTILS.sleep(100);
      }

      // Speichere combined_analysis separat (für spätere Analyse)
      if (scenario.combined_analysis) {
        await db.saveAbrechnung({
          agentur_id: `${scenario.agenturen[0].agentur_id}_COMBINED`,
          agentur_name: `${scenario.name} - Kombinierte Analyse`,
          periode: scenario.agenturen[0].periode,
          extracted_data: {
            scenario_type: 'combined_analysis',
            base_agenturen: scenario.agenturen.map(a => ({
              id: a.agentur_id,
              vermittler: a.vermittler_nummer,
              name: a.agentur_name
            }))
          },
          ki_analyse: scenario.combined_analysis,
          upload_datum: new Date().toISOString(),
          pdf_name: `Demo_Combined_${scenarioKey}.pdf`,
          metadaten: {
            demo_mode: true,
            hierarchical_scenario: true,
            scenario_key: scenarioKey,
            is_combined_analysis: true,
            verarbeitet_am: new Date().toISOString(),
            verarbeitungsdauer_ms: 0,
          }
        });
        count++;
      }
    }
    // Szenarien mit einzelner Agentur (storno_clustering, umdeckungen, storno_neuabschluss)
    else {
      await db.saveAbrechnung({
        agentur_id: scenario.agentur_id,
        vermittler_nummer: scenario.vermittler_nummer,
        agentur_name: scenario.agentur_name,
        periode: scenario.periode,
        extracted_data: scenario.extracted_data,
        ki_analyse: scenario.ki_analyse,
        upload_datum: new Date().toISOString(),
        pdf_name: `Demo_${scenario.vermittler_nummer.replace('/', '_')}_${scenario.periode}.pdf`,
        metadaten: {
          demo_mode: true,
          hierarchical_scenario: true,
          scenario_key: scenarioKey,
          scenario_name: scenario.name,
          verarbeitet_am: new Date().toISOString(),
          verarbeitungsdauer_ms: 0,
        }
      });
      count++;
    }

    return count;
  }

  /**
   * Lädt ALLE hierarchischen Szenarien (für Demo-Dashboard)
   */
  async loadAllHierarchicalScenarios() {
    let totalCount = 0;

    for (const scenarioKey of Object.keys(DEMO_DATA.hierarchical_scenarios)) {
      const count = await this.loadHierarchicalScenario(scenarioKey);
      totalCount += count;
      await UTILS.sleep(200);
    }

    return totalCount;
  }

  /**
   * Generiert Übersicht über verfügbare Szenarien
   */
  getAvailableScenarios() {
    const klassisch = Object.keys(DEMO_DATA.scenarios).map(key => ({
      key: key,
      name: DEMO_DATA.scenarios[key].name,
      type: 'klassisch'
    }));

    const hierarchisch = Object.keys(DEMO_DATA.hierarchical_scenarios).map(key => ({
      key: key,
      name: DEMO_DATA.hierarchical_scenarios[key].name,
      beschreibung: DEMO_DATA.hierarchical_scenarios[key].beschreibung,
      type: 'hierarchisch'
    }));

    return {
      klassisch: klassisch,
      hierarchisch: hierarchisch,
      mixed: {
        key: 'mixed',
        name: 'Gemischtes Szenario (10 Agenturen)',
        type: 'mixed'
      }
    };
  }

  deactivate() {
    this.active = false;
  }
}

// Singleton-Instanz
const demoMode = new DemoMode();
