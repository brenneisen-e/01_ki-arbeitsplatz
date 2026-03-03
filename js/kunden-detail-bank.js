/* ============================================================
   B-10 KUNDEN-DETAIL BANK  –  Banking Customer Detail
   Mirrors kunden-detail.js (A-10) structure exactly
   ============================================================ */

// ── MOCK KUNDEN DETAIL DATA ──
var bankMockKunden = {
    'Klaus Fischer': {
        geburtsdatum:'12.05.1978', adresse:'Hauptstrasse 45, 35390 Giessen', telefon:'+49 641 98765', email:'k.fischer@email.de',
        beruf:'Maschinenbau-Ingenieur', familienstand:'Verheiratet', arbeitgeber:'Continental AG', beschaeftigtSeit:'01.04.2008',
        nettoeinkommen:4850, kinder:[{name:'Lukas',alter:12},{name:'Emma',alter:9}],
        risikoscore:28, bonitaet:82,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualitaet',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Plus', details:'IBAN DE89 5066 1639 0012 3456 78', saldo:8450, eroeffnung:'15.03.2010', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:42000, eroeffnung:'01.06.2020', status:'Aktiv' },
            { produkt:'Baufinanzierung', details:'Restschuld, Zinsbindung bis 09/2026', saldo:-185000, eroeffnung:'01.09.2016', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'ETF-Sparplan 300/Mon.', saldo:28500, eroeffnung:'15.01.2022', status:'Aktiv' },
            { produkt:'Riester-Rente VR', details:'Beitrag 175/Mon.', saldo:18200, eroeffnung:'01.04.2018', status:'Aktiv' },
            { produkt:'Unfallversicherung', details:'Grundsumme 80.000', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Giessen', typ:'Girokonto', info:'Zweitkonto, Gehalt', consent:'12.01.2026', gueltig:'12.01.2027' },
            { institut:'ING', typ:'Extra-Konto', info:'Tagesgeld 18.500', consent:'12.01.2026', gueltig:'12.01.2027' },
            { institut:'Trade Republic', typ:'Depot', info:'ETF-Sparplan 200/Mon.', consent:'12.01.2026', gueltig:'12.01.2027' }
        ],
        kommunikation: [
            { typ:'email', datum:'28.02.2026', betreff:'Anschlussfinanzierung Angebot', inhalt:'Angebot fuer Baufi-Anschluss gesendet', status:'Geoeffnet' },
            { typ:'call', datum:'20.02.2026', betreff:'Telefonat Baufinanzierung', inhalt:'Beratungsgespraech zu Anschlussoptionen', status:'Erledigt' },
            { typ:'termin', datum:'15.02.2026', betreff:'Jahresgespraech', inhalt:'VR-FinanzPlan Review durchgefuehrt', status:'Erledigt' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Depot + Konten', status:'Versendet' }
        ],
        avatarBg:'#2563eb', foto:'assets/images/AdobeStock_624564221.jpeg'
    },
    'Sandra Mueller': {
        geburtsdatum:'23.11.1985', adresse:'Bahnhofstr. 12, 35578 Wetzlar', telefon:'+49 6441 55432', email:'s.mueller@email.de',
        beruf:'Aerztin', familienstand:'Ledig', arbeitgeber:'Uniklinik Giessen', beschaeftigtSeit:'01.08.2015',
        nettoeinkommen:5200, kinder:[{name:'Mia',alter:4}],
        risikoscore:15, bonitaet:91,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualitaet',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:6},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:7}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0098 7654 32', saldo:12800, eroeffnung:'01.09.2015', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:85000, eroeffnung:'15.03.2020', status:'Aktiv' },
            { produkt:'VR-Festgeld 12M', details:'3,2% p.a., Faelligkeit 06/2026', saldo:50000, eroeffnung:'01.06.2025', status:'Aktiv' },
            { produkt:'Kreditkarte Gold', details:'Limit 5.000', saldo:-1200, eroeffnung:'01.01.2018', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Commerzbank', typ:'Girokonto', info:'Gehaltskonto', consent:'20.01.2026', gueltig:'20.01.2027' },
            { institut:'N26', typ:'Girokonto', info:'Zweitkonto', consent:'20.01.2026', gueltig:'20.01.2027' }
        ],
        kommunikation: [
            { typ:'email', datum:'25.02.2026', betreff:'Festgeld Verlaengerung', inhalt:'Info zu Festgeld-Konditionen', status:'Geoeffnet' },
            { typ:'call', datum:'18.02.2026', betreff:'Altersvorsorge-Beratung', inhalt:'Erstgespraech Altersvorsorge', status:'Erledigt' }
        ],
        avatarBg:'#9333ea', foto:'assets/images/AdobeStock_252262042.jpeg'
    },
    'Markus Wagner': {
        geburtsdatum:'08.03.1972', adresse:'Schulstr. 8, 35037 Marburg', telefon:'+49 6421 77890', email:'m.wagner@email.de',
        beruf:'Lehrer', familienstand:'Verheiratet', arbeitgeber:'Land Hessen', beschaeftigtSeit:'01.02.2000',
        nettoeinkommen:3800, kinder:[{name:'Tim',alter:14},{name:'Jana',alter:11}],
        risikoscore:22, bonitaet:75,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualitaet',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:9},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0045 6789 01', saldo:4200, eroeffnung:'01.03.2005', status:'Aktiv' },
            { produkt:'Bausparvertrag', details:'Wuestenrot, Bausparsumme 60.000', saldo:35000, eroeffnung:'01.01.2012', status:'Aktiv' },
            { produkt:'Riester-Rente VR', details:'Beitrag 162,17/Mon.', saldo:22400, eroeffnung:'01.01.2010', status:'Aktiv' }
        ],
        fidaVertraege: [],
        kommunikation: [
            { typ:'termin', datum:'20.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Jaehrliches Review der Finanzplanung', status:'Erledigt' }
        ],
        avatarBg:'#16a34a', foto:'assets/images/AdobeStock_361342769.jpeg'
    }
};

// Default for any customer not explicitly defined
var bankDefaultKunde = {
    geburtsdatum:'01.01.1980', adresse:'Musterstr. 1, 35390 Giessen', telefon:'+49 641 00000', email:'kunde@email.de',
    beruf:'Angestellt', familienstand:'Ledig', arbeitgeber:'Firma GmbH', beschaeftigtSeit:'01.01.2010',
    nettoeinkommen:3500, kinder:[],
    risikoscore:25, bonitaet:75,
    nps: { score:7, kategorie:'passive', datum:'01.01.2026', kampagne:'Standard', details:[{name:'Beratungsqualitaet',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:7}] },
    konten: [{ produkt:'VR-Girokonto', details:'Standardkonto', saldo:2500, eroeffnung:'01.01.2015', status:'Aktiv' }],
    fidaVertraege: [],
    kommunikation: [{ typ:'email', datum:'01.01.2026', betreff:'Willkommen', inhalt:'Begruessung', status:'Versendet' }],
    avatarBg:'#64748b', foto:null
};

// ── CUSTOMER PHOTOS MAP ──
var bankKundenFotos = {
    'Klaus Fischer': 'assets/images/AdobeStock_624564221.jpeg',
    'Sandra Mueller': 'assets/images/AdobeStock_252262042.jpeg',
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
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Gueltig bis</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].gueltig : '&mdash;') + '</div></div>' +
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
}

// ── FILL IMPULSE TAB ──
function fillBankImpulse(kundenName, kd, retailData) {
    var el = document.getElementById('bankImpulseContent');
    if (!el) return;
    
    var impulse = [];
    // Generate impulses based on customer data
    if (!retailData || !retailData.finanzplan) {
        impulse.push({ icon:'plan', title:'VR-FinanzPlan erstellen', beschr:'Kein FinanzPlan vorhanden. Ganzheitliche Beratung empfohlen.', prio:'high', quelle:'Intern' });
    }
    if (kd.fidaVertraege.length > 0) {
        impulse.push({ icon:'fida', title:'Cross-Selling aus Open Finance', beschr:'Drittbank-Daten zeigen Optimierungspotential. Konsolidierung empfohlen.', prio:'high', quelle:'FIDA' });
    } else {
        impulse.push({ icon:'fida', title:'FIDA-Consent einholen', beschr:'Open Finance Daten fehlen. Consent anfordern fuer vollstaendige Analyse.', prio:'medium', quelle:'System' });
    }
    if (kd.konten.length < 4) {
        impulse.push({ icon:'cross', title:'Produktbreite erhoehen', beschr:'Nur ' + kd.konten.length + ' Produkte. Cross-Selling-Potential identifiziert.', prio:'medium', quelle:'KI' });
    }
    if (kd.nps.score <= 6) {
        impulse.push({ icon:'nps', title:'Kundenzufriedenheit verbessern', beschr:'NPS Score ' + kd.nps.score + '/10. Persoenliches Gespraech empfohlen.', prio:'high', quelle:'NPS' });
    }
    impulse.push({ icon:'vorsorge', title:'Altersvorsorge pruefen', beschr:'Versorgungsluecke im Alter identifiziert. Beratung empfohlen.', prio:'medium', quelle:'KI' });
    
    var iconSvgs = {
        plan: '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        fida: '<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
        cross: '<svg viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        nps: '<svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        vorsorge: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    };
    
    var html = '';
    impulse.forEach(function(imp) {
        html += '<div class="impuls-item" style="display:flex;align-items:flex-start;gap:12px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">' +
            '<div class="impuls-icon" style="flex-shrink:0;">' + (iconSvgs[imp.icon] || '') + '</div>' +
            '<div class="impuls-text" style="flex:1;"><div style="font-weight:600;margin-bottom:2px;">' + imp.title + '</div><div style="font-size:12px;color:#64748b;">' + imp.beschr + '</div>' +
            (imp.quelle === 'FIDA' ? '<span class="fida-source-badge" style="display:inline-block;margin-top:4px;padding:2px 6px;background:#dcfce7;color:#16a34a;font-size:10px;border-radius:4px;font-weight:600;">FIDA</span>' : '') +
            '</div>' +
            '<span class="impuls-priority ' + imp.prio + '" style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + (imp.prio==='high'?'Hoch':'Mittel') + '</span>' +
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
            '<div style="margin-top:16px;padding:12px;background:#eff6ff;border-radius:8px;border-left:3px solid #2563eb;"><strong>Sparquote: ' + sparquote + '%</strong> &mdash; ' + (sparquote >= 20 ? 'Gute Sparquote. Potential fuer Anlage-Beratung.' : 'Unter Durchschnitt. Budgetberatung empfohlen.') + '</div>' +
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
    
    var statusColors = { 'Geoeffnet':'#16a34a', 'Erledigt':'#2563eb', 'Versendet':'#64748b', 'Geplant':'#f59e0b' };
    
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
