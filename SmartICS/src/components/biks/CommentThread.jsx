import { useState } from 'react';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { getTeamMember } from '../../data/biksAgent';
import { useBiks } from '../../hooks/useBiks';
import { formatRelativeDe, formatDateTimeDe } from '../../utils/datetime';

function Avatar({ member, size = 28 }) {
  const isAgent = member.id === 'agent';
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-semibold text-white"
      style={{ width: size, height: size, background: member.color, fontSize: size * 0.36 }}
      title={`${member.name} · ${member.rolle}`}
    >
      {isAgent ? <Bot size={size * 0.5} /> : member.initialen}
    </div>
  );
}

export default function CommentThread({ comments = [], onAdd, compact = false }) {
  const { currentUser } = useBiks();
  const [text, setText] = useState('');
  const me = getTeamMember(currentUser);

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <MessageSquare size={14} className="text-slate-400" />
        <span className="text-[12px] font-semibold text-slate-600">
          Kollaboration {comments.length > 0 && <span className="text-slate-400 font-normal">· {comments.length} Kommentar{comments.length === 1 ? '' : 'e'}</span>}
        </span>
      </div>

      {comments.length > 0 && (
        <ul className={`space-y-2.5 ${compact ? '' : 'mb-3'}`}>
          {comments.map(c => {
            const m = getTeamMember(c.autorId);
            return (
              <li key={c.id} className="flex gap-2.5">
                <Avatar member={m} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[12.5px] font-semibold text-slate-800">{m.name}</span>
                    <span className="text-[10.5px] text-slate-400">{m.rolle}</span>
                    <span className="text-[10.5px] text-slate-400" title={formatDateTimeDe(c.at)}>· {formatRelativeDe(c.at)}</span>
                  </div>
                  <div className="text-[13px] text-slate-700 leading-snug mt-0.5 bg-slate-50 rounded-lg rounded-tl-sm px-2.5 py-1.5 border border-slate-100">
                    {c.text}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-start gap-2.5 mt-3">
        <Avatar member={me} />
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
              rows={1}
              placeholder={`Kommentar als ${me.name} …`}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-[13px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="px-2.5 py-2 rounded-lg text-white transition-colors disabled:opacity-40 shrink-0"
              style={{ background: 'var(--mode-primary, #0F4D2A)' }}
              title="Kommentar senden (Strg/Cmd + Enter)"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
