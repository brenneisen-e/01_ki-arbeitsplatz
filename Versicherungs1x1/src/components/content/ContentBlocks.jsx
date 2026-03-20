import Paragraph from './Paragraph';
import DataTable from './DataTable';
import Callout from './Callout';
import Timeline from './Timeline';
import InfoKachelGrid from './InfoKachelGrid';
import ChartBlock from './ChartBlock';
import HeatmapGrid from './HeatmapGrid';
import RegulatoryPyramid from './RegulatoryPyramid';
import ValueChain from './ValueChain';
import CombinedRatioCalc from './CombinedRatioCalc';
import TrendRadar from './TrendRadar';
import NetworkGraph from './NetworkGraph';
import DecisionTree from './DecisionTree';
import ComparisonTable from './ComparisonTable';

const BLOCK_MAP = {
  paragraph: Paragraph,
  table: DataTable,
  callout: Callout,
  timeline: Timeline,
  infoKachelGrid: InfoKachelGrid,
  chartLine: ChartBlock,
  chartBar: ChartBlock,
  chartDonut: ChartBlock,
  heatmapGrid: HeatmapGrid,
  regulatoryPyramid: RegulatoryPyramid,
  valueChain: ValueChain,
  combinedRatioCalc: CombinedRatioCalc,
  trendRadar: TrendRadar,
  networkGraph: NetworkGraph,
  decisionTree: DecisionTree,
  comparisonTable: ComparisonTable,
};

export default function ContentBlocks({ blocks, chapter }) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const Component = BLOCK_MAP[block.type];
        if (!Component) return null;
        return (
          <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 4) * 60}ms` }}>
            <Component block={block} chapter={chapter} />
          </div>
        );
      })}
    </div>
  );
}
