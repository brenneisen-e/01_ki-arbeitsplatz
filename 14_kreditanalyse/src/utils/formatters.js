// Format Euro amounts: 1234567.89 -> "1.234.567,89 €"
export const formatCurrency = (value, decimals = 0) => {
  if (value == null || isNaN(value)) return '–';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: decimals, maximumFractionDigits: decimals
  }).format(value);
};

// Format percentage: 0.2534 -> "25,34%" or 25.34 -> "25,34%"
export const formatPercent = (value, decimals = 1, isRaw = false) => {
  if (value == null || isNaN(value)) return '–';
  const pct = isRaw ? value : value * 100;
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(pct) + '%';
};

// Format number with German locale: 1234567.89 -> "1.234.567,89"
export const formatNumber = (value, decimals = 0) => {
  if (value == null || isNaN(value)) return '–';
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
};

// Format date: "2024-01-15" -> "15.01.2024"
export const formatDate = (dateStr) => {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  if (isNaN(d)) return String(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format compact currency: 1500000 -> "1,5 Mio €"
export const formatCurrencyCompact = (value) => {
  if (value == null || isNaN(value)) return '–';
  if (Math.abs(value) >= 1000000) return formatNumber(value / 1000000, 1) + ' Mio €';
  if (Math.abs(value) >= 1000) return formatNumber(value / 1000, 0) + ' Tsd €';
  return formatCurrency(value);
};

// Days remaining from date string
export const daysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

// SLA color based on days remaining
export const slaColor = (days) => {
  if (days == null) return 'text-text-muted';
  if (days > 7) return 'text-accent';
  if (days > 3) return 'text-accent-warm';
  return 'text-danger';
};
