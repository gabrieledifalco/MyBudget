import { useState, type FormEvent } from "react";

import * as expenseApi from "@/api/expense.api";
import { useFetch } from "@/hooks/useFetch";
import type {
  Expense,
  ExpenseKind,
  Frequency,
  UtilityLevel,
} from "@/types/domain";

const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "Giornaliera",
  WEEKLY: "Settimanale",
  MONTHLY: "Mensile",
  YEARLY: "Annuale",
};

const emptyForm = {
  name: "",
  description: "",
  kind: "VARIABLE" as ExpenseKind,
  categoryId: "",
  amount: "",
  frequency: "MONTHLY" as Frequency,
  utility: "3",
};

export function ExpenseManager() {
  const { data: categories } = useFetch(expenseApi.listCategories, []);
  const {
    data: expenses,
    loading,
    error,
    reload,
  } = useFetch(expenseApi.listExpenses, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      name: expense.name,
      description: expense.description ?? "",
      kind: expense.kind,
      categoryId: expense.categoryId ?? "",
      amount: String(expense.amount),
      frequency: expense.frequency,
      utility: String(expense.utility),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        kind: form.kind,
        categoryId: form.categoryId || undefined,
        amount: Number(form.amount),
        frequency: form.frequency,
        utility: Number(form.utility) as UtilityLevel,
      };

      if (editingId) {
        await expenseApi.updateExpense(editingId, payload);
      } else {
        await expenseApi.createExpense(payload);
      }
      resetForm();
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await expenseApi.deleteExpense(id);
    if (editingId === id) resetForm();
    reload();
  };

  return (
    <>
      <div className="card">
        <h2>{editingId ? "Modifica spesa" : "Nuova spesa"}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field">
              <span>Nome</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Categoria</span>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Nessuna</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tipo</span>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm({ ...form, kind: e.target.value as ExpenseKind })
                }
              >
                <option value="FIXED">Fissa</option>
                <option value="VARIABLE">Variabile</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Descrizione</span>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

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
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Utilità (1 superflua - 5 essenziale)</span>
              <select
                value={form.utility}
                onChange={(e) => setForm({ ...form, utility: e.target.value })}
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="list-item__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {editingId ? "Salva modifiche" : "Aggiungi spesa"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={resetForm}
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Spese registrate</h2>
        {loading && <p className="page__hint">Caricamento…</p>}
        {error && <p className="form__error">{error}</p>}
        {expenses && expenses.length === 0 && (
          <p className="empty-state">Nessuna spesa registrata.</p>
        )}
        <div className="list">
          {expenses?.map((expense) => (
            <div className="list-item" key={expense.id}>
              <div className="list-item__main">
                <span className="list-item__title">
                  {expense.name}{" "}
                  <span className={`badge badge--utility-${expense.utility}`}>
                    {expense.utility}/5
                  </span>
                </span>
                <span className="list-item__meta">
                  {expense.kind === "FIXED" ? "Fissa" : "Variabile"} ·{" "}
                  {expense.amount} € /{" "}
                  {FREQUENCY_LABELS[expense.frequency].toLowerCase()}
                </span>
              </div>
              <div className="list-item__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => startEdit(expense)}
                >
                  Modifica
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(expense.id)}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
