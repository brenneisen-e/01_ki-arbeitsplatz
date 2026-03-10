// Split aus kunden-detail-features.js – OPT-15 Kommunikationshistorie
// Abhaengigkeiten: kunden-detail-features.js (switchKundenTab), kunden-detail-data.js (mockKunden), kunden-detail-banking.js (bankMockKunden)

// ========================================
// KOMMUNIKATION ANSEHEN (Legacy-Modal)
// ========================================

function viewKommunikation(kommId) {
    console.log('Kommunikation ansehen:', kommId);

    // Mock-Daten fuer Kommunikation
    const kommunikationen = {
        'email-1': {
            typ: 'E-Mail',
            datum: '28.11.2025, 09:15',
            betreff: 'Kfz-Versicherung: Ihr Vertrag l\u00e4uft aus',
            inhalt: `Sehr geehrter Herr Mustermann,

Ihr Kfz-Vertrag bei der Allianz (Kennzeichen: M-AB 1234) l\u00e4uft am 31.12.2025 aus.

Basierend auf Ihrer Schadenfreiheitsklasse SF12 und Ihren Fahrzeugdaten haben wir ein attraktives Angebot f\u00fcr Sie:

- Haftpflicht + Vollkasko: \u20ac520/Jahr (statt \u20ac680 aktuell)
- Ersparnis: \u20ac160/Jahr

Interesse? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.

Mit freundlichen Gr\u00fc\u00dfen
Ihre Versicherungsagentur`,
            status: 'Ge\u00f6ffnet am 28.11.2025, 14:32'
        },
        'brief-1': {
            typ: 'Brief',
            datum: '15.11.2025',
            betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank f\u00fcr Ihre Open Finance Datenfreigabe vom 15.03.2024.

Basierend auf der Analyse Ihrer Finanzdaten haben wir folgende Optimierungsm\u00f6glichkeiten identifiziert:

1. Risikolebensversicherung
   Ihre Hypothek (\u20ac320.000) ist derzeit nicht abgesichert.

2. Private Altersvorsorge
   Bei Ihrer Sparrate von \u20ac800/Monat k\u00f6nnen wir Ihre Rentenl\u00fccke schlie\u00dfen.

Wir w\u00fcrden uns freuen, diese M\u00f6glichkeiten in einem pers\u00f6nlichen Gespr\u00e4ch mit Ihnen zu besprechen.

Mit freundlichen Gr\u00fc\u00dfen
Ihre Versicherungsagentur`,
            status: 'Versendet'
        },
        'call-1': {
            typ: 'Telefonat',
            datum: '10.11.2025, 11:20',
            betreff: 'R\u00fcckruf wegen Altersvorsorge-Angebot',
            inhalt: `Gespr\u00e4chsnotiz:

Kunde rief zur\u00fcck wegen Brief vom 15.11.

- Interesse an fondsgebundener Rentenversicherung
- M\u00f6chte Angebot mit verschiedenen Fonds-Optionen
- Bevorzugt nachhaltige ETFs
- Budget: ca. \u20ac400/Monat zus\u00e4tzlich zur bestehenden Sparrate

Termin vereinbart: 12.12.2025, 14:00 Uhr
Ort: Agentur

Vorbereitung:
- 3 Angebote mit unterschiedlichen Risikoprofilen
- ESG-Fonds-Optionen`,
            status: 'Termin: 12.12.2025'
        },
        'email-2': {
            typ: 'E-Mail',
            datum: '01.10.2025, 08:00',
            betreff: 'Willkommen bei Open Finance - Ihre Daten sind jetzt verkn\u00fcpft',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank f\u00fcr Ihre Open Finance Datenfreigabe!

Ab sofort k\u00f6nnen wir Ihnen personalisierte Versicherungsempfehlungen basierend auf Ihrer Finanzsituation anbieten.

Was bedeutet das f\u00fcr Sie?
- Wir erkennen automatisch, wenn sich Ihre Lebensumst\u00e4nde \u00e4ndern
- Sie erhalten nur relevante Angebote
- Ihre Daten sind sicher und DSGVO-konform gesch\u00fctzt

Ihre freigegebenen Datenquellen:
- Sparkasse (Girokonto)
- DWS (Depot)
- Sparkasse (Hypothekendarlehen)
- Allianz (Kfz-Versicherung)

Sie k\u00f6nnen Ihre Einwilligung jederzeit \u00fcber das Open Finance Dashboard widerrufen.

Mit freundlichen Gr\u00fc\u00dfen
Ihre Versicherungsagentur`,
            status: 'Ge\u00f6ffnet am 01.10.2025, 19:45'
        }
    };

    const komm = kommunikationen[kommId];
    if (komm) {
        // Inline-Modal statt alert() – konsistent mit B-10 Kommunikations-Timeline
        var existing = document.getElementById('kommDetailOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'kommDetailOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        var typIcon = komm.typ === 'E-Mail' ? '\u2709' : (komm.typ === 'Brief' ? '\ud83d\udcc4' : '\ud83d\udcde');
        var statusColor = komm.status.includes('Ge\u00f6ffnet') ? '#16a34a' : (komm.status.includes('Termin') ? '#2563eb' : '#64748b');

        var modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:12px;max-width:560px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
        modal.innerHTML =
            '<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<span style="font-size:20px;">' + typIcon + '</span>' +
                    '<div><div style="font-weight:700;font-size:15px;color:#1e293b;">' + komm.typ + '</div>' +
                    '<div style="font-size:12px;color:#64748b;">' + komm.datum + '</div></div>' +
                '</div>' +
                '<button onclick="document.getElementById(\'kommDetailOverlay\').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:#94a3b8;padding:4px;">&times;</button>' +
            '</div>' +
            '<div style="padding:24px;">' +
                '<div style="font-weight:600;font-size:14px;color:#1e293b;margin-bottom:16px;">' + komm.betreff + '</div>' +
                '<div style="font-size:13px;color:#475569;line-height:1.7;white-space:pre-wrap;background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">' + komm.inhalt + '</div>' +
                '<div style="margin-top:16px;display:flex;align-items:center;gap:8px;">' +
                    '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + statusColor + ';"></span>' +
                    '<span style="font-size:12px;color:' + statusColor + ';font-weight:500;">' + komm.status + '</span>' +
                '</div>' +
            '</div>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
}

// ========================================
// OPT-15: KOMMUNIKATIONSHISTORIE-UPGRADE
// ========================================

function getKommunikationForKunde(kundenName) {
    var isBanking = document.querySelector('#kundenDetailPage.bank-mode');
    var komm = [];
    if (isBanking && typeof bankMockKunden !== 'undefined') {
        var kd = bankMockKunden[kundenName];
        if (kd && kd.kommunikation) komm = kd.kommunikation;
    } else if (typeof window.mockKunden !== 'undefined') {
        var kd = window.mockKunden[kundenName];
        if (kd && kd.kommunikation) komm = kd.kommunikation;
    }
    return komm;
}

function getCurrentKundenName() {
    var nameEl = document.getElementById('kundenName');
    return nameEl ? nameEl.textContent.trim() : '';
}

function formatKommDatum(datum) {
    if (!datum) return '';
    var d;
    if (datum.includes('T')) {
        d = new Date(datum);
    } else {
        var parts = datum.split('.');
        if (parts.length === 3) return datum;
        d = new Date(datum);
    }
    if (isNaN(d.getTime())) return datum;
    var tag = String(d.getDate()).padStart(2, '0');
    var mon = String(d.getMonth() + 1).padStart(2, '0');
    var jahr = d.getFullYear();
    var std = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    return tag + '.' + mon + '.' + jahr + ', ' + std + ':' + min;
}

function daysAgo(datum) {
    if (!datum) return 999;
    var d = datum.includes('T') ? new Date(datum) : new Date(datum);
    if (isNaN(d.getTime())) return 999;
    var now = new Date();
    return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function getKommTypLabel(typ) {
    if (typeof kommTypConfig !== 'undefined' && kommTypConfig[typ]) return kommTypConfig[typ].label;
    var labels = { email: 'E-Mail', brief: 'Brief', telefon: 'Telefonat', chatbot: 'Chatbot-Gespr\u00e4ch', ki_kontakt: 'KI-generierter Kontakt', termin: 'Termin', video: 'Videocall', portal: 'Portal-Aktivit\u00e4t' };
    return labels[typ] || typ;
}

function getKommStatusLabel(status) {
    var labels = { versendet: 'Versendet', geoeffnet: 'Ge\u00f6ffnet', beantwortet: 'Beantwortet', erledigt: 'Erledigt', termin_geplant: 'Termin geplant' };
    return labels[status] || status;
}

// KI-Zusammenfassung
function renderKommSummary(kundenName) {
    var el = document.getElementById('kommSummaryCard');
    if (!el) return;

    var komm = getKommunikationForKunde(kundenName);
    if (!komm || komm.length === 0) { el.innerHTML = ''; return; }

    var isBanking = !!document.querySelector('#kundenDetailPage.bank-mode');

    // Sort by date descending
    var sorted = komm.slice().sort(function(a, b) {
        return new Date(b.datum) - new Date(a.datum);
    });

    var letzte = sorted[0];
    var offene = sorted.filter(function(k) { return k.status !== 'erledigt'; });
    var termine = sorted.filter(function(k) {
        return (k.typ === 'termin' || k.status === 'termin_geplant') && new Date(k.datum) > new Date();
    });
    var chatbots = sorted.filter(function(k) { return k.typ === 'chatbot'; });

    var summary = kundenName + ' wurde zuletzt am ' + formatKommDatum(letzte.datum) +
        ' per ' + getKommTypLabel(letzte.typ) + ' kontaktiert (\u201e' + letzte.betreff + '\u201c). ';

    if (offene.length > 0) {
        summary += 'Es gibt ' + offene.length + ' offene' + (offene.length === 1 ? 's' : '') + ' Themen. ';
    }

    if (termine.length > 0) {
        summary += 'N\u00e4chster Termin: ' + formatKommDatum(termine[0].datum) + '. ';
    }

    if (chatbots.length > 0) {
        var cb = chatbots[0];
        if (cb.ergebnis) {
            summary += (isBanking ? 'Im genoGPT Self-Service' : 'Im Self-Service Portal') + ' hat der Kunde \u201e' + cb.ergebnis + '\u201c signalisiert. ';
        }
    }

    var aiIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2a10 10 0 110 20 10 10 0 010-20z"/><path d="M12 8v4l3 3"/></svg>';

    el.innerHTML = '<div class="komm-summary-card">' +
        '<div class="komm-summary-header">' + aiIcon + ' KI-Zusammenfassung der letzten 90 Tage</div>' +
        '<div class="komm-summary-text">' + summary + '</div>' +
        '</div>';
}
window.renderKommSummary = renderKommSummary;

// Sales-Impulse aus Kommunikation
function deriveKommSalesImpulse(komm) {
    var impulse = [];

    komm.forEach(function(k) {
        // Mail geoeffnet aber kein Follow-up
        if (k.typ === 'email' && k.status === 'geoeffnet' && !k.followUp) {
            var prio = daysAgo(k.datum) > 7 ? 'hoch' : 'mittel';
            impulse.push({
                quelle: k.betreff,
                impuls: 'Mail \u201e' + k.betreff + '\u201c ge\u00f6ffnet, kein R\u00fccklauf \u2013 Nachfass-Anruf',
                aktion: 'anrufen',
                prioritaet: prio
            });
        }

        // Chatbot mit Terminwunsch
        if (k.typ === 'chatbot' && k.ergebnis && k.ergebnis.toLowerCase().indexOf('termin') !== -1) {
            impulse.push({
                quelle: 'Chatbot-Gespr\u00e4ch',
                impuls: 'Kunde hat im Chatbot Termin gew\u00fcnscht: ' + k.ergebnis,
                aktion: 'termin_bestaetigen',
                prioritaet: 'hoch'
            });
        }

        // Chatbot mit Kuendigungsabsicht
        if (k.typ === 'chatbot' && k.themen && k.themen.some(function(t) {
            return t.indexOf('k\u00fcndigen') !== -1 || t.indexOf('wechsel') !== -1 || t.indexOf('kuendigen') !== -1;
        })) {
            impulse.push({
                quelle: 'Chatbot-Gespr\u00e4ch',
                impuls: 'Abwanderungsrisiko: Kunde hat nach K\u00fcndigung/Wechsel gefragt',
                aktion: 'bindungsgespraech',
                prioritaet: 'kritisch'
            });
        }

        // KI-Kontakt ohne Reaktion
        if (k.typ === 'ki_kontakt' && !k.followUp) {
            impulse.push({
                quelle: k.betreff,
                impuls: 'KI-Warnung \u201e' + k.betreff + '\u201c ohne Kundenreaktion \u2013 pers\u00f6nlich nachfassen',
                aktion: 'nachfassen',
                prioritaet: 'mittel'
            });
        }

        // Portal-Download
        if (k.typ === 'portal' && k.dokument) {
            impulse.push({
                quelle: k.betreff,
                impuls: 'Kunde besch\u00e4ftigt sich mit Thema: ' + k.betreff + ' \u2013 proaktiv kontaktieren',
                aktion: 'nachfassen',
                prioritaet: 'mittel'
            });
        }

        // Brief versendet nicht geoeffnet
        if (k.typ === 'brief' && k.status === 'versendet' && !k.followUp) {
            impulse.push({
                quelle: k.betreff,
                impuls: 'Brief \u201e' + k.betreff + '\u201c versendet \u2013 telefonisch nachhaken',
                aktion: 'anrufen',
                prioritaet: 'niedrig'
            });
        }
    });

    return impulse;
}

function renderKommSalesImpulse(kundenName) {
    var el = document.getElementById('kommSalesImpulse');
    if (!el) return;

    var komm = getKommunikationForKunde(kundenName);
    if (!komm || komm.length === 0) { el.innerHTML = ''; return; }

    var impulse = deriveKommSalesImpulse(komm);
    if (impulse.length === 0) { el.innerHTML = ''; return; }

    var prioOrder = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    impulse.sort(function(a, b) { return (prioOrder[a.prioritaet] || 3) - (prioOrder[b.prioritaet] || 3); });

    var html = '<div class="komm-sales-impulse"><div class="komm-impulse-header">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
        ' Sales-Impulse aus Kommunikation</div>';

    impulse.forEach(function(imp) {
        var prioClass = 'prioritaet-' + imp.prioritaet;
        var prioLabel = imp.prioritaet.charAt(0).toUpperCase() + imp.prioritaet.slice(1);
        var aktionBtns = '';

        if (imp.aktion === 'anrufen') {
            aktionBtns = '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'anrufen\')">Anrufen</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Angebot vorbereiten</button>';
        } else if (imp.aktion === 'termin_bestaetigen') {
            aktionBtns = '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'termin\')">Termin best\u00e4tigen</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'tarifvergleich\')">Tarifvergleich</button>';
        } else if (imp.aktion === 'bindungsgespraech') {
            aktionBtns = '<button class="komm-impulse-btn kritisch" onclick="kommImpulsAktion(\'bindung\')">Bindungsgespr\u00e4ch</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'anrufen\')">Sofort anrufen</button>';
        } else {
            aktionBtns = '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'nachfassen\')">Nachfassen</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Angebot vorbereiten</button>';
        }

        html += '<div class="komm-impulse-card">' +
            '<div class="komm-impulse-card-header">' +
                '<span class="komm-impulse-prio ' + prioClass + '">' + prioLabel + '</span>' +
                '<span class="komm-impulse-quelle">' + imp.quelle + '</span>' +
            '</div>' +
            '<div class="komm-impulse-text">' + imp.impuls + '</div>' +
            '<div class="komm-impulse-actions">' + aktionBtns + '</div>' +
        '</div>';
    });

    html += '</div>';
    el.innerHTML = html;
}
window.renderKommSalesImpulse = renderKommSalesImpulse;

function kommImpulsAktion(aktion) {
    var labels = {
        anrufen: 'Anruf wird vorbereitet...',
        angebot: 'Angebotserstellung gestartet...',
        termin: 'Terminbest\u00e4tigung wird gesendet...',
        tarifvergleich: 'Tarifvergleich wird erstellt...',
        bindung: 'Bindungsgespr\u00e4ch geplant...',
        nachfassen: 'Nachfass-Aktion erstellt...'
    };
    var msg = labels[aktion] || 'Aktion ausgef\u00fchrt...';

    // Use triggerAction if available (OPT-04), otherwise show toast
    if (typeof triggerAction === 'function') {
        triggerAction(aktion);
    } else {
        showKommToast(msg);
    }
}
window.kommImpulsAktion = kommImpulsAktion;

function showKommToast(msg) {
    var existing = document.getElementById('kommToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'kommToast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:white;padding:12px 20px;border-radius:8px;font-size:13px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
}

// Chatbot-Eintrag Rendering
function renderChatbotEntry(eintrag) {
    var isBanking = !!document.querySelector('#kundenDetailPage.bank-mode');
    var portalName = isBanking ? 'genoGPT Self-Service' : 'Kunden-Self-Service Portal';
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig.chatbot) ? kommTypConfig.chatbot : { farbe: '#8b5cf6', icon: '', label: 'Chatbot' };

    var html = '<div class="komm-item chatbot" data-typ="chatbot" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + portalName + ': ' + eintrag.betreff + '</div>';

    // Chat-Verlauf als Blasen
    if (eintrag.verlauf && eintrag.verlauf.length > 0) {
        html += '<div class="chatbot-verlauf">';
        eintrag.verlauf.forEach(function(msg) {
            var isKunde = msg.rolle === 'kunde';
            html += '<div class="chat-blase ' + (isKunde ? 'chat-blase-kunde' : 'chat-blase-bot') + '">' +
                '<span class="chat-rolle">' + (isKunde ? 'Kunde' : 'Bot') + '</span>' +
                '<span class="chat-text">' + msg.text + '</span>' +
            '</div>';
        });
        html += '</div>';
    }

    // Ergebnis-Badge
    if (eintrag.ergebnis) {
        html += '<div class="chat-ergebnis-badge">' + eintrag.ergebnis + '</div>';
    }

    // Aktions-Buttons
    html += '<div class="komm-entry-actions">';
    if (eintrag.ergebnis && eintrag.ergebnis.toLowerCase().indexOf('termin') !== -1) {
        html += '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'termin\')">Termin best\u00e4tigen</button>';
    }
    html += '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Angebot vorbereiten</button>';
    html += '</div></div></div>';

    return html;
}

// KI-Kontakt Rendering
function renderKiKontaktEntry(eintrag) {
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig.ki_kontakt) ? kommTypConfig.ki_kontakt : { farbe: '#06b6d4', icon: '', label: 'KI-Kontakt' };

    var html = '<div class="komm-item ki_kontakt" data-typ="ki_kontakt" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + eintrag.betreff + '</div>' +
        '<div class="komm-preview">' + (eintrag.inhalt || '') + '</div>' +
        '<div class="komm-status"><span class="komm-status-badge ' + eintrag.status + '">' + getKommStatusLabel(eintrag.status) + '</span></div>';

    html += '<div class="komm-entry-actions">' +
        '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'nachfassen\')">Nachfassen</button>' +
        '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Als Impuls markieren</button>' +
        '</div></div></div>';

    return html;
}

// Portal-Eintrag Rendering
function renderPortalEntry(eintrag) {
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig.portal) ? kommTypConfig.portal : { farbe: '#6b7280', icon: '', label: 'Portal' };

    var html = '<div class="komm-item portal" data-typ="portal" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + eintrag.betreff + '</div>' +
        '<div class="komm-preview">' + (eintrag.inhalt || '') + '</div>' +
        '<div class="komm-status"><span class="komm-status-badge ' + eintrag.status + '">' + getKommStatusLabel(eintrag.status) + '</span></div>' +
        '</div></div>';

    return html;
}

// Standard-Eintrag Rendering (email, brief, telefon, termin, video)
function renderStandardKommEntry(eintrag) {
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig[eintrag.typ]) ? kommTypConfig[eintrag.typ] : { farbe: '#64748b', icon: '', label: eintrag.typ };

    var statusBadge = '';
    if (eintrag.status === 'geoeffnet' && eintrag.geoeffnetAm) {
        statusBadge = '<span class="komm-status-badge geoeffnet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Ge\u00f6ffnet am ' + formatKommDatum(eintrag.geoeffnetAm) + '</span>';
    } else {
        statusBadge = '<span class="komm-status-badge ' + eintrag.status + '">' + getKommStatusLabel(eintrag.status) + '</span>';
    }

    var autoClass = eintrag.automatisch ? 'auto' : 'manuell';

    var html = '<div class="komm-item ' + autoClass + '" data-typ="' + eintrag.typ + '" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + (eintrag.automatisch ? 'Automatische ' : '') + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + eintrag.betreff + '</div>' +
        '<div class="komm-preview">' + (eintrag.inhalt || '') + '</div>' +
        '<div class="komm-status">' + statusBadge + '</div>' +
        '</div>' +
        '<button class="komm-action" onclick="viewKommunikation(\'' + eintrag.typ + '-detail\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Ansehen</button>' +
        '</div>';

    return html;
}

// Filter-Leiste
function renderKommFilter() {
    var el = document.getElementById('kommFilterBar');
    if (!el) return;

    var filters = [
        { key: 'alle', label: 'Alle' },
        { key: 'email', label: 'E-Mail' },
        { key: 'telefon', label: 'Telefon' },
        { key: 'brief', label: 'Brief' },
        { key: 'chatbot', label: 'Chatbot' },
        { key: 'ki_kontakt', label: 'KI' },
        { key: 'portal', label: 'Portal' }
    ];

    var html = '<div class="komm-filter-bar">';
    filters.forEach(function(f) {
        var activeClass = f.key === 'alle' ? ' active' : '';
        html += '<button class="komm-filter-btn' + activeClass + '" data-filter="' + f.key + '" onclick="filterKomm(\'' + f.key + '\')">' + f.label + '</button>';
    });
    html += '</div>';

    el.innerHTML = html;
}
window.renderKommFilter = renderKommFilter;

function filterKomm(typ) {
    // Update active button
    document.querySelectorAll('.komm-filter-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === typ);
    });

    // Filter timeline entries
    var items = document.querySelectorAll('#kundenKommunikation .komm-item[data-typ]');
    items.forEach(function(item) {
        if (typ === 'alle') {
            item.style.display = '';
        } else {
            item.style.display = item.getAttribute('data-typ') === typ ? '' : 'none';
        }
    });
}
window.filterKomm = filterKomm;

// Render full dynamic kommunikation timeline
function renderDynamicKommTimeline(kundenName) {
    var container = document.getElementById('kundenKommunikation');
    if (!container) return;

    var komm = getKommunikationForKunde(kundenName);
    if (!komm || komm.length === 0) return;

    // Sort by date descending
    var sorted = komm.slice().sort(function(a, b) {
        return new Date(b.datum) - new Date(a.datum);
    });

    var html = '';
    sorted.forEach(function(k) {
        if (k.typ === 'chatbot') {
            html += renderChatbotEntry(k);
        } else if (k.typ === 'ki_kontakt') {
            html += renderKiKontaktEntry(k);
        } else if (k.typ === 'portal') {
            html += renderPortalEntry(k);
        } else {
            html += renderStandardKommEntry(k);
        }
    });

    container.innerHTML = html;
}
window.renderDynamicKommTimeline = renderDynamicKommTimeline;

// Legacy-Funktion fuer Kompatibilitaet
function toggleKundenFida() {
    switchKundenTab('fida');
}

// Window-Exports
window.viewKommunikation = viewKommunikation;
window.getKommunikationForKunde = getKommunikationForKunde;
window.getCurrentKundenName = getCurrentKundenName;
window.formatKommDatum = formatKommDatum;
window.daysAgo = daysAgo;
window.getKommTypLabel = getKommTypLabel;
window.getKommStatusLabel = getKommStatusLabel;
window.showKommToast = showKommToast;
window.renderChatbotEntry = renderChatbotEntry;
window.renderKiKontaktEntry = renderKiKontaktEntry;
window.renderPortalEntry = renderPortalEntry;
window.renderStandardKommEntry = renderStandardKommEntry;

window.__registerModule('kunden-detail-komm.js');
