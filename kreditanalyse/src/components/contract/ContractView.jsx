import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  FileSignature,
  Sparkles,
  Loader2,
  Printer,
  Download,
  Edit3,
  FileText,
  CheckCircle2,
  Mail,
  Clock,
  X,
  BadgeCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportContractAsDocx, exportContractAsPdf } from '../../utils/contractExport';
import { fillContractTemplate } from '../../utils/contractTemplate';
import { useAI } from '../../hooks/useAI';
import StepIntroCard from '../shared/StepIntroCard';

export default function ContractView() {
  const { getSelectedCompany, navigate } = useApp();
  const company = getSelectedCompany();
  const { callAI, loading: aiLoading } = useAI();
  const [contractText, setContractText] = useState(null);
  const [editable, setEditable] = useState(false);
  const [letterText, setLetterText] = useState(null);
  const [letterLoading, setLetterLoading] = useState(false);
  // Bankseitige Unterschrift (wird vor dem Versand gesetzt). Sobald der Vorgang
  // im Status "signature_pending" ist, ist die Bank-Unterschrift verbindlich
  // erfolgt.
  const [bankSignedAt, setBankSignedAt] = useState(
    company?.status === 'signature_pending' || company?.status === 'active'
      ? new Date().toISOString()
      : null,
  );

  // Wenn der Vorgang bereits in Status "contract" ist, haben wir den Vertrag
  // schon vorher generiert (z.B. aus der Kreditentscheidung heraus). Dann
  // direkt mit dem befüllten Template vorausfüllen — kein erneutes Klicken
  // auf "Kreditvertrag generieren" nötig.
  useEffect(() => {
    if (
      company &&
      (company.status === 'contract' || company.status === 'signature_pending' || company.status === 'active') &&
      !contractText
    ) {
      setContractText(fillContractTemplate(company));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.status, company?.id]);

  const inSignaturePhase = company?.status === 'signature_pending' || company?.status === 'active';

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle size={48} strokeWidth={1.5} className="text-text-muted" />
        <p className="text-text-secondary font-body text-lg">Bitte wähle einen Kreditantrag aus.</p>
        <button type="button" onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-body text-sm hover:bg-primary-light transition-colors">
          <ArrowLeft size={16} /> Zum Dashboard
        </button>
      </div>
    );
  }

  if (
    company.status !== 'approved' &&
    company.status !== 'contract' &&
    company.status !== 'signature_pending' &&
    company.status !== 'active'
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle size={48} strokeWidth={1.5} className="text-accent-warm" />
        <p className="text-text-secondary font-body text-lg">Kreditvertrag nur nach Genehmigung verfügbar.</p>
        <button type="button" onClick={() => navigate('decision')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-body text-sm hover:bg-primary-light transition-colors">
          <ArrowLeft size={16} /> Zur Kreditentscheidung
        </button>
      </div>
    );
  }

  const generateContract = async () => {
    // Fill the LMA template with actual data using the shared utility
    const filledContract = fillContractTemplate(company);

    // If AI is available, let AI polish/enhance the filled template
    try {
      const systemPrompt = `Du bist Jurist in der Kreditabteilung einer deutschen Bank. Der folgende Kreditvertrag wurde automatisch aus einer LMA/vdp-Vorlage generiert und mit den tatsächlichen Kreditdaten befüllt. Prüfe den Vertrag auf Vollständigkeit und Konsistenz. Gib den finalen Vertrag zurück – behalte die komplette Struktur bei, korrigiere nur offensichtliche Fehler und ergänze fehlende Formulierungen wo nötig. Ändere KEINE konkreten Werte (Beträge, Zinssätze, Daten). Antworte NUR mit dem fertigen Vertragstext, ohne Kommentare.`;
      const result = await callAI(systemPrompt, filledContract);
      setContractText(result || filledContract);
    } catch {
      // Fallback: use the template-filled contract directly
      setContractText(filledContract);
    }
  };

  const contractNr = `${company.id} / ${new Date().getFullYear()}`;

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => {
    exportContractAsPdf(contractText, company, contractNr);
  };
  const handleDownloadDocx = async () => {
    await exportContractAsDocx(contractText, company, contractNr);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <StepIntroCard stepKey={inSignaturePhase ? 'signature' : 'contract'} />
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 no-print">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white">
          <FileSignature size={20} />
        </div>
        <div>
          <h2 className="text-lg font-headline font-semibold text-text-primary">
            Kreditvertrag – {company.firma}
          </h2>
          <p className="text-xs text-text-muted font-body">
            {inSignaturePhase
              ? 'Bankseitig unterschrieben und zur Gegenzeichnung versandt – Rückläufer ausstehend'
              : 'Automatische LMA-Vertragserstellung auf Basis der vdp-Vorlage'}
          </p>
        </div>
      </div>

      {/* Generate button */}
      {!contractText && (
        <div className="bg-surface-card border border-border rounded-lg p-8 flex flex-col items-center gap-4">
          <FileSignature size={48} strokeWidth={1} className="text-text-muted" />
          <p className="text-sm text-text-secondary text-center max-w-md">
            Klicke auf den Button, um einen standardisierten Kreditvertrag nach LMA/vdp-Vorlage aus allen Antragsdaten zu generieren.
          </p>
          <button
            type="button"
            onClick={generateContract}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold font-body hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {aiLoading ? 'Kreditvertrag wird generiert...' : 'Kreditvertrag generieren'}
          </button>
        </div>
      )}

      {/* Contract document */}
      {contractText && (
        <>
          <div className="bg-white border border-gray-300 rounded-lg shadow-md contract-print">
            {/* Contract header */}
            <div className="text-center py-8 px-10 border-b border-gray-200">
              <h1 className="text-2xl font-headline font-bold text-text-primary tracking-wide uppercase">
                Kreditvertrag
              </h1>
              <p className="text-xs text-text-muted mt-1 font-body tracking-wider">
                (Standardisierter Kreditvertrag nach vdp/LMA-Standard)
              </p>
              <p className="text-sm text-text-secondary mt-2 font-body">
                Nr. {company.id} / {new Date().getFullYear()}
              </p>
            </div>

            {/* Contract body */}
            <div className="px-10 py-8">
              {editable ? (
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="w-full min-h-[600px] text-sm font-body text-text-primary leading-relaxed border border-border rounded-lg p-4 resize-y focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              ) : (
                <div className="text-sm font-body text-text-primary leading-relaxed whitespace-pre-wrap">
                  {contractText}
                </div>
              )}
            </div>

            {/* Signature block */}
            <div className="px-10 py-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-12 mt-8">
                <div className="text-center">
                  <div className="relative border-b border-gray-400 mb-2 h-12 flex items-end justify-center pb-1">
                    {bankSignedAt && (
                      <span
                        className="text-2xl text-primary italic select-none"
                        style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive', transform: 'rotate(-4deg)' }}
                      >
                        i. A. M. Lehmann
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">
                    {bankSignedAt
                      ? `Musterstadt, ${new Date(bankSignedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                      : 'Ort, Datum'}
                  </p>
                  <p className="text-sm font-semibold mt-4">Musterbank AG</p>
                  <p className="text-xs text-text-secondary">Kreditgeber</p>
                  {bankSignedAt && (
                    <p className="text-[10px] text-accent font-mono mt-1 flex items-center justify-center gap-1">
                      <BadgeCheck size={11} strokeWidth={1.75} />
                      digital signiert
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-12" />
                  <p className="text-xs text-text-secondary">Ort, Datum</p>
                  <p className="text-sm font-semibold mt-4">{company.firma}</p>
                  <p className="text-xs text-text-secondary">Kreditnehmer</p>
                  {inSignaturePhase && (
                    <p className="text-[10px] text-text-muted font-mono mt-1">Rückläufer ausstehend</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap no-print sticky bottom-4 bg-surface/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
            <button type="button" onClick={handleDownloadDocx}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
              <FileText size={16} /> Word (.docx)
            </button>
            <button type="button" onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
              <Download size={16} /> PDF
            </button>
            <button type="button" onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface transition-colors">
              <Printer size={16} /> Drucken
            </button>
            <button type="button" onClick={() => setEditable(!editable)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-colors ${
                editable ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-primary hover:bg-surface'
              }`}>
              <Edit3 size={16} /> {editable ? 'Bearbeitung beenden' : 'Vertrag bearbeiten'}
            </button>
          </div>

          {/* ============================================================= */}
          {/* Anschreiben an den Kreditnehmer                                */}
          {/* ============================================================= */}
          <CoverLetterBlock
            company={company}
            contractNr={contractNr}
            letterText={letterText}
            setLetterText={setLetterText}
            letterLoading={letterLoading}
            setLetterLoading={setLetterLoading}
            bankSignedAt={bankSignedAt}
            setBankSignedAt={setBankSignedAt}
          />
        </>
      )}
    </div>
  );
}

// =============================================================================
// CoverLetterBlock — Anschreiben vorformulieren + absenden + Email-Animation
// + Übergang zu Unterschriftenprozess (Rückläufer)
// =============================================================================

function CoverLetterBlock({ company, contractNr, letterText, setLetterText, letterLoading, setLetterLoading, bankSignedAt, setBankSignedAt }) {
  const { dispatch, navigate } = useApp();
  const [sending, setSending] = useState(false);
  const alreadySent = company?.status === 'signature_pending' || company?.status === 'active';
  const [sent, setSent] = useState(alreadySent);
  // Bestätigungs-Dialog bevor der Vertrag versendet wird — dort wird auch
  // die Bank-Unterschrift gesetzt, damit der Kunde einen bereits bankseitig
  // unterzeichneten Vertrag erhält.
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Öffnet eine Vorschau des tatsächlich versendeten Anschreibens
  // (wichtig für Schritt 9 / Rückläufer).
  const [showSentLetter, setShowSentLetter] = useState(false);
  const [sentAt, setSentAt] = useState(alreadySent ? new Date().toISOString() : null);

  // Falls der Vorgang bereits in signature_pending ist, haben wir kein
  // gespeichertes Anschreiben — generieren wir einmalig ein Standard-Anschreiben,
  // damit man es in Schritt 9 erneut einsehen kann.
  useEffect(() => {
    if (alreadySent && !letterText && !letterLoading) {
      // Standardanschreiben direkt ohne Animation einsetzen
      const gfName = company.gf?.[0]?.name || 'Sehr geehrte Damen und Herren';
      const betrag = company.kredit?.betrag;
      const betragStr = betrag ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(betrag) : '—';
      setLetterText(`Anrede: Sehr geehrte/r ${gfName},

hiermit übersenden wir Ihnen den von uns vorbereiteten Kreditvertrag (Nr. ${contractNr}) über ${betragStr} zur Gegenzeichnung.

Bitte unterschreiben Sie den beiliegenden Vertrag an den gekennzeichneten Stellen und senden uns ein Exemplar innerhalb von 14 Tagen per Post oder als elektronisch signiertes PDF zurück.

Auszahlungsvoraussetzungen:
- Vorlage der ergänzenden Sicherheitenverträge (Grundschuldbestellung, Abtretungserklärungen)
- Bestätigung der zweckgebundenen Mittelverwendung
- Einhaltung der vereinbarten Financial Covenants

Für Rückfragen stehen wir Ihnen selbstverständlich gerne zur Verfügung.

Mit freundlichen Grüßen

Musterbank AG
Firmenkunden-Kreditabteilung`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadySent]);

  const gf = company.gf?.[0]?.name || 'Sehr geehrte Damen und Herren';
  const betrag = company.kredit?.betrag;
  const betragStr = betrag ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(betrag) : '—';

  const handleGenerate = () => {
    setLetterLoading(true);
    setTimeout(() => {
      const text = `Anrede: Sehr geehrte/r ${gf},

hiermit übersenden wir Ihnen den von uns vorbereiteten Kreditvertrag (Nr. ${contractNr}) über ${betragStr} zur Gegenzeichnung.

Bitte unterschreiben Sie den beiliegenden Vertrag an den gekennzeichneten Stellen und senden uns ein Exemplar innerhalb von 14 Tagen per Post oder als elektronisch signiertes PDF zurück.

Auszahlungsvoraussetzungen:
- Vorlage der ergänzenden Sicherheitenverträge (Grundschuldbestellung, Abtretungserklärungen)
- Bestätigung der zweckgebundenen Mittelverwendung
- Einhaltung der vereinbarten Financial Covenants

Für Rückfragen stehen wir Ihnen selbstverständlich gerne zur Verfügung.

Mit freundlichen Grüßen

Musterbank AG
Firmenkunden-Kreditabteilung`;
      setLetterText(text);
      setLetterLoading(false);
    }, 1200);
  };

  const handleSendClick = () => {
    // Vor dem Absenden Bestätigung + bankseitige Unterschrift einholen.
    setConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    // 1. Bank-Unterschrift setzen, damit der Vertrag beim Kunden bereits
    //    bankseitig unterzeichnet ankommt.
    const signTime = new Date().toISOString();
    if (setBankSignedAt) setBankSignedAt(signTime);
    setConfirmOpen(false);
    setSending(true);
    // Animation: 2.5s "fliegt los", dann "angekommen"
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setSentAt(new Date().toISOString());
      // Vorgang in neuen Prozessschritt "Unterschriftenprozess / Rückläufer"
      // überführen — Status "signature_pending" wird von MonitoringView und
      // Pipeline ebenfalls erkannt.
      dispatch({ type: 'SET_COMPANY_STATUS', companyId: company.id, status: 'signature_pending' });
    }, 2500);
  };

  return (
    <div className="bg-surface-card border border-border rounded-xl p-6 no-print">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <FileText size={20} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold font-headline text-text-primary">
            Anschreiben an den Kreditnehmer
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Formuliere ein Anschreiben, mit dem der Vertrag zur Gegenzeichnung an den Kreditnehmer versandt wird.
          </p>
        </div>
        {!letterText && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={letterLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold font-body hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            {letterLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {letterLoading ? 'Formuliere Anschreiben…' : 'Anschreiben vorformulieren'}
          </button>
        )}
      </div>

      {letterText && (
        <>
          <div className="bg-surface border border-border rounded-lg p-5 mb-4">
            <div className="text-xs text-text-muted mb-2 font-mono flex items-center justify-between">
              <span>An: {company.firma} · z.Hd. {gf}</span>
              <span>Betreff: Kreditvertrag {contractNr}</span>
            </div>
            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              rows={12}
              className="w-full text-sm font-body text-text-primary leading-relaxed border border-border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
          </div>

          {!sent ? (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSendClick}
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold font-body hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                Anschreiben mit Vertrag senden
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body text-text-secondary border border-border rounded-lg hover:bg-surface transition-colors"
              >
                <Sparkles size={14} /> Neu formulieren
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 size={20} strokeWidth={1.75} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">
                    Anschreiben &amp; bankseitig unterschriebener Vertrag versandt
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Der Vorgang befindet sich jetzt in <strong>Schritt 9 — Unterschrift / Rückläufer</strong>. Der Kreditnehmer hat 14 Tage Zeit, den gegengezeichneten Vertrag zurückzusenden. Anschließend geht es weiter zur Auszahlungsfreigabe.
                  </p>
                  {sentAt && (
                    <p className="text-[11px] text-emerald-700 font-mono mt-2 flex items-center gap-1.5">
                      <Clock size={11} strokeWidth={1.75} />
                      Versandt am {new Date(sentAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {' um '}
                      {new Date(sentAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      {' Uhr'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowSentLetter(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body text-primary border border-primary/30 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Mail size={14} strokeWidth={1.75} />
                  Versendete E-Mail anzeigen
                </button>
                <span className="text-xs text-text-muted font-body">
                  An: {company.firma} &middot; z.Hd. {gf}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {sending && <EmailSendAnimation firma={company.firma} onDone={() => {}} />}

      {confirmOpen && (
        <ConfirmSendModal
          company={company}
          contractNr={contractNr}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSend}
        />
      )}

      {showSentLetter && (
        <SentLetterModal
          company={company}
          contractNr={contractNr}
          letterText={letterText}
          sentAt={sentAt}
          gf={gf}
          onClose={() => setShowSentLetter(false)}
        />
      )}
    </div>
  );
}

// =============================================================================
// ConfirmSendModal — Vor dem Versand: Bank-Unterschrift setzen & bestätigen
// =============================================================================

function ConfirmSendModal({ company, contractNr, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-6 py-5 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <FileSignature size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold font-headline text-text-primary">
              Vertrag bankseitig unterschreiben &amp; versenden
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Bitte bestätige, dass der Kreditvertrag bankseitig rechtsverbindlich unterschrieben und anschließend an {company.firma} versandt werden soll.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors shrink-0"
            title="Abbrechen"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5">
            <p className="text-xs text-text-muted font-mono flex items-center gap-1.5">
              <FileText size={12} /> Vertragsnummer
            </p>
            <p className="text-sm font-semibold text-text-primary">{contractNr}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold">Mit dem Klick auf „Unterschreiben &amp; versenden" erfolgt:</p>
            <ul className="space-y-1 pl-4 list-disc">
              <li>Digitale, rechtsverbindliche Unterschrift der Musterbank AG auf dem Kreditvertrag</li>
              <li>Versand des unterschriebenen Vertrags zusammen mit dem Anschreiben an den Kreditnehmer</li>
              <li>Überführung des Vorgangs in <strong>Schritt 9 — Unterschrift / Rückläufer</strong></li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body text-text-secondary border border-border hover:bg-surface transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-body bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            <BadgeCheck size={15} strokeWidth={1.75} />
            Unterschreiben &amp; versenden
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SentLetterModal — Vorschau des versendeten Anschreibens (Schritt 9)
// =============================================================================

function SentLetterModal({ company, contractNr, letterText, sentAt, gf, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-6 py-5 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Mail size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold font-headline text-text-primary">
              Versendete E-Mail
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Anschreiben mit bankseitig unterschriebenem Kreditvertrag {contractNr}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors shrink-0"
            title="Schließen"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="rounded-lg border border-border bg-surface p-3 text-xs font-mono space-y-1">
            <div className="flex">
              <span className="text-text-muted w-20 shrink-0">An:</span>
              <span className="text-text-primary">{company.firma} &lt;z.Hd. {gf}&gt;</span>
            </div>
            <div className="flex">
              <span className="text-text-muted w-20 shrink-0">Von:</span>
              <span className="text-text-primary">kredit@musterbank.de</span>
            </div>
            <div className="flex">
              <span className="text-text-muted w-20 shrink-0">Betreff:</span>
              <span className="text-text-primary">Kreditvertrag {contractNr} – zur Gegenzeichnung</span>
            </div>
            <div className="flex">
              <span className="text-text-muted w-20 shrink-0">Versandt:</span>
              <span className="text-text-primary">
                {sentAt
                  ? `${new Date(sentAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} um ${new Date(sentAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`
                  : '—'}
              </span>
            </div>
            <div className="flex">
              <span className="text-text-muted w-20 shrink-0">Anhang:</span>
              <span className="text-text-primary flex items-center gap-1.5">
                <FileText size={12} strokeWidth={1.75} />
                Kreditvertrag_{contractNr.replace(/\s+/g, '')}.pdf (bankseitig signiert)
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <pre className="text-sm font-body text-text-primary whitespace-pre-wrap leading-relaxed">
              {letterText || '—'}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body text-text-secondary border border-border hover:bg-surface transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

// Mail-Flieger-Overlay für die Versand-Animation
function EmailSendAnimation({ firma }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 text-center">
        <div className="relative w-32 h-24 mx-auto mb-4 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full animate-mail-fly" viewBox="0 0 64 40" fill="none">
            <rect x="2" y="6" width="48" height="32" rx="3" fill="#ffffff" stroke="#1B2B4B" strokeWidth="2" />
            <path d="M2 6 L26 26 L50 6" stroke="#1B2B4B" strokeWidth="2" fill="none" />
            <path d="M52 12 C56 12 60 14 62 18" stroke="#2D4A7A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M54 20 C58 20 61 22 62 26" stroke="#2D4A7A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
        </div>
        <p className="text-sm font-semibold font-headline text-text-primary">
          Anschreiben wird versendet…
        </p>
        <p className="text-xs text-text-muted mt-1">
          Empfänger: {firma}
        </p>
      </div>
      <style>{`
        @keyframes mail-fly {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          40%  { transform: translate(45%, -20%) scale(0.9) rotate(-8deg); opacity: 1; }
          100% { transform: translate(120%, -45%) scale(0.6) rotate(-14deg); opacity: 0; }
        }
        .animate-mail-fly {
          animation: mail-fly 2.4s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
