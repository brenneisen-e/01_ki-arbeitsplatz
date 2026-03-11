import Card from '../../../components/ui/Card';
import { useMode } from '../../../hooks/useMode';
import { STAMMDATEN_DATA } from '../../../data';
import { Building2, GraduationCap, FileText, User } from 'lucide-react';

export default function StammdatenOverviewTab() {
  const { modeId } = useMode();
  const data = STAMMDATEN_DATA[modeId] || STAMMDATEN_DATA.versicherung;

  return (
    <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}
