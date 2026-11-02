// ===========================================================================
// Begriff — Glossarbegriff im Fließtext: <Begriff slug>{text}</Begriff>.
// Gepunktete Unterstreichung, Link ins Glossar; nach ~600 ms Hover, bei
// Fokus oder Tipp öffnet die Hover-Card (useBegriffKarte). Unbekannte Slugs
// geben den Text unverändert zurück. Props wie beim Stub des Fundaments.
// ===========================================================================
import { useWissen } from '../../store/Wissen.jsx';
import { useBegriffKarte } from './BegriffKarte.jsx';

export default function Begriff({ slug, children }) {
  const { routeZuHash } = useWissen();
  const { eintrag, ankerProps, karte } = useBegriffKarte(slug);
  if (!eintrag) return children;
  return (
    <>
      <a className="begriff" href={routeZuHash({ name: 'glossar', slug: eintrag.slug })} {...ankerProps}>
        {children}
      </a>
      {karte}
    </>
  );
}
