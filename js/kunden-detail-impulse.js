// ============================================================
// kunden-detail-impulse.js – KI-Impulse, Feature-Tabs, Beratungsmodus
// Split aus kunden-detail-features.js (OPT-18)
// Abhängigkeiten: kunden-detail-features.js (switchKundenTab, toggleImpulsDetail, showAngebotToast),
//                 kunden-detail-banking.js (bankMockKunden)
// ============================================================


// ============================================================
// Versicherer-Auswahl in A-10 übertragen
// ============================================================
function updateKundenDetailInsurer() {
    // Aktuell gewählten Versicherer ermitteln
    var key = window.selectedInsurer || 'ergo';
    var config = window.insurerConfig ? window.insurerConfig[key] : null;
    if (!config) return;
    var name = config.name || 'ERGO';
    var domain = config.domain || 'ergo.de';

    // 1. "Eigene Versicherungen (X)" Label aktualisieren
    var label = document.getElementById('eigeneVersicherungenLabel');
    if (label) {
        label.textContent = 'Eigene Versicherungen (' + name + ')';
    }

    // 2. Eigene-Verträge-Zeilen im Absichern-Tab: Logo + Badge aktualisieren
    var rows = document.querySelectorAll('.ergo-contract-row');
    rows.forEach(function(row) {
        var anbieterTd = row.querySelectorAll('td')[1]; // Zweite Spalte = Anbieter
        if (anbieterTd) {
            var logoUrl = 'https://img.logo.dev/' + domain + '?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=40&format=png';
            anbieterTd.innerHTML = '<img src="' + logoUrl + '" alt="' + name + '" class="versicherer-logo" width="18" height="18" style="vertical-align:middle;border-radius:4px;object-fit:contain;" onerror="this.style.display=\'none\'"> <span class="ergo-badge">' + name + '</span>';
        }
    });

    // 3. Betreute Verträge Tab: Eigene Verträge mit ausgewähltem Versicherer anzeigen
    var vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        var trs = vertraegeBody.querySelectorAll('tr');
        // Produkte des Versicherers ermitteln
        var products = (window.insurerProducts && window.insurerProducts[key]) || [name];
        trs.forEach(function(tr) {
            var tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                var anbieterTd = tds[1]; // Anbieter-Spalte (makler-only-col)
                var currentText = anbieterTd.textContent.trim();
                // Prüfe ob es ein "eigener" Vertrag ist (ERGO, DKV, etc. - Standard-Eigene)
                var defaultEigene = ['ERGO', 'ERGO Direkt', 'DKV'];
                var isEigen = defaultEigene.some(function(e) { return currentText.indexOf(e) !== -1; });
                if (isEigen) {
                    var newName = products[0] || name;
                    if (typeof versichererLogoImg === 'function') {
                        anbieterTd.innerHTML = versichererLogoImg(newName, 18) + ' ' + newName;
                    } else {
                        anbieterTd.textContent = newName;
                    }
                }
            }
        });
    }
}
window.updateKundenDetailInsurer = updateKundenDetailInsurer;

// ========================================
// OPT-07: KI-GESTÜTZTE IMPULSGENERIERUNG
// ========================================

window._kiImpulsCache = {};

function getKundenContext() {
    var isBanking = typeof isBankMode === 'function' && isBankMode();
    var kundenHeader = document.getElementById('kundenHeaderTitle');
    var kundenName = kundenHeader ? kundenHeader.textContent.replace('Kunde: ', '').trim() : '';
    if (!kundenName) {
        var nameEl = document.getElementById('kundenName');
        kundenName = nameEl ? nameEl.textContent.trim() : 'Unbekannt';
    }

    var kunde = null;
    if (isBanking && typeof bankMockKunden !== 'undefined') {
        kunde = bankMockKunden[kundenName];
    } else if (!isBanking) {
        // Insurance mode – mockKunden is local to fillKundenDetail, but we can read from DOM
        // Try to get from the fillKundenDetail scope or the global
        if (typeof window.mockKunden !== 'undefined') {
            kunde = window.mockKunden[kundenName];
        }
    }

    return { name: kundenName, data: kunde, isBanking: isBanking };
}

function buildKISystemPrompt(ctx) {
    if (ctx.isBanking) {
        return 'Du bist ein KI-Vertriebsassistent für Bankberater (Volksbank/genoGPT). ' +
            'Analysiere die Kundendaten und generiere 2-3 konkrete, priorisierte Vertriebsimpulse. ' +
            'Fokus auf: Cross-Selling (Verbundpartner R+V, Union Investment, Schwäbisch Hall, DZ PRIVATBANK), ' +
            'Anschlussfinanzierung, VR-FinanzPlan, Vermögensverwaltung, Open Finance/FIDA-Potentiale. ' +
            'Format: Für jeden Impuls: Titel, Priorität (Hoch/Mittel), Kurzbeschreibung (1-2 Sätze), geschätztes Ertragspotential. ' +
            'Antworte auf Deutsch. Sei konkret und beziehe dich auf die Kundendaten. Keine Markdown-Formatierung.';
    }
    return 'Du bist ein KI-Vertriebsassistent für Versicherungsvermittler. ' +
        'Analysiere die Kundendaten und generiere 2-3 konkrete, priorisierte Vertriebsimpulse. ' +
        'Fokus auf: Deckungslücken, Cross-Selling, Nachversicherung, Kfz-Wechsel, BU-Optimierung, ' +
        'Open Finance/FIDA-basierte Erkenntnisse, Lebenslagenwechsel. ' +
        'Format: Für jeden Impuls: Titel, Priorität (Hoch/Mittel), Kurzbeschreibung (1-2 Sätze), geschätztes Prämienvolumen. ' +
        'Antworte auf Deutsch. Sei konkret und beziehe dich auf die Kundendaten. Keine Markdown-Formatierung.';
}

function buildKIUserPrompt(ctx) {
    var parts = ['Kunde: ' + ctx.name];

    if (ctx.data) {
        var d = ctx.data;
        if (d.beruf) parts.push('Beruf: ' + d.beruf);
        if (d.familienstand) parts.push('Familienstand: ' + d.familienstand);
        if (d.geburtsdatum) parts.push('Geburtsdatum: ' + d.geburtsdatum);
        if (d.kinder && d.kinder.length > 0) {
            parts.push('Kinder: ' + d.kinder.map(function(k) { return k.name + ' (' + k.alter + ' J.)'; }).join(', '));
        }
        if (d.nettoeinkommen) parts.push('Nettoeinkommen: €' + d.nettoeinkommen.toLocaleString('de-DE') + '/Mon.');

        if (ctx.isBanking) {
            if (d.konten) {
                parts.push('Produkte: ' + d.konten.map(function(k) { return k.produkt; }).join(', '));
            }
            if (d.finanzierungen) {
                parts.push('Finanzierungen: ' + d.finanzierungen.map(function(f) { return f.produkt + ' (Restschuld: €' + Math.abs(f.restschuld || 0).toLocaleString('de-DE') + ')'; }).join(', '));
            }
            if (d.fidaVertraege && d.fidaVertraege.length > 0) {
                parts.push('FIDA-Daten: ' + d.fidaVertraege.map(function(f) { return f.institut + ' ' + f.typ; }).join(', '));
            }
            if (d.versicherungenFremd && d.versicherungenFremd.length > 0) {
                parts.push('Fremdversicherungen: ' + d.versicherungenFremd.map(function(v) { return v.produkt + ' (' + v.anbieter + ')'; }).join(', '));
            }
        } else {
            if (d.vertraege) {
                parts.push('Verträge: ' + d.vertraege.map(function(v) { return v.typ + ' (' + v.versicherer + ', ' + v.praemie + ')'; }).join(', '));
            }
            if (d.fidaVertraege && d.fidaVertraege.length > 0) {
                parts.push('FIDA-Daten: ' + d.fidaVertraege.map(function(f) { return f.institut + ' ' + f.typ + ' (' + f.info + ')'; }).join(', '));
            }
        }

        if (d.risikoscore) parts.push('Risikoscore: ' + d.risikoscore + '/100');
        if (d.nps) parts.push('NPS: ' + d.nps.score + ' (' + d.nps.kategorie + ')');
    }

    return 'Generiere personalisierte Vertriebsimpulse für diesen Kunden:\n\n' + parts.join('\n');
}

function renderKIImpulsSkeleton() {
    return '<div class="ki-impuls-card ki-impuls-loading">' +
        '<div class="ki-impuls-header">' +
            '<div class="ki-impuls-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
            '</div>' +
            '<div class="ki-impuls-title">KI-Impulse werden generiert...</div>' +
        '</div>' +
        '<div class="ki-impuls-skeleton">' +
            '<div class="ki-skeleton-line long"></div>' +
            '<div class="ki-skeleton-line medium"></div>' +
            '<div class="ki-skeleton-line short"></div>' +
        '</div>' +
    '</div>';
}

function parseKIResponse(text) {
    // Parse the AI response into structured impulses
    var impulse = [];
    var lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
    var current = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        // Detect impuls title patterns: "1.", "Impuls 1:", "**Title**", "- Title"
        var titleMatch = line.match(/^(?:\d+[\.\)]\s*|Impuls\s*\d+[:\s]*|[-•]\s*)(.+)/);
        if (titleMatch && !line.match(/^(?:Priorit|Beschreib|Ertrag|Prämie|Potent)/i)) {
            if (current) impulse.push(current);
            current = { titel: titleMatch[1].replace(/\*\*/g, '').replace(/:\s*$/, ''), prioritaet: 'Mittel', beschreibung: '', volumen: '' };
            continue;
        }

        if (current) {
            var prioMatch = line.match(/Priorit[äa]t[:\s]*(Hoch|Mittel|Niedrig)/i);
            if (prioMatch) {
                current.prioritaet = prioMatch[1].charAt(0).toUpperCase() + prioMatch[1].slice(1).toLowerCase();
                continue;
            }

            var volMatch = line.match(/(?:Ertrag|Prämie|Volumen|Potential)[:\s]*[€]?\s*([\d.,]+(?:\s*(?:€|EUR))?(?:\s*(?:\/|p\.?\s*a\.?|pro\s*Jahr|\/Jahr))?)/i);
            if (volMatch) {
                current.volumen = volMatch[1].replace(/\s+/g, ' ').trim();
                if (current.volumen.indexOf('€') === -1) current.volumen = '€' + current.volumen;
                continue;
            }

            var descMatch = line.match(/Beschreibung[:\s]*(.*)/i);
            if (descMatch) {
                current.beschreibung = descMatch[1].trim();
                continue;
            }

            // Append as description if nothing else matched
            if (!current.beschreibung) {
                current.beschreibung = line.replace(/\*\*/g, '');
            } else if (current.beschreibung.length < 200) {
                current.beschreibung += ' ' + line.replace(/\*\*/g, '');
            }
        }
    }
    if (current) impulse.push(current);

    return impulse.slice(0, 3); // Max 3 impulses
}

function getFallbackImpulse(ctx) {
    // Rule-based fallback when API is unavailable
    var impulse = [];
    if (typeof evaluateImpulse === 'function' && ctx.data) {
        var matched = evaluateImpulse(ctx.data);
        for (var i = 0; i < Math.min(matched.length, 3); i++) {
            impulse.push({
                titel: matched[i].impuls,
                prioritaet: matched[i].prioritaet === 'hoch' ? 'Hoch' : 'Mittel',
                beschreibung: 'Regelbasierter Impuls: ' + (matched[i].produkt || matched[i].impuls),
                volumen: '',
                fallback: true
            });
        }
    }
    if (impulse.length === 0) {
        impulse.push({
            titel: ctx.isBanking ? 'VR-FinanzPlan Beratung' : 'Bestandsüberprüfung empfohlen',
            prioritaet: 'Mittel',
            beschreibung: ctx.isBanking
                ? 'Umfassende Finanzplanung durchführen, um Cross-Selling-Potentiale zu identifizieren.'
                : 'Jährliche Bestandsprüfung durchführen, um Deckungslücken und Anpassungsbedarf zu erkennen.',
            volumen: '',
            fallback: true
        });
    }
    return impulse;
}

function renderKIImpulseResult(impulse, isFallback) {
    var config = typeof getModeConfig === 'function' ? getModeConfig() : null;
    var branding = config ? (config.impulse ? config.impulse.herkunftLabel : 'KI-Assistent') : 'KI-Assistent';
    var brandColor = config && config.branding ? config.branding.color : '#6366f1';

    var badgeText = isFallback ? 'Regelbasiert' : 'KI-generiert';
    var badgeClass = isFallback ? 'ki-badge-fallback' : 'ki-badge-ai';

    var html = '<div class="ki-impuls-card">' +
        '<div class="ki-impuls-header">' +
            '<div class="ki-impuls-icon" style="color:' + brandColor + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
            '</div>' +
            '<div class="ki-impuls-title">' + branding + '</div>' +
            '<span class="ki-impuls-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div>' +
        '<div class="ki-impuls-list">';

    for (var i = 0; i < impulse.length; i++) {
        var imp = impulse[i];
        var prioClass = imp.prioritaet === 'Hoch' ? 'high' : 'medium';
        html += '<div class="ki-impuls-item">' +
            '<div class="ki-impuls-item-header">' +
                '<span class="ki-impuls-item-title">' + imp.titel + '</span>' +
                '<span class="impuls-priority ' + prioClass + '">' + imp.prioritaet + '</span>' +
            '</div>' +
            '<div class="ki-impuls-item-desc">' + imp.beschreibung + '</div>' +
            (imp.volumen ? '<div class="ki-impuls-item-volumen">' + imp.volumen + '</div>' : '') +
        '</div>';
    }

    html += '</div></div>';
    return html;
}

// Render KI impulses as inline impuls-items within Whitespots/Änderungsgeschäft categories
function renderKIImpulseInline(impulse, isFallback) {
    var badgeText = isFallback ? 'Regelbasiert' : 'KI-generiert';
    var wsHtml = '';
    var aeHtml = '';

    for (var i = 0; i < impulse.length; i++) {
        var imp = impulse[i];
        var prioClass = imp.prioritaet === 'Hoch' ? 'high' : 'medium';
        var prioLabel = imp.prioritaet === 'Hoch' ? 'Hohe Priorität' : 'Mittlere Priorität';
        var detailId = 'ki-inline-' + i;

        var itemHtml = '<div class="impuls-item highlight clickable" onclick="toggleImpulsDetail(\'' + detailId + '\')">' +
            '<div class="impuls-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
            '</div>' +
            '<div class="impuls-text">' +
                '<strong>' + imp.titel + '</strong>' +
                '<p><span class="fida-source-badge small">' + badgeText + '</span> ' + imp.beschreibung + '</p>' +
            '</div>' +
            '<div style="text-align:right;flex-shrink:0;">' +
                (imp.volumen ? '<div class="impuls-volumen-badge">' + imp.volumen + '</div>' : '') +
            '</div>' +
            '<span class="impuls-priority ' + prioClass + '">' + prioLabel + '</span>' +
            '<span class="impuls-expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg></span>' +
        '</div>' +
        '<div class="impuls-detail" id="' + detailId + '" style="display:none;">' +
            '<div class="impuls-detail-section"><h4>Herleitung</h4>' +
            '<div class="herleitung-grid">' +
                '<div class="herleitung-item"><span class="herleitung-label">Quelle</span><span class="herleitung-value">' + badgeText + ' – Data Intelligence Platform</span></div>' +
                '<div class="herleitung-item"><span class="herleitung-label">Erkenntnis</span><span class="herleitung-value">' + imp.beschreibung + '</span></div>' +
            '</div></div>' +
        '</div>';

        // Classify: items with "Wechsel", "Anpass", "Optimier", "Erhöh", "Nachver" → Änderungsgeschäft, rest → Whitespots
        var titel = imp.titel.toLowerCase();
        if (titel.indexOf('wechsel') >= 0 || titel.indexOf('anpass') >= 0 || titel.indexOf('optimier') >= 0 ||
            titel.indexOf('erhöh') >= 0 || titel.indexOf('nachver') >= 0 || titel.indexOf('aufstock') >= 0 ||
            titel.indexOf('umschuld') >= 0 || titel.indexOf('konsoli') >= 0) {
            aeHtml += itemHtml;
        } else {
            wsHtml += itemHtml;
        }
    }

    return { whitespots: wsHtml, aenderung: aeHtml };
}

function generateKIImpuls() {
    var wsContainer = document.getElementById('kiImpulseInlineWS');
    var aeContainer = document.getElementById('kiImpulseInlineAE');
    var hasInline = wsContainer || aeContainer;

    // Fallback: render into kiImpulsCard if inline containers not available
    var container = document.getElementById('kiImpulsCard');
    if (!hasInline && !container) return;

    var ctx = getKundenContext();
    var cacheKey = ctx.name + '_' + (ctx.isBanking ? 'bank' : 'vers') + '_inline';

    // Check cache for inline
    if (hasInline && window._kiImpulsCache[cacheKey]) {
        if (wsContainer) wsContainer.innerHTML = window._kiImpulsCache[cacheKey].whitespots || '';
        if (aeContainer) aeContainer.innerHTML = window._kiImpulsCache[cacheKey].aenderung || '';
        return;
    }

    // Show inline skeleton
    if (hasInline) {
        var skelItem = '<div class="impuls-item" style="opacity:0.5;"><div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div><div class="impuls-text"><strong>KI-Impulse werden generiert...</strong><p style="background:#e5e7eb;height:12px;border-radius:4px;width:70%;margin:6px 0;"></p></div></div>';
        if (wsContainer) wsContainer.innerHTML = skelItem;
    } else if (container) {
        container.innerHTML = renderKIImpulsSkeleton();
    }

    var apiUrl = window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev';
    var systemPrompt = buildKISystemPrompt(ctx);
    var userPrompt = buildKIUserPrompt(ctx);

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: window.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }]
        })
    })
    .then(function(response) {
        if (!response.ok) throw new Error('API Error: ' + response.status);
        return response.json();
    })
    .then(function(data) {
        var text = '';
        if (data.content && data.content.length > 0) {
            text = data.content[0].text || '';
        }
        if (!text) throw new Error('Empty response');

        var impulse = parseKIResponse(text);
        if (impulse.length === 0) throw new Error('No impulses parsed');

        renderKIImpulseToContainers(impulse, false, hasInline, wsContainer, aeContainer, container, cacheKey);
    })
    .catch(function(err) {
        console.warn('KI-Impuls API Fehler, nutze Fallback:', err.message);
        var fallback = getFallbackImpulse(ctx);
        renderKIImpulseToContainers(fallback, true, hasInline, wsContainer, aeContainer, container, cacheKey);
    });
}

function renderKIImpulseToContainers(impulse, isFallback, hasInline, wsContainer, aeContainer, container, cacheKey) {
    if (hasInline) {
        var inline = renderKIImpulseInline(impulse, isFallback);
        if (wsContainer) wsContainer.innerHTML = inline.whitespots;
        if (aeContainer) aeContainer.innerHTML = inline.aenderung;
        window._kiImpulsCache[cacheKey] = inline;
    } else if (container) {
        var html = renderKIImpulseResult(impulse, isFallback);
        container.innerHTML = html;
        window._kiImpulsCache[cacheKey] = html;
    }
}
window.generateKIImpuls = generateKIImpuls;

// ========================================
// OPT-08: CLV-SZENARIEN
// ========================================

function renderCLVSzenarien() {
    var container = document.getElementById('clvSzenarienContainer');
    if (!container) return;
    if (container.querySelector('.clv-szenarien-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var szenarien;
    if (isBanking) {
        szenarien = [
            { name: 'Basis (Status Quo)', clv: 18500, delta: 0, aktionen: 'Bestehende Produkte weiterführen', color: '#94a3b8' },
            { name: 'Anschlussfinanzierung', clv: 24200, delta: 5700, aktionen: 'Forward-Darlehen €185.000 + Zinsoptimierung', color: '#3b82f6' },
            { name: 'Cross-Selling Verbund', clv: 31800, delta: 13300, aktionen: '+ R+V Risikoleben + Union Depot-Erhöhung + VR-FinanzPlan', color: '#16a34a' },
            { name: 'Full Potential', clv: 38500, delta: 20000, aktionen: '+ DZ PRIVATBANK Vermögensverwaltung + Schwäbisch Hall BSV', color: '#6366f1' }
        ];
    } else {
        szenarien = [
            { name: 'Basis (Status Quo)', clv: 12800, delta: 0, aktionen: 'BU + Wohngebäude weiterführen', color: '#94a3b8' },
            { name: 'Deckungslücken schließen', clv: 19200, delta: 6400, aktionen: '+ Risikoleben €300.000 + BU-Erhöhung auf €2.500', color: '#3b82f6' },
            { name: 'Cross-Selling', clv: 24600, delta: 11800, aktionen: '+ Fondspolice €250/Mon. + Kfz-Wechsel + Rechtsschutz', color: '#16a34a' },
            { name: 'Full Potential', clv: 29400, delta: 16600, aktionen: '+ Unfallversicherung + Hausrat-Upgrade + PKV-Zusatz', color: '#6366f1' }
        ];
    }

    var maxClv = szenarien[szenarien.length - 1].clv;

    var html = '<div class="kunden-card clv-szenarien-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> CLV-Szenarien</h2></div>' +
        '<div class="clv-szenarien-list">';

    for (var i = 0; i < szenarien.length; i++) {
        var s = szenarien[i];
        var pct = Math.round(s.clv / maxClv * 100);
        html += '<div class="clv-szenario-item">' +
            '<div class="clv-szenario-header">' +
                '<span class="clv-szenario-name">' + s.name + '</span>' +
                '<span class="clv-szenario-value" style="color:' + s.color + '">€' + s.clv.toLocaleString('de-DE') + '</span>' +
                (s.delta > 0 ? '<span class="clv-szenario-delta">+€' + s.delta.toLocaleString('de-DE') + '</span>' : '') +
            '</div>' +
            '<div class="clv-szenario-bar-bg"><div class="clv-szenario-bar" style="width:' + pct + '%;background:' + s.color + '"></div></div>' +
            '<div class="clv-szenario-aktionen">' + s.aktionen + '</div>' +
        '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderCLVSzenarien = renderCLVSzenarien;

// ========================================
// OPT-02: NARRATIVE KUNDENANSICHT + TIMELINE
// ========================================

function renderLifeEventTimeline() {
    var container = document.getElementById('lifeEventTimelineContainer');
    if (!container) return;
    if (container.querySelector('.life-timeline-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var events;
    if (isBanking) {
        events = [
            { datum: '2008', label: 'Berufseinstieg Continental AG', typ: 'beruf', detail: 'Maschinenbau-Ingenieur' },
            { datum: '2010', label: 'Kontoeröffnung Volksbank', typ: 'produkt', detail: 'VR-Girokonto Plus' },
            { datum: '2012', label: 'Heirat', typ: 'leben', detail: 'Familienstand: Verheiratet' },
            { datum: '2014', label: 'Kind geboren: Lukas', typ: 'leben', detail: '1. Kind' },
            { datum: '2016', label: 'Baufinanzierung DZ HYP', typ: 'produkt', detail: '€240.000, Zinsbindung 10 J.' },
            { datum: '2017', label: 'Kind geboren: Emma', typ: 'leben', detail: '2. Kind' },
            { datum: '2018', label: 'Riester-Rente gestartet', typ: 'produkt', detail: 'Union Investment €175/Mon.' },
            { datum: '2022', label: 'ETF-Sparplan gestartet', typ: 'produkt', detail: 'VR-MeinDepot €300/Mon.' },
            { datum: '2026', label: 'Zinsbindung endet', typ: 'aktion', detail: 'Anschlussfinanzierung €185.000 erforderlich' }
        ];
    } else {
        events = [
            { datum: '2016', label: 'Berufseinstieg TechCorp GmbH', typ: 'beruf', detail: 'Angestellter' },
            { datum: '2017', label: 'Kind geboren: Lena', typ: 'leben', detail: '1. Kind' },
            { datum: '2018', label: 'BU-Versicherung abgeschlossen', typ: 'produkt', detail: 'ERGO BU-Rente €1.500/Mon.' },
            { datum: '2019', label: 'Wohngebäudeversicherung', typ: 'produkt', detail: 'VHV €450.000 Vers.-Summe' },
            { datum: '2020', label: 'Hauskauf + Hypothek', typ: 'leben', detail: 'Sparkasse €285.000' },
            { datum: '2021', label: 'Kind geboren: Paul', typ: 'leben', detail: '2. Kind' },
            { datum: '2024', label: 'Open Finance Consent', typ: 'aktion', detail: '6 Datenquellen verknüpft' },
            { datum: '2025', label: 'Kfz-Vertrag läuft aus', typ: 'aktion', detail: 'Allianz Kfz, Wechsel-Potential' }
        ];
    }

    var typColors = { beruf: '#6366f1', leben: '#ec4899', produkt: '#3b82f6', aktion: '#f59e0b' };
    var typIcons = {
        beruf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
        leben: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
        produkt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        aktion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    };

    var html = '<div class="kunden-card life-timeline-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Lebens-Timeline</h2></div>' +
        '<div class="life-timeline">';

    for (var i = 0; i < events.length; i++) {
        var e = events[i];
        var color = typColors[e.typ] || '#94a3b8';
        var icon = typIcons[e.typ] || '';
        html += '<div class="life-timeline-item">' +
            '<div class="life-timeline-dot" style="background:' + color + '">' + icon + '</div>' +
            '<div class="life-timeline-content">' +
                '<div class="life-timeline-datum">' + e.datum + '</div>' +
                '<div class="life-timeline-label">' + e.label + '</div>' +
                '<div class="life-timeline-detail">' + e.detail + '</div>' +
            '</div>' +
        '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderLifeEventTimeline = renderLifeEventTimeline;

// ========================================
// OPT-12: RISIKOSCORING → PRODUKTSTEUERUNG
// ========================================

function renderRisikoscoring() {
    var container = document.getElementById('risikoscoringContainer');
    if (!container) return;
    if (container.querySelector('.risikoscoring-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var score, details, empfehlungen;
    if (isBanking) {
        score = 28;
        details = [
            { label: 'Bonität', wert: 82, max: 100, farbe: '#16a34a' },
            { label: 'Zahlungsverhalten', wert: 95, max: 100, farbe: '#16a34a' },
            { label: 'Verschuldungsgrad', wert: 45, max: 100, farbe: '#f59e0b' },
            { label: 'Einkommensstabilität', wert: 90, max: 100, farbe: '#16a34a' }
        ];
        empfehlungen = [
            { text: 'Kreditlimit erhöhbar auf €15.000 (aktuell €10.000)', typ: 'positiv' },
            { text: 'Baufinanzierung: Sondertilgung empfohlen zur Risikoreduktion', typ: 'neutral' },
            { text: 'R+V Risikoleben zur Restschuldabsicherung empfohlen', typ: 'aktion' }
        ];
    } else {
        score = 35;
        details = [
            { label: 'Risikosportarten', wert: 65, max: 100, farbe: '#ef4444' },
            { label: 'Schadenhistorie', wert: 40, max: 100, farbe: '#f59e0b' },
            { label: 'Deckungsgrad', wert: 55, max: 100, farbe: '#f59e0b' },
            { label: 'NPS / Bindung', wert: 90, max: 100, farbe: '#16a34a' }
        ];
        empfehlungen = [
            { text: 'Risikosport-Zuschlag BU prüfen (Skydiving, Bungee erkannt)', typ: 'warnung' },
            { text: 'Risikoleben OHNE Extremsport-Ausschluss wählen', typ: 'aktion' },
            { text: 'Deckungslücke: Hypothek €285.000 ungesichert', typ: 'warnung' }
        ];
    }

    var scoreColor = score <= 30 ? '#16a34a' : (score <= 60 ? '#f59e0b' : '#ef4444');
    var scoreLabel = score <= 30 ? 'Niedriges Risiko' : (score <= 60 ? 'Mittleres Risiko' : 'Hohes Risiko');

    var html = '<div class="kunden-card risikoscoring-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Risikoscoring</h2></div>' +
        '<div class="risiko-score-overview">' +
            '<div class="risiko-score-circle" style="border-color:' + scoreColor + '">' +
                '<span class="risiko-score-value" style="color:' + scoreColor + '">' + score + '</span>' +
                '<span class="risiko-score-label">' + scoreLabel + '</span>' +
            '</div>' +
            '<div class="risiko-score-details">';

    for (var i = 0; i < details.length; i++) {
        var d = details[i];
        html += '<div class="risiko-detail-row">' +
            '<span class="risiko-detail-label">' + d.label + '</span>' +
            '<div class="risiko-detail-bar-bg"><div class="risiko-detail-bar" style="width:' + d.wert + '%;background:' + d.farbe + '"></div></div>' +
            '<span class="risiko-detail-wert">' + d.wert + '</span>' +
        '</div>';
    }

    html += '</div></div>' +
        '<div class="risiko-empfehlungen">';

    for (var j = 0; j < empfehlungen.length; j++) {
        var e = empfehlungen[j];
        var eClass = e.typ === 'warnung' ? 'risiko-emp-warn' : (e.typ === 'aktion' ? 'risiko-emp-action' : (e.typ === 'positiv' ? 'risiko-emp-positive' : 'risiko-emp-neutral'));
        html += '<div class="risiko-empfehlung ' + eClass + '">' + e.text + '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderRisikoscoring = renderRisikoscoring;

// ========================================
// OPT-11: PROVISIONSPLANUNG
// ========================================

function renderProvisionsplanung() {
    var container = document.getElementById('provisionsplanungContainer');
    if (!container) return;
    if (container.querySelector('.provisions-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var positionen;
    if (isBanking) {
        positionen = [
            { produkt: 'Baufinanzierung Prolongation', volumen: 185000, ertrag: 2775, typ: 'Provision', haftung: '5 Jahre', storno: 0.02 },
            { produkt: 'VR-MeinDepot Erhöhung', volumen: 12800, ertrag: 192, typ: 'Bestandsprovision', haftung: '-', storno: 0.05 },
            { produkt: 'R+V Risikoleben', volumen: 6000, ertrag: 540, typ: 'Abschluss', haftung: '5 Jahre', storno: 0.08 },
            { produkt: 'Union VermögenPlus', volumen: 3700, ertrag: 185, typ: 'Bestandsprovision', haftung: '-', storno: 0.03 }
        ];
    } else {
        positionen = [
            { produkt: 'Risikolebensversicherung', volumen: 6000, ertrag: 540, typ: 'Abschluss', haftung: '5 Jahre', storno: 0.08 },
            { produkt: 'Fondspolice', volumen: 3000, ertrag: 1200, typ: 'Abschluss', haftung: '5 Jahre', storno: 0.12 },
            { produkt: 'Kfz-Wechsel', volumen: 520, ertrag: 78, typ: 'Abschluss', haftung: '1 Jahr', storno: 0.15 },
            { produkt: 'BU-Erhöhung', volumen: 1800, ertrag: 450, typ: 'Dynamik', haftung: '5 Jahre', storno: 0.06 }
        ];
    }

    var totalErtrag = positionen.reduce(function(s, p) { return s + p.ertrag; }, 0);
    var totalStorno = positionen.reduce(function(s, p) { return s + (p.ertrag * p.storno); }, 0);
    var nettoErtrag = totalErtrag - totalStorno;

    var html = '<div class="kunden-card provisions-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="bold">\u20AC</text></svg> Provisionsplanung</h2></div>' +
        '<div class="provisions-summary">' +
            '<div class="provisions-kpi"><span class="provisions-kpi-label">Brutto-Ertrag</span><span class="provisions-kpi-value">€' + totalErtrag.toLocaleString('de-DE') + '</span></div>' +
            '<div class="provisions-kpi"><span class="provisions-kpi-label">Stornoreserve</span><span class="provisions-kpi-value negative">-€' + Math.round(totalStorno).toLocaleString('de-DE') + '</span></div>' +
            '<div class="provisions-kpi"><span class="provisions-kpi-label">Netto-Ertrag</span><span class="provisions-kpi-value positive">€' + Math.round(nettoErtrag).toLocaleString('de-DE') + '</span></div>' +
        '</div>' +
        '<table class="provisions-table"><thead><tr><th>Produkt</th><th>Volumen</th><th>Ertrag</th><th>Typ</th><th>Haftung</th><th>Stornorisiko</th></tr></thead><tbody>';

    for (var i = 0; i < positionen.length; i++) {
        var p = positionen[i];
        var stornoClass = p.storno >= 0.1 ? 'storno-high' : (p.storno >= 0.06 ? 'storno-medium' : 'storno-low');
        html += '<tr>' +
            '<td><strong>' + p.produkt + '</strong></td>' +
            '<td>€' + p.volumen.toLocaleString('de-DE') + '</td>' +
            '<td class="text-right"><strong>€' + p.ertrag.toLocaleString('de-DE') + '</strong></td>' +
            '<td>' + p.typ + '</td>' +
            '<td>' + p.haftung + '</td>' +
            '<td><span class="storno-badge ' + stornoClass + '">' + (p.storno * 100).toFixed(0) + '%</span></td>' +
        '</tr>';
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
}
window.renderProvisionsplanung = renderProvisionsplanung;

// ========================================
// OPT-05: TABLET / BERATUNGSMODUS TOGGLE
// ========================================

function initBeratungsmodusToggle() {
    if (document.getElementById('beratungsmodusToggle')) return;

    var btn = document.createElement('button');
    btn.id = 'beratungsmodusToggle';
    btn.className = 'beratungsmodus-toggle';
    btn.title = 'Beratungsmodus umschalten';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
    btn.onclick = function() {
        var page = document.getElementById('kundenDetailPage');
        if (!page) return;
        var isActive = page.classList.toggle('beratungsmodus-active');
        btn.classList.toggle('active', isActive);
        if (isActive) {
            openBeratungsOverlay();
        } else {
            closeBeratungsOverlay();
        }
    };
    document.body.appendChild(btn);
}

// Only show toggle when on kunden-detail page
(function() {
    var observer2 = new MutationObserver(function() {
        var page = document.getElementById('kundenDetailPage');
        var toggle = document.getElementById('beratungsmodusToggle');
        if (page && page.style.display !== 'none') {
            if (!toggle) initBeratungsmodusToggle();
            else toggle.style.display = '';
        } else if (toggle) {
            toggle.style.display = 'none';
        }
    });
    document.addEventListener('DOMContentLoaded', function() {
        var page = document.getElementById('kundenDetailPage');
        if (page) observer2.observe(page, { attributes: true });
    });
})();

// ========================================
// OPT-10: BERATUNGSMODUS MIT GESPRÄCHSFÜHRUNG
// ========================================

var beratungsSchritte = [
    { nr: 1, titel: 'Begrüssung & Rapport', detail: 'Kunde namentlich begrüssen, aktuellen Anlass ansprechen, Gesprächsziel klären.' },
    { nr: 2, titel: 'Bedarfsanalyse', detail: 'Aktuelle Lebenssituation erfragen, Veränderungen seit letztem Kontakt, Wünsche und Ziele.' },
    { nr: 3, titel: 'Ist-Analyse vorstellen', detail: 'Bestehende Verträge/Produkte zeigen, Open Finance Daten besprechen, Deckungslücken aufzeigen.' },
    { nr: 4, titel: 'Empfehlung präsentieren', detail: 'Konkrete Vorschläge mit KI-Begründung vorstellen, Tarifvergleich zeigen, CLV-Szenarien erläutern.' },
    { nr: 5, titel: 'Einwandbehandlung', detail: 'Rückfragen klären, Alternativen anbieten, Preis-Leistung verdeutlichen.' },
    { nr: 6, titel: 'Abschluss', detail: 'Zusammenfassung, nächste Schritte vereinbaren, Angebot erstellen oder Termin für Nachgespräch.' },
    { nr: 7, titel: 'Dokumentation', detail: 'Beratungsprotokoll erstellen, Kundenakte aktualisieren, Follow-up planen.' }
];

function openBeratungsOverlay() {
    if (document.getElementById('beratungsOverlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'beratungsOverlay';
    overlay.className = 'beratung-overlay';

    var html = '<div class="beratung-header">' +
        '<h3>Gesprächsleitfaden</h3>' +
        '<button class="beratung-close" onclick="closeBeratungsOverlay()">&times;</button>' +
    '</div>' +
    '<div class="beratung-body">';

    for (var i = 0; i < beratungsSchritte.length; i++) {
        var s = beratungsSchritte[i];
        var activeClass = i === 0 ? ' active' : '';
        html += '<div class="beratung-schritt' + activeClass + '" onclick="toggleBeratungsSchritt(this, ' + i + ')">' +
            '<div class="beratung-schritt-title"><span class="beratung-schritt-nummer">' + s.nr + '</span> ' + s.titel + '</div>' +
            '<div class="beratung-schritt-detail">' + s.detail + '</div>' +
        '</div>';
    }

    html += '</div>' +
    '<div class="beratung-protokoll">' +
        '<button class="beratung-protokoll-btn" onclick="generateBeratungsprotokoll()">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
            'Beratungsprotokoll erstellen' +
        '</button>' +
    '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);
}
window.openBeratungsOverlay = openBeratungsOverlay;

function closeBeratungsOverlay() {
    var overlay = document.getElementById('beratungsOverlay');
    if (overlay) overlay.remove();
    var page = document.getElementById('kundenDetailPage');
    if (page) page.classList.remove('beratungsmodus-active');
    var toggle = document.getElementById('beratungsmodusToggle');
    if (toggle) toggle.classList.remove('active');
}
window.closeBeratungsOverlay = closeBeratungsOverlay;

function toggleBeratungsSchritt(el, idx) {
    var schritte = el.parentNode.querySelectorAll('.beratung-schritt');
    // Toggle done state
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        el.classList.add('done');
        // Activate next
        if (schritte[idx + 1]) schritte[idx + 1].classList.add('active');
    } else if (el.classList.contains('done')) {
        el.classList.remove('done');
        el.classList.add('active');
    } else {
        schritte.forEach(function(s) { s.classList.remove('active'); });
        el.classList.add('active');
    }
}
window.toggleBeratungsSchritt = toggleBeratungsSchritt;

function generateBeratungsprotokoll() {
    var kundenName = '';
    var nameEl = document.getElementById('kundenName');
    if (nameEl) kundenName = nameEl.textContent.trim();

    var schritte = document.querySelectorAll('#beratungsOverlay .beratung-schritt');
    var completed = 0;
    schritte.forEach(function(s) { if (s.classList.contains('done')) completed++; });

    if (typeof showAngebotToast === 'function') {
        showAngebotToast('success', 'Protokoll erstellt: Beratung ' + kundenName + ' (' + completed + '/' + schritte.length + ' Schritte abgeschlossen)');
    }
}
window.generateBeratungsprotokoll = generateBeratungsprotokoll;

window.__registerModule('kunden-detail-impulse.js');
