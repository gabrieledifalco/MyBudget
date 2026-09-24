import * as insightsApi from "@/api/insights.api";
import { useFetch } from "@/hooks/useFetch";
import type { FinancialStability } from "@/types/domain";

const STABILITY_LABELS: Record<FinancialStability, string> = {
  STABILE: "Stabile",
  MODERATA: "Moderata",
  FRAGILE: "Fragile",
  CRITICA: "Critica",
};

const percent = (value: number) => `${(value * 100).toFixed(0)}%`;
const currency = (value: number) => `${value.toFixed(0)} €`;

export function InsightsOverview() {
  const analysis = useFetch(insightsApi.getAnalysis, []);
  const health = useFetch(insightsApi.getHealthScore, []);
  const suggestions = useFetch(insightsApi.getSuggestions, []);

  return (
    <>
      <div className="card">
        <h2>Analisi finanziaria</h2>
        {analysis.error && <p className="form__error">{analysis.error}</p>}
        {analysis.data && (
          <div className="card-grid">
            <div>
              <span className="kpi-card__label">Stato</span>
              <p>
                <span
                  className={`badge badge--stability-${analysis.data.stability.toLowerCase()}`}
                >
                  {STABILITY_LABELS[analysis.data.stability]}
                </span>
              </p>
            </div>
            <div>
              <span className="kpi-card__label">Percentuale di risparmio</span>
              <p className="kpi-card__value">
                {percent(analysis.data.savingsRate)}
              </p>
            </div>
            <div>
              <span className="kpi-card__label">Risparmio annuo</span>
              <p className="kpi-card__value">
                {currency(analysis.data.savingsAmount)}
              </p>
            </div>
            <div>
              <span className="kpi-card__label">Incidenza spese fisse</span>
              <p className="kpi-card__value">
                {percent(analysis.data.fixedExpenseIncidence)}
              </p>
            </div>
            <div>
              <span className="kpi-card__label">Incidenza spese variabili</span>
              <p className="kpi-card__value">
                {percent(analysis.data.variableExpenseIncidence)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Financial Health Score</h2>
        {health.error && <p className="form__error">{health.error}</p>}
        {health.data && (
          <>
            <div className="score-ring">
              <span className="score-ring__value">{health.data.score}</span>
              <span
                className={`badge badge--stability-${health.data.label.toLowerCase()}`}
              >
                {health.data.label}
              </span>
            </div>
            <div className="list" style={{ marginTop: 12 }}>
              {health.data.breakdown.map((item) => (
                <div className="list-item" key={item.key}>
                  <span className="list-item__title">{item.label}</span>
                  <span className="list-item__meta">
                    {item.points} / {item.max} punti
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>Suggerimenti automatici</h2>
        {suggestions.error && (
          <p className="form__error">{suggestions.error}</p>
        )}
        {suggestions.data && suggestions.data.length === 0 && (
          <p className="empty-state">
            Nessun suggerimento al momento: la situazione è sotto controllo.
          </p>
        )}
        {suggestions.data?.map((s, i) => (
          <p className="suggestion" key={`${s.expenseId}-${i}`}>
            {s.message}
          </p>
        ))}
      </div>
    </>
  );
}
