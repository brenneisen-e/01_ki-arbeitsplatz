import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  FileSignature,
  Sparkles,
  Loader2,
  Printer,
  Download,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  calculateAllRatios,
} from '../../utils/financialCalculations';
import {
  calculateQuantitativeRating,
  calculateOverallRating,
  calculateAccountRating,
  calculateOwnerRating,
  scoreToRatingClass,
} from '../../utils/ratingEngine';
import { haircutRates } from '../../data/haircutRates';
import { useAI } from '../../hooks/useAI';

function numberToWords(n) {
  // Simple German number-to-words for showcase
  const ones = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  if (n >= 1000000) {
    const mio = Math.floor(n / 1000000);
    const rest = n % 1000000;
    return `${ones[mio] || mio} Millionen${rest > 0 ? ` ${numberToWords(rest)}` : ''}`;
  }
  if (n >= 1000) {
    const tsd = Math.floor(n / 1000);
    const rest = n % 1000;
    return `${tsd > 1 ? (ones[tsd] || String(tsd)) + 'tausend' : 'eintausend'}${rest > 0 ? ` ${numberToWords(rest)}` : ''}`;
  }
  return String(n);
}

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
        <p className="text-text-secondary font-body text-lg">Bitte wählen Sie einen Kreditantrag aus.</p>
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

  const kredit = company.kredit || {};
  const betrag = kredit.betrag || 0;
  const laufzeit = kredit.laufzeit || 60;
  const bilanz = company.bilanz || {};
  const years = Object.keys(bilanz).map(Number).sort();
  const latestYear = years[years.length - 1] || 2023;
  const b23 = bilanz[latestYear] || {};

  const ratios = useMemo(() => calculateAllRatios(b23), [b23]);
  const quantRating = useMemo(() => calculateQuantitativeRating(ratios, company.branche), [ratios, company.branche]);
  const accountScore = useMemo(() => company.konto ? calculateAccountRating(company.konto) : 3, [company.konto]);
  const ownerAdj = useMemo(() => {
    if (company.schufa && company.creditreform_index) {
      const ownerScore = calculateOwnerRating(company.schufa, company.creditreform_index);
      return ownerScore > 3 ? 0.3 : ownerScore < 2 ? -0.2 : 0;
    }
    return 0;
  }, [company.schufa, company.creditreform_index]);
  const overallScore = useMemo(() => {
    return calculateOverallRating({ quantitativeScore: quantRating.score, qualitativeScore: 2.5, accountScore, ownerAdjustment: ownerAdj });
  }, [quantRating, accountScore, ownerAdj]);
  const ratingClass = scoreToRatingClass(overallScore);

  // Konditionierung (fixed values for contract)
  const kundenZins = 5.10;
  const effektivZins = kundenZins + 0.12;
  const monatlicheRate = betrag > 0 ? (betrag * (kundenZins / 100 / 12)) / (1 - Math.pow(1 + kundenZins / 100 / 12, -laufzeit)) : 0;

  // Sicherheiten for contract
  const sicherheiten = company.sicherheiten || [];
  const getHaircut = (art) => {
    const entry = Object.values(haircutRates).find(h => art.toLowerCase().includes(h.label?.toLowerCase().split(' ')[0] || '___'));
    return entry?.standard || 50;
  };
  const sichBewertung = sicherheiten.map(s => {
    const haircut = getHaircut(s.art);
    const beleihungswert = Math.round(s.wert * (1 - haircut / 100));
    return { ...s, haircut, beleihungswert };
  });

  const generateContract = async () => {
    const dataJson = JSON.stringify({
      kreditgeber: { name: 'Musterbank AG', adresse: 'Musterstraße 1, 50667 Köln', vorstand: 'Dr. Maria Schmidt, Thomas Berger' },
      kreditnehmer: { firma: company.firma, rechtsform: company.rechtsform, hrb: company.hrb, adresse: `${company.adresse?.strasse}, ${company.adresse?.plz} ${company.adresse?.ort}`, gf: company.gf?.map(g => g.name) },
      kredit: { art: kredit.art, betrag, betragWort: numberToWords(betrag), laufzeit, tilgungsfrei: kredit.tilgungsfrei || 0, verwendung: kredit.verwendung },
      zinsen: { sollzins: kundenZins, effektivzins: effektivZins, monatlicheRate: Math.round(monatlicheRate) },
      sicherheiten: sichBewertung.map(s => ({ art: s.art, bezeichnung: s.bezeichnung, beleihungswert: s.beleihungswert, rang: s.rang })),
      rating: { klasse: ratingClass.klasse, pd: ratingClass.pd },
      covenants: { ekQuote: Math.max(20, Math.round((ratios.eigenkapitalquote || 25) - 5)), dynVerschuldung: Math.min(6, Math.round((ratios.dynamischer_verschuldungsgrad || 4) + 1)) },
    }, null, 2);

    const systemPrompt = `Du bist Jurist in der Kreditabteilung einer deutschen Bank. Erstelle einen standardisierten Kreditvertrag auf Basis der folgenden Daten. Verwende juristisch korrekte, aber verständliche Sprache. Alle konkreten Werte (Beträge, Zinssätze, Sicherheiten, Auflagen) exakt aus den Daten übernehmen. Format: Nummerierte Abschnitte (1-12) gemäß Bankstandard: 1. Vertragsparteien, 2. Kreditsumme, 3. Zweckbindung, 4. Zinsregelung, 5. Tilgung & Rückzahlung, 6. Sicherheiten, 7. Rating, 8. Covenants/Auflagen, 9. Auszahlungsvoraussetzungen, 10. Kündigungsrechte, 11. Schlussbestimmungen, 12. Unterschriften.`;

    const result = await callAI(systemPrompt, dataJson);
    setContractText(result);
  };

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // Simple text download
    const blob = new Blob([contractText || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kreditvertrag_${company.firma.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
            Generierung und Bearbeitung des standardisierten Kreditvertrags
          </p>
        </div>
      </div>

      {/* Generate button */}
      {!contractText && (
        <div className="bg-surface-card border border-border rounded-lg p-8 flex flex-col items-center gap-4">
          <FileSignature size={48} strokeWidth={1} className="text-text-muted" />
          <p className="text-sm text-text-secondary text-center max-w-md">
            Klicken Sie auf den Button, um einen vollständigen Kreditvertrag aus allen Antragsdaten zu generieren.
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
            <button type="button" onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
              <Download size={16} /> PDF herunterladen
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
