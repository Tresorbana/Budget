import { CurrencyCode } from "./types";

// Exchange rates (base: RWF)
// These are approximate rates - in production, fetch from an API
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  rwf: 1,
  usd: 0.0008, // 1 RWF = 0.0008 USD (approx 1250 RWF = 1 USD)
  eur: 0.00074, // 1 RWF = 0.00074 EUR (approx 1350 RWF = 1 EUR)
};

const currencyMap: Record<
  CurrencyCode,
  { symbol: string; locale: string; currency: string }
> = {
  rwf: { symbol: "RWF", locale: "rw-RW", currency: "RWF" },
  usd: { symbol: "$", locale: "en-US", currency: "USD" },
  eur: { symbol: "€", locale: "fr-FR", currency: "EUR" },
};

/**
 * Converts a value from RWF to the target currency
 */
export function convertCurrency(
  value: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return value;
  
  // Convert to RWF first (base currency)
  const inRwf = from === "rwf" ? value : value / EXCHANGE_RATES[from];
  
  // Convert from RWF to target
  return to === "rwf" ? inRwf : inRwf * EXCHANGE_RATES[to];
}

export function formatCurrency(
  value: number,
  currency: CurrencyCode = "rwf",
  options?: Intl.NumberFormatOptions,
) {
  const config = currencyMap[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

export function getCurrencySymbol(currency: CurrencyCode = "rwf") {
  return currencyMap[currency]?.symbol ?? "¤";
}
