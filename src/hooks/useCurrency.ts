'use client';

import { useAuth } from "@/context/auth-context";
import { convertCurrency, formatCurrency as formatCurrencyFn, getCurrencySymbol } from "@/lib/currency";
import { CurrencyCode } from "@/lib/types";

export function useCurrency() {
  const { preferences } = useAuth();
  const currency = preferences?.currency ?? "rwf";

  // All values stored in RWF, convert to display currency
  const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) => {
    const converted = convertCurrency(value, "rwf", currency);
    return formatCurrencyFn(converted, currency, options);
  };

  // Convert from display currency back to RWF for storage
  const toRwf = (value: number, fromCurrency: CurrencyCode = currency) => {
    return convertCurrency(value, fromCurrency, "rwf");
  };

  // Convert from RWF to display currency
  const fromRwf = (value: number, toCurrency: CurrencyCode = currency) => {
    return convertCurrency(value, "rwf", toCurrency);
  };

  const symbol = getCurrencySymbol(currency);

  return { currency, symbol, formatCurrency, toRwf, fromRwf };
}
