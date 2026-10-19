export function formatCurrencyMinor(amountMinor, currency = "INR", locale = "en-IN", options = {}) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: options.maximumFractionDigits ?? 0 }).format((amountMinor || 0) / 100);
}
