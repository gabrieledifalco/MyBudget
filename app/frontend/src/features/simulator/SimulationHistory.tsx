import { useState } from "react";

import * as simulationApi from "@/api/simulation.api";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type { SimulationAction } from "@/types/domain";

function describeAction(
  action: SimulationAction & { name?: string; annualImpact: number },
): string {
  if (action.type === "REDUCE_EXPENSE")
    return `Riduci "${action.name ?? action.expenseId}" del ${action.percentage}%`;
  if (action.type === "REMOVE_EXPENSE")
    return `Elimina "${action.name ?? action.expenseId}"`;
  return `Incremento reddito di ${action.amount} €/mese`;
}

export function SimulationHistory({ reloadKey }: { reloadKey: number }) {
  const { format } = useCurrency();
  const [openId, setOpenId] = useState<string | null>(null);
  const {
    data: simulations,
    loading,
    error,
    reload,
  } = useFetch(simulationApi.listSimulations, [reloadKey]);

  const handleDelete = async (id: string) => {
    await simulationApi.deleteSimulation(id);
    if (openId === id) setOpenId(null);
    reload();
  };

  return (
    <div className="card">
      <h2>Simulazioni salvate</h2>
      {loading && <p className="page__hint">Caricamento…</p>}
      {error && <p className="form__error">{error}</p>}
      {simulations && simulations.length === 0 && (
        <p className="empty-state">Nessuna simulazione salvata.</p>
      )}
      <div className="list">
        {simulations?.map((sim) => (
          <div className="list-item-group" key={sim.id}>
            <div className="list-item">
              <div className="list-item__main">
                <span className="list-item__title">{sim.name}</span>
                <span className="list-item__meta">
                  Nuovo risparmio {format(sim.result.projected.monthlySavings)}
                  /mese ({sim.result.delta.monthlySavings >= 0 ? "+" : ""}
                  {format(sim.result.delta.monthlySavings)})
                </span>
              </div>
              <div className="list-item__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setOpenId(openId === sim.id ? null : sim.id)}
                >
                  {openId === sim.id ? "Chiudi" : "Apri"}
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(sim.id)}
                >
                  Elimina
                </button>
              </div>
            </div>

            {openId === sim.id && (
              <div style={{ marginTop: 8 }}>
                <div className="card-grid">
                  <div>
                    <span className="kpi-card__label">Risparmio attuale</span>
                    <p className="kpi-card__value">
                      {format(sim.result.baseline.monthlySavings)}/mese
                    </p>
                  </div>
                  <div>
                    <span className="kpi-card__label">Nuovo risparmio</span>
                    <p className="kpi-card__value positive">
                      {format(sim.result.projected.monthlySavings)}/mese
                    </p>
                  </div>
                  <div>
                    <span className="kpi-card__label">Differenza</span>
                    <p
                      className={`kpi-card__value ${sim.result.delta.monthlySavings >= 0 ? "positive" : "negative"}`}
                    >
                      {sim.result.delta.monthlySavings >= 0 ? "+" : ""}
                      {format(sim.result.delta.monthlySavings)}/mese
                    </p>
                  </div>
                </div>
                <div className="list" style={{ marginTop: 8 }}>
                  {sim.result.actions.map((action, i) => (
                    <div className="list-item" key={i}>
                      <span className="list-item__title">
                        {describeAction(action)}
                      </span>
                      <span className="list-item__meta">
                        Impatto annuo: {format(action.annualImpact)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
