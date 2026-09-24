import { useState, type FormEvent } from "react";

import * as expenseApi from "@/api/expense.api";
import * as simulationApi from "@/api/simulation.api";
import { useFetch } from "@/hooks/useFetch";
import type { SimulationAction, SimulationResult } from "@/types/domain";

type ActionKind = SimulationAction["type"];

const currency = (value: number) => `${value.toFixed(0)} €`;

export function SimulatorBuilder({ onSaved }: { onSaved: () => void }) {
  const { data: expenses } = useFetch(expenseApi.listExpenses, []);
  const [actions, setActions] = useState<SimulationAction[]>([]);
  const [actionKind, setActionKind] = useState<ActionKind>("REDUCE_EXPENSE");
  const [expenseId, setExpenseId] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);

  const addAction = (e: FormEvent) => {
    e.preventDefault();
    if (actionKind === "INCREASE_INCOME") {
      setActions([
        ...actions,
        { type: "INCREASE_INCOME", amount: Number(amount) },
      ]);
    } else if (actionKind === "REMOVE_EXPENSE" && expenseId) {
      setActions([...actions, { type: "REMOVE_EXPENSE", expenseId }]);
    } else if (actionKind === "REDUCE_EXPENSE" && expenseId) {
      setActions([
        ...actions,
        { type: "REDUCE_EXPENSE", expenseId, percentage: Number(percentage) },
      ]);
    }
    setResult(null);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
    setResult(null);
  };

  const describeAction = (action: SimulationAction) => {
    const expenseName = expenses?.find(
      (e) => e.id === (action as { expenseId?: string }).expenseId,
    )?.name;
    if (action.type === "REDUCE_EXPENSE")
      return `Riduci "${expenseName ?? action.expenseId}" del ${action.percentage}%`;
    if (action.type === "REMOVE_EXPENSE")
      return `Elimina "${expenseName ?? action.expenseId}"`;
    return `Incremento reddito di ${action.amount} €/mese`;
  };

  const handleRun = async () => {
    if (actions.length === 0) return;
    setRunning(true);
    try {
      setResult(await simulationApi.runSimulation(actions));
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!saveName || actions.length === 0) return;
    setSaving(true);
    try {
      await simulationApi.saveSimulation(saveName, actions);
      setSaveName("");
      setActions([]);
      setResult(null);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>Costruisci uno scenario</h2>
      <form className="form" onSubmit={addAction}>
        <div className="form-row">
          <label className="field">
            <span>Azione</span>
            <select
              value={actionKind}
              onChange={(e) => setActionKind(e.target.value as ActionKind)}
            >
              <option value="REDUCE_EXPENSE">Riduci una spesa</option>
              <option value="REMOVE_EXPENSE">Elimina una spesa</option>
              <option value="INCREASE_INCOME">Incremento del reddito</option>
            </select>
          </label>

          {actionKind !== "INCREASE_INCOME" && (
            <label className="field">
              <span>Spesa</span>
              <select
                value={expenseId}
                onChange={(e) => setExpenseId(e.target.value)}
                required
              >
                <option value="">Seleziona…</option>
                {expenses?.map((expense) => (
                  <option key={expense.id} value={expense.id}>
                    {expense.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {actionKind === "REDUCE_EXPENSE" && (
            <label className="field">
              <span>Riduzione (%)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
            </label>
          )}

          {actionKind === "INCREASE_INCOME" && (
            <label className="field">
              <span>Incremento mensile (€)</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          )}
        </div>

        <button type="submit" className="btn btn--ghost">
          Aggiungi scenario
        </button>
      </form>

      {actions.length > 0 && (
        <div className="list" style={{ marginTop: 12 }}>
          {actions.map((action, i) => (
            <div className="list-item" key={i}>
              <span className="list-item__title">{describeAction(action)}</span>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => removeAction(i)}
              >
                Rimuovi
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="list-item__actions" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleRun}
          disabled={running || actions.length === 0}
        >
          Simula
        </button>
      </div>

      {result && (
        <div className="card-grid" style={{ marginTop: 12 }}>
          <div>
            <span className="kpi-card__label">Risparmio attuale</span>
            <p className="kpi-card__value">
              {currency(result.baseline.monthlySavings)}/mese
            </p>
          </div>
          <div>
            <span className="kpi-card__label">Nuovo risparmio</span>
            <p className="kpi-card__value positive">
              {currency(result.projected.monthlySavings)}/mese
            </p>
          </div>
          <div>
            <span className="kpi-card__label">Differenza</span>
            <p
              className={`kpi-card__value ${result.delta.monthlySavings >= 0 ? "positive" : "negative"}`}
            >
              {result.delta.monthlySavings >= 0 ? "+" : ""}
              {currency(result.delta.monthlySavings)}/mese
            </p>
          </div>
        </div>
      )}

      {result && (
        <form className="form" onSubmit={handleSave} style={{ marginTop: 12 }}>
          <label className="field">
            <span>Nome scenario</span>
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            Salva simulazione
          </button>
        </form>
      )}
    </div>
  );
}
