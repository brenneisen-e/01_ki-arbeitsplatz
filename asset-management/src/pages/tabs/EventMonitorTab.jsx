import { useState, useCallback, useRef, useEffect, Fragment } from 'react';
import { AlertTriangle, Check, MoreVertical, Eye, Play, Pause, RotateCcw, Clock } from 'lucide-react';
import KpiRow from '../../components/KpiRow';
import Badge from '../../components/Badge';
import ProgressSteps from '../../components/ProgressSteps';
import { PROFILE, WORKFLOW_STEPS, getStepType, formatAmount } from '../../data';

function ContextMenu({ wf, x, y, onAction, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('click', handler), 10);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  const items = [
    { icon: Eye, label: 'View Portfolio', action: 'view' },
    { icon: Play, label: 'Advance Workflow', action: 'advance' },
    { icon: Pause, label: 'Pause Workflow', action: 'pause' },
    { icon: RotateCcw, label: 'Reset Workflow', action: 'reset' },
  ];

  return (
    <div ref={ref} className="fixed z-[10000] bg-white border border-slate-200 rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] min-w-[220px] overflow-hidden animate-scale-in"
         style={{ left: x, top: y }}>
      <div className="px-3.5 py-2.5 text-[15px] font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 truncate">
        {wf.id} - {wf.portfolio}
      </div>
      {items.map(item => (
        <button key={item.action} onClick={() => { onAction(item.action, wf.id); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-transparent border-none text-[15px] text-slate-800 cursor-pointer hover:bg-slate-100 text-left transition-colors">
          <item.icon size={14} className="text-slate-500" /> {item.label}
        </button>
      ))}
    </div>
  );
}

function WorkflowDetailSteps({ wf }) {
  const stepType = getStepType(wf);
  const steps = WORKFLOW_STEPS[stepType];

  return (
    <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 animate-fade-in">
      <h4 className="text-base font-semibold text-slate-500 uppercase tracking-wide mb-3">Workflow Steps</h4>
      <div className="flex flex-col gap-2 mb-4">
        {steps.map((step, idx) => {
          const status = idx < wf.step ? 'completed' : idx === wf.step ? 'current' : 'upcoming';
          return (
            <div key={idx} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border
              ${status === 'completed' ? 'bg-green-50 border-green-200' : status === 'current' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 opacity-60'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                ${status === 'completed' ? 'bg-green-100 text-emerald-600' : status === 'current' ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                {status === 'completed' ? <Check size={12} /> : status === 'current' ? <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} /> : <Clock size={12} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-slate-800">{step.label}</span>
                <span className="text-[15px] text-slate-500">
                  {status === 'completed' ? 'Completed' : status === 'current' ? 'Current Step' : 'Upcoming'}
                </span>
                {status === 'completed' && step.auto === false && (
                  <span className="text-xs text-slate-400 italic">{PROFILE.fullName} · 24.02.2026, 08:{String(15 + idx * 12).padStart(2, '0')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EventMonitorTab({ workflows, flashWfId, onOpenModal, onContextAction, onSwitchTab }) {
  const [expandedId, setExpandedId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const attentionWfs = workflows.filter(w => w.status === 'attention' || w.status === 'paused');
  const completedWfs = workflows.filter(w => w.status === 'completed');

  const kpis = [
    { label: 'Live Portfolios', value: '735', type: 'neutral', onClick: () => onSwitchTab('portfolios') },
    { label: 'Requires Attention', value: String(attentionWfs.length), type: 'warning' },
    { label: 'Draft Orders', value: '12', type: 'info' },
    { label: 'Cash Changes', value: '8', type: 'info', onClick: () => onSwitchTab('cashflows') },
    { label: 'Completed Today', value: String(completedWfs.length), type: 'success' },
  ];

  const handleContextMenu = useCallback((e, wf) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ wf, x: e.clientX, y: e.clientY });
  }, []);

  const renderTable = (wfs) => {
    if (!wfs.length) return <div className="p-6 text-center text-slate-400 text-[15px]">No workflows</div>;
    return (
      <div className="border border-slate-200 rounded-[10px] overflow-hidden bg-white">
        <table className="w-full border-collapse text-[15px]">
          <thead className="bg-slate-50">
            <tr>
              {['Workflow ID', 'Portfolio', 'Event', 'Action', 'Progress', 'Amount', ''].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[15px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wfs.map(wf => {
              const stepType = getStepType(wf);
              const amt = wf.amount !== 0 ? formatAmount(wf.amount, wf.ccy) : null;
              const isExpanded = expandedId === wf.id;
              const isFlashing = flashWfId === wf.id;

              return (
                <Fragment key={wf.id}>
                  <tr className={`row-hover ${isExpanded ? 'bg-slate-100' : ''} ${isFlashing ? 'row-flash' : ''}`}
                      onClick={() => setExpandedId(prev => prev === wf.id ? null : wf.id)}>
                    <td className="px-3.5 py-2.5 border-b border-slate-100 font-mono text-base text-blue-500 font-medium">{wf.id}</td>
                    <td className="px-3.5 py-2.5 border-b border-slate-100 font-medium text-slate-800 max-w-[240px] truncate">{wf.portfolio}</td>
                    <td className="px-3.5 py-2.5 border-b border-slate-100"><Badge type={stepType}>{wf.event}</Badge></td>
                    <td className="px-3.5 py-2.5 border-b border-slate-100">
                      <Badge type={wf.action} onClick={(e) => { e.stopPropagation(); onOpenModal(wf.id); }}>{wf.action}</Badge>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-slate-100"><ProgressSteps current={wf.step} total={wf.totalSteps} /></td>
                    <td className="px-3.5 py-2.5 border-b border-slate-100 text-right font-mono text-base">
                      {amt ? <span className={amt.positive ? 'text-emerald-600' : 'text-red-600'}>{amt.text}</span> : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-slate-100">
                      <button onClick={(e) => handleContextMenu(e, wf)}
                        className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded text-slate-400 cursor-pointer hover:bg-slate-200 hover:text-slate-800 transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="!p-0 border-b-2 border-slate-200">
                        <WorkflowDetailSteps wf={wf} />
                        <div className="px-5 pb-4 flex gap-2">
                          {wf.status === 'attention' ? (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); onOpenModal(wf.id); }}
                                className="px-5 py-2 bg-[#2d5016] text-white border-none rounded-md text-[15px] font-semibold hover:bg-[#3d6b1e] transition-all">
                                Approve & Advance
                              </button>
                              <button className="px-5 py-2 bg-white text-slate-800 border border-slate-200 rounded-md text-[15px] font-medium hover:bg-slate-50 transition-all">
                                View Portfolio
                              </button>
                            </>
                          ) : (
                            <button className="px-5 py-2 bg-white text-slate-800 border border-slate-200 rounded-md text-[15px] font-medium hover:bg-slate-50 transition-all">
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <KpiRow items={kpis} />

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <AlertTriangle size={14} /> Requires Attention
            </h3>
            <span className="text-[15px] font-semibold px-2 py-0.5 rounded-[10px] bg-amber-100 text-amber-800">{attentionWfs.length}</span>
          </div>
          {renderTable(attentionWfs)}
        </div>

        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Check size={14} /> Completed
            </h3>
            <span className="text-[15px] font-semibold px-2 py-0.5 rounded-[10px] bg-green-100 text-green-800">{completedWfs.length}</span>
          </div>
          {renderTable(completedWfs)}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          wf={contextMenu.wf}
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={onContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

