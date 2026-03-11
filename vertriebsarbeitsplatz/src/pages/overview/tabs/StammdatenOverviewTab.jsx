import Card from '../../../components/ui/Card';
import { useMode } from '../../../hooks/useMode';
import { Building2, GraduationCap, FileText, User } from 'lucide-react';

export default function StammdatenOverviewTab() {
  const { config } = useMode();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Basis-Informationen</h3>
        </div>
        <div className="space-y-3 text-sm">
          <InfoRow label="Name" value={config.beraterName} />
          <InfoRow label="Titel" value={config.beraterTitel} />
          <InfoRow label="ID" value={config.beraterId} />
          <InfoRow label="Institut" value={config.institut} />
          <InfoRow label="Status" value="Aktiv" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Organisation</h3>
        </div>
        <div className="space-y-3 text-sm">
          <InfoRow label="Region" value="Koeln-Bonn" />
          <InfoRow label="Bezirk" value="Koeln Sued" />
          <InfoRow label="Team" value="Team Alpha" />
          <InfoRow label="Leitung" value="Frank Mueller" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Qualifikation</h3>
        </div>
        <div className="space-y-3 text-sm">
          <InfoRow label="IHK" value="Versicherungsfachmann/-frau" />
          <InfoRow label="IDD" value="15h / 15h (100%)" />
          <InfoRow label="Letzte Pruefung" value="12/2025" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Vertragsinformationen</h3>
        </div>
        <div className="space-y-3 text-sm">
          <InfoRow label="Vertrag seit" value="01.01.2015" />
          <InfoRow label="Provisionsmodell" value="Kombination (AP + BP)" />
          <InfoRow label="Kuendigungsfrist" value="6 Monate" />
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
