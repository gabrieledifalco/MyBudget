import { useState, type FormEvent } from "react";

import * as expenseApi from "@/api/expense.api";
import { useFetch } from "@/hooks/useFetch";
import type { Loan } from "@/types/domain";

const emptyForm = {
  name: "",
  description: "",
  totalAmount: "",
  monthlyPayment: "",
  startDate: "",
  endDate: "",
};

export function LoanManager() {
  const {
    data: loans,
    loading,
    error,
    reload,
  } = useFetch(expenseApi.listLoans, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startEdit = (loan: Loan) => {
    setEditingId(loan.id);
    setForm({
      name: loan.name,
      description: loan.description ?? "",
      totalAmount: String(loan.totalAmount),
      monthlyPayment: String(loan.monthlyPayment),
      startDate: loan.startDate.slice(0, 10),
      endDate: loan.endDate.slice(0, 10),
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
        totalAmount: Number(form.totalAmount),
        monthlyPayment: Number(form.monthlyPayment),
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (editingId) {
        await expenseApi.updateLoan(editingId, payload);
      } else {
        await expenseApi.createLoan(payload);
      }
      resetForm();
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await expenseApi.deleteLoan(id);
    if (editingId === id) resetForm();
    reload();
  };

  return (
    <div className="card">
      <h2>Finanziamenti</h2>
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
            <span>Importo totale (€)</span>
            <input
              type="number"
              min={0}
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: e.target.value })
              }
              required
            />
          </label>
          <label className="field">
            <span>Rata mensile (€)</span>
            <input
              type="number"
              min={0}
              value={form.monthlyPayment}
              onChange={(e) =>
                setForm({ ...form, monthlyPayment: e.target.value })
              }
              required
            />
          </label>
        </div>

        <label className="field">
          <span>Descrizione</span>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <div className="form-row">
          <label className="field">
            <span>Data inizio</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Data fine</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </label>
        </div>

        <div className="list-item__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {editingId ? "Salva modifiche" : "Aggiungi finanziamento"}
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

      {loading && <p className="page__hint">Caricamento…</p>}
      {error && <p className="form__error">{error}</p>}
      {loans && loans.length === 0 && (
        <p className="empty-state">Nessun finanziamento registrato.</p>
      )}
      <div className="list">
        {loans?.map((loan) => (
          <div className="list-item" key={loan.id}>
            <div className="list-item__main">
              <span className="list-item__title">{loan.name}</span>
              <span className="list-item__meta">
                Rata {loan.monthlyPayment} €/mese · Totale {loan.totalAmount} €
                · {loan.startDate.slice(0, 10)} → {loan.endDate.slice(0, 10)}
              </span>
            </div>
            <div className="list-item__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => startEdit(loan)}
              >
                Modifica
              </button>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => handleDelete(loan.id)}
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
