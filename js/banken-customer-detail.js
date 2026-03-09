// ========================================
// NEW: Customer Detail Modal Functions
// ========================================

// Open customer detail modal
function openCustomerDetail(customerId, options = {}) {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'flex';

        // Set current customer ID for activity tracking
        currentCustomerId = customerId;

        // Get full customer data
        const customer = getFullCustomerData(customerId);

        // Update modal header
        const customerNameEl = document.getElementById('customerName');
        if (customerNameEl) {
            customerNameEl.textContent = customer.name;
        }

        // Update customer ID display
        const customerIdEl = modal.querySelector('.customer-id');
        if (customerIdEl) {
            customerIdEl.textContent = customerId;
        }

        // Update all tabs with customer data
        updateStammdatenFields(modal, customer);
        updateKontenFields(modal, customer);
        updateHaushaltFields(modal, customer);
        updateOpenFinanceFields(modal, customer);
        updateKommunikationFields(modal, customer);
        updateKiAnalyseFields(modal, customer);

        // Update AI summary card with customer data
        updateAiSummary(customer);

        // Switch between Haushaltsrechnung (Privat) and GuV (Gewerbe)
        updateHaushaltGuvTab(customer);

        // Render custom activities from localStorage
        setTimeout(() => renderCustomerActivities(customerId), 100);

        // If opened from task completion, switch to Kommunikation tab
        if (options.showKommunikation) {
            showCustomerTab('kommunikation');
        } else {
            // Always reset to Stammdaten tab when opening normally
            showCustomerTab('stammdaten');
        }

        console.log('Opening customer detail:', customerId, customer.name);

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'banken', view: 'customer-detail' }
        }));
    }
}

// Get full customer data for modal display (all tabs)
function getFullCustomerData(customerId) {
    const customers = {
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

    // Return customer or generate default data
    const customer = customers[customerId];
    if (customer) return customer;

    // Default fallback for unknown customers
    return {
        name: customerId, type: 'Unbekannt', rechtsform: '-',
        adresse: '-', telefon: '-', email: '-', ansprechpartner: '-',
        branche: '-', restschuld: 0, status: 'Unbekannt',
        krediteAnzahl: 0, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 0, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 50, ability: 50, segment: 'unbekannt',
        kernproblem: 'Keine Daten verfügbar.',
        workflowStatus: 'Unbekannt', mahnstufe: 0
    };
}

// Update Stammdaten fields in modal - comprehensive update of all fields
function updateStammdatenFields(modal, customer) {
    const stammdatenTab = modal.querySelector('#tab-stammdaten');
    if (!stammdatenTab) {
        console.log('Stammdaten tab not found');
        return;
    }

    console.log('Updating Stammdaten for:', customer.name, customer);

    // Helper function to find and update a field by its label text
    function updateFieldByLabel(labelText, newValue, useHTML = false) {
        const rows = stammdatenTab.querySelectorAll('.stammdaten-row');
        for (const row of rows) {
            const label = row.querySelector('.label');
            if (label && label.textContent.trim().replace(':', '').toLowerCase() === labelText.toLowerCase()) {
                const value = row.querySelector('.value');
                if (value) {
                    if (useHTML) {
                        value.innerHTML = newValue;
                    } else {
                        value.textContent = newValue;
                    }
                    return value;
                }
            }
        }
        return null;
    }

    // Determine if Privat or Gewerbe customer
    const isPrivat = customer.type === 'Privat';

    // === UNTERNEHMENSDATEN / PERSONENDATEN ===
    updateFieldByLabel('Firmenname', customer.name);
    updateFieldByLabel('Rechtsform', customer.rechtsform || (isPrivat ? 'Privatperson' : '-'));
    updateFieldByLabel('Handelsregister', isPrivat ? '-' : 'HRB ' + Math.floor(Math.random() * 99999) + ' ' + (customer.adresse?.split(',')[1]?.trim() || 'Deutschland'));
    updateFieldByLabel('USt-ID', isPrivat ? '-' : 'DE' + Math.floor(Math.random() * 999999999));
    updateFieldByLabel('Branche', customer.branche || '-');
    updateFieldByLabel('Gründungsjahr', isPrivat ? '-' : (2000 + Math.floor(Math.random() * 20)).toString());
    updateFieldByLabel('Mitarbeiter', isPrivat ? '-' : Math.floor(Math.random() * 50 + 1) + ' (Stand: 2024)');
    updateFieldByLabel('Jahresumsatz', isPrivat ? '-' : '€' + (Math.floor(Math.random() * 5) + 0.5).toFixed(1) + ' Mio (2023)');

    // Kundentyp badge
    const kundentypValue = updateFieldByLabel('Kundentyp', '', true);
    if (kundentypValue) {
        kundentypValue.innerHTML = isPrivat
            ? '<span class="badge privat">Privatkunde</span>'
            : '<span class="badge gewerbe">Gewerbekunde</span>';
    }

    updateFieldByLabel('Kunde seit', customer.kundeSeit || '01.01.2020 (5 Jahre)');
    updateFieldByLabel('Kundenbetreuer', 'Eike Brenneisen');

    // === KONTAKTDATEN ===
    const adresseParts = customer.adresse ? customer.adresse.split(',') : ['-', '-'];
    const adresseFormatted = adresseParts.length > 1
        ? adresseParts[0].trim() + '<br>' + adresseParts[1].trim()
        : customer.adresse || '-';
    updateFieldByLabel('Adresse', adresseFormatted, true);

    updateFieldByLabel('Telefon Zentrale', customer.telefon || '-');
    updateFieldByLabel('Telefon Mobil', customer.telefonMobil || '+49 170 ' + Math.floor(Math.random() * 9999999));

    // Update all E-Mail fields
    const emailRows = stammdatenTab.querySelectorAll('.stammdaten-row');
    let emailCount = 0;
    emailRows.forEach(row => {
        const label = row.querySelector('.label');
        if (label && label.textContent.trim().toLowerCase().includes('e-mail')) {
            const value = row.querySelector('.value');
            if (value && emailCount === 0) {
                value.textContent = customer.email || '-';
                emailCount++;
            }
        }
    });

    updateFieldByLabel('Website', isPrivat ? '-' : 'www.' + customer.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.de');

    // === GESCHÄFTSFÜHRUNG / ANSPRECHPARTNER ===
    const subsections = stammdatenTab.querySelectorAll('.stammdaten-subsection');
    subsections.forEach(subsection => {
        const subsectionText = subsection.textContent.toLowerCase();
        let sibling = subsection.nextElementSibling;

        if (subsectionText.includes('geschäftsführung')) {
            // Update Geschäftsführung section
            while (sibling && sibling.classList.contains('stammdaten-row')) {
                const label = sibling.querySelector('.label');
                const value = sibling.querySelector('.value');
                if (label && value) {
                    const labelText = label.textContent.trim().toLowerCase();
                    if (labelText.includes('name')) {
                        value.textContent = customer.ansprechpartner || customer.name;
                    } else if (labelText.includes('direktwahl')) {
                        value.textContent = customer.telefon ? customer.telefon + '-10' : '-';
                    } else if (labelText.includes('e-mail')) {
                        const emailName = customer.ansprechpartner
                            ? customer.ansprechpartner.split(' ').map(n => n[0]?.toLowerCase()).join('.')
                            : 'kontakt';
                        const domain = customer.email ? customer.email.split('@')[1] : 'email.de';
                        value.textContent = emailName + '@' + domain;
                    }
                }
                sibling = sibling.nextElementSibling;
            }
        } else if (subsectionText.includes('buchhaltung') || subsectionText.includes('ansprechpartner')) {
            // Update Ansprechpartner Buchhaltung section
            while (sibling && sibling.classList.contains('stammdaten-row')) {
                const label = sibling.querySelector('.label');
                const value = sibling.querySelector('.value');
                if (label && value) {
                    const labelText = label.textContent.trim().toLowerCase();
                    if (labelText.includes('name')) {
                        value.textContent = isPrivat ? customer.name : 'Buchhaltung ' + customer.name.split(' ')[0];
                    } else if (labelText.includes('direktwahl')) {
                        value.textContent = customer.telefon ? customer.telefon + '-20' : '-';
                    } else if (labelText.includes('e-mail')) {
                        const domain = customer.email ? customer.email.split('@')[1] : 'email.de';
                        value.textContent = isPrivat ? customer.email : 'buchhaltung@' + domain;
                    }
                }
                sibling = sibling.nextElementSibling;
            }
        }
    });

    // === BANKVERBINDUNG & BONITÄT ===
    // Generate realistic IBAN for demo
    const ibanNumber = 'DE' + Math.floor(Math.random() * 99).toString().padStart(2, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 99).toString().padStart(2, '0');
    updateFieldByLabel('IBAN', ibanNumber);
    updateFieldByLabel('BIC', 'DEUTDEDB' + Math.floor(Math.random() * 999).toString().padStart(3, '0'));
    updateFieldByLabel('Kreditinstitut', ['Deutsche Bank', 'Commerzbank AG', 'Sparkasse', 'Volksbank'][Math.floor(Math.random() * 4)]);

    // SEPA-Mandat based on status
    const sepaValue = updateFieldByLabel('SEPA-Mandat', '', true);
    if (sepaValue) {
        if (customer.status === 'Bezahlt') {
            sepaValue.innerHTML = '<span class="badge success">Aktiv</span>';
        } else if (customer.status === 'Inkasso') {
            sepaValue.innerHTML = '<span class="badge warning">Widerrufen (' + new Date().toLocaleDateString('de-DE') + ')</span>';
        } else {
            sepaValue.innerHTML = '<span class="badge success">Aktiv</span>';
        }
    }

    // Bonitätsinformationen
    const rating = customer.status === 'Bezahlt' ? 'A' : (customer.status === 'Inkasso' ? 'C-' : 'B');
    const ratingClass = customer.status === 'Bezahlt' ? 'rating-good' : (customer.status === 'Inkasso' ? 'rating-bad' : 'rating-medium');
    const ratingValue = updateFieldByLabel('Internes Rating', '', true);
    if (ratingValue) {
        ratingValue.innerHTML = '<span class="' + ratingClass + '">' + rating + '</span>';
    }

    const creditreformScore = customer.status === 'Bezahlt' ? '180 (geringes Risiko)' : (customer.status === 'Inkasso' ? '312 (hohes Risiko)' : '245 (mittleres Risiko)');
    updateFieldByLabel('Creditreform-Index', creditreformScore);

    const schufaScore = customer.status === 'Bezahlt' ? '95 / 100' : (customer.status === 'Inkasso' ? '78 / 100' : '85 / 100');
    updateFieldByLabel('Schufa-Score', schufaScore);
    updateFieldByLabel('Letzte Prüfung', new Date().toLocaleDateString('de-DE'));

    const zahlungsmoral = customer.status === 'Bezahlt' ? 'Gut' : (customer.status === 'Inkasso' ? 'Mangelhaft' : 'Befriedigend');
    const zahlungsmoralClass = customer.status === 'Bezahlt' ? 'rating-good' : (customer.status === 'Inkasso' ? 'rating-bad' : 'rating-medium');
    const zahlungsmoralValue = updateFieldByLabel('Zahlungsmoral', '', true);
    if (zahlungsmoralValue) {
        zahlungsmoralValue.innerHTML = '<span class="' + zahlungsmoralClass + '">' + zahlungsmoral + '</span>';
    }

    const verzug = customer.dpd || 0;
    updateFieldByLabel('Ø Zahlungsverzug', verzug + ' Tage');

    // === KREDITDETAILS ===
    const produktTyp = isPrivat
        ? ['Ratenkredit', 'Dispositionskredit', 'Kreditkarte', 'Autokredit'][Math.floor(Math.random() * 4)]
        : ['Betriebsmittelkredit', 'Investitionskredit', 'Kontokorrent'][Math.floor(Math.random() * 3)];
    updateFieldByLabel('Vertragsart', produktTyp);

    const vertragsnummer = (isPrivat ? 'RK-' : 'BMK-') + '20' + (18 + Math.floor(Math.random() * 6)) + '-' + Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
    updateFieldByLabel('Vertragsnummer', vertragsnummer);

    const ursprungsbetrag = customer.restschuld > 0 ? customer.restschuld * (1 + Math.random() * 0.5) : (Math.random() * 50000 + 5000);
    updateFieldByLabel('Ursprungsbetrag', '€' + Math.round(ursprungsbetrag).toLocaleString('de-DE'));

    // Restschuld with color
    const restschuldValue = updateFieldByLabel('Restschuld', '', true);
    if (restschuldValue) {
        if (customer.restschuld === 0 || customer.status === 'Bezahlt') {
            restschuldValue.innerHTML = '<span class="highlight-green" style="color: #22c55e;">€0</span>';
        } else {
            restschuldValue.innerHTML = '<span class="highlight-red">€' + customer.restschuld.toLocaleString('de-DE') + '</span>';
        }
    }

    updateFieldByLabel('Zinssatz', (3 + Math.random() * 5).toFixed(2) + '% p.a.');
    updateFieldByLabel('Monatsrate', '€' + (customer.monatsrate || Math.floor(customer.restschuld / 24) || 0).toLocaleString('de-DE'));
    updateFieldByLabel('Vertragsbeginn', '01.' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '.20' + (18 + Math.floor(Math.random() * 5)));
    updateFieldByLabel('Vertragslaufzeit', (60 + Math.floor(Math.random() * 60)) + ' Monate');
    updateFieldByLabel('Restlaufzeit', Math.floor(Math.random() * 36) + ' Monate');
    updateFieldByLabel('Sicherheiten', isPrivat ? 'Keine' : 'Bürgschaft GF, Inventar');
    updateFieldByLabel('Sicherheitenwert', isPrivat ? '-' : '€' + Math.floor(customer.restschuld * 0.7).toLocaleString('de-DE') + ' (geschätzt)');

    // Stage based on status
    const stageValue = updateFieldByLabel('Stage', '', true);
    if (stageValue) {
        if (customer.status === 'Bezahlt') {
            stageValue.innerHTML = '<span class="badge success">Abgeschlossen</span>';
        } else if (customer.status === 'Inkasso') {
            stageValue.innerHTML = '<span class="badge danger">Stage 3 (NPL)</span>';
        } else {
            stageValue.innerHTML = '<span class="badge warning">Stage 2</span>';
        }
    }

    // DPD
    const dpdValue = updateFieldByLabel('DPD', '', true);
    if (dpdValue) {
        const dpd = customer.dpd || 0;
        if (dpd === 0) {
            dpdValue.innerHTML = '<span class="highlight-green" style="color: #22c55e;">0 Tage</span>';
        } else {
            dpdValue.innerHTML = '<span class="highlight-red">' + dpd + ' Tage</span>';
        }
    }

    // Show status badge for completed cases
    if (customer.statusBadge === 'success') {
        const headerActions = modal.querySelector('.modal-header-actions');
        let statusIndicator = modal.querySelector('.status-indicator-success');
        if (!statusIndicator && headerActions) {
            statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator-success';
            statusIndicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ' + customer.statusText;
            statusIndicator.style.cssText = 'display: flex; align-items: center; gap: 6px; color: #22c55e; font-size: 13px; font-weight: 500; margin-right: 12px;';
            headerActions.insertBefore(statusIndicator, headerActions.firstChild);
        }
    } else {
        const statusIndicator = modal.querySelector('.status-indicator-success');
        if (statusIndicator) statusIndicator.remove();
    }

    console.log('Stammdaten update complete for:', customer.name);
}

// Generate dynamic transaction rows for a specific product
function generateProductTransactions(product, customer) {
    const produktTyp = product.typ.toLowerCase();
    const saldo = product.saldo || 0;
    const rate = product.rate || customer.monatsrate || 0;
    const limit = product.limit || 0;
    const isBeglichen = product.status === 'Beglichen' || product.status === 'Getilgt' || product.status === 'Ausgeglichen';
    const dpd = customer.dpd || 0;

    // For Dispo/Kontokorrent: Show account movements
    if (produktTyp.includes('dispo') || produktTyp.includes('kontokorrent')) {
        const istUeberLimit = saldo > limit;
        const ueberLimitBetrag = istUeberLimit ? saldo - limit : 0;
        const rows = [];

        if (istUeberLimit) {
            rows.push(`<tr class="highlight-row">
                <td>16.12.2025</td>
                <td>Überschreitung Dispolimit</td>
                <td class="negative">-€${ueberLimitBetrag.toLocaleString('de-DE')}</td>
                <td class="negative">€${saldo.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge danger">Über Limit</span></td>
            </tr>`);
        }

        rows.push(`<tr>
            <td>15.12.2025</td>
            <td>Gehaltseingang</td>
            <td class="positive">+€${(customer.einkommenMonatlich || 3200).toLocaleString('de-DE')}</td>
            <td>€${(saldo - (customer.einkommenMonatlich || 3200) + 500).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge success">Eingang</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>10.12.2025</td>
            <td>Lastschrift Stadtwerke</td>
            <td class="negative">-€285,00</td>
            <td>€${(saldo + 285).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>05.12.2025</td>
            <td>Lastschrift Miete</td>
            <td class="negative">-€${Math.round((customer.ausgabenMonatlich || 2500) * 0.35).toLocaleString('de-DE')},00</td>
            <td>€${(saldo + 285 + Math.round((customer.ausgabenMonatlich || 2500) * 0.35)).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        return rows.join('');
    }

    // For Baufinanzierung: Show monthly mortgage payments
    if (produktTyp.includes('baufinanzierung') || produktTyp.includes('hypothek')) {
        const monatsrate = product.rate || 1450;
        const isAusstehend = product.status && product.status.includes('offen');
        const rows = [];

        rows.push(`<tr ${isAusstehend ? 'class="highlight-row"' : ''}>
            <td>01.12.2025</td>
            <td>Monatsrate Dezember</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${saldo.toLocaleString('de-DE')}</td>
            <td><span class="tx-badge ${isAusstehend ? 'warning' : ''}">${isAusstehend ? 'Ausstehend' : 'Gebucht'}</span></td>
        </tr>`);

        rows.push(`<tr ${isAusstehend ? 'class="highlight-row"' : ''}>
            <td>01.11.2025</td>
            <td>Monatsrate November</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${(saldo + monatsrate).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge ${isAusstehend ? 'warning' : ''}">${isAusstehend ? 'Ausstehend' : 'Gebucht'}</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>01.10.2025</td>
            <td>Monatsrate Oktober</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${(saldo + monatsrate * 2).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>01.09.2025</td>
            <td>Monatsrate September</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${(saldo + monatsrate * 3).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        return rows.join('');
    }

    // For Ratenkredit: Show monthly installments
    if (produktTyp.includes('ratenkredit') || produktTyp.includes('betriebsmittel') || produktTyp.includes('investitions')) {
        const monatsrate = rate || customer.monatsrate || 180;
        const rows = [];

        if (isBeglichen && product.letzteZahlung) {
            rows.push(`<tr>
                <td>${customer.letzteZahlung?.datum || '16.12.2025'}</td>
                <td>Schlusszahlung - Kredit getilgt</td>
                <td class="positive">+€${product.letzteZahlung.toLocaleString('de-DE')}</td>
                <td>€0</td>
                <td><span class="tx-badge success">Abgeschlossen</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>01.12.2025</td>
                <td>Letzte reguläre Rate</td>
                <td class="positive">+€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${product.letzteZahlung.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);
        } else {
            const isUeberfaellig = dpd > 0;

            rows.push(`<tr ${isUeberfaellig ? 'class="highlight-row"' : ''}>
                <td>01.12.2025</td>
                <td>Monatliche Rate - Fällig</td>
                <td class="negative">-€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${saldo.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge ${isUeberfaellig ? 'danger' : ''}">${isUeberfaellig ? 'Überfällig' : 'Gebucht'}</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>01.11.2025</td>
                <td>Monatliche Rate</td>
                <td class="positive">+€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${(saldo + monatsrate).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>01.10.2025</td>
                <td>Monatliche Rate</td>
                <td class="positive">+€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${(saldo + monatsrate * 2).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);
        }

        return rows.join('');
    }

    // For Kreditkarte: Show card transactions
    if (produktTyp.includes('kreditkarte')) {
        const minBetrag = rate || 120;
        const rows = [];

        if (isBeglichen) {
            rows.push(`<tr>
                <td>${customer.letzteZahlung?.datum || '18.12.2025'}</td>
                <td>Vollständige Tilgung</td>
                <td class="positive">+€${(product.letzteZahlung || saldo).toLocaleString('de-DE')}</td>
                <td>€0</td>
                <td><span class="tx-badge success">Abgeschlossen</span></td>
            </tr>`);
        } else {
            const isUeberfaellig = dpd > 0;

            rows.push(`<tr ${isUeberfaellig ? 'class="highlight-row"' : ''}>
                <td>01.12.2025</td>
                <td>Mindestbetrag fällig</td>
                <td class="negative">-€${minBetrag.toLocaleString('de-DE')}</td>
                <td>€${saldo.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge ${isUeberfaellig ? 'danger' : ''}">${isUeberfaellig ? 'Überfällig' : 'Fällig'}</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>28.11.2025</td>
                <td>Einkauf Online-Shop</td>
                <td class="negative">-€89,90</td>
                <td>€${(saldo - 89.9).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>15.11.2025</td>
                <td>Restaurant Zahlung</td>
                <td class="negative">-€45,80</td>
                <td>€${(saldo - 89.9 - 45.8).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);
        }

        return rows.join('');
    }

    // Default: Generic transactions
    return `<tr>
        <td>01.12.2025</td>
        <td>Transaktion</td>
        <td>€${rate.toLocaleString('de-DE')}</td>
        <td>€${saldo.toLocaleString('de-DE')}</td>
        <td><span class="tx-badge">Gebucht</span></td>
    </tr>`;
}

// Exports
window.openCustomerDetail = openCustomerDetail;
window.__registerModule('banken-customer-detail.js');
