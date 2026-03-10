// Split aus agentur-overview-banking.js – A-10 Bank-Adapter und Chat-Funktionen
// Abhaengigkeiten: agentur-overview-banking.js (beraterData, bankKundenRetail, showBeraterTab, etc.)

// ── NAVIGATE TO KUNDEN DETAIL ──
// Redirects to unified A-10 page instead of separate B-10
function openBankKundenDetail(kundenName, kundenId) {
    // Track that we came from berater overview (B-02)
    if (typeof previousViewBeforeKundenDetail !== 'undefined') {
        previousViewBeforeKundenDetail = 'beraterOverview';
    }

    // Update A-02 header to show berater info (so updateKundenSharedHeader copies it to A-10)
    var titleEl = document.getElementById('agenturPageTitle');
    var subtitleId = document.getElementById('agenturIdHeader');
    if (titleEl) titleEl.textContent = 'Beraterin: ' + beraterData.name;
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        if (subtitleDiv) {
            subtitleDiv.innerHTML = '<span id="agenturIdHeader">' + beraterData.id + '</span> | <span id="agenturStatusHeader">Aktiv</span>';
        }
    }

    // Copy berater photo to agentur photo (so A-10 shared header picks it up)
    var srcImg = document.getElementById('beraterPhotoImgSmall');
    var destImg = document.getElementById('agenturPhotoImgSmall');
    if (srcImg && destImg && srcImg.style.display !== 'none') {
        destImg.src = srcImg.src;
        destImg.style.display = 'block';
    }

    // Populate A-10 dropdown with bank customers
    populateA10BankDropdown();

    // Open unified A-10 customer detail page
    openKundenDetail(kundenName, kundenId || 'KDB000');

    // After A-10 loads, fill bank-specific data
    setTimeout(function() {
        if (typeof fillBankKundenDetail === 'function') {
            fillBankKundenDetail(kundenName);
        }
        // Adapt A-10 tabs for bank mode
        adaptA10ForBankMode(kundenName);
    }, 100);
}

// Populate A-10 customer dropdown with bank customers
function populateA10BankDropdown() {
    var select = document.getElementById('kundenSwitchSelect');
    if (!select) return;

    // Get list of bank customers based on viewMode
    var customers = [];
    if (typeof viewMode !== 'undefined') {
        if (viewMode === 'bank-retail' && typeof bankKundenRetail !== 'undefined') {
            customers = bankKundenRetail;
        } else if (viewMode === 'bank-fk' && typeof bankKundenFK !== 'undefined') {
            customers = bankKundenFK;
        } else if (viewMode === 'bank-vw' && typeof bankKundenVW !== 'undefined') {
            customers = bankKundenVW;
        }
    }

    if (customers.length > 0) {
        select.innerHTML = '';
        customers.forEach(function(k) {
            var opt = document.createElement('option');
            opt.value = k.name;
            opt.textContent = k.name;
            select.appendChild(opt);
        });
    }
}

// Adapt A-10 page tabs and content for bank mode
function adaptA10ForBankMode(kundenName) {
    var kundenPage = document.getElementById('kundenDetailPage');
    if (!kundenPage) return;

    kundenPage.classList.add('bank-mode');

    // Update institution logo, name, standort for banking mode
    if (typeof updateA10InstitutInfo === 'function') {
        updateA10InstitutInfo();
    }

    // Update shared header title/photo for banking berater
    var headerTitle = document.getElementById('kundenHeaderTitle');
    if (headerTitle) headerTitle.textContent = 'Beraterin: ' + beraterData.name;
    var headerId = document.getElementById('kundenHeaderId');
    if (headerId) headerId.textContent = beraterData.id;

    // Rename "Betreute Verträge" tab to "Konten & Produkte"
    var vertraegeTab = kundenPage.querySelector('.kunden-tab[data-tab="vertraege"]');
    if (vertraegeTab) {
        vertraegeTab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Konten & Produkte';
    }

    // Fill bank stammdaten into A-10 elements
    var kd = null;
    if (typeof bankMockKunden !== 'undefined') {
        kd = bankMockKunden[kundenName];
    }
    if (!kd) return;

    // Override A-10 stammdaten with bank data
    var nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    // Set customer photo
    var fotoEl = document.querySelector('#kundenDetailPage .kunden-foto');
    if (fotoEl) {
        var fotoPath = (typeof bankKundenFotos !== 'undefined') ? bankKundenFotos[kundenName] : null;
        if (!fotoPath && kd.foto) fotoPath = kd.foto;
        if (fotoPath) {
            fotoEl.innerHTML = '<img src="' + fotoPath + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentNode.innerHTML=\'<svg viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;><path d=&quot;M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2&quot;></path><circle cx=&quot;12&quot; cy=&quot;7&quot; r=&quot;4&quot;></circle></svg>\'">';
        }
    }

    // Set customer ID
    var idEl = document.getElementById('kundenVermittlerId');
    if (idEl) {
        var retailData = null;
        if (typeof bankKundenRetail !== 'undefined') {
            for (var ri = 0; ri < bankKundenRetail.length; ri++) {
                if (bankKundenRetail[ri].name === kundenName) { retailData = bankKundenRetail[ri]; break; }
            }
        }
        idEl.textContent = retailData ? retailData.id : (kd.id || 'KDB000');
    }

    // Fill CLV data (header + detail card)
    if (typeof calculateBankCLV === 'function') {
        var retailForClv = null;
        if (typeof bankKundenRetail !== 'undefined') {
            for (var ci = 0; ci < bankKundenRetail.length; ci++) {
                if (bankKundenRetail[ci].name === kundenName) { retailForClv = bankKundenRetail[ci]; break; }
            }
        }
        var clv = calculateBankCLV(kd, retailForClv);
        // Header badge
        var clvValEl = document.getElementById('clvHeaderValue');
        if (clvValEl) clvValEl.textContent = '\u20AC' + clv.value.toLocaleString('de-DE');
        var clvSegEl = document.getElementById('clvHeaderSegment');
        if (clvSegEl) clvSegEl.textContent = clv.segment;
        // CLV detail card elements
        var clvTotalEl = document.getElementById('clvTotalValue');
        if (clvTotalEl) clvTotalEl.textContent = '\u20AC' + clv.value.toLocaleString('de-DE');
        var clvSegmentEl = document.getElementById('clvSegmentValue');
        if (clvSegmentEl) {
            clvSegmentEl.textContent = clv.segment;
            clvSegmentEl.className = 'clv-segment-value ' + clv.segment.toLowerCase();
        }
        var clvHaltedauerEl = document.getElementById('clvHaltedauerValue');
        if (clvHaltedauerEl) clvHaltedauerEl.textContent = clv.haltedauer + ' Jahre';
        var clvStornoEl = document.getElementById('clvStornoValue');
        if (clvStornoEl) {
            clvStornoEl.textContent = clv.churnRisk + '%';
            var stornoLevel = clv.churnRisk <= 8 ? 'low' : (clv.churnRisk <= 15 ? 'medium' : 'high');
            clvStornoEl.className = 'clv-storno-value ' + stornoLevel;
        }
        // CLV trend
        var clvTrendEl = document.getElementById('clvTotalTrend');
        if (clvTrendEl) clvTrendEl.textContent = '';
        // CLV breakdown for banking
        var breakdownEl = document.getElementById('clvBreakdownRows');
        if (breakdownEl) {
            var ertrag = retailForClv ? retailForClv.ertrag : 2000;
            breakdownEl.innerHTML =
                '<div class="clv-row"><span class="clv-row-label">Jahresertrag</span><span class="clv-row-calc">\u20AC' + ertrag.toLocaleString('de-DE') + '/Jahr</span><span class="clv-row-value">\u20AC' + ertrag.toLocaleString('de-DE') + '</span></div>' +
                '<div class="clv-row"><span class="clv-row-label">\u00d7 Progn. Haltedauer</span><span class="clv-row-calc">' + clv.haltedauer + ' Jahre</span><span class="clv-row-value">\u20AC' + (ertrag * clv.haltedauer).toLocaleString('de-DE') + '</span></div>' +
                '<div class="clv-row"><span class="clv-row-label">\u00d7 Margen-Faktor</span><span class="clv-row-calc">85%</span><span class="clv-row-value"></span></div>' +
                '<div class="clv-row negative"><span class="clv-row-label">\u2212 Abwanderungsrisiko</span><span class="clv-row-calc">' + clv.churnRisk + '%</span><span class="clv-row-value"></span></div>' +
                '<div class="clv-row total"><span class="clv-row-label">= Customer Lifetime Value</span><span class="clv-row-calc"></span><span class="clv-row-value">\u20AC' + clv.value.toLocaleString('de-DE') + '</span></div>';
        }
    }

    // Fill Kinder
    var kinderEl = document.getElementById('kundenKinder');
    if (kinderEl && kd.kinder) {
        if (kd.kinder.length === 0) {
            kinderEl.innerHTML = '<span style="color:#94a3b8;">Keine</span>';
        } else {
            kinderEl.innerHTML = kd.kinder.map(function(k) { return '<span class="kinder-badge">' + k.name + ' (' + k.alter + ' Jahre)</span>'; }).join('');
        }
    }

    var fields = {
        'kundenGeburtsdatum': kd.geburtsdatum,
        'kundenAdresse': kd.adresse,
        'kundenTelefon': kd.telefon,
        'kundenEmail': kd.email,
        'kundenBeruf': kd.beruf,
        'kundenFamilienstand': kd.familienstand,
        'kundenArbeitgeber': kd.arbeitgeber,
        'kundenBeschaeftigt': kd.beschaeftigtSeit,
        'kundenEinkommen': '\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '/Mon.'
    };
    for (var id in fields) {
        var el = document.getElementById(id);
        if (el) el.textContent = fields[id];
    }

    // Fill Konten & Produkte (reuse vertraege tab content)
    var kontenBody = document.getElementById('kundenVertraege');
    if (kontenBody && kd.konten) {
        kontenBody.innerHTML = '';
        kd.konten.forEach(function(k) {
            var saldo = typeof k.saldo === 'number' ? (k.saldo < 0 ? '-' : '') + '\u20AC' + Math.abs(k.saldo).toLocaleString('de-DE') : k.saldo;
            var statusClass = k.status === 'Aktiv' ? 'aktiv' : 'storniert';
            kontenBody.innerHTML += '<tr><td>' + k.produkt + '</td><td>' + k.details + '</td><td class="text-right">' + saldo + '</td><td>' + k.eroeffnung + '</td><td><span class="status-badge ' + statusClass + '">' + k.status + '</span></td></tr>';
        });
    }

    // Replace Potentiale tab (tabImpulse) content with banking potentials
    var tabImpulse = document.getElementById('tabImpulse');
    if (tabImpulse) {
        // Save original content for restore
        if (!tabImpulse.dataset.originalHtml) {
            tabImpulse.dataset.originalHtml = 'saved';
            tabImpulse._originalInnerHTML = tabImpulse.innerHTML;
        }

        var bankPot = (window.bankPotentiale || []).filter(function(p) { return p.kundenName === kundenName; });

        // Separate into Whitespots (new business) and \u00c4nderungsgesch\u00e4ft (optimization)
        var whitespots = [];
        var aenderung = [];
        bankPot.forEach(function(p) {
            if (p.status === 'identifiziert' || p.status === 'angeschrieben') {
                whitespots.push(p);
            } else {
                aenderung.push(p);
            }
        });

        // Also build cross-selling insurance potentials as Whitespots
        if (!kd.versicherungenEigen || !kd.versicherungenEigen.some(function(v){ return v.versicherung.indexOf('BU') >= 0 || v.versicherung.indexOf('Berufsunf') >= 0; })) {
            whitespots.push({
                produkt: 'BU-Versicherung (R+V Verbundpartner)',
                beschreibung: 'Keine Berufsunf\u00e4higkeitsversicherung vorhanden. Absicherungsl\u00fccke bei Nettoeinkommen \u20AC' + (kd.nettoeinkommen || 0).toLocaleString('de-DE') + '/Mon.',
                prioritaet: 'hoch', quelle: 'Verbundpartner R+V', volumen: 1800, ertrag: 360,
                herleitung: [{ datenquelle: 'Bestandsanalyse', erkenntnis: 'Keine BU-Versicherung trotz hohem Einkommen' }, { datenquelle: 'R+V Verbundpartner', erkenntnis: 'R+V BU Premium mit Nachversicherungsgarantie empfohlen' }]
            });
        }
        // Cross-sell external insurance to R+V
        if (kd.versicherungenFremd) {
            kd.versicherungenFremd.forEach(function(v) {
                aenderung.push({
                    produkt: v.versicherung + ' \u2013 Wechsel zu R+V',
                    beschreibung: 'Aktuell bei ' + v.anbieter + ' (' + v.praemie + '). Pr\u00fcfung R+V Verbundpartner-Tarif.',
                    prioritaet: 'mittel', quelle: 'Verbundpartner', volumen: 0, ertrag: 0,
                    herleitung: [{ datenquelle: 'Open Finance', erkenntnis: v.versicherung + ' bei ' + v.anbieter + ', ' + v.praemie }]
                });
            });
        }
        // FIDA-based opportunities as \u00c4nderungsgesch\u00e4ft
        if (kd.fidaVertraege && kd.fidaVertraege.length > 0) {
            kd.fidaVertraege.forEach(function(f) {
                aenderung.push({
                    produkt: f.institut + ' \u2013 ' + f.typ + ' konsolidieren',
                    beschreibung: f.info + '. Konsolidierung in VR-Produkte pr\u00fcfen.',
                    prioritaet: 'mittel', quelle: 'Open Finance', volumen: 0, ertrag: 0,
                    herleitung: [{ datenquelle: 'Open Finance (FIDA)', erkenntnis: f.institut + ': ' + f.info }]
                });
            });
        }

        var potHtml = '<div class="kunden-card impulse-overview-card">' +
            '<div class="kunden-card-header vertriebsimpuls"><h2>' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
                ' Potentiale</h2></div>' +
            '<div class="impuls-legende">' +
                '<span class="impuls-legende-item"><span class="impuls-volumen-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Abschlussvolumen</span> Gesch. Volumen bei Abschluss</span>' +
                '<span class="impuls-legende-item"><span class="impuls-provision-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Provision</span> Erwartete Abschlussprovision</span>' +
            '</div>';

        function renderBankPotCard(p, idx, prefix) {
            var pc = p.prioritaet === 'hoch' ? 'high' : (p.prioritaet === 'mittel' ? 'medium' : 'low');
            var pl = p.prioritaet === 'hoch' ? 'Hohe Priorit\u00e4t' : (p.prioritaet === 'mittel' ? 'Mittlere Priorit\u00e4t' : 'Niedrige Priorit\u00e4t');
            var vol = p.volumen ? '\u20AC' + p.volumen.toLocaleString('de-DE') : '';
            var ert = p.ertrag ? '\u20AC' + p.ertrag.toLocaleString('de-DE') : '';
            var detailId = prefix + '-' + idx;
            var h = '<div class="impuls-item highlight clickable" onclick="toggleImpulsDetail(\'' + detailId + '\')">' +
                '<div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>' +
                '<div class="impuls-text"><strong>' + p.produkt + '</strong>' +
                    '<p>' + (p.quelle ? '<span class="fida-source-badge small">' + p.quelle + '</span> ' : '') + p.beschreibung + '</p></div>' +
                '<div style="text-align:right;flex-shrink:0;">' +
                    (vol ? '<div class="impuls-volumen-badge">' + vol + '</div>' : '') +
                    (ert ? '<div class="impuls-provision-badge">' + ert + '</div>' : '') +
                '</div>' +
                '<span class="impuls-priority ' + pc + '">' + pl + '</span>' +
                '<span class="impuls-expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg></span>' +
            '</div>';
            h += '<div class="impuls-detail" id="' + detailId + '" style="display:none;"><div class="impuls-detail-section"><h4>Herleitung</h4><div class="herleitung-grid">';
            if (p.herleitung) {
                p.herleitung.forEach(function(hl) {
                    h += '<div class="herleitung-item"><span class="herleitung-label">' + hl.datenquelle + '</span><span class="herleitung-value">' + hl.erkenntnis + '</span></div>';
                });
            }
            h += '</div></div></div>';
            return h;
        }

        // Whitespots (Neugeschäft) - always render category (KI impulses may add items)
        potHtml += '<div class="impuls-kategorie" id="bankWhitespotsKategorie"><h3 class="impuls-kategorie-title whitespots">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' +
            ' Whitespots (Neugeschäft) <span class="kategorie-badge">Produkt fehlt</span></h3>';
        whitespots.forEach(function(p, i) { potHtml += renderBankPotCard(p, i, 'bank-ws'); });
        potHtml += '<div id="kiImpulseInlineWS"></div>';
        potHtml += '</div>';

        // Änderungsgeschäft (Optimierung bestehend) - always render category
        potHtml += '<div class="impuls-kategorie" id="bankAenderungKategorie"><h3 class="impuls-kategorie-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
            ' Anpassungsbedarfe (Änderungsgeschäft) <span class="kategorie-badge">Bestehend optimieren</span></h3>';
        aenderung.forEach(function(p, i) { potHtml += renderBankPotCard(p, i, 'bank-ae'); });
        potHtml += '<div id="kiImpulseInlineAE"></div>';
        potHtml += '</div>';

        potHtml += '</div>';
        tabImpulse.innerHTML = potHtml;

        // Trigger KI impulse generation into inline containers
        setTimeout(function() {
            if (typeof generateKIImpuls === 'function') generateKIImpuls();
        }, 100);
    }

    // Adapt shared header tabs for bank module
    adaptA10HeaderTabsForBank();
}

// Adapt A-10 shared header tabs for bank navigation
function adaptA10HeaderTabsForBank() {
    var headerTabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (!headerTabs) return;

    headerTabs.innerHTML = '' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'uebersicht\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Übersicht' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'stammdaten\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Stammdaten' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'neugeschaeft\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg> Neugeschäft' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'ertraege\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="bold">\u20AC</text></svg> Erträge' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'qualitaet\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Qualität' +
        '</button>' +
        '<div class="agentur-tab-divider"></div>' +
        '<button class="agentur-tab active" onclick="navigateToBeraterTabFromA10(\'kundenliste\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg> Kunden' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'potentiale\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Potentiale' +
        '</button>';
}

// Navigate from A-10 back to B-02 berater tab
function navigateToBeraterTabFromA10(tabName) {
    document.getElementById('kundenDetailPage').style.display = 'none';
    restoreA10InsuranceMode();

    var beraterPage = document.getElementById('beraterOverviewPage');
    var agenturOverview = document.getElementById('agenturOverview');

    if (agenturOverview && agenturOverview.querySelector('#beraterOverviewPage')) {
        agenturOverview.style.display = 'block';
    } else if (beraterPage) {
        beraterPage.style.display = 'block';
    } else if (agenturOverview) {
        agenturOverview.style.display = 'block';
    }

    if (typeof showBeraterTab === 'function') {
        showBeraterTab(tabName);
    }

    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'beraterOverview' } }));
}

// Restore A-10 to insurance mode when leaving bank context
function restoreA10InsuranceMode() {
    var kundenPage = document.getElementById('kundenDetailPage');
    if (!kundenPage || !kundenPage.classList.contains('bank-mode')) return;

    kundenPage.classList.remove('bank-mode');

    // Restore institution logo, name, standort for insurance mode
    if (typeof updateA10InstitutInfo === 'function') {
        updateA10InstitutInfo();
    }

    // Restore shared header title/photo for insurance vermittler
    var headerTitle = document.getElementById('kundenHeaderTitle');
    var agenturTitle = document.getElementById('agenturPageTitle');
    if (headerTitle) headerTitle.textContent = agenturTitle ? agenturTitle.textContent : 'Agentur: Maria Musterfrau';
    var headerId = document.getElementById('kundenHeaderId');
    var agenturId = document.getElementById('agenturIdHeader');
    if (headerId) headerId.textContent = agenturId ? agenturId.textContent : 'VM00001';

    // Restore "Betreute Verträge" tab label
    var vertraegeTab = kundenPage.querySelector('.kunden-tab[data-tab="vertraege"]');
    if (vertraegeTab) {
        vertraegeTab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Betreute Verträge';
    }

    // Restore Potentiale tab (tabImpulse) original content
    var tabImpulse = document.getElementById('tabImpulse');
    if (tabImpulse && tabImpulse._originalInnerHTML) {
        tabImpulse.innerHTML = tabImpulse._originalInnerHTML;
        delete tabImpulse._originalInnerHTML;
        delete tabImpulse.dataset.originalHtml;
    }

    // Restore A-10 dropdown with insurance customers
    restoreA10InsuranceDropdown();

    // Restore A-02 header tabs
    restoreA10InsuranceHeaderTabs();
}

function restoreA10InsuranceDropdown() {
    var select = document.getElementById('kundenSwitchSelect');
    if (!select) return;
    var insuranceCustomers = ['Peter Schmidt','Amira König','Thomas Weber','Anna Hoffmann','Michael Braun','Lisa Müller','Klaus Meier','Matthias Engel','Christian Bauer','Martin Wolf','Eva Hartmann'];
    select.innerHTML = '';
    insuranceCustomers.forEach(function(name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}

function restoreA10InsuranceHeaderTabs() {
    var headerTabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (!headerTabs) return;

    headerTabs.innerHTML = '' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'uebersicht\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Übersicht' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'stammdaten\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Stammdaten' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'neugeschaeft\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg> Neugeschäft' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'bestand\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path></svg> Bestand' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'storno\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Storno' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'provision\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="bold">\u20AC</text></svg> Vergütung' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'qualitaet\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Qualität' +
        '</button>' +
        '<div class="agentur-tab-divider"></div>' +
        '<button class="agentur-tab active" onclick="navigateToAgenturTab(\'kundenliste\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg> Kunden' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'potential\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Potentiale' +
        '</button>';
}

function closeBankKundenDetail() {
    // Now A-10 is used for bank customers too, so close it and restore insurance mode
    document.getElementById('kundenDetailPage').style.display = 'none';
    restoreA10InsuranceMode();

    // Return to A-02 (merged) if available, otherwise standalone B-02
    var agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) {
        agenturOverview.style.display = 'block';
    } else {
        var beraterPage = document.getElementById('beraterOverviewPage');
        if (beraterPage) beraterPage.style.display = 'block';
    }
    showBeraterTab('kundenliste');
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'beraterOverview' } }));
}

function switchBankKundeDropdown(kundenName) {
    openBankKundenDetail(kundenName);
}

function navigateToBeraterTab(tabName) {
    closeBankKundenDetail();
    showBeraterTab(tabName);
}

function resetBeraterDemoData() {
    localStorage.removeItem('beraterPhoto');
    localStorage.removeItem('bankViewMode');
    bankViewMode = 'retail';
    // Clear dynamically filled tabs
    ['berater-tab-stammdaten','berater-tab-ertraege','berater-tab-qualitaet','berater-tab-potentiale','berater-tab-kreditportfolio','berater-tab-branchenmix','berater-tab-portfolioallokation','berater-tab-performance','berater-tab-nachfolge'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    showBeraterOverview();
}

// ── CHAT FUNCTIONS ──
function toggleBeraterChat() {
    var widget = document.getElementById('beraterChatWidget');
    if (!widget) return;
    var isVisible = widget.style.display !== 'none';
    widget.style.display = isVisible ? 'none' : 'flex';
}

function sendBeraterChatMessage() {
    var input = document.getElementById('beraterChatInput');
    var body = document.getElementById('beraterChatBody');
    if (!input || !body) return;
    var question = input.value.trim();
    if (!question) return;
    
    // Hide welcome
    var welcome = body.querySelector('.berater-chat-welcome');
    if (welcome) welcome.style.display = 'none';
    
    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="message-content">' + escapeHtmlBerater(question) + '</div>';
    body.appendChild(userMsg);
    input.value = '';
    body.scrollTop = body.scrollHeight;
    
    // Typing indicator
    var typing = document.createElement('div');
    typing.className = 'chat-message bot-message typing-indicator';
    typing.innerHTML = '<div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    
    // AI response
    setTimeout(function() {
        body.removeChild(typing);
        var response = getBeraterChatResponse(question);
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai-message';
        aiMsg.innerHTML = '<div class="message-content">' + response + '</div>';
        body.appendChild(aiMsg);
        body.scrollTop = body.scrollHeight;
    }, 800);
}

function escapeHtmlBerater(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getBeraterChatResponse(question) {
    var q = question.toLowerCase();
    
    if (q.indexOf('top 5') > -1 || q.indexOf('ertragspotenzial') > -1) {
        return '<strong>Top 5 Kunden nach Ertragspotenzial</strong> <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;">Truuco Impulsmanager</span><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Klaus Fischer\',\'KDB001\')">Klaus Fischer</button> Anschlussfinanzierung DZ HYP &euro;185k<br><span class="chat-recommendation">Ertragspotenzial: &euro;2.775</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Jürgen Peters\',\'KDB011\')">Jürgen Peters</button> DZ PRIVATBANK Nachfolgeplanung<br><span class="chat-recommendation">Ertragspotenzial: &euro;5.000</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Sandra Müller\',\'KDB002\')">Sandra Müller</button> Union Investment Sparplan + VR-FinanzPlan<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.800</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Peter Hoffmann\',\'KDB005\')">Peter Hoffmann</button> VermögenPlus (Union Investment)<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.800</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Andrea Lang\',\'KDB006\')">Andrea Lang</button> VR Smart Finanz Praxiskredit<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.200</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Detailanalyse Klaus Fischer\')">Details Fischer</button><button onclick="askBeraterQuestion(\'Alle Potentiale anzeigen\')">Alle Potentiale</button><button onclick="askBeraterQuestion(\'Verbundpartner-Produkte\')">Verbundpartner</button></div>';
    }
    
    if (q.indexOf('finanzplan') > -1) {
        var ohneFinanzplan = bankKundenRetail.filter(function(k) { return !k.finanzplan; });
        var html = '<strong>Kunden ohne VR-FinanzPlan (' + ohneFinanzplan.length + '):</strong><br><br>';
        ohneFinanzplan.forEach(function(k) {
            html += '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'' + k.name + '\',\'' + k.id + '\')">' + k.name + '</button> ' + k.beruf + ', Ertrag: ' + fmtEuroBerater(k.ertrag) + '<br><span class="chat-recommendation">Potenzial: FinanzPlan-Gespräch einladen</span></div>';
        });
        html += '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Kunden nach Ertragspotenzial\')">Top 5 Ertrag</button></div>';
        return html;
    }
    
    if (q.indexOf('open finance') > -1 || q.indexOf('fida') > -1 || q.indexOf('cross-selling') > -1) {
        return '<strong>Open Finance / FIDA Analyse</strong> <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;">Data Intelligence Platform</span><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Markus Wagner\',\'KDB003\')">Markus Wagner</button> Depot bei Trade Republic (&euro;45k via FIDA)<br><span class="chat-recommendation">&rarr; Cross-Selling: VR-MeinDepot ab 4,95&euro;/Trade mit pers&ouml;nlicher Beratung</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Sandra Müller\',\'KDB002\')">Sandra Müller</button> &euro;85k Tagesgeld + Scalable Capital Depot<br><span class="chat-recommendation">&rarr; UnionDepot Sparplan + VermögenPlus Beratung</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Stefan Braun\',\'KDB009\')">Stefan Braun</button> Hauptkonto N26, Depots bei Trade Republic + Scalable<br><span class="chat-recommendation">&rarr; VR-FinanzPlan + Wero + Digitale girocard als Einstieg</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Welche Kunden brauchen FIDA-Consent?\')">FIDA-Consent</button><button onclick="askBeraterQuestion(\'Detailanalyse Markus Wagner\')">Details Wagner</button><button onclick="askBeraterQuestion(\'Verbundpartner-Produkte\')">Verbundpartner</button></div>';
    }

    if (q.indexOf('verbundpartner') > -1 || q.indexOf('verbund') > -1) {
        return '<strong>Verbundpartner-Produkte der DZ BANK Gruppe:</strong><br><br>' +
            '&bull; <strong>Union Investment</strong> \u2013 UnionDepot, VermögenPlus, Fondssparpläne ab 25&euro;/Mon.<br>' +
            '&bull; <strong>Schwäbisch Hall</strong> \u2013 FuchsImmo XS (ab 1,95%), XP, XL, FuchsEco (XE)<br>' +
            '&bull; <strong>R+V Versicherung</strong> \u2013 Vollsortiment, Mitglieder-Plus bis 10% Cashback<br>' +
            '&bull; <strong>TeamBank (easyCredit)</strong> \u2013 Raten-/Rahmenkredit, Sofortentscheidung<br>' +
            '&bull; <strong>DZ HYP / Münchener Hyp</strong> \u2013 Baufinanzierung, Forward-Darlehen<br>' +
            '&bull; <strong>DZ PRIVATBANK</strong> \u2013 Private Banking, Nachfolgeplanung<br>' +
            '&bull; <strong>VR Smart Finanz</strong> \u2013 Leasing, Mietkauf, KMU-Kredite<br>' +
            '&bull; <strong>GENO Broker</strong> \u2013 Wertpapier-Brokerage<br>' +
            '&bull; <strong>ReiseBank</strong> \u2013 Edelmetalle (Gold/Silber online)<br><br>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Ertragspotenzial\')">Top 5 Ertrag</button><button onclick="askBeraterQuestion(\'Open Finance Analyse\')">Open Finance</button></div>';
    }
    
    if (q.indexOf('abwanderung') > -1 || q.indexOf('risiko') > -1 || q.indexOf('churn') > -1) {
        return '<strong>Kunden mit Abwanderungsrisiko:</strong><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Stefan Braun\',\'KDB009\')">Stefan Braun</button> NPS: 5 (Detractor), nur 2 Produkte<br><span class="chat-recommendation">&#9888; Hohes Abwanderungsrisiko. Sofort kontaktieren.</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Julia Becker\',\'KDB004\')">Julia Becker</button> NPS: 6, kein FinanzPlan<br><span class="chat-recommendation">&#9888; Mittleres Risiko. Beziehung vertiefen.</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Ertragspotenzial\')">Ertragspotenzial</button><button onclick="askBeraterQuestion(\'FinanzPlan-Potenziale\')">FinanzPlan</button></div>';
    }
    
    // Default
    return 'Ich bin Ihr <strong>genoGPT Vertriebs-Assistent</strong> auf der Omnikanalplattform. Ich kann Ihnen helfen mit:<br><br>' +
        '&bull; <strong>Truuco Impulse</strong> \u2013 KI-gest\u00fctzte Vertriebspotentiale<br>' +
        '&bull; <strong>Open Finance / FIDA</strong> \u2013 Drittbank-Daten analysieren<br>' +
        '&bull; <strong>Verbundpartner</strong> \u2013 DZ BANK Gruppe Produkte<br>' +
        '&bull; <strong>Abwanderungsrisiken</strong> \u2013 NPS-basierte Analyse<br><br>' +
        '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Kunden nach Ertragspotenzial\')">Top 5 Ertrag</button><button onclick="askBeraterQuestion(\'Open Finance Analyse\')">Open Finance</button><button onclick="askBeraterQuestion(\'Verbundpartner-Produkte\')">Verbundpartner</button><button onclick="askBeraterQuestion(\'Zeige Kunden mit Abwanderungsrisiko\')">Abwanderung</button></div>';
}

function askBeraterQuestion(question) {
    var input = document.getElementById('beraterChatInput');
    if (input) {
        input.value = question;
        sendBeraterChatMessage();
    }
}

// ── WINDOW EXPORTS ──

// ── WINDOW EXPORTS ──
window.toggleBeraterChat = toggleBeraterChat;
window.sendBeraterChatMessage = sendBeraterChatMessage;
window.askBeraterQuestion = askBeraterQuestion;
window.openBankKundenDetail = openBankKundenDetail;
window.closeBankKundenDetail = closeBankKundenDetail;
window.switchBankKundeDropdown = switchBankKundeDropdown;
window.navigateToBeraterTab = navigateToBeraterTab;
window.resetBeraterDemoData = resetBeraterDemoData;
window.__registerModule('agentur-overview-banking-detail.js');
