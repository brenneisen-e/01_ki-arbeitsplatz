// ===========================================================================
// KachelRaster.jsx — Blocktyp `infoKachelGrid`: Kacheln (12 px Radius) mit
// Icon in --marke-weich, Titel 600, Beschreibung 14 px, optional
// „Mehr erfahren“ (item.link / item.sourceUrl) mit ArrowUpRight.
// ===========================================================================
import { ArrowUpRight } from 'lucide-react';
import { getIconComponent } from '../ui/Icons.jsx';
import BlockRahmen from './BlockRahmen.jsx';
import InlineHtml from './Inline.jsx';

export default function KachelRaster({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  return (
    <BlockRahmen titel={block.title} quelle={block.source} quelleUrl={block.sourceUrl} className="bl-kacheln-block">
      <ul className="bl-kacheln" role="list">
        {items.map((item, i) => {
          const Symbol = getIconComponent(item.icon || 'info');
          const link = item.link || item.sourceUrl;
          return (
            <li key={i} className="bl-kachel">
              <span className="bl-kachel-symbol" aria-hidden="true"><Symbol size={18} /></span>
              <h4 className="bl-kachel-titel">{item.title}</h4>
              {item.description && <p className="bl-kachel-text"><InlineHtml html={String(item.description)} begriffe={false} /></p>}
              {link && (
                <a className="bl-kachel-link" href={link} target="_blank" rel="noopener noreferrer">
                  Mehr erfahren <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="sr-only"> (öffnet in neuem Tab)</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </BlockRahmen>
  );
}
