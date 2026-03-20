import { useState } from 'react';
import { getIconComponent, ChevronLeft, RotateCcw, ShieldCheck } from '../ui/Icons';

export default function DecisionTree({ block, chapter }) {
  const tree = chapter?.decisionTrees?.[block.treeKey];
  const [currentNode, setCurrentNode] = useState(tree?.start);
  const [history, setHistory] = useState([]);

  if (!tree) return null;

  const node = tree.nodes[currentNode];
  if (!node) return null;

  const goTo = (nextId) => {
    setHistory(prev => [...prev, currentNode]);
    setCurrentNode(nextId);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentNode(prev);
  };

  const restart = () => {
    setHistory([]);
    setCurrentNode(tree.start);
  };

  // Result node
  if (node.result) {
    const Icon = getIconComponent(node.icon || 'shield-check');
    return (
      <div className="my-6">
        {(block.title || tree.title) && (
          <h3 className="text-base font-bold text-slate-900 mb-3">{block.title || tree.title}</h3>
        )}
        <div className="dt-result">
          <div className="text-emerald-700 mb-3">
            <Icon className="w-8 h-8 mx-auto" />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">{node.title}</h4>
          {node.items?.length > 0 && (
            <ul className="text-sm text-slate-600 space-y-1 mt-3 text-left max-w-md mx-auto">
              {node.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {node.note && <p className="text-xs text-slate-500 mt-3">{node.note}</p>}
          <button
            onClick={restart}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
          >
            <RotateCcw className="w-4 h-4" /> Neu starten
          </button>
        </div>
      </div>
    );
  }

  // Question node
  return (
    <div className="my-6">
      {(block.title || tree.title) && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title || tree.title}</h3>
      )}
      <div className="card-base p-6">
        <p className="font-semibold text-slate-900 mb-4">{node.question}</p>
        <div className="space-y-2">
          {(node.options || []).map((opt, i) => (
            <button key={i} className="dt-option" onClick={() => goTo(opt.next)}>
              {opt.label}
            </button>
          ))}
        </div>
        {history.length > 0 && (
          <button
            onClick={goBack}
            className="mt-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
        )}
      </div>
    </div>
  );
}
