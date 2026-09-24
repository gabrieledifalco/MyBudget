import * as simulationApi from "@/api/simulation.api";
import { useFetch } from "@/hooks/useFetch";

const currency = (value: number) => `${value.toFixed(0)} €`;

export function SimulationHistory({ reloadKey }: { reloadKey: number }) {
  const {
    data: simulations,
    loading,
    error,
    reload,
  } = useFetch(simulationApi.listSimulations, [reloadKey]);

  const handleDelete = async (id: string) => {
    await simulationApi.deleteSimulation(id);
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
          <div className="list-item" key={sim.id}>
            <div className="list-item__main">
              <span className="list-item__title">{sim.name}</span>
              <span className="list-item__meta">
                Nuovo risparmio {currency(sim.result.projected.monthlySavings)}
                /mese ({sim.result.delta.monthlySavings >= 0 ? "+" : ""}
                {currency(sim.result.delta.monthlySavings)})
              </span>
            </div>
            <div className="list-item__actions">
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => handleDelete(sim.id)}
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
