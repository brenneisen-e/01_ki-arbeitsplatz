/**
 * AmountInput – A currency input field that displays a formatted German-locale
 * number when blurred and allows raw numeric entry while focused.
 *
 * Props:
 *   value        number | string | ''  – the raw numeric value
 *   onChange     (value) => void       – callback with parsed integer or ''
 *   label        string | undefined    – optional label above the input
 *   placeholder  string                – input placeholder (default '0')
 *   disabled     boolean               – disable the field
 */

import { useState, useRef } from 'react';

const formatter = new Intl.NumberFormat('de-DE');

export default function AmountInput({
  value,
  onChange,
  label,
  placeholder = '0',
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Format value for display when the field is not focused.
  const displayValue = focused
    ? value || ''
    : value
      ? formatter.format(value)
      : '';

  const handleChange = (e) => {
    // Strip everything that is not a digit.
    const raw = e.target.value.replace(/[^\d]/g, '');
    onChange(raw ? parseInt(raw, 10) : '');
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider font-body">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={
            'w-full px-3 py-2 pr-8 border border-border rounded-md text-sm font-mono ' +
            'focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 ' +
            'disabled:bg-gray-50 disabled:text-text-muted ' +
            'placeholder:text-text-muted'
          }
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none"
          aria-hidden="true"
        >
          &euro;
        </span>
      </div>
    </div>
  );
}
