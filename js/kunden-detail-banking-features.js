// ============================================================
// kunden-detail-banking-features.js – Banking Feature-Tabs (Impulse, Finanzplanung, Kommunikation)
// Split aus kunden-detail-banking.js (OPT-18)
// Abhängigkeiten: kunden-detail-banking.js (bankMockKunden),
//                 kunden-detail-komm.js (formatKommDatum, getKommStatusLabel)
// ============================================================


// ── FILL IMPULSE TAB ──
function fillBankImpulse(kundenName, kd, retailData) {
    var el = document.getElementById('bankImpulseContent');
    if (!el) return;

    var impulse = [];
    // Impulse generiert durch KI-Vertriebsassistent
    if (!retailData || !retailData.finanzplan) {
        impulse.push({
            id: 'bank-impuls-finanzplan', icon:'plan',
            title:'VR-FinanzPlan erstellen (OKP-Beratungsstrecke)',
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
    }
    // Note: FIDA-Consent einholen is NOT an impulse - it belongs in the FIDA/Open Finance tab
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
        title:'Altersvorsorge pr\u00fcfen (Union Investment / R+V)',
        beschr:'Versorgungsl\u00fccke im Alter durch KI-Vertriebsassistent identifiziert. Verbundpartner-Beratung empfohlen.',
        prio:'medium', quelle:'KI-Vertriebsassistent',
        herleitung: [
            { label:'Datenquelle', value:'KI-Vertriebsassistent \u2013 Einkommens- und Vorsorgeanalyse' },
            { label:'Erkannte Situation', value:'Nettoeinkommen \u20AC' + (kd.nettoeinkommen || 0).toLocaleString('de-DE') + ' \u2013 Versorgungsl\u00fccke wahrscheinlich' },
            { label:'Verbundpartner', value:'Union Investment (UniProfiRente, VermögenPlus), R+V (BU-Versicherung), Schwäbisch Hall (Wohn-Riester)' },
            { label:'Empfehlung', value:'Rentenl\u00fccken-Analyse via VR-FinanzPlan (OKP), Zusatzvorsorge \u00fcber Verbundpartner empfehlen' }
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
        var impFidaClass = imp.quelle === 'FIDA' ? ' open-finance-only' : '';
        html += '<div class="impuls-item highlight clickable' + impFidaClass + '" onclick="toggleImpulsDetail(\'' + imp.id + '\')">' +
            '<div class="impuls-icon">' + (iconSvgs[imp.icon] || '') + '</div>' +
            '<div class="impuls-text">' +
                '<strong>' + imp.title + '</strong>' +
                '<p>' + (imp.quelle === 'FIDA' ? '<span class="fida-source-badge small">Open Finance</span> ' : '') + imp.beschr + '</p>' +
            '</div>' +
            '<span class="impuls-priority ' + imp.prio + '">' + (imp.prio==='high'?'Hohe Priorit\u00e4t':'Mittlere Priorit\u00e4t') + '</span>' +
            '<span class="impuls-expand">' + expandSvg + '</span>' +
        '</div>';

        // Expandable detail panel
        html += '<div class="impuls-detail' + impFidaClass + '" id="' + imp.id + '" style="display:none;">' +
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
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:15px;">Nettoeinkommen (fix)</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:100%;background:#16a34a;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;">\u20AC' + einkommen.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:15px;">Fixe Ausgaben</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:45%;background:#dc2626;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;color:#dc2626;">-\u20AC' + fixeAusgaben.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:15px;">Variable Ausgaben</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:20%;background:#f59e0b;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;color:#f59e0b;">-\u20AC' + variableAusgaben.toLocaleString('de-DE') + '</span></div>' +
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
            '<div style="display:flex;justify-content:space-between;font-size:14px;color:#64748b;"><span>\u20AC32.500 von \u20AC50.000</span><span>65%</span></div></div>' +
            '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>Ausbildung Kinder</strong><span class="status-badge antrag">Geplant</span></div>' +
            '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:28%;background:#2563eb;border-radius:4px;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:14px;color:#64748b;"><span>\u20AC14.000 von \u20AC50.000</span><span>28%</span></div></div>' +
            '</div>';
    }
}

// ── FILL KOMMUNIKATION TAB ──
function fillBankKommunikation(kd) {
    var el = document.getElementById('bankKundenKommunikation');
    if (!el) return;

    // Use kommTypConfig if available, else fallback
    var iconMap = {};
    if (typeof kommTypConfig !== 'undefined') {
        for (var key in kommTypConfig) {
            iconMap[key] = kommTypConfig[key].icon;
        }
    }
    // Alias call -> telefon for icon lookup
    iconMap.call = iconMap.telefon || iconMap.call || '';

    var statusColors = {
        'geoeffnet':'#16a34a', 'erledigt':'#2563eb', 'versendet':'#64748b',
        'termin_geplant':'#f59e0b', 'beantwortet':'#2563eb',
        'Ge\u00f6ffnet':'#16a34a', 'Erledigt':'#2563eb', 'Versendet':'#64748b', 'Geplant':'#f59e0b'
    };

    // Sort by date descending
    var sorted = kd.kommunikation.slice().sort(function(a, b) {
        return new Date(b.datum) - new Date(a.datum);
    });

    var html = '';
    sorted.forEach(function(k) {
        var typKey = k.typ === 'call' ? 'telefon' : k.typ;
        var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig[typKey]) ? kommTypConfig[typKey] : { farbe: '#64748b', icon: '', label: typKey };
        var color = statusColors[k.status] || '#64748b';
        var statusLabel = k.status;
        if (typeof getKommStatusLabel === 'function') statusLabel = getKommStatusLabel(k.status);
        var datum = (typeof formatKommDatum === 'function' && k.datum.includes('T')) ? formatKommDatum(k.datum) : k.datum;

        // Chatbot entry with verlauf
        if (k.typ === 'chatbot' && k.verlauf) {
            html += '<div class="komm-item chatbot" data-typ="chatbot" style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #f1f5f9;border-left:3px solid ' + config.farbe + ';padding-left:12px;">' +
                '<div class="komm-icon" style="width:36px;height:36px;border-radius:50%;background:' + config.farbe + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + config.farbe + ';">' + config.icon + '</div>' +
                '<div class="komm-content" style="flex:1;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:14px;color:' + config.farbe + ';font-weight:600;">' + config.label + ' &middot; ' + datum + '</span></div>' +
                '<div style="font-weight:600;margin-bottom:8px;">' + k.betreff + '</div>' +
                '<div class="chatbot-verlauf" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;">';
            k.verlauf.forEach(function(msg) {
                var isKunde = msg.rolle === 'kunde';
                html += '<div style="display:flex;flex-direction:column;align-items:' + (isKunde ? 'flex-start' : 'flex-end') + ';">' +
                    '<span style="font-size:10px;color:#94a3b8;margin-bottom:2px;">' + (isKunde ? 'Kunde' : 'Bot') + '</span>' +
                    '<span style="display:inline-block;padding:8px 12px;border-radius:' + (isKunde ? '12px 12px 12px 0' : '12px 12px 0 12px') + ';background:' + (isKunde ? '#f3f4f6' : config.farbe + '15') + ';font-size:14px;max-width:80%;color:#1e293b;">' + msg.text + '</span></div>';
            });
            html += '</div>';
            if (k.ergebnis) html += '<div style="display:inline-block;padding:4px 10px;border-radius:12px;background:#fef3c7;color:#92400e;font-size:13px;font-weight:600;margin-bottom:6px;">' + k.ergebnis + '</div>';
            html += '</div></div>';
            return;
        }

        // Standard entry
        html += '<div class="komm-item" data-typ="' + typKey + '" style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #f1f5f9;border-left:3px solid ' + config.farbe + ';padding-left:12px;">' +
            '<div class="komm-icon" style="width:36px;height:36px;border-radius:50%;background:' + config.farbe + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + config.farbe + ';">' + config.icon + '</div>' +
            '<div class="komm-content" style="flex:1;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:14px;color:' + config.farbe + ';">' + config.label + ' &middot; ' + datum + '</span><span class="status-badge" style="background:' + color + '20;color:' + color + ';padding:2px 8px;border-radius:4px;font-size:13px;">' + statusLabel + '</span></div>' +
            '<div style="font-weight:600;margin-bottom:2px;">' + k.betreff + '</div>' +
            '<div style="font-size:14px;color:#64748b;">' + (k.inhalt || '') + '</div>' +
            '</div></div>';
    });
    el.innerHTML = html;
}

// ── WINDOW EXPORTS ──
window.fillBankImpulse = fillBankImpulse;
window.fillBankFinanzplanung = fillBankFinanzplanung;
window.fillBankKommunikation = fillBankKommunikation;

window.__registerModule('kunden-detail-banking-features.js');
