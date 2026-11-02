import { useOptimierung } from '../../hooks/useOptimierung';
import OptUploadForm from '../optimierung/OptUploadForm';
import OptProcessing from '../optimierung/OptProcessing';
import OptResultBoard from '../optimierung/OptResultBoard';

/**
 * Optimizer — Optimierung des bestehenden IKS.
 *
 * Setzt auf demselben eingelesenen Inventar auf wie der Analyzer.
 */
export default function OptimizerView({ onViewChange }) {
  const { phase } = useOptimierung();

  if (phase === 'processing') return <OptProcessing />;
  if (phase === 'result') return <OptResultBoard onViewChange={onViewChange} />;
  return <OptUploadForm />;
}
