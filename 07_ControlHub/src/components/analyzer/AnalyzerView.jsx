import { useOptimierung } from '../../hooks/useOptimierung';
import OptUploadForm from '../optimierung/OptUploadForm';
import OptProcessing from '../optimierung/OptProcessing';
import IstAnalyseView from './IstAnalyseView';

/**
 * Analyzer — Analyse des bestehenden IKS.
 *
 * Teilt sich den Inventar-State mit dem Optimizer: das Inventar wird einmal
 * eingelesen, danach zeigt der Analyzer die Bestandsaufnahme und der Optimizer
 * die Massnahmen darauf.
 */
export default function AnalyzerView({ onViewChange }) {
  const { phase } = useOptimierung();

  if (phase === 'processing') return <OptProcessing />;
  if (phase === 'result') return <IstAnalyseView onViewChange={onViewChange} />;
  return <OptUploadForm />;
}
