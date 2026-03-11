// ── MOCK KUNDEN DETAIL DATA ──
// Legacy-Daten – werden von OPT-26 Personas ueberschrieben (Object.assign)
var _legacyBankKunden = {
    'Klaus Fischer': {
        id:'KDB001', ort:'Gießen', segment:'Premium', ertrag:4850, finanzplan:true, letztKontakt:'28.02.2026',
        geburtsdatum:'12.05.1978', adresse:'Hauptstraße 45, 35390 Gießen', telefon:'+49 641 98765', email:'k.fischer@email.de',
        beruf:'Maschinenbau-Ingenieur', familienstand:'Verheiratet', arbeitgeber:'Continental AG', linkedinHint:true, beschaeftigtSeit:'01.04.2008',
        nettoeinkommen:4850, kinder:[{name:'Lukas',alter:12},{name:'Emma',alter:9}],
        risikoscore:28, bonitaet:82,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Plus', details:'IBAN DE89 5066 1639 0012 3456 78 \u2022 girocard NFC + Digitale girocard (VR Banking App) \u2022 Wero aktiv', saldo:8450, eroeffnung:'15.03.2010', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:42000, eroeffnung:'01.06.2020', status:'Aktiv' },
            { produkt:'Baufinanzierung (DZ HYP)', details:'Restschuld, Zinsbindung bis 09/2026 \u2013 Anschlussfinanzierung erforderlich', saldo:-185000, eroeffnung:'01.09.2016', status:'Aktiv' },
            { produkt:'VR-MeinDepot (Union Investment)', details:'ETF-Sparplan 300/Mon. \u2022 UnionDepot', saldo:28500, eroeffnung:'15.01.2022', status:'Aktiv' },
            { produkt:'Riester-Rente (Union Investment)', details:'Beitrag 175/Mon. \u2022 UniProfiRente', saldo:18200, eroeffnung:'01.04.2018', status:'Aktiv' },
            { produkt:'R+V Unfallversicherung Komfort', details:'Grundsumme 80.000 \u2022 R+V Versicherung', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
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
            { typ:'chatbot', datum:'2026-03-05T20:30:00', betreff:'genoGPT: Anschlussfinanzierung', verlauf:[
                {rolle:'kunde',text:'Meine Zinsbindung l\u00e4uft bald aus. Was kann ich tun?'},
                {rolle:'bot',text:'Ihre Baufinanzierung bei der Volksbank Mittelhessen hat eine Zinsbindung bis 09/2026. F\u00fcr die Anschlussfinanzierung bieten wir aktuell attraktive Konditionen.'},
                {rolle:'kunde',text:'Was sind die aktuellen Konditionen?'},
                {rolle:'bot',text:'Aktuell ab 3,2% p.a. f\u00fcr 10 Jahre Zinsbindung. Soll ich einen Beratungstermin mit Ihrem Berater vereinbaren?'},
                {rolle:'kunde',text:'Ja bitte'}
            ], ergebnis:'Terminwunsch Anschlussfinanzierung', themen:['baufinanzierung','anschluss','termin'], status:'termin_geplant' },
            { typ:'email', datum:'2026-02-28T09:00:00', betreff:'Anschlussfinanzierung Angebot', inhalt:'Angebot f\u00fcr Baufi-Anschluss gesendet', status:'geoeffnet', geoeffnetAm:'2026-02-28T14:00:00', followUp:false, automatisch:true },
            { typ:'ki_kontakt', datum:'2026-02-22T10:00:00', betreff:'Zinsbindungsablauf-Warnung', inhalt:'System hat erkannt: Baufinanzierung Zinsbindung endet 09/2026. Anschlussfinanzierung dringend empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'call', datum:'2026-02-20T10:00:00', betreff:'Telefonat Baufinanzierung', inhalt:'Beratungsgespr\u00e4ch zu Anschlussoptionen', status:'erledigt' },
            { typ:'termin', datum:'2026-02-15T10:00:00', betreff:'Jahresgespr\u00e4ch', inhalt:'VR-FinanzPlan Review durchgef\u00fchrt', status:'erledigt' },
            { typ:'portal', datum:'2026-02-10T16:00:00', betreff:'Depot\u00fcbersicht angesehen', inhalt:'Kunde hat seine Depot\u00fcbersicht im Online-Banking aufgerufen und Union Investment Kontoauszug heruntergeladen.', status:'erledigt', dokument:'UnionDepot-Auszug-Q4-2025.pdf' },
            { typ:'brief', datum:'2026-01-10T08:00:00', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Depot + Konten', status:'versendet', followUp:false, automatisch:true }
        ],
        avatarBg:'#2563eb', foto:'assets/images/AdobeStock_624564221.jpeg'
    },
    'Sandra Müller': {
        id:'KDB002', ort:'Wetzlar', segment:'Premium', ertrag:3200, finanzplan:false, letztKontakt:'25.02.2026',
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
            { typ:'chatbot', datum:'2026-03-02T21:00:00', betreff:'genoGPT: Festgeld-Verl\u00e4ngerung', verlauf:[
                {rolle:'kunde',text:'Mein Festgeld l\u00e4uft bald aus. Welche Optionen habe ich?'},
                {rolle:'bot',text:'Ihr VR-Festgeld 12M (50.000\u20ac, 3,2% p.a.) wird im Juni 2026 f\u00e4llig. Sie k\u00f6nnen verl\u00e4ngern, umschichten oder auszahlen lassen.'},
                {rolle:'kunde',text:'Was bekomme ich bei Verl\u00e4ngerung?'},
                {rolle:'bot',text:'Aktuell bieten wir 2,9% f\u00fcr 12 Monate oder 3,0% f\u00fcr 24 Monate. Alternativ k\u00f6nnten Sie in den VR-MeinDepot ETF-Sparplan investieren. Soll ich einen Termin vereinbaren?'},
                {rolle:'kunde',text:'Ja, ich m\u00f6chte alle Optionen besprechen'}
            ], ergebnis:'Terminwunsch Festgeld-Anlage', themen:['festgeld','anlage','termin'], status:'termin_geplant' },
            { typ:'email', datum:'2026-02-25T09:00:00', betreff:'Festgeld Verl\u00e4ngerung', inhalt:'Info zu Festgeld-Konditionen bei F\u00e4lligkeit', status:'geoeffnet', geoeffnetAm:'2026-02-25T18:00:00', followUp:false, automatisch:true },
            { typ:'ki_kontakt', datum:'2026-02-18T10:00:00', betreff:'Altersvorsorge-L\u00fccke erkannt', inhalt:'System hat erkannt: Kundin (40 J.) hat keine private Altersvorsorge \u00fcber Verbundpartner. Empfehlung: R+V Riester oder Union Investment UniProfiRente.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'call', datum:'2026-02-18T14:00:00', betreff:'Altersvorsorge-Beratung', inhalt:'Erstgespr\u00e4ch Altersvorsorge-Konzept', status:'erledigt' },
            { typ:'termin', datum:'2026-02-05T10:00:00', betreff:'VR-FinanzPlan Erstberatung', inhalt:'Ganzheitliche Finanzplanung besprochen', status:'erledigt' },
            { typ:'portal', datum:'2026-01-20T09:00:00', betreff:'Kontoumsaetze exportiert', inhalt:'Kundin hat Kontoumsaetze der letzten 6 Monate im Online-Banking exportiert.', status:'erledigt', dokument:'Umsaetze-Export-H2-2025.csv' },
            { typ:'email', datum:'2026-01-15T09:00:00', betreff:'Depotvergleich', inhalt:'Vergleich VR-MeinDepot vs. Scalable Capital', status:'versendet', followUp:false, automatisch:true }
        ],
        avatarBg:'#9333ea', foto:'assets/images/AdobeStock_252262042.jpeg'
    },
    'Markus Wagner': {
        id:'KDB003', ort:'Marburg', segment:'Standard', ertrag:1800, finanzplan:true, letztKontakt:'20.02.2026',
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
            { typ:'chatbot', datum:'2026-03-01T19:00:00', betreff:'genoGPT: Kindersparen', verlauf:[
                {rolle:'kunde',text:'Ich m\u00f6chte f\u00fcr meine Kinder Geld anlegen. Was empfehlen Sie?'},
                {rolle:'bot',text:'F\u00fcr Tim (14) und Jana (11) empfehle ich den VR-MeinDepot Junior mit ETF-Sparplan. Schon ab 25\u20ac/Mon. pro Kind m\u00f6glich.'},
                {rolle:'kunde',text:'Welche ETFs gibt es da?'},
                {rolle:'bot',text:'Union Investment bietet den UniGlobal Vorsorge und den UniNachhaltig Aktien Global an. Soll ich einen Beratungstermin vereinbaren?'},
                {rolle:'kunde',text:'Ja gerne'}
            ], ergebnis:'Terminwunsch Kindersparen', themen:['kindersparen','etf','termin'], status:'termin_geplant' },
            { typ:'termin', datum:'2026-02-20T10:00:00', betreff:'VR-FinanzPlan Review', inhalt:'J\u00e4hrliches Review der Finanzplanung', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-02-12T10:00:00', betreff:'Riester-Zulage pr\u00fcfen', inhalt:'System hat erkannt: Riester-Beitrag m\u00f6glicherweise nicht optimal f\u00fcr maximale Zulage. Empfehlung: Beitrag anpassen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-02-10T09:00:00', betreff:'ETF-Sparplan Info', inhalt:'Informationen zu VR-MeinDepot Sparplan', status:'geoeffnet', geoeffnetAm:'2026-02-10T20:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-28T14:00:00', betreff:'Depoteröffnung Interesse', inhalt:'Telefonat zu ETF-Sparpl\u00e4nen f\u00fcr Kinder', status:'erledigt' }
        ],
        avatarBg:'#16a34a', foto:'assets/images/AdobeStock_361342769.jpeg'
    },
    'Julia Becker': {
        id:'KDB004', ort:'Gießen', segment:'Potenzial', ertrag:980, finanzplan:false, letztKontakt:'18.02.2026',
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
            { typ:'chatbot', datum:'2026-03-04T22:00:00', betreff:'genoGPT: Kontomodelle', verlauf:[
                {rolle:'kunde',text:'Welche Kontomodelle gibt es bei Ihnen?'},
                {rolle:'bot',text:'Wir bieten VR-Girokonto (0\u20ac/Mon.), VR-Girokonto Komfort (4,90\u20ac/Mon.) und VR-Girokonto Premium (9,90\u20ac/Mon.) an. Mit Ihrem Gehaltseingang ab 2.500\u20ac ist Komfort kostenlos.'},
                {rolle:'kunde',text:'Was bringt mir Komfort?'},
                {rolle:'bot',text:'Kostenlose girocard, Kreditkarte Classic, Echtzeitüberweisungen und Kontoausz\u00fcge. Soll ich Sie zu einem Upgrade beraten lassen?'},
                {rolle:'kunde',text:'Vielleicht sp\u00e4ter'}
            ], ergebnis:'Information Kontomodelle', themen:['konto','upgrade'], status:'erledigt' },
            { typ:'email', datum:'2026-02-18T09:00:00', betreff:'FIDA-Consent Einladung', inhalt:'Open Finance Datenfreigabe angefragt', status:'geoeffnet', geoeffnetAm:'2026-02-18T20:00:00', followUp:false, automatisch:true },
            { typ:'ki_kontakt', datum:'2026-02-10T10:00:00', betreff:'Produktportfolio-L\u00fccke', inhalt:'System hat erkannt: Kundin hat keine Altersvorsorge und keine Absicherung. Verbundpartner R+V BU-Versicherung empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'call', datum:'2026-02-05T14:00:00', betreff:'Erstberatung', inhalt:'Telefonat zur ganzheitlichen Beratung', status:'erledigt' }
        ],
        avatarBg:'#f59e0b', foto:null
    },
    'Peter Hoffmann': {
        id:'KDB005', ort:'Wetzlar', segment:'Premium', ertrag:6200, finanzplan:true, letztKontakt:'15.02.2026',
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
            { typ:'chatbot', datum:'2026-03-06T18:30:00', betreff:'genoGPT: Unternehmensnachfolge', verlauf:[
                {rolle:'kunde',text:'Welche Modelle gibt es f\u00fcr die Unternehmensnachfolge?'},
                {rolle:'bot',text:'F\u00fcr Ihre Kanzlei gibt es verschiedene Modelle: Verkauf, schrittweise \u00dcbergabe an Sohn Fabian oder Familiengesellschaft. Steuerlich ist eine fr\u00fchzeitige Planung wichtig.'},
                {rolle:'kunde',text:'Mein Sohn Fabian soll \u00fcbernehmen. Was muss ich beachten?'},
                {rolle:'bot',text:'Bei einer Nachfolge innerhalb der Familie empfehle ich: 1) Steuergutachten, 2) Bewertung der Kanzlei, 3) Finanzierungskonzept f\u00fcr Fabian. Soll ich einen Termin mit unserem Nachfolge-Spezialisten vereinbaren?'},
                {rolle:'kunde',text:'Ja, unbedingt'}
            ], ergebnis:'Terminwunsch Nachfolgeberatung', themen:['nachfolge','kanzlei','termin'], status:'termin_geplant' },
            { typ:'termin', datum:'2026-02-15T10:00:00', betreff:'VR-FinanzPlan Review', inhalt:'J\u00e4hrliche Verm\u00f6gens\u00fcbersicht besprochen', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-02-08T10:00:00', betreff:'Kapital-LV Ablauf 2030', inhalt:'System hat erkannt: Allianz Kapital-LV l\u00e4uft 2030 ab. Wiederanlage-Konzept \u00fcber Union Investment empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-02-10T09:00:00', betreff:'Verm\u00f6gensverwaltung Angebot', inhalt:'VR-Verm\u00f6gensverwaltung Konzept zugesandt', status:'geoeffnet', geoeffnetAm:'2026-02-10T20:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-28T14:00:00', betreff:'Nachfolgeplanung Kanzlei', inhalt:'Erstgespr\u00e4ch Unternehmensnachfolge', status:'erledigt' },
            { typ:'portal', datum:'2026-01-20T10:00:00', betreff:'Online-Banking Login + Depot\u00fcbersicht', inhalt:'Kunde hat Depot\u00fcbersicht und Kontoausz\u00fcge im Online-Banking aufgerufen.', status:'erledigt', dokument:'Depot-Uebersicht-2025.pdf' },
            { typ:'brief', datum:'2026-01-15T08:00:00', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug alle Konten + Depot', status:'versendet', followUp:false, automatisch:true }
        ],
        avatarBg:'#dc2626', foto:'assets/images/AdobeStock_612932760.jpeg'
    },
    'Andrea Lang': {
        id:'KDB006', ort:'Lich', segment:'Standard', ertrag:2400, finanzplan:true, letztKontakt:'12.02.2026',
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
            { typ:'chatbot', datum:'2026-03-03T20:00:00', betreff:'genoGPT: KfW-F\u00f6rderung', verlauf:[
                {rolle:'kunde',text:'Welche KfW-F\u00f6rderkredite gibt es f\u00fcr Kanzleierweiterung?'},
                {rolle:'bot',text:'F\u00fcr Ihre Kanzleierweiterung kommen der KfW-Unternehmerkredit (bis 25 Mio.\u20ac) und der ERP-Gr\u00fcnderkredit (bis 125.000\u20ac) in Frage. Die Volksbank Mittelhessen leitet die Antr\u00e4ge weiter.'},
                {rolle:'kunde',text:'Welche Konditionen hat der Unternehmerkredit?'},
                {rolle:'bot',text:'Ab 4,1% p.a., tilgungsfrei bis 2 Jahre, Laufzeit bis 20 Jahre. Soll ich einen Beratungstermin vereinbaren?'},
                {rolle:'kunde',text:'Ja bitte'}
            ], ergebnis:'Terminwunsch KfW-F\u00f6rderung', themen:['kfw','foerderung','kanzlei','termin'], status:'termin_geplant' },
            { typ:'termin', datum:'2026-02-12T10:00:00', betreff:'Gewerbekredit Beratung', inhalt:'Kanzleierweiterung \u2013 Finanzierungskonzept', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-02-08T10:00:00', betreff:'Absicherung Kind empfohlen', inhalt:'System hat erkannt: Kind Sophie (7) ohne Unfallversicherung. R+V Kinder-Unfallversicherung empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-02-05T09:00:00', betreff:'KfW-F\u00f6rderung Info', inhalt:'Informationen zu KfW-F\u00f6rderkrediten', status:'geoeffnet', geoeffnetAm:'2026-02-05T18:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-20T14:00:00', betreff:'Jahresplanung', inhalt:'Telefonat zur Kanzlei-Finanzplanung 2026', status:'erledigt' }
        ],
        avatarBg:'#6366f1', foto:null
    },
    'Thomas Klein': {
        id:'KDB007', ort:'Buseck', segment:'Standard', ertrag:1650, finanzplan:false, letztKontakt:'10.02.2026',
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
            { typ:'chatbot', datum:'2026-03-07T19:00:00', betreff:'genoGPT: Energetische Sanierung', verlauf:[
                {rolle:'kunde',text:'Welche F\u00f6rderungen gibt es f\u00fcr eine neue Heizung?'},
                {rolle:'bot',text:'F\u00fcr Ihren KfW-F\u00f6rderkredit f\u00fcr energetische Sanierung gibt es zus\u00e4tzlich BAFA-Zusch\u00fcsse f\u00fcr W\u00e4rmepumpen (bis 40% F\u00f6rderung).'},
                {rolle:'kunde',text:'Kann ich beides kombinieren?'},
                {rolle:'bot',text:'Ja, KfW-Kredit und BAFA-Zuschuss sind kombinierbar. Soll ich einen Beratungstermin mit unserem Energie-Spezialisten vereinbaren?'},
                {rolle:'kunde',text:'Ja, das w\u00e4re gut'}
            ], ergebnis:'Terminwunsch Energieberatung', themen:['energie','sanierung','foerderung','termin'], status:'termin_geplant' },
            { typ:'termin', datum:'2026-02-10T10:00:00', betreff:'KfW-F\u00f6rderung Beratung', inhalt:'Energetische Sanierung \u2013 F\u00f6rderm\u00f6glichkeiten', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-02-01T10:00:00', betreff:'Wohngeb\u00e4udeversicherung pr\u00fcfen', inhalt:'System hat erkannt: Energetische Sanierung erh\u00f6ht Geb\u00e4udewert. R+V Wohngeb\u00e4udeversicherung Anpassung empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-01-25T09:00:00', betreff:'Sanierungsfahrplan', inhalt:'Unterlagen Energieberatung zugesandt', status:'geoeffnet', geoeffnetAm:'2026-01-25T20:00:00', followUp:false, automatisch:true },
            { typ:'brief', datum:'2026-01-10T08:00:00', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Gesch\u00e4fts- + Privatkonto', status:'versendet', followUp:false, automatisch:true }
        ],
        avatarBg:'#0891b2', foto:null
    },
    'Monika Richter': {
        id:'KDB008', ort:'Gießen', segment:'Standard', ertrag:1200, finanzplan:true, letztKontakt:'08.02.2026',
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
            { typ:'chatbot', datum:'2026-03-02T20:30:00', betreff:'genoGPT: Kindersparen', verlauf:[
                {rolle:'kunde',text:'Wie kann ich f\u00fcr meine Kinder sparen?'},
                {rolle:'bot',text:'F\u00fcr Anna (10) und Felix (7) empfehle ich den VR-MeinDepot Junior. Bereits ab 25\u20ac/Mon. pro Kind k\u00f6nnen Sie in Union Investment ETFs investieren.'},
                {rolle:'kunde',text:'Danke, ich schaue mir das an'}
            ], ergebnis:'Information Kindersparen', themen:['kindersparen','depot'], status:'erledigt' },
            { typ:'termin', datum:'2026-02-08T10:00:00', betreff:'Beratung Unfallversicherung', inhalt:'Absicherung Familie erweitert', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-02-01T10:00:00', betreff:'Altersvorsorge-Optimierung', inhalt:'System hat erkannt: Ehemann hat kein DWS Kindersparen optimiert. Empfehlung: Beitrag erh\u00f6hen f\u00fcr Zulage.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-02-01T09:00:00', betreff:'Kindersparen Info', inhalt:'Informationen zu VR-MeinDepot Junior', status:'geoeffnet', geoeffnetAm:'2026-02-01T18:00:00', followUp:false, automatisch:true }
        ],
        avatarBg:'#d946ef', foto:null
    },
    'Stefan Braun': {
        id:'KDB009', ort:'Marburg', segment:'Potenzial', ertrag:750, finanzplan:false, letztKontakt:'05.02.2026',
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
            { typ:'chatbot', datum:'2026-03-08T23:00:00', betreff:'genoGPT: Depot-Wechsel', verlauf:[
                {rolle:'kunde',text:'Warum sollte ich mein Depot von Trade Republic zu euch wechseln?'},
                {rolle:'bot',text:'Der VR-MeinDepot bietet: pers\u00f6nliche Beratung, Union Investment Fonds und Integration in Ihre VR-FinanzPlan Gesamtplanung. Die TER der UniGlobal ETFs liegt bei 0,4% p.a.'},
                {rolle:'kunde',text:'Das ist teurer als mein Trade Republic ETF'},
                {rolle:'bot',text:'Stimmt, aber Sie erhalten daf\u00fcr pers\u00f6nliche Beratung und eine ganzheitliche Finanzplanung. Soll ich einen unverbindlichen Vergleichstermin vereinbaren?'},
                {rolle:'kunde',text:'Nein danke, ich bleibe bei Trade Republic'}
            ], ergebnis:'Kein Wechselinteresse', themen:['depot','wechsel'], status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-02-10T10:00:00', betreff:'Absicherungs-L\u00fccken erkannt', inhalt:'System hat erkannt: Keine BU-Versicherung, keine Altersvorsorge, keine Haftpflicht \u00fcber Verbundpartner. R+V Absicherungspaket empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-02-05T09:00:00', betreff:'VR-FinanzPlan Einladung', inhalt:'Einladung zur ganzheitlichen Finanzberatung', status:'geoeffnet', geoeffnetAm:'2026-02-05T22:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-20T14:00:00', betreff:'Kundenbindungsgespr\u00e4ch', inhalt:'NPS-R\u00fcckmeldung besprochen, Verbesserungen zugesagt', status:'erledigt' }
        ],
        avatarBg:'#ea580c', foto:null
    },
    'Katharina Wolf': {
        id:'KDB010', ort:'Gießen', segment:'Standard', ertrag:2100, finanzplan:true, letztKontakt:'01.02.2026',
        geburtsdatum:'03.03.1988', adresse:'Schillerstr. 9, 35390 Gießen', telefon:'+49 641 77890', email:'k.wolf@email.de',
        beruf:'Architektin', familienstand:'Verheiratet', arbeitgeber:'Wolf Architekten', beschaeftigtSeit:'01.01.2016',
        nettoeinkommen:4600, kinder:[{name:'Lara',alter:3}],
        risikoscore:25, bonitaet:84,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0090 1234 56', saldo:7400, eroeffnung:'01.01.2016', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Wolf Architekten', saldo:22000, eroeffnung:'01.01.2016', status:'Aktiv' },
            { produkt:'FuchsImmo XS (Schwäbisch Hall)', details:'Bausparsumme 80.000 \u2022 Effektivzins ab 1,95% \u2022 Zuteilungsreif 2026', saldo:40000, eroeffnung:'01.06.2020', status:'Aktiv' },
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
            { typ:'chatbot', datum:'2026-03-04T19:30:00', betreff:'genoGPT: Bausparvertrag Zuteilung', verlauf:[
                {rolle:'kunde',text:'Mein Bausparvertrag bei Schw\u00e4bisch Hall ist bald zuteilungsreif. Was bedeutet das?'},
                {rolle:'bot',text:'Ihr FuchsImmo XS (Bausparsumme 80.000\u20ac) ist 2026 zuteilungsreif. Sie k\u00f6nnen das Bauspardarlehen (bis 40.000\u20ac) abrufen oder die Sparsumme auszahlen lassen.'},
                {rolle:'kunde',text:'Kann ich das Darlehen f\u00fcr eine Renovierung nutzen?'},
                {rolle:'bot',text:'Ja, Bauspardarlehen sind wohnwirtschaftlich gebunden. Renovierung, Modernisierung oder Umbau sind m\u00f6glich. Soll ich einen Beratungstermin vereinbaren?'},
                {rolle:'kunde',text:'Ja bitte, wir planen eine K\u00fcchenrenovierung'}
            ], ergebnis:'Terminwunsch Bauspardarlehen Renovierung', themen:['bauspar','zuteilung','renovierung','termin'], status:'termin_geplant' },
            { typ:'termin', datum:'2026-02-01T10:00:00', betreff:'VR-FinanzPlan Review', inhalt:'Finanzplanung mit Immobilie + Kind aktualisiert', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-01-28T10:00:00', betreff:'RLV f\u00fcr Baufinanzierung empfohlen', inhalt:'System hat erkannt: Baufinanzierung 180.000\u20ac ohne Risikolebensversicherung. R+V RLV dringend empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-01-25T09:00:00', betreff:'Risikolebensversicherung', inhalt:'Angebot Absicherung Baufinanzierung', status:'geoeffnet', geoeffnetAm:'2026-01-25T20:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-15T14:00:00', betreff:'Bausparvertrag Zuteilung', inhalt:'Info zu Zuteilungsoptionen', status:'erledigt' },
            { typ:'brief', datum:'2026-01-10T08:00:00', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug alle Konten', status:'versendet', followUp:false, automatisch:true }
        ],
        avatarBg:'#059669', foto:null
    },
    'Jürgen Peters': {
        id:'KDB011', ort:'Wetzlar', segment:'Premium', ertrag:5100, finanzplan:true, letztKontakt:'28.01.2026',
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
            { typ:'chatbot', datum:'2026-03-09T17:00:00', betreff:'genoGPT: Verm\u00f6gensverwaltung', verlauf:[
                {rolle:'kunde',text:'Ich m\u00f6chte mein Depot professionell verwalten lassen. Was bieten Sie an?'},
                {rolle:'bot',text:'Die VR-Verm\u00f6gensverwaltung startet ab 100.000\u20ac Anlagesumme. Mit Ihrem Depotvolumen von 120.000\u20ac sind Sie im Premium-Segment. Verwaltungsgeb\u00fchr ab 0,8% p.a.'},
                {rolle:'kunde',text:'Wie sieht die Performance aus?'},
                {rolle:'bot',text:'Die VR-Verm\u00f6gensverwaltung Balanced hat in den letzten 5 Jahren durchschnittlich 6,2% p.a. erzielt. Soll ich einen Beratungstermin vereinbaren?'},
                {rolle:'kunde',text:'Ja, machen Sie einen Termin'}
            ], ergebnis:'Terminwunsch Verm\u00f6gensverwaltung', themen:['vermoegen','verwaltung','termin'], status:'termin_geplant' },
            { typ:'termin', datum:'2026-01-28T10:00:00', betreff:'Nachfolgeplanung', inhalt:'Unternehmensnachfolge \u2013 Sohn Stefan als Nachfolger', status:'erledigt' },
            { typ:'ki_kontakt', datum:'2026-01-22T10:00:00', betreff:'Swiss Life LV Ablauf 2028', inhalt:'System hat erkannt: Swiss Life Kapital-LV (180.000\u20ac) l\u00e4uft 2028 ab. Wiederanlage \u00fcber Union Investment VR-Verm\u00f6gensverwaltung empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-01-22T09:00:00', betreff:'Stiftungsmodell', inhalt:'Informationen zur Familienstiftung', status:'geoeffnet', geoeffnetAm:'2026-01-22T20:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-15T14:00:00', betreff:'Gewerbekredit Prolongation', inhalt:'Konditionen f\u00fcr Kreditverl\u00e4ngerung besprochen', status:'erledigt' },
            { typ:'portal', datum:'2026-01-10T09:00:00', betreff:'Online-Banking: Gesch\u00e4ftskonto-\u00dcbersicht', inhalt:'Kunde hat Gesch\u00e4ftskonto-Ums\u00e4tze und Kreditvertrag im Online-Banking eingesehen.', status:'erledigt', dokument:'Gewerbekredit-Vertrag-2024.pdf' },
            { typ:'termin', datum:'2026-01-08T10:00:00', betreff:'Jahresgespr\u00e4ch Firma', inhalt:'Gesch\u00e4ftsentwicklung und Finanzierungsbedarf 2026', status:'erledigt' },
            { typ:'brief', datum:'2026-01-02T08:00:00', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Gesch\u00e4fts- + Privatkonten', status:'versendet', followUp:false, automatisch:true }
        ],
        avatarBg:'#7c3aed', foto:null
    },
    'Sabine Kraus': {
        id:'KDB012', ort:'Lich', segment:'Standard', ertrag:1900, finanzplan:false, letztKontakt:'25.01.2026',
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
            { typ:'chatbot', datum:'2026-03-06T21:00:00', betreff:'genoGPT: Krankenversicherung', verlauf:[
                {rolle:'kunde',text:'Gibt es eine Zahnzusatzversicherung f\u00fcr meine Kinder?'},
                {rolle:'bot',text:'Die R+V Zahnzusatz Z1U sch\u00fctzt Kinder ab Geburt. F\u00fcr Paul (8) und Clara (5) empfehle ich den Tarif mit Kieferorthop\u00e4die-Leistung. Ab 8\u20ac/Mon. pro Kind.'},
                {rolle:'kunde',text:'Paul braucht bald eine Zahnspange. Ist das mitversichert?'},
                {rolle:'bot',text:'Ja, die R+V Z1U \u00fcbernimmt bis zu 90% der Kosten f\u00fcr Kieferorthop\u00e4die. Achtung: 8 Monate Wartezeit. Soll ich einen Beratungstermin vereinbaren?'},
                {rolle:'kunde',text:'Ja, m\u00f6glichst schnell!'}
            ], ergebnis:'Terminwunsch Zahnzusatz Kinder dringend', themen:['zahnzusatz','kinder','termin'], status:'termin_geplant' },
            { typ:'ki_kontakt', datum:'2026-01-28T10:00:00', betreff:'Depot-Konsolidierung empfohlen', inhalt:'System hat erkannt: Kundin hat Comdirect-Depot (52.000\u20ac) extern. VR-MeinDepot Wechsel mit Pr\u00e4mie empfohlen.', status:'geoeffnet', followUp:false, automatisch:true, ausloeser:'regelbasiert' },
            { typ:'email', datum:'2026-01-25T09:00:00', betreff:'Depot-Wechsel Angebot', inhalt:'VR-MeinDepot Vergleich zu Comdirect', status:'geoeffnet', geoeffnetAm:'2026-01-25T20:00:00', followUp:false, automatisch:true },
            { typ:'call', datum:'2026-01-18T14:00:00', betreff:'Krankenversicherung Erweiterung', inhalt:'Zusatzversicherung f\u00fcr Kinder besprochen', status:'erledigt' },
            { typ:'termin', datum:'2026-01-10T10:00:00', betreff:'Jahresgespr\u00e4ch', inhalt:'Finanzplanung Familie + Apotheke', status:'erledigt' }
        ],
        avatarBg:'#be185d', foto:null
    }
};

// OPT-26 Personas ueberschreiben Legacy-Daten
var bankMockKunden = Object.assign({}, _legacyBankKunden, window._bankingPersonas || {});

// Default for any customer not explicitly defined
var bankDefaultKunde = {
    geburtsdatum:'01.01.1980', adresse:'Musterstr. 1, 35390 Gießen', telefon:'+49 641 00000', email:'kunde@email.de',
    beruf:'Angestellt', familienstand:'Ledig', arbeitgeber:'Firma GmbH', beschaeftigtSeit:'01.01.2010',
    nettoeinkommen:3500, kinder:[],
    risikoscore:25, bonitaet:75,
    nps: { score:7, kategorie:'passive', datum:'01.01.2026', kampagne:'Standard', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:7}] },
    konten: [{ produkt:'VR-Girokonto', details:'Standardkonto', saldo:2500, eroeffnung:'01.01.2015', status:'Aktiv' }],
    fidaVertraege: [],
    kommunikation: [{ typ:'email', datum:'2026-01-01T09:00:00', betreff:'Willkommen', inhalt:'Begr\u00fc\u00dfung', status:'versendet', followUp:false, automatisch:true }],
    avatarBg:'#64748b', foto:null
};

// ── CUSTOMER PHOTOS MAP ──
var bankKundenFotos = {
    'Klaus Fischer': 'assets/images/AdobeStock_624564221.jpeg',
    'Sandra Müller': 'assets/images/AdobeStock_252262042.jpeg',
    'Markus Wagner': 'assets/images/AdobeStock_361342769.jpeg',
    'Julia Becker': 'assets/images/AdobeStock_612932760.jpeg',
    'Peter Hoffmann': 'assets/images/AdobeStock_1091012713.jpeg'
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
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;text-transform:uppercase;">Gesamt CLV</div><div style="font-size:20px;font-weight:700;color:#1e293b;">\u20AC' + clv.value.toLocaleString('de-DE') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;text-transform:uppercase;">Segment</div><div style="font-size:20px;font-weight:700;color:#1e293b;">' + clv.segment + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;text-transform:uppercase;">Haltedauer (Prognose)</div><div style="font-size:20px;font-weight:700;color:#1e293b;">' + clv.haltedauer + ' J.</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;text-transform:uppercase;">Abwanderungsrisiko</div><div style="font-size:20px;font-weight:700;color:' + (clv.churnRisk < 10 ? '#16a34a' : '#dc2626') + ';">' + clv.churnRisk + '%</div></div>' +
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

    // Re-apply finance mode to newly created elements
    var currentMode = (typeof financeMode !== 'undefined') ? financeMode : (safeLocalGet('financeMode', 'closed'));
    if (typeof setFinanceMode === 'function') {
        setFinanceMode(currentMode);
    }
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

// calculateBankCLV() moved to clv.js for unified CLV module

// ── STICKY BAR ──
function fillBankStickyBar(kundenName, retailData, kd, clv) {
    // Use shared sticky bar elements (kundeBarXxxB)
    if (typeof updateKundeStickyBar === 'function') {
        var clvStr = '\u20AC' + clv.value.toLocaleString('de-DE');
        updateKundeStickyBar(kundenName, retailData ? retailData.id : (kd.id || 'KDB000'), kd.nps, clvStr, clv.segment);
    }
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
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;">Consent-Status</div><div style="font-size:14px;font-weight:700;"><span class="status-badge ' + (hasConsent?'aktiv':'storniert') + '">' + (hasConsent?'Aktiv':'Nicht erteilt') + '</span></div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;">Erteilt am</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].consent : '&mdash;') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;">Gültig bis</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].gueltig : '&mdash;') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:13px;color:#64748b;">Datenquellen</div><div style="font-size:14px;font-weight:700;">' + kd.fidaVertraege.length + '</div></div>' +
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
                var logo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(f.institut, 18) : '';
                rows += '<tr class="open-finance-only"><td>' + logo + ' <strong>' + f.institut + '</strong></td><td>' + f.typ + '</td><td>' + f.info + '</td><td>' + f.consent + '</td><td>' + f.gueltig + '</td></tr>';
            });
            tableEl.innerHTML = rows;
        }
    }
    
    // Bedarfsfeld cards (simplified content)
    var bezahlenEl = document.getElementById('bankFidaBezahlenContent');
    if (bezahlenEl && kd.fidaVertraege.length > 0) {
        bezahlenEl.innerHTML = '<div style="padding:16px;"><div class="fida-finance-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
            '<div style="padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;"><div style="font-size:13px;color:#64748b;">Nettoeinkommen</div><div style="font-size:18px;font-weight:700;color:#16a34a;">\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '</div></div>' +
            '<div style="padding:12px;background:#fef2f2;border-radius:8px;text-align:center;"><div style="font-size:13px;color:#64748b;">Ausgaben (Schnitt)</div><div style="font-size:18px;font-weight:700;color:#dc2626;">\u20AC' + Math.round(kd.nettoeinkommen * 0.65).toLocaleString('de-DE') + '</div></div>' +
            '<div style="padding:12px;background:#eff6ff;border-radius:8px;text-align:center;"><div style="font-size:13px;color:#64748b;">Freies Einkommen</div><div style="font-size:18px;font-weight:700;color:#2563eb;">\u20AC' + Math.round(kd.nettoeinkommen * 0.35).toLocaleString('de-DE') + '</div></div>' +
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
            sparenHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:15px;font-weight:600;color:#475569;margin:16px 0 8px;">Geldmarkt</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Produkt</th><th>Anbieter</th><th>Volumen</th><th>Zinssatz</th><th>Laufzeit</th></tr></thead><tbody>';
            geldmarkt.forEach(function(g) {
                totalGeld += g.volumen;
                var gLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(g.anbieter, 16) : '';
                var fidaClass = g.quelle === 'FIDA' ? ' class="open-finance-only"' : '';
                sparenHtml += '<tr' + fidaClass + '><td><strong>' + g.produkt + '</strong>' + (g.quelle === 'FIDA' ? ' <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:10px;">FIDA</span>' : '') + '</td>' +
                    '<td>' + gLogo + ' ' + g.anbieter + '</td><td>\u20AC' + g.volumen.toLocaleString('de-DE') + '</td><td>' + g.zinssatz + '</td><td>' + g.laufzeit + '</td></tr>';
            });
            sparenHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Geldmarkt</td><td></td><td>\u20AC' + totalGeld.toLocaleString('de-DE') + '</td><td></td><td></td></tr>';
            sparenHtml += '</tbody></table></div>';
        }
        // Kapitalmarkt
        var kapital = kd.sparenKapitalmarkt || [];
        if (kapital.length > 0) {
            var totalKap = 0;
            sparenHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:15px;font-weight:600;color:#475569;margin:16px 0 8px;">Kapitalmarkt</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Produkt</th><th>Anbieter</th><th>Volumen</th><th>Sparrate</th><th>Performance YTD</th></tr></thead><tbody>';
            kapital.forEach(function(k) {
                totalKap += k.volumen;
                var kLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(k.anbieter, 16) : '';
                var fidaClass = k.quelle === 'FIDA' ? ' class="open-finance-only"' : '';
                sparenHtml += '<tr' + fidaClass + '><td><strong>' + k.produkt + '</strong>' + (k.quelle === 'FIDA' ? ' <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:10px;">FIDA</span>' : '') + '</td>' +
                    '<td>' + kLogo + ' ' + k.anbieter + '</td><td>\u20AC' + k.volumen.toLocaleString('de-DE') + '</td><td>' + k.sparrate + '</td><td style="color:#16a34a;">' + k.performance + '</td></tr>';
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
            absHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:15px;font-weight:600;color:#475569;margin:16px 0 8px;">Eigene Versicherungen (R+V / VR)</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Versicherung</th><th>Anbieter</th><th>Deckungssumme</th><th>Tarifart</th><th>Leistungsumfang</th><th>Prämie</th><th>Vertragsnr.</th></tr></thead><tbody>';
            eigen.forEach(function(v) {
                var tags = v.leistungen.map(function(l) { return '<span class="leistung-tag" style="display:inline-block;font-size:10px;background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;margin:1px;">' + l + '</span>'; }).join(' ');
                var eLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(v.anbieter, 16) : '';
                absHtml += '<tr><td><strong>' + v.versicherung + '</strong></td><td>' + eLogo + ' ' + v.anbieter + '</td><td>' + v.deckung + '</td>' +
                    '<td><span class="tarif-badge" style="font-size:10px;padding:2px 8px;border-radius:10px;background:#dbeafe;color:#1e40af;">' + v.tarifart + '</span></td>' +
                    '<td>' + tags + '</td><td>' + v.praemie + '</td><td>' + v.vertrag + '</td></tr>';
            });
            absHtml += '</tbody></table></div>';
        }
        // Fremd-Versicherungen (Wettbewerber)
        var fremd = kd.versicherungenFremd || [];
        if (fremd.length > 0) {
            absHtml += '<div class="bedarfsfeld-section open-finance-only" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:15px;font-weight:600;color:#475569;margin:16px 0 8px;">Wettbewerber-Versicherungen</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Versicherung</th><th>Anbieter</th><th>Deckungssumme</th><th>Tarifart</th><th>Leistungsumfang</th><th>Selbstbehalt</th><th>Prämie</th><th>Kündigungsfrist</th></tr></thead><tbody>';
            fremd.forEach(function(v) {
                var tags = v.leistungen.map(function(l) { return '<span class="leistung-tag" style="display:inline-block;font-size:10px;background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;margin:1px;">' + l + '</span>'; }).join(' ');
                var fLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(v.anbieter, 16) : '';
                absHtml += '<tr><td><strong>' + v.versicherung + '</strong></td><td>' + fLogo + ' ' + v.anbieter + '</td><td>' + v.deckung + '</td>' +
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
                var fkLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(f.kreditgeber, 16) : '';
                finHtml += '<tr><td><strong>' + f.kredit + '</strong></td><td>' + fkLogo + ' ' + f.kreditgeber + '</td>' +
                    '<td>\u20AC' + f.ursprung.toLocaleString('de-DE') + '</td><td>\u20AC' + f.restschuld.toLocaleString('de-DE') + '</td>' +
                    '<td>' + f.zinssatz + '</td><td>' + f.rate + '</td><td>' + f.laufzeit + '</td><td>' + f.absicherung + '</td></tr>';
            });
            finHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Verbindlichkeiten</td><td></td><td></td><td>\u20AC' + totalRest.toLocaleString('de-DE') + '</td><td></td><td></td><td></td><td></td></tr>';
            finHtml += '</tbody></table></div>';
            // Hinweise
            finanz.forEach(function(f) {
                if (f.hinweis) {
                    finHtml += '<div style="margin:0 16px 16px;padding:12px 16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;font-size:15px;color:#92400e;">' +
                        '<strong>Hinweis:</strong> ' + f.hinweis + '</div>';
                }
            });
        } else {
            finHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Finanzierungen vorhanden.</div>';
        }
        finanzEl.innerHTML = finHtml;
    }
}

// ── WINDOW EXPORTS ──
window.fillBankKundenDetail = fillBankKundenDetail;
window.switchBankKundenTab = switchBankKundenTab;
window.bankMockKunden = bankMockKunden;

window.__registerModule('kunden-detail-banking.js');
