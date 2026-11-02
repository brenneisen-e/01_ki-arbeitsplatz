// Vollstaendige Kundenakten - 1:1 uebernommen aus dem Legacy-Tool
// (js/banken-customer-detail.js, Funktion getFullCustomerData).

import { getKurzfall } from './customers.js';

export const CUSTOMER_DETAILS = {
        'K-2024-0001': {
            // Stammdaten
            name: 'Mueller GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
            adresse: 'Musterstraße 123, 38100 Braunschweig', telefon: '+49 531 123456',
            email: 'info@mueller-gmbh.de', ansprechpartner: 'Hans Mueller',
            branche: 'Gastronomie', restschuld: 125000, status: 'Inkasso',
            // Konten & Finanzen
            krediteAnzahl: 3, gesamtforderung: 350500, monatsrate: 2380, ueberfaellig: 4760,
            rueckgabequote: 34, hauptforderung: 110000, zinsen: 8450, mahngebuehren: 350, inkassokosten: 6200,
            dpd: 35,
            // Einkommen & Ausgaben (Gewerbe)
            einkommenMonatlich: 45000, ausgabenMonatlich: 52000, ausgabenDetails: 'Personal: €28.000, Miete: €8.500, Wareneinkauf: €12.000, Sonstiges: €3.500',
            // KI-Analyse
            willingness: 25, ability: 60, segment: 'eskalation',
            kernproblem: 'Gewerbekunde mit Liquiditätsengpässen seit Q3 2025. Gastronomie-Branche mit saisonalen Schwankungen. Monatliche Ausgaben (€52.000) übersteigen Einnahmen (€45.000) um €7.000. Mehrfache Lastschriftrückgaben trotz grundsätzlicher Zahlungsfähigkeit.',
            // Kommunikation
            workflowStatus: 'Inkasso-Verfahren', mahnstufe: 3,
            // Transaktionshistorie für diesen Kunden (Inkasso)
            transaktionen: [
                { datum: '14.11.2025', beschreibung: 'Monatliche Rate - Fällig', betrag: -2380, status: 'ueberfaellig' },
                { datum: '14.10.2025', beschreibung: 'Monatliche Rate - Fällig', betrag: -2380, status: 'ueberfaellig' },
                { datum: '18.09.2025', beschreibung: 'Lastschrift zurückgebucht', betrag: -2380, status: 'rueckgabe' },
                { datum: '01.09.2025', beschreibung: 'Teilzahlung', betrag: 1500, status: 'gebucht' },
                { datum: '15.08.2025', beschreibung: 'Lastschrift zurückgebucht', betrag: -2380, status: 'rueckgabe' }
            ],
            produkte: [
                { typ: 'Betriebsmittelkredit', nummer: 'BMK-2023-1001', saldo: 125000, status: '35 DPD', badge: 'danger' },
                { typ: 'Kontokorrentkredit', nummer: 'KKK-2024-2345', saldo: 85000, status: 'Überzogen', badge: 'danger' },
                { typ: 'Investitionskredit', nummer: 'IK-2022-0891', saldo: 140500, status: '28 DPD', badge: 'warning' }
            ],
            // Haushaltsrechnung (Gewerbe)
            haushalt: {
                einnahmen: { gehalt: 45000, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 8500, nebenkosten: 2200, versicherung: 1800, kredite: 2380, abos: 450 },
                lebenshaltung: { essen: 0, mobilitaet: 3500, gesundheit: 0, freizeit: 0, sonstige: 33170 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '15.03.2026', versicherungen: false, investments: false },
                externeKonten: [
                    { institut: 'Sparkasse Braunschweig', produkt: 'Geschäftskonto', saldo: -12500, rate: 0, status: 'Überzogen' },
                    { institut: 'Deutsche Bank', produkt: 'Leasing Küchengeräte', saldo: 28000, rate: 850, status: 'Aktiv' }
                ],
                externeVersicherungen: [
                    { anbieter: 'Allianz', produkt: 'Betriebshaftpflicht', beitrag: 320, beginn: '01.01.2020', hinweis: '' },
                    { anbieter: 'Signal Iduna', produkt: 'Inhaltsversicherung', beitrag: 180, beginn: '15.06.2018', hinweis: '' }
                ]
            }
        },
        'K-2024-7234': {
            name: 'Braun, Thomas', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Lindenweg 45, 30159 Hannover', telefon: '+49 511 987654',
            email: 't.braun@email.de', ansprechpartner: 'Thomas Braun',
            branche: 'Angestellter', restschuld: 289350, status: 'Aktiv',
            statusBadge: 'warning', statusText: 'Überfällige Forderung beglichen am 16.12.2025',
            krediteAnzahl: 3, gesamtforderung: 289350, monatsrate: 1765, ueberfaellig: 0,
            rueckgabequote: 0, hauptforderung: 289350, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 90, ability: 85, segment: 'stabil',
            // Letzte Zahlung (für Zahlungseingänge-Widget)
            letzteZahlung: { betrag: 1890, datum: '16.12.2025', typ: 'Ratenkredit Tilgung' },
            // Einkommen & Ausgaben (Privat)
            einkommenMonatlich: 4200, ausgabenMonatlich: 3800, ausgabenDetails: 'Miete: €0 (Eigentum), Baufi-Rate: €1.450, Auto: €650, Versicherungen: €380, Lebensmittel: €520, Sonstiges: €800',
            kernproblem: 'Ratenkredit vollständig beglichen (€1.890 am 16.12.). Nettoeinkommen €4.200, Ausgaben €3.800. Baufinanzierung €285.000 Restschuld mit €1.450/M Rate. Dispo €4.500 ausgeschöpft.',
            workflowStatus: 'Monitoring', mahnstufe: 0,
            // Transaktionshistorie - passend zu den Produkten
            transaktionen: [
                { datum: '16.12.2025', beschreibung: 'Ratenkredit vollständig getilgt', betrag: 1890, status: 'gebucht' },
                { datum: '01.12.2025', beschreibung: 'Baufinanzierung Monatsrate', betrag: 1450, status: 'gebucht' },
                { datum: '01.11.2025', beschreibung: 'Baufinanzierung Monatsrate', betrag: 1450, status: 'gebucht' },
                { datum: '01.10.2025', beschreibung: 'Ratenkredit Rate', betrag: 315, status: 'gebucht' }
            ],
            produkte: [
                { typ: 'Ratenkredit', nummer: 'RK-2023-8841', saldo: 0, status: 'Beglichen', badge: 'success', letzteZahlung: 1890 },
                { typ: 'Dispositionskredit', nummer: 'DK-2024-1122', saldo: 4500, limit: 10000, status: 'Aktiv', badge: 'warning' },
                { typ: 'Baufinanzierung', nummer: 'BF-2021-5567', saldo: 285000, rate: 1450, status: 'Aktiv', badge: 'info' }
            ],
            // Haushaltsrechnung (Privat - Angestellter)
            haushalt: {
                einnahmen: { gehalt: 4200, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 0, nebenkosten: 380, versicherung: 380, kredite: 1450, abos: 85 },
                lebenshaltung: { essen: 520, mobilitaet: 650, gesundheit: 45, freizeit: 180, sonstige: 110 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '15.12.2026', versicherungen: true, investments: false },
                externeKonten: [
                    { institut: 'ING DiBa', produkt: 'Extra-Konto (Tagesgeld)', saldo: 8500, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: [
                    { anbieter: 'HUK-Coburg', produkt: 'KFZ-Versicherung', beitrag: 68, beginn: '01.03.2022', hinweis: '' },
                    { anbieter: 'ERGO', produkt: 'Hausratversicherung', beitrag: 18, beginn: '01.07.2021', hinweis: '' },
                    { anbieter: 'Debeka', produkt: 'Risikolebensversicherung', beitrag: 35, beginn: '15.01.2020', hinweis: 'Zur Baufinanzierung' }
                ]
            }
        },
        'K-2024-6891': {
            name: 'Klein KG', type: 'Gewerbe', rechtsform: 'KG',
            adresse: 'Industriestraße 78, 40210 Düsseldorf', telefon: '+49 211 456789',
            email: 'info@klein-kg.de', ansprechpartner: 'Peter Klein',
            branche: 'Großhandel', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Ratenvereinbarung erfüllt am 19.12.2025',
            krediteAnzahl: 2, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 85, ability: 75, segment: 'abgeschlossen',
            // Letzte Zahlung (für Zahlungseingänge-Widget)
            letzteZahlung: { betrag: 3400, datum: '19.12.2025', typ: 'Ratenvereinbarung' },
            // Einkommen & Ausgaben (Gewerbe)
            einkommenMonatlich: 125000, ausgabenMonatlich: 98000, ausgabenDetails: 'Personal: €42.000, Lager: €15.000, Transport: €28.000, Verwaltung: €8.000, Sonstiges: €5.000',
            kernproblem: 'Fall abgeschlossen. Letzte Rate €3.400 heute eingegangen (Ratenvereinbarung). Beide Kredite vollständig getilgt. Gute Bonität für Folgegeschäft.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0,
            produkte: [
                { typ: 'Betriebsmittelkredit', nummer: 'BMK-2022-4456', saldo: 0, status: 'Beglichen', badge: 'success', letzteZahlung: 3400 },
                { typ: 'Investitionskredit', nummer: 'IK-2021-7823', saldo: 0, status: 'Beglichen', badge: 'success' }
            ],
            // Haushaltsrechnung (Gewerbe - Großhandel)
            haushalt: {
                einnahmen: { gehalt: 125000, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 15000, nebenkosten: 3500, versicherung: 4200, kredite: 0, abos: 1800 },
                lebenshaltung: { essen: 0, mobilitaet: 28000, gesundheit: 0, freizeit: 0, sonstige: 45500 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.06.2026', versicherungen: true, investments: false },
                externeKonten: [
                    { institut: 'Volksbank Düsseldorf', produkt: 'Geschäftskonto', saldo: 45000, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: [
                    { anbieter: 'Gothaer', produkt: 'Geschäftsinhaltsvers.', beitrag: 450, beginn: '01.04.2019', hinweis: '' },
                    { anbieter: 'AXA', produkt: 'Transportversicherung', beitrag: 680, beginn: '15.02.2020', hinweis: '' }
                ]
            }
        },
        'K-2024-6234': {
            name: 'Danzig, Sabine', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Rosenstraße 12, 50667 Köln', telefon: '+49 221 334455',
            email: 's.danzig@web.de', ansprechpartner: 'Sabine Danzig',
            branche: 'Rentnerin', restschuld: 3200, status: 'Aktiv',
            statusBadge: 'warning', statusText: 'Teilzahlung €780 eingegangen am 18.12.2025',
            krediteAnzahl: 2, gesamtforderung: 3200, monatsrate: 180, ueberfaellig: 0,
            rueckgabequote: 75, hauptforderung: 3200, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 80, ability: 50, segment: 'stabil',
            // Letzte Zahlung (für Zahlungseingänge-Widget)
            letzteZahlung: { betrag: 780, datum: '18.12.2025', typ: 'Teilzahlung' },
            // Einkommen & Ausgaben (Privat - Rentnerin)
            einkommenMonatlich: 1450, ausgabenMonatlich: 1380, ausgabenDetails: 'Miete: €520, Lebensmittel: €280, Medikamente: €95, Versicherungen: €145, Enkel-Geschenke: €120, Sonstiges: €220',
            kernproblem: 'Teilzahlung €780 gestern eingegangen. Kreditkartenschuld beglichen. Ratenkredit (€3.200) noch offen mit €180/Monat Rate. Knappe Rente €1.450, Ausgaben €1.380. Hohe Kooperationsbereitschaft.',
            // Transaktionshistorie
            transaktionen: [
                { datum: '18.12.2025', beschreibung: 'Kreditkarte vollständig beglichen', betrag: 780, status: 'gebucht' },
                { datum: '01.12.2025', beschreibung: 'Ratenkredit Rate', betrag: 180, status: 'gebucht' },
                { datum: '01.11.2025', beschreibung: 'Ratenkredit Rate', betrag: 180, status: 'gebucht' },
                { datum: '01.10.2025', beschreibung: 'Ratenkredit Rate', betrag: 180, status: 'gebucht' }
            ],
            workflowStatus: 'Monitoring', mahnstufe: 0,
            produkte: [
                { typ: 'Kreditkarte', nummer: 'KK-2023-6678', saldo: 0, status: 'Beglichen', badge: 'success', letzteZahlung: 780 },
                { typ: 'Ratenkredit', nummer: 'RK-2024-1234', saldo: 3200, status: 'Aktiv', badge: 'warning' }
            ],
            // Haushaltsrechnung (Privat - Rentnerin)
            haushalt: {
                einnahmen: { gehalt: 1450, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 520, nebenkosten: 85, versicherung: 145, kredite: 180, abos: 35 },
                lebenshaltung: { essen: 280, mobilitaet: 45, gesundheit: 95, freizeit: 25, sonstige: 40 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.09.2026', versicherungen: false, investments: false },
                externeKonten: [
                    { institut: 'Sparkasse Köln', produkt: 'Sparkonto', saldo: 3200, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: []
            }
        },
        'K-2024-5982': {
            name: 'Meier, Stefan', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Hauptstraße 56, 80331 München', telefon: '+49 89 112233',
            email: 's.meier@gmx.de', ansprechpartner: 'Stefan Meier',
            branche: 'Selbstständig', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Dispo vollständig ausgeglichen',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 75, ability: 70, segment: 'abgeschlossen',
            // Einkommen & Ausgaben (Selbstständig)
            einkommenMonatlich: 5800, ausgabenMonatlich: 4200, ausgabenDetails: 'Miete Büro: €800, Miete Wohnung: €1.400, Lebensmittel: €350, Betriebskosten: €650, Auto: €580, Sonstiges: €420',
            kernproblem: 'Fall vollständig abgeschlossen. Dispo ausgeglichen. Selbstständiger Grafiker mit variabler Auftragslage. Einkommen Ø €5.800, Ausgaben €4.200. Finanzpuffer jetzt wieder aufgebaut.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0,
            produkte: [
                { typ: 'Dispositionskredit', nummer: 'DK-2024-3321', saldo: 0, status: 'Ausgeglichen', badge: 'success' }
            ],
            // Haushaltsrechnung (Privat - Selbstständig)
            haushalt: {
                einnahmen: { gehalt: 5800, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 2200, nebenkosten: 280, versicherung: 480, kredite: 0, abos: 120 },
                lebenshaltung: { essen: 350, mobilitaet: 580, gesundheit: 65, freizeit: 220, sonstige: 105 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '15.11.2026', versicherungen: true, investments: true },
                externeKonten: [
                    { institut: 'N26', produkt: 'Geschäftskonto', saldo: 4200, rate: 0, status: 'Aktiv' },
                    { institut: 'Trade Republic', produkt: 'Depot', saldo: 12500, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: [
                    { anbieter: 'Hiscox', produkt: 'Berufshaftpflicht', beitrag: 45, beginn: '01.01.2022', hinweis: '' }
                ]
            }
        },
        'K-2024-5876': {
            name: 'Schneider Logistik GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
            adresse: 'Hafenstraße 200, 20457 Hamburg', telefon: '+49 40 778899',
            email: 'info@schneider-logistik.de', ansprechpartner: 'Klaus Schneider',
            branche: 'Transport & Logistik', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Alle Kredite vollständig beglichen',
            krediteAnzahl: 3, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 80, ability: 85, segment: 'abgeschlossen',
            // Einkommen & Ausgaben (Gewerbe)
            einkommenMonatlich: 890000, ausgabenMonatlich: 795000, ausgabenDetails: 'Personal: €320.000, Fahrzeugkosten: €185.000, Treibstoff: €142.000, Versicherungen: €78.000, Verwaltung: €45.000, Sonstiges: €25.000',
            kernproblem: 'Fall vollständig abgeschlossen. Alle 3 Kredite beglichen. Gesunde Finanzsituation: Umsatz €890.000/Monat, Kosten €795.000 = Gewinnmarge ~11%.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0,
            produkte: [
                { typ: 'Kontokorrentkredit', nummer: 'KKK-2023-5544', saldo: 0, status: 'Beglichen', badge: 'success' },
                { typ: 'Betriebsmittelkredit', nummer: 'BMK-2022-1123', saldo: 0, status: 'Beglichen', badge: 'success' },
                { typ: 'Leasing LKW-Flotte', nummer: 'LK-2021-8890', saldo: 0, status: 'Beglichen', badge: 'success' }
            ],
            // Haushaltsrechnung (Gewerbe - Transport & Logistik)
            haushalt: {
                einnahmen: { gehalt: 890000, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 45000, nebenkosten: 18000, versicherung: 78000, kredite: 0, abos: 8500 },
                lebenshaltung: { essen: 0, mobilitaet: 327000, gesundheit: 0, freizeit: 0, sonstige: 318500 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.08.2026', versicherungen: true, investments: false },
                externeKonten: [
                    { institut: 'Deutsche Bank', produkt: 'Firmenkonto', saldo: 185000, rate: 0, status: 'Aktiv' },
                    { institut: 'Commerzbank', produkt: 'Kreditlinie', saldo: 0, rate: 0, status: 'Ungenutzt' }
                ],
                externeVersicherungen: [
                    { anbieter: 'Zurich', produkt: 'Flottenversicherung', beitrag: 4500, beginn: '01.01.2019', hinweis: '45 Fahrzeuge' },
                    { anbieter: 'HDI', produkt: 'Betriebshaftpflicht', beitrag: 1200, beginn: '15.03.2018', hinweis: '' }
                ]
            }
        },
        'K-2024-5734': {
            name: 'Fischer, Anna', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Gartenweg 8, 70173 Stuttgart', telefon: '+49 711 223344',
            email: 'a.fischer@outlook.de', ansprechpartner: 'Anna Fischer',
            branche: 'Beamtin', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Kreditkarte beglichen',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 95, ability: 90, segment: 'abgeschlossen',
            // Einkommen & Ausgaben (Beamtin A12)
            einkommenMonatlich: 3450, ausgabenMonatlich: 2680, ausgabenDetails: 'Miete: €950, Lebensmittel: €380, Auto: €420, Versicherungen: €280, Sparen: €400, Sonstiges: €250',
            kernproblem: 'Fall abgeschlossen. Beamtin mit sicherem Einkommen (€3.450 netto) hat Kreditkarte vollständig beglichen. Solide Finanzführung mit €770 monatl. Überschuss.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0,
            produkte: [
                { typ: 'Kreditkarte', nummer: 'KK-2024-4421', saldo: 0, status: 'Beglichen', badge: 'success' }
            ],
            // Haushaltsrechnung (Privat - Beamtin)
            haushalt: {
                einnahmen: { gehalt: 3450, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 950, nebenkosten: 120, versicherung: 280, kredite: 0, abos: 65 },
                lebenshaltung: { essen: 380, mobilitaet: 420, gesundheit: 35, freizeit: 180, sonstige: 250 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.10.2026', versicherungen: true, investments: true },
                externeKonten: [
                    { institut: 'BW-Bank', produkt: 'Sparkonto', saldo: 18500, rate: 0, status: 'Aktiv' },
                    { institut: 'DKB', produkt: 'Tagesgeld', saldo: 5200, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: [
                    { anbieter: 'Debeka', produkt: 'Private Krankenvers.', beitrag: 180, beginn: '01.01.2018', hinweis: 'Beihilfeergänzung' },
                    { anbieter: 'R+V', produkt: 'Hausratversicherung', beitrag: 12, beginn: '01.05.2020', hinweis: '' }
                ]
            }
        },
        'K-2024-5612': {
            name: 'Bäckerei Müller', type: 'Gewerbe', rechtsform: 'Einzelunternehmen',
            adresse: 'Marktplatz 3, 60311 Frankfurt', telefon: '+49 69 445566',
            email: 'info@baeckerei-mueller.de', ansprechpartner: 'Werner Müller',
            branche: 'Lebensmittel / Gastronomie', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Investitionskredit vollständig getilgt',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 85, ability: 80, segment: 'abgeschlossen',
            // Einkommen & Ausgaben (Bäckerei)
            einkommenMonatlich: 38000, ausgabenMonatlich: 34500, ausgabenDetails: 'Personal: €14.000, Rohstoffe: €9.500, Miete: €3.200, Energie: €2.800, Sonstiges: €5.000',
            kernproblem: 'Fall abgeschlossen. Bäckerei mit stabilem Umsatz (€38.000/Monat) hat Investitionskredit nach Restrukturierung vollständig getilgt. Gewinnmarge ~9%.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0,
            produkte: [
                { typ: 'Investitionskredit', nummer: 'IK-2022-3345', saldo: 0, status: 'Getilgt', badge: 'success' }
            ],
            // Haushaltsrechnung (Gewerbe - Bäckerei)
            haushalt: {
                einnahmen: { gehalt: 38000, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 3200, nebenkosten: 2800, versicherung: 580, kredite: 0, abos: 320 },
                lebenshaltung: { essen: 9500, mobilitaet: 850, gesundheit: 0, freizeit: 0, sonstige: 17250 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '15.07.2026', versicherungen: false, investments: false },
                externeKonten: [
                    { institut: 'Frankfurter Sparkasse', produkt: 'Geschäftskonto', saldo: 12400, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: []
            }
        },
        'K-2024-8847': {
            name: 'Müller, Hans', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Waldstraße 22, 38100 Braunschweig', telefon: '+49 531 998877',
            email: 'h.mueller@email.de', ansprechpartner: 'Hans Müller',
            branche: 'Angestellter', restschuld: 4230, status: 'Offen',
            krediteAnzahl: 1, gesamtforderung: 4230, monatsrate: 180, ueberfaellig: 180,
            rueckgabequote: 0, hauptforderung: 4000, zinsen: 180, mahngebuehren: 50, inkassokosten: 0,
            dpd: 18, willingness: 85, ability: 70, segment: 'prioritaet',
            zahlungsziel: '01.12.2025',
            // Zahlungszusage aus Telefonat
            zahlungszusage: { betrag: 180, datum: '23.12.2025', status: 'offen', vereinbart: '17.12.2025', notiz: 'Kunde zahlt überfällige Dezember-Rate (€180) nach Gehaltseingang am 23.12.' },
            // Einkommen & Ausgaben (Angestellter)
            einkommenMonatlich: 2850, ausgabenMonatlich: 2680, ausgabenDetails: 'Miete: €780, Lebensmittel: €320, Auto: €380, Versicherungen: €190, Kinder: €450, Sonstiges: €560',
            kernproblem: 'Neuer Fall - Dezember-Rate (€180) 18 Tage überfällig. Angestellter mit stabilem Einkommen €2.850. Nach Telefonat: Zahlung vergessen wegen Umzug. Zahlungszusage für 23.12.',
            workflowStatus: 'Zahlungszusage', mahnstufe: 1,
            // Transaktionshistorie für diesen Kunden
            transaktionen: [
                { datum: '01.12.2025', beschreibung: 'Monatliche Rate - Fällig', betrag: -180, status: 'ueberfaellig' },
                { datum: '01.11.2025', beschreibung: 'Monatliche Rate', betrag: 180, status: 'gebucht' },
                { datum: '01.10.2025', beschreibung: 'Monatliche Rate', betrag: 180, status: 'gebucht' },
                { datum: '01.09.2025', beschreibung: 'Monatliche Rate', betrag: 180, status: 'gebucht' }
            ],
            produkte: [
                { typ: 'Ratenkredit', nummer: 'RK-2024-7782', saldo: 4230, status: '18 DPD', badge: 'warning' }
            ],
            // Haushaltsrechnung (Privat - Angestellter)
            haushalt: {
                einnahmen: { gehalt: 2850, neben: 0, sozial: 450, sonstige: 0 },
                fixkosten: { miete: 780, nebenkosten: 145, versicherung: 190, kredite: 180, abos: 55 },
                lebenshaltung: { essen: 320, mobilitaet: 380, gesundheit: 40, freizeit: 120, sonstige: 640 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.11.2026', versicherungen: false, investments: false },
                externeKonten: [
                    { institut: 'Sparkasse Braunschweig', produkt: 'Girokonto', saldo: 450, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: []
            }
        },
        'K-2024-8846': {
            name: 'Schmidt GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
            adresse: 'Berliner Allee 100, 30175 Hannover', telefon: '+49 511 665544',
            email: 'info@schmidt-gmbh.de', ansprechpartner: 'Michael Schmidt',
            branche: 'IT-Dienstleistungen', restschuld: 12890, status: 'Offen',
            krediteAnzahl: 2, gesamtforderung: 12890, monatsrate: 650, ueberfaellig: 650,
            rueckgabequote: 0, hauptforderung: 12000, zinsen: 640, mahngebuehren: 150, inkassokosten: 100,
            dpd: 18, willingness: 75, ability: 80, segment: 'prioritaet',
            zahlungsziel: '01.12.2025',
            // Zahlungszusage nach Kundenkontakt
            zahlungszusage: { betrag: 650, datum: '27.12.2025', status: 'offen', vereinbart: '16.12.2025', notiz: 'GF Schmidt: Großprojekt wird am 23.12. abgerechnet, überfällige Rate (€650) wird nach Zahlungseingang vom Kunden beglichen.' },
            // Einkommen & Ausgaben (IT-Dienstleister)
            einkommenMonatlich: 95000, ausgabenMonatlich: 82000, ausgabenDetails: 'Personal: €52.000, Miete/Büro: €8.500, Software-Lizenzen: €6.500, Marketing: €4.000, Sonstiges: €11.000',
            kernproblem: 'Aktiver Fall seit 01.12. - Dezember-Rate (€650) 18 Tage überfällig. Zahlungszusage bis 27.12. (nach Projektabrechnung). IT-Dienstleister mit gutem Umsatz. Gute Bonität.',
            workflowStatus: 'Zahlungszusage', mahnstufe: 2,
            // Transaktionshistorie für diesen Kunden
            transaktionen: [
                { datum: '01.12.2025', beschreibung: 'Monatliche Rate KKK - Fällig', betrag: -650, status: 'ueberfaellig' },
                { datum: '01.11.2025', beschreibung: 'Monatliche Rate KKK', betrag: 650, status: 'gebucht' },
                { datum: '15.10.2025', beschreibung: 'Tilgung Betriebsmittelkredit', betrag: 800, status: 'gebucht' },
                { datum: '01.10.2025', beschreibung: 'Monatliche Rate KKK', betrag: 650, status: 'gebucht' }
            ],
            produkte: [
                { typ: 'Kontokorrentkredit', nummer: 'KKK-2024-1123', saldo: 8500, status: '18 DPD', badge: 'warning' },
                { typ: 'Betriebsmittelkredit', nummer: 'BMK-2023-9945', saldo: 4390, status: 'Aktiv', badge: 'info' }
            ],
            // Haushaltsrechnung (Gewerbe - IT-Dienstleister)
            haushalt: {
                einnahmen: { gehalt: 95000, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 8500, nebenkosten: 1200, versicherung: 2800, kredite: 650, abos: 6500 },
                lebenshaltung: { essen: 0, mobilitaet: 4000, gesundheit: 0, freizeit: 0, sonstige: 58350 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.05.2026', versicherungen: true, investments: false },
                externeKonten: [
                    { institut: 'Commerzbank', produkt: 'Firmenkonto', saldo: 28500, rate: 0, status: 'Aktiv' },
                    { institut: 'ING', produkt: 'Tagesgeld Geschäft', saldo: 45000, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: [
                    { anbieter: 'Hiscox', produkt: 'IT-Haftpflicht', beitrag: 380, beginn: '01.06.2020', hinweis: 'Cyber-Zusatz' },
                    { anbieter: 'Allianz', produkt: 'D&O Versicherung', beitrag: 520, beginn: '01.01.2021', hinweis: '' }
                ]
            }
        },
        'K-2024-8845': {
            name: 'Weber, Anna', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Blumenweg 15, 50668 Köln', telefon: '+49 221 887766',
            email: 'a.weber@web.de', ansprechpartner: 'Anna Weber',
            branche: 'Freiberuflerin', restschuld: 2150, status: 'Offen',
            krediteAnzahl: 1, gesamtforderung: 2150, monatsrate: 120, ueberfaellig: 120,
            rueckgabequote: 0, hauptforderung: 2000, zinsen: 100, mahngebuehren: 50, inkassokosten: 0,
            dpd: 18, willingness: 70, ability: 55, segment: 'prioritaet',
            zahlungsziel: '01.12.2025',
            // Zahlungszusage - überfällige Rate
            zahlungszusage: { betrag: 120, datum: '28.12.2025', status: 'offen', vereinbart: '18.12.2025', notiz: 'Kundin zahlt überfällige Dezember-Rate (€120) am 28.12. nach Honorareingang.' },
            // Einkommen & Ausgaben (Freiberuflerin - variabel)
            einkommenMonatlich: 2400, ausgabenMonatlich: 2350, ausgabenDetails: 'Miete: €720, Lebensmittel: €290, Krankenversicherung: €420, Büro/Material: €380, Sonstiges: €540',
            kernproblem: 'Aktiver Fall seit 01.12. - Dezember-Rate (€120) 18 Tage überfällig. Zahlungszusage für 28.12. Freiberuflerin mit knappem Budget, aber kooperativ.',
            workflowStatus: 'Zahlungszusage', mahnstufe: 2,
            // Transaktionshistorie für diesen Kunden
            transaktionen: [
                { datum: '01.12.2025', beschreibung: 'Kreditkarten-Mindestbetrag - Fällig', betrag: -120, status: 'ueberfaellig' },
                { datum: '01.11.2025', beschreibung: 'Kreditkarten-Zahlung', betrag: 120, status: 'gebucht' },
                { datum: '01.10.2025', beschreibung: 'Kreditkarten-Zahlung', betrag: 120, status: 'gebucht' },
                { datum: '01.09.2025', beschreibung: 'Kreditkarten-Zahlung', betrag: 120, status: 'gebucht' }
            ],
            produkte: [
                { typ: 'Kreditkarte', nummer: 'KK-2024-5567', saldo: 2150, status: '18 DPD', badge: 'warning' }
            ],
            // Haushaltsrechnung (Privat - Freiberuflerin)
            haushalt: {
                einnahmen: { gehalt: 2400, neben: 0, sozial: 0, sonstige: 0 },
                fixkosten: { miete: 720, nebenkosten: 95, versicherung: 420, kredite: 120, abos: 45 },
                lebenshaltung: { essen: 290, mobilitaet: 180, gesundheit: 85, freizeit: 120, sonstige: 275 }
            },
            // Open Finance Daten
            openFinance: {
                consent: { psd2: true, psd2Bis: '01.12.2026', versicherungen: false, investments: false },
                externeKonten: [
                    { institut: 'GLS Bank', produkt: 'Girokonto', saldo: 850, rate: 0, status: 'Aktiv' }
                ],
                externeVersicherungen: []
            }
        }
};

const FALLBACK = {
  name: '-', type: 'Unbekannt', rechtsform: null,
  adresse: null, telefon: null, email: null, ansprechpartner: null,
  branche: null, restschuld: 0, status: 'Unbekannt',
  krediteAnzahl: 0, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
  rueckgabequote: 0, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
  dpd: 0, willingness: 50, ability: 50, segment: 'unbekannt',
  kernproblem: 'Keine Daten verfuegbar.',
  workflowStatus: 'Unbekannt', mahnstufe: 0,
};

const SEGMENT_ZU_STATUS = {
  eskalation: 'Inkasso-Verfahren',
  prioritaet: 'Zahlungsvereinbarung',
  restrukturierung: 'Restrukturierung',
  abwicklung: 'Abwicklung',
  abgeschlossen: 'Abgeschlossen',
};

export const SEGMENT_LABEL = {
  eskalation: 'Eskalation',
  prioritaet: 'Priorität',
  restrukturierung: 'Restrukturierung',
  abwicklung: 'Abwicklung',
  stabil: 'Stabil',
  abgeschlossen: 'Abgeschlossen',
};

/**
 * Vollakte eines Falls. Faelle ohne ausgebaute Akte (nur im Chat und in den
 * Portfolio-Auswertungen enthalten) bekommen eine Kurzakte aus WEITERE_FAELLE,
 * damit ein Klick nie in einem leeren Datensatz landet.
 */
export function getFullCustomerData(customerId) {
  const customer = CUSTOMER_DETAILS[customerId];
  if (customer) return { ...customer, id: customerId };

  const kurz = getKurzfall(customerId);
  if (kurz) {
    const gewerbe = /GmbH|KG|OHG|AG|Autohaus|Bäckerei|Gasthaus|Bau|Elektro|Transporte|Logistik/i.test(kurz.name);
    const mahnstufe = kurz.dpd > 90 ? 3 : kurz.dpd > 30 ? 2 : kurz.dpd > 0 ? 1 : 0;
    return {
      ...FALLBACK,
      id: customerId,
      name: kurz.name,
      type: gewerbe ? 'Gewerbe' : 'Privat',
      rechtsform: gewerbe ? 'Kapitalgesellschaft' : 'Privatperson',
      branche: null,
      restschuld: kurz.forderung,
      gesamtforderung: kurz.forderung,
      hauptforderung: kurz.forderung,
      krediteAnzahl: 1,
      ueberfaellig: kurz.dpd > 0 ? kurz.forderung : 0,
      dpd: kurz.dpd,
      status: kurz.status,
      segment: kurz.segment,
      mahnstufe,
      workflowStatus: SEGMENT_ZU_STATUS[kurz.segment] || kurz.status,
      willingness: kurz.segment === 'prioritaet' ? 80 : kurz.segment === 'restrukturierung' ? 75 : kurz.segment === 'abgeschlossen' ? 85 : 30,
      ability: kurz.segment === 'eskalation' ? 65 : kurz.segment === 'abwicklung' ? 25 : 70,
      kernproblem: `Kurzakte: ${kurz.name} führt eine offene Forderung von `
        + `${kurz.forderung.toLocaleString('de-DE')} EUR bei ${kurz.dpd} Tagen Verzug. `
        + `Der Fall ist dem Segment ${SEGMENT_LABEL[kurz.segment] || kurz.segment} zugeordnet, Status ${kurz.status}. `
        + 'Für diesen Fall liegt in der Demo keine ausgebaute Akte vor — Kennzahlen und '
        + 'Empfehlung werden aus den Portfolio-Daten abgeleitet.',
      kurzakte: true,
    };
  }

  return { ...FALLBACK, id: customerId, name: customerId };
}

/** IFRS-9-Stufe aus den Verzugstagen. */
export function stage(customer) {
  if (customer.dpd > 90) return 3;
  if (customer.dpd > 0) return 2;
  return 1;
}

/**
 * Letzte Zahlung eines Falls. Bevorzugt das explizite Feld `letzteZahlung`,
 * sonst die juengste positive Transaktion — damit Kachel und
 * Transaktionshistorie nie auseinanderlaufen.
 */
export function letzteZahlung(customer) {
  if (customer.letzteZahlung) return customer.letzteZahlung;
  const eingang = (customer.transaktionen || []).find(t => t.betrag > 0);
  if (!eingang) return null;
  return { betrag: eingang.betrag, datum: eingang.datum, typ: eingang.beschreibung };
}

/**
 * Aktivitaetenliste eines Falls, abgeleitet aus Mahnstufe und
 * Transaktionshistorie. Die Legacy-Akte hatte eine fest verdrahtete Liste, die
 * andere Betraege nannte als die Transaktionen desselben Kunden.
 */
export function buildAktivitaeten(customer) {
  const eintraege = [];

  if (customer.mahnstufe > 0) {
    eintraege.push({
      typ: 'ausgehend',
      titel: `${customer.mahnstufe}. Mahnung versendet`,
      datum: '01.12.2025, 09:15',
      sort: 3,
    });
  }

  (customer.transaktionen || []).slice(0, 4).forEach((t, i) => {
    eintraege.push({
      typ: t.betrag > 0 ? 'eingehend' : t.status === 'rueckgabe' ? 'verpasst' : 'ausgehend',
      titel: t.betrag > 0
        ? `${t.beschreibung}: ${Math.abs(t.betrag).toLocaleString('de-DE')} EUR`
        : t.beschreibung,
      datum: t.datum,
      sort: 2 - i * 0.1,
    });
  });

  if (customer.mahnstufe > 1) {
    eintraege.push({
      typ: 'verpasst',
      titel: 'Anrufversuch – nicht erreicht',
      datum: '10.11.2025, 11:30',
      sort: 1,
    });
  }

  return eintraege.sort((a, b) => b.sort - a.sort).slice(0, 5);
}
