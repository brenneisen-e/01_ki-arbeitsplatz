/**
 * BillingCheck - Billing Explainer Module
 * Erklärt jede Position einer Provisionsabrechnung detailliert
 *
 * Features:
 * - Verknüpfung mit dem zugrundeliegenden Vertrag
 * - Bezug zu Provisionsbestimmungen
 * - Erklärung von Dynamik, Tarifänderungen, Storno
 * - Nachvollziehbare Berechnungsschritte
 *
 * Version: 1.0.0
 */

class BillingExplainer {
    constructor() {
        this.currentAbrechnung = null;
        this.provisionsbestimmungen = [];
        this.vertraege = new Map();
        this.tarifaenderungen = [];
        this.isInitialized = false;
    }

    // ========================================================================
    // INITIALISIERUNG
    // ========================================================================

    async init() {
        if (!d1Api.isReady()) {
            console.warn('D1 API nicht konfiguriert. Billing Explainer arbeitet im Offline-Modus.');
            return;
        }

        try {
            // Lade alle Provisionsbestimmungen
            this.provisionsbestimmungen = await d1Api.getProvisionsbestimmungen();

            // Lade Tarifänderungen
            this.tarifaenderungen = await d1Api.getTarifaenderungen();

            this.isInitialized = true;
            console.log('Billing Explainer initialisiert');
        } catch (error) {
            console.error('Fehler beim Initialisieren des Billing Explainers:', error);
        }
    }

    // ========================================================================
    // ABRECHNUNG LADEN UND ERKLÄREN
    // ========================================================================

    /**
     * Lädt eine Abrechnung und erklärt alle Positionen
     */
    async erklaereAbrechnung(abrechnungId) {
        if (!d1Api.isReady()) {
            throw new Error('Bitte zuerst die API URL in den Einstellungen konfigurieren.');
        }

        // Hole Abrechnung mit Positionen
        this.currentAbrechnung = await d1Api.getAbrechnungById(abrechnungId);

        if (!this.currentAbrechnung) {
            throw new Error('Abrechnung nicht gefunden');
        }

        // Hole alle referenzierten Verträge
        await this.ladeReferenzierteVertraege();

        // Erkläre jede Position
        const erklaerungen = [];
        for (const position of this.currentAbrechnung.positionen) {
            const erklaerung = await this.erklaerePosition(position);
            erklaerungen.push(erklaerung);
        }

        return {
            abrechnung: this.currentAbrechnung,
            erklaerungen,
            zusammenfassung: this.erstelleZusammenfassung(erklaerungen)
        };
    }

    /**
     * Lädt alle in der Abrechnung referenzierten Verträge
     */
    async ladeReferenzierteVertraege() {
        const vertragIds = this.currentAbrechnung.positionen
            .filter(p => p.vertrag_id)
            .map(p => p.vertrag_id);

        const uniqueIds = [...new Set(vertragIds)];

        for (const vertragId of uniqueIds) {
            if (!this.vertraege.has(vertragId)) {
                try {
                    const vertrag = await d1Api.getVertragById(vertragId);
                    this.vertraege.set(vertragId, vertrag);
                } catch (error) {
                    console.warn(`Vertrag ${vertragId} nicht gefunden`);
                }
            }
        }
    }

    // ========================================================================
    // EINZELPOSITION ERKLÄREN
    // ========================================================================

    /**
     * Erstellt eine detaillierte Erklärung für eine einzelne Position
     */
    async erklaerePosition(position) {
        const erklaerung = {
            position_nummer: position.position_nummer,
            position_id: position.id,
            positions_art: position.positions_art,
            brutto_betrag: position.brutto_betrag,

            // Basis-Erklärung
            typ_erklaerung: this.erklaerePositionsTyp(position.positions_art),

            // Vertragsreferenz
            vertrag: null,
            vertrag_erklaerung: null,

            // Provisionsbestimmung
            regelwerk_referenz: null,
            paragraph: null,

            // Berechnung
            berechnung: null,

            // Besonderheiten
            besonderheiten: [],

            // Tarifänderungen
            tarifaenderungen: [],

            // KI-Erklärung (wird separat befüllt)
            ki_erklaerung: null
        };

        // Vertrag laden und erklären
        if (position.vertrag_id) {
            erklaerung.vertrag = this.vertraege.get(position.vertrag_id);
            if (erklaerung.vertrag) {
                erklaerung.vertrag_erklaerung = this.erklaereVertrag(erklaerung.vertrag);
            }
        }

        // Passende Provisionsregel finden
        const regel = await this.findePassendeRegel(position);
        if (regel) {
            erklaerung.regelwerk_referenz = {
                bestimmung: regel.bestimmung_name,
                versicherer: regel.versicherer,
                gueltig_ab: regel.gueltig_ab
            };
            erklaerung.paragraph = regel.paragraph_referenz;

            // Berechnung erklären
            erklaerung.berechnung = this.erklaereBerechnung(position, regel, erklaerung.vertrag);
        }

        // Besonderheiten identifizieren
        erklaerung.besonderheiten = this.identifiziereBesonderheiten(position, erklaerung.vertrag, regel);

        // Relevante Tarifänderungen finden
        if (position.versicherer && position.sparte) {
            erklaerung.tarifaenderungen = this.findeTarifaenderungen(
                position.versicherer,
                position.sparte,
                this.currentAbrechnung.periode
            );
        }

        return erklaerung;
    }

    // ========================================================================
    // POSITIONSTYP ERKLÄRUNG
    // ========================================================================

    erklaerePositionsTyp(typ) {
        const typen = {
            'AP': {
                name: 'Abschlussprovision',
                beschreibung: 'Einmalige Vergütung für den erfolgreichen Abschluss eines Versicherungsvertrags.',
                berechnung: 'Wird typischerweise auf Basis der Beitragssumme (bei LV) oder des Jahresbeitrags (bei Sach) berechnet.',
                haftung: 'Unterliegt der Stornohaftung gemäß den Provisionsbestimmungen.'
            },
            'BP': {
                name: 'Bestandsprovision',
                beschreibung: 'Laufende Vergütung für die Betreuung bestehender Verträge.',
                berechnung: 'Wird meist prozentual vom laufenden Beitrag berechnet, oft quartals- oder jährlich.',
                haftung: 'Keine Stornohaftung, endet mit Vertragsbeendigung.'
            },
            'DP': {
                name: 'Dynamikprovision',
                beschreibung: 'Provision für die Beitragserhöhung durch eine vereinbarte Dynamik.',
                berechnung: 'Berechnet sich aus dem Erhöhungsbetrag, meist mit reduziertem Satz gegenüber der AP.',
                haftung: 'Kann eigene Haftungszeit haben oder der AP-Haftung folgen.'
            },
            'SP': {
                name: 'Superprovision',
                beschreibung: 'Zusätzliche Provision für Führungskräfte auf Basis der Produktion untergeordneter Vermittler.',
                berechnung: 'Prozentualer Anteil der AP/BP der zugeordneten Vermittler.',
                haftung: 'Folgt der Haftung der zugrundeliegenden Provision.'
            },
            'STORNO': {
                name: 'Stornorückforderung',
                beschreibung: 'Rückbuchung bereits gezahlter Provision wegen vorzeitiger Vertragsbeendigung.',
                berechnung: 'Berechnet sich aus der ursprünglichen Provision multipliziert mit der Rückforderungsquote.',
                haftung: 'Reduziert sich mit fortschreitender Vertragsdauer gemäß Stornostaffel.'
            },
            'NACHBERECHNUNG': {
                name: 'Nachberechnung',
                beschreibung: 'Korrektur einer früheren Provisionsabrechnung.',
                berechnung: 'Differenz zwischen ursprünglicher und korrigierter Berechnung.',
                haftung: 'Folgt den Regeln der ursprünglichen Provisionsart.'
            },
            'BONUS': {
                name: 'Bonusprovision',
                beschreibung: 'Zusätzliche Vergütung bei Erreichen bestimmter Ziele oder Qualitätskriterien.',
                berechnung: 'Gemäß individueller Vereinbarung oder Bonusvereinbarung.',
                haftung: 'Meist keine Stornohaftung.'
            },
            'SONSTIG': {
                name: 'Sonstige Position',
                beschreibung: 'Andere Vergütungsart oder Abzug.',
                berechnung: 'Individuell gemäß Beschreibung.',
                haftung: 'Abhängig vom konkreten Fall.'
            }
        };

        return typen[typ] || {
            name: typ,
            beschreibung: 'Unbekannter Positionstyp',
            berechnung: 'Keine Standard-Berechnung definiert',
            haftung: 'Nicht spezifiziert'
        };
    }

    // ========================================================================
    // VERTRAG ERKLÄRUNG
    // ========================================================================

    erklaereVertrag(vertrag) {
        if (!vertrag) return null;

        const heute = new Date();
        const vertragsbeginn = new Date(vertrag.vertragsbeginn);
        const laufzeitMonate = Math.floor((heute - vertragsbeginn) / (1000 * 60 * 60 * 24 * 30));

        return {
            zusammenfassung: `${vertrag.produkt_name} (${vertrag.sparte}) bei ${vertrag.versicherer}`,
            vertragsbeginn: vertrag.vertragsbeginn,
            laufzeit_bisher: `${Math.floor(laufzeitMonate / 12)} Jahre, ${laufzeitMonate % 12} Monate`,
            beitrag: {
                zahlweise: vertrag.zahlweise || 'monatlich',
                betrag: vertrag.beitrag,
                jahresbeitrag: vertrag.jahresbeitrag || vertrag.beitrag * 12
            },
            status: vertrag.status,
            dynamik: vertrag.hat_dynamik ? {
                aktiv: true,
                prozent: vertrag.dynamik_prozent,
                typ: vertrag.dynamik_typ,
                naechste: vertrag.naechste_dynamik
            } : { aktiv: false },
            vermittler: {
                nummer: vertrag.vermittler_nummer,
                name: vertrag.vermittler_name
            }
        };
    }

    // ========================================================================
    // PASSENDE REGEL FINDEN
    // ========================================================================

    async findePassendeRegel(position) {
        try {
            const regeln = await d1Api.sucheRelevantRegeln({
                sparte: position.sparte,
                produkt: position.produkt,
                versicherer: position.versicherer,
                provisions_art: position.positions_art,
                datum: this.currentAbrechnung?.periode
            });

            // Beste Übereinstimmung finden
            if (regeln && regeln.length > 0) {
                // Priorisiere exakte Produkt-Matches
                const exaktMatch = regeln.find(r => r.produkt_typ === position.produkt);
                return exaktMatch || regeln[0];
            }
        } catch (error) {
            console.warn('Konnte keine passende Regel finden:', error);
        }

        return null;
    }

    // ========================================================================
    // BERECHNUNG ERKLÄREN
    // ========================================================================

    erklaereBerechnung(position, regel, vertrag) {
        if (!regel) {
            return {
                hinweis: 'Keine passende Provisionsregel gefunden. Berechnung kann nicht nachvollzogen werden.',
                schritte: []
            };
        }

        const schritte = [];
        let aktuellerWert = 0;

        // Schritt 1: Bezugsgröße bestimmen
        let bezugsgroesse = position.bezugsgroesse_wert;
        let bezugsgroesseName = position.bezugsgroesse_name || regel.bezugsgroesse;

        if (!bezugsgroesse && vertrag) {
            // Bezugsgröße aus Vertrag ermitteln
            switch (regel.bezugsgroesse) {
                case 'Beitragssumme':
                    bezugsgroesse = vertrag.beitragssumme;
                    break;
                case 'Jahresbeitrag':
                    bezugsgroesse = vertrag.jahresbeitrag || vertrag.beitrag * 12;
                    break;
                case 'Bewertungssumme':
                case 'BWS':
                    bezugsgroesse = vertrag.bewertungssumme;
                    break;
                case 'Versicherungssumme':
                    bezugsgroesse = vertrag.versicherungssumme;
                    break;
                default:
                    bezugsgroesse = vertrag.jahresbeitrag || vertrag.beitrag * 12;
            }
        }

        schritte.push({
            schritt: 1,
            beschreibung: `Bezugsgröße ermitteln: ${bezugsgroesseName}`,
            wert: bezugsgroesse,
            formel: `${bezugsgroesseName} = ${this.formatCurrency(bezugsgroesse)}`
        });

        // Schritt 2: Faktor anwenden (falls vorhanden)
        if (regel.bezugsgroesse_faktor && regel.bezugsgroesse_faktor !== 1.0) {
            const vorher = bezugsgroesse;
            bezugsgroesse = bezugsgroesse * regel.bezugsgroesse_faktor;
            schritte.push({
                schritt: 2,
                beschreibung: `Bezugsgrößen-Faktor anwenden`,
                wert: bezugsgroesse,
                formel: `${this.formatCurrency(vorher)} × ${regel.bezugsgroesse_faktor} = ${this.formatCurrency(bezugsgroesse)}`
            });
        }

        // Schritt 3: Provisionssatz anwenden
        const provisionsSatz = position.provisions_satz || regel.provisions_satz;
        aktuellerWert = bezugsgroesse * (provisionsSatz / 100);

        schritte.push({
            schritt: schritte.length + 1,
            beschreibung: `Provisionssatz anwenden: ${provisionsSatz}%`,
            wert: aktuellerWert,
            formel: `${this.formatCurrency(bezugsgroesse)} × ${provisionsSatz}% = ${this.formatCurrency(aktuellerWert)}`
        });

        // Schritt 4: Bei Storno - Rückforderungsquote
        if (position.ist_storno && position.storno_quote) {
            const originalBetrag = position.original_provisions_betrag || aktuellerWert;
            aktuellerWert = originalBetrag * (position.storno_quote / 100) * -1;

            schritte.push({
                schritt: schritte.length + 1,
                beschreibung: `Storno-Rückforderung mit Quote ${position.storno_quote}%`,
                wert: aktuellerWert,
                formel: `${this.formatCurrency(originalBetrag)} × ${position.storno_quote}% × (-1) = ${this.formatCurrency(aktuellerWert)}`
            });
        }

        // Schritt 5: Bei Dynamik
        if (position.ist_dynamik && position.dynamik_erhoehung_betrag) {
            const dynamikSatz = regel.dynamik_provisions_satz || provisionsSatz;
            aktuellerWert = position.dynamik_erhoehung_betrag * (dynamikSatz / 100);

            schritte.push({
                schritt: schritte.length + 1,
                beschreibung: `Dynamik-Erhöhung berechnen (Satz: ${dynamikSatz}%)`,
                wert: aktuellerWert,
                formel: `${this.formatCurrency(position.dynamik_erhoehung_betrag)} × ${dynamikSatz}% = ${this.formatCurrency(aktuellerWert)}`
            });
        }

        // Schritt 6: Bei Superprovision
        if (position.ist_superprovision) {
            schritte.push({
                schritt: schritte.length + 1,
                beschreibung: `Superprovision (Stufe ${position.hierarchie_stufe || 1})`,
                wert: position.brutto_betrag,
                formel: `Anteil an AP/BP des Untervermittlers ${position.ursprungs_vermittler || 'unbekannt'}`
            });
        }

        // Endergebnis vergleichen
        const differenz = Math.abs(aktuellerWert - position.brutto_betrag);
        const abweichung = bezugsgroesse > 0 ? (differenz / Math.abs(position.brutto_betrag)) * 100 : 0;

        return {
            schritte,
            ergebnis: {
                berechnet: aktuellerWert,
                abgerechnet: position.brutto_betrag,
                differenz: differenz,
                abweichung_prozent: abweichung.toFixed(2),
                plausibel: abweichung < 5 // Weniger als 5% Abweichung
            },
            regelwerk: {
                bestimmung: regel.bestimmung_name,
                paragraph: regel.paragraph_referenz,
                seite: regel.seiten_referenz
            }
        };
    }

    // ========================================================================
    // BESONDERHEITEN IDENTIFIZIEREN
    // ========================================================================

    identifiziereBesonderheiten(position, vertrag, regel) {
        const besonderheiten = [];

        // Storno
        if (position.ist_storno) {
            besonderheiten.push({
                typ: 'storno',
                titel: 'Stornorückforderung',
                beschreibung: `Rückforderung von ${position.storno_quote || 100}% der ursprünglichen Provision wegen Vertragsbeendigung.`,
                auswirkung: 'negativ'
            });
        }

        // Dynamik
        if (position.ist_dynamik) {
            besonderheiten.push({
                typ: 'dynamik',
                titel: `Dynamikerhöhung (Stufe ${position.dynamik_stufe || 1})`,
                beschreibung: `Provision für die ${position.dynamik_stufe || 1}. Dynamikerhöhung um ${this.formatCurrency(position.dynamik_erhoehung_betrag)}.`,
                auswirkung: 'positiv'
            });
        }

        // Superprovision
        if (position.ist_superprovision) {
            besonderheiten.push({
                typ: 'superprovision',
                titel: 'Superprovision / Führungsprovision',
                beschreibung: `Provision auf Basis der Produktion von ${position.ursprungs_vermittler || 'untergeordnetem Vermittler'}.`,
                auswirkung: 'positiv'
            });
        }

        // Hohe Einzelprovision
        if (position.brutto_betrag > 5000 && !position.ist_storno) {
            besonderheiten.push({
                typ: 'hohe_provision',
                titel: 'Hohe Einzelprovision',
                beschreibung: `Provision über 5.000€ - ggf. besonders erklärungsbedürftig.`,
                auswirkung: 'hinweis'
            });
        }

        // Vertrag in Stornohaftung
        if (vertrag && regel && regel.haftungszeit_monate) {
            const vertragsbeginn = new Date(vertrag.vertragsbeginn);
            const heute = new Date();
            const laufzeitMonate = Math.floor((heute - vertragsbeginn) / (1000 * 60 * 60 * 24 * 30));

            if (laufzeitMonate < regel.haftungszeit_monate) {
                const verbleibend = regel.haftungszeit_monate - laufzeitMonate;
                besonderheiten.push({
                    typ: 'haftung',
                    titel: 'Vertrag in Stornohaftung',
                    beschreibung: `Noch ${verbleibend} Monate verbleibend (von ${regel.haftungszeit_monate} Monaten).`,
                    auswirkung: 'hinweis'
                });
            }
        }

        return besonderheiten;
    }

    // ========================================================================
    // TARIFÄNDERUNGEN FINDEN
    // ========================================================================

    findeTarifaenderungen(versicherer, sparte, periode) {
        if (!this.tarifaenderungen || this.tarifaenderungen.length === 0) {
            return [];
        }

        return this.tarifaenderungen.filter(ta =>
            ta.versicherer === versicherer &&
            ta.sparte === sparte &&
            ta.gueltig_ab <= periode
        ).slice(0, 5); // Maximal 5 relevante Änderungen
    }

    // ========================================================================
    // ZUSAMMENFASSUNG ERSTELLEN
    // ========================================================================

    erstelleZusammenfassung(erklaerungen) {
        const summe = erklaerungen.reduce((sum, e) => sum + e.brutto_betrag, 0);
        const anzahl = erklaerungen.length;

        const nachTyp = {};
        erklaerungen.forEach(e => {
            const typ = e.positions_art;
            if (!nachTyp[typ]) {
                nachTyp[typ] = { anzahl: 0, summe: 0 };
            }
            nachTyp[typ].anzahl++;
            nachTyp[typ].summe += e.brutto_betrag;
        });

        const mitBesonderheiten = erklaerungen.filter(e => e.besonderheiten.length > 0);

        return {
            gesamt: {
                positionen: anzahl,
                summe: summe
            },
            nach_typ: nachTyp,
            besonderheiten: {
                anzahl: mitBesonderheiten.length,
                positionen: mitBesonderheiten.map(e => ({
                    position: e.position_nummer,
                    besonderheiten: e.besonderheiten
                }))
            }
        };
    }

    // ========================================================================
    // KI-GESTÜTZTE ERKLÄRUNG
    // ========================================================================

    /**
     * Generiert eine natürlichsprachliche Erklärung mit KI
     */
    async generiereKIErklaerung(position, kontext) {
        const apiKey = localStorage.getItem('openai_api_key_encrypted');
        if (!apiKey) {
            return 'Kein OpenAI API Key konfiguriert. Bitte in den Einstellungen hinterlegen.';
        }

        const systemPrompt = `Du bist ein Experte für Versicherungsprovisionen und erklärst einem Versicherungsvermittler seine Provisionsabrechnung.

Erkläre die folgende Position verständlich und vollständig:
- Was ist das für eine Provisionsart?
- Auf welchen Vertrag bezieht sie sich?
- Wie wurde der Betrag berechnet?
- Welche Provisionsbestimmung gilt?
- Gibt es Besonderheiten (Dynamik, Storno, etc.)?

Antworte präzise und fachlich korrekt, aber verständlich. Verwende konkrete Zahlen aus dem Kontext.`;

        const userPrompt = `Position: ${JSON.stringify(position, null, 2)}

Kontext:
${JSON.stringify(kontext, null, 2)}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.decryptApiKey(apiKey)}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'Keine Erklärung generiert.';
        } catch (error) {
            console.error('KI-Erklärung fehlgeschlagen:', error);
            return `Fehler bei der KI-Erklärung: ${error.message}`;
        }
    }

    // ========================================================================
    // HILFSMETHODEN
    // ========================================================================

    formatCurrency(value) {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    }

    decryptApiKey(encrypted) {
        // Einfache XOR-Entschlüsselung (wie in openai-client.js)
        const key = 'billingcheck_key';
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    }
}

// Globale Instanz
const billingExplainer = new BillingExplainer();
