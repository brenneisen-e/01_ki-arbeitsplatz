import { useGapAnalyse } from '../../hooks/useGapAnalyse';
import GapUploadForm from './GapUploadForm';
import GapProcessing from './GapProcessing';
import GapResultBoard from './GapResultBoard';

export default function GapAnalyseView() {
  const { phase } = useGapAnalyse();

  if (phase === 'processing') return <GapProcessing />;
  if (phase === 'result') return <GapResultBoard />;
  return <GapUploadForm />;
}
