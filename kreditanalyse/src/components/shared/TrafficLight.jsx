/**
 * TrafficLight – A small colored dot indicator (green / yellow / red) with an
 * optional text label. Useful for quick risk or status visualization.
 *
 * Props:
 *   color  ('green' | 'yellow' | 'red') – traffic light color
 *   label  (string | undefined)         – optional text next to the dot
 *   size   ('sm' | 'md')                – dot size (default 'md')
 */

const colorSchemes = {
  green: {
    dot: 'bg-green-500',
    bg:  'bg-green-50 text-green-700',
  },
  yellow: {
    dot: 'bg-amber-500',
    bg:  'bg-amber-50 text-amber-700',
  },
  red: {
    dot: 'bg-red-500',
    bg:  'bg-red-50 text-red-700',
  },
};

export default function TrafficLight({ color, label, size = 'md' }) {
  const scheme = colorSchemes[color] || colorSchemes.yellow;
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        label
          ? `rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${scheme.bg}`
          : ''
      }`}
    >
      <span
        className={`${dotSize} shrink-0 rounded-full ${scheme.dot}`}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
    </span>
  );
}
