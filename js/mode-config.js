// js/mode-config.js – Unified Mode Configuration Layer (ARCH-01)
// Steuert verschiedene Vertriebs-Modi über ein zentrales Config-Objekt.
// Bestehender Code bleibt unverändert – dieses Modul ist rein additiv.
// Neue OPT-Funktionen nutzen getModeConfig() statt hardcoded If-Else.

(function() {
    'use strict';

    // ========================================
    // MODE CONFIG DEFINITIONS
    // ========================================

    var MODE_CONFIGS = {

        // ─── VERSICHERUNG (A-02 / A-10) ───────────────────────
        versicherung: {
            id: 'versicherung',
            label: 'Versicherungsvermittler',

            branding: {
                name: 'ERGO',
                color: '#d4002a',
                accent: '#1a1a2e',
                gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                headerBg: '#1a1a2e'
            },

            // A-02 Overview
            overview: {
                kpis: ['neugeschaeft', 'bestand', 'storno', 'nps', 'risiko', 'combined', 'ergebnis', 'underwriting', 'deckungsbeitrag'],
                tabs: ['uebersicht', 'stammdaten', 'neugeschaeft', 'bestand', 'storno', 'provision', 'qualitaet', 'kundenliste', 'potentiale'],
                tabLabels: {
                    uebersicht: 'Übersicht',
                    stammdaten: 'Stammdaten',
                    neugeschaeft: 'Neugeschäft',
                    bestand: 'Bestand',
                    storno: 'Storno',
                    provision: 'Vergütung',
                    qualitaet: 'Qualität',
                    kundenliste: 'Kunden',
                    potentiale: 'Potentiale'
                },
                headerFields: ['name', 'vermittlerId', 'standort', 'seit'],
                getKunden: function() { return window.mockKunden || {}; },
                getVertraege: function() { return window.kundenBestandVertraege || []; }
            },

            // A-10 Kunden-Detail
            detail: {
                tabs: ['stammdaten', 'vertraege', 'fida', 'impulse', 'finanzplanung', 'kommunikation'],
                tabLabels: {
                    stammdaten: 'Stammdaten',
                    vertraege: 'Betreute Verträge',
                    fida: 'Open Finance',
                    impulse: 'Impulse',
                    finanzplanung: 'Finanzplanung',
                    kommunikation: 'Kommunikation'
                },
                getKunde: function(name) {
                    var mk = window.mockKunden;
                    return mk ? mk[name] : null;
                },
                produkttypen: ['Leben', 'Kranken', 'Schaden/Unfall', 'Kfz', 'Haftpflicht', 'Hausrat', 'Wohngebäude', 'BU'],
                fidaMode: 'optional',
                clvBerechnung: 'versicherung'
            },

            // Chat
            chat: {
                botName: 'KI-Assistent',
                apiUrl: window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev',
                keywords: {
                    storno: 'Storno-Analyse',
                    provision: 'Provisions-Auskunft',
                    neugeschaeft: 'Vertriebsempfehlung',
                    kunde: 'Kundeninfo',
                    potentiale: 'Vertriebspotentiale'
                },
                quickActions: ['Stornoquote analysieren', 'Top-Kunden zeigen', 'Neugeschäft-Trend', 'Neue Potentiale?']
            },

            // Impulse
            impulse: {
                herkunftLabel: 'Vertriebsimpuls',
                regeln: [
                    {
                        id: 'bu-luecke',
                        impuls: 'BU-Lücke schließen',
                        prioritaet: 'hoch',
                        produkt: 'BU-Nachversicherung',
                        bedingung: function(k) {
                            if (!k || !k.vertraege) return false;
                            var hasBU = false;
                            for (var i = 0; i < k.vertraege.length; i++) {
                                if (k.vertraege[i].typ && k.vertraege[i].typ.indexOf('BU') > -1) { hasBU = true; break; }
                                if (k.vertraege[i].typ && k.vertraege[i].typ.indexOf('Berufsunfähig') > -1) { hasBU = true; break; }
                            }
                            return !hasBU;
                        }
                    },
                    {
                        id: 'rlv-fehlt',
                        impuls: 'Risikolebensversicherung fehlt',
                        prioritaet: 'hoch',
                        produkt: 'Risikolebensversicherung',
                        bedingung: function(k) {
                            if (!k || !k.vertraege || !k.kinder || k.kinder.length === 0) return false;
                            var hasRLV = false;
                            for (var i = 0; i < k.vertraege.length; i++) {
                                if (k.vertraege[i].typ && (k.vertraege[i].typ.indexOf('Risiko') > -1 || k.vertraege[i].typ.indexOf('RLV') > -1)) { hasRLV = true; break; }
                            }
                            return !hasRLV;
                        }
                    },
                    {
                        id: 'bu-unterdeckung',
                        impuls: 'BU-Absicherung unter Empfehlung',
                        prioritaet: 'mittel',
                        produkt: 'BU-Erhöhung',
                        bedingung: function(k) {
                            if (!k || !k.vertraege) return false;
                            for (var i = 0; i < k.vertraege.length; i++) {
                                var v = k.vertraege[i];
                                if (v.typ && v.typ.indexOf('Berufsunfähig') > -1 && v.details) {
                                    var match = v.details.match(/(\d[\d.,]*)\s*€?\/?Mon/i);
                                    if (match) {
                                        var buRente = parseFloat(match[1].replace('.', '').replace(',', '.'));
                                        if (buRente < 2000) return true;
                                    }
                                }
                            }
                            return false;
                        }
                    },
                    {
                        id: 'kfz-wechsel',
                        impuls: 'Kfz-Versicherung prüfen',
                        prioritaet: 'mittel',
                        produkt: 'Kfz-Wechsel',
                        bedingung: function(k) {
                            if (!k || !k.fidaVertraege) return false;
                            for (var i = 0; i < k.fidaVertraege.length; i++) {
                                if (k.fidaVertraege[i].typ && k.fidaVertraege[i].typ.indexOf('Kfz') > -1) return true;
                            }
                            return false;
                        }
                    },
                    {
                        id: 'fida-consent-abgelaufen',
                        impuls: 'FIDA-Consent erneuern',
                        prioritaet: 'mittel',
                        produkt: null,
                        bedingung: function(k) {
                            if (!k || !k.fidaVertraege) return false;
                            var now = new Date();
                            for (var i = 0; i < k.fidaVertraege.length; i++) {
                                var gueltig = k.fidaVertraege[i].gueltig;
                                if (gueltig) {
                                    var parts = gueltig.split('.');
                                    if (parts.length === 3) {
                                        var d = new Date(parts[2], parts[1] - 1, parts[0]);
                                        if (d < now) return true;
                                    }
                                }
                            }
                            return false;
                        }
                    },
                    {
                        id: 'nps-detractor',
                        impuls: 'Zufriedenheitsgespräch führen',
                        prioritaet: 'hoch',
                        produkt: null,
                        bedingung: function(k) {
                            return k && k.nps && k.nps.score <= 6;
                        }
                    }
                ]
            },

            // Potentiale (UNIFY-01)
            potentiale: {
                kpiBoxes: [
                    { key: 'consent', label: 'Consent-Kunden', icon: 'users', format: 'number' },
                    { key: 'identified', label: 'Identifizierte Potentiale', icon: 'star', format: 'number' },
                    { key: 'volume', label: 'Geschätztes Prämienvolumen', icon: 'euro', format: 'currency' },
                    { key: 'conversion', label: 'Conversion-Rate', icon: 'trending-up', format: 'percent' }
                ],
                pipelineSteps: ['identifiziert', 'angeschrieben', 'termin', 'abgeschlossen'],
                statusLabels: {
                    identifiziert: 'Identifiziert',
                    angeschrieben: 'Angeschrieben',
                    termin: 'Termin vereinbart',
                    abgeschlossen: 'Abgeschlossen'
                },
                branding: 'KI-Vertriebsassistent',
                brandingBadge: 'Open Finance KI-Analyse',
                produktTypen: ['Risikolebensversicherung', 'Fondspolice', 'Kfz-Wechsel', 'BU-Nachversicherung', 'Rechtsschutz', 'Hausrat', 'Umschuldung'],
                quellenLabels: ['Open Finance', 'Bestandsdaten', 'PSD2'],
                quellenKategorien: ['finanztransaktion', 'bestand', 'kommunikation', 'wettbewerb', 'lebensereignis', 'markt'],
                getPotentiale: function() { return window.vertriebsPotentiale || []; },
                openKundenDetail: function(name, id) {
                    if (typeof openKundenDetail === 'function') openKundenDetail(name);
                }
            }
        },

        // ─── BANKING (B-02 / B-10) ────────────────────────────
        banking: {
            id: 'banking',
            label: 'Bankberater',

            branding: {
                name: 'Volksbank',
                color: '#003399',
                accent: '#FF6600',
                gradient: 'linear-gradient(135deg, #003399, #001a66)',
                headerBg: '#003399'
            },

            // B-02 Overview
            overview: {
                kpis: ['ertrag', 'kunden', 'crossSelling', 'abwanderung'],
                tabs: ['uebersicht', 'stammdaten', 'neugeschaeft', 'ertraege', 'qualitaet', 'potentiale', 'kreditportfolio', 'kundenliste'],
                tabLabels: {
                    uebersicht: 'Übersicht',
                    stammdaten: 'Stammdaten',
                    neugeschaeft: 'Neugeschäft',
                    ertraege: 'Erträge',
                    qualitaet: 'Qualität',
                    potentiale: 'Potentiale',
                    kreditportfolio: 'Kreditportfolio',
                    kundenliste: 'Kunden'
                },
                headerFields: ['name', 'beraterId', 'filiale', 'position'],
                getKunden: function() { return window.bankMockKunden || {}; },
                getVertraege: function() { return null; },
                subModes: ['retail', 'fk', 'vw']
            },

            // B-10 Kunden-Detail
            detail: {
                tabs: ['stammdaten', 'konten', 'fida', 'impulse', 'finanzplanung', 'kommunikation'],
                tabLabels: {
                    stammdaten: 'Stammdaten',
                    konten: 'Produkte',
                    fida: 'Open Finance',
                    impulse: 'Impulse',
                    finanzplanung: 'Finanzplanung',
                    kommunikation: 'Kommunikation'
                },
                getKunde: function(name) {
                    var bk = window.bankMockKunden;
                    return bk ? bk[name] : null;
                },
                produkttypen: ['Girokonto', 'Sparkonto', 'Tagesgeld', 'Depot', 'Baufinanzierung', 'Konsumentenkredit', 'Riester'],
                fidaMode: 'zentral',
                clvBerechnung: 'banking'
            },

            // Chat
            chat: {
                botName: 'genoGPT Vertriebs-Assistent',
                apiUrl: window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev',
                keywords: {
                    'top 5': 'Kundenliste nach Ertrag',
                    finanzplan: 'FinanzPlan-Hinweise',
                    'open finance': 'FIDA/PSD3-Info',
                    verbundpartner: 'R+V, Union Investment, Schwäbisch Hall',
                    abwanderung: 'Risiko-Analyse'
                },
                quickActions: ['Top 5 Ertragspotenzial', 'FinanzPlan-Potenziale', 'Open Finance Analyse', 'Verbundpartner', 'Abwanderungsrisiko']
            },

            // Impulse
            impulse: {
                herkunftLabel: 'Truuco Impulsmanager / genoGPT',
                regeln: [
                    {
                        id: 'finanzplan-fehlt',
                        impuls: 'VR-FinanzPlan erstellen',
                        prioritaet: 'hoch',
                        produkt: 'VR-FinanzPlan',
                        bedingung: function(k) {
                            return k && k.finanzplan === false;
                        }
                    },
                    {
                        id: 'fida-cross-selling',
                        impuls: 'Cross-Selling aus Open Finance',
                        prioritaet: 'mittel',
                        produkt: null,
                        bedingung: function(k) {
                            return k && k.fidaVertraege && k.fidaVertraege.length > 0;
                        }
                    },
                    {
                        id: 'fida-consent-einholen',
                        impuls: 'FIDA-Consent einholen',
                        prioritaet: 'mittel',
                        produkt: null,
                        bedingung: function(k) {
                            return k && (!k.fidaVertraege || k.fidaVertraege.length === 0);
                        }
                    },
                    {
                        id: 'produktbreite',
                        impuls: 'Produktbreite erhöhen',
                        prioritaet: 'mittel',
                        produkt: null,
                        bedingung: function(k) {
                            if (!k || !k.konten) return false;
                            return k.konten.length < 4;
                        }
                    },
                    {
                        id: 'nps-detractor',
                        impuls: 'Kundenzufriedenheit verbessern',
                        prioritaet: 'hoch',
                        produkt: null,
                        bedingung: function(k) {
                            return k && k.nps && k.nps.score <= 6;
                        }
                    },
                    {
                        id: 'anschlussfinanzierung',
                        impuls: 'Anschlussfinanzierung vorbereiten',
                        prioritaet: 'hoch',
                        produkt: 'Baufinanzierung',
                        bedingung: function(k) {
                            if (!k || !k.finanzierungen) return false;
                            var now = new Date();
                            for (var i = 0; i < k.finanzierungen.length; i++) {
                                var laufzeit = k.finanzierungen[i].laufzeit;
                                if (laufzeit) {
                                    var parts = laufzeit.split('/');
                                    if (parts.length === 2) {
                                        var end = new Date(parts[1], parseInt(parts[0]) - 1, 1);
                                        var diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
                                        if (diffMonths > 0 && diffMonths <= 18) return true;
                                    }
                                }
                            }
                            return false;
                        }
                    },
                    {
                        id: 'verbundpartner-rv',
                        impuls: 'R+V Versicherungscheck',
                        prioritaet: 'mittel',
                        produkt: 'R+V Versicherung',
                        bedingung: function(k) {
                            if (!k || !k.versicherungenFremd) return false;
                            return k.versicherungenFremd.length > 0;
                        }
                    },
                    {
                        id: 'depot-union',
                        impuls: 'Union Investment Beratung',
                        prioritaet: 'mittel',
                        produkt: 'UnionDepot',
                        bedingung: function(k) {
                            if (!k || !k.sparenKapitalmarkt) return false;
                            var hasUnion = false;
                            for (var i = 0; i < k.sparenKapitalmarkt.length; i++) {
                                if (k.sparenKapitalmarkt[i].anbieter && k.sparenKapitalmarkt[i].anbieter.indexOf('Union') > -1) {
                                    hasUnion = true; break;
                                }
                            }
                            // Has external depot but no Union Investment
                            return !hasUnion && k.fidaVertraege && k.fidaVertraege.some(function(f) {
                                return f.typ && f.typ.indexOf('Depot') > -1;
                            });
                        }
                    }
                ]
            },

            // Potentiale (UNIFY-01)
            potentiale: {
                kpiBoxes: [
                    { key: 'total', label: 'Potentiale gesamt', icon: 'zap', format: 'number' },
                    { key: 'prioritized', label: 'Davon priorisiert', icon: 'star', format: 'number' },
                    { key: 'volume', label: 'Ertragspotential', icon: 'euro', format: 'currency' },
                    { key: 'conversion', label: 'Conversion-Rate', icon: 'trending-up', format: 'percent' }
                ],
                pipelineSteps: ['identifiziert', 'angeschrieben', 'termin', 'abgeschlossen'],
                statusLabels: {
                    identifiziert: 'Identifiziert',
                    angeschrieben: 'Angeschrieben',
                    termin: 'Termin vereinbart',
                    abgeschlossen: 'Abgeschlossen'
                },
                branding: 'Truuco Impulsmanager',
                brandingBadge: 'KI-generiert via Data Intelligence Platform',
                produktTypen: ['Anschlussfinanzierung', 'VR-FinanzPlan', 'VermögenPlus', 'FIDA-Consent + Wero', 'R+V Risikolebensversicherung', 'VR-KlimaKredit', 'DZ PRIVATBANK Nachfolge'],
                quellenLabels: ['Truuco', 'FIDA', 'Impulsmanager', 'Truuco/FIDA'],
                quellenKategorien: ['finanztransaktion', 'bestand', 'kommunikation', 'wettbewerb', 'lebensereignis', 'markt'],
                getPotentiale: function() { return window.bankPotentiale || []; },
                openKundenDetail: function(name, id) {
                    if (typeof openBankKundenDetail === 'function') openBankKundenDetail(name, id);
                }
            }
        }
    };


        // ─── VERMOEGENSVERWALTUNG (VV-02 / VV-10) ─────────────────
        vermoegensverwaltung: {
            id: 'vermoegensverwaltung',
            label: 'Vermögensverwalter',

            branding: {
                name: 'HRK LUNIS',
                color: '#1a365d',
                accent: '#c4a35a',
                gradient: 'linear-gradient(135deg, #1a365d, #2d4a7a)',
                headerBg: '#1a365d'
            },

            // VV-02 Overview
            overview: {
                kpis: ['aum_gesamt', 'net_new_money', 'ertrag_ytd', 'mandatsanzahl', 'avg_marge', 'at_risk'],
                tabs: ['uebersicht', 'mandatsliste', 'pipeline', 'portfolio', 'compliance', 'reporting'],
                tabLabels: {
                    uebersicht: 'Übersicht',
                    mandatsliste: 'Mandate',
                    pipeline: 'Pipeline',
                    portfolio: 'Portfolio-Übersicht',
                    compliance: 'Compliance',
                    reporting: 'Reporting'
                },
                headerFields: ['name', 'beraterId', 'standort', 'teamAuM'],
                getKunden: function() { return window.vvMockMandanten || {}; }
            },

            // VV-10 Mandanten-Detail
            detail: {
                tabs: ['stammdaten', 'portfolio', 'finanzplanung', 'compliance', 'impulse', 'kommunikation'],
                tabLabels: {
                    stammdaten: 'Client 360°',
                    portfolio: 'Portfolio',
                    finanzplanung: 'Vermögensbilanz',
                    compliance: 'Compliance',
                    impulse: 'Potentiale',
                    kommunikation: 'Kommunikation'
                },
                getKunde: function(name) {
                    var mk = window.vvMockMandanten;
                    return mk ? mk[name] : null;
                },
                produkttypen: ['SmartValue ETF', 'FairValue Individual', 'Institutionell', 'Stiftung', 'PE', 'Family Office'],
                fidaMode: 'nicht_relevant',
                clvBerechnung: 'vermoegensverwaltung'
            },

            // Chat
            chat: {
                botName: 'KI-Vertriebsassistent',
                apiUrl: window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev',
                keywords: {
                    portfolio: 'Portfolio-Analyse',
                    rebalancing: 'Rebalancing-Prüfung',
                    compliance: 'Compliance-Status',
                    mandant: 'Mandanteninfo',
                    potentiale: 'Vertriebspotentiale'
                },
                quickActions: [
                    'Portfolio-Performance analysieren',
                    'Rebalancing-Bedarf prüfen',
                    'Compliance-Status Mandant',
                    'Geeignetheitsprüfung vorbereiten',
                    'Marktumfeld Zusammenfassung'
                ]
            },

            // Impulse
            impulse: {
                herkunftLabel: 'KI-Vertriebsassistent',
                regeln: [
                    {
                        id: 'rebalancing',
                        impuls: 'Rebalancing erforderlich',
                        prioritaet: 'hoch',
                        produkt: null,
                        bedingung: function(k) {
                            if (!k || !k.assetAllocation || !k.sollAllocation) return false;
                            var keys = Object.keys(k.sollAllocation);
                            for (var i = 0; i < keys.length; i++) {
                                var diff = Math.abs((k.assetAllocation[keys[i]] || 0) - (k.sollAllocation[keys[i]] || 0));
                                if (diff >= 2) return true;
                            }
                            return false;
                        }
                    },
                    {
                        id: 'wphg-bogen-faellig',
                        impuls: 'WpHG-Bogen Aktualisierung fällig',
                        prioritaet: 'hoch',
                        produkt: null,
                        bedingung: function(k) {
                            if (!k || !k.wphgBogen) return false;
                            var letzte = k.wphgBogen.letzteAktualisierung;
                            if (!letzte) return false;
                            var parts = letzte.split('-');
                            var d = new Date(parts[0], parts[1] - 1, parts[2]);
                            var diffMonths = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
                            return diffMonths >= 10;
                        }
                    },
                    {
                        id: 'geeignetheitsbericht-faellig',
                        impuls: 'Geeignetheitsbericht fällig',
                        prioritaet: 'hoch',
                        produkt: null,
                        bedingung: function(k) {
                            if (!k || !k.geeignetheitsbericht) return false;
                            return k.geeignetheitsbericht.status === 'offen';
                        }
                    },
                    {
                        id: 'verlustschwelle-naehert',
                        impuls: 'Verlustschwelle nähert sich',
                        prioritaet: 'hoch',
                        produkt: null,
                        bedingung: function(k) {
                            if (!k || !k.verlustschwelle || !k.aum) return false;
                            var trigger = k.verlustschwelle.hoechststand * (1 - k.verlustschwelle.schwelle);
                            var puffer = k.aum - trigger;
                            return puffer > 0 && puffer < k.aum * 0.08;
                        }
                    },
                    {
                        id: 'fremdbank-konsolidierung',
                        impuls: 'Fremdbank-Vermögen konsolidieren',
                        prioritaet: 'mittel',
                        produkt: 'Konsolidierung',
                        bedingung: function(k) {
                            return k && k.fremdVermoegen && k.fremdVermoegen.length > 0;
                        }
                    },
                    {
                        id: 'nextgen-mandat',
                        impuls: 'NextGen-Mandat erschließen',
                        prioritaet: 'mittel',
                        produkt: 'SmartValue',
                        bedingung: function(k) {
                            if (!k || !k.kinder) return false;
                            for (var i = 0; i < k.kinder.length; i++) {
                                if (k.kinder[i].alter >= 25 && !k.kinder[i].eigenesMandat) return true;
                            }
                            return false;
                        }
                    },
                    {
                        id: 'nachfolgeplanung',
                        impuls: 'Nachfolgeplanung anstoßen',
                        prioritaet: 'mittel',
                        produkt: 'Stiftung / Nachfolge',
                        bedingung: function(k) {
                            if (!k || !k.geburtsdatum) return false;
                            var parts = k.geburtsdatum.split('-');
                            var alter = new Date().getFullYear() - parseInt(parts[0]);
                            return alter >= 60 && k.unternehmen && k.unternehmen.length > 0;
                        }
                    },
                    {
                        id: 'mandatstyp-upgrade',
                        impuls: 'Mandatstyp-Upgrade anbieten',
                        prioritaet: 'niedrig',
                        produkt: 'FairValue Individual',
                        bedingung: function(k) {
                            return k && k.segment === 'SmartValue' && k.aum >= 3000000;
                        }
                    }
                ]
            },

            // Potentiale (UNIFY-01)
            potentiale: {
                kpiBoxes: [
                    { key: 'mandate', label: 'Aktive Mandate', icon: 'briefcase', format: 'number' },
                    { key: 'pipeline', label: 'Pipeline-Volumen', icon: 'trending-up', format: 'currency' },
                    { key: 'crosssell', label: 'Cross-Selling-Potenzial', icon: 'layers', format: 'currency' },
                    { key: 'atrisk', label: 'At-Risk Mandate', icon: 'alert-triangle', format: 'number' }
                ],
                pipelineSteps: ['lead', 'kennenlerngespraech', 'beratungsgespraech', 'analyse_vorschlag', 'onboarding', 'aktiv'],
                statusLabels: {
                    lead: 'Lead',
                    kennenlerngespraech: 'Kennenlernen',
                    beratungsgespraech: 'Beratung',
                    analyse_vorschlag: 'Analyse/Vorschlag',
                    onboarding: 'Onboarding',
                    aktiv: 'Aktiv'
                },
                branding: 'KI-Vertriebsassistent',
                brandingBadge: 'Wealth Management KI-Analyse',
                produktTypen: ['SmartValue ETF', 'FairValue Individual', 'Institutionell', 'Stiftung', 'PE', 'Family Office'],
                quellenLabels: ['Bestandsdaten', 'Marktdaten', 'Depotbank'],
                quellenKategorien: ['bestand', 'lebensereignis', 'wettbewerb', 'markt', 'finanztransaktion'],
                getPotentiale: function() { return window.vvPotentiale || []; },
                openKundenDetail: function(name, id) {
                    if (typeof openVVMandantDetail === 'function') openVVMandantDetail(name);
                }
            }
        }
    };


    // ========================================
    // MODE STATE & DETECTION
    // ========================================

    var currentMode = 'versicherung';

    /**
     * Returns the active mode config object.
     */
    function getModeConfig(mode) {
        return MODE_CONFIGS[mode || currentMode] || MODE_CONFIGS.versicherung;
    }

    /**
     * Sets the active mode and dispatches a 'modeChanged' event.
     */
    function setMode(mode) {
        if (!MODE_CONFIGS[mode]) return;
        currentMode = mode;
        window.currentMode = mode;
        window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: mode } }));
    }

    /**
     * Detects the current mode from existing application state.
     * Checks CSS classes, localStorage, and viewMode variable.
     */
    function getModeForCurrentView() {
        // 1. Check if A-10 is in bank-mode
        var kundenPage = document.getElementById('kundenDetailPage');
        if (kundenPage && kundenPage.classList.contains('bank-mode')) {
            return 'banking';
        }

        // 1b. Check if VV mode page is visible
        var vvPage = document.getElementById('vvOverviewPage');
        if (vvPage && vvPage.style.display !== 'none') {
            return 'vermoegensverwaltung';
        }
        var vvDetailPage = document.getElementById('vvDetailPage');
        if (vvDetailPage && vvDetailPage.style.display !== 'none') {
            return 'vermoegensverwaltung';
        }

        // 2. Check viewMode global
        if (typeof viewMode !== 'undefined') {
            if (viewMode === 'bank-retail' || viewMode === 'bank-fk' || viewMode === 'bank-vw') {
                return 'banking';
            }
            if (viewMode === 'ao' || viewMode === 'ecclesia' || viewMode === 'mrh') {
                return 'versicherung';
            }
            if (viewMode === 'vv') {
                return 'vermoegensverwaltung';
            }
        }

        // 3. Check localStorage bankViewMode
        try {
            var bvm = localStorage.getItem('bankViewMode');
            if (bvm && (bvm === 'retail' || bvm === 'firmenkunde' || bvm === 'vermoegen')) {
                // bankViewMode exists but only means banking if we're in the berater overview
                var beraterPage = document.getElementById('beraterOverviewPage');
                if (beraterPage && beraterPage.style.display !== 'none') {
                    return 'banking';
                }
            }
        } catch (e) { /* localStorage not available */ }

        // 4. Check previousViewBeforeKundenDetail
        if (typeof previousViewBeforeKundenDetail !== 'undefined' && previousViewBeforeKundenDetail === 'beraterOverview') {
            return 'banking';
        }

        // Default
        return 'versicherung';
    }

    /**
     * Syncs currentMode with the detected application state.
     * Call this when views change to keep mode in sync.
     */
    function syncMode() {
        var detected = getModeForCurrentView();
        if (detected !== currentMode) {
            currentMode = detected;
            window.currentMode = detected;
        }
        return detected;
    }

    /**
     * Returns true if the current mode is banking.
     * Convenience helper for Bank-Mode checks in OPT implementations.
     */
    function isBankMode() {
        syncMode();
        return currentMode === 'banking';
    }

    /**
     * Evaluates impulse rules from the current mode config against a customer object.
     * Returns matched impulses sorted by priority.
     */
    function evaluateImpulse(kunde) {
        if (!kunde) return [];
        var config = getModeConfig();
        var regeln = config.impulse.regeln;
        var matched = [];

        for (var i = 0; i < regeln.length; i++) {
            try {
                if (regeln[i].bedingung(kunde)) {
                    matched.push({
                        id: regeln[i].id,
                        impuls: regeln[i].impuls,
                        prioritaet: regeln[i].prioritaet,
                        produkt: regeln[i].produkt,
                        herkunft: config.impulse.herkunftLabel,
                        branding: config.branding
                    });
                }
            } catch (e) {
                // Defensive: skip rule if data structure doesn't match
            }
        }

        // Sort: hoch first, then mittel, then niedrig
        var prioOrder = { hoch: 0, mittel: 1, niedrig: 2 };
        matched.sort(function(a, b) {
            return (prioOrder[a.prioritaet] || 2) - (prioOrder[b.prioritaet] || 2);
        });

        return matched;
    }

    /**
     * Gets the current banking sub-mode (retail, fk, vw).
     * Only relevant when currentMode === 'banking'.
     */
    function getBankingSubMode() {
        if (typeof viewMode !== 'undefined') {
            if (viewMode === 'bank-fk') return 'fk';
            if (viewMode === 'bank-vw') return 'vw';
            if (viewMode === 'bank-retail') return 'retail';
        }
        try {
            var bvm = localStorage.getItem('bankViewMode');
            if (bvm === 'firmenkunde') return 'fk';
            if (bvm === 'vermoegen') return 'vw';
        } catch (e) {}
        return 'retail';
    }


    // ========================================
    // WINDOW EXPORTS
    // ========================================

    /**
     * Returns true if the current mode is vermoegensverwaltung.
     */
    function isVVMode() {
        syncMode();
        return currentMode === 'vermoegensverwaltung';
    }

    window.MODE_CONFIGS = MODE_CONFIGS;
    window.getModeConfig = getModeConfig;
    window.setMode = setMode;
    window.getModeForCurrentView = getModeForCurrentView;
    window.syncMode = syncMode;
    window.isBankMode = isBankMode;
    window.isVVMode = isVVMode;
    window.evaluateImpulse = evaluateImpulse;
    window.getBankingSubMode = getBankingSubMode;
    window.currentMode = currentMode;

    // Sync mode on viewChanged events (dispatched by existing navigation code)
    window.addEventListener('viewChanged', function() {
        syncMode();
    });

})();
