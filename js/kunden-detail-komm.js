// ============================================================
// kunden-detail-komm.js – OPT-15 Kommunikationshistorie
// Split aus kunden-detail-features.js (OPT-18)
// Abhängigkeiten: kunden-detail-features.js, kunden-detail-data.js, kunden-detail-banking.js
// ============================================================


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
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:white;padding:12px 20px;border-radius:8px;font-size:15px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;';
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

// Legacy-Funktion für Kompatibilität
function toggleKundenFida() {
    switchKundenTab('fida');
}

// ── WINDOW EXPORTS ──
window.renderKommSummary = renderKommSummary;
window.renderKommSalesImpulse = renderKommSalesImpulse;
window.kommImpulsAktion = kommImpulsAktion;
window.renderKommFilter = renderKommFilter;
window.filterKomm = filterKomm;
window.renderDynamicKommTimeline = renderDynamicKommTimeline;
window.toggleKundenFida = toggleKundenFida;

window.__registerModule('kunden-detail-komm.js');
