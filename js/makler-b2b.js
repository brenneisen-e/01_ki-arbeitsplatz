
// ========================================
// B2B A-10 TAB RENDERERS (separate tabs)
// ========================================

function renderB2bSchadenhistorie(kunde) {
    var container = document.getElementById('b2bSchadenContent');
    if (!container) return;
    if (!kunde.schadenhistorie || kunde.schadenhistorie.length === 0) {
        container.innerHTML = '<p class="text-muted">Keine Schadenhistorie vorhanden.</p>';
        return;
    }

    var rows = kunde.schadenhistorie.map(function(s) {
        var qClass = s.quote > 65 ? 'schaden-hoch' : (s.quote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr><td><strong>' + s.jahr + '</strong></td><td>' + s.anzahl + '</td>' +
            '<td class="text-right">' + s.volumen.toLocaleString('de-DE') + ' €</td>' +
            '<td><span class="' + qClass + '">' + s.quote + '%</span></td>' +
            '<td>' + s.groesster + '</td></tr>';
    }).join('');

    // KPI summary
    var totalSchaden = kunde.schadenhistorie.reduce(function(a, s) { return a + s.volumen; }, 0);
    var avgQuote = Math.round(kunde.schadenhistorie.reduce(function(a, s) { return a + s.quote; }, 0) / kunde.schadenhistorie.length);
    var trend = kunde.schadenhistorie.length >= 2 ? (kunde.schadenhistorie[0].quote - kunde.schadenhistorie[1].quote) : 0;
    var trendClass = trend < 0 ? 'positive' : (trend > 0 ? 'negative' : '');
    var trendText = trend < 0 ? (trend + '% ggü. VJ') : (trend > 0 ? '+' + trend + '% ggü. VJ' : '±0% ggü. VJ');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Gesamtvolumen (' + kunde.schadenhistorie.length + ' J.)</span><span class="mk-kpi-value">' + (totalSchaden >= 1000000 ? (totalSchaden / 1000000).toFixed(1) + ' Mio. €' : totalSchaden.toLocaleString('de-DE') + ' €') + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Ø Schadenquote</span><span class="mk-kpi-value">' + avgQuote + '%</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Trend aktuelles Jahr</span><span class="mk-kpi-value ' + trendClass + '">' + trendText + '</span></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Jahr</th><th>Anzahl</th><th class="text-right">Volumen</th><th>Quote</th><th>Größter Einzelschaden</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderB2bDeckungsluecken(kunde) {
    var container = document.getElementById('b2bDeckungslueckenContent');
    if (!container) return;
    if (!kunde.deckungsluecken || kunde.deckungsluecken.length === 0) {
        container.innerHTML = '<p class="text-muted">Keine Deckungslücken identifiziert.</p>';
        return;
    }

    var hoch = kunde.deckungsluecken.filter(function(d) { return d.prioritaet === 'Hoch'; }).length;
    var mittel = kunde.deckungsluecken.filter(function(d) { return d.prioritaet === 'Mittel'; }).length;

    var rows = kunde.deckungsluecken.map(function(d) {
        var pClass = d.prioritaet === 'Hoch' ? 'prio-hoch' : (d.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        return '<tr><td><strong>' + d.risiko + '</strong></td>' +
            '<td><span class="status-badge-dl">' + d.status + '</span></td>' +
            '<td>' + d.empfehlung + '</td>' +
            '<td><span class="prio-badge ' + pClass + '">' + d.prioritaet + '</span></td></tr>';
    }).join('');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Gesamt</span><span class="mk-kpi-value">' + kunde.deckungsluecken.length + ' Lücken</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Hohe Priorität</span><span class="mk-kpi-value negative">' + hoch + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Mittlere Priorität</span><span class="mk-kpi-value">' + mittel + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Deckungsquote</span><span class="mk-kpi-value">' + kunde.deckungsquote + '%</span></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Risiko</th><th>Status</th><th>Empfehlung</th><th>Priorität</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderB2bRenewal(kunde) {
    var container = document.getElementById('b2bRenewalContent');
    if (!container) return;
    if (!kunde.vertraegeDetail) { container.innerHTML = '<p class="text-muted">Keine Vertragsdaten vorhanden.</p>'; return; }

    var now = new Date();
    var d30 = new Date(now); d30.setDate(d30.getDate() + 30);
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var d180 = new Date(now); d180.setDate(d180.getDate() + 180);

    var rot = [], gelb = [], gruen = [], rest = [];
    kunde.vertraegeDetail.forEach(function(v) {
        if (v.ablauf === 'unbefristet') return;
        var parts = v.ablauf.split('.');
        var ablauf = new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
        var item = { sparte: v.sparte, versicherer: v.versicherer, praemie: v.praemie, ablauf: v.ablauf, schadenquote: v.schadenquote };
        if (ablauf <= d30) rot.push(item);
        else if (ablauf <= d90) gelb.push(item);
        else if (ablauf <= d180) gruen.push(item);
        else rest.push(item);
    });

    function renderGroup(label, items, cssClass) {
        if (items.length === 0) return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (0)</div></div>';
        var rows = items.map(function(i) {
            var sqText = i.schadenquote !== null && i.schadenquote !== undefined ? ' | SQ: ' + i.schadenquote + '%' : '';
            return '<div class="renewal-item"><span class="renewal-sparte">' + i.sparte + '</span><span class="renewal-versicherer">' + i.versicherer + sqText + '</span><span class="renewal-ablauf">' + i.ablauf + '</span></div>';
        }).join('');
        return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (' + items.length + ')</div>' + rows + '</div>';
    }

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Kritisch (≤30 Tage)</span><span class="mk-kpi-value negative">' + rot.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Bald fällig (31-90)</span><span class="mk-kpi-value" style="color:#f59e0b">' + gelb.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">In 91-180 Tagen</span><span class="mk-kpi-value positive">' + gruen.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Nächstes Renewal</span><span class="mk-kpi-value">' + kunde.naechstesRenewal + '</span></div>' +
        '</div>' +
        renderGroup('Kritisch – Nächste 30 Tage', rot, 'renewal-rot') +
        renderGroup('Bald fällig – 31 bis 90 Tage', gelb, 'renewal-gelb') +
        renderGroup('Geplant – 91 bis 180 Tage', gruen, 'renewal-gruen') +
        renderGroup('Langfristig – >180 Tage', rest, 'renewal-gruen');
}

function renderB2bAnsprechpartner(kunde) {
    var container = document.getElementById('b2bAnsprechpartnerContent');
    if (!container) return;

    // Generate Ansprechpartner from customer data
    var contacts = [];
    if (kunde.keyContact) {
        var parts = kunde.keyContact.match(/^(.+?)(?:\s*\((.+?)\))?$/);
        contacts.push({ name: parts ? parts[1] : kunde.keyContact, rolle: parts && parts[2] ? parts[2] : 'Hauptansprechpartner', typ: 'Entscheider', tel: '+49 5231 ' + (70000 + Math.floor(Math.random() * 9999)), email: (parts ? parts[1] : 'kontakt').toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + '@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
    }
    // Add some typical contacts based on segment
    if (kunde.segment === 'Gesundheitswesen') {
        contacts.push({ name: 'Barbara Schäfer', rolle: 'Leiterin Einkauf & Vergabe', typ: 'Operativ', tel: '+49 5231 72-450', email: 'b.schaefer@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
        contacts.push({ name: 'Markus Dietrich', rolle: 'Facility Management', typ: 'Fachlich', tel: '+49 5231 72-280', email: 'm.dietrich@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
    } else if (kunde.segment === 'Kirche') {
        contacts.push({ name: 'Renate Berger', rolle: 'Leiterin Finanzabteilung', typ: 'Operativ', tel: '+49 521 8321-500', email: 'r.berger@kirche-owl.de' });
    } else {
        contacts.push({ name: 'Petra Hoffmann', rolle: 'Assistenz Geschäftsführung', typ: 'Operativ', tel: '+49 5231 93-100', email: 'p.hoffmann@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
    }

    var rows = contacts.map(function(c) {
        var typBadge = c.typ === 'Entscheider' ? 'prio-hoch' : (c.typ === 'Operativ' ? 'prio-mittel' : 'prio-niedrig');
        return '<tr>' +
            '<td><strong>' + c.name + '</strong></td>' +
            '<td>' + c.rolle + '</td>' +
            '<td><span class="prio-badge ' + typBadge + '">' + c.typ + '</span></td>' +
            '<td>' + c.tel + '</td>' +
            '<td><a href="mailto:' + c.email + '" style="color:#3b82f6">' + c.email + '</a></td>' +
            '</tr>';
    }).join('');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Ansprechpartner</span><span class="mk-kpi-value">' + contacts.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Key Contact</span><span class="mk-kpi-value" style="font-size:13px">' + (kunde.keyContact || '—') + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Kunde seit</span><span class="mk-kpi-value">' + (kunde.kundeSeit || '—') + '</span></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Name</th><th>Rolle / Funktion</th><th>Typ</th><th>Telefon</th><th>E-Mail</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderB2bPotentiale(kunde) {
    var container = document.getElementById('b2bPotentialeContent');
    if (!container) return;

    // Generate potentials based on Deckungslücken and segment
    var potentials = [];

    // From Deckungslücken
    if (kunde.deckungsluecken) {
        kunde.deckungsluecken.forEach(function(d, idx) {
            if (d.prioritaet === 'Hoch' || d.prioritaet === 'Mittel') {
                var estPraemie = d.prioritaet === 'Hoch' ? Math.round(kunde.praemie * 0.08) : Math.round(kunde.praemie * 0.04);
                // Generate rich detail data
                var versicherer = [];
                var naechsteSchritte = [];
                if (d.risiko.includes('Umwelt')) {
                    versicherer = ['Allianz Umwelthaftpflicht (Rahmenvertrag)', 'HDI Umwelthaftpflicht Spezial', 'AXA Eco-Protect'];
                    naechsteSchritte = ['Risiko-Audit vor Ort durchführen', 'Laborbestände und Gefahrstoffklassen erfassen', 'Angebote bei 3 Versicherern einholen'];
                } else if (d.risiko.includes('Maschinen')) {
                    versicherer = ['Allianz Maschinen-Allgefahren', 'Zurich Medical Equipment Cover', 'Provinzial Medizintechnik-Paket'];
                    naechsteSchritte = ['Inventarliste med. Großgeräte anfordern', 'Wartungsverträge prüfen', 'Versicherungssumme kalkulieren'];
                } else if (d.risiko.includes('Cyber')) {
                    versicherer = ['Hiscox CyberClear', 'AIG CyberEdge', 'Zurich Cyber-Police'];
                    naechsteSchritte = ['IT-Sicherheitsaudit initiieren', 'Datenschutz-Compliance prüfen', 'Angebote einholen und vergleichen'];
                } else if (d.risiko.includes('D&O') || d.risiko.includes('Organ')) {
                    versicherer = ['Zurich D&O Executive', 'AIG Directors Shield', 'Chubb Management Liability'];
                    naechsteSchritte = ['Gremienstruktur dokumentieren', 'Haftungsrisiken analysieren', 'Deckungssumme festlegen'];
                } else if (d.risiko.includes('Pandemie') || d.risiko.includes('Epidemie')) {
                    versicherer = ['Allianz BU-Erweiterung', 'Munich Re Parametric', 'Swiss Re Pandemic Cover'];
                    naechsteSchritte = ['Aktuelle Sublimits prüfen', 'Pandemie-Szenario berechnen', 'Erweiterungsangebot verhandeln'];
                } else if (d.risiko.includes('Missbrauch')) {
                    versicherer = ['Ecclesia Missbrauchsprävention', 'Zurich Social Care', 'HDI Institutionen-Schutz'];
                    naechsteSchritte = ['Präventionskonzept bewerten', 'Deckungsumfang definieren', 'Rahmenvertrag prüfen'];
                } else {
                    versicherer = ['Allianz Spezial-Police', 'HDI Firmenschutz', 'Zurich Industrie-Paket'];
                    naechsteSchritte = ['Risikobewertung durchführen', 'Angebote einholen', 'Vorstandsgespräch vereinbaren'];
                }
                potentials.push({
                    id: 'b2bpot-dl-' + idx,
                    produkt: d.risiko,
                    quelle: 'Deckungslücke',
                    prioritaet: d.prioritaet,
                    status: d.status,
                    geschaetztePraemie: estPraemie,
                    empfehlung: d.empfehlung,
                    versicherer: versicherer,
                    naechsteSchritte: naechsteSchritte,
                    herleitung: 'Identifiziert durch Bestandsanalyse: ' + d.status + '. ' + d.empfehlung
                });
            }
        });
    }

    // Add segment-specific cross-selling
    if (kunde.segment === 'Gesundheitswesen') {
        potentials.push({
            id: 'b2bpot-cs-1',
            produkt: 'Erweiterter Haftpflicht-Rahmenvertrag',
            quelle: 'KI-Analyse',
            prioritaet: 'Mittel',
            status: 'Nicht angeboten',
            geschaetztePraemie: Math.round(kunde.praemie * 0.05),
            empfehlung: 'Aktuelle Trends in Klinik-Haftpflicht berücksichtigen',
            versicherer: ['EGAS Rahmenvertrag Plus', 'Allianz Klinik-Haftpflicht XL', 'HDI Medizinische Einrichtungen'],
            naechsteSchritte: ['Aktuelle Haftpflichtdeckung analysieren', 'Gaps zu Branchenstandard identifizieren', 'Erweiterungsangebot erstellen'],
            herleitung: 'KI-Analyse: Kliniken ähnlicher Größe haben 15% höhere Haftpflichtdeckung. Aktuelle Police unter Benchmark.'
        });
        if (!kunde.vertraegeDetail || !kunde.vertraegeDetail.some(function(v) { return v.sparte.includes('bKV'); })) {
            potentials.push({
                id: 'b2bpot-cs-2',
                produkt: 'betriebliche Krankenversicherung (bKV)',
                quelle: 'Cross-Selling',
                prioritaet: 'Mittel',
                status: 'Nicht versichert',
                geschaetztePraemie: Math.round(kunde.mitarbeitende * 50 * 12 * 0.3),
                empfehlung: 'Fachkräftemangel: bKV als Mitarbeiter-Bindungsinstrument',
                versicherer: ['DKV CompanyMed', 'Allianz bKV Konzept', 'Hallesche bKV-Komfort'],
                naechsteSchritte: ['HR-Abteilung kontaktieren', 'Budget pro Mitarbeiter klären', 'Rahmenvertrag-Konditionen einholen'],
                herleitung: 'Cross-Selling: ' + (kunde.mitarbeitende || 0).toLocaleString('de-DE') + ' Mitarbeitende ohne bKV. Fachkräftegewinnung als zentrales Thema identifiziert.'
            });
        }
    } else if (kunde.segment === 'Industrie & Gewerbe') {
        potentials.push({
            id: 'b2bpot-cs-3',
            produkt: 'Erweiterte Produkthaftpflicht',
            quelle: 'KI-Analyse',
            prioritaet: 'Hoch',
            status: 'Prüfen',
            geschaetztePraemie: Math.round(kunde.praemie * 0.06),
            empfehlung: 'Produktrückruf-Absicherung international',
            versicherer: ['Zurich Product Recall', 'AIG Produkt-Rückruf Global', 'Allianz Produkthaftpflicht International'],
            naechsteSchritte: ['Exportmärkte und Produktportfolio analysieren', 'Rückruf-Szenarien durchspielen', 'Internationale Deckung prüfen'],
            herleitung: 'KI-Analyse: Unternehmen mit internationaler Produktion in ' + (kunde.standorte || 0) + ' Standorten benötigt erweiterte Produkthaftpflicht inkl. Rückruf.'
        });
    } else if (kunde.segment === 'Transport & Logistik') {
        potentials.push({
            id: 'b2bpot-cs-4',
            produkt: 'Warentransportversicherung (International)',
            quelle: 'KI-Analyse',
            prioritaet: 'Hoch',
            status: 'Ergänzung',
            geschaetztePraemie: Math.round(kunde.praemie * 0.07),
            empfehlung: 'Internationale Lieferketten absichern',
            versicherer: ['Helvetia Transport International', 'Zurich Cargo Global', 'HDI Transportversicherung'],
            naechsteSchritte: ['Transportvolumen und -routen analysieren', 'Aktuelle Warenversicherung prüfen', 'Lücken bei internationalen Transporten identifizieren'],
            herleitung: 'KI-Analyse: ' + (kunde.standorte || 0) + ' Standorte international – Warentransport nur teilweise versichert.'
        });
    }

    if (potentials.length === 0) {
        container.innerHTML = '<p class="text-muted">Aktuell keine Potentiale identifiziert.</p>';
        return;
    }

    var totalPot = potentials.reduce(function(a, p) { return a + p.geschaetztePraemie; }, 0);
    var hochCount = potentials.filter(function(p) { return p.prioritaet === 'Hoch'; }).length;

    var rows = potentials.map(function(p) {
        var pClass = p.prioritaet === 'Hoch' ? 'prio-hoch' : (p.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        var praemieText = p.geschaetztePraemie >= 1000000 ? (p.geschaetztePraemie / 1000000).toFixed(1) + ' Mio. €' : p.geschaetztePraemie.toLocaleString('de-DE') + ' €';

        // Versicherer list
        var versichererHtml = (p.versicherer || []).map(function(v) {
            return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0"><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ' + v + '</div>';
        }).join('');

        // Nächste Schritte list
        var schritteHtml = (p.naechsteSchritte || []).map(function(s, i) {
            return '<div style="display:flex;align-items:flex-start;gap:6px;padding:3px 0"><span style="background:#e2e8f0;color:#475569;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">' + (i + 1) + '</span> ' + s + '</div>';
        }).join('');

        // Detail row
        var detailHtml = '<tr class="impulse-table-detail" id="b2bpot-detail-' + p.id + '"><td colspan="6">' +
            '<div class="impulse-table-detail-inner">' +
                '<div class="impulse-table-herleitung" style="flex:1">' +
                    '<div class="kanban-detail-title">Herleitung</div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Quelle</span><span class="kanban-detail-value">' + p.quelle + '</span></div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Status</span><span class="kanban-detail-value">' + p.status + '</span></div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Analyse</span><span class="kanban-detail-value">' + (p.herleitung || p.empfehlung) + '</span></div>' +
                    '<div style="margin-top:12px"><div class="kanban-detail-title">Versicherer-Empfehlungen</div>' + versichererHtml + '</div>' +
                '</div>' +
                '<div style="flex:1">' +
                    '<div class="kanban-detail-title">Nächste Schritte</div>' + schritteHtml +
                    '<div style="margin-top:14px"><div class="kanban-detail-title">Geschätzte Prämie</div>' +
                    '<div style="font-size:20px;font-weight:700;color:#166534">' + praemieText + ' <span style="font-size:12px;font-weight:400;color:#64748b">p.a.</span></div></div>' +
                '</div>' +
                '<div class="impulse-table-actions">' +
                    '<button class="action-btn icon-only primary small" onclick="event.stopPropagation()" title="Angebot erstellen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>' +
                    '<button class="action-btn icon-only secondary small" onclick="event.stopPropagation()" title="Termin vereinbaren"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></button>' +
                    '<button class="action-btn icon-only secondary small" onclick="event.stopPropagation()" title="E-Mail senden"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></button>' +
                '</div>' +
            '</div></td></tr>';

        return '<tr class="impulse-table-row" onclick="toggleB2bPotDetail(\'' + p.id + '\')">' +
            '<td><strong>' + p.produkt + '</strong></td>' +
            '<td><span class="status-badge-dl">' + p.quelle + '</span></td>' +
            '<td><span class="prio-badge ' + pClass + '">' + p.prioritaet + '</span></td>' +
            '<td class="text-right"><strong>' + praemieText + '</strong></td>' +
            '<td>' + p.empfehlung + '</td>' +
            '<td class="impulse-table-expand-cell"><span class="impulse-table-expand" id="b2bpot-expand-' + p.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></span></td>' +
            '</tr>' + detailHtml;
    }).join('');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Potentiale</span><span class="mk-kpi-value">' + potentials.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Hohe Priorität</span><span class="mk-kpi-value negative">' + hochCount + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Geschätztes Prämienvolumen</span><span class="mk-kpi-value positive">' + (totalPot >= 1000000 ? (totalPot / 1000000).toFixed(1) + ' Mio. €' : totalPot.toLocaleString('de-DE') + ' €') + '</span></div>' +
        '</div>' +
        '<table class="impulse-table makler-detail-table"><thead><tr><th>Produkt / Risiko</th><th>Quelle</th><th>Priorität</th><th class="text-right">Geschätzte Prämie</th><th>Empfehlung</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function toggleB2bPotDetail(id) {
    var detail = document.getElementById('b2bpot-detail-' + id);
    var expand = document.getElementById('b2bpot-expand-' + id);
    if (detail) {
        detail.classList.toggle('open');
        if (expand) expand.classList.toggle('open');
    }
}
window.toggleB2bPotDetail = toggleB2bPotDetail;

// ========================================
// MAKLER TAB SWITCHING
// ========================================
function showMaklerTab(tabName) {
    // Deactivate all Makler tabs + content
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.classList.remove('active'); });
    // Also hide kundenliste-makler if switching away
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    if (maklerListe) maklerListe.classList.remove('active');

    var btn = document.querySelector('.agentur-tab-makler[data-mktab="' + tabName + '"]');
    if (btn) btn.classList.add('active');

    if (tabName === 'kunden') {
        if (maklerListe) maklerListe.classList.add('active');
        renderMaklerKundenliste();
    } else {
        var tab = document.getElementById('tab-makler-' + tabName);
        if (tab) tab.classList.add('active');
    }

    // Lazy-render
    if (tabName === 'uebersicht') renderMaklerUebersicht();
    if (tabName === 'stammdaten') renderMaklerStammdaten();
    if (tabName === 'neugeschaeft') renderMaklerNeugeschaeft();
    if (tabName === 'bestand') renderMaklerBestand();
    if (tabName === 'potentiale') renderMaklerPotentiale();
    if (tabName === 'versicherermix') renderVersichererMix();
    if (tabName === 'renewal') renderMaklerRenewalOverview();
    if (tabName === 'schaden') renderMaklerSchadenOverview();
    if (tabName === 'deckungsluecken') renderMaklerDeckungslueckenOverview();
}
window.showMaklerTab = showMaklerTab;

// ========================================
// MAKLER ÜBERSICHT (Dashboard)
// ========================================
function renderMaklerUebersicht() {
    var container = document.getElementById('maklerUebersichtContent');
    if (!container) return;
    try {
    // Top-5 Kunden nach Prämie
    var topKunden = maklerKunden.slice().sort(function(a, b) { return b.praemie - a.praemie; }).slice(0, 5);
    var topKundenRows = topKunden.map(function(k, i) {
        var schadenClass = k.schadenquote > 65 ? 'schaden-hoch' : (k.schadenquote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + k.id + '\')">' +
            '<td><strong>' + (i + 1) + '.</strong></td>' +
            '<td><strong>' + k.name + '</strong><br><span style="font-size:11px;color:#64748b">' + k.segment + '</span></td>' +
            '<td class="text-right"><strong>' + k.praemieDisplay + '</strong></td>' +
            '<td class="text-center">' + k.vertraege + '</td>' +
            '<td><span class="' + schadenClass + '">' + k.schadenquote + '%</span></td>' +
            '</tr>';
    }).join('');

    // Anstehende Renewals (nächste 90 Tage)
    var now = new Date();
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var renewals = [];
    maklerKunden.forEach(function(k) {
        if (!k.vertraegeDetail) return;
        k.vertraegeDetail.forEach(function(v) {
            if (v.ablauf === 'unbefristet') return;
            var parts = v.ablauf.split('.');
            var ablauf = new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (ablauf <= d90 && ablauf >= now) {
                renewals.push({ kunde: k.name, kundeId: k.id, sparte: v.sparte, ablauf: v.ablauf, praemie: v.praemie, ablaufDate: ablauf });
            }
        });
    });
    renewals.sort(function(a, b) { return a.ablaufDate - b.ablaufDate; });
    var renewalRows = renewals.slice(0, 8).map(function(r) {
        var daysLeft = Math.ceil((r.ablaufDate - now) / (1000 * 60 * 60 * 24));
        var urgencyClass = daysLeft <= 30 ? 'renewal-rot' : 'renewal-gelb';
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + r.kundeId + '\')">' +
            '<td><span class="renewal-badge ' + urgencyClass + '">' + r.ablauf + '</span></td>' +
            '<td><strong>' + r.kunde + '</strong></td>' +
            '<td>' + r.sparte + '</td>' +
            '<td class="text-right">' + (r.praemie >= 1000000 ? (r.praemie / 1000000).toFixed(1) + ' Mio. \u20AC' : r.praemie.toLocaleString('de-DE') + ' \u20AC') + '</td>' +
            '</tr>';
    }).join('');
    if (renewalRows === '') renewalRows = '<tr><td colspan="4" class="text-muted">Keine Renewals in den n\u00E4chsten 90 Tagen</td></tr>';

    // Segment-Verteilung berechnen
    var segmentMap = {};
    var totalPraemie = 0;
    maklerKunden.forEach(function(k) {
        if (!segmentMap[k.segment]) segmentMap[k.segment] = { praemie: 0, count: 0 };
        segmentMap[k.segment].praemie += k.praemie;
        segmentMap[k.segment].count++;
        totalPraemie += k.praemie;
    });
    var segmentColors = {
        'Gesundheitswesen': '#3b82f6',
        'Kirche': '#8b5cf6',
        'Sozialwirtschaft': '#f59e0b',
        'Industrie & Gewerbe': '#64748b',
        'Transport & Logistik': '#22c55e'
    };
    var segmentItems = Object.keys(segmentMap).map(function(seg) {
        return { name: seg, praemie: segmentMap[seg].praemie, count: segmentMap[seg].count, color: segmentColors[seg] || '#94a3b8' };
    }).sort(function(a, b) { return b.praemie - a.praemie; });

    var segmentBars = segmentItems.map(function(s) {
        var pct = (s.praemie / totalPraemie * 100).toFixed(1);
        return '<div class="mk-segment-row">' +
            '<span class="mk-segment-label"><span class="mk-segment-dot" style="background:' + s.color + '"></span>' + s.name + ' (' + s.count + ')</span>' +
            '<div class="mk-segment-bar-track"><div class="mk-segment-bar-fill" style="width:' + pct + '%;background:' + s.color + '"></div></div>' +
            '<span class="mk-segment-value">' + pct + '%</span></div>';
    }).join('');

    // Gesamtkennzahlen
    var totalVertraege = maklerKunden.reduce(function(s, k) { return s + k.vertraege; }, 0);
    var avgDeckung = (maklerKunden.reduce(function(s, k) { return s + k.deckungsquote; }, 0) / maklerKunden.length).toFixed(0);
    var avgSchaden = (maklerKunden.reduce(function(s, k) { return s + k.schadenquote; }, 0) / maklerKunden.length).toFixed(0);

    // Top-3 Potentiale
    var prioOrder = { 'Hoch': 0, 'Mittel': 1, 'Niedrig': 2 };
    var topPotentiale = (typeof maklerPotentialeData !== 'undefined' ? maklerPotentialeData : []).slice().sort(function(a, b) {
        return (prioOrder[a.prioritaet] || 2) - (prioOrder[b.prioritaet] || 2);
    }).slice(0, 3);
    var potentialeHtml = topPotentiale.map(function(p) {
        var prioClass = p.prioritaet === 'Hoch' ? 'high' : (p.prioritaet === 'Mittel' ? 'medium' : 'low');
        var detailId = 'ub-pot-' + p.id;
        return '<div class="impuls-item clickable" onclick="toggleUebersichtPotDetail(\'' + detailId + '\')">' +
            '<div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>' +
            '<div class="impuls-text"><strong>' + p.titel + '</strong><p>' + p.kunde + ' \u2013 ' + p.beschreibung + '</p></div>' +
            '<span class="impuls-priority ' + prioClass + '">' + p.potentialPraemie + '</span>' +
            '<span class="impuls-expand" id="ub-pot-arrow-' + p.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></span></div>' +
            '<div class="impuls-detail" id="' + detailId + '" style="display:none;">' +
                '<div class="impuls-detail-section">' +
                    '<h4>Herleitung</h4>' +
                    '<div class="herleitung-grid">' +
                        '<div class="herleitung-item"><span class="herleitung-label">Kunde</span><span class="herleitung-value">' + p.kunde + '</span></div>' +
                        '<div class="herleitung-item"><span class="herleitung-label">Kategorie</span><span class="herleitung-value">' + p.kategorie + '</span></div>' +
                        '<div class="herleitung-item"><span class="herleitung-label">Quelle</span><span class="herleitung-value">' + p.quelle + '</span></div>' +
                        '<div class="herleitung-item"><span class="herleitung-label">Analyse</span><span class="herleitung-value">' + p.herleitung + '</span></div>' +
                        '<div class="herleitung-item"><span class="herleitung-label">Empfehlung</span><span class="herleitung-value">' + p.empfehlung + '</span></div>' +
                        '<div class="herleitung-item"><span class="herleitung-label">Potential</span><span class="herleitung-value" style="color:#16a34a;font-weight:600;">' + p.potentialPraemie + '</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="impuls-detail-section">' +
                    '<div class="impuls-actions">' +
                        '<button class="action-btn primary" onclick="openMaklerKundenDetail(\'' + p.kundeId + '\')">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
                            ' Zum Kunden</button>' +
                        '<button class="action-btn secondary" onclick="showMaklerTab(\'potentiale\')">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                            ' Alle Potentiale</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }).join('');

    // Aufgaben (Tasks)
    var aufgabenHtml =
        '<div class="mk-aufgaben-liste">' +
            '<div class="mk-aufgabe-item prio-rot"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="mk-aufgabe-text"><strong>Cyber-Renewal Klinikum Lippetal</strong><span>Ablauf 31.03.2026 \u2013 Verhandlung mit Hiscox starten</span></div><span class="mk-aufgabe-frist frist-dringend">49 Tage</span></div>' +
            '<div class="mk-aufgabe-item prio-rot"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="mk-aufgabe-text"><strong>Umwelthaftpflicht-Angebot erstellen</strong><span>Klinikum Lippetal \u2013 Gesetzliche Anforderung seit 2024</span></div><span class="mk-aufgabe-frist frist-dringend">Offen</span></div>' +
            '<div class="mk-aufgabe-item prio-gelb"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="mk-aufgabe-text"><strong>Jahresgespr\u00E4ch Nordlicht Automatisierung</strong><span>Produkt-Haftpflicht US-Erweiterung vorbereiten</span></div><span class="mk-aufgabe-frist">15.02.2026</span></div>' +
            '<div class="mk-aufgabe-item prio-gelb"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="mk-aufgabe-text"><strong>Cyber-Rahmenvertrag Ev. Landeskirche</strong><span>Ausschreibungsunterlagen vorbereiten (1.900 Gemeinden)</span></div><span class="mk-aufgabe-frist">28.02.2026</span></div>' +
            '<div class="mk-aufgabe-item"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div><div class="mk-aufgabe-text"><strong>bKV-Pr\u00E4sentation Diakonisches Werk</strong><span>Budget-Tarif-Vergleich f\u00FCr 4.500 Mitarbeitende</span></div><span class="mk-aufgabe-frist">10.03.2026</span></div>' +
        '</div>';

    container.innerHTML =
        '<div class="mk-uebersicht-grid">' +
            '<div class="mk-uebersicht-main">' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' +
                        ' Vertriebskennzahlen</h3></div>' +
                    '<div class="kennzahlen-grid">' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + maklerKunden.length + '</div><div class="kennzahl-label">Kunden</div><div class="kennzahl-trend positive">5 Segmente</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + totalVertraege + '</div><div class="kennzahl-label">Vertr\u00E4ge gesamt</div><div class="kennzahl-trend positive">\u00D8 ' + Math.round(totalVertraege / maklerKunden.length) + ' pro Kunde</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + avgDeckung + '%</div><div class="kennzahl-label">\u00D8 Deckungsquote</div><div class="kennzahl-trend ' + (Number(avgDeckung) >= 80 ? 'positive' : 'neutral') + '">Ziel: 85%</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + avgSchaden + '%</div><div class="kennzahl-label">\u00D8 Schadenquote</div><div class="kennzahl-trend ' + (Number(avgSchaden) < 65 ? 'positive' : 'negative') + '">Ziel: &lt; 65%</div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
                        ' Aufgaben</h3></div>' +
                    aufgabenHtml +
                '</div>' +
                '<div class="uebersicht-card potentiale-impuls-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                        ' Vertriebspotentiale</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMaklerTab(\'potentiale\'); return false;">Alle ' + (typeof maklerPotentialeData !== 'undefined' ? maklerPotentialeData.length : 0) + ' Potentiale \u2192</a>' +
                    '</div>' +
                    potentialeHtml +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>' +
                        ' Top-5 Kunden (Pr\u00E4mienvolumen)</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMaklerTab(\'kunden\'); return false;">Alle ' + maklerKunden.length + ' Kunden \u2192</a>' +
                    '</div>' +
                    '<table class="makler-detail-table"><thead><tr><th>#</th><th>Institution</th><th class="text-right">Pr\u00E4mie/a</th><th class="text-center">Vertr\u00E4ge</th><th>Schadenquote</th></tr></thead>' +
                    '<tbody>' + topKundenRows + '</tbody></table>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Anstehende Renewals (90 Tage)</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMaklerTab(\'renewal\'); return false;">Alle Renewals \u2192</a>' +
                    '</div>' +
                    '<table class="makler-detail-table"><thead><tr><th>Ablauf</th><th>Kunde</th><th>Sparte</th><th class="text-right">Pr\u00E4mie</th></tr></thead>' +
                    '<tbody>' + renewalRows + '</tbody></table>' +
                '</div>' +
            '</div>' +
            '<div class="mk-uebersicht-sidebar">' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><path d="M12 2v10h10"/></svg>' +
                        ' Segment-Verteilung</h3></div>' +
                    '<div class="mk-segment-chart">' + segmentBars + '</div>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Anstehende Termine</h3></div>' +
                    '<div class="termine-liste">' +
                        '<div class="termin-item heute"><div class="termin-zeit"><span class="termin-tag">Heute</span><span class="termin-uhrzeit">10:00</span></div><div class="termin-details"><strong>Klinikum Lippetal</strong><span>Jahresgespr\u00E4ch CFO Dr. Weinert</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Mo, 13.01.</span><span class="termin-uhrzeit">14:00</span></div><div class="termin-details"><strong>Ev. Landeskirche Teutoburg</strong><span>Renewal-Verhandlung Geb\u00E4ude</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Di, 14.01.</span><span class="termin-uhrzeit">09:30</span></div><div class="termin-details"><strong>Nordlicht Automatisierung</strong><span>Cyber-Risiko Workshop</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Mi, 15.01.</span><span class="termin-uhrzeit">11:00</span></div><div class="termin-details"><strong>Nordwest Cargo</strong><span>Flottenversicherung Review</span></div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                        ' Schnellaktionen</h3></div>' +
                    '<div class="formulare-grid">' +
                        '<button class="formular-btn" onclick="showMaklerTab(\'potentiale\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Potentiale</button>' +
                        '<button class="formular-btn" onclick="showMaklerTab(\'deckungsluecken\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Deckungsl\u00FCcken</button>' +
                        '<button class="formular-btn" onclick="showMaklerTab(\'versicherermix\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg> Versicherer-Mix</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    } catch(e) {
        container.innerHTML = '<div style="padding:24px;color:#dc2626;background:#fef2f2;border-radius:8px"><strong>Fehler beim Rendern:</strong> ' + e.message + '</div>';
    }
}
window.renderMaklerUebersicht = renderMaklerUebersicht;

// Toggle Potentiale-Detail auf der Übersichtsseite
function toggleUebersichtPotDetail(id) {
    var detail = document.getElementById(id);
    if (!detail) return;
    var arrowId = id.replace('ub-pot-', 'ub-pot-arrow-');
    var arrow = document.getElementById(arrowId);
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        if (arrow) arrow.classList.add('open');
    } else {
        detail.style.display = 'none';
        if (arrow) arrow.classList.remove('open');
    }
}
window.toggleUebersichtPotDetail = toggleUebersichtPotDetail;
