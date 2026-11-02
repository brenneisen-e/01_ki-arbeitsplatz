// Breadcrumb — dreistufig (Start › Kapitel › Lerneinheit), letzte Stufe nicht
// verlinkt; auf der Startseite leer. Sichtbar ab 1280 px (CSS): darunter bleiben
// der Topbar nach Suche, Knöpfen und Stand nur rund 130 px, in denen die
// Lerneinheit auf ein Dutzend Pixel zusammenfiel — den Weg zeigen dort die
// Seitenleiste und die Überschriften. Zwischen 1280 und 1440 px steht für das
// Kapitel die Kurzform „Kapitel 01“ (`kurz`), damit die Lerneinheit lesbar bleibt.
import { ChevronRight } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import { nummer } from '../../lib/text.js';

/** Lange Beschriftung, darunter (< 1440 px) die Kurzform, falls es eine gibt. */
function Beschriftung({ stufe }) {
  if (!stufe.kurz) return stufe.label;
  return (
    <>
      <span className="brotkrumen-lang">{stufe.label}</span>
      <span className="brotkrumen-kurz">{stufe.kurz}</span>
    </>
  );
}

export default function Breadcrumb() {
  const { route, kapitel, kapitelIndex, einheit, routeZuHash } = useWissen();
  if (route.name === 'start') return null;

  const stufen = [{ label: 'Start', href: '#/' }];
  if (route.name === 'kapitel' && kapitel) {
    const erste = (kapitel.subChapters || [])[0];
    stufen.push({
      label: kapitel.title,
      kurz: `Kapitel ${nummer(kapitelIndex)}`,
      href: erste ? routeZuHash({ name: 'kapitel', kapitelId: kapitel.id, einheitId: erste.id }) : null,
    });
    if (einheit) stufen.push({ label: einheit.title });
  } else if (route.name === 'glossar') {
    stufen.push({ label: 'Glossar' });
  } else if (route.name === 'wissenscheck') {
    stufen.push({ label: 'Wissenscheck', href: kapitel ? '#/wissenscheck' : null });
    if (kapitel) stufen.push({ label: kapitel.title });
  }
  if (stufen.length < 2) return null;

  return (
    <nav aria-label="Brotkrumen" className="brotkrumen">
      <ol>
        {stufen.map((s, i) => {
          const letzte = i === stufen.length - 1;
          return (
            <li key={`${s.label}-${i}`}>
              {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
              {letzte || !s.href
                ? <span aria-current={letzte ? 'page' : undefined} title={s.label}><Beschriftung stufe={s} /></span>
                : <a href={s.href} title={s.label}><Beschriftung stufe={s} /></a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
