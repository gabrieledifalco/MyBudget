// Normalizzazione degli importi rispetto alla frequenza.
// Usata da dashboard, insights e simulatore per confrontare voci eterogenee.

const PER_YEAR = {
  DAILY: 365,
  WEEKLY: 52,
  MONTHLY: 12,
  YEARLY: 1,
};

export function toYearly(amount, frequency) {
  const multiplier = PER_YEAR[frequency];
  if (!multiplier) throw new Error(`Frequenza non supportata: ${frequency}`);
  return amount * multiplier;
}

export function toMonthly(amount, frequency) {
  return toYearly(amount, frequency) / 12;
}

export function toDaily(amount, frequency) {
  return toYearly(amount, frequency) / 365;
}
