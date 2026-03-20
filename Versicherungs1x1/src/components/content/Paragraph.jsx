import { getCiteUrl } from '../../utils/citeMap';
import { useRef, useEffect } from 'react';

export default function Paragraph({ block }) {
  const ref = useRef(null);

  // Enrich cite links after mount
  useEffect(() => {
    if (!ref.current) return;
    const cites = ref.current.querySelectorAll('.v1x1-cite');
    cites.forEach(cite => {
      const tooltip = cite.querySelector('.v1x1-cite-tooltip');
      if (!tooltip || tooltip.querySelector('a')) return;
      const sourceText = tooltip.textContent.trim();
      const url = getCiteUrl(sourceText);
      const br = document.createElement('br');
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'text-emerald-600 font-medium text-xs hover:underline';
      link.textContent = '→ Quelle öffnen';
      tooltip.appendChild(br);
      tooltip.appendChild(link);
    });
  }, [block.content]);

  return (
    <div ref={ref}>
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-2">{block.title}</h3>
      )}
      <div
        className="text-sm text-slate-700 leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900 [&_.v1x1-cite]:relative [&_.v1x1-cite]:cursor-pointer [&_.v1x1-cite-num]:inline-flex [&_.v1x1-cite-num]:items-center [&_.v1x1-cite-num]:justify-center [&_.v1x1-cite-num]:w-4 [&_.v1x1-cite-num]:h-4 [&_.v1x1-cite-num]:text-[9px] [&_.v1x1-cite-num]:font-bold [&_.v1x1-cite-num]:bg-emerald-600 [&_.v1x1-cite-num]:text-white [&_.v1x1-cite-num]:rounded-full [&_.v1x1-cite-num]:align-super [&_.v1x1-cite-num]:ml-0.5 [&_.v1x1-cite-tooltip]:hidden [&_.v1x1-cite:hover_.v1x1-cite-tooltip]:block [&_.v1x1-cite-tooltip]:absolute [&_.v1x1-cite-tooltip]:bottom-full [&_.v1x1-cite-tooltip]:left-1/2 [&_.v1x1-cite-tooltip]:-translate-x-1/2 [&_.v1x1-cite-tooltip]:mb-2 [&_.v1x1-cite-tooltip]:bg-white [&_.v1x1-cite-tooltip]:border [&_.v1x1-cite-tooltip]:border-slate-200 [&_.v1x1-cite-tooltip]:rounded-lg [&_.v1x1-cite-tooltip]:p-3 [&_.v1x1-cite-tooltip]:text-xs [&_.v1x1-cite-tooltip]:text-slate-600 [&_.v1x1-cite-tooltip]:shadow-lg [&_.v1x1-cite-tooltip]:w-64 [&_.v1x1-cite-tooltip]:z-30 [&_.v1x1-cite-tooltip]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}
