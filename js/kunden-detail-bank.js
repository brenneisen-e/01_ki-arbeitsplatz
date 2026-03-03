// ========================================
// B-10 Kunden-Detailansicht (Banking)
// Drei Modi: Privatkunde, Firmenkunde, Private Banking
// Open Finance / FIDA als zentrales Feature
// ========================================

(function() {
    'use strict';

    // ── Formatierung ────────────────────────
    function fmtEuro(val) {
        if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.', ',') + ' Mio. EUR';
        if (val >= 1000) return (val / 1000).toFixed(1).replace('.', ',') + ' Tsd. EUR';
        return val.toLocaleString('de-DE') + ' EUR';
    }

    // ── Mock-Daten fuer Open Finance (FIDA) ──
    var fidaSourcesRetail = [
        { bank: 'ING DiBa', daten: 'Gehaltseingang 3.850 EUR/Monat, Sparrate 400 EUR/Monat', signal: 'Sparplan-Potenzial: 4.800 EUR/Jahr ungenutzt' },
        { bank: 'Trade Republic', daten: 'ETF-Portfolio: 28.400 EUR (MSCI World, EM, Nasdaq)', signal: 'VR-FinanzPlan-Anlass: Kein ganzheitlicher Blick' },
        { bank: 'HUK24', daten: 'Kfz-Versicherung Vollkasko, 820 EUR/Jahr', signal: 'R+V Buendelrabatt moeglich (-15%)' },
        { bank: 'Scalable Capital', daten: 'Robo-Advisor: 15.200 EUR, Performance +4,2% p.a.', signal: 'Vermoegensverwaltung ohne persoenliche Beratung' }
    ];

    var fidaSourcesFirmenkunde = [
        { bank: 'Commerzbank', daten: 'Betriebsmittelkredit 500 Tsd. EUR, Zinssatz 4,8%', signal: 'Umschuldungspotenzial: -0,6% bei VR-Konditionen' },
        { bank: 'Deutsche Bank', daten: 'Avale/Buergschaften: 1,2 Mio. EUR', signal: 'Konsolidierung in Gesamtkreditlinie moeglich' },
        { bank: 'Grenke Leasing', daten: '3 Leasingvertraege, Gesamt 180 Tsd. EUR', signal: 'VR-Leasing Angebot mit besseren Konditionen' },
        { bank: 'PayPal Business', daten: 'Zahlungsverkehr: 42 Tsd. EUR/Monat', signal: 'VR-Pay Integration vorschlagen' }
    ];

    var fidaSourcesVermoegen = [
        { bank: 'DWS (Deutsche Bank)', daten: 'Depot 2,4 Mio. EUR, Fonds-Schwerpunkt Europa', signal: 'Konsolidierung in VR-Depot mit Vermoegensverwaltung' },
        { bank: 'Allianz Leben', daten: 'Rentenversicherung: Ablauf 2028, Auszahlung ca. 380 Tsd. EUR', signal: 'Wiederanlage-Strategie planen' },
        { bank: 'Swiss Life', daten: 'Ruerup-Rente, Beitrag 12.000 EUR/Jahr', signal: 'Nachfolgeplanung: Vermoegensuebergang strukturieren' },
        { bank: 'Flatex', daten: 'Aktien-Depot: 890 Tsd. EUR, hohe Einzelwert-Konzentration', signal: 'Diversifikation + Steueroptimierung empfehlen' }
    ];

    // ── KI-Empfehlungen je Modus ────────────
    var kiEmpfehlungenRetail = [
        { title: 'Sparplan-Beratung', text: 'Kunde spart 400 EUR/Monat bei ING. Vorschlag: VR-Sparplan mit Praemien-Vorteil + Sondertilgung Baufi kombinieren.', potential: 'Ertragspotenzial: +1.200 EUR/Jahr', prio: 'high' },
        { title: 'VR-FinanzPlan erstellen', text: 'ETF-Portfolio bei Trade Republic + Robo bei Scalable = 43.600 EUR ohne ganzheitliche Strategie. FinanzPlan-Gespraech anbieten.', potential: 'Cross-Selling-Quote: 3,2 → 4,5', prio: 'high' },
        { title: 'R+V Buendelrabatt', text: 'Kfz bei HUK24 (820 EUR/Jahr). R+V Buendel mit Hausrat + Haftpflicht spart dem Kunden ca. 120 EUR/Jahr.', potential: 'Ertragspotenzial: +380 EUR/Jahr', prio: 'medium' }
    ];

    var kiEmpfehlungenFirmenkunde = [
        { title: 'Kreditlinien konsolidieren', text: 'Betriebsmittelkredit bei Commerzbank + Avale bei Deutsche Bank. Gesamtkonsolidierung in VR-Rahmenkredit spart dem Kunden Zinsen und vereinfacht Reporting.', potential: 'Kreditvolumen-Potenzial: +1,7 Mio. EUR', prio: 'high' },
        { title: 'Foerdermittel-Check', text: 'Investitionsvorhaben 2026 geplant. KfW-Foerdermittel und Landesfoerderung Hessen pruefen.', potential: 'Foerdervolumen: bis zu 500 Tsd. EUR', prio: 'medium' },
        { title: 'VR-Pay Integration', text: 'PayPal-Zahlungsverkehr 42 Tsd. EUR/Monat. VR-Pay bietet niedrigere Gebuehren + direkte Kontoanbindung.', potential: 'Einsparung: ca. 3.600 EUR/Jahr', prio: 'medium' }
    ];

    var kiEmpfehlungenVermoegen = [
        { title: 'Depot-Konsolidierung', text: 'DWS-Depot (2,4 Mio.) + Flatex-Aktien (890 Tsd.) ohne einheitliche Strategie. VR-Vermoegensverwaltung mit individueller Allokation vorschlagen.', potential: 'AuM-Potenzial: +3,3 Mio. EUR', prio: 'high' },
        { title: 'Ablaufmanagement Allianz', text: 'Rentenversicherung laeuft 2028 aus (380 Tsd. EUR). Wiederanlage-Strategie jetzt planen: Mischung aus Depot + Immobilie + Stiftung.', potential: 'Ertragspotenzial: +8.500 EUR/Jahr', prio: 'high' },
        { title: 'Nachfolgeplanung starten', text: 'Vermoegen ueber 6 Mio. EUR, keine dokumentierte Nachfolgestrategie. Generationenberatung + Testamentsvollstreckung anbieten.', potential: 'Mandatspotenzial: Nachfolge-Retainer', prio: 'medium' }
    ];

    // ── Detail-Stammdaten je Modus ──────────
    var retailStammdaten = {
        'PK-10021': { geb: '14.03.1978', beruf: 'Dipl.-Ingenieur', familienstand: 'Verheiratet, 2 Kinder', adresse: 'Ludwigstr. 42, 35390 Giessen', girokonto: 'DE42 5139 0000 0012 3456 78', saldo: 12400, baufi: '185.000 EUR (Restschuld)', depot: '28.400 EUR (Trade Republic)', versicherung: 'R+V Hausrat + Kfz bei HUK24' },
        'PK-10034': { geb: '22.11.1985', beruf: 'Betriebswirtin (MBA)', familienstand: 'Ledig', adresse: 'Bahnhofstr. 15, 35578 Wetzlar', girokonto: 'DE89 5139 0000 0034 5678 90', saldo: 28900, baufi: '—', depot: '42.100 EUR (DWS Fonds)', versicherung: 'R+V Komplett-Paket' },
        'PK-10056': { geb: '08.06.1992', beruf: 'Software-Entwickler', familienstand: 'Ledig', adresse: 'Universitaetsstr. 8, 35037 Marburg', girokonto: 'DE15 5139 0000 0056 7890 12', saldo: 5600, baufi: '—', depot: '15.200 EUR (Scalable)', versicherung: 'Haftpflicht (HUK)' },
        'PK-10078': { geb: '30.09.1975', beruf: 'Lehrerin', familienstand: 'Verheiratet, 1 Kind', adresse: 'Schillerstr. 22, 35390 Giessen', girokonto: 'DE78 5139 0000 0078 9012 34', saldo: 18200, baufi: '142.000 EUR (Restschuld)', depot: '—', versicherung: 'R+V Basis-Paket' },
        'PK-10089': { geb: '17.01.1988', beruf: 'Kaufmann', familienstand: 'Ledig', adresse: 'Gartenstr. 5, 35578 Wetzlar', girokonto: 'DE34 5139 0000 0089 0123 45', saldo: 3400, baufi: '—', depot: '—', versicherung: '—' },
        'PK-10102': { geb: '25.04.1996', beruf: 'Studentin', familienstand: 'Ledig', adresse: 'Campusweg 3, 35037 Marburg', girokonto: 'DE56 5139 0000 0102 3456 78', saldo: 1850, baufi: '—', depot: '—', versicherung: 'Haftpflicht' },
        'PK-10115': { geb: '12.08.1970', beruf: 'Handwerker', familienstand: 'Geschieden', adresse: 'Marktplatz 11, 35390 Giessen', girokonto: 'DE90 5139 0000 0115 6789 01', saldo: 450, baufi: '—', depot: '—', versicherung: '—' },
        'PK-10128': { geb: '03.12.1982', beruf: 'Verwaltungsfachangestellte', familienstand: 'Verheiratet', adresse: 'Ringstr. 7, 35578 Wetzlar', girokonto: 'DE12 5139 0000 0128 9012 34', saldo: 2100, baufi: '—', depot: '—', versicherung: 'R+V Haftpflicht' }
    };

    // ── openBankKundenDetail ────────────────
    function openBankKundenDetail(kundenId, mode) {
        console.log('B-10: Kunden-Detail oeffnen:', kundenId, 'Modus:', mode);

        // B-02 verstecken
        var beraterPage = document.getElementById('beraterOverviewPage');
        if (beraterPage) beraterPage.style.display = 'none';

        // B-10 anzeigen
        var detailPage = document.getElementById('kundenDetailBankPage');
        if (detailPage) detailPage.style.display = 'block';

        // Detail fuellen
        if (mode === 'retail') fillRetailDetail(kundenId);
        else if (mode === 'firmenkunde') fillFirmenkundeDetail(kundenId);
        else if (mode === 'vermoegen') fillVermoegenDetail(kundenId);

        // Dispatch event for Page ID Tracker
        var pageIdMap = { retail: 'B-10', firmenkunde: 'B-10b', vermoegen: 'B-10c' };
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'bankenBerater', view: 'kundendetail-bank' }
        }));
        if (typeof PageIDTracker !== 'undefined') {
            PageIDTracker.setPageId(pageIdMap[mode] || 'B-10');
        }

        // Store for back-navigation
        window._lastBankKundenMode = mode;

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // ── closeBankKundenDetail ────────────────
    function closeBankKundenDetail() {
        console.log('B-10: Zurueck zu B-02');

        var detailPage = document.getElementById('kundenDetailBankPage');
        if (detailPage) detailPage.style.display = 'none';

        // Zurueck zu B-02
        openBeraterOverview();
    }

    // ── fillRetailDetail ─────────────────────
    function fillRetailDetail(kundenId) {
        var kunde = (window.bankRetailKunden || []).find(function(k) { return k.id === kundenId; });
        if (!kunde) return;
        var sd = retailStammdaten[kundenId] || {};

        // Header
        var header = document.getElementById('kdBankHeaderName');
        var meta = document.getElementById('kdBankHeaderMeta');
        var avatar = document.getElementById('kdBankAvatar');
        if (header) header.textContent = kunde.name;
        if (meta) meta.textContent = kunde.id + ' | ' + kunde.ort + ' | ' + beraterLabel('retail');
        if (avatar) avatar.textContent = kunde.name.split(' ').map(function(w) { return w[0]; }).join('');

        // Sticky Bar
        fillStickyBar(kunde.name, kunde.id, 'Privatkundenberater Thomas Berger');

        // Tabs: Retail
        var tabsHtml = buildTabsHtml([
            { id: 'stammdaten', label: 'Stammdaten' },
            { id: 'konten', label: 'Konten & Karten' },
            { id: 'kredit', label: 'Kredit & Finanzierung' },
            { id: 'wertpapiere', label: 'Wertpapiere & Anlage' },
            { id: 'versicherung', label: 'Versicherung & Vorsorge' },
            { id: 'fida', label: 'Open Finance / FIDA', fida: true },
            { id: 'historie', label: 'Beratungshistorie' }
        ]);
        var tabContainer = document.getElementById('kdBankTabs');
        if (tabContainer) tabContainer.innerHTML = tabsHtml;

        // Tab Content
        var contentArea = document.getElementById('kdBankContent');
        if (!contentArea) return;

        var html = '';

        // Stammdaten Tab
        html += '<div class="banking-detail-content active" data-tab="stammdaten">';
        html += '<div class="banking-stammdaten-grid">';
        html += infoItem('Name', kunde.name);
        html += infoItem('Kunden-Nr.', kunde.id);
        html += infoItem('Geburtsdatum', sd.geb || '—');
        html += infoItem('Beruf', sd.beruf || '—');
        html += infoItem('Familienstand', sd.familienstand || '—');
        html += infoItem('Adresse', sd.adresse || '—');
        html += infoItem('Segment', kunde.segment);
        html += infoItem('VR-FinanzPlan', kunde.finanzplan ? 'Ja' : 'Nein');
        html += '</div></div>';

        // Konten Tab
        html += '<div class="banking-detail-content" data-tab="konten">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Girokonto', sd.girokonto || '—', '');
        html += kpiBox('Kontostand', fmtEuro(sd.saldo || 0), 'positive');
        html += kpiBox('Produkte', kunde.produkte + ' aktiv', 'neutral');
        html += '</div>';
        html += '<p style="color:#64748b;font-size:13px;">Girokonto VR-MeinKonto, EC-Karte (Debit), Kreditkarte VISA Gold</p>';
        html += '</div>';

        // Kredit Tab
        html += '<div class="banking-detail-content" data-tab="kredit">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Baufinanzierung', sd.baufi || '—', sd.baufi !== '—' ? '' : '');
        html += '</div>';
        html += '</div>';

        // Wertpapiere Tab
        html += '<div class="banking-detail-content" data-tab="wertpapiere">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Depot', sd.depot || 'Kein Depot', sd.depot ? 'neutral' : '');
        html += '</div>';
        html += '</div>';

        // Versicherung Tab
        html += '<div class="banking-detail-content" data-tab="versicherung">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Versicherungen', sd.versicherung || '—', '');
        html += '</div>';
        html += '</div>';

        // FIDA Tab (Showstopper)
        html += '<div class="banking-detail-content" data-tab="fida">';
        html += buildFidaPanel(fidaSourcesRetail, kiEmpfehlungenRetail);
        html += '</div>';

        // Beratungshistorie Tab
        html += '<div class="banking-detail-content" data-tab="historie">';
        html += buildHistorie([
            { datum: '12.02.2026', titel: 'VR-FinanzPlan-Gespraech', desc: 'Ganzheitliche Beratung, Sparplan + Baufi-Sondertilgung besprochen' },
            { datum: '28.11.2025', titel: 'Kreditkarten-Beratung', desc: 'VISA Gold beantragt, Freischaltung erfolgt' },
            { datum: '15.09.2025', titel: 'Jahresgespraech', desc: 'Kundenzufriedenheit hoch, Cross-Selling-Potenzial identifiziert' }
        ]);
        html += '</div>';

        contentArea.innerHTML = html;

        // Activate first tab
        activateFirstTab();
    }

    // ── fillFirmenkundeDetail ─────────────────
    function fillFirmenkundeDetail(kundenId) {
        var kunde = (window.bankFirmenKunden || []).find(function(k) { return k.id === kundenId; });
        if (!kunde) return;

        // Header
        var header = document.getElementById('kdBankHeaderName');
        var meta = document.getElementById('kdBankHeaderMeta');
        var avatar = document.getElementById('kdBankAvatar');
        if (header) header.textContent = kunde.name;
        if (meta) meta.textContent = kunde.id + ' | ' + kunde.ort + ' | ' + kunde.brancheLabel;
        if (avatar) avatar.textContent = kunde.name.split(' ')[0][0];

        fillStickyBar(kunde.name, kunde.id, 'FK-Beraterin Carola Weiss');

        // Tabs: Firmenkunde
        var tabsHtml = buildTabsHtml([
            { id: 'stammdaten', label: 'Stammdaten' },
            { id: 'kredit', label: 'Kreditengagement' },
            { id: 'zv', label: 'Zahlungsverkehr' },
            { id: 'rating', label: 'Rating & Risiko' },
            { id: 'foerder', label: 'Foerdermittel' },
            { id: 'fida', label: 'Open Finance / FIDA', fida: true },
            { id: 'ansprech', label: 'Ansprechpartner' }
        ]);
        var tabContainer = document.getElementById('kdBankTabs');
        if (tabContainer) tabContainer.innerHTML = tabsHtml;

        var contentArea = document.getElementById('kdBankContent');
        if (!contentArea) return;

        var html = '';

        // Stammdaten
        html += '<div class="banking-detail-content active" data-tab="stammdaten">';
        html += '<div class="banking-stammdaten-grid">';
        html += infoItem('Firma', kunde.name);
        html += infoItem('Kunden-Nr.', kunde.id);
        html += infoItem('Branche', kunde.brancheLabel);
        html += infoItem('Standort', kunde.ort);
        html += infoItem('Mitarbeiter', kunde.mitarbeiter.toString());
        html += infoItem('Jahresumsatz', fmtEuro(kunde.umsatz));
        html += infoItem('Rating', kunde.rating);
        html += infoItem('Rechtsform', kunde.name.includes('GmbH') ? 'GmbH' : kunde.name.includes('AG') ? 'AG' : kunde.name.includes('OHG') ? 'OHG' : kunde.name.includes('KG') ? 'KG' : 'Einzelunternehmen');
        html += '</div></div>';

        // Kreditengagement
        html += '<div class="banking-detail-content" data-tab="kredit">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Kreditvolumen', fmtEuro(kunde.kreditvol), 'neutral');
        html += kpiBox('Rating', kunde.rating, 'positive');
        html += kpiBox('Sicherheiten', 'Grundschuld + Buergschaft', '');
        html += '</div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Kreditart</th><th>Volumen</th><th>Zinssatz</th><th>Laufzeit</th><th>Tilgung</th></tr></thead>';
        html += '<tbody>';
        html += '<tr><td>Investitionskredit</td><td class="text-right">' + fmtEuro(kunde.kreditvol * 0.6) + '</td><td>3,85%</td><td>bis 12/2030</td><td>Annuitaet</td></tr>';
        html += '<tr><td>Betriebsmittelkredit</td><td class="text-right">' + fmtEuro(kunde.kreditvol * 0.3) + '</td><td>4,20%</td><td>revolvierend</td><td>endfaellig</td></tr>';
        html += '<tr><td>Kontokorrent</td><td class="text-right">' + fmtEuro(kunde.kreditvol * 0.1) + '</td><td>6,50%</td><td>unbefristet</td><td>—</td></tr>';
        html += '</tbody></table></div>';

        // Zahlungsverkehr
        html += '<div class="banking-detail-content" data-tab="zv">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('ZV-Volumen/Monat', '285 Tsd. EUR', '');
        html += kpiBox('SEPA-Lastschriften', '148/Monat', '');
        html += kpiBox('Auslandszahlungen', '12/Monat', '');
        html += '</div></div>';

        // Rating & Risiko
        html += '<div class="banking-detail-content" data-tab="rating">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Rating', kunde.rating, 'positive');
        html += kpiBox('PD (1 Jahr)', '0,15%', 'positive');
        html += kpiBox('EWB-Quote', '0,0%', 'positive');
        html += '</div></div>';

        // Foerdermittel
        html += '<div class="banking-detail-content" data-tab="foerder">';
        html += '<p style="font-size:13px;color:#64748b;">Aktuelle Foerderprogramme fuer ' + kunde.brancheLabel + ':</p>';
        html += '<ul style="font-size:13px;color:#334155;line-height:1.8;">';
        html += '<li>KfW-Unternehmerkredit (073) — bis 25 Mio. EUR</li>';
        html += '<li>KfW-Klimaschutzoffensive (293) — ab 1,03% eff.</li>';
        html += '<li>Hessen Mikrodarlehen — bis 25 Tsd. EUR</li>';
        html += '</ul></div>';

        // FIDA Tab
        html += '<div class="banking-detail-content" data-tab="fida">';
        html += buildFidaPanel(fidaSourcesFirmenkunde, kiEmpfehlungenFirmenkunde);
        html += '</div>';

        // Ansprechpartner
        html += '<div class="banking-detail-content" data-tab="ansprech">';
        html += '<div class="banking-stammdaten-grid">';
        html += infoItem('Geschaeftsfuehrer', 'Max Schaefer');
        html += infoItem('Telefon', '+49 641 12345-0');
        html += infoItem('CFO / Finanzen', 'Dr. Anna Berger');
        html += infoItem('E-Mail', 'info@' + kunde.id.toLowerCase() + '.de');
        html += '</div></div>';

        contentArea.innerHTML = html;
        activateFirstTab();
    }

    // ── fillVermoegenDetail ────────────────────
    function fillVermoegenDetail(kundenId) {
        var kunde = (window.bankVermoegenKunden || []).find(function(k) { return k.id === kundenId; });
        if (!kunde) return;

        // Header
        var header = document.getElementById('kdBankHeaderName');
        var meta = document.getElementById('kdBankHeaderMeta');
        var avatar = document.getElementById('kdBankAvatar');
        if (header) header.textContent = kunde.name;
        if (meta) meta.textContent = kunde.id + ' | ' + kunde.ort + ' | Private Banking';
        if (avatar) avatar.textContent = kunde.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2);

        fillStickyBar(kunde.name, kunde.id, 'PB-Beraterin Dr. Julia Rademacher');

        // Tabs: Vermoegen
        var tabsHtml = buildTabsHtml([
            { id: 'stammdaten', label: 'Stammdaten' },
            { id: 'depot', label: 'Depot & Vermoegensverwaltung' },
            { id: 'vorsorge', label: 'Vorsorge-Check' },
            { id: 'nachfolge', label: 'Nachfolge' },
            { id: 'mifid', label: 'MiFID & Dokumentation' },
            { id: 'fida', label: 'Open Finance / FIDA', fida: true },
            { id: 'timeline', label: 'Beziehungs-Timeline' }
        ]);
        var tabContainer = document.getElementById('kdBankTabs');
        if (tabContainer) tabContainer.innerHTML = tabsHtml;

        var contentArea = document.getElementById('kdBankContent');
        if (!contentArea) return;

        var html = '';

        // Drei-Saeulen-Karten
        html += '<div class="banking-saeulen-grid">';
        html += '<div class="banking-saeulen-card anlage"><h5>Saeule I — Anlage</h5>';
        html += saeulenMetric('Depot-Volumen', fmtEuro(kunde.depot));
        html += saeulenMetric('Performance YTD', '+6,8%');
        html += saeulenMetric('Strategie', 'Ausgewogen');
        html += '</div>';
        html += '<div class="banking-saeulen-card vorsorge"><h5>Saeule II — Vorsorge</h5>';
        html += saeulenMetric('Vorsorge-Volumen', fmtEuro(kunde.vorsorge));
        html += saeulenMetric('Versorgungsluecke', '1.200 EUR/Monat');
        html += saeulenMetric('Naechster Check', 'Q2/2026');
        html += '</div>';
        html += '<div class="banking-saeulen-card nachfolge"><h5>Saeule III — Nachfolge</h5>';
        html += saeulenMetric('Status', kunde.nachfolge ? 'In Planung' : 'Offen');
        html += saeulenMetric('Stiftung', kunde.stiftung ? 'Vorhanden' : 'Nicht geplant');
        html += saeulenMetric('Testament', kunde.nachfolge ? 'Entwurf vorhanden' : 'Ausstehend');
        html += '</div></div>';

        // Stammdaten
        html += '<div class="banking-detail-content active" data-tab="stammdaten">';
        html += '<div class="banking-stammdaten-grid">';
        html += infoItem('Name', kunde.name);
        html += infoItem('Kunden-Nr.', kunde.id);
        html += infoItem('Standort', kunde.ort);
        html += infoItem('AuM Gesamt', fmtEuro(kunde.aum));
        html += infoItem('Betreuung seit', '2019');
        html += infoItem('Risikoprofil', 'Ausgewogen');
        html += '</div></div>';

        // Depot Tab
        html += '<div class="banking-detail-content" data-tab="depot">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Depot-Volumen', fmtEuro(kunde.depot), 'neutral');
        html += kpiBox('Performance YTD', '+6,8%', 'positive');
        html += kpiBox('Ausschuettungen', '42.500 EUR/Jahr', '');
        html += '</div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Position</th><th>ISIN</th><th>Anteil</th><th>Wert</th><th>Performance</th></tr></thead>';
        html += '<tbody>';
        html += '<tr><td>Union Investment - UniGlobal</td><td>DE0008491051</td><td>35%</td><td class="text-right">' + fmtEuro(kunde.depot * 0.35) + '</td><td class="text-right" style="color:#16a34a">+8,2%</td></tr>';
        html += '<tr><td>DWS Top Dividende</td><td>DE0009848119</td><td>25%</td><td class="text-right">' + fmtEuro(kunde.depot * 0.25) + '</td><td class="text-right" style="color:#16a34a">+5,4%</td></tr>';
        html += '<tr><td>Staatsanleihen EUR</td><td>DE0001135481</td><td>20%</td><td class="text-right">' + fmtEuro(kunde.depot * 0.20) + '</td><td class="text-right" style="color:#16a34a">+2,1%</td></tr>';
        html += '<tr><td>Immobilienfonds</td><td>DE0009807016</td><td>15%</td><td class="text-right">' + fmtEuro(kunde.depot * 0.15) + '</td><td class="text-right" style="color:#16a34a">+3,8%</td></tr>';
        html += '<tr><td>Cash-Reserve</td><td>—</td><td>5%</td><td class="text-right">' + fmtEuro(kunde.depot * 0.05) + '</td><td class="text-right">—</td></tr>';
        html += '</tbody></table></div>';

        // Vorsorge Tab
        html += '<div class="banking-detail-content" data-tab="vorsorge">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Vorsorge-Volumen', fmtEuro(kunde.vorsorge), 'neutral');
        html += kpiBox('Versorgungsluecke', '1.200 EUR/Monat', 'negative');
        html += '</div></div>';

        // Nachfolge Tab
        html += '<div class="banking-detail-content" data-tab="nachfolge">';
        html += '<div class="bank-kpi-row">';
        html += kpiBox('Nachfolgestatus', kunde.nachfolge ? 'In Planung' : 'Offen', kunde.nachfolge ? 'positive' : 'negative');
        html += kpiBox('Stiftung', kunde.stiftung ? 'Aktiv' : 'Nicht geplant', kunde.stiftung ? 'positive' : '');
        html += '</div></div>';

        // MiFID Tab
        html += '<div class="banking-detail-content" data-tab="mifid">';
        html += '<div class="banking-stammdaten-grid">';
        html += infoItem('Risikoprofil', 'Ausgewogen (Stufe 3/5)');
        html += infoItem('Letzte Aktualisierung', '15.01.2026');
        html += infoItem('Anlageerfahrung', '> 10 Jahre');
        html += infoItem('WpHG-Bogen', 'Aktuell');
        html += '</div></div>';

        // FIDA Tab
        html += '<div class="banking-detail-content" data-tab="fida">';
        html += buildFidaPanel(fidaSourcesVermoegen, kiEmpfehlungenVermoegen);
        html += '</div>';

        // Beziehungs-Timeline
        html += '<div class="banking-detail-content" data-tab="timeline">';
        html += buildHistorie([
            { datum: '05.02.2026', titel: 'Quartalsgespraech Q1', desc: 'Portfolio-Review, Depot-Performance besprochen, Nachfolgeplanung vertagt' },
            { datum: '18.11.2025', titel: 'Stiftungsgruendung', desc: 'Gemeinnuetzige Stiftung "Bildung Mittelhessen" gegruendet' },
            { datum: '22.08.2025', titel: 'Depot-Rebalancing', desc: 'Umschichtung: Aktienquote von 65% auf 55% reduziert' },
            { datum: '10.03.2025', titel: 'Erstgespraech Nachfolge', desc: 'Generationenberatung gestartet, Notar-Termin vereinbart' }
        ]);
        html += '</div>';

        contentArea.innerHTML = html;
        activateFirstTab();
    }

    // ── Helper: buildTabsHtml ─────────────────
    function buildTabsHtml(tabs) {
        var html = '';
        tabs.forEach(function(t, i) {
            var fidaClass = t.fida ? ' banking-detail-tab-fida' : '';
            var activeClass = i === 0 ? ' active' : '';
            html += '<button class="banking-detail-tab' + fidaClass + activeClass + '" data-tab="' + t.id + '" onclick="switchBankDetailTab(\'' + t.id + '\')"';
            if (t.fida) html += ' style="color:#FF6600;font-weight:700;"';
            html += '>' + t.label + '</button>';
        });
        return html;
    }

    // ── Helper: buildFidaPanel ────────────────
    function buildFidaPanel(sources, empfehlungen) {
        var html = '<div class="open-finance-panel">';
        html += '<div class="open-finance-header"><h4>Open Finance / FIDA</h4><span class="open-finance-badge">CONSENT ERTEILT</span></div>';

        // Consent-Bar
        html += '<div style="background:rgba(34,197,94,0.1);padding:10px 24px;display:flex;align-items:center;gap:8px;font-size:12px;color:#86efac;border-bottom:1px solid rgba(255,255,255,0.1);">';
        html += '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;"></span>';
        html += 'Kunde hat Datenweitergabe-Consent erteilt (FIDA Art. 5). Letzte Aktualisierung: 01.02.2026</div>';

        // Sources
        html += '<div class="open-finance-sources">';
        sources.forEach(function(s) {
            html += '<div class="of-source-card">';
            html += '<div class="of-source-name"><span class="of-source-status"></span> ' + s.bank + '</div>';
            html += '<div class="of-source-detail">' + s.daten + '</div>';
            html += '<div style="font-size:11px;color:#FF6600;font-weight:600;margin-top:6px;">' + s.signal + '</div>';
            html += '</div>';
        });
        html += '</div>';

        // KI-Empfehlungen
        html += '<div class="of-ki-recommendations">';
        html += '<h4 style="color:white;font-size:14px;font-weight:700;margin:16px 24px 12px;display:flex;align-items:center;gap:6px;">KI-generierte Handlungsempfehlungen</h4>';
        empfehlungen.forEach(function(e) {
            html += '<div class="of-ki-recommendation">';
            html += '<div class="of-ki-header"><span class="of-ki-title">' + e.title + '</span><span class="of-ki-priority ' + e.prio + '">' + e.prio.toUpperCase() + '</span></div>';
            html += '<div class="of-ki-text">' + e.text + '</div>';
            html += '<div class="of-ki-potential">' + e.potential + '</div>';
            html += '</div>';
        });
        html += '</div>';

        html += '</div>';
        return html;
    }

    // ── Helper: buildHistorie ─────────────────
    function buildHistorie(entries) {
        var html = '<div style="padding:8px 0;">';
        entries.forEach(function(e) {
            html += '<div style="display:flex;gap:16px;padding:14px 0;border-bottom:1px solid #f1f5f9;">';
            html += '<div style="font-size:12px;color:#94a3b8;min-width:80px;font-weight:600;">' + e.datum + '</div>';
            html += '<div style="width:10px;height:10px;border-radius:50%;background:#003399;margin-top:4px;flex-shrink:0;"></div>';
            html += '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#1e293b;">' + e.titel + '</div>';
            html += '<div style="font-size:12px;color:#64748b;margin-top:2px;">' + e.desc + '</div></div>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    // ── Helper: infoItem ──────────────────────
    function infoItem(label, value) {
        return '<div class="banking-info-item"><span class="banking-info-label">' + label + '</span><span class="banking-info-value">' + value + '</span></div>';
    }

    // ── Helper: kpiBox ────────────────────────
    function kpiBox(label, value, cls) {
        return '<div class="bank-kpi-box"><span class="bank-kpi-label">' + label + '</span><span class="bank-kpi-value' + (cls ? ' ' + cls : '') + '">' + value + '</span></div>';
    }

    // ── Helper: saeulenMetric ─────────────────
    function saeulenMetric(label, value) {
        return '<div class="banking-saeulen-metric"><span class="label">' + label + '</span><span class="value">' + value + '</span></div>';
    }

    // ── Helper: fillStickyBar ─────────────────
    function fillStickyBar(name, id, berater) {
        var bar = document.getElementById('kdBankStickyBar');
        if (!bar) return;
        bar.innerHTML = '<div class="bank-sticky-info"><div><div class="bank-sticky-name">' + name + '</div><div class="bank-sticky-id">' + id + ' | ' + berater + '</div></div></div>';
    }

    // ── Helper: beraterLabel ──────────────────
    function beraterLabel(mode) {
        if (mode === 'retail') return 'Privatkundenberater Thomas Berger';
        if (mode === 'firmenkunde') return 'FK-Beraterin Carola Weiss';
        if (mode === 'vermoegen') return 'PB-Beraterin Dr. Julia Rademacher';
        return '';
    }

    // ── switchBankDetailTab ───────────────────
    function switchBankDetailTab(tabId) {
        // Tabs
        document.querySelectorAll('#kdBankTabs .banking-detail-tab').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        // Content
        document.querySelectorAll('#kdBankContent .banking-detail-content').forEach(function(c) {
            c.classList.toggle('active', c.dataset.tab === tabId);
        });
    }

    // ── activateFirstTab ──────────────────────
    function activateFirstTab() {
        var firstTab = document.querySelector('#kdBankTabs .banking-detail-tab');
        if (firstTab) {
            switchBankDetailTab(firstTab.dataset.tab);
        }
    }

    // ── Expose globally ──────────────────────
    window.openBankKundenDetail = openBankKundenDetail;
    window.closeBankKundenDetail = closeBankKundenDetail;
    window.switchBankDetailTab = switchBankDetailTab;

})();
