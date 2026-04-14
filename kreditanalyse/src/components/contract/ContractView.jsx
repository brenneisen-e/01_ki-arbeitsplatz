import { useState } from 'react';
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

  if (company.status !== 'approved' && company.status !== 'contract') {
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
      <StepIntroCard stepKey="contract" />
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
            Automatische LMA-Vertragserstellung auf Basis der vdp-Vorlage
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
                  <div className="border-b border-gray-400 mb-2 h-12" />
                  <p className="text-xs text-text-secondary">Ort, Datum</p>
                  <p className="text-sm font-semibold mt-4">Musterbank AG</p>
                  <p className="text-xs text-text-secondary">Kreditgeber</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-12" />
                  <p className="text-xs text-text-secondary">Ort, Datum</p>
                  <p className="text-sm font-semibold mt-4">{company.firma}</p>
                  <p className="text-xs text-text-secondary">Kreditnehmer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 no-print sticky bottom-4 bg-surface/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
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
        </>
      )}
    </div>
  );
}
