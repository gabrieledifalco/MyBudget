import { useState, type FormEvent } from "react";

import * as profileApi from "@/api/profile.api";
import { useFetch } from "@/hooks/useFetch";
import type { Frequency, PassiveIncomeType } from "@/types/domain";

const TYPE_LABELS: Record<PassiveIncomeType, string> = {
  RENT: "Affitti",
  DIVIDEND: "Dividendi",
  FUND: "Fondi",
  INVESTMENT: "Investimenti",
  PENSION: "Pensioni",
  OTHER: "Altre rendite",
};

const emptyForm = {
  type: "RENT" as PassiveIncomeType,
  description: "",
  amount: "",
  frequency: "MONTHLY" as Frequency,
  startDate: "",
};

export function PassiveIncomeManager() {
  const {
    data: items,
    loading,
    error,
    reload,
  } = useFetch(profileApi.listPassiveIncomes, []);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await profileApi.createPassiveIncome({
        type: form.type,
        description: form.description,
        amount: Number(form.amount),
        frequency: form.frequency,
        startDate: form.startDate,
      });
      setForm(emptyForm);
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await profileApi.deletePassiveIncome(id);
    reload();
  };

  return (
    <div className="card">
      <h2>Rendite e redditi passivi</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field">
            <span>Tipologia</span>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as PassiveIncomeType })
              }
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Descrizione</span>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label className="field">
            <span>Importo (€)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Frequenza</span>
            <select
              value={form.frequency}
              onChange={(e) =>
                setForm({ ...form, frequency: e.target.value as Frequency })
              }
            >
              <option value="DAILY">Giornaliera</option>
              <option value="WEEKLY">Settimanale</option>
              <option value="MONTHLY">Mensile</option>
              <option value="YEARLY">Annuale</option>
            </select>
          </label>
          <label className="field">
            <span>Data inizio</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting}
        >
          Aggiungi rendita
        </button>
      </form>

      {loading && <p className="page__hint">Caricamento…</p>}
      {error && <p className="form__error">{error}</p>}
      {items && items.length === 0 && (
        <p className="empty-state">Nessuna rendita registrata.</p>
      )}
      <div className="list">
        {items?.map((item) => (
          <div className="list-item" key={item.id}>
            <div className="list-item__main">
              <span className="list-item__title">{item.description}</span>
              <span className="list-item__meta">
                {TYPE_LABELS[item.type]} · {item.amount} € · dal{" "}
                {item.startDate.slice(0, 10)}
              </span>
            </div>
            <div className="list-item__actions">
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => handleDelete(item.id)}
              >
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
