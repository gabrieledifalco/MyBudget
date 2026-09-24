import { CURRENCIES, useCurrency } from "./CurrencyContext";

export function CurrencyPreferenceForm() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="card">
      <h2>Preferenze</h2>
      <div className="form-row">
        <label className="field">
          <span>Valuta</span>
          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value as (typeof CURRENCIES)[number]["code"])
            }
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
