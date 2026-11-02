import { useBiks } from '../../hooks/useBiks';
import UploadForm from './UploadForm';
import ProcessingAnimation from './ProcessingAnimation';
import ResultBoard from './ResultBoard';

export default function BiksAgentView() {
  const { phase } = useBiks();

  if (phase === 'processing') return <ProcessingAnimation />;
  if (phase === 'result') return <ResultBoard />;
  return <UploadForm />;
}
