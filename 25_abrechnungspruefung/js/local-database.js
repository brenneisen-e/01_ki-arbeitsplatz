/**
 * BillingCheck - Local Database (IndexedDB)
 * Ersetzt D1 komplett - alles läuft lokal im Browser!
 *
 * Kein Cloudflare Setup nötig!
 */

class LocalDatabase {
    constructor() {
        this.dbName = 'BillingCheckExplainer';
        this.dbVersion = 1;
        this.db = null;
        this.isReady = false;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                console.log('LocalDatabase bereit');
                resolve(this);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Provisionsbestimmungen
                if (!db.objectStoreNames.contains('provisionsbestimmungen')) {
                    const pbStore = db.createObjectStore('provisionsbestimmungen', { keyPath: 'id', autoIncrement: true });
                    pbStore.createIndex('versicherer', 'versicherer', { unique: false });
                    pbStore.createIndex('gueltig_ab', 'gueltig_ab', { unique: false });
                }

                // Provisionsregeln
                if (!db.objectStoreNames.contains('provisionsregeln')) {
                    const prStore = db.createObjectStore('provisionsregeln', { keyPath: 'id', autoIncrement: true });
                    prStore.createIndex('bestimmung_id', 'bestimmung_id', { unique: false });
                    prStore.createIndex('sparte', 'sparte', { unique: false });
                    prStore.createIndex('provisions_art', 'provisions_art', { unique: false });
                }

                // Verträge
                if (!db.objectStoreNames.contains('vertraege')) {
                    const vStore = db.createObjectStore('vertraege', { keyPath: 'vertrag_id' });
                    vStore.createIndex('sparte', 'sparte', { unique: false });
                    vStore.createIndex('vermittler_nummer', 'vermittler_nummer', { unique: false });
                    vStore.createIndex('status', 'status', { unique: false });
                }

                // Abrechnungen
                if (!db.objectStoreNames.contains('abrechnungen')) {
                    const aStore = db.createObjectStore('abrechnungen', { keyPath: 'id', autoIncrement: true });
                    aStore.createIndex('periode', 'periode', { unique: false });
                    aStore.createIndex('vermittler_nummer', 'vermittler_nummer', { unique: false });
                }

                // Abrechnungspositionen
                if (!db.objectStoreNames.contains('positionen')) {
                    const apStore = db.createObjectStore('positionen', { keyPath: 'id', autoIncrement: true });
                    apStore.createIndex('abrechnung_id', 'abrechnung_id', { unique: false });
                    apStore.createIndex('vertrag_id', 'vertrag_id', { unique: false });
                }

                // Dokumente
                if (!db.objectStoreNames.contains('dokumente')) {
                    const dStore = db.createObjectStore('dokumente', { keyPath: 'id', autoIncrement: true });
                    dStore.createIndex('dokument_typ', 'dokument_typ', { unique: false });
                    dStore.createIndex('referenz_id', 'referenz_id', { unique: false });
                }

                // Tarifänderungen
                if (!db.objectStoreNames.contains('tarifaenderungen')) {
                    const tStore = db.createObjectStore('tarifaenderungen', { keyPath: 'id', autoIncrement: true });
                    tStore.createIndex('versicherer', 'versicherer', { unique: false });
                    tStore.createIndex('sparte', 'sparte', { unique: false });
                }
            };
        });
    }

    // ========================================================================
    // GENERISCHE CRUD OPERATIONEN
    // ========================================================================

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getById(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            data.created_at = new Date().toISOString();
            const request = store.add(data);
            request.onsuccess = () => resolve({ ...data, id: request.result });
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            data.updated_at = new Date().toISOString();
            const request = store.put(data);
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve({ deleted: true });
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================================================
    // PROVISIONSBESTIMMUNGEN
    // ========================================================================

    async getProvisionsbestimmungen() {
        const bestimmungen = await this.getAll('provisionsbestimmungen');
        // Anzahl Regeln hinzufügen
        for (const b of bestimmungen) {
            const regeln = await this.getByIndex('provisionsregeln', 'bestimmung_id', b.id);
            b.anzahl_regeln = regeln.length;
        }
        return bestimmungen;
    }

    async getProvisionsbestimmungById(id) {
        const bestimmung = await this.getById('provisionsbestimmungen', parseInt(id));
        if (bestimmung) {
            bestimmung.regeln = await this.getByIndex('provisionsregeln', 'bestimmung_id', bestimmung.id);
        }
        return bestimmung;
    }

    async createProvisionsbestimmung(data) {
        return this.add('provisionsbestimmungen', data);
    }

    async deleteProvisionsbestimmung(id) {
        // Erst Regeln löschen
        const regeln = await this.getByIndex('provisionsregeln', 'bestimmung_id', parseInt(id));
        for (const r of regeln) {
            await this.delete('provisionsregeln', r.id);
        }
        return this.delete('provisionsbestimmungen', parseInt(id));
    }

    // ========================================================================
    // PROVISIONSREGELN
    // ========================================================================

    async getProvisionsregeln(bestimmungId = null) {
        if (bestimmungId) {
            return this.getByIndex('provisionsregeln', 'bestimmung_id', parseInt(bestimmungId));
        }
        return this.getAll('provisionsregeln');
    }

    async createProvisionsregel(data) {
        return this.add('provisionsregeln', data);
    }

    async deleteProvisionsregel(id) {
        return this.delete('provisionsregeln', parseInt(id));
    }

    async sucheRelevantRegeln(params) {
        let regeln = await this.getAll('provisionsregeln');

        if (params.sparte) {
            regeln = regeln.filter(r => r.sparte === params.sparte);
        }
        if (params.provisions_art) {
            regeln = regeln.filter(r => r.provisions_art === params.provisions_art);
        }
        if (params.produkt) {
            regeln = regeln.filter(r => !r.produkt_typ || r.produkt_typ === params.produkt);
        }

        // Bestimmungsnamen hinzufügen
        for (const r of regeln) {
            const b = await this.getById('provisionsbestimmungen', r.bestimmung_id);
            if (b) {
                r.bestimmung_name = b.name;
                r.versicherer = b.versicherer;
            }
        }

        return regeln;
    }

    // ========================================================================
    // VERTRÄGE
    // ========================================================================

    async getVertraege(filters = {}) {
        let vertraege = await this.getAll('vertraege');

        if (filters.vermittler_nummer) {
            vertraege = vertraege.filter(v => v.vermittler_nummer === filters.vermittler_nummer);
        }
        if (filters.sparte) {
            vertraege = vertraege.filter(v => v.sparte === filters.sparte);
        }

        return vertraege.sort((a, b) => new Date(b.vertragsbeginn) - new Date(a.vertragsbeginn));
    }

    async getVertragById(vertragId) {
        return this.getById('vertraege', vertragId);
    }

    async createVertrag(data) {
        // Vertraege haben vertrag_id als keyPath, nicht auto-increment
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('vertraege', 'readwrite');
            const store = transaction.objectStore('vertraege');
            data.created_at = new Date().toISOString();
            const request = store.put(data);
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteVertrag(vertragId) {
        return this.delete('vertraege', vertragId);
    }

    async batchCreateVertraege(vertraege) {
        let inserted = 0;
        for (const v of vertraege) {
            try {
                await this.createVertrag(v);
                inserted++;
            } catch (e) {
                console.warn('Vertrag existiert bereits:', v.vertrag_id);
            }
        }
        return { inserted, total: vertraege.length };
    }

    // ========================================================================
    // ABRECHNUNGEN
    // ========================================================================

    async getAbrechnungen(filters = {}) {
        let abrechnungen = await this.getAll('abrechnungen');

        if (filters.vermittler_nummer) {
            abrechnungen = abrechnungen.filter(a => a.vermittler_nummer === filters.vermittler_nummer);
        }
        if (filters.periode) {
            abrechnungen = abrechnungen.filter(a => a.periode === filters.periode);
        }

        return abrechnungen.sort((a, b) => b.abrechnungs_jahr - a.abrechnungs_jahr || b.abrechnungs_monat - a.abrechnungs_monat);
    }

    async getAbrechnungById(id) {
        const abrechnung = await this.getById('abrechnungen', parseInt(id));
        if (abrechnung) {
            abrechnung.positionen = await this.getByIndex('positionen', 'abrechnung_id', abrechnung.id);
            abrechnung.positionen.sort((a, b) => a.position_nummer - b.position_nummer);
        }
        return abrechnung;
    }

    async createAbrechnung(data) {
        data.abrechnung_id = data.abrechnung_id || `ABR-${Date.now()}`;
        return this.add('abrechnungen', data);
    }

    async deleteAbrechnung(id) {
        // Erst Positionen löschen
        const positionen = await this.getByIndex('positionen', 'abrechnung_id', parseInt(id));
        for (const p of positionen) {
            await this.delete('positionen', p.id);
        }
        return this.delete('abrechnungen', parseInt(id));
    }

    // ========================================================================
    // POSITIONEN
    // ========================================================================

    async getPositionen(abrechnungId = null) {
        if (abrechnungId) {
            return this.getByIndex('positionen', 'abrechnung_id', parseInt(abrechnungId));
        }
        return this.getAll('positionen');
    }

    async createPosition(data) {
        return this.add('positionen', data);
    }

    async batchCreatePositionen(abrechnungId, positionen) {
        let inserted = 0;
        for (const p of positionen) {
            p.abrechnung_id = abrechnungId;
            await this.createPosition(p);
            inserted++;
        }
        return { inserted, total: positionen.length };
    }

    // ========================================================================
    // DOKUMENTE
    // ========================================================================

    async getDokumente(typ = null) {
        if (typ) {
            return this.getByIndex('dokumente', 'dokument_typ', typ);
        }
        return this.getAll('dokumente');
    }

    async getDokumentById(id) {
        return this.getById('dokumente', parseInt(id));
    }

    async createDokument(data) {
        return this.add('dokumente', data);
    }

    async deleteDokument(id) {
        return this.delete('dokumente', parseInt(id));
    }

    // ========================================================================
    // TARIFÄNDERUNGEN
    // ========================================================================

    async getTarifaenderungen() {
        return this.getAll('tarifaenderungen');
    }

    async createTarifaenderung(data) {
        return this.add('tarifaenderungen', data);
    }

    // ========================================================================
    // STATISTIKEN
    // ========================================================================

    async getStatistiken() {
        return {
            provisionsbestimmungen: (await this.getAll('provisionsbestimmungen')).length,
            provisionsregeln: (await this.getAll('provisionsregeln')).length,
            vertraege: (await this.getAll('vertraege')).length,
            abrechnungen: (await this.getAll('abrechnungen')).length,
            positionen: (await this.getAll('positionen')).length,
            dokumente: (await this.getAll('dokumente')).length
        };
    }

    // ========================================================================
    // HEALTH CHECK (immer ok bei lokal)
    // ========================================================================

    async healthCheck() {
        return { healthy: true, mode: 'local', timestamp: new Date().toISOString() };
    }
}

// Globale Instanz
const localDb = new LocalDatabase();
