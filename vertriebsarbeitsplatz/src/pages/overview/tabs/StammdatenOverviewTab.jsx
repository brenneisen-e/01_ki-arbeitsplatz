import Card from '../../../components/ui/Card';
import { useMode } from '../../../hooks/useMode';
import { STAMMDATEN_DATA } from '../../../data';
import { Building2, GraduationCap, FileText, User, Award, BarChart3 } from 'lucide-react';

export default function StammdatenOverviewTab() {
  const { modeId } = useMode();
  const data = STAMMDATEN_DATA[modeId] || STAMMDATEN_DATA.versicherung;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Basis-Informationen</h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.basis.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Organisation</h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.organisation.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Qualifikation</h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.qualifikation.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">
            {modeId === 'vermoegensverwaltung' ? 'Anstellung & Ziele' : 'Vertragsinformationen'}
          </h3>
        </div>
        <div className="space-y-3 text-sm">
          {data.vertrag.map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Leistung & Entwicklung</h3>
        </div>
        <div className="space-y-3 text-sm">
          {(data.leistung || [
            { label: 'Rang im Vertrieb', value: 'Top 15%' },
            { label: 'Kundenzufriedenheit', value: '4,2 / 5,0' },
            { label: 'Bestandsentwicklung', value: '+8,3% YoY' },
            { label: 'Durchschn. Vertragsgröße', value: '1.850€' },
            { label: 'Letzte Auszeichnung', value: 'Silber Award 2025' },
          ]).map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Digitale Kanäle</h3>
        </div>
        <div className="space-y-3 text-sm">
          {(data.digital || [
            { label: 'App-Nutzung', value: '78% der Kunden' },
            { label: 'Online-Abschlüsse', value: '12 YTD' },
            { label: 'Video-Beratungen', value: '8 / Monat' },
            { label: 'E-Mail Response', value: 'Ø 2,4h' },
            { label: 'Social Media', value: 'LinkedIn aktiv' },
          ]).map((row, i) => (
            <InfoRow key={i} label={row.label} value={row.value} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-4">
      <span className="text-slate-400 shrink-0 w-36">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
