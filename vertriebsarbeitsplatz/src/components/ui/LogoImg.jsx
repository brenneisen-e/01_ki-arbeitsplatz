import { useState } from 'react';
import { getLogoUrl } from '../../utils/logos';

export default function LogoImg({ name, size = 20, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = getLogoUrl(name, size * 2); // 2x for retina

  if (!url || failed) {
    // Fallback: initials badge
    const initials = name
      .split(/[\s-]+/)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-slate-100 text-slate-500 font-bold shrink-0 ${className}`}
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
