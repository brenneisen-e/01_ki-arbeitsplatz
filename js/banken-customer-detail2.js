
// Update Konten & Finanzen tab - comprehensive update
function updateKontenFields(modal, customer) {
    const kontenTab = modal.querySelector('#tab-konten');
    if (!kontenTab) return;

    const isPrivat = customer.type === 'Privat';
    const isBezahlt = customer.status === 'Bezahlt';

    // Update KPI values
    const kpis = kontenTab.querySelectorAll('.finanzen-kpi');
    if (kpis.length >= 5) {
        kpis[0].querySelector('.kpi-value').textContent = customer.krediteAnzahl || (isBezahlt ? 0 : 1);
        kpis[1].querySelector('.kpi-value').textContent = '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE');
        kpis[2].querySelector('.kpi-value').textContent = '€' + (customer.monatsrate || 0).toLocaleString('de-DE');
        kpis[3].querySelector('.kpi-value').textContent = '€' + (customer.ueberfaellig || 0).toLocaleString('de-DE');
        kpis[4].querySelector('.kpi-value').textContent = (customer.rueckgabequote || 0) + '%';

        // Color coding for bezahlt
        if (isBezahlt) {
            kpis[1].querySelector('.kpi-value').style.color = '#22c55e';
            kpis[3].querySelector('.kpi-value').style.color = '#22c55e';
            kpis[4].querySelector('.kpi-value').style.color = '#22c55e';
        }
    }

    // Update Forderungen breakdown
    const forderungRows = kontenTab.querySelectorAll('.forderung-breakdown-row');
    if (forderungRows.length >= 4) {
        forderungRows[0].querySelector('.value').textContent = '€' + (customer.hauptforderung || 0).toLocaleString('de-DE');
        forderungRows[1].querySelector('.value').textContent = '€' + (customer.zinsen || 0).toLocaleString('de-DE');
        forderungRows[2].querySelector('.value').textContent = '€' + (customer.mahngebuehren || 0).toLocaleString('de-DE');
        forderungRows[3].querySelector('.value').textContent = '€' + (customer.inkassokosten || 0).toLocaleString('de-DE');
    }

    // Update credit product header and details using customer's actual products
    const productName = kontenTab.querySelector('.credit-product-name');
    const productNumber = kontenTab.querySelector('.credit-product-number');
    const saldoValue = kontenTab.querySelector('.amount-value.danger, .amount-value.success');
    const statusBadge = kontenTab.querySelector('.credit-status-badge');

    // Use customer's actual products if available
    const produkte = customer.produkte || [];
    const hauptProdukt = produkte.length > 0 ? produkte[0] : null;

    if (productName) {
        productName.textContent = hauptProdukt ? hauptProdukt.typ : (isPrivat ? 'Ratenkredit' : 'Betriebsmittelkredit');
    }
    if (productNumber) {
        productNumber.textContent = hauptProdukt ? hauptProdukt.nummer : 'Keine Daten';
    }
    if (saldoValue) {
        const saldo = hauptProdukt ? hauptProdukt.saldo : customer.restschuld;
        saldoValue.textContent = '€' + (saldo || 0).toLocaleString('de-DE');
        saldoValue.className = 'amount-value ' + (saldo === 0 ? 'success' : 'danger');
    }
    if (statusBadge) {
        if (hauptProdukt) {
            statusBadge.textContent = hauptProdukt.status;
            statusBadge.className = 'credit-status-badge ' + (hauptProdukt.badge || 'info');
        } else if (isBezahlt) {
            statusBadge.textContent = 'Beglichen';
            statusBadge.className = 'credit-status-badge success';
        } else {
            statusBadge.textContent = (customer.dpd || 0) + ' DPD';
            statusBadge.className = 'credit-status-badge ' + (customer.dpd > 30 ? 'danger' : 'warning');
        }
    }

    // Update credit product container class based on first product
    const productContainer = kontenTab.querySelector('.credit-product-large');
    if (productContainer) {
        const containerClass = hauptProdukt ? hauptProdukt.badge : (isBezahlt ? 'success' : (customer.dpd > 30 ? 'danger' : 'warning'));
        productContainer.className = 'credit-product-large ' + containerClass;
    }

    // Update table data based on product type
    const tbody = kontenTab.querySelector('.credit-tx-table tbody');
    if (tbody) {
        const produktTyp = hauptProdukt ? hauptProdukt.typ : '';
        const isKreditkarte = produktTyp.toLowerCase().includes('kreditkarte');
        const isRatenkredit = produktTyp.toLowerCase().includes('ratenkredit') || produktTyp.toLowerCase().includes('baufinanzierung');
        const isDispo = produktTyp.toLowerCase().includes('dispo');
        const rate = customer.monatsrate || 250;
        const saldo = hauptProdukt ? hauptProdukt.saldo : customer.restschuld;

        if (isBezahlt) {
            // Bezahlt: Show final payment - use letzteZahlung if available
            const zahlung = customer.letzteZahlung || {};
            const zahlungsBetrag = zahlung.betrag || rate;
            const zahlungsDatum = zahlung.datum || customer.statusText?.match(/\d{2}\.\d{2}\.\d{4}/)?.[0] || '15.12.2025';
            const zahlungsTyp = zahlung.typ || 'Schlusszahlung';
            tbody.innerHTML = `
                <tr>
                    <td>${zahlungsDatum}</td>
                    <td>${zahlungsTyp} - Kredit getilgt</td>
                    <td class="positive">+€${zahlungsBetrag.toLocaleString('de-DE')}</td>
                    <td>€0</td>
                    <td><span class="tx-badge success">Abgeschlossen</span></td>
                </tr>
                <tr>
                    <td>01.12.2025</td>
                    <td>Reguläre Ratenzahlung</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${zahlungsBetrag.toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
            `;
        } else if (isRatenkredit) {
            // Ratenkredit: Show monthly rate payments
            const dpd = customer.dpd || 0;
            const ueberfaelligClass = dpd > 0 ? 'highlight-row' : '';
            const ueberfaelligBadge = dpd > 0 ? '<span class="tx-badge danger">Überfällig</span>' : '<span class="tx-badge">Gebucht</span>';
            tbody.innerHTML = `
                <tr class="${ueberfaelligClass}">
                    <td>01.12.2025</td>
                    <td>Monatliche Rate - Fällig</td>
                    <td class="negative">-€${rate.toLocaleString('de-DE')}</td>
                    <td>€${saldo.toLocaleString('de-DE')}</td>
                    <td>${ueberfaelligBadge}</td>
                </tr>
                <tr>
                    <td>01.11.2025</td>
                    <td>Monatliche Rate</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${(saldo + rate).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>01.10.2025</td>
                    <td>Monatliche Rate</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${(saldo + rate * 2).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>01.09.2025</td>
                    <td>Monatliche Rate</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${(saldo + rate * 3).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
            `;
        } else if (isDispo) {
            // Dispo: Show account movements
            tbody.innerHTML = `
                <tr>
                    <td>18.12.2025</td>
                    <td>Abhebung Geldautomat</td>
                    <td class="negative">-€200,00</td>
                    <td>€${saldo.toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>15.12.2025</td>
                    <td>Gehaltseingang</td>
                    <td class="positive">+€${(customer.einkommenMonatlich || 2500).toLocaleString('de-DE')}</td>
                    <td>€${(saldo - 200).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>10.12.2025</td>
                    <td>Lastschrift Miete</td>
                    <td class="negative">-€950,00</td>
                    <td>€${(saldo + 2300).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
            `;
        }
        // Kreditkarte: Keep default HTML content (purchases)
    }

    // Update Einkommen & Ausgaben section - show/hide based on data availability
    const eaSection = kontenTab.querySelector('.einkommen-ausgaben-compact');
    if (eaSection) {
        if (customer.einkommenMonatlich) {
            eaSection.style.display = 'flex';
            const einkommen = customer.einkommenMonatlich || 0;
            const ausgaben = customer.ausgabenMonatlich || 0;
            const differenz = einkommen - ausgaben;
            const differenzClass = differenz >= 0 ? 'positiv' : 'negativ';
            const differenzText = differenz >= 0 ? '+€' + differenz.toLocaleString('de-DE') : '-€' + Math.abs(differenz).toLocaleString('de-DE');

            const eaRows = eaSection.querySelectorAll('.ea-row');
            if (eaRows.length >= 3) {
                eaRows[0].querySelector('.value').textContent = '€' + einkommen.toLocaleString('de-DE');
                eaRows[1].querySelector('.value').textContent = '€' + ausgaben.toLocaleString('de-DE');
                eaRows[2].querySelector('.value').textContent = differenzText;
                eaRows[2].querySelector('.value').className = 'value ' + differenzClass;
            }

            const detailsText = eaSection.querySelector('.details-text');
            if (detailsText && customer.ausgabenDetails) {
                detailsText.textContent = customer.ausgabenDetails;
            }
        } else {
            // Hide section if no income data available
            eaSection.style.display = 'none';
        }
    }

    // Hide/show product sections based on customer's actual products
    const productSections = kontenTab.querySelectorAll('[data-product]');
    const customerProducts = customer.produkte || [];

    // Map product types to data-product attribute values
    const productTypeMap = {
        'kreditkarte': ['kreditkarte', 'credit card'],
        'dispo': ['dispo', 'dispositionskredit', 'kontokorrent', 'kontokorrentkredit'],
        'baufi': ['baufinanzierung', 'baufi', 'hypothek'],
        'ratenkredit-pkw': ['ratenkredit pkw', 'autokredit', 'kfz-kredit', 'kfz kredit'],
        'ratenkredit-moebel': ['ratenkredit möbel', 'möbelkredit']
    };

    // Get list of product types the customer has
    const customerProductTypes = customerProducts.map(p => p.typ.toLowerCase());

    productSections.forEach(section => {
        const dataProduct = section.getAttribute('data-product');
        const matchingTypes = productTypeMap[dataProduct] || [];

        // Check if customer has this product type
        const hasProduct = customerProductTypes.some(customerType =>
            matchingTypes.some(mappedType => customerType.includes(mappedType)) ||
            (dataProduct === 'kreditkarte' && customerType.includes('ratenkredit') && !customerType.includes('pkw') && !customerType.includes('möbel'))
        );

        if (hasProduct) {
            section.style.display = '';
            // Update section with actual product data
            const matchingProduct = customerProducts.find(p => {
                const pType = p.typ.toLowerCase();
                return matchingTypes.some(mt => pType.includes(mt)) ||
                    (dataProduct === 'kreditkarte' && pType.includes('ratenkredit') && !pType.includes('pkw') && !pType.includes('möbel'));
            });
            if (matchingProduct) {
                const nameEl = section.querySelector('.credit-product-name');
                const numberEl = section.querySelector('.credit-product-number');
                const saldoEl = section.querySelector('.amount-value');
                const statusEl = section.querySelector('.credit-status-badge');

                if (nameEl) nameEl.textContent = matchingProduct.typ;
                if (numberEl) numberEl.textContent = matchingProduct.nummer;
                if (saldoEl) saldoEl.textContent = '€' + matchingProduct.saldo.toLocaleString('de-DE');
                if (statusEl) {
                    statusEl.textContent = matchingProduct.status;
                    statusEl.className = 'credit-status-badge ' + (matchingProduct.badge || 'warning');
                }

                // Hide LIMIT for products that don't have limits (Ratenkredit, Baufinanzierung, Investitionskredit, Betriebsmittelkredit)
                const produktTypLower = matchingProduct.typ.toLowerCase();
                const hasLimit = produktTypLower.includes('dispo') ||
                                 produktTypLower.includes('kontokorrent') ||
                                 produktTypLower.includes('kreditkarte');

                const amountItems = section.querySelectorAll('.amount-item');
                amountItems.forEach(item => {
                    const label = item.querySelector('.amount-label');
                    if (label && label.textContent === 'Limit') {
                        item.style.display = hasLimit ? '' : 'none';
                        // Update limit value if product has it
                        if (hasLimit && matchingProduct.limit) {
                            const limitValue = item.querySelector('.amount-value');
                            if (limitValue) limitValue.textContent = '€' + matchingProduct.limit.toLocaleString('de-DE');
                        }
                    }
                    // Update label for non-limit products: "Saldo" -> "Restschuld" for loans
                    if (label && label.textContent === 'Saldo' && !hasLimit) {
                        label.textContent = 'Restschuld';
                    }
                    // For loans with rate, show the rate
                    if (label && label.textContent === 'Rate' && matchingProduct.rate) {
                        const rateValue = item.querySelector('.amount-value');
                        if (rateValue) rateValue.textContent = '€' + matchingProduct.rate.toLocaleString('de-DE') + '/M';
                    }
                });

                // Dynamically populate transaction table for this product
                const tableBody = section.querySelector('.credit-tx-table tbody');
                if (tableBody) {
                    // Filter transactions relevant to this product
                    const productTransactions = generateProductTransactions(matchingProduct, customer);
                    tableBody.innerHTML = productTransactions;
                }

                // Hide chart view, show table view
                const chartView = section.querySelector('.chart-view');
                const tableView = section.querySelector('.table-view');
                if (chartView) chartView.classList.remove('active');
                if (tableView) tableView.classList.add('active');
            }
        } else {
            section.style.display = 'none';
        }
    });

    // Populate "Letzte Transaktionen" from customer.transaktionen
    const txCompactList = kontenTab.querySelector('#tx-compact-list');
    if (txCompactList) {
        if (customer.transaktionen && customer.transaktionen.length > 0) {
            txCompactList.innerHTML = customer.transaktionen.map(tx => {
                const statusClass = tx.status === 'ueberfaellig' ? 'failed' :
                                   tx.status === 'rueckgabe' ? 'failed' :
                                   tx.status === 'gebucht' ? 'success' : '';
                const statusBadge = tx.status === 'ueberfaellig' ? 'Überfällig' :
                                   tx.status === 'rueckgabe' ? 'Rückgabe' :
                                   tx.status === 'gebucht' ? 'Gebucht' : tx.status;
                const amountClass = tx.betrag < 0 ? 'negative' : 'positive';
                const amountSign = tx.betrag < 0 ? '-' : '+';
                const amountValue = Math.abs(tx.betrag).toLocaleString('de-DE');

                return `
                    <div class="tx-compact-item ${statusClass}">
                        <span class="tx-date">${tx.datum}</span>
                        <span class="tx-desc">${tx.beschreibung}</span>
                        <span class="tx-amount ${amountClass}">${amountSign}€${amountValue}</span>
                        <span class="tx-status-badge ${statusClass}">${statusBadge}</span>
                    </div>
                `;
            }).join('');
        } else if (isBezahlt) {
            // Bezahlte Kunden: Keine ausstehenden Transaktionen
            txCompactList.innerHTML = `
                <div class="tx-compact-item success">
                    <span class="tx-date">${customer.letzteZahlung?.datum || '15.12.2025'}</span>
                    <span class="tx-desc">${customer.letzteZahlung?.typ || 'Schlusszahlung'}</span>
                    <span class="tx-amount positive">+€${(customer.letzteZahlung?.betrag || customer.monatsrate || 0).toLocaleString('de-DE')}</span>
                    <span class="tx-status-badge success">Gebucht</span>
                </div>
            `;
        } else {
            // Fallback: Generic transaction based on customer data
            txCompactList.innerHTML = `
                <div class="tx-compact-item ${customer.dpd > 0 ? 'failed' : 'success'}">
                    <span class="tx-date">01.12.2025</span>
                    <span class="tx-desc">Monatliche Zahlung</span>
                    <span class="tx-amount ${customer.dpd > 0 ? 'negative' : 'positive'}">${customer.dpd > 0 ? '-' : '+'}€${(customer.monatsrate || 0).toLocaleString('de-DE')}</span>
                    <span class="tx-status-badge ${customer.dpd > 0 ? 'failed' : 'success'}">${customer.dpd > 0 ? 'Überfällig' : 'Gebucht'}</span>
                </div>
            `;
        }
    }
}

// Update Kommunikation tab with KI summary and dynamic timeline
function updateKommunikationFields(modal, customer) {
    const kommTab = modal.querySelector('#tab-kommunikation');
    if (!kommTab) return;

    const isBezahlt = customer.status === 'Bezahlt';
    const isInkasso = customer.status === 'Inkasso';
    const anrede = customer.type === 'Gewerbe' ? 'Sehr geehrte Damen und Herren' :
                   (customer.ansprechpartner?.includes(',') ? 'Sehr geehrte Frau ' + customer.ansprechpartner.split(',')[0] :
                    'Sehr geehrter Herr ' + (customer.ansprechpartner?.split(' ').pop() || customer.name.split(' ').pop()));

    // Update workflow status
    const statusValue = kommTab.querySelector('.status-value');
    if (statusValue) {
        statusValue.textContent = customer.workflowStatus || 'Offen';
        statusValue.className = 'status-value ' + (isBezahlt ? 'success' : isInkasso ? 'inkasso' : 'offen');
    }

    // Add or update KI summary at the top of Kommunikation
    let kiSummary = kommTab.querySelector('.kommunikation-ki-summary');
    if (!kiSummary) {
        kiSummary = document.createElement('div');
        kiSummary.className = 'kommunikation-ki-summary';
        const header = kommTab.querySelector('.kommunikation-header');
        if (header) {
            header.after(kiSummary);
        }
    }

    const mahnstufeText = customer.mahnstufe > 0 ? 'Mahnstufe ' + customer.mahnstufe : 'Keine Mahnungen';
    const statusClass = isBezahlt ? 'success' : isInkasso ? 'danger' : 'warning';

    kiSummary.innerHTML = '<div class="ki-summary-mini"><div class="ki-summary-header-mini"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"></path></svg><span>KI-Zusammenfassung der Kommunikation</span></div><div class="ki-summary-content-mini"><p><strong>' + customer.name + '</strong> - ' + (customer.kernproblem || 'Keine Analyse verfügbar.') + '</p><div class="ki-summary-stats"><span class="stat-item ' + statusClass + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle></svg>' + (customer.workflowStatus || 'Offen') + '</span><span class="stat-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' + mahnstufeText + '</span><span class="stat-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' + (customer.dpd || 0) + ' DPD</span></div></div></div>';

    // Replace entire timeline based on customer status
    const timeline = kommTab.querySelector('.kommunikation-timeline');
    if (timeline) {
        if (isBezahlt) {
            // Success story timeline
            timeline.innerHTML = '<h4>Kommunikationshistorie</h4>' +
                '<div class="komm-item letter success"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type success">Zahlungsbestätigung</span><span class="komm-date">' + (customer.statusText?.match(/\\d{2}\\.\\d{2}\\.\\d{4}/)?.[0] || '16.12.2025') + '</span></div><div class="komm-body"><p><strong>Betreff:</strong> Bestätigung vollständiger Zahlung</p><div class="komm-preview">' + anrede + ',<br><br>wir bestätigen den vollständigen Eingang Ihrer Zahlung. Ihr Konto ist damit ausgeglichen.<br><br>Vielen Dank für die Begleichung der offenen Forderung. Der Fall ist hiermit abgeschlossen.</div></div><div class="komm-meta"><span class="meta-item success">Abgeschlossen</span></div></div></div>' +
                '<div class="komm-item phone success"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">Telefonat</span><span class="komm-date">' + new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p>Erfolgreiches Gespräch - Zahlungsvereinbarung getroffen</p><div class="komm-note"><strong>Notiz:</strong> Kunde hat zugesagt, die offene Forderung bis Ende der Woche vollständig zu begleichen.</div></div><div class="komm-meta"><span class="meta-item success">Vereinbarung erzielt</span><span class="meta-item">Bearbeiter: E. Brenneisen</span></div></div></div>';
        } else if (isInkasso) {
            // Inkasso timeline - keep existing but update names
            const kommItems = kommTab.querySelectorAll('.komm-preview');
            kommItems.forEach(item => {
                let text = item.innerHTML;
                text = text.replace(/Herr Mueller/g, customer.type === 'Gewerbe' ? 'Firma ' + customer.name : customer.ansprechpartner || customer.name);
                text = text.replace(/Mueller GmbH/g, customer.name);
                text = text.replace(/h\.mueller@mueller-gmbh\.de/g, customer.email || 'kunde@email.de');
                text = text.replace(/mueller-gmbh\.de/g, customer.email ? customer.email.split('@')[1] : 'email.de');
                item.innerHTML = text;
            });
        } else if (customer.zahlungszusage) {
            // Case with Zahlungszusage - show promise in timeline
            const zusage = customer.zahlungszusage;
            timeline.innerHTML = '<h4>Kommunikationshistorie</h4>' +
                '<div class="komm-item phone success"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type" style="background: #8b5cf6; color: white;">Zahlungszusage</span><span class="komm-date">' + zusage.vereinbart + '</span></div><div class="komm-body"><p><strong>Vereinbart:</strong> €' + zusage.betrag.toLocaleString('de-DE') + ' bis ' + zusage.datum + '</p><div class="komm-note"><strong>Notiz:</strong> ' + zusage.notiz + '</div></div><div class="komm-meta"><span class="meta-item" style="background: #f3e8ff; color: #7c3aed;">Zusage offen - Fällig am ' + zusage.datum + '</span><span class="meta-item">Bearbeiter: E. Brenneisen</span></div></div></div>' +
                '<div class="komm-item letter"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">2. Mahnung</span><span class="komm-date">' + new Date(Date.now() - 5*24*60*60*1000).toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p><strong>Betreff:</strong> Zweite Zahlungserinnerung</p><div class="komm-preview">' + anrede + ',<br><br>trotz unserer ersten Erinnerung ist die fällige Zahlung von <strong>€' + (customer.ueberfaellig || customer.restschuld || 0).toLocaleString('de-DE') + '</strong> noch nicht eingegangen. Bitte begleichen Sie den Betrag umgehend.</div></div><div class="komm-meta"><span class="meta-item">Automatisch versendet</span></div></div></div>' +
                '<div class="komm-item system"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">System</span><span class="komm-date">' + (customer.zahlungsziel || '01.12.2025') + '</span></div><div class="komm-body"><p>Fall automatisch erstellt - Zahlung überfällig seit Fälligkeit ' + (customer.zahlungsziel || '01.12.2025') + '</p></div><div class="komm-meta"><span class="meta-item">Automatisch</span></div></div></div>';
        } else {
            // New case timeline without Zahlungszusage
            timeline.innerHTML = '<h4>Kommunikationshistorie</h4>' +
                '<div class="komm-item letter"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">Zahlungserinnerung</span><span class="komm-date">' + new Date().toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p><strong>Betreff:</strong> Freundliche Zahlungserinnerung</p><div class="komm-preview">' + anrede + ',<br><br>bei Überprüfung unserer Konten haben wir festgestellt, dass die fällige Rate noch nicht eingegangen ist. Wir bitten Sie, den offenen Betrag von <strong>€' + (customer.restschuld || 0).toLocaleString('de-DE') + '</strong> zeitnah zu überweisen.<br><br>Sollte sich Ihre Zahlung mit diesem Schreiben überschneiden, betrachten Sie dieses bitte als gegenstandslos.</div></div><div class="komm-meta"><span class="meta-item">Automatisch versendet</span></div></div></div>' +
                '<div class="komm-item system"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">System</span><span class="komm-date">' + new Date(Date.now() - 3*24*60*60*1000).toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p>Fall automatisch erstellt - Zahlung überfällig seit ' + (customer.dpd || 0) + ' Tagen</p></div><div class="komm-meta"><span class="meta-item">Automatisch</span></div></div></div>';
        }
    }

    // Update email from field if it exists
    const metaFrom = kommTab.querySelector('.komm-item.incoming .komm-meta .meta-item');
    if (metaFrom && customer.email) {
        metaFrom.textContent = 'Von: ' + customer.email;
    }
}

// Update KI-Analyse tab - comprehensive update
function updateKiAnalyseFields(modal, customer) {
    const kiTab = modal.querySelector('#tab-ki-analyse');
    if (!kiTab) return;

    const isBezahlt = customer.status === 'Bezahlt';
    const isInkasso = customer.status === 'Inkasso';

    // Update all KI summary sections
    const summaryContent = kiTab.querySelector('.ki-summary-content');
    if (summaryContent) {
        const sections = summaryContent.querySelectorAll('.ki-summary-section');

        // Kernproblem section
        if (sections[0]) {
            const p = sections[0].querySelector('p');
            if (p) {
                if (isBezahlt) {
                    p.innerHTML = '<strong>Fall abgeschlossen.</strong> ' + customer.name + ' hat die Forderung vollständig beglichen. Gute Kooperationsbereitschaft nach Kontaktaufnahme.';
                } else {
                    p.innerHTML = customer.kernproblem || 'Keine Analyse verfügbar.';
                }
            }
        }

        // Letzte Aktivitäten section
        if (sections[1]) {
            const ul = sections[1].querySelector('ul');
            if (ul) {
                if (isBezahlt) {
                    ul.innerHTML = '<li>Zahlungseingang bestätigt (' + (customer.statusText?.match(/\\d{2}\\.\\d{2}\\.\\d{4}/)?.[0] || '16.12.2025') + ')</li><li>Erfolgreiche Zahlungsvereinbarung</li><li>Fall als abgeschlossen markiert</li>';
                } else if (isInkasso) {
                    ul.innerHTML = '<li>' + customer.mahnstufe + '. Mahnung versendet</li><li>Telefonversuche nicht erreicht</li><li>Inkasso-Verfahren eingeleitet</li><li>Letzte Teilzahlung vor ' + Math.floor(Math.random() * 60 + 30) + ' Tagen</li>';
                } else {
                    ul.innerHTML = '<li>Zahlungserinnerung versendet (' + new Date().toLocaleDateString('de-DE') + ')</li><li>Fall automatisch erstellt</li><li>Wartet auf Zahlungseingang oder Kundenkontakt</li>';
                }
            }
        }

        // Aktuelle Schritte section
        if (sections[2]) {
            const ul = sections[2].querySelector('ul');
            if (ul) {
                if (isBezahlt) {
                    ul.innerHTML = '<li><strong>Erledigt:</strong> Keine weiteren Maßnahmen erforderlich</li><li><strong>Optional:</strong> Kundenfeedback einholen</li>';
                } else if (isInkasso) {
                    ul.innerHTML = '<li><strong>Sofort:</strong> Gerichtliches Mahnverfahren prüfen</li><li><strong>Diese Woche:</strong> Letzte telefonische Kontaktaufnahme</li><li><strong>Bei Ablehnung:</strong> Forderungsverkauf oder Abschreibung</li>';
                } else {
                    ul.innerHTML = '<li><strong>Sofort:</strong> Telefonischen Kontakt herstellen</li><li><strong>Diese Woche:</strong> Zahlungsvereinbarung anbieten</li><li><strong>Bei Erfolg:</strong> Ratenzahlung dokumentieren</li>';
                }
            }
        }
    }

    // Update Willingness/Ability scores
    const scoreBars = kiTab.querySelectorAll('.score-bar-visual .bar-fill');
    const scorePercents = kiTab.querySelectorAll('.score-percent');
    if (scoreBars.length >= 2 && scorePercents.length >= 2) {
        const willingness = isBezahlt ? 95 : (customer.willingness || 50);
        const ability = isBezahlt ? 90 : (customer.ability || 50);
        scoreBars[0].style.width = willingness + '%';
        scoreBars[1].style.width = ability + '%';
        scorePercents[0].textContent = willingness + '%';
        scorePercents[1].textContent = ability + '%';

        // Color coding
        scoreBars[0].style.background = willingness >= 70 ? '#22c55e' : (willingness >= 40 ? '#f59e0b' : '#ef4444');
        scoreBars[1].style.background = ability >= 70 ? '#22c55e' : (ability >= 40 ? '#f59e0b' : '#ef4444');
    }

    // Update score point position in chart
    const scorePoint = kiTab.querySelector('.score-point');
    if (scorePoint) {
        const willingness = isBezahlt ? 95 : (customer.willingness || 50);
        const ability = isBezahlt ? 90 : (customer.ability || 50);
        scorePoint.style.left = willingness + '%';
        scorePoint.style.bottom = ability + '%';
    }

    // Update segment badge
    const segmentBadge = kiTab.querySelector('.segment-badge.large');
    if (segmentBadge) {
        const segmentNames = {
            'eskalation': 'Eskalation',
            'prioritaet': 'Priorität',
            'restrukturierung': 'Restrukturierung',
            'abwicklung': 'Abwicklung',
            'abgeschlossen': 'Abgeschlossen'
        };
        const segmentClasses = {
            'eskalation': 'escalate',
            'prioritaet': 'priority',
            'restrukturierung': 'restructure',
            'abwicklung': 'writeoff',
            'abgeschlossen': 'success'
        };
        const segment = isBezahlt ? 'abgeschlossen' : (customer.segment || 'prioritaet');
        segmentBadge.textContent = segmentNames[segment] || segment;
        segmentBadge.className = 'segment-badge large ' + (segmentClasses[segment] || '');
    }

    // Update segment description
    const segmentDesc = kiTab.querySelector('.ki-segment-result p');
    if (segmentDesc) {
        if (isBezahlt) {
            segmentDesc.innerHTML = 'Der Fall <strong>' + customer.name + '</strong> wurde erfolgreich abgeschlossen. Die Forderung wurde vollständig beglichen. Keine weiteren Maßnahmen erforderlich.';
        } else {
            const segmentDescriptions = {
                'eskalation': 'Basierend auf der Analyse wird <strong>' + customer.name + '</strong> dem Segment <strong>Eskalation</strong> zugeordnet. Empfehlung: Intensivierung der Inkasso-Maßnahmen.',
                'prioritaet': '<strong>' + customer.name + '</strong> zeigt Kooperationsbereitschaft und ausreichende Zahlungsfähigkeit. Empfehlung: Schnelle Vereinbarung anstreben.',
                'restrukturierung': '<strong>' + customer.name + '</strong> benötigt eine Restrukturierung der Schulden. Empfehlung: Ratenzahlung oder Stundung vereinbaren.',
                'abwicklung': 'Bei <strong>' + customer.name + '</strong> ist die Rückzahlung unwahrscheinlich. Empfehlung: Forderungsverkauf oder Abschreibung prüfen.'
            };
            segmentDesc.innerHTML = segmentDescriptions[customer.segment] ||
                'Basierend auf der Analyse wird <strong>' + customer.name + '</strong> dem entsprechenden Segment zugeordnet.';
        }
    }

    // Update factors based on customer data
    const factorList = kiTab.querySelector('.factor-list');
    if (factorList && customer.status !== 'Bezahlt') {
        const factors = generateCustomerFactors(customer);
        factorList.innerHTML = factors.map(f => `
            <div class="factor-item ${f.type}">
                <span class="factor-icon">
                    ${f.type === 'positive'
                        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'}
                </span>
                <span class="factor-name">${f.name}</span>
                <span class="factor-impact">${f.impact}</span>
            </div>
        `).join('');
    } else if (factorList && customer.status === 'Bezahlt') {
        factorList.innerHTML = `
            <div class="factor-item positive">
                <span class="factor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span class="factor-name">Forderung vollständig beglichen</span>
                <span class="factor-impact">+100 Punkte</span>
            </div>
            <div class="factor-item positive">
                <span class="factor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span class="factor-name">Fall erfolgreich abgeschlossen</span>
                <span class="factor-impact">Kein Risiko</span>
            </div>
        `;
    }
}

// Update Haushalt/GuV tab based on customer type (Privat vs Gewerbe)
function updateHaushaltGuvTab(customer) {
    const tabButton = document.getElementById('tabHaushaltGuv');
    const haushaltSection = document.getElementById('haushaltSection');
    const guvSection = document.getElementById('guvSection');

    if (!tabButton || !haushaltSection || !guvSection) return;

    // Only show GuV for explicitly marked business customers (type === 'Gewerbe')
    const isGewerbe = customer.type === 'Gewerbe';

    if (isGewerbe) {
        // Show GuV for business customers
        tabButton.textContent = 'GuV';
        haushaltSection.style.display = 'none';
        guvSection.style.display = 'block';

        // Update GuV values based on customer data
        if (customer.guv) {
            updateGuvFields(customer);
        }
    } else {
        // Show Haushaltsrechnung for private customers
        tabButton.textContent = 'Haushaltsrechnung';
        haushaltSection.style.display = 'block';
        guvSection.style.display = 'none';
    }
}

// Update GuV fields with customer data
function updateGuvFields(customer) {
    const guv = customer.guv || {};

    // Update summary cards
    const umsatzEl = document.getElementById('guvUmsatz');
    const aufwendungenEl = document.getElementById('guvAufwendungen');
    const gewinnEl = document.getElementById('guvGewinn');
    const ebitdaEl = document.getElementById('guvEbitda');

    if (umsatzEl && guv.umsatz) {
        umsatzEl.textContent = formatCurrency(guv.umsatz);
    }
    if (aufwendungenEl && guv.aufwendungen) {
        aufwendungenEl.textContent = formatCurrency(guv.aufwendungen);
    }
    if (gewinnEl && guv.gewinn !== undefined) {
        gewinnEl.textContent = formatCurrency(guv.gewinn);
        gewinnEl.classList.toggle('negative', guv.gewinn < 0);
    }
    if (ebitdaEl && guv.ebitda) {
        ebitdaEl.textContent = guv.ebitda + '%';
    }

    // Update detail fields
    const guvUmsatzDetail = document.getElementById('guvUmsatzDetail');
    const guvGewinnDetail = document.getElementById('guvGewinnDetail');
    if (guvUmsatzDetail && guv.umsatzChange) {
        guvUmsatzDetail.textContent = guv.umsatzChange;
    }
    if (guvGewinnDetail && guv.gewinnText) {
        guvGewinnDetail.textContent = guv.gewinnText;
    }
}

// Helper to format currency
function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '€0';
    const formatted = Math.abs(amount).toLocaleString('de-DE');
    return (amount < 0 ? '-' : '') + '€' + formatted;
}

// Update Haushaltsrechnung tab fields
function updateHaushaltFields(modal, customer) {
    const haushaltTab = modal.querySelector('#tab-haushalt');
    if (!haushaltTab || !customer.haushalt) {
        console.log('Haushalt tab not found or no haushalt data');
        return;
    }

    const h = customer.haushalt;
    const isGewerbe = customer.type === 'Gewerbe';

    // Calculate totals
    const einnahmenGesamt = (h.einnahmen.gehalt || 0) + (h.einnahmen.neben || 0) + (h.einnahmen.sozial || 0) + (h.einnahmen.sonstige || 0);
    const fixkostenGesamt = (h.fixkosten.miete || 0) + (h.fixkosten.nebenkosten || 0) + (h.fixkosten.versicherung || 0) + (h.fixkosten.kredite || 0) + (h.fixkosten.abos || 0);
    const lebenshaltungGesamt = (h.lebenshaltung.essen || 0) + (h.lebenshaltung.mobilitaet || 0) + (h.lebenshaltung.gesundheit || 0) + (h.lebenshaltung.freizeit || 0) + (h.lebenshaltung.sonstige || 0);
    const ausgabenGesamt = fixkostenGesamt + lebenshaltungGesamt;
    const freiVerfuegbar = einnahmenGesamt - ausgabenGesamt;
    const sparquote = einnahmenGesamt > 0 ? Math.round((freiVerfuegbar / einnahmenGesamt) * 100) : 0;

    // Helper to format currency
    const formatEuro = (val) => '€' + val.toLocaleString('de-DE');

    // Update summary cards
    const summaryEinnahmen = haushaltTab.querySelector('#haushaltEinnahmen');
    const summaryAusgaben = haushaltTab.querySelector('#haushaltAusgaben');
    const summaryVerfuegbar = haushaltTab.querySelector('#haushaltVerfuegbar');
    const summarySparquote = haushaltTab.querySelector('#haushaltSparquote');

    if (summaryEinnahmen) summaryEinnahmen.textContent = formatEuro(einnahmenGesamt);
    if (summaryAusgaben) summaryAusgaben.textContent = formatEuro(ausgabenGesamt);
    if (summaryVerfuegbar) {
        summaryVerfuegbar.textContent = formatEuro(freiVerfuegbar);
        summaryVerfuegbar.style.color = freiVerfuegbar >= 0 ? '#22c55e' : '#ef4444';
    }
    if (summarySparquote) {
        summarySparquote.textContent = sparquote + '%';
        summarySparquote.style.color = sparquote >= 10 ? '#22c55e' : (sparquote >= 0 ? '#f59e0b' : '#ef4444');
    }

    // Update summary detail text
    const einnahmenDetail = haushaltTab.querySelector('#haushaltEinnahmenDetail');
    const ausgabenDetail = haushaltTab.querySelector('#haushaltAusgabenDetail');
    if (einnahmenDetail) einnahmenDetail.textContent = isGewerbe ? 'Betriebseinnahmen' : 'Nettoeinkommen';
    if (ausgabenDetail) ausgabenDetail.textContent = 'Fixkosten + Lebenshaltung';

    // Update Einnahmen breakdown
    haushaltTab.querySelector('#einnahmenGehalt').textContent = formatEuro(h.einnahmen.gehalt || 0);
    haushaltTab.querySelector('#einnahmenNeben').textContent = formatEuro(h.einnahmen.neben || 0);
    haushaltTab.querySelector('#einnahmenSozial').textContent = formatEuro(h.einnahmen.sozial || 0);
    haushaltTab.querySelector('#einnahmenSonstige').textContent = formatEuro(h.einnahmen.sonstige || 0);
    haushaltTab.querySelector('#einnahmenGesamt').textContent = formatEuro(einnahmenGesamt);

    // Update Fixkosten breakdown
    haushaltTab.querySelector('#fixkostenMiete').textContent = formatEuro(h.fixkosten.miete || 0);
    haushaltTab.querySelector('#fixkostenNebenkosten').textContent = formatEuro(h.fixkosten.nebenkosten || 0);
    haushaltTab.querySelector('#fixkostenVersicherung').textContent = formatEuro(h.fixkosten.versicherung || 0);
    haushaltTab.querySelector('#fixkostenKredite').textContent = formatEuro(h.fixkosten.kredite || 0);
    haushaltTab.querySelector('#fixkostenAbos').textContent = formatEuro(h.fixkosten.abos || 0);
    haushaltTab.querySelector('#fixkostenGesamt').textContent = formatEuro(fixkostenGesamt);

    // Update Lebenshaltung breakdown
    haushaltTab.querySelector('#lebenshaltungEssen').textContent = formatEuro(h.lebenshaltung.essen || 0);
    haushaltTab.querySelector('#lebenshaltungMobilitaet').textContent = formatEuro(h.lebenshaltung.mobilitaet || 0);
    haushaltTab.querySelector('#lebenshaltungGesundheit').textContent = formatEuro(h.lebenshaltung.gesundheit || 0);
    haushaltTab.querySelector('#lebenshaltungFreizeit').textContent = formatEuro(h.lebenshaltung.freizeit || 0);
    haushaltTab.querySelector('#lebenshaltungSonstige').textContent = formatEuro(h.lebenshaltung.sonstige || 0);
    haushaltTab.querySelector('#lebenshaltungGesamt').textContent = formatEuro(lebenshaltungGesamt);

    // Update Zahlungsfähigkeitsbewertung
    const assessmentFill = haushaltTab.querySelector('#assessmentFill');
    const assessmentText = haushaltTab.querySelector('#assessmentText');

    let assessmentLevel = 0;
    let assessmentMessage = '';
    let assessmentColor = '';

    if (sparquote >= 20) {
        assessmentLevel = 90;
        assessmentMessage = `<strong>Gut:</strong> ${customer.name} verfügt über einen soliden finanziellen Spielraum (${sparquote}% Sparquote). Ratenzahlungen können problemlos bedient werden.`;
        assessmentColor = '#22c55e';
    } else if (sparquote >= 10) {
        assessmentLevel = 70;
        assessmentMessage = `<strong>Stabil:</strong> ${customer.name} hat ausreichend frei verfügbares Einkommen (${formatEuro(freiVerfuegbar)}/Monat). Moderate Raten sind tragbar.`;
        assessmentColor = '#3b82f6';
    } else if (sparquote >= 0) {
        assessmentLevel = 45;
        assessmentMessage = `<strong>Eingeschränkt:</strong> ${customer.name} hat nur ${formatEuro(freiVerfuegbar)} frei verfügbar. Niedrige Raten oder Stundung empfohlen.`;
        assessmentColor = '#f59e0b';
    } else {
        assessmentLevel = 20;
        assessmentMessage = `<strong>Kritisch:</strong> ${customer.name} hat ein monatliches Defizit von ${formatEuro(Math.abs(freiVerfuegbar))}. Restrukturierung oder Härtefallprüfung erforderlich.`;
        assessmentColor = '#ef4444';
    }

    if (assessmentFill) {
        assessmentFill.style.width = assessmentLevel + '%';
        assessmentFill.style.background = `linear-gradient(90deg, ${assessmentColor}, ${assessmentColor}80)`;
    }
    if (assessmentText) {
        assessmentText.innerHTML = assessmentMessage;
    }

    console.log('Haushalt fields updated for:', customer.name);
}

// Update Open Finance tab fields
function updateOpenFinanceFields(modal, customer) {
    const openfinanceTab = modal.querySelector('#tab-openfinance');
    if (!openfinanceTab || !customer.openFinance) {
        console.log('Open Finance tab not found or no openFinance data');
        return;
    }

    const of = customer.openFinance;

    // Update Consent Grid
    const consentGrid = openfinanceTab.querySelector('#consentGrid');
    if (consentGrid && of.consent) {
        const psd2Status = of.consent.psd2 ? 'active' : 'inactive';
        const versicherungenStatus = of.consent.versicherungen ? 'active' : 'pending';
        const investmentsStatus = of.consent.investments ? 'active' : 'inactive';

        const psd2Icon = of.consent.psd2
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        const versicherungenIcon = of.consent.versicherungen
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';

        const investmentsIcon = of.consent.investments
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        consentGrid.innerHTML = `
            <div class="consent-item ${psd2Status}">
                <span class="consent-status">${psd2Icon} ${of.consent.psd2 ? 'Aktiv' : 'Nicht erteilt'}</span>
                <span class="consent-label">Konten (PSD2)</span>
                <span class="consent-detail">${of.consent.psd2 ? 'Gültig bis ' + of.consent.psd2Bis : 'Keine Freigabe'}</span>
            </div>
            <div class="consent-item ${versicherungenStatus}">
                <span class="consent-status">${versicherungenIcon} ${of.consent.versicherungen ? 'Aktiv' : 'Ausstehend'}</span>
                <span class="consent-label">Versicherungen</span>
                <span class="consent-detail">${of.consent.versicherungen ? 'Freigabe erteilt' : 'Einwilligung angefragt'}</span>
            </div>
            <div class="consent-item ${investmentsStatus}">
                <span class="consent-status">${investmentsIcon} ${of.consent.investments ? 'Aktiv' : 'Nicht erteilt'}</span>
                <span class="consent-label">Investments</span>
                <span class="consent-detail">${of.consent.investments ? 'Freigabe erteilt' : 'Keine Freigabe'}</span>
            </div>
        `;
    }

    // Update Externe Konten table
    const externeKontenBody = openfinanceTab.querySelector('#externeKontenBody');
    if (externeKontenBody && of.externeKonten) {
        if (of.externeKonten.length === 0) {
            externeKontenBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">Keine externen Konten gefunden</td></tr>';
        } else {
            externeKontenBody.innerHTML = of.externeKonten.map(konto => {
                const saldoClass = konto.saldo < 0 ? 'negative' : (konto.saldo > 0 ? 'positive' : '');
                const statusBadge = konto.status === 'Aktiv' ? 'success' : (konto.status === 'Überzogen' ? 'danger' : 'warning');
                return `
                    <tr>
                        <td>${konto.institut}</td>
                        <td>${konto.produkt}</td>
                        <td class="${saldoClass}">€${Math.abs(konto.saldo).toLocaleString('de-DE')}</td>
                        <td>${konto.rate > 0 ? '€' + konto.rate.toLocaleString('de-DE') : '-'}</td>
                        <td><span class="status-badge ${statusBadge}">${konto.status}</span></td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Update Externe Versicherungen table
    const externeVersicherungenBody = openfinanceTab.querySelector('#externeVersicherungenBody');
    if (externeVersicherungenBody && of.externeVersicherungen) {
        if (of.externeVersicherungen.length === 0) {
            externeVersicherungenBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">Keine externen Versicherungen erkannt (kein Consent oder keine Daten)</td></tr>';
        } else {
            externeVersicherungenBody.innerHTML = of.externeVersicherungen.map(vers => `
                <tr>
                    <td>${vers.anbieter}</td>
                    <td>${vers.produkt}</td>
                    <td>€${vers.beitrag.toLocaleString('de-DE')}/M</td>
                    <td>${vers.beginn}</td>
                    <td>${vers.hinweis || '-'}</td>
                </tr>
            `).join('');
        }
    }

    // Calculate and update Gesamtverschuldung
    const produkteSaldo = customer.produkte ? customer.produkte.reduce((sum, p) => sum + (p.saldo || 0), 0) : 0;
    const externeSaldo = of.externeKonten ? of.externeKonten.filter(k => k.saldo < 0 || k.produkt.toLowerCase().includes('kredit') || k.produkt.toLowerCase().includes('leasing'))
        .reduce((sum, k) => sum + Math.abs(k.saldo), 0) : 0;
    const gesamtVerschuldung = produkteSaldo + externeSaldo;

    // Calculate DTI (Debt-to-Income Ratio) based on monthly income
    const monatlichesEinkommen = customer.haushalt ?
        (customer.haushalt.einnahmen.gehalt || 0) + (customer.haushalt.einnahmen.neben || 0) +
        (customer.haushalt.einnahmen.sozial || 0) + (customer.haushalt.einnahmen.sonstige || 0) :
        (customer.einkommenMonatlich || 1);
    const dtiRatio = monatlichesEinkommen > 0 ? Math.round((gesamtVerschuldung / (monatlichesEinkommen * 12)) * 100) : 0;

    const debtEigeneBank = openfinanceTab.querySelector('#debtEigeneBank');
    const debtExtern = openfinanceTab.querySelector('#debtExtern');
    const debtGesamt = openfinanceTab.querySelector('#debtGesamt');
    const debtRatio = openfinanceTab.querySelector('#debtRatio');

    if (debtEigeneBank) debtEigeneBank.textContent = '€' + produkteSaldo.toLocaleString('de-DE');
    if (debtExtern) debtExtern.textContent = '€' + externeSaldo.toLocaleString('de-DE');
    if (debtGesamt) debtGesamt.textContent = '€' + gesamtVerschuldung.toLocaleString('de-DE');
    if (debtRatio) {
        debtRatio.textContent = dtiRatio + '%';
        debtRatio.style.color = dtiRatio <= 35 ? '#22c55e' : (dtiRatio <= 50 ? '#f59e0b' : '#ef4444');
    }

    console.log('Open Finance fields updated for:', customer.name);
}

// Generate customer-specific factors
function generateCustomerFactors(customer) {
    const factors = [];

    // Negative factors
    if (customer.dpd > 60) {
        factors.push({ type: 'negative', name: `Hoher Verzug (${customer.dpd} DPD)`, impact: '-30 Punkte' });
    } else if (customer.dpd > 30) {
        factors.push({ type: 'negative', name: `Moderater Verzug (${customer.dpd} DPD)`, impact: '-15 Punkte' });
    }

    if (customer.mahnstufe >= 3) {
        factors.push({ type: 'negative', name: `${customer.mahnstufe} Mahnungen ohne Reaktion`, impact: '-20 Punkte' });
    }

    if (customer.branche && (customer.branche.includes('Gastronomie') || customer.branche.includes('Restaurant'))) {
        factors.push({ type: 'negative', name: 'Branchenrisiko: Gastronomie', impact: '-15 Punkte' });
    }

    if (customer.willingness < 40) {
        factors.push({ type: 'negative', name: 'Geringe Zahlungsbereitschaft erkennbar', impact: '-25 Punkte' });
    }

    // Positive factors
    if (customer.willingness >= 70) {
        factors.push({ type: 'positive', name: 'Hohe Kooperationsbereitschaft', impact: '+20 Punkte' });
    }

    if (customer.ability >= 70) {
        factors.push({ type: 'positive', name: 'Gute Zahlungsfähigkeit', impact: '+15 Punkte' });
    }

    if (customer.type === 'Privat' && customer.branche && customer.branche.includes('Angestellt')) {
        factors.push({ type: 'positive', name: 'Stabiles Einkommen (Angestellter)', impact: '+10 Punkte' });
    }

    if (customer.type === 'Privat' && customer.branche && customer.branche.includes('Beamt')) {
        factors.push({ type: 'positive', name: 'Sichere Einkommensquelle (Beamter)', impact: '+15 Punkte' });
    }

    if (customer.dpd <= 14) {
        factors.push({ type: 'positive', name: 'Neuer Fall mit kurzer Verzugsdauer', impact: '+10 Punkte' });
    }

    return factors.slice(0, 5); // Max 5 factors
}

// Close customer detail modal
function closeCustomerDetail() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'none';

        // Dispatch event for Page ID Tracker - return to segmentierung
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'banken', view: 'segmentierung' }
        }));
    }
}

// Show customer tab in modal
function showCustomerTab(tabName) {
    const modal = document.getElementById('customerDetailModal');
    if (!modal) return;

    // Update modal tabs (scoped to modal)
    modal.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    modal.querySelectorAll('.modal-tab').forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            tab.classList.add('active');
        }
    });

    // Update tab content (scoped to modal)
    modal.querySelectorAll('.customer-tab').forEach(content => {
        content.classList.remove('active');
    });

    // Use modal.querySelector instead of document.getElementById to avoid
    // conflicts with duplicate IDs (e.g., tab-stammdaten exists in both
    // index.html for Agentur and modal-customer-detail.html)
    const targetTab = modal.querySelector(`#tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    console.log('Customer tab:', tabName);
}

// Toggle between chart and table view for credit products
function toggleCreditView(button, viewType) {
    const card = button.closest('.credit-product-large');
    if (!card) return;

    // Update toggle buttons
    card.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update views
    card.querySelectorAll('.credit-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = card.querySelector(`.${viewType}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    console.log('Credit view toggled:', viewType);
}


// Exports
window.closeCustomerDetail = closeCustomerDetail;
window.showCustomerTab = showCustomerTab;
window.__registerModule('banken-customer-detail2.js');
