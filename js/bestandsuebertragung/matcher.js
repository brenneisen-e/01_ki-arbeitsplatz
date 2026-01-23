/**
 * Matcher Modul - Automatische Zuordnung von E-Mails zu Vorgängen
 * ESM Version
 */

import * as Storage from './storage.js';
import * as Extractor from './extractor.js';

// Matching-Prioritäten und Confidence-Werte
export const MATCH_CONFIDENCE = {
    CONVERSATION_ID: 1.0,
    VS_NR_EXACT: 0.95,
    VS_NR_PARTIAL: 0.85,
    MAKLER_EMAIL: 0.85,
    KUNDE_VERSICHERER: 0.80,
    KUNDE_ONLY: 0.60,
    SUBJECT_SIMILAR: 0.50
};

// Schwellenwert für automatische Zuordnung
export const AUTO_ASSIGN_THRESHOLD = 0.75;

/**
 * VS-Nr normalisieren
 */
export function normalizeVsNr(vsNr) {
    return vsNr.replace(/[-\s.]/g, '').toUpperCase();
}

/**
 * Kundenname normalisieren
 */
export function normalizeKunde(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[,\s]+/g, ' ')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .trim();
}

/**
 * Ähnlichkeit zweier Strings berechnen (Jaccard)
 */
export function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(str2.split(' ').filter(w => w.length > 2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * E-Mail-Adresse aus String extrahieren
 */
function extractEmailAddress(str) {
    if (!str) return null;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const match = str.match(emailRegex);
    return match ? match[0].toLowerCase() : null;
}

/**
 * Match per ConversationID
 */
function matchByConversationId(email, cases) {
    if (!email.conversationID) return null;

    const match = cases.find(c =>
        c.conversationIds && c.conversationIds.includes(email.conversationID)
    );

    if (match) {
        return {
            caseId: match.id,
            confidence: MATCH_CONFIDENCE.CONVERSATION_ID,
            reason: 'ConversationID',
            details: `Gleiche Konversation: ${email.conversationID}`
        };
    }

    return null;
}

/**
 * Match per Makler E-Mail-Adresse
 */
function matchByMaklerEmail(email, cases) {
    const matches = [];
    const senderEmail = extractEmailAddress(email.from || email.senderAddress || '');
    const recipientEmail = extractEmailAddress(email.to || email.recipientAddress || '');

    if (!senderEmail && !recipientEmail) return matches;

    cases.forEach(c => {
        if (!c.makler || !c.makler.email) return;

        const maklerEmail = c.makler.email.toLowerCase();

        if (senderEmail && senderEmail === maklerEmail) {
            matches.push({
                caseId: c.id,
                confidence: MATCH_CONFIDENCE.MAKLER_EMAIL,
                reason: 'Makler E-Mail (Sender)',
                details: `E-Mail von ${c.makler.name || maklerEmail}`
            });
        }
        else if (recipientEmail && recipientEmail === maklerEmail) {
            matches.push({
                caseId: c.id,
                confidence: MATCH_CONFIDENCE.MAKLER_EMAIL * 0.9,
                reason: 'Makler E-Mail (Empfänger)',
                details: `E-Mail an ${c.makler.name || maklerEmail}`
            });
        }
    });

    return matches;
}

/**
 * Prüfen ob VS-Nr teilweise übereinstimmt
 */
function partialVsNrMatch(vsNr1, vsNr2) {
    const digits1 = vsNr1.replace(/\D/g, '');
    const digits2 = vsNr2.replace(/\D/g, '');

    if (digits1.length < 6 || digits2.length < 6) return false;

    for (let i = 0; i <= digits1.length - 6; i++) {
        const substr = digits1.substr(i, 6);
        if (digits2.includes(substr)) return true;
    }

    return false;
}

/**
 * Match per Versicherungsnummer
 */
function matchByVersicherungsnummer(email, cases) {
    const matches = [];
    const text = (email.subject || '') + '\n' + (email.bodyPlain || '');
    const extracted = Extractor.extractVersicherungsnummer(text);

    if (!extracted || !extracted.value) return matches;

    const emailVsNr = normalizeVsNr(extracted.value);

    cases.forEach(c => {
        if (!c.versicherungsnummer || !c.versicherungsnummer.value) return;

        const caseVsNr = normalizeVsNr(c.versicherungsnummer.value);

        if (emailVsNr === caseVsNr) {
            matches.push({
                caseId: c.id,
                confidence: MATCH_CONFIDENCE.VS_NR_EXACT,
                reason: 'Versicherungsnummer (exakt)',
                details: `VS-Nr: ${extracted.value}`
            });
        }
        else if (partialVsNrMatch(emailVsNr, caseVsNr)) {
            matches.push({
                caseId: c.id,
                confidence: MATCH_CONFIDENCE.VS_NR_PARTIAL,
                reason: 'Versicherungsnummer (ähnlich)',
                details: `VS-Nr Mail: ${extracted.value}, VS-Nr Vorgang: ${c.versicherungsnummer.value}`
            });
        }
    });

    return matches;
}

/**
 * Prüfen ob zwei Kundennamen übereinstimmen
 */
function kundeNamesMatch(name1, name2) {
    if (!name1 || !name2) return false;

    if (name1 === name2) return true;

    const words1 = name1.split(' ').filter(w => w.length > 2);
    const words2 = name2.split(' ').filter(w => w.length > 2);

    const shorter = words1.length <= words2.length ? words1 : words2;
    const longer = words1.length > words2.length ? words1 : words2;

    let matchCount = 0;
    shorter.forEach(word => {
        if (longer.some(w => w.includes(word) || word.includes(w))) {
            matchCount++;
        }
    });

    return matchCount >= Math.min(2, shorter.length);
}

/**
 * Match per Kunde + Versicherer
 */
function matchByKundeVersicherer(email, cases) {
    const matches = [];
    const extracted = Extractor.extractFromEmail(email);

    if (!extracted.kunde || !extracted.kunde.name) return matches;

    const emailKunde = normalizeKunde(extracted.kunde.name);
    const emailVersicherer = extracted.versicherer ? extracted.versicherer.name : null;

    cases.forEach(c => {
        if (!c.kunde || !c.kunde.name) return;

        const caseKunde = normalizeKunde(c.kunde.name);
        const kundeMatch = kundeNamesMatch(emailKunde, caseKunde);

        if (!kundeMatch) return;

        if (emailVersicherer && c.versicherer && c.versicherer.name === emailVersicherer) {
            matches.push({
                caseId: c.id,
                confidence: MATCH_CONFIDENCE.KUNDE_VERSICHERER,
                reason: 'Kunde + Versicherer',
                details: `${extracted.kunde.name} bei ${emailVersicherer}`
            });
        }
        else {
            matches.push({
                caseId: c.id,
                confidence: MATCH_CONFIDENCE.KUNDE_ONLY,
                reason: 'Kunde (nur)',
                details: `Kundenname: ${extracted.kunde.name}`
            });
        }
    });

    return matches;
}

/**
 * Betreff normalisieren
 */
function normalizeSubject(subject) {
    return subject.toLowerCase()
        .replace(/^(re:|aw:|fwd:|wg:)\s*/gi, '')
        .replace(/[^\wäöüß\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Match per Betreff-Ähnlichkeit
 */
function matchBySubject(email, cases) {
    const matches = [];

    if (!email.subject) return matches;

    const emailSubject = normalizeSubject(email.subject);

    cases.forEach(c => {
        if (!c.messages || c.messages.length === 0) return;

        const caseSubjects = c.messages.map(m => normalizeSubject(m.subject || ''));

        caseSubjects.forEach(caseSubject => {
            const similarity = calculateSimilarity(emailSubject, caseSubject);

            if (similarity > 0.6) {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.SUBJECT_SIMILAR * similarity,
                    reason: 'Betreff-Ähnlichkeit',
                    details: `Ähnlichkeit: ${Math.round(similarity * 100)}%`
                });
            }
        });
    });

    return matches;
}

/**
 * Doppelte Matches entfernen
 */
function deduplicateMatches(matches) {
    const seen = new Map();

    matches.forEach(match => {
        const existing = seen.get(match.caseId);
        if (!existing || match.confidence > existing.confidence) {
            seen.set(match.caseId, match);
        }
    });

    return Array.from(seen.values());
}

/**
 * Hauptfunktion: E-Mail einem Vorgang zuordnen
 */
export function findMatches(email, cases) {
    const matches = [];

    if (!email || !cases || cases.length === 0) {
        return { matches: [], bestMatch: null, autoAssign: false };
    }

    const convMatch = matchByConversationId(email, cases);
    if (convMatch) {
        matches.push(convMatch);
    }

    const vsNrMatches = matchByVersicherungsnummer(email, cases);
    matches.push(...vsNrMatches);

    const maklerEmailMatches = matchByMaklerEmail(email, cases);
    matches.push(...maklerEmailMatches);

    const kundeMatches = matchByKundeVersicherer(email, cases);
    matches.push(...kundeMatches);

    const subjectMatches = matchBySubject(email, cases);
    matches.push(...subjectMatches);

    const uniqueMatches = deduplicateMatches(matches);
    uniqueMatches.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = uniqueMatches.length > 0 ? uniqueMatches[0] : null;
    const autoAssign = bestMatch && bestMatch.confidence >= AUTO_ASSIGN_THRESHOLD;

    return {
        matches: uniqueMatches,
        bestMatch: bestMatch,
        autoAssign: autoAssign
    };
}

/**
 * Batch-Matching: Mehrere E-Mails auf einmal zuordnen
 */
export function batchMatch(emails, cases) {
    const results = {
        matched: [],
        suggested: [],
        unmatched: []
    };

    emails.forEach(email => {
        if (Storage.isMessageProcessed(email.entryID)) {
            return;
        }

        const matchResult = findMatches(email, cases);

        if (matchResult.autoAssign && matchResult.bestMatch) {
            results.matched.push({
                email: email,
                match: matchResult.bestMatch
            });
        } else if (matchResult.matches.length > 0) {
            results.suggested.push({
                email: email,
                matches: matchResult.matches
            });
        } else {
            results.unmatched.push(email);
        }
    });

    return results;
}

/**
 * Status eines Vorgangs basierend auf E-Mail-Inhalt aktualisieren
 */
function updateStatusFromEmail(caseId, email) {
    const caseData = Storage.getCase(caseId);
    if (!caseData) return;

    const text = (email.subject || '') + '\n' + (email.bodyPlain || '');
    const extractedStatus = Extractor.extractStatus(text);

    if (!extractedStatus) return;

    const statusMapping = {
        'neu': 'unvollstaendig',
        'angefragt': 'zu-validieren',
        'in-bearbeitung': 'wiedervorlage',
        'bestaetigt': 'export-bereit',
        'abgelehnt': 'abgelehnt',
        'erledigt': 'abgeschlossen'
    };

    const statusOrder = ['unvollstaendig', 'zu-validieren', 'wiedervorlage', 'export-bereit', 'abgeschlossen', 'abgelehnt'];
    const currentIndex = statusOrder.indexOf(caseData.status);
    const mappedStatus = statusMapping[extractedStatus.status] || extractedStatus.status;
    const newIndex = statusOrder.indexOf(mappedStatus);

    if (mappedStatus === 'export-bereit' || mappedStatus === 'abgelehnt') {
        const oldStatus = caseData.status;
        caseData.status = mappedStatus;
        Storage.saveCase(caseData);
        Storage.addStatusHistory(caseId, oldStatus, mappedStatus, 'Automatisch aus E-Mail erkannt');
    }
    else if (newIndex > currentIndex && currentIndex !== -1) {
        const oldStatus = caseData.status;
        caseData.status = mappedStatus;
        Storage.saveCase(caseData);
        Storage.addStatusHistory(caseId, oldStatus, mappedStatus, 'Automatisch aus E-Mail erkannt');
    }

    const extractedDatum = Extractor.extractDatum(text);
    if (extractedDatum && (!caseData.gueltigkeitsdatum || !caseData.gueltigkeitsdatum.value)) {
        caseData.gueltigkeitsdatum = extractedDatum;
        Storage.saveCase(caseData);
    }
}

/**
 * Automatische Zuordnung durchführen
 */
export function autoAssign(matchedItems) {
    const assigned = [];
    const failed = [];

    matchedItems.forEach(item => {
        const { email, match } = item;

        try {
            const result = Storage.addMessagesToCase(match.caseId, [email]);

            if (result) {
                Storage.markMessageProcessed(email.entryID);

                assigned.push({
                    email: email,
                    caseId: match.caseId,
                    reason: match.reason
                });

                updateStatusFromEmail(match.caseId, email);
            } else {
                failed.push({ email: email, error: 'Speichern fehlgeschlagen' });
            }
        } catch (e) {
            failed.push({ email: email, error: e.message });
        }
    });

    return { assigned, failed };
}

/**
 * Neuen Vorgang aus E-Mail erstellen
 */
export function createCaseFromEmail(email, conversationMessages) {
    const messages = conversationMessages || [email];
    const extracted = Extractor.extractFromConversation(messages);
    const existingCases = Storage.getCasesArray();

    // Duplikat-Prüfung 1: VS-Nr
    const vsNr = extracted.versicherungsnummer?.value;
    if (vsNr) {
        const existingCase = existingCases.find(c => {
            const caseVsNr = c.versicherungsnummer?.value;
            if (!caseVsNr) return false;
            return normalizeVsNr(caseVsNr) === normalizeVsNr(vsNr);
        });

        if (existingCase) {
            console.log(`Duplikat verhindert (VS-Nr): ${vsNr} existiert bereits in Vorgang ${existingCase.id}`);
            Storage.addMessagesToCase(existingCase.id, messages);
            Storage.markMessagesProcessed(messages.map(m => m.entryID));
            return null;
        }
    }

    // Duplikat-Prüfung 2: Kunde + Makler
    const kundeName = extracted.kunde?.name;
    const maklerEmail = extracted.makler?.email || extractEmailAddress(email.senderEmail || email.from || '');

    if (kundeName && maklerEmail) {
        const normalizedKunde = normalizeKunde(kundeName);
        const normalizedMakler = maklerEmail.toLowerCase();

        const existingCase = existingCases.find(c => {
            if (!c.kunde?.name || !c.makler?.email) return false;
            const caseKunde = normalizeKunde(c.kunde.name);
            const caseMakler = c.makler.email.toLowerCase();
            return caseKunde === normalizedKunde && caseMakler === normalizedMakler;
        });

        if (existingCase) {
            console.log(`Duplikat verhindert (Kunde+Makler): ${kundeName} / ${maklerEmail} existiert bereits in Vorgang ${existingCase.id}`);
            Storage.addMessagesToCase(existingCase.id, messages);
            Storage.markMessagesProcessed(messages.map(m => m.entryID));
            return null;
        }
    }

    // Duplikat-Prüfung 3: Kunde + Versicherer
    const versicherer = extracted.versicherer?.name;
    if (kundeName && versicherer) {
        const normalizedKundeCheck = normalizeKunde(kundeName);

        const existingCase = existingCases.find(c => {
            if (!c.kunde?.name || !c.versicherer?.name) return false;
            const caseKunde = normalizeKunde(c.kunde.name);
            return caseKunde === normalizedKundeCheck && c.versicherer.name === versicherer;
        });

        if (existingCase) {
            console.log(`Duplikat verhindert (Kunde+Versicherer): ${kundeName} / ${versicherer} existiert bereits in Vorgang ${existingCase.id}`);
            Storage.addMessagesToCase(existingCase.id, messages);
            Storage.markMessagesProcessed(messages.map(m => m.entryID));
            return null;
        }
    }

    // Makler-Info zusammenstellen
    const maklerInfo = extracted.makler || {
        name: '',
        email: extractEmailAddress(email.senderEmail || email.from || '') || '',
        confidence: 0.5,
        source: 'sender'
    };
    if (!maklerInfo.email && email.senderEmail) {
        maklerInfo.email = extractEmailAddress(email.senderEmail) || email.senderEmail;
    }

    // Status basierend auf Vollständigkeit
    const hasKunde = extracted.kunde && extracted.kunde.name && extracted.kunde.name.trim().length > 0;
    const hasVsNr = extracted.versicherungsnummer && extracted.versicherungsnummer.value && extracted.versicherungsnummer.value.trim().length > 0;
    const isComplete = hasKunde && hasVsNr;
    const initialStatus = isComplete ? 'zu-validieren' : 'unvollstaendig';

    // Mail-Empfangsdatum parsen
    let mailReceivedDate = null;
    if (email.receivedTime) {
        const parts = email.receivedTime.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
        if (parts) {
            mailReceivedDate = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6]).toISOString();
        }
    }
    const now = new Date().toISOString();

    const newCase = {
        kunde: extracted.kunde || { name: '', confidence: 0, source: 'manual' },
        versicherungsnummer: extracted.versicherungsnummer || { value: '', confidence: 0, source: 'manual' },
        versicherer: extracted.versicherer || { name: '', confidence: 0, source: 'manual' },
        gueltigkeitsdatum: extracted.gueltigkeitsdatum || null,
        makler: maklerInfo,
        status: initialStatus,
        sparte: extracted.sparte || '',
        notes: '',
        flagged: false,
        conversationIds: email.conversationID ? [email.conversationID] : [],
        messageIds: messages.map(m => m.entryID),
        messages: messages,
        workflow: {
            mailReceived: mailReceivedDate || now,
            mailUploaded: now,
            kiRecognized: isComplete ? now : null,
            pvValidated: null,
            exported: null
        },
        statusHistory: [
            { date: new Date().toISOString(), from: null, to: initialStatus, note: 'Aus E-Mail erstellt', isNew: true }
        ]
    };

    const savedCase = Storage.saveCase(newCase);

    if (savedCase) {
        Storage.markMessagesProcessed(messages.map(m => m.entryID));
    }

    return savedCase;
}

// Default export
export default {
    findMatches,
    batchMatch,
    autoAssign,
    createCaseFromEmail,
    normalizeVsNr,
    normalizeKunde,
    calculateSimilarity,
    MATCH_CONFIDENCE,
    AUTO_ASSIGN_THRESHOLD
};
