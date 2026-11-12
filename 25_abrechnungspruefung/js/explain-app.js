/**
 * BillingCheck - Explain App Controller
 * Hauptsteuerung für das Abrechnungserläuterungs-Tool
 *
 * FUNKTIONIERT KOMPLETT OFFLINE - Kein Cloudflare Setup nötig!
 * Alle Daten werden lokal im Browser gespeichert (IndexedDB)
 *
 * Version: 2.0.0
 */

class ExplainApp {
    constructor() {
        this.currentSection = 'generator'; // Direkt zum Generator starten!
        this.generatedBilling = null;
        this.selectedFile = null;
        this.db = null; // Lokale Datenbank

        this.init();
    }

    // ========================================================================
    // INITIALISIERUNG
    // ========================================================================

    async init() {
        // Lokale Datenbank initialisieren
        this.db = localDb;
        await this.db.init();

        // Navigation einrichten
        this.setupNavigation();

        // Event Listeners
        this.setupEventListeners();

        // Theme-Toggle
        this.setupTheme();

        // PDF.js Worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
        }

        // Stats laden
        await this.loadStats();

        // Direkt zur Generator-Section navigieren
        this.navigateToSection('generator');

        // Status aktualisieren
        this.updateDbStatus(true);

        console.log('ExplainApp initialisiert - Lokaler Modus aktiv!');
        this.showToast('Bereit! Alle Daten werden lokal gespeichert.', 'success');
    }

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    navigateToSection(sectionName) {
        // Aktive Nav-Item aktualisieren
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });

        // Aktive Section aktualisieren
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === `${sectionName}-section`);
        });

        this.currentSection = sectionName;

        // Section-spezifische Aktionen
        switch (sectionName) {
            case 'documents':
                this.loadProvisions();
                break;
            case 'contracts':
                this.loadContracts();
                break;
            case 'rules':
                this.loadRules();
                this.loadProvisionsDropdown();
                break;
            case 'explain':
                this.loadAbrechnungenDropdown();
                break;
        }
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Settings Modal
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettingsModal());
        document.getElementById('close-settings')?.addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveModalSettings());

        // Documents Section - Dropzone
        this.setupDropzone('prov-dropzone', 'prov-file', (file) => this.handleProvisionFile(file));

        // Documents Form
        document.getElementById('provisions-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProvisionsbestimmung();
        });
        document.getElementById('refresh-provisions')?.addEventListener('click', () => this.loadProvisions());

        // Generator Section
        document.getElementById('generator-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateBilling();
        });
        document.getElementById('gen-save-d1')?.addEventListener('click', () => this.saveGeneratedToDb());
        document.getElementById('gen-export-json')?.addEventListener('click', () => this.exportGeneratedJSON());
        document.getElementById('gen-explain')?.addEventListener('click', () => this.explainGenerated());

        // Explain Section
        this.setupDropzone('explain-dropzone', 'explain-file', (file) => this.handleExplainFile(file));
        document.getElementById('load-from-d1')?.addEventListener('click', () => this.loadFromDb());
        document.getElementById('use-generated')?.addEventListener('click', () => this.useGenerated());

        // Contracts Section
        document.getElementById('contract-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContract();
        });
        document.getElementById('refresh-contracts')?.addEventListener('click', () => this.loadContracts());

        // Rules Section
        document.getElementById('rule-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRule();
        });
        document.getElementById('refresh-rules')?.addEventListener('click', () => this.loadRules());

        // Position Modal
        document.getElementById('close-position-modal')?.addEventListener('click', () => {
            document.getElementById('position-modal').classList.remove('active');
        });

        // Save Button immer aktivieren (lokaler Modus)
        const saveBtn = document.getElementById('gen-save-d1');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Lokal speichern';
        }
    }

    // ========================================================================
    // DROPZONE SETUP
    // ========================================================================

    setupDropzone(dropzoneId, inputId, callback) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);

        if (!dropzone || !input) return;

        dropzone.addEventListener('click', () => input.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                callback(files[0]);
            }
        });

        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                callback(input.files[0]);
            }
        });
    }

    // ========================================================================
    // DATABASE STATUS
    // ========================================================================

    updateDbStatus(connected) {
        const statusEl = document.getElementById('d1-status');
        if (statusEl) {
            statusEl.textContent = connected ? 'Lokal' : 'Offline';
            statusEl.style.color = connected ? '#10b981' : '#ef4444';
        }
    }

    async loadStats() {
        try {
            const stats = await this.db.getStatistiken();
            const docEl = document.getElementById('total-documents');
            const conEl = document.getElementById('total-contracts');
            if (docEl) docEl.textContent = stats.dokumente || 0;
            if (conEl) conEl.textContent = stats.vertraege || 0;
        } catch (error) {
            console.error('Fehler beim Laden der Statistiken:', error);
        }
    }

    // ========================================================================
    // PROVISIONSBESTIMMUNGEN
    // ========================================================================

    async handleProvisionFile(file) {
        if (file.type !== 'application/pdf') {
            this.showToast('Bitte nur PDF-Dateien hochladen', 'error');
            return;
        }

        const fileInfo = document.getElementById('prov-file-info');
        fileInfo.style.display = 'flex';
        fileInfo.innerHTML = `
            <span class="file-icon">📄</span>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
            </div>
            <button class="remove-file" onclick="explainApp.removeProvFile()">×</button>
        `;

        this.selectedFile = file;

        try {
            const text = await this.extractPdfText(file);
            document.getElementById('prov-text').value = text;
            this.showToast('PDF-Text extrahiert!', 'success');
        } catch (error) {
            this.showToast('Fehler beim Extrahieren: ' + error.message, 'error');
        }
    }

    removeProvFile() {
        this.selectedFile = null;
        document.getElementById('prov-file-info').style.display = 'none';
        document.getElementById('prov-file').value = '';
    }

    async extractPdfText(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += `--- Seite ${i} ---\n${pageText}\n\n`;
        }

        return fullText;
    }

    async saveProvisionsbestimmung() {
        const data = {
            name: document.getElementById('prov-name').value,
            versicherer: document.getElementById('prov-versicherer').value,
            gueltig_ab: document.getElementById('prov-gueltig-ab').value,
            gueltig_bis: document.getElementById('prov-gueltig-bis').value || null,
            version: document.getElementById('prov-version').value || null
        };

        if (!data.name || !data.versicherer || !data.gueltig_ab) {
            this.showToast('Bitte alle Pflichtfelder ausfüllen', 'warning');
            return;
        }

        try {
            const result = await this.db.createProvisionsbestimmung(data);

            const text = document.getElementById('prov-text').value;
            if (text) {
                await this.db.createDokument({
                    dokument_typ: 'provisionsbestimmung',
                    referenz_id: result.id,
                    dateiname: this.selectedFile?.name || `${data.name}.txt`,
                    volltext: text,
                    verarbeitet: true
                });
            }

            this.showToast('Provisionsbestimmung gespeichert!', 'success');
            document.getElementById('provisions-form').reset();
            this.removeProvFile();
            this.loadProvisions();
            this.loadStats();

        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    async loadProvisions() {
        try {
            const provisions = await this.db.getProvisionsbestimmungen();
            const container = document.getElementById('provisions-list');

            if (!provisions || provisions.length === 0) {
                container.innerHTML = '<p class="empty-state">Keine Provisionsbestimmungen gespeichert. Füge oben eine neue hinzu.</p>';
                return;
            }

            container.innerHTML = provisions.map(p => `
                <div class="document-item">
                    <span class="document-icon">📋</span>
                    <div class="document-info">
                        <div class="document-name">${p.name}</div>
                        <div class="document-meta">
                            ${p.versicherer} | Gültig ab: ${p.gueltig_ab} | ${p.anzahl_regeln || 0} Regeln
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="btn-secondary btn-sm" onclick="explainApp.viewProvision(${p.id})">Anzeigen</button>
                        <button class="btn-secondary btn-sm" onclick="explainApp.deleteProvision(${p.id})">Löschen</button>
                    </div>
                </div>
            `).join('');

            this.updateProvisionsDropdown(provisions);

        } catch (error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    updateProvisionsDropdown(provisions) {
        const select = document.getElementById('rule-bestimmung');
        const filterSelect = document.getElementById('filter-rules-bestimmung');

        if (select) {
            select.innerHTML = '<option value="">-- Auswählen --</option>' +
                provisions.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Alle Bestimmungen</option>' +
                provisions.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    }

    async loadProvisionsDropdown() {
        const provisions = await this.db.getProvisionsbestimmungen();
        this.updateProvisionsDropdown(provisions);
    }

    async viewProvision(id) {
        try {
            const provision = await this.db.getProvisionsbestimmungById(id);
            const docs = await this.db.getDokumente('provisionsbestimmung');
            const relatedDoc = docs.find(d => d.referenz_id === id);

            let content = `
                <h3>${provision.name}</h3>
                <p><strong>Versicherer:</strong> ${provision.versicherer}</p>
                <p><strong>Gültig ab:</strong> ${provision.gueltig_ab}</p>
                <p><strong>Version:</strong> ${provision.version || '-'}</p>
            `;

            if (provision.regeln && provision.regeln.length > 0) {
                content += `<h4>Enthaltene Regeln (${provision.regeln.length})</h4>
                    <ul>${provision.regeln.map(r =>
                        `<li>${r.sparte} - ${r.provisions_art}: ${r.provisions_satz}% (${r.bezugsgroesse})</li>`
                    ).join('')}</ul>`;
            }

            if (relatedDoc && relatedDoc.volltext) {
                content += `<h4>Dokument-Text (Auszug)</h4>
                    <div style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 1rem; border-radius: 4px; font-size: 0.85rem; white-space: pre-wrap;">
                        ${relatedDoc.volltext.substring(0, 2000)}${relatedDoc.volltext.length > 2000 ? '...' : ''}
                    </div>`;
            }

            document.getElementById('position-detail-content').innerHTML = content;
            document.getElementById('position-modal').classList.add('active');

        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    async deleteProvision(id) {
        if (!confirm('Provisionsbestimmung wirklich löschen?')) return;

        try {
            await this.db.deleteProvisionsbestimmung(id);
            this.showToast('Gelöscht', 'success');
            this.loadProvisions();
            this.loadStats();
        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    // ========================================================================
    // GENERATOR
    // ========================================================================

    generateBilling() {
        const options = {
            monat: parseInt(document.getElementById('gen-monat').value),
            jahr: parseInt(document.getElementById('gen-jahr').value),
            anzahl_positionen: parseInt(document.getElementById('gen-positionen').value),
            vermittler_nummer: document.getElementById('gen-vermittler').value,
            vermittler_name: document.getElementById('gen-name').value,
            agentur_name: document.getElementById('gen-agentur').value,
            mit_stornos: document.getElementById('gen-mit-stornos').checked,
            mit_dynamik: document.getElementById('gen-mit-dynamik').checked,
            mit_superprovision: document.getElementById('gen-mit-super').checked,
            mit_bestandsprovision: document.getElementById('gen-mit-bestand').checked
        };

        this.generatedBilling = billingGenerator.generiereAbrechnung(options);

        this.displayGeneratedBilling();
        document.getElementById('use-generated').disabled = false;

        this.showToast(`Abrechnung mit ${this.generatedBilling.anzahl_positionen} Positionen generiert!`, 'success');
    }

    displayGeneratedBilling() {
        const container = document.getElementById('generated-billing');
        const summaryEl = document.getElementById('gen-summary');
        const tableEl = document.getElementById('gen-positions-table');

        container.style.display = 'block';

        const b = this.generatedBilling;
        summaryEl.innerHTML = `
            <div class="summary-item">
                <div class="label">Periode</div>
                <div class="value">${b.periode}</div>
            </div>
            <div class="summary-item">
                <div class="label">Positionen</div>
                <div class="value">${b.anzahl_positionen}</div>
            </div>
            <div class="summary-item">
                <div class="label">Brutto</div>
                <div class="value positive">${this.formatCurrency(b.brutto_provision)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Storno</div>
                <div class="value negative">-${this.formatCurrency(b.storno_einbehalte)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Netto Auszahlung</div>
                <div class="value positive">${this.formatCurrency(b.netto_auszahlung)}</div>
            </div>
        `;

        tableEl.innerHTML = b.positionen.map(p => `
            <tr class="${p.ist_storno ? 'negative' : ''}">
                <td>${p.position_nummer}</td>
                <td><span class="badge badge-${this.getTypeBadgeClass(p.positions_art)}">${p.positions_art}</span></td>
                <td>${p.sparte || '-'}</td>
                <td>${p.produkt || '-'}</td>
                <td>${p.versicherungsnehmer || '-'}</td>
                <td>${p.bezugsgroesse_name || '-'}: ${this.formatCurrency(p.bezugsgroesse_wert)}</td>
                <td>${p.provisions_satz?.toFixed(2) || '-'}%</td>
                <td class="text-right ${p.brutto_betrag < 0 ? 'negative' : 'positive'}">${this.formatCurrency(p.brutto_betrag)}</td>
            </tr>
        `).join('');
    }

    getTypeBadgeClass(type) {
        const classes = {
            'AP': 'success',
            'BP': 'info',
            'DP': 'warning',
            'SP': 'info',
            'STORNO': 'danger'
        };
        return classes[type] || 'info';
    }

    async saveGeneratedToDb() {
        if (!this.generatedBilling) return;

        try {
            const exportData = billingGenerator.exportFuerD1(this.generatedBilling);

            const result = await this.db.createAbrechnung(exportData.abrechnung);
            const abrechnungId = result.id;

            await this.db.batchCreatePositionen(abrechnungId, exportData.positionen);

            const uniqueVertraege = [];
            const seenIds = new Set();
            exportData.vertraege.forEach(v => {
                if (!seenIds.has(v.vertrag_id)) {
                    seenIds.add(v.vertrag_id);
                    uniqueVertraege.push(v);
                }
            });

            if (uniqueVertraege.length > 0) {
                await this.db.batchCreateVertraege(uniqueVertraege);
            }

            this.showToast('Lokal gespeichert!', 'success');
            this.loadStats();

        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    exportGeneratedJSON() {
        if (!this.generatedBilling) return;

        const json = JSON.stringify(this.generatedBilling, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `Abrechnung_${this.generatedBilling.periode}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    explainGenerated() {
        if (!this.generatedBilling) return;
        this.navigateToSection('explain');
        this.explainBilling(this.generatedBilling);
    }

    // ========================================================================
    // ERLÄUTERUNG
    // ========================================================================

    async loadAbrechnungenDropdown() {
        try {
            const abrechnungen = await this.db.getAbrechnungen();
            const select = document.getElementById('select-abrechnung');

            select.innerHTML = '<option value="">-- Abrechnung auswählen --</option>' +
                abrechnungen.map(a => `<option value="${a.id}">${a.periode} - ${a.vermittler_name || a.vermittler_nummer}</option>`).join('');

        } catch (error) {
            console.error('Fehler:', error);
        }
    }

    async loadFromDb() {
        const id = document.getElementById('select-abrechnung').value;
        if (!id) {
            this.showToast('Bitte eine Abrechnung auswählen', 'warning');
            return;
        }

        try {
            const abrechnung = await this.db.getAbrechnungById(id);
            this.explainBilling(abrechnung);
        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    async handleExplainFile(file) {
        if (file.type !== 'application/pdf') {
            this.showToast('Bitte nur PDF-Dateien', 'error');
            return;
        }

        this.showToast('PDF-Import wird noch implementiert', 'warning');
    }

    useGenerated() {
        if (!this.generatedBilling) {
            this.showToast('Erst eine Abrechnung generieren', 'warning');
            return;
        }
        this.explainBilling(this.generatedBilling);
    }

    async explainBilling(abrechnung) {
        const resultEl = document.getElementById('explanation-result');
        const summaryEl = document.getElementById('explain-summary');
        const positionsEl = document.getElementById('explain-positions');

        resultEl.style.display = 'block';

        summaryEl.innerHTML = `
            <h3>Abrechnung ${abrechnung.periode}</h3>
            <p><strong>Vermittler:</strong> ${abrechnung.vermittler_name || abrechnung.vermittler_nummer}</p>
            <p><strong>Positionen:</strong> ${abrechnung.positionen?.length || abrechnung.anzahl_positionen}</p>
            <p><strong>Netto Auszahlung:</strong> ${this.formatCurrency(abrechnung.netto_auszahlung)}</p>
        `;

        const positionen = abrechnung.positionen || [];

        positionsEl.innerHTML = positionen.map((p, index) => {
            const explanation = this.generatePositionExplanation(p);

            return `
                <div class="position-explanation" onclick="explainApp.togglePosition(${index})">
                    <div class="position-header">
                        <span class="position-number">#${p.position_nummer}</span>
                        <span class="position-type ${p.positions_art.toLowerCase()}">${p.positions_art}</span>
                        <span class="position-info">${p.produkt || p.sparte || 'Position'} - ${p.versicherungsnehmer || 'k.A.'}</span>
                        <span class="position-amount ${p.brutto_betrag < 0 ? 'negative' : 'positive'}">
                            ${this.formatCurrency(p.brutto_betrag)}
                        </span>
                        <span class="expand-icon">▼</span>
                    </div>
                    <div class="position-details">
                        ${explanation}
                    </div>
                </div>
            `;
        }).join('');

        this.showToast('Erläuterung erstellt - klicke auf Positionen für Details', 'success');
    }

    generatePositionExplanation(position) {
        const typInfo = billingExplainer.erklaerePositionsTyp(position.positions_art);

        let html = `
            <div class="detail-section">
                <h4>Was ist das?</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="label">Provisionsart</div>
                        <div class="value">${typInfo.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Beschreibung</div>
                        <div class="value">${typInfo.beschreibung}</div>
                    </div>
                </div>
            </div>
        `;

        if (position.vertrag_id || position.produkt) {
            html += `
                <div class="detail-section">
                    <h4>Vertragsdaten</h4>
                    <div class="detail-grid">
                        ${position.vertrag_id ? `<div class="detail-item"><div class="label">Vertragsnr.</div><div class="value">${position.vertrag_id}</div></div>` : ''}
                        ${position.versicherungsnehmer ? `<div class="detail-item"><div class="label">VN</div><div class="value">${position.versicherungsnehmer}</div></div>` : ''}
                        ${position.sparte ? `<div class="detail-item"><div class="label">Sparte</div><div class="value">${position.sparte}</div></div>` : ''}
                        ${position.produkt ? `<div class="detail-item"><div class="label">Produkt</div><div class="value">${position.produkt}</div></div>` : ''}
                        ${position.versicherer ? `<div class="detail-item"><div class="label">Versicherer</div><div class="value">${position.versicherer}</div></div>` : ''}
                        ${position.vertragsbeginn ? `<div class="detail-item"><div class="label">Vertragsbeginn</div><div class="value">${position.vertragsbeginn}</div></div>` : ''}
                    </div>
                </div>
            `;
        }

        html += `
            <div class="detail-section">
                <h4>Berechnung</h4>
                <div class="calculation-steps">
        `;

        if (position.bezugsgroesse_wert) {
            html += `
                <div class="calculation-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-description">Bezugsgröße: ${position.bezugsgroesse_name || 'Jahresbeitrag'}</div>
                        <div class="step-formula">${this.formatCurrency(position.bezugsgroesse_wert)}</div>
                    </div>
                </div>
            `;
        }

        if (position.provisions_satz) {
            html += `
                <div class="calculation-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-description">Provisionssatz anwenden</div>
                        <div class="step-formula">${this.formatCurrency(position.bezugsgroesse_wert)} × ${position.provisions_satz}% = ${this.formatCurrency(position.brutto_betrag)}</div>
                    </div>
                </div>
            `;
        }

        if (position.ist_storno && position.storno_quote) {
            html += `
                <div class="calculation-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-description">Stornorückforderung (${position.storno_quote}%)</div>
                        <div class="step-formula">${this.formatCurrency(position.original_provisions_betrag)} × ${position.storno_quote}% × (-1) = ${this.formatCurrency(position.brutto_betrag)}</div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        const besonderheiten = [];

        if (position.ist_storno) {
            besonderheiten.push({
                typ: 'negativ',
                icon: '⚠️',
                titel: 'Stornorückforderung',
                text: `Rückforderung wegen Vertragsbeendigung. Grund: ${position.storno_grund || 'k.A.'}`
            });
        }

        if (position.ist_dynamik) {
            besonderheiten.push({
                typ: 'positiv',
                icon: '📈',
                titel: `Dynamikerhöhung (Stufe ${position.dynamik_stufe || 1})`,
                text: `Provision für Beitragserhöhung um ${this.formatCurrency(position.dynamik_erhoehung_betrag)}`
            });
        }

        if (position.ist_superprovision) {
            besonderheiten.push({
                typ: 'hinweis',
                icon: '👥',
                titel: 'Superprovision',
                text: `Führungsprovision aus Produktion von ${position.ursprungs_vermittler || 'untergeordnetem Vermittler'}`
            });
        }

        if (position.haftungszeit_monate && position.in_haftung) {
            besonderheiten.push({
                typ: 'hinweis',
                icon: '⏱️',
                titel: 'Stornohaftung',
                text: `Vertrag in ${position.haftungszeit_monate}-monatiger Stornohaftung`
            });
        }

        if (besonderheiten.length > 0) {
            html += `
                <div class="detail-section">
                    <h4>Besonderheiten</h4>
                    <div class="besonderheiten-list">
                        ${besonderheiten.map(b => `
                            <div class="besonderheit-item ${b.typ}">
                                <span class="besonderheit-icon">${b.icon}</span>
                                <div class="besonderheit-content">
                                    <h5>${b.titel}</h5>
                                    <p>${b.text}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `
            <div class="detail-section">
                <h4>Provisionsbestimmung</h4>
                <p style="color: #666; font-size: 0.9rem;">
                    ${typInfo.berechnung}
                </p>
                <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
                    <strong>Haftung:</strong> ${typInfo.haftung}
                </p>
            </div>
        `;

        return html;
    }

    togglePosition(index) {
        const positions = document.querySelectorAll('.position-explanation');
        if (positions[index]) {
            positions[index].classList.toggle('expanded');
        }
    }

    // ========================================================================
    // CONTRACTS
    // ========================================================================

    async saveContract() {
        const data = {
            vertrag_id: document.getElementById('con-id').value,
            versicherungsnehmer_name: document.getElementById('con-vn').value,
            sparte: document.getElementById('con-sparte').value,
            produkt_name: document.getElementById('con-produkt').value,
            versicherer: document.getElementById('con-versicherer').value,
            vertragsbeginn: document.getElementById('con-beginn').value,
            beitrag: parseFloat(document.getElementById('con-beitrag').value),
            zahlweise: document.getElementById('con-zahlweise').value,
            laufzeit_jahre: parseInt(document.getElementById('con-laufzeit').value) || null,
            vermittler_nummer: document.getElementById('con-vermittler').value,
            hat_dynamik: document.getElementById('con-dynamik').checked,
            status: 'aktiv'
        };

        const faktoren = { 'monatlich': 12, 'vierteljährlich': 4, 'halbjährlich': 2, 'jährlich': 1 };
        data.jahresbeitrag = data.beitrag * (faktoren[data.zahlweise] || 12);

        try {
            await this.db.createVertrag(data);
            this.showToast('Vertrag gespeichert!', 'success');
            document.getElementById('contract-form').reset();
            this.loadContracts();
            this.loadStats();
        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    async loadContracts() {
        try {
            const contracts = await this.db.getVertraege();
            const table = document.getElementById('contracts-table');

            if (!contracts || contracts.length === 0) {
                table.innerHTML = '<tr><td colspan="9" class="empty-state">Keine Verträge vorhanden.</td></tr>';
                return;
            }

            table.innerHTML = contracts.map(c => `
                <tr>
                    <td>${c.vertrag_id}</td>
                    <td>${c.versicherungsnehmer_name || '-'}</td>
                    <td>${c.sparte}</td>
                    <td>${c.produkt_name}</td>
                    <td>${c.versicherer}</td>
                    <td>${c.vertragsbeginn}</td>
                    <td class="text-right">${this.formatCurrency(c.beitrag)}</td>
                    <td><span class="badge badge-${c.status === 'aktiv' ? 'success' : 'danger'}">${c.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="explainApp.deleteContract('${c.vertrag_id}')">🗑️</button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Fehler:', error);
        }
    }

    async deleteContract(vertragId) {
        if (!confirm('Vertrag löschen?')) return;

        try {
            await this.db.deleteVertrag(vertragId);
            this.showToast('Gelöscht', 'success');
            this.loadContracts();
            this.loadStats();
        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    // ========================================================================
    // RULES
    // ========================================================================

    async saveRule() {
        const data = {
            bestimmung_id: parseInt(document.getElementById('rule-bestimmung').value),
            sparte: document.getElementById('rule-sparte').value,
            produkt_typ: document.getElementById('rule-produkt').value || null,
            provisions_art: document.getElementById('rule-art').value,
            bezugsgroesse: document.getElementById('rule-bezug').value,
            provisions_satz: parseFloat(document.getElementById('rule-satz').value),
            haftungszeit_monate: parseInt(document.getElementById('rule-haftung').value) || null,
            paragraph_referenz: document.getElementById('rule-paragraph').value || null,
            seiten_referenz: document.getElementById('rule-seite').value || null,
            besondere_bedingungen: document.getElementById('rule-bedingungen').value || null
        };

        if (!data.bestimmung_id) {
            this.showToast('Bitte eine Provisionsbestimmung auswählen', 'warning');
            return;
        }

        try {
            await this.db.createProvisionsregel(data);
            this.showToast('Regel gespeichert!', 'success');
            document.getElementById('rule-form').reset();
            this.loadRules();
        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    async loadRules() {
        try {
            const rules = await this.db.getProvisionsregeln();
            const table = document.getElementById('rules-table');

            if (!rules || rules.length === 0) {
                table.innerHTML = '<tr><td colspan="9" class="empty-state">Keine Regeln vorhanden.</td></tr>';
                return;
            }

            // Bestimmungsnamen hinzufügen
            for (const r of rules) {
                const b = await this.db.getById('provisionsbestimmungen', r.bestimmung_id);
                r.bestimmung_name = b?.name || r.bestimmung_id;
            }

            table.innerHTML = rules.map(r => `
                <tr>
                    <td>${r.bestimmung_name}</td>
                    <td>${r.sparte}</td>
                    <td>${r.produkt_typ || '-'}</td>
                    <td><span class="badge">${r.provisions_art}</span></td>
                    <td>${r.bezugsgroesse}</td>
                    <td class="text-right">${r.provisions_satz}%</td>
                    <td>${r.haftungszeit_monate || '-'} Mon.</td>
                    <td>${r.paragraph_referenz || '-'}</td>
                    <td>
                        <button class="btn-icon" onclick="explainApp.deleteRule(${r.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Fehler:', error);
        }
    }

    async deleteRule(id) {
        if (!confirm('Regel löschen?')) return;

        try {
            await this.db.deleteProvisionsregel(id);
            this.showToast('Gelöscht', 'success');
            this.loadRules();
        } catch (error) {
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    // ========================================================================
    // THEME
    // ========================================================================

    setupTheme() {
        const toggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';

        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        if (toggle) {
            toggle.querySelector('.icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }

        toggle?.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            toggle.querySelector('.icon').textContent = isDark ? '☀️' : '🌙';
        });
    }

    // ========================================================================
    // MODALS
    // ========================================================================

    openSettingsModal() {
        document.getElementById('settings-modal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    saveModalSettings() {
        const key = document.getElementById('modal-openai-key')?.value.trim();

        if (key) {
            localStorage.setItem('openai_api_key_encrypted', this.encryptKey(key));
            this.showToast('API Key gespeichert', 'success');
        }

        this.closeSettingsModal();
    }

    encryptKey(key) {
        const salt = 'billingcheck_key';
        let encrypted = '';
        for (let i = 0; i < key.length; i++) {
            encrypted += String.fromCharCode(key.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
        }
        return encrypted;
    }

    // ========================================================================
    // UTILITIES
    // ========================================================================

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    formatCurrency(value) {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// App initialisieren
let explainApp;
document.addEventListener('DOMContentLoaded', () => {
    explainApp = new ExplainApp();
});
