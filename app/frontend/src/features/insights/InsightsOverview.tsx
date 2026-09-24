import { AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

import * as insightsApi from "@/api/insights.api";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type { FinancialStability } from "@/types/domain";

const STABILITY_LABELS: Record<FinancialStability, string> = {
  STABILE: "Stabile",
  MODERATA: "Moderata",
  FRAGILE: "Fragile",
  CRITICA: "Critica",
};

const percent = (v: number) => `${(v * 100).toFixed(0)}%`;

export function InsightsOverview() {
  const { format } = useCurrency();
  const analysis   = useFetch(insightsApi.getAnalysis, []);
  const health     = useFetch(insightsApi.getHealthScore, []);
  const suggestions = useFetch(insightsApi.getSuggestions, []);

  return (
    <div className="page">
      {/* ── Analisi ── */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">
            <TrendingUp size={17} />
            Analisi finanziaria
          </h2>
        </div>

        {analysis.error && <p className="form__error">{analysis.error}</p>}

        {analysis.data && (
          <div className="card-grid">
            <div>
              <div className="kpi-card__label">Stato</div>
              <div style={{ marginTop: 6 }}>
                <span className={`badge badge--stability-${analysis.data.stability.toLowerCase()}`}>
                  {STABILITY_LABELS[analysis.data.stability]}
                </span>
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Tasso di risparmio</div>
              <div className="kpi-card__value" style={{ marginTop: 4, fontSize: 22 }}>
                {percent(analysis.data.savingsRate)}
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Risparmio annuo</div>
              <div className="kpi-card__value" style={{ marginTop: 4, fontSize: 22 }}>
                {format(analysis.data.savingsAmount)}
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Incidenza uscite fisse</div>
              <div className="kpi-card__value" style={{ marginTop: 4, fontSize: 22 }}>
                {percent(analysis.data.fixedExpenseIncidence)}
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Incidenza uscite variabili</div>
              <div className="kpi-card__value" style={{ marginTop: 4, fontSize: 22 }}>
                {percent(analysis.data.variableExpenseIncidence)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Health Score ── */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">
            <Sparkles size={17} />
            Financial Health Score
          </h2>
        </div>

        {health.error && <p className="form__error">{health.error}</p>}

        {health.data && (
          <>
            <div className="health-score">
              <div className="health-score__number"
                style={{
                  color: health.data.score >= 71 ? "var(--income)" : health.data.score >= 51 ? "var(--warning)" : "var(--expense)",
                }}
              >
                {health.data.score}
              </div>
              <div>
                <div className="health-score__label">{health.data.label}</div>
                <div className="health-score__sub">su 100 punti</div>
                <span
                  className="badge mt-sm"
                  style={{
                    display: "inline-flex",
                    marginTop: 8,
                    background: health.data.score >= 71 ? "var(--income-light)" : health.data.score >= 51 ? "var(--warning-light)" : "var(--expense-light)",
                    color: health.data.score >= 71 ? "var(--income)" : health.data.score >= 51 ? "var(--warning)" : "var(--expense)",
                  }}
                >
                  {health.data.score >= 86 ? "Eccellente" : health.data.score >= 71 ? "Buono" : health.data.score >= 51 ? "Sufficiente" : health.data.score >= 31 ? "Debole" : "Critico"}
                </span>
              </div>
            </div>

            <div className="breakdown-list">
              {health.data.breakdown.map((item) => (
                <div className="breakdown-item" key={item.key}>
                  <div className="breakdown-item__header">
                    <span className="breakdown-item__label">{item.label}</span>
                    <span className="breakdown-item__points">{item.points} / {item.max}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{ width: `${(item.points / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Suggerimenti ── */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">
            <AlertTriangle size={17} />
            Suggerimenti automatici
          </h2>
        </div>

        {suggestions.error && <p className="form__error">{suggestions.error}</p>}

        {suggestions.data?.length === 0 && (
          <div className="empty-state">
            <Sparkles size={32} />
            <p>Nessun suggerimento al momento.<br />La situazione è sotto controllo!</p>
          </div>
        )}

        {suggestions.data && suggestions.data.length > 0 && (
          <div className="suggestion-list">
            {suggestions.data.map((s, i) => (
              <div className="suggestion" key={i}>
                <div className="suggestion__icon">
                  <AlertTriangle size={15} />
                </div>
                <p className="suggestion__text">{s.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
