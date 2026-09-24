import {
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import * as dashboardApi from "@/api/dashboard.api";
import * as insightsApi from "@/api/insights.api";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type { FinancialStability, TrendGranularity } from "@/types/domain";

const STABILITY_LABELS: Record<FinancialStability, string> = {
  STABILE: "Stabile",
  MODERATA: "Moderata",
  FRAGILE: "Fragile",
  CRITICA: "Critica",
};

type Period = "daily" | "monthly" | "yearly";

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Oggi",
  monthly: "Questo mese",
  yearly: "Quest'anno",
};

const TREND_LABELS: Record<TrendGranularity, string> = {
  day: "Giorno",
  month: "Mese",
  year: "Anno",
};

function HealthGauge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 71
      ? "var(--income)"
      : score >= 51
        ? "var(--warning)"
        : "var(--expense)";

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)" }}
    >
      <div
        style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}
      >
        <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 800ms cubic-bezier(.4,0,.2,1)",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
            {score}
          </span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Financial Health Score
        </div>
        <div
          className="badge"
          style={{
            marginTop: 8,
            background:
              score >= 71
                ? "var(--income-light)"
                : score >= 51
                  ? "var(--warning-light)"
                  : "var(--expense-light)",
            color:
              score >= 71
                ? "var(--income)"
                : score >= 51
                  ? "var(--warning)"
                  : "var(--expense)",
          }}
        >
          {score >= 86
            ? "Eccellente"
            : score >= 71
              ? "Buono"
              : score >= 51
                ? "Sufficiente"
                : score >= 31
                  ? "Debole"
                  : "Critico"}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { format } = useCurrency();
  const [period, setPeriod] = useState<Period>("monthly");
  const [trendGranularity, setTrendGranularity] =
    useState<TrendGranularity>("month");

  const summary = useFetch(dashboardApi.getSummary, []);
  const trend = useFetch(
    () => dashboardApi.getTrend(trendGranularity),
    [trendGranularity],
  );
  const distribution = useFetch(dashboardApi.getDistribution, []);
  const health = useFetch(insightsApi.getHealthScore, []);
  const analysis = useFetch(insightsApi.getAnalysis, []);
  const suggestions = useFetch(insightsApi.getSuggestions, []);

  const kpi = summary.data?.[period];

  return (
    <div className="page">
      {/* ── Period tabs ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
        }}
      >
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            La tua situazione finanziaria al colpo d'occhio
          </p>
        </div>
        <div className="tabs">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              className={`tab${period === p ? " active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="kpi-grid">
        {/* Entrate */}
        <div className="kpi-card kpi-card--income">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Entrate</span>
            <div className="kpi-card__icon kpi-card__icon--income">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="kpi-card__value kpi-card__value--income">
            {kpi ? format(kpi.income) : "—"}
          </div>
          <div className="kpi-card__sub">{PERIOD_LABELS[period]}</div>
        </div>

        {/* Uscite */}
        <div className="kpi-card kpi-card--expense">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Uscite</span>
            <div className="kpi-card__icon kpi-card__icon--expense">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="kpi-card__value kpi-card__value--expense">
            {kpi ? format(kpi.expenses) : "—"}
          </div>
          <div className="kpi-card__sub">{PERIOD_LABELS[period]}</div>
        </div>

        {/* Risparmio */}
        <div className="kpi-card kpi-card--saving">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Risparmio</span>
            <div className="kpi-card__icon kpi-card__icon--saving">
              <TrendingUp size={16} />
            </div>
          </div>
          <div
            className={`kpi-card__value kpi-card__value--saving ${kpi && kpi.balance >= 0 ? "positive" : "negative"}`}
          >
            {kpi ? format(kpi.balance) : "—"}
          </div>
          <div className="kpi-card__sub">{PERIOD_LABELS[period]}</div>
        </div>

        {/* Health Score */}
        <div className="kpi-card kpi-card--score">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Salute finanziaria</span>
            <div className="kpi-card__icon kpi-card__icon--score">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="kpi-card__value kpi-card__value--score">
            {health.data ? `${health.data.score}/100` : "—"}
          </div>
          <div className="kpi-card__sub">
            {health.data
              ? health.data.score >= 71
                ? "Situazione buona"
                : health.data.score >= 51
                  ? "Margini di miglioramento"
                  : "Attenzione richiesta"
              : "Completa il profilo"}
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="card">
        <div className="chart-controls">
          <h2 className="section-title">
            <TrendingUp size={17} />
            Andamento entrate/uscite
          </h2>
          <div className="tabs">
            {(Object.keys(TREND_LABELS) as TrendGranularity[]).map((g) => (
              <button
                key={g}
                className={`tab${trendGranularity === g ? " active" : ""}`}
                onClick={() => setTrendGranularity(g)}
              >
                {TREND_LABELS[g]}
              </button>
            ))}
          </div>
        </div>
        {trend.data ? (
          <TrendChart data={trend.data} granularity={trendGranularity} />
        ) : (
          <p className="text-muted" style={{ fontSize: 14 }}>
            Aggiungi entrate e uscite per vedere il grafico.
          </p>
        )}
      </div>

      {/* ── Two columns: distribution + health ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space)",
        }}
      >
        {/* Distribuzione */}
        <div className="card">
          <h2
            className="section-title"
            style={{ marginBottom: "var(--space)" }}
          >
            Distribuzione uscite
          </h2>
          {distribution.data && distribution.data.length > 0 ? (
            <DistributionChart data={distribution.data} />
          ) : (
            <div className="empty-state">Nessuna uscita registrata</div>
          )}
        </div>

        {/* Health Score details */}
        <div className="card">
          <h2
            className="section-title"
            style={{ marginBottom: "var(--space-lg)" }}
          >
            <Sparkles size={17} />
            Financial Health Score
          </h2>
          {health.data ? (
            <>
              <HealthGauge
                score={health.data.score}
                label={health.data.label}
              />
              <div className="breakdown-list">
                {health.data.breakdown.map((item) => (
                  <div className="breakdown-item" key={item.key}>
                    <div className="breakdown-item__header">
                      <span className="breakdown-item__label">
                        {item.label}
                      </span>
                      <span className="breakdown-item__points">
                        {item.points}/{item.max}
                      </span>
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
          ) : (
            <div className="empty-state">Dati insufficienti per il calcolo</div>
          )}
        </div>
      </div>

      {/* ── Analysis summary ── */}
      {analysis.data && (
        <div className="card">
          <h2
            className="section-title"
            style={{ marginBottom: "var(--space)" }}
          >
            Analisi rapida
          </h2>
          <div className="card-grid">
            <div>
              <div className="kpi-card__label">Stato finanziario</div>
              <div style={{ marginTop: 6 }}>
                <span
                  className={`badge badge--stability-${analysis.data.stability.toLowerCase()}`}
                >
                  {STABILITY_LABELS[analysis.data.stability]}
                </span>
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Tasso di risparmio</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                {(analysis.data.savingsRate * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Uscite fisse</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                {(analysis.data.fixedExpenseIncidence * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="kpi-card__label">Uscite variabili</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                {(analysis.data.variableExpenseIncidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      {suggestions.data && suggestions.data.length > 0 && (
        <div className="card">
          <h2
            className="section-title"
            style={{ marginBottom: "var(--space)" }}
          >
            <Sparkles size={17} />
            Suggerimenti automatici
          </h2>
          <div className="suggestion-list">
            {suggestions.data.slice(0, 4).map((s, i) => (
              <div className="suggestion" key={i}>
                <div className="suggestion__icon">
                  <Sparkles size={15} />
                </div>
                <p className="suggestion__text">{s.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
