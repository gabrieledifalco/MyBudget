import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "CHF";

export const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "EUR", label: "Euro (€)" },
  { code: "USD", label: "Dollaro USA ($)" },
  { code: "GBP", label: "Sterlina (£)" },
  { code: "CHF", label: "Franco svizzero (CHF)" },
];

const STORAGE_KEY = "mybudget.currency";
const DEFAULT_CURRENCY: CurrencyCode = "EUR";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  format: (value: number | null | undefined) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): CurrencyCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return CURRENCIES.some((c) => c.code === stored)
    ? (stored as CurrencyCode)
    : DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(readStoredCurrency);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const value = useMemo<CurrencyContextValue>(() => {
    // Locale it-IT: punto per le migliaia, virgola per i decimali.
    const formatter = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const symbol =
      formatter.formatToParts(0).find((p) => p.type === "currency")?.value ??
      currency;
    return {
      currency,
      setCurrency,
      format: (value) => formatter.format(value ?? 0),
      symbol,
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx)
    throw new Error("useCurrency deve essere usato dentro CurrencyProvider");
  return ctx;
}
