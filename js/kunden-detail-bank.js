/* ============================================================
   B-10 KUNDEN-DETAIL BANK  –  Banking Customer Detail
   Mirrors kunden-detail.js (A-10) structure exactly
   ============================================================ */

// ── MOCK KUNDEN DETAIL DATA ──
var bankMockKunden = {
    'Klaus Fischer': {
        geburtsdatum:'12.05.1978', adresse:'Hauptstraße 45, 35390 Gießen', telefon:'+49 641 98765', email:'k.fischer@email.de',
        beruf:'Maschinenbau-Ingenieur', familienstand:'Verheiratet', arbeitgeber:'Continental AG', beschaeftigtSeit:'01.04.2008',
        nettoeinkommen:4850, kinder:[{name:'Lukas',alter:12},{name:'Emma',alter:9}],
        risikoscore:28, bonitaet:82,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Plus', details:'IBAN DE89 5066 1639 0012 3456 78', saldo:8450, eroeffnung:'15.03.2010', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:42000, eroeffnung:'01.06.2020', status:'Aktiv' },
            { produkt:'Baufinanzierung', details:'Restschuld, Zinsbindung bis 09/2026', saldo:-185000, eroeffnung:'01.09.2016', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'ETF-Sparplan 300/Mon.', saldo:28500, eroeffnung:'15.01.2022', status:'Aktiv' },
            { produkt:'Riester-Rente VR', details:'Beitrag 175/Mon.', saldo:18200, eroeffnung:'01.04.2018', status:'Aktiv' },
            { produkt:'Unfallversicherung', details:'Grundsumme 80.000', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Gießen', typ:'Girokonto', info:'Zweitkonto, Gehalt', consent:'12.01.2026', gueltig:'12.01.2027' },
            { institut:'ING', typ:'Extra-Konto', info:'Tagesgeld €18.500', consent:'12.01.2026', gueltig:'12.01.2027' },
            { institut:'Trade Republic', typ:'Depot', info:'ETF-Sparplan 200/Mon.', consent:'12.01.2026', gueltig:'12.01.2027' }
        ],
        // ── BEDARFSFELD: SPAREN & VORSORGEN ──
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:42000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' },
            { produkt:'Tagesgeldkonto', anbieter:'ING', volumen:18500, zinssatz:'2,75% p.a.', laufzeit:'Flexibel', quelle:'FIDA' }
        ],
        sparenKapitalmarkt: [
            { produkt:'VR-MeinDepot ETF-Sparplan', anbieter:'Union Investment', volumen:28500, sparrate:'€300/Mon.', performance:'+9,4%' },
            { produkt:'Riester-Rente VR', anbieter:'Union Investment', volumen:18200, sparrate:'€175/Mon.', performance:'+4,2%' },
            { produkt:'ETF-Portfolio', anbieter:'Trade Republic', volumen:12800, sparrate:'€200/Mon.', performance:'+11,7%', quelle:'FIDA' }
        ],
        // ── BEDARFSFELD: ABSICHERN ──
        versicherungenEigen: [
            { versicherung:'Unfallversicherung', anbieter:'R+V Versicherung', deckung:'Grundsumme €80.000', tarifart:'Komfort', leistungen:['Invalidität','Bergungskosten','Krankenhaustagegeld'], praemie:'€180/Jahr', vertrag:'UV-2020-11234' },
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€200.000', tarifart:'Premium', leistungen:['Todesfallschutz','Nachversicherung','Vorgezogene Leistung'], praemie:'€240/Jahr', vertrag:'RL-2016-44821' }
        ],
        versicherungenFremd: [
            { versicherung:'Kfz-Versicherung', anbieter:'HUK-Coburg', deckung:'VK €45.000 / TK €20.000', tarifart:'Standard', leistungen:['Marderschäden','Auslandsschutz'], selbstbehalt:'€300 VK', praemie:'€680/Jahr', kuendigung:'30.11.2026' },
            { versicherung:'Hausratversicherung', anbieter:'Allianz', deckung:'€75.000', tarifart:'Komfort', leistungen:['Fahrraddiebstahl','Überspannung','Elementar'], selbstbehalt:'€150', praemie:'€165/Jahr', kuendigung:'01.03.2027' },
            { versicherung:'Privathaftpflicht', anbieter:'HUK24', deckung:'€50 Mio. pauschal', tarifart:'Premium', leistungen:['Schlüsselverlust','Ehrenamt','Deliktunfähige Kinder'], selbstbehalt:'€0', praemie:'€68/Jahr', kuendigung:'01.01.2027' }
        ],
        // ── BEDARFSFELD: FINANZIEREN ──
        finanzierungen: [
            { kredit:'Baufinanzierung', kreditgeber:'Volksbank Mittelhessen', ursprung:280000, restschuld:185000, zinssatz:'1,85% p.a.', rate:'€1.180/Mon.', laufzeit:'09/2026', absicherung:'Grundschuld', hinweis:'Zinsbindung endet 09/2026 – Anschlussfinanzierung erforderlich' }
        ],
        kommunikation: [
            { typ:'email', datum:'28.02.2026', betreff:'Anschlussfinanzierung Angebot', inhalt:'Angebot für Baufi-Anschluss gesendet', status:'Geöffnet' },
            { typ:'call', datum:'20.02.2026', betreff:'Telefonat Baufinanzierung', inhalt:'Beratungsgespräch zu Anschlussoptionen', status:'Erledigt' },
            { typ:'termin', datum:'15.02.2026', betreff:'Jahresgespräch', inhalt:'VR-FinanzPlan Review durchgeführt', status:'Erledigt' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Depot + Konten', status:'Versendet' }
        ],
        avatarBg:'#2563eb', foto:'assets/images/AdobeStock_624564221.jpeg'
    },
    'Sandra Müller': {
        geburtsdatum:'23.11.1985', adresse:'Bahnhofstr. 12, 35578 Wetzlar', telefon:'+49 6441 55432', email:'s.mueller@email.de',
        beruf:'Ärztin', familienstand:'Ledig', arbeitgeber:'Uniklinik Gießen', beschaeftigtSeit:'01.08.2015',
        nettoeinkommen:5200, kinder:[{name:'Mia',alter:4}],
        risikoscore:15, bonitaet:91,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:6},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:7}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0098 7654 32', saldo:12800, eroeffnung:'01.09.2015', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:85000, eroeffnung:'15.03.2020', status:'Aktiv' },
            { produkt:'VR-Festgeld 12M', details:'3,2% p.a., Fälligkeit 06/2026', saldo:50000, eroeffnung:'01.06.2025', status:'Aktiv' },
            { produkt:'Kreditkarte Gold', details:'Limit 5.000', saldo:-1200, eroeffnung:'01.01.2018', status:'Aktiv' },
            { produkt:'Berufsunfähigkeitsvers.', details:'BU-Rente €2.500/Mon., Endalter 67', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Commerzbank', typ:'Girokonto', info:'Gehaltskonto €5.200/Mon.', consent:'20.01.2026', gueltig:'20.01.2027' },
            { institut:'N26', typ:'Girokonto', info:'Zweitkonto, Reisen', consent:'20.01.2026', gueltig:'20.01.2027' },
            { institut:'Scalable Capital', typ:'Depot', info:'ETF-Portfolio €32.000', consent:'20.01.2026', gueltig:'20.01.2027' }
        ],
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:85000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' },
            { produkt:'VR-Festgeld 12M', anbieter:'Volksbank Mittelhessen', volumen:50000, zinssatz:'3,20% p.a.', laufzeit:'bis 06/2026' }
        ],
        sparenKapitalmarkt: [
            { produkt:'ETF-Portfolio', anbieter:'Scalable Capital', volumen:32000, sparrate:'€500/Mon.', performance:'+10,8%', quelle:'FIDA' }
        ],
        versicherungenEigen: [
            { versicherung:'Berufsunfähigkeitsversicherung', anbieter:'R+V Versicherung', deckung:'BU-Rente €2.500/Mon.', tarifart:'Premium', leistungen:['Endalter 67','Nachversicherung','Weltweiter Schutz'], praemie:'€125/Monat', vertrag:'BU-2020-55891' }
        ],
        versicherungenFremd: [
            { versicherung:'Privathaftpflicht', anbieter:'Allianz', deckung:'€50 Mio.', tarifart:'Komfort', leistungen:['Schlüsselverlust','Mietsachschäden'], selbstbehalt:'€150', praemie:'€58/Jahr', kuendigung:'01.04.2027' }
        ],
        finanzierungen: [],
        kommunikation: [
            { typ:'email', datum:'25.02.2026', betreff:'Festgeld Verlängerung', inhalt:'Info zu Festgeld-Konditionen bei Fälligkeit', status:'Geöffnet' },
            { typ:'call', datum:'18.02.2026', betreff:'Altersvorsorge-Beratung', inhalt:'Erstgespräch Altersvorsorge-Konzept', status:'Erledigt' },
            { typ:'termin', datum:'05.02.2026', betreff:'VR-FinanzPlan Erstberatung', inhalt:'Ganzheitliche Finanzplanung besprochen', status:'Erledigt' },
            { typ:'email', datum:'15.01.2026', betreff:'Depotvergleich', inhalt:'Vergleich VR-MeinDepot vs. Scalable Capital', status:'Versendet' }
        ],
        avatarBg:'#9333ea', foto:'assets/images/AdobeStock_252262042.jpeg'
    },
    'Markus Wagner': {
        geburtsdatum:'08.03.1972', adresse:'Schulstr. 8, 35037 Marburg', telefon:'+49 6421 77890', email:'m.wagner@email.de',
        beruf:'Lehrer', familienstand:'Verheiratet', arbeitgeber:'Land Hessen', beschaeftigtSeit:'01.02.2000',
        nettoeinkommen:3800, kinder:[{name:'Tim',alter:14},{name:'Jana',alter:11}],
        risikoscore:22, bonitaet:75,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:9},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0045 6789 01', saldo:4200, eroeffnung:'01.03.2005', status:'Aktiv' },
            { produkt:'Bausparvertrag', details:'Wüstenrot, Bausparsumme 60.000', saldo:35000, eroeffnung:'01.01.2012', status:'Aktiv' },
            { produkt:'Riester-Rente VR', details:'Beitrag 162,17/Mon.', saldo:22400, eroeffnung:'01.01.2010', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €200.000, Laufzeit bis 2035', saldo:0, eroeffnung:'01.06.2015', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Marburg', typ:'Girokonto', info:'Gehaltskonto Ehefrau', consent:'10.02.2026', gueltig:'10.02.2027' }
        ],
        sparenGeldmarkt: [],
        sparenKapitalmarkt: [
            { produkt:'Bausparvertrag', anbieter:'Wüstenrot', volumen:35000, sparrate:'€250/Mon.', performance:'1,0%' },
            { produkt:'Riester-Rente VR', anbieter:'Union Investment', volumen:22400, sparrate:'€162/Mon.', performance:'+3,8%' }
        ],
        versicherungenEigen: [
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€200.000', tarifart:'Standard', leistungen:['Todesfallschutz','Laufzeit bis 2035'], praemie:'€180/Jahr', vertrag:'RL-2015-22450' }
        ],
        versicherungenFremd: [],
        finanzierungen: [],
        kommunikation: [
            { typ:'termin', datum:'20.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Jährliches Review der Finanzplanung', status:'Erledigt' },
            { typ:'email', datum:'10.02.2026', betreff:'ETF-Sparplan Info', inhalt:'Informationen zu VR-MeinDepot Sparplan', status:'Geöffnet' },
            { typ:'call', datum:'28.01.2026', betreff:'Depoteröffnung Interesse', inhalt:'Telefonat zu ETF-Sparplänen für Kinder', status:'Erledigt' }
        ],
        avatarBg:'#16a34a', foto:'assets/images/AdobeStock_361342769.jpeg'
    },
    'Julia Becker': {
        geburtsdatum:'15.07.1990', adresse:'Ludwigstr. 22, 35390 Gießen', telefon:'+49 641 33210', email:'j.becker@email.de',
        beruf:'Marketing-Managerin', familienstand:'Ledig', arbeitgeber:'Amazon DE', beschaeftigtSeit:'01.03.2019',
        nettoeinkommen:3600, kinder:[],
        risikoscore:18, bonitaet:88,
        nps: { score:6, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:6},{name:'Zufriedenheit',wert:5},{name:'Weiterempfehlung',wert:6},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:6}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0023 4567 89', saldo:5800, eroeffnung:'01.05.2019', status:'Aktiv' },
            { produkt:'Kreditkarte Classic', details:'Limit 3.000', saldo:-450, eroeffnung:'01.06.2019', status:'Aktiv' }
        ],
        fidaVertraege: [],
        sparenGeldmarkt: [],
        sparenKapitalmarkt: [],
        versicherungenEigen: [],
        versicherungenFremd: [],
        finanzierungen: [],
        kommunikation: [
            { typ:'email', datum:'18.02.2026', betreff:'FIDA-Consent Einladung', inhalt:'Open Finance Datenfreigabe angefragt', status:'Geöffnet' },
            { typ:'call', datum:'05.02.2026', betreff:'Erstberatung', inhalt:'Telefonat zur ganzheitlichen Beratung', status:'Erledigt' }
        ],
        avatarBg:'#f59e0b', foto:null
    },
    'Peter Hoffmann': {
        geburtsdatum:'30.01.1970', adresse:'Friedrichstr. 5, 35578 Wetzlar', telefon:'+49 6441 88456', email:'p.hoffmann@email.de',
        beruf:'Steuerberater', familienstand:'Verheiratet', arbeitgeber:'Selbständig', beschaeftigtSeit:'01.01.1998',
        nettoeinkommen:7500, kinder:[{name:'Fabian',alter:22},{name:'Laura',alter:19}],
        risikoscore:35, bonitaet:79,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Premium', details:'IBAN DE89 5066 1639 0034 5678 90', saldo:18200, eroeffnung:'01.01.2005', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Kanzlei Hoffmann & Partner', saldo:42500, eroeffnung:'01.01.2005', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:120000, eroeffnung:'01.03.2018', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'Aktien + ETF, Volumen €85.000', saldo:85000, eroeffnung:'15.06.2015', status:'Aktiv' },
            { produkt:'Baufinanzierung', details:'Tilgung 2,5%, Restschuld', saldo:-220000, eroeffnung:'01.04.2012', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €500.000', saldo:0, eroeffnung:'01.04.2012', status:'Aktiv' },
            { produkt:'Berufsunfähigkeitsvers.', details:'BU-Rente €3.000/Mon.', saldo:0, eroeffnung:'01.01.2005', status:'Aktiv' },
            { produkt:'Rechtsschutzversicherung', details:'Premium inkl. Beruf + Privat', saldo:0, eroeffnung:'01.01.2010', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Deutsche Bank', typ:'Girokonto', info:'Kanzleikonto €42.000', consent:'05.01.2026', gueltig:'05.01.2027' },
            { institut:'Deka', typ:'Depot', info:'Fondsanlage €65.000', consent:'05.01.2026', gueltig:'05.01.2027' },
            { institut:'Allianz', typ:'Lebensversicherung', info:'Kapital-LV, Ablauf 2030', consent:'05.01.2026', gueltig:'05.01.2027' }
        ],
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:120000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' }
        ],
        sparenKapitalmarkt: [
            { produkt:'VR-MeinDepot', anbieter:'Union Investment', volumen:85000, sparrate:'€500/Mon.', performance:'+8,1%' },
            { produkt:'Fondsanlage', anbieter:'Deka', volumen:65000, sparrate:'€300/Mon.', performance:'+6,5%', quelle:'FIDA' },
            { produkt:'Kapital-Lebensversicherung', anbieter:'Allianz', volumen:48000, sparrate:'€200/Mon.', performance:'+2,8%', quelle:'FIDA' }
        ],
        versicherungenEigen: [
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€500.000', tarifart:'Premium', leistungen:['Todesfallschutz','Nachversicherung'], praemie:'€420/Jahr', vertrag:'RL-2012-33567' },
            { versicherung:'Berufsunfähigkeitsversicherung', anbieter:'R+V Versicherung', deckung:'BU-Rente €3.000/Mon.', tarifart:'Premium', leistungen:['Endalter 67','Weltweiter Schutz','Selbständige'], praemie:'€185/Monat', vertrag:'BU-2005-11234' },
            { versicherung:'Rechtsschutzversicherung', anbieter:'R+V Versicherung', deckung:'€500.000 Privat+Beruf', tarifart:'Premium', leistungen:['Arbeitsrecht','Verkehr','Vertragsrecht'], praemie:'€295/Jahr', vertrag:'RS-2010-88912' }
        ],
        versicherungenFremd: [
            { versicherung:'Wohngebäudeversicherung', anbieter:'Allianz', deckung:'€520.000', tarifart:'Komfort', leistungen:['Elementarschäden','Glasbruch'], selbstbehalt:'€500', praemie:'€480/Jahr', kuendigung:'01.07.2026' }
        ],
        finanzierungen: [
            { kredit:'Baufinanzierung', kreditgeber:'Volksbank Mittelhessen', ursprung:350000, restschuld:220000, zinssatz:'2,10% p.a.', rate:'€1.450/Mon.', laufzeit:'04/2032', absicherung:'Grundschuld + RLV' }
        ],
        kommunikation: [
            { typ:'termin', datum:'15.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Jährliche Vermögensübersicht besprochen', status:'Erledigt' },
            { typ:'email', datum:'10.02.2026', betreff:'Vermögensverwaltung Angebot', inhalt:'VR-Vermögensverwaltung Konzept zugesandt', status:'Geöffnet' },
            { typ:'call', datum:'28.01.2026', betreff:'Nachfolgeplanung Kanzlei', inhalt:'Erstgespräch Unternehmensnachfolge', status:'Erledigt' },
            { typ:'brief', datum:'15.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug alle Konten + Depot', status:'Versendet' }
        ],
        avatarBg:'#dc2626', foto:'assets/images/AdobeStock_612932760.jpeg'
    },
    'Andrea Lang': {
        geburtsdatum:'05.09.1982', adresse:'Marktplatz 3, 35423 Lich', telefon:'+49 6404 12345', email:'a.lang@email.de',
        beruf:'Steuerberaterin', familienstand:'Geschieden', arbeitgeber:'Kanzlei Lang & Partner', beschaeftigtSeit:'01.06.2012',
        nettoeinkommen:5800, kinder:[{name:'Sophie',alter:7}],
        risikoscore:20, bonitaet:85,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:8},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0056 7890 12', saldo:9800, eroeffnung:'01.01.2013', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Kanzlei Lang & Partner', saldo:28000, eroeffnung:'01.06.2012', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:50000, eroeffnung:'01.09.2019', status:'Aktiv' },
            { produkt:'Unfallversicherung', details:'Grundsumme €100.000, Progression 350%', saldo:0, eroeffnung:'01.01.2015', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €250.000', saldo:0, eroeffnung:'01.01.2016', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Lich', typ:'Girokonto', info:'Zweitkonto, Kindergeld', consent:'15.01.2026', gueltig:'15.01.2027' },
            { institut:'Union Investment', typ:'Depot', info:'Fondssparen €280/Mon.', consent:'15.01.2026', gueltig:'15.01.2027' }
        ],
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:50000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' }
        ],
        sparenKapitalmarkt: [
            { produkt:'Fondssparen', anbieter:'Union Investment', volumen:18500, sparrate:'€280/Mon.', performance:'+7,2%', quelle:'FIDA' }
        ],
        versicherungenEigen: [
            { versicherung:'Unfallversicherung', anbieter:'R+V Versicherung', deckung:'€100.000, Progression 350%', tarifart:'Premium', leistungen:['Invalidität','Bergungskosten','Kosmetische OPs'], praemie:'€245/Jahr', vertrag:'UV-2015-33789' },
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€250.000', tarifart:'Komfort', leistungen:['Todesfallschutz','Nachversicherung'], praemie:'€195/Jahr', vertrag:'RL-2016-44125' }
        ],
        versicherungenFremd: [],
        finanzierungen: [],
        kommunikation: [
            { typ:'termin', datum:'12.02.2026', betreff:'Gewerbekredit Beratung', inhalt:'Kanzleierweiterung – Finanzierungskonzept', status:'Erledigt' },
            { typ:'email', datum:'05.02.2026', betreff:'KfW-Förderung Info', inhalt:'Informationen zu KfW-Förderkrediten', status:'Geöffnet' },
            { typ:'call', datum:'20.01.2026', betreff:'Jahresplanung', inhalt:'Telefonat zur Kanzlei-Finanzplanung 2026', status:'Erledigt' }
        ],
        avatarBg:'#6366f1', foto:null
    },
    'Thomas Klein': {
        geburtsdatum:'18.12.1968', adresse:'Am Anger 7, 35418 Buseck', telefon:'+49 6408 99123', email:'t.klein@email.de',
        beruf:'Handwerksmeister', familienstand:'Verheiratet', arbeitgeber:'Klein Sanitär GmbH', beschaeftigtSeit:'01.01.1995',
        nettoeinkommen:4200, kinder:[{name:'Max',alter:16}],
        risikoscore:42, bonitaet:68,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:6},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0067 8901 23', saldo:3200, eroeffnung:'01.01.2000', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Klein Sanitär GmbH', saldo:15800, eroeffnung:'01.01.1995', status:'Aktiv' },
            { produkt:'KfW-Förderkredit', details:'Energetische Sanierung, Tilgung 1,5%', saldo:-75000, eroeffnung:'01.10.2025', status:'Aktiv' },
            { produkt:'Wohngebäudeversicherung', details:'Vers.-Summe €380.000, inkl. Elementar', saldo:0, eroeffnung:'01.01.2000', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Gießen', typ:'Girokonto', info:'Geschäftszweitkonto', consent:'08.02.2026', gueltig:'08.02.2027' }
        ],
        kommunikation: [
            { typ:'termin', datum:'10.02.2026', betreff:'KfW-Förderung Beratung', inhalt:'Energetische Sanierung – Fördermöglichkeiten', status:'Erledigt' },
            { typ:'email', datum:'25.01.2026', betreff:'Sanierungsfahrplan', inhalt:'Unterlagen Energieberatung zugesandt', status:'Geöffnet' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Geschäfts- + Privatkonto', status:'Versendet' }
        ],
        avatarBg:'#0891b2', foto:null
    },
    'Monika Richter': {
        geburtsdatum:'22.04.1975', adresse:'Goethering 15, 35390 Gießen', telefon:'+49 641 44567', email:'m.richter@email.de',
        beruf:'Lehrerin', familienstand:'Verheiratet', arbeitgeber:'Land Hessen', beschaeftigtSeit:'01.08.2002',
        nettoeinkommen:3400, kinder:[{name:'Anna',alter:10},{name:'Felix',alter:7}],
        risikoscore:12, bonitaet:80,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:8},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0078 9012 34', saldo:5600, eroeffnung:'01.09.2002', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:22000, eroeffnung:'01.01.2018', status:'Aktiv' },
            { produkt:'Unfallversicherung VR', details:'Familie, Grundsumme €120.000', saldo:0, eroeffnung:'01.08.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Gießen', typ:'Girokonto', info:'Gehaltskonto Ehemann €3.800', consent:'12.02.2026', gueltig:'12.02.2027' },
            { institut:'DWS', typ:'Depot', info:'Kindersparen 2x €50/Mon.', consent:'12.02.2026', gueltig:'12.02.2027' }
        ],
        kommunikation: [
            { typ:'termin', datum:'08.02.2026', betreff:'Beratung Unfallversicherung', inhalt:'Absicherung Familie erweitert', status:'Erledigt' },
            { typ:'email', datum:'01.02.2026', betreff:'Kindersparen Info', inhalt:'Informationen zu VR-MeinDepot Junior', status:'Geöffnet' }
        ],
        avatarBg:'#d946ef', foto:null
    },
    'Stefan Braun': {
        geburtsdatum:'11.06.1988', adresse:'Technikstr. 20, 35037 Marburg', telefon:'+49 6421 55678', email:'s.braun@email.de',
        beruf:'IT-Consultant', familienstand:'Ledig', arbeitgeber:'SAP SE', beschaeftigtSeit:'01.09.2018',
        nettoeinkommen:5500, kinder:[],
        risikoscore:10, bonitaet:92,
        nps: { score:5, kategorie:'detractor', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:5},{name:'Zufriedenheit',wert:4},{name:'Weiterempfehlung',wert:5},{name:'Preis-Leistung',wert:6},{name:'Erreichbarkeit',wert:5}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0089 0123 45', saldo:8200, eroeffnung:'01.10.2018', status:'Aktiv' },
            { produkt:'ETF-Depot VR', details:'MSCI World + EM, Sparplan €500/Mon.', saldo:25000, eroeffnung:'01.03.2023', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'N26', typ:'Girokonto', info:'Hauptkonto, Gehalt €5.500', consent:'25.01.2026', gueltig:'25.01.2027' },
            { institut:'Trade Republic', typ:'Depot', info:'Aktien + Krypto, €45.000', consent:'25.01.2026', gueltig:'25.01.2027' },
            { institut:'Scalable Capital', typ:'Depot', info:'ETF-Portfolio €18.000', consent:'25.01.2026', gueltig:'25.01.2027' }
        ],
        kommunikation: [
            { typ:'email', datum:'05.02.2026', betreff:'VR-FinanzPlan Einladung', inhalt:'Einladung zur ganzheitlichen Finanzberatung', status:'Geöffnet' },
            { typ:'call', datum:'20.01.2026', betreff:'Kundenbindungsgespräch', inhalt:'NPS-Rückmeldung besprochen, Verbesserungen zugesagt', status:'Erledigt' }
        ],
        avatarBg:'#ea580c', foto:null
    },
    'Katharina Wolf': {
        geburtsdatum:'03.03.1988', adresse:'Schillerstr. 9, 35390 Gießen', telefon:'+49 641 77890', email:'k.wolf@email.de',
        beruf:'Architektin', familienstand:'Verheiratet', arbeitgeber:'Wolf Architekten', beschaeftigtSeit:'01.01.2016',
        nettoeinkommen:4600, kinder:[{name:'Lara',alter:3}],
        risikoscore:25, bonitaet:84,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0090 1234 56', saldo:7400, eroeffnung:'01.01.2016', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Wolf Architekten', saldo:22000, eroeffnung:'01.01.2016', status:'Aktiv' },
            { produkt:'Bausparvertrag', details:'Schwäbisch Hall, Bausparsumme 80.000', saldo:40000, eroeffnung:'01.06.2020', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'ETF-Sparplan €200/Mon.', saldo:15600, eroeffnung:'01.01.2023', status:'Aktiv' },
            { produkt:'Baufinanzierung', details:'Tilgung 3%, Restschuld €180.000', saldo:-180000, eroeffnung:'01.03.2022', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Commerzbank', typ:'Girokonto', info:'Gehaltskonto Ehemann €4.200', consent:'18.01.2026', gueltig:'18.01.2027' },
            { institut:'Bausparkasse Schwäbisch Hall', typ:'Bausparvertrag', info:'Zuteilungsreif 2026', consent:'18.01.2026', gueltig:'18.01.2027' }
        ],
        sparenGeldmarkt: [],
        sparenKapitalmarkt: [
            { produkt:'VR-MeinDepot ETF-Sparplan', anbieter:'Union Investment', volumen:15600, sparrate:'€200/Mon.', performance:'+10,1%' },
            { produkt:'Bausparvertrag', anbieter:'Schwäbisch Hall', volumen:40000, sparrate:'€250/Mon.', performance:'1,0%' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [],
        finanzierungen: [
            { kredit:'Baufinanzierung', kreditgeber:'Volksbank Mittelhessen', ursprung:260000, restschuld:180000, zinssatz:'2,45% p.a.', rate:'€1.250/Mon.', laufzeit:'03/2037', absicherung:'Grundschuld' }
        ],
        kommunikation: [
            { typ:'termin', datum:'01.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Finanzplanung mit Immobilie + Kind aktualisiert', status:'Erledigt' },
            { typ:'email', datum:'25.01.2026', betreff:'Risikolebensversicherung', inhalt:'Angebot Absicherung Baufinanzierung', status:'Geöffnet' },
            { typ:'call', datum:'15.01.2026', betreff:'Bausparvertrag Zuteilung', inhalt:'Info zu Zuteilungsoptionen', status:'Erledigt' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug alle Konten', status:'Versendet' }
        ],
        avatarBg:'#059669', foto:null
    },
    'Jürgen Peters': {
        geburtsdatum:'14.10.1965', adresse:'Industriestr. 18, 35578 Wetzlar', telefon:'+49 6441 33789', email:'j.peters@email.de',
        beruf:'Geschäftsführer', familienstand:'Verheiratet', arbeitgeber:'Peters Metallbau GmbH', beschaeftigtSeit:'01.01.1992',
        nettoeinkommen:9500, kinder:[{name:'Stefan',alter:28},{name:'Maria',alter:25}],
        risikoscore:30, bonitaet:76,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:9},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto Premium', details:'IBAN DE89 5066 1639 0011 2233 44', saldo:25000, eroeffnung:'01.01.1992', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Peters Metallbau GmbH', saldo:185000, eroeffnung:'01.01.1992', status:'Aktiv' },
            { produkt:'Gewerbekredit', details:'Investitionskredit, Tilgung 3%', saldo:-250000, eroeffnung:'01.06.2024', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'Aktien + Fonds, Volumen €120.000', saldo:120000, eroeffnung:'01.01.2008', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €750.000 (Kreuzversicherung)', saldo:0, eroeffnung:'01.01.2000', status:'Aktiv' },
            { produkt:'Berufsunfähigkeitsvers.', details:'BU-Rente €4.000/Mon., Endalter 67', saldo:0, eroeffnung:'01.01.1995', status:'Aktiv' },
            { produkt:'Betriebliche Altersvorsorge', details:'Direktversicherung, Beitrag €535/Mon.', saldo:0, eroeffnung:'01.01.2005', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Deutsche Bank', typ:'Geschäftskonto', info:'Zweitkonto Firma €95.000', consent:'02.01.2026', gueltig:'02.01.2027' },
            { institut:'Deka', typ:'Depot', info:'Vermögensverwaltung €280.000', consent:'02.01.2026', gueltig:'02.01.2027' },
            { institut:'Swiss Life', typ:'Lebensversicherung', info:'Kapital-LV, Ablauf 2028, €180.000', consent:'02.01.2026', gueltig:'02.01.2027' },
            { institut:'Allianz', typ:'Sachversicherung', info:'Betriebshaftpflicht + Inhaltsvers.', consent:'02.01.2026', gueltig:'02.01.2027' }
        ],
        kommunikation: [
            { typ:'termin', datum:'28.01.2026', betreff:'Nachfolgeplanung', inhalt:'Unternehmensnachfolge – Sohn Stefan als Nachfolger', status:'Erledigt' },
            { typ:'email', datum:'22.01.2026', betreff:'Stiftungsmodell', inhalt:'Informationen zur Familienstiftung', status:'Geöffnet' },
            { typ:'call', datum:'15.01.2026', betreff:'Gewerbekredit Prolongation', inhalt:'Konditionen für Kreditverlängerung besprochen', status:'Erledigt' },
            { typ:'termin', datum:'08.01.2026', betreff:'Jahresgespräch Firma', inhalt:'Geschäftsentwicklung und Finanzierungsbedarf 2026', status:'Erledigt' },
            { typ:'brief', datum:'02.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Geschäfts- + Privatkonten', status:'Versendet' }
        ],
        avatarBg:'#7c3aed', foto:null
    },
    'Sabine Kraus': {
        geburtsdatum:'27.08.1979', adresse:'Apothekenstr. 2, 35423 Lich', telefon:'+49 6404 66789', email:'s.kraus@email.de',
        beruf:'Apothekerin', familienstand:'Verheiratet', arbeitgeber:'Löwen-Apotheke', beschaeftigtSeit:'01.01.2008',
        nettoeinkommen:5000, kinder:[{name:'Paul',alter:8},{name:'Clara',alter:5}],
        risikoscore:18, bonitaet:87,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:7}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0022 3344 55', saldo:8900, eroeffnung:'01.01.2008', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Löwen-Apotheke', saldo:35000, eroeffnung:'01.01.2008', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:45000, eroeffnung:'01.06.2018', status:'Aktiv' },
            { produkt:'Krankenversicherung ZV', details:'Privat-Zusatzvers., Familie', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Apobank', typ:'Girokonto', info:'Berufskonto Apotheker', consent:'10.01.2026', gueltig:'10.01.2027' },
            { institut:'Comdirect', typ:'Depot', info:'ETF + Einzelaktien €52.000', consent:'10.01.2026', gueltig:'10.01.2027' }
        ],
        kommunikation: [
            { typ:'email', datum:'25.01.2026', betreff:'Depot-Wechsel Angebot', inhalt:'VR-MeinDepot Vergleich zu Comdirect', status:'Geöffnet' },
            { typ:'call', datum:'18.01.2026', betreff:'Krankenversicherung Erweiterung', inhalt:'Zusatzversicherung für Kinder besprochen', status:'Erledigt' },
            { typ:'termin', datum:'10.01.2026', betreff:'Jahresgespräch', inhalt:'Finanzplanung Familie + Apotheke', status:'Erledigt' }
        ],
        avatarBg:'#be185d', foto:null
    }
};

// Default for any customer not explicitly defined
var bankDefaultKunde = {
    geburtsdatum:'01.01.1980', adresse:'Musterstr. 1, 35390 Gießen', telefon:'+49 641 00000', email:'kunde@email.de',
    beruf:'Angestellt', familienstand:'Ledig', arbeitgeber:'Firma GmbH', beschaeftigtSeit:'01.01.2010',
    nettoeinkommen:3500, kinder:[],
    risikoscore:25, bonitaet:75,
    nps: { score:7, kategorie:'passive', datum:'01.01.2026', kampagne:'Standard', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:7}] },
    konten: [{ produkt:'VR-Girokonto', details:'Standardkonto', saldo:2500, eroeffnung:'01.01.2015', status:'Aktiv' }],
    fidaVertraege: [],
    kommunikation: [{ typ:'email', datum:'01.01.2026', betreff:'Willkommen', inhalt:'Begrüßung', status:'Versendet' }],
    avatarBg:'#64748b', foto:null
};

// ── CUSTOMER PHOTOS MAP ──
var bankKundenFotos = {
    'Klaus Fischer': 'assets/images/AdobeStock_624564221.jpeg',
    'Sandra Müller': 'assets/images/AdobeStock_252262042.jpeg',
    'Markus Wagner': 'assets/images/AdobeStock_361342769.jpeg',
    'Peter Hoffmann': 'assets/images/AdobeStock_612932760.jpeg'
};

// ── FILL KUNDEN DETAIL (main entry) ──
function fillBankKundenDetail(kundenName) {
    var kd = bankMockKunden[kundenName] || bankDefaultKunde;
    
    // Also try to find retail data from berater-overview
    var retailData = null;
    if (typeof bankKundenRetail !== 'undefined') {
        for (var i = 0; i < bankKundenRetail.length; i++) {
            if (bankKundenRetail[i].name === kundenName) { retailData = bankKundenRetail[i]; break; }
        }
    }
    
    // Fill Stammdaten
    setTextById('bankKundenName', kundenName);
    setTextById('bankKundenVermittlerId', retailData ? retailData.id : 'KDB000');
    setTextById('bankKundenGeburtsdatum', kd.geburtsdatum);
    setTextById('bankKundenAdresse', kd.adresse);
    setTextById('bankKundenTelefon', kd.telefon);
    setTextById('bankKundenEmail', kd.email);
    setTextById('bankKundenBeruf', kd.beruf);
    setTextById('bankKundenFamilienstand', kd.familienstand);
    setTextById('bankKundenArbeitgeber', kd.arbeitgeber);
    setTextById('bankKundenBeschaeftigt', kd.beschaeftigtSeit);
    setTextById('bankKundenEinkommen', '\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '/Mon.');
    
    // Kinder
    var kinderEl = document.getElementById('bankKundenKinder');
    if (kinderEl) {
        if (kd.kinder.length === 0) {
            kinderEl.innerHTML = '<span style="color:#94a3b8;">Keine</span>';
        } else {
            kinderEl.innerHTML = kd.kinder.map(function(k) { return '<span class="kinder-badge">' + k.name + ' (' + k.alter + ' Jahre)</span>'; }).join('');
        }
    }
    
    // Customer photo
    var fotoEl = document.getElementById('bankKundenFoto');
    if (fotoEl) {
        var fotoPath = bankKundenFotos[kundenName] || (kd.foto);
        if (fotoPath) {
            fotoEl.innerHTML = '<img src="' + fotoPath + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentNode.innerHTML=\'<svg viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;><path d=&quot;M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2&quot;></path><circle cx=&quot;12&quot; cy=&quot;7&quot; r=&quot;4&quot;></circle></svg>\'">';
        } else {
            var bg = kd.avatarBg || '#64748b';
            var initials = getInitialsBerater(kundenName);
            fotoEl.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,' + bg + ',' + adjustColor(bg, -30) + ');display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:white;">' + initials + '</div>';
        }
    }
    
    // Risikoscore
    var risikoEl = document.getElementById('bankRisikoScoreDisplay');
    if (risikoEl) {
        var rs = kd.risikoscore;
        var rColor = rs <= 30 ? '#16a34a' : (rs <= 60 ? '#d97706' : '#dc2626');
        var rLabel = rs <= 30 ? 'Niedrig' : (rs <= 60 ? 'Mittel' : 'Hoch');
        risikoEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="score-bar-track" style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div class="score-bar-fill" style="height:100%;width:' + rs + '%;background:' + rColor + ';border-radius:4px;"></div></div><span class="score-bar-value" style="font-weight:600;color:' + rColor + ';">' + rs + ' (' + rLabel + ')</span></div>';
    }
    
    // Bonitaetsscore
    var bonitaetEl = document.getElementById('bankBonitaetScoreDisplay');
    if (bonitaetEl) {
        var bs = kd.bonitaet;
        var bColor = bs >= 70 ? '#16a34a' : (bs >= 40 ? '#d97706' : '#dc2626');
        var bLabel = bs >= 70 ? 'Gut' : (bs >= 40 ? 'Mittel' : 'Schwach');
        bonitaetEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="score-bar-track" style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div class="score-bar-fill" style="height:100%;width:' + bs + '%;background:' + bColor + ';border-radius:4px;"></div></div><span class="score-bar-value" style="font-weight:600;color:' + bColor + ';">' + bs + ' (' + bLabel + ')</span></div>';
    }
    
    // NPS
    var npsEl = document.getElementById('bankKundenNpsBadge');
    if (npsEl) {
        var nps = kd.nps;
        var stars = '';
        for (var s = 1; s <= 10; s++) {
            stars += '<span style="color:' + (s <= nps.score ? '#f59e0b' : '#e2e8f0') + ';">\u2605</span>';
        }
        npsEl.innerHTML = '<span class="nps-stars-display">' + stars + '</span> <span style="font-weight:600;">' + nps.score + '/10</span> <span class="status-badge ' + (nps.kategorie === 'promoter' ? 'aktiv' : (nps.kategorie === 'passive' ? 'antrag' : 'storniert')) + '" style="font-size:10px;">' + nps.kategorie.charAt(0).toUpperCase() + nps.kategorie.slice(1) + '</span>';
    }
    
    // CLV (simplified calculation)
    var clv = calculateBankCLV(kd, retailData);
    var clvValEl = document.getElementById('bankClvHeaderValue');
    if (clvValEl) clvValEl.textContent = '\u20AC' + clv.value.toLocaleString('de-DE');
    var clvSegEl = document.getElementById('bankClvHeaderSegment');
    if (clvSegEl) clvSegEl.textContent = clv.segment;
    var clvDetailEl = document.getElementById('bankClvDetailContent');
    if (clvDetailEl) {
        clvDetailEl.innerHTML = '<div class="clv-summary" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;">' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Gesamt CLV</div><div style="font-size:20px;font-weight:700;color:#1e293b;">\u20AC' + clv.value.toLocaleString('de-DE') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Segment</div><div style="font-size:20px;font-weight:700;color:#1e293b;">' + clv.segment + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Haltedauer (Prognose)</div><div style="font-size:20px;font-weight:700;color:#1e293b;">' + clv.haltedauer + ' J.</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Abwanderungsrisiko</div><div style="font-size:20px;font-weight:700;color:' + (clv.churnRisk < 10 ? '#16a34a' : '#dc2626') + ';">' + clv.churnRisk + '%</div></div>' +
            '</div>';
    }
    
    // Sticky bar
    fillBankStickyBar(kundenName, retailData, kd, clv);
    
    // Fill Konten tab
    fillBankKonten(kd);
    
    // Fill FIDA tab
    fillBankFida(kd);
    
    // Fill Impulse tab
    fillBankImpulse(kundenName, kd, retailData);
    
    // Fill Finanzplanung tab
    fillBankFinanzplanung(kd);
    
    // Fill Kommunikation tab
    fillBankKommunikation(kd);
    
    // Switch to Stammdaten tab
    switchBankKundenTab('stammdaten');
}

function setTextById(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
}

function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    var r = Math.max(0, Math.min(255, parseInt(hex.substring(0,2), 16) + amount));
    var g = Math.max(0, Math.min(255, parseInt(hex.substring(2,4), 16) + amount));
    var b = Math.max(0, Math.min(255, parseInt(hex.substring(4,6), 16) + amount));
    return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
}

function calculateBankCLV(kd, retailData) {
    var ertrag = retailData ? retailData.ertrag : 2000;
    var years = 15;
    if (kd.nps.score >= 8) years = 20;
    if (kd.nps.score <= 5) years = 8;
    var value = Math.round(ertrag * years * 0.85);
    var segment = value >= 50000 ? 'Platinum' : (value >= 25000 ? 'Gold' : (value >= 10000 ? 'Silber' : 'Standard'));
    var churnRisk = kd.nps.score >= 8 ? 5 : (kd.nps.score >= 6 ? 12 : 25);
    return { value:value, segment:segment, haltedauer:years, churnRisk:churnRisk };
}

// ── STICKY BAR ──
function fillBankStickyBar(kundenName, retailData, kd, clv) {
    var nameEl = document.getElementById('bankKundeBarName');
    if (nameEl) nameEl.textContent = kundenName;
    var idEl = document.getElementById('bankKundeBarId');
    if (idEl) idEl.textContent = retailData ? retailData.id : 'KDB000';
    
    // Avatar in sticky bar
    var avatarEl = document.getElementById('bankKundeStickyAvatar');
    if (avatarEl) {
        var fotoPath = bankKundenFotos[kundenName] || (kd.foto);
        if (fotoPath) {
            avatarEl.innerHTML = '<img src="' + fotoPath + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        } else {
            var bg = kd.avatarBg || '#64748b';
            avatarEl.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;">' + getInitialsBerater(kundenName) + '</div>';
        }
    }
    
    // NPS stars
    var npsEl = document.getElementById('bankKundeBarNps');
    if (npsEl) {
        var stars = '';
        for (var i = 1; i <= 5; i++) {
            var filled = (kd.nps.score / 2) >= i;
            stars += '<span style="color:' + (filled ? '#f59e0b' : '#e2e8f0') + ';font-size:12px;">\u2605</span>';
        }
        npsEl.innerHTML = stars;
    }
    
    var clvEl = document.getElementById('bankKundeBarClv');
    if (clvEl) clvEl.textContent = '\u20AC' + clv.value.toLocaleString('de-DE');
    
    var segEl = document.getElementById('bankKundeBarSegment');
    if (segEl) segEl.textContent = clv.segment;
}

// ── TAB SWITCHING ──
function switchBankKundenTab(tabName) {
    // Deactivate all
    var tabs = document.querySelectorAll('#kundenDetailBankPage .kunden-tab-content');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    
    // Activate target
    var tabMap = {
        'stammdaten': 'bankTabStammdaten',
        'konten': 'bankTabKonten',
        'fida': 'bankTabFida',
        'impulse': 'bankTabImpulse',
        'finanzplanung': 'bankTabFinanzplanung',
        'kommunikation': 'bankTabKommunikation'
    };
    var target = document.getElementById(tabMap[tabName]);
    if (target) target.classList.add('active');
    
    // Update tab button states
    var btns = document.querySelectorAll('#bankKundenTabs .kunden-tab');
    btns.forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
}

// ── FILL KONTEN TAB ──
function fillBankKonten(kd) {
    var el = document.getElementById('bankKundenKonten');
    if (!el) return;
    var countEl = document.getElementById('bankProdukteCount');
    if (countEl) countEl.textContent = kd.konten.length + ' Produkte';
    
    var rows = '';
    kd.konten.forEach(function(k) {
        var saldoColor = k.saldo >= 0 ? '#1e293b' : '#dc2626';
        var saldoStr = k.saldo < 0 ? '-\u20AC' + Math.abs(k.saldo).toLocaleString('de-DE') : '\u20AC' + k.saldo.toLocaleString('de-DE');
        rows += '<tr><td><strong>' + k.produkt + '</strong></td><td>' + k.details + '</td><td class="text-right" style="color:' + saldoColor + ';font-weight:600;">' + saldoStr + '</td><td>' + k.eroeffnung + '</td><td><span class="status-badge aktiv">' + k.status + '</span></td></tr>';
    });
    el.innerHTML = rows;
}

// ── FILL FIDA TAB ──
function fillBankFida(kd) {
    // Status grid
    var statusEl = document.getElementById('bankFidaStatusGrid');
    if (statusEl) {
        var hasConsent = kd.fidaVertraege.length > 0;
        statusEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;">' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Consent-Status</div><div style="font-size:14px;font-weight:700;"><span class="status-badge ' + (hasConsent?'aktiv':'storniert') + '">' + (hasConsent?'Aktiv':'Nicht erteilt') + '</span></div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Erteilt am</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].consent : '&mdash;') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Gültig bis</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].gueltig : '&mdash;') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Datenquellen</div><div style="font-size:14px;font-weight:700;">' + kd.fidaVertraege.length + '</div></div>' +
            '</div>';
    }
    
    // External connections table
    var tableEl = document.getElementById('bankFidaVertraege');
    if (tableEl) {
        if (kd.fidaVertraege.length === 0) {
            tableEl.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:24px;">Kein Open Finance Consent erteilt. FIDA-Consent anfordern um Drittbank-Daten zu analysieren.</td></tr>';
        } else {
            var rows = '';
            kd.fidaVertraege.forEach(function(f) {
                rows += '<tr><td><strong>' + f.institut + '</strong></td><td>' + f.typ + '</td><td>' + f.info + '</td><td>' + f.consent + '</td><td>' + f.gueltig + '</td></tr>';
            });
            tableEl.innerHTML = rows;
        }
    }
    
    // Bedarfsfeld cards (simplified content)
    var bezahlenEl = document.getElementById('bankFidaBezahlenContent');
    if (bezahlenEl && kd.fidaVertraege.length > 0) {
        bezahlenEl.innerHTML = '<div style="padding:16px;"><div class="fida-finance-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
            '<div style="padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#64748b;">Nettoeinkommen</div><div style="font-size:18px;font-weight:700;color:#16a34a;">\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '</div></div>' +
            '<div style="padding:12px;background:#fef2f2;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#64748b;">Ausgaben (Schnitt)</div><div style="font-size:18px;font-weight:700;color:#dc2626;">\u20AC' + Math.round(kd.nettoeinkommen * 0.65).toLocaleString('de-DE') + '</div></div>' +
            '<div style="padding:12px;background:#eff6ff;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#64748b;">Freies Einkommen</div><div style="font-size:18px;font-weight:700;color:#2563eb;">\u20AC' + Math.round(kd.nettoeinkommen * 0.35).toLocaleString('de-DE') + '</div></div>' +
            '</div></div>';
    }

    // ── BEDARFSFELD: SPAREN & VORSORGEN ──
    var sparenEl = document.getElementById('bankFidaSparenContent');
    if (sparenEl) {
        var sparenHtml = '';
        // Geldmarkt
        var geldmarkt = kd.sparenGeldmarkt || [];
        if (geldmarkt.length > 0) {
            var totalGeld = 0;
            sparenHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Geldmarkt</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Produkt</th><th>Anbieter</th><th>Volumen</th><th>Zinssatz</th><th>Laufzeit</th></tr></thead><tbody>';
            geldmarkt.forEach(function(g) {
                totalGeld += g.volumen;
                sparenHtml += '<tr><td><strong>' + g.produkt + '</strong>' + (g.quelle === 'FIDA' ? ' <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:10px;">FIDA</span>' : '') + '</td>' +
                    '<td>' + g.anbieter + '</td><td>\u20AC' + g.volumen.toLocaleString('de-DE') + '</td><td>' + g.zinssatz + '</td><td>' + g.laufzeit + '</td></tr>';
            });
            sparenHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Geldmarkt</td><td></td><td>\u20AC' + totalGeld.toLocaleString('de-DE') + '</td><td></td><td></td></tr>';
            sparenHtml += '</tbody></table></div>';
        }
        // Kapitalmarkt
        var kapital = kd.sparenKapitalmarkt || [];
        if (kapital.length > 0) {
            var totalKap = 0;
            sparenHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Kapitalmarkt</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Produkt</th><th>Anbieter</th><th>Volumen</th><th>Sparrate</th><th>Performance YTD</th></tr></thead><tbody>';
            kapital.forEach(function(k) {
                totalKap += k.volumen;
                sparenHtml += '<tr><td><strong>' + k.produkt + '</strong>' + (k.quelle === 'FIDA' ? ' <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:10px;">FIDA</span>' : '') + '</td>' +
                    '<td>' + k.anbieter + '</td><td>\u20AC' + k.volumen.toLocaleString('de-DE') + '</td><td>' + k.sparrate + '</td><td style="color:#16a34a;">' + k.performance + '</td></tr>';
            });
            sparenHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Depot</td><td></td><td>\u20AC' + totalKap.toLocaleString('de-DE') + '</td><td></td><td></td></tr>';
            sparenHtml += '</tbody></table></div>';
        }
        if (sparenHtml === '') {
            sparenHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Spar- oder Vorsorgeprodukte vorhanden.</div>';
        }
        sparenEl.innerHTML = sparenHtml;
    }

    // ── BEDARFSFELD: ABSICHERN ──
    var absichernEl = document.getElementById('bankFidaAbsichernContent');
    if (absichernEl) {
        var absHtml = '';
        // Eigene Versicherungen (Genossenschaftliche Partner)
        var eigen = kd.versicherungenEigen || [];
        if (eigen.length > 0) {
            absHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Eigene Versicherungen (R+V / VR)</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Versicherung</th><th>Anbieter</th><th>Deckungssumme</th><th>Tarifart</th><th>Leistungsumfang</th><th>Prämie</th><th>Vertragsnr.</th></tr></thead><tbody>';
            eigen.forEach(function(v) {
                var tags = v.leistungen.map(function(l) { return '<span class="leistung-tag" style="display:inline-block;font-size:10px;background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;margin:1px;">' + l + '</span>'; }).join(' ');
                absHtml += '<tr><td><strong>' + v.versicherung + '</strong></td><td>' + v.anbieter + '</td><td>' + v.deckung + '</td>' +
                    '<td><span class="tarif-badge" style="font-size:10px;padding:2px 8px;border-radius:10px;background:#dbeafe;color:#1e40af;">' + v.tarifart + '</span></td>' +
                    '<td>' + tags + '</td><td>' + v.praemie + '</td><td>' + v.vertrag + '</td></tr>';
            });
            absHtml += '</tbody></table></div>';
        }
        // Fremd-Versicherungen (Wettbewerber)
        var fremd = kd.versicherungenFremd || [];
        if (fremd.length > 0) {
            absHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Wettbewerber-Versicherungen</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Versicherung</th><th>Anbieter</th><th>Deckungssumme</th><th>Tarifart</th><th>Leistungsumfang</th><th>Selbstbehalt</th><th>Prämie</th><th>Kündigungsfrist</th></tr></thead><tbody>';
            fremd.forEach(function(v) {
                var tags = v.leistungen.map(function(l) { return '<span class="leistung-tag" style="display:inline-block;font-size:10px;background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;margin:1px;">' + l + '</span>'; }).join(' ');
                absHtml += '<tr><td><strong>' + v.versicherung + '</strong></td><td>' + v.anbieter + '</td><td>' + v.deckung + '</td>' +
                    '<td><span class="tarif-badge" style="font-size:10px;padding:2px 8px;border-radius:10px;background:#fef3c7;color:#92400e;">' + v.tarifart + '</span></td>' +
                    '<td>' + tags + '</td><td>' + v.selbstbehalt + '</td><td>' + v.praemie + '</td><td>' + v.kuendigung + '</td></tr>';
            });
            absHtml += '</tbody></table></div>';
        }
        if (absHtml === '') {
            absHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Versicherungsdaten vorhanden.</div>';
        }
        absichernEl.innerHTML = absHtml;
    }

    // ── BEDARFSFELD: FINANZIEREN ──
    var finanzEl = document.getElementById('bankFidaFinanzierenContent');
    if (finanzEl) {
        var finHtml = '';
        var finanz = kd.finanzierungen || [];
        if (finanz.length > 0) {
            var totalRest = 0;
            finHtml += '<div style="padding:0 16px 16px;"><table class="kunden-table fida-table"><thead><tr><th>Kredit</th><th>Kreditgeber</th><th>Ursprungsbetrag</th><th>Restschuld</th><th>Zinssatz</th><th>Rate</th><th>Laufzeit bis</th><th>Absicherung</th></tr></thead><tbody>';
            finanz.forEach(function(f) {
                totalRest += f.restschuld;
                finHtml += '<tr><td><strong>' + f.kredit + '</strong></td><td>' + f.kreditgeber + '</td>' +
                    '<td>\u20AC' + f.ursprung.toLocaleString('de-DE') + '</td><td>\u20AC' + f.restschuld.toLocaleString('de-DE') + '</td>' +
                    '<td>' + f.zinssatz + '</td><td>' + f.rate + '</td><td>' + f.laufzeit + '</td><td>' + f.absicherung + '</td></tr>';
            });
            finHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Verbindlichkeiten</td><td></td><td></td><td>\u20AC' + totalRest.toLocaleString('de-DE') + '</td><td></td><td></td><td></td><td></td></tr>';
            finHtml += '</tbody></table></div>';
            // Hinweise
            finanz.forEach(function(f) {
                if (f.hinweis) {
                    finHtml += '<div style="margin:0 16px 16px;padding:12px 16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;font-size:13px;color:#92400e;">' +
                        '<strong>Hinweis:</strong> ' + f.hinweis + '</div>';
                }
            });
        } else {
            finHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Finanzierungen vorhanden.</div>';
        }
        finanzEl.innerHTML = finHtml;
    }
}

// ── FILL IMPULSE TAB ──
function fillBankImpulse(kundenName, kd, retailData) {
    var el = document.getElementById('bankImpulseContent');
    if (!el) return;

    var impulse = [];
    // Generate impulses based on customer data
    if (!retailData || !retailData.finanzplan) {
        impulse.push({
            id: 'bank-impuls-finanzplan', icon:'plan',
            title:'VR-FinanzPlan erstellen',
            beschr:'Kein FinanzPlan vorhanden. Ganzheitliche Beratung empfohlen.',
            prio:'high', quelle:'Intern',
            herleitung: [
                { label:'Datenquelle', value:'Interne Kundendaten' },
                { label:'Erkannte Situation', value:'Kein VR-FinanzPlan hinterlegt' },
                { label:'Empfehlung', value:'Ganzheitliche Finanzplanung erstellen, alle Lebensbereiche abdecken' }
            ],
            produkt: 'VR-FinanzPlan', empfehlung: 'Ganzheitliche Beratung inkl. Vorsorge, Absicherung, Vermögen'
        });
    }
    if (kd.fidaVertraege.length > 0) {
        var fidaInfo = kd.fidaVertraege.map(function(f) { return f.institut + ' (' + f.typ + ')'; }).join(', ');
        impulse.push({
            id: 'bank-impuls-crossselling', icon:'fida',
            title:'Cross-Selling aus Open Finance',
            beschr:'Drittbank-Daten zeigen Optimierungspotential. Konsolidierung empfohlen.',
            prio:'high', quelle:'FIDA',
            herleitung: [
                { label:'Datenquelle', value:'Open Finance (FIDA) - ' + kd.fidaVertraege.length + ' Drittbank-Vertr\u00e4ge' },
                { label:'Erkannte Situation', value: fidaInfo },
                { label:'Optimierungspotential', value:'Konsolidierung der Konten/Depots f\u00fcr bessere Konditionen und \u00dcbersicht' },
                { label:'Empfehlung', value:'Beratungsgespr\u00e4ch zur Konsolidierung und Produktoptimierung' }
            ],
            produkt: 'Kontokonsolidierung', empfehlung: 'Drittbank-Produkte in VR-Angebote \u00fcberf\u00fchren'
        });
    } else {
        impulse.push({
            id: 'bank-impuls-fida', icon:'fida',
            title:'FIDA-Consent einholen',
            beschr:'Open Finance Daten fehlen. Consent anfordern f\u00fcr vollst\u00e4ndige Analyse.',
            prio:'medium', quelle:'System',
            herleitung: [
                { label:'Datenquelle', value:'System - Keine Open Finance Daten vorhanden' },
                { label:'Erkannte Situation', value:'Kundeneinwilligung f\u00fcr FIDA fehlt' },
                { label:'Empfehlung', value:'FIDA-Consent im n\u00e4chsten Beratungsgespr\u00e4ch einholen' }
            ],
            produkt: 'FIDA-Consent', empfehlung: 'Open Finance Einwilligung f\u00fcr ganzheitliche Analyse'
        });
    }
    if (kd.konten.length < 4) {
        impulse.push({
            id: 'bank-impuls-cross', icon:'cross',
            title:'Produktbreite erh\u00f6hen',
            beschr:'Nur ' + kd.konten.length + ' Produkte. Cross-Selling-Potential identifiziert.',
            prio:'medium', quelle:'KI',
            herleitung: [
                { label:'Datenquelle', value:'Interne Produktanalyse (KI)' },
                { label:'Erkannte Situation', value:'Nur ' + kd.konten.length + ' aktive Produkte \u2013 unter Durchschnitt' },
                { label:'Empfehlung', value:'Passende Zusatzprodukte je nach Lebenssituation anbieten' }
            ],
            produkt: 'Cross-Selling Paket', empfehlung: 'Produktportfolio erweitern'
        });
    }
    if (kd.nps.score <= 6) {
        impulse.push({
            id: 'bank-impuls-nps', icon:'nps',
            title:'Kundenzufriedenheit verbessern',
            beschr:'NPS Score ' + kd.nps.score + '/10. Pers\u00f6nliches Gespr\u00e4ch empfohlen.',
            prio:'high', quelle:'NPS',
            herleitung: [
                { label:'Datenquelle', value:'NPS-Umfrage ' + (kd.nps.kampagne || '') },
                { label:'Erkannte Situation', value:'NPS Score ' + kd.nps.score + '/10 \u2013 Detractor/Passive' },
                { label:'Schwachstellen', value: kd.nps.details ? kd.nps.details.filter(function(d){return d.wert<=6;}).map(function(d){return d.name+' ('+d.wert+'/10)';}).join(', ') || 'Keine kritischen Einzelwerte' : 'Keine Details' },
                { label:'Empfehlung', value:'Pers\u00f6nliches Gespr\u00e4ch zur Zufriedenheitsverbesserung' }
            ],
            produkt: 'Kundenr\u00fcckgewinnung', empfehlung: 'Pers\u00f6nliches Gespr\u00e4ch und Service-Upgrade'
        });
    }

    // Baufinanzierung Anschluss prüfen
    var hasBaufi = kd.konten.some(function(k) { return k.produkt.indexOf('Baufinanzierung') >= 0; });
    if (hasBaufi) {
        var baufi = kd.konten.find(function(k) { return k.produkt.indexOf('Baufinanzierung') >= 0; });
        impulse.push({
            id: 'bank-impuls-baufi', icon:'finanz',
            title:'Anschlussfinanzierung pr\u00fcfen',
            beschr:'Baufinanzierung vorhanden. Zinsbindung und Konditionen pr\u00fcfen.',
            prio:'high', quelle:'KI',
            herleitung: [
                { label:'Datenquelle', value:'Interne Kreditdaten' },
                { label:'Erkannte Situation', value: baufi.produkt + ' \u2013 ' + baufi.details },
                { label:'Restschuld', value: baufi.saldo ? '\u20AC' + Math.abs(baufi.saldo).toLocaleString('de-DE') : 'k.A.' },
                { label:'Empfehlung', value:'Fr\u00fchzeitig Anschlusskonditionen anbieten, Prolongation sichern' }
            ],
            produkt: 'Anschlussfinanzierung', empfehlung: 'G\u00fcnstigere Konditionen f\u00fcr Restschuld'
        });
    }

    impulse.push({
        id: 'bank-impuls-vorsorge', icon:'vorsorge',
        title:'Altersvorsorge pr\u00fcfen',
        beschr:'Versorgungsl\u00fccke im Alter identifiziert. Beratung empfohlen.',
        prio:'medium', quelle:'KI',
        herleitung: [
            { label:'Datenquelle', value:'KI-Analyse \u2013 Einkommens- und Vorsorgeda ten' },
            { label:'Erkannte Situation', value:'Nettoeinkommen \u20AC' + (kd.nettoeinkommen || 0).toLocaleString('de-DE') + ' \u2013 Versorgungsl\u00fccke wahrscheinlich' },
            { label:'Empfehlung', value:'Rentenl\u00fccken-Analyse durchf\u00fchren, Zusatzvorsorge empfehlen' }
        ],
        produkt: 'Altersvorsorge', empfehlung: 'Rentenl\u00fccke schlie\u00dfen mit VR-Vorsorgekonzept'
    });

    var iconSvgs = {
        plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        fida: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
        cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        nps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        vorsorge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        finanz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
    };

    var expandSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    var html = '';
    impulse.forEach(function(imp) {
        // Clickable header
        html += '<div class="impuls-item highlight clickable" onclick="toggleImpulsDetail(\'' + imp.id + '\')">' +
            '<div class="impuls-icon">' + (iconSvgs[imp.icon] || '') + '</div>' +
            '<div class="impuls-text">' +
                '<strong>' + imp.title + '</strong>' +
                '<p>' + (imp.quelle === 'FIDA' ? '<span class="fida-source-badge small">Open Finance</span> ' : '') + imp.beschr + '</p>' +
            '</div>' +
            '<span class="impuls-priority ' + imp.prio + '">' + (imp.prio==='high'?'Hohe Priorit\u00e4t':'Mittlere Priorit\u00e4t') + '</span>' +
            '<span class="impuls-expand">' + expandSvg + '</span>' +
        '</div>';

        // Expandable detail panel
        html += '<div class="impuls-detail" id="' + imp.id + '" style="display:none;">' +
            '<div class="impuls-detail-section">' +
                '<h4>Herleitung des Impulses</h4>' +
                '<div class="herleitung-grid">';

        if (imp.herleitung) {
            imp.herleitung.forEach(function(h) {
                html += '<div class="herleitung-item">' +
                    '<span class="herleitung-label">' + h.label + '</span>' +
                    '<span class="herleitung-value">' + h.value + '</span>' +
                '</div>';
            });
        }

        html += '</div></div>' +
            '<div class="impuls-detail-section">' +
                '<h4>Aktionen</h4>' +
                '<div class="impuls-actions">' +
                    '<button class="action-btn primary" onclick="event.stopPropagation();">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
                        ' Angebot erstellen' +
                    '</button>' +
                    '<button class="action-btn secondary" onclick="event.stopPropagation();">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Termin vereinbaren' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    });
    el.innerHTML = html;
}

// ── FILL FINANZPLANUNG TAB ──
function fillBankFinanzplanung(kd) {
    var liqEl = document.getElementById('bankLiquiditaetContent');
    if (liqEl) {
        var einkommen = kd.nettoeinkommen;
        var fixeAusgaben = Math.round(einkommen * 0.45);
        var variableAusgaben = Math.round(einkommen * 0.20);
        var frei = einkommen - fixeAusgaben - variableAusgaben;
        var sparquote = Math.round(frei / einkommen * 100);
        
        liqEl.innerHTML = '<div style="padding:16px;">' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:13px;">Nettoeinkommen (fix)</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:100%;background:#16a34a;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;">\u20AC' + einkommen.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:13px;">Fixe Ausgaben</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:45%;background:#dc2626;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;color:#dc2626;">-\u20AC' + fixeAusgaben.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:13px;">Variable Ausgaben</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:20%;background:#f59e0b;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;color:#f59e0b;">-\u20AC' + variableAusgaben.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:2px solid #1e293b;margin-top:8px;"><span style="flex:1;font-size:14px;font-weight:700;">Freies Einkommen</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:' + (frei/einkommen*100) + '%;background:#2563eb;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:700;color:#2563eb;">\u20AC' + frei.toLocaleString('de-DE') + '</span></div>' +
            '<div style="margin-top:16px;padding:12px;background:#eff6ff;border-radius:8px;border-left:3px solid #2563eb;"><strong>Sparquote: ' + sparquote + '%</strong> &mdash; ' + (sparquote >= 20 ? 'Gute Sparquote. Potential für Anlage-Beratung.' : 'Unter Durchschnitt. Budgetberatung empfohlen.') + '</div>' +
            '</div>';
    }
    
    var sparEl = document.getElementById('bankSparzieleContent');
    if (sparEl) {
        sparEl.innerHTML = '<div style="padding:16px;">' +
            '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>Eigenheim-Renovierung</strong><span class="status-badge aktiv">Aktiv</span></div>' +
            '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:65%;background:#16a34a;border-radius:4px;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;"><span>\u20AC32.500 von \u20AC50.000</span><span>65%</span></div></div>' +
            '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>Ausbildung Kinder</strong><span class="status-badge antrag">Geplant</span></div>' +
            '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:28%;background:#2563eb;border-radius:4px;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;"><span>\u20AC14.000 von \u20AC50.000</span><span>28%</span></div></div>' +
            '</div>';
    }
}

// ── FILL KOMMUNIKATION TAB ──
function fillBankKommunikation(kd) {
    var el = document.getElementById('bankKundenKommunikation');
    if (!el) return;
    
    var iconMap = {
        email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
        termin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        brief: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };
    
    var statusColors = { 'Geöffnet':'#16a34a', 'Erledigt':'#2563eb', 'Versendet':'#64748b', 'Geplant':'#f59e0b' };
    
    var html = '';
    kd.kommunikation.forEach(function(k) {
        var color = statusColors[k.status] || '#64748b';
        html += '<div class="komm-item" style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #f1f5f9;">' +
            '<div class="komm-icon" style="width:36px;height:36px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + (iconMap[k.typ] || '') + '</div>' +
            '<div class="komm-content" style="flex:1;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:12px;color:#64748b;">' + k.typ.charAt(0).toUpperCase() + k.typ.slice(1) + ' &middot; ' + k.datum + '</span><span class="status-badge" style="background:' + color + '20;color:' + color + ';padding:2px 8px;border-radius:4px;font-size:11px;">' + k.status + '</span></div>' +
            '<div style="font-weight:600;margin-bottom:2px;">' + k.betreff + '</div>' +
            '<div style="font-size:12px;color:#64748b;">' + k.inhalt + '</div>' +
            '</div></div>';
    });
    el.innerHTML = html;
}

// ── WINDOW EXPORTS ──
window.fillBankKundenDetail = fillBankKundenDetail;
window.switchBankKundenTab = switchBankKundenTab;
window.bankMockKunden = bankMockKunden;
