import { useState } from 'react';
import { getLogoUrl } from '../../utils/logos';
import { neutral, istFiktiveMarke } from '../../utils/whitelabel';

// `echt`: Marke nie ersetzen (Instituts-Auswahl). Sonst zeigt das Whitelabel den
// fiktiven Namen, und fiktive Marken bekommen Initialen statt eines Logos.
export default function LogoImg({ name: echterName, size = 20, className = '', echt = false }) {
  const [failed, setFailed] = useState(false);
  const name = echt ? echterName : neutral(echterName);
  const url = istFiktiveMarke(name) ? null : getLogoUrl(name, size * 2); // 2x for retina

  if (!url || failed) {
    // Fallback: Initialen-Plakette auf vertiefter Fläche
    const initials = name
      .split(/[\s-]+/)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-(--bg-inset) text-(--text-secondary) font-bold shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className={`inline-block rounded object-contain shrink-0 ${className}`}
      style={{ verticalAlign: 'middle' }}
      onError={() => setFailed(true)}
    />
  );
}
