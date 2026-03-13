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
import { LMA_TEMPLATE_STRUCTURE } from '../../data/lmaTemplate';
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

  // Build contract from LMA template with data substitution
  const fillTemplate = () => {
    const kreditgeber = { name: 'Musterbank AG', adresse: 'Musterstraße 1, 50667 Köln', vorstand: 'Dr. Maria Schmidt, Thomas Berger' };
    const adresse = company.adresse || {};
    const gfNames = (company.gf || []).map(g => `${g.name} (${g.funktion}, ${g.anteil}%)`).join('\n');
    const gfNamenKurz = (company.gf || []).map(g => g.name).join(', ');
    const tilgungsfreiMonate = kredit.tilgungsfrei || 0;
    const tilgungsfreiText = tilgungsfreiMonate > 0
      ? `Die ersten ${tilgungsfreiMonate} Monate sind tilgungsfrei. Während der tilgungsfreien Zeit sind lediglich die anfallenden Zinsen zu entrichten.`
      : 'Es wurde keine tilgungsfreie Anlaufzeit vereinbart.';
    const auszahlungsDatum = kredit.auszahlung || new Date().toISOString().slice(0, 10);
    const endDatum = new Date(auszahlungsDatum);
    endDatum.setMonth(endDatum.getMonth() + laufzeit);
    const endDatumStr = endDatum.toLocaleDateString('de-DE');
    const bereitstellungAb = new Date(auszahlungsDatum);
    bereitstellungAb.setMonth(bereitstellungAb.getMonth() - 1);
    const ersteRate = new Date(auszahlungsDatum);
    ersteRate.setMonth(ersteRate.getMonth() + 1 + tilgungsfreiMonate);

    const covenantEkQuote = Math.max(20, Math.round((ratios.eigenkapitalquote || 25) - 5));
    const covenantVerschuldung = Math.min(6, Math.round((ratios.dynamischer_verschuldungsgrad || 4) + 1));

    // Build Sicherheiten table and Anlage
    const sichTabelle = sichBewertung.map((s, i) =>
      `${i + 1}. ${s.art}\n   Bezeichnung: ${s.bezeichnung}\n   Marktwert: ${formatCurrency(s.wert)}\n   Beleihungswert: ${formatCurrency(s.beleihungswert)}\n   Rang: ${s.rang}. Rang`
    ).join('\n\n');

    const sichAnlage = sichBewertung.map((s, i) =>
      `Sicherheit ${i + 1}:\nArt: ${s.art}\nBezeichnung: ${s.bezeichnung}\nMarktwert: ${formatCurrency(s.wert)}\nHaircut: ${s.haircut}%\nBeleihungswert: ${formatCurrency(s.beleihungswert)}\nRang: ${s.rang}. Rang\nBewertung: ${s.bewertung || '–'}\nDatum: ${s.datum ? new Date(s.datum).toLocaleDateString('de-DE') : '–'}`
    ).join('\n\n');

    const sicherheitenBeschreibung = sichBewertung.map(s => `${s.art} (${s.bezeichnung})`).join(', ');
    const eigenanteil = formatCurrency(Math.round(betrag * 0.2));
    const investitionssumme = formatCurrency(Math.round(betrag * 1.2));

    // Perform placeholder substitution
    let text = LMA_TEMPLATE_STRUCTURE;
    const replacements = {
      '{{KREDITNEHMER_FIRMA}}': company.firma,
      '{{KREDITNEHMER_RECHTSFORM}}': company.rechtsform || '–',
      '{{KREDITNEHMER_AMTSGERICHT}}': company.amtsgericht || 'Amtsgericht',
      '{{KREDITNEHMER_HRB}}': company.hrb || '–',
      '{{KREDITNEHMER_ADRESSE}}': `${adresse.strasse || ''}, ${adresse.plz || ''} ${adresse.ort || ''}`,
      '{{KREDITNEHMER_ORT}}': adresse.ort || '–',
      '{{KREDITNEHMER_GRUENDUNG}}': String(company.gruendung || '–'),
      '{{KREDITNEHMER_GF}}': gfNames,
      '{{KREDITNEHMER_GF_NAMEN}}': gfNamenKurz,
      '{{KREDITGEBER_NAME}}': kreditgeber.name,
      '{{KREDITGEBER_ADRESSE}}': kreditgeber.adresse,
      '{{KREDITGEBER_VORSTAND}}': kreditgeber.vorstand,
      '{{KREDITBETRAG}}': formatCurrency(betrag),
      '{{KREDITBETRAG_WORT}}': numberToWords(betrag),
      '{{VERWENDUNGSZWECK}}': kredit.verwendung || kredit.art || '–',
      '{{LAUFZEIT}}': String(laufzeit),
      '{{ENDDATUM}}': endDatumStr,
      '{{SOLLZINS}}': kundenZins.toFixed(2),
      '{{EFFEKTIVZINS}}': effektivZins.toFixed(2),
      '{{MONATLICHE_RATE}}': formatCurrency(Math.round(monatlicheRate)),
      '{{AUSZAHLUNGSDATUM}}': new Date(auszahlungsDatum).toLocaleDateString('de-DE'),
      '{{ERSTE_RATE}}': ersteRate.toLocaleDateString('de-DE'),
      '{{TILGUNGSFREI_TEXT}}': tilgungsfreiText,
      '{{BEREITSTELLUNG_AB}}': bereitstellungAb.toLocaleDateString('de-DE'),
      '{{BEREITSTELLUNGSPROVISION}}': '0,25',
      '{{EIGENANTEIL}}': eigenanteil,
      '{{INVESTITIONSSUMME}}': investitionssumme,
      '{{SICHERHEITEN_BESCHREIBUNG}}': sicherheitenBeschreibung,
      '{{SICHERHEITEN_TABELLE}}': sichTabelle,
      '{{SICHERHEITEN_ANLAGE}}': sichAnlage,
      '{{COVENANT_EK_QUOTE}}': String(covenantEkQuote),
      '{{COVENANT_VERSCHULDUNG}}': String(covenantVerschuldung),
      '{{GERICHTSSTAND}}': adresse.ort || 'Köln',
      '{{ORT}}': adresse.ort || 'Köln',
      '{{DATUM}}': new Date().toLocaleDateString('de-DE'),
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.replaceAll(placeholder, value);
    }

    return text.trim();
  };

  const generateContract = async () => {
    // Primary: Fill the LMA template with actual data
    const filledContract = fillTemplate();

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
            Automatische LMA-Vertragserstellung auf Basis der vdp-Vorlage
          </p>
        </div>
      </div>

      {/* Generate button */}
      {!contractText && (
        <div className="bg-surface-card border border-border rounded-lg p-8 flex flex-col items-center gap-4">
          <FileSignature size={48} strokeWidth={1} className="text-text-muted" />
          <p className="text-sm text-text-secondary text-center max-w-md">
            Klicken Sie auf den Button, um einen standardisierten Kreditvertrag nach LMA/vdp-Vorlage aus allen Antragsdaten zu generieren.
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
