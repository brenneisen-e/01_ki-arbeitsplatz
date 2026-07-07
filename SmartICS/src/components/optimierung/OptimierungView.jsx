import { useOptimierung } from '../../hooks/useOptimierung';
import OptUploadForm from './OptUploadForm';
import OptProcessing from './OptProcessing';
import OptResultBoard from './OptResultBoard';

export default function OptimierungView() {
  const { phase } = useOptimierung();

  if (phase === 'processing') return <OptProcessing />;
  if (phase === 'result') return <OptResultBoard />;
  return <OptUploadForm />;
}
