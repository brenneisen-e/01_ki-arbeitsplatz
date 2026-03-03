/**
 * PercentageBar – A horizontal progress bar that changes colour based on
 * configurable thresholds. Ideal for utilisation rates, LTV, or any 0-100
 * metric.
 *
 * Props:
 *   value       number             – current value (0-100)
 *   thresholds  { green, yellow }  – breakpoints (default { green: 60, yellow: 80 })
 *   label       string | undefined – optional left-aligned label
 *   showValue   boolean            – show numeric percentage (default true)
 */

export default function PercentageBar({
  value,
  thresholds = { green: 60, yellow: 80 },
  label,
  showValue = true,
}) {
  // Determine bar colour based on thresholds.
  let barColor = 'bg-green-500';
  if (value > thresholds.yellow) {
    barColor = 'bg-red-500';
  } else if (value > thresholds.green) {
    barColor = 'bg-amber-500';
  }

  const clampedWidth = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
          {label && <span className="font-body">{label}</span>}
          {showValue && (
            <span className="font-mono tabular-nums">
              {value.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
    </div>
  );
}
