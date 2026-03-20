import { useState } from 'react';
import { X, Clock, Check, ChevronRight, Eye } from 'lucide-react';
import Badge from './Badge';
import { PROFILE, FOUR_EYE_APPROVER, WORKFLOW_STEPS, getStepType, formatAmount, getCurrentTimestamp } from '../data';

function getNextAction(wf) {
  const stepType = getStepType(wf);
  const steps = WORKFLOW_STEPS[stepType];
  if (wf.fourEye) return { label: 'Send Orders', final: true };
  const nextStep = wf.step + 1;
  if (nextStep >= wf.totalSteps) return { label: 'Trading', final: true };
  if (steps[nextStep]) return { label: steps[nextStep].label, final: false };
  return { label: 'Next Step', final: false };
}

export default function WorkflowModal({ workflow, onClose, onAdvance }) {
  const [phase, setPhase] = useState('detail'); // detail | confirm | loading | success
  const [prevAction, setPrevAction] = useState('');

  if (!workflow) return null;

  const wf = workflow;
  const stepType = getStepType(wf);
  const steps = WORKFLOW_STEPS[stepType];
  const currentStepLabel = steps[wf.step]?.label || wf.action;
  const nextAction = getNextAction(wf);
  const amt = wf.amount !== 0 ? formatAmount(wf.amount, wf.ccy) : null;

  const handleApprove = () => {
    setPrevAction(wf.action);
    setPhase('confirm');
  };

  const handleExecute = () => {
    setPhase('loading');
    setTimeout(() => {
      onAdvance(wf.id);
      setPhase('success');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-[2px] flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-[560px] max-w-[90vw] max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{wf.portfolio}</h2>
            <span className="text-base text-slate-500 font-mono">{wf.id} · {wf.portfolioId}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {phase === 'detail' && (
            <div className="animate-fade-in">
              {wf.summary && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-[15px] text-gray-700 leading-relaxed">{wf.summary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5 mb-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold text-slate-400 uppercase tracking-wide">Event</span>
                  <Badge type={stepType}>{wf.event}</Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold text-slate-400 uppercase tracking-wide">Current Action</span>
                  <Badge type={wf.action}>{wf.action}</Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold text-slate-400 uppercase tracking-wide">Amount</span>
                  {amt ? <span className={amt.positive ? 'text-emerald-600' : 'text-red-600'}>{amt.text}</span> : <span>-</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold text-slate-400 uppercase tracking-wide">Progress</span>
                  <span>{wf.step} / {wf.totalSteps} steps</span>
                </div>
              </div>

              <h4 className="text-[15px] font-semibold text-slate-800 mb-2.5">Workflow Progress</h4>
              <div className="flex flex-col mb-4">
                {steps.map((step, idx) => {
                  const status = idx < wf.step ? 'completed' : idx === wf.step ? 'current' : 'upcoming';
                  return (
                    <div key={idx} className={`flex items-center gap-2.5 py-2 px-3 text-[15px] relative
                      ${status === 'completed' ? 'text-emerald-600' : status === 'current' ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                      {idx < steps.length - 1 && (
                        <div className={`absolute left-[22px] top-8 w-0.5 h-[calc(100%-16px)] ${status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      )}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-[1]
                        ${status === 'completed' ? 'bg-green-100 text-emerald-600' : status === 'current' ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                        {status === 'completed' ? <Check size={12} /> : status === 'current' ? <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} /> : <Clock size={12} />}
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span>{step.label}</span>
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide
                          ${step.auto !== false ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {step.auto !== false ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                      {status === 'completed' && step.auto === false && (
                        <span className="text-xs text-slate-400 italic">
                          {PROFILE.fullName} · 24.02.2026, 08:{String(15 + idx * 12).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 4-Eye Section */}
              {wf.fourEye && (
                <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4 mb-4">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-amber-800 mb-3">
                    <Eye size={16} /> 4-Eye Approval Status
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-green-200">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check size={14} /></div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[15px] text-slate-500 uppercase tracking-wide">First Approval</span>
                        <strong className="text-[15px] text-slate-800">{FOUR_EYE_APPROVER.name}</strong>
                        <span className="text-[15px] text-slate-400">{FOUR_EYE_APPROVER.role} · {FOUR_EYE_APPROVER.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Clock size={14} /></div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[15px] text-slate-500 uppercase tracking-wide">Second Approval</span>
                        <strong className="text-[15px] text-slate-800">Awaiting your approval</strong>
                        <span className="text-[15px] text-slate-400">{PROFILE.fullName} · {PROFILE.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <h4 className="text-[15px] font-semibold text-slate-800 mb-1.5">Current Step: {currentStepLabel}</h4>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-4">
                {wf.fourEye && wf.status === 'attention'
                  ? `First approval granted by ${FOUR_EYE_APPROVER.name}. Your approval will complete the 4-eye check and send 15 orders directly to market.`
                  : wf.status === 'attention'
                    ? 'This step requires your approval to proceed.'
                    : 'This step has been completed successfully.'}
              </p>

              {wf.status === 'attention' && !wf.fourEye && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[10px]">
                  <span className="text-[15px] font-semibold text-slate-400 uppercase tracking-wide">Next action after approval:</span>
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold text-[#2d5016]">
                    {nextAction.final ? <Check size={14} /> : <ChevronRight size={14} />} {nextAction.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {phase === 'confirm' && (
            <div className="text-center py-2 animate-fade-in">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-emerald-600"><Check size={24} /></div>
              <h3 className="text-lg font-semibold text-slate-800 mb-5">{wf.fourEye ? '4-Eye Approval Confirmed' : 'Approval Confirmed'}</h3>
              <div className="text-left bg-slate-50 border border-slate-200 rounded-[10px] overflow-hidden">
                {[
                  ['Workflow', wf.id],
                  ['Portfolio', wf.portfolio],
                  ['Previous Action', prevAction || wf.action],
                  ['New Action', wf.fourEye ? 'Send Orders' : nextAction.label],
                  ...(amt ? [['Amount', amt.text]] : []),
                  ['Approved by', PROFILE.fullName],
                  ['Timestamp', getCurrentTimestamp()],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2.5 text-[15px] border-b border-slate-100 last:border-b-0">
                    <span className="text-slate-500">{label}</span>
                    <strong className="text-slate-800">{val}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'loading' && (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-[#2d5016] rounded-full mx-auto mb-4" style={{ animation: 'spin 0.8s linear infinite' }} />
              <p className="text-[15px] text-slate-500">Processing workflow...</p>
            </div>
          )}

          {phase === 'success' && (
            <div className="text-center py-2 animate-fade-in">
              <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-emerald-600"><Check size={28} /></div>
              <h3 className="text-xl font-semibold text-slate-800 mb-1.5">Workflow Updated</h3>
              <p className="text-[15px] text-slate-500 mb-6">{wf.portfolio}</p>
              <div className="flex items-center justify-center gap-3">
                <Badge type={prevAction}>{prevAction}</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge type={wf.action}>{wf.action}</Badge>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-50 rounded-md text-base text-slate-500">
                <span>{PROFILE.fullName}</span>
                <span className="text-slate-400">{getCurrentTimestamp()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50">
          {phase === 'detail' && wf.status === 'attention' && (
            <>
              <button onClick={onClose} className="px-5 py-2 bg-white text-slate-800 border border-slate-200 rounded-md text-[15px] font-medium hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleApprove} className="px-5 py-2 bg-[#2d5016] text-white border-none rounded-md text-[15px] font-semibold hover:bg-[#3d6b1e] transition-all flex items-center gap-1.5">
                <Check size={14} /> {wf.fourEye ? 'Approve & Send Orders' : 'Approve & Advance'}
              </button>
            </>
          )}
          {phase === 'detail' && wf.status !== 'attention' && (
            <button onClick={onClose} className="px-5 py-2 bg-white text-slate-800 border border-slate-200 rounded-md text-[15px] font-medium hover:bg-slate-50 transition-all">Close</button>
          )}
          {phase === 'confirm' && (
            <button onClick={handleExecute} className="px-5 py-2 bg-[#2d5016] text-white border-none rounded-md text-[15px] font-semibold hover:bg-[#3d6b1e] transition-all min-w-[180px]">
              {wf.fourEye ? 'Confirm & Send Orders' : 'Confirm & Execute'}
            </button>
          )}
          {phase === 'success' && (
            <button onClick={onClose} className="px-5 py-2 bg-[#2d5016] text-white border-none rounded-md text-[15px] font-semibold hover:bg-[#3d6b1e] transition-all">Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
