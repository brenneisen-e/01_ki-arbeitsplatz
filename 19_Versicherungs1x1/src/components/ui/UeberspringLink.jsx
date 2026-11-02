// Skip-Link: erstes fokussierbares Element. Der Klick darf den Hash NICHT
// ändern (Hash-Router), deshalb fokussieren wir das Ziel per Skript.
export default function UeberspringLink({ ziel = 'inhalt', children = 'Zum Inhalt' }) {
  const springe = (e) => {
    e.preventDefault();
    const el = document.getElementById(ziel);
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'start' });
  };
  return <a href={`#${ziel}`} className="ueberspring-link" onClick={springe}>{children}</a>;
}
