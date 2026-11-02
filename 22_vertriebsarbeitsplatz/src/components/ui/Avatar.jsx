import { memo, useState } from 'react';

// Initialen-Avatare in sechs gedämpften Tönen aus den Signal- und
// Quellen-Tokens; der Name bestimmt den Ton stabil über einen Hash.
const TONES = [
  '--color-info',
  '--color-warning',
  '--quelle-kommunikation',
  '--color-danger',
  '--color-success',
  '--quelle-lebensereignis',
];

function getTone(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const token = TONES[Math.abs(hash) % TONES.length];
  return `linear-gradient(135deg, var(${token}), color-mix(in srgb, var(${token}) 82%, black))`;
}

function getInitials(name) {
  const words = name.split(/\s+/).filter(w => !/^(Dr\.|Prof\.|Fam\.|Dipl\.-Ing\.)$/i.test(w));
  return words.map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default memo(function Avatar({ name, foto, size = 32, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (foto && !imgFailed) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={foto}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: getTone(name),
        fontSize: size * 0.38,
      }}
    >
      {getInitials(name)}
    </div>
  );
});
