import { Info, AlertTriangle, Lightbulb } from '../ui/Icons';

const VARIANT_MAP = {
  info: { icon: Info, cls: 'info' },
  warning: { icon: AlertTriangle, cls: 'warning' },
  'alert-circle': { icon: AlertTriangle, cls: 'warning' },
  tip: { icon: Lightbulb, cls: 'tip' },
  lightbulb: { icon: Lightbulb, cls: 'tip' },
};

export default function Callout({ block }) {
  const variant = block.icon || block.variant || 'info';
  const config = VARIANT_MAP[variant] || VARIANT_MAP.info;
  const Icon = config.icon;

  return (
    <div className={`callout ${config.cls} my-4`}>
      <span className="callout-icon">
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <div
        className="text-sm leading-relaxed [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: block.text || block.content || '' }}
      />
    </div>
  );
}
