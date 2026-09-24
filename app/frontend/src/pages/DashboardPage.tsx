import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import * as dashboardApi from "@/api/dashboard.api";
import type { DashboardGranularity, PeriodKpi } from "@/api/dashboard.api";
import * as insightsApi from "@/api/insights.api";
import * as profileApi from "@/api/profile.api";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type { DashboardSummary, FinancialStability, TrendGranularity } from "@/types/domain";

const STABILITY_LABELS: Record<FinancialStability, string> = {
  STABILE: "Stabile",
  MODERATA: "Moderata",
  FRAGILE: "Fragile",
  CRITICA: "Critica",
};

const GRAN_LABELS: Record<DashboardGranularity, string> = {
  day: "Giorno",
  month: "Mese",
  year: "Anno",
};

function addPeriod(date: Date, gran: DashboardGranularity, delta: number): Date {
  const d = new Date(date);
  if (gran === "day") d.setDate(d.getDate() + delta);
  else if (gran === "month") d.setMonth(d.getMonth() + delta);
  else d.setFullYear(d.getFullYear() + delta);
  return d;
}

function formatCursor(date: Date, gran: DashboardGranularity): string {
  if (gran === "day") return date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  if (gran === "month") return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return String(date.getFullYear());
}

function isToday(date: Date, gran: DashboardGranularity): boolean {
  const now = new Date();
  if (gran === "day") return date.toDateString() === now.toDateString();
  if (gran === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  return date.getFullYear() === now.getFullYear();
}

function HealthGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 71 ? "var(--income)" : score >= 51 ? "var(--warning)" : "var(--expense)";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)" }}>
      <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
        <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Financial Health Score</div>
        <div
          className="badge"
          style={{
            marginTop: 8,
            background: score >= 71 ? "var(--income-light)" : score >= 51 ? "var(--warning-light)" : "var(--expense-light)",
            color: score >= 71 ? "var(--income)" : score >= 51 ? "var(--warning)" : "var(--expense)",
          }}
        >
          {score >= 86 ? "Eccellente" : score >= 71 ? "Buono" : score >= 51 ? "Sufficiente" : score >= 31 ? "Debole" : "Critico"}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { format } = useCurrency();

  // ── Period navigation ──
  const [granularity, setGranularity] = useState<DashboardGranularity>("month");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [memberId, setMemberId] = useState<string>("");

  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>("month");

  const navigate = (delta: -1 | 1) => setCursor((d) => addPeriod(d, granularity, delta));
  const goToToday = () => setCursor(new Date());
  const atToday = isToday(cursor, granularity);

  const refDate = cursor.toISOString();
  const dashParams = useMemo(
    () => ({ granularity, refDate, memberId: memberId || undefined }),
    [granularity, refDate, memberId],
  );

  // ── Data fetching ──
  const summary = useFetch(() => dashboardApi.getSummary(dashParams), [dashParams]);
  const trend = useFetch(
    () => dashboardApi.getTrend(trendGranularity, undefined, dashParams),
    [trendGranularity, dashParams],
  );
  const distribution = useFetch(() => dashboardApi.getDistribution(dashParams), [dashParams]);
  const health = useFetch(insightsApi.getHealthScore, []);
  const analysis = useFetch(insightsApi.getAnalysis, []);
  const suggestions = useFetch(insightsApi.getSuggestions, []);
  const { data: familyMembers } = useFetch(profileApi.listFamilyMembers, []);

  // The summary may be PeriodKpi (with granularity) or DashboardSummary (legacy)
  const kpi = summary.data as PeriodKpi | undefined;
  const legacySummary = summary.data as DashboardSummary | undefined;
  const isPeriodKpi = kpi && "granularity" in kpi;

  const displayKpi = isPeriodKpi ? kpi : (legacySummary?.[granularity === "day" ? "daily" : granularity === "year" ? "yearly" : "monthly"]);

  const TREND_LABELS: Record<TrendGranularity, string> = { day: "Giorno", month: "Mese", year: "Anno" };

  return (
    <div className="page">
      {/* ── Header + controls ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-sm)", marginBottom: "var(--space)" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">La tua situazione finanziaria al colpo d'occhio</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", alignItems: "flex-end" }}>
          {/* Granularity selector */}
          <div className="tabs">
            {(Object.keys(GRAN_LABELS) as DashboardGranularity[]).map((g) => (
              <button
                key={g}
                className={`tab${granularity === g ? " active" : ""}`}
                onClick={() => { setGranularity(g); setCursor(new Date()); }}
              >
                {GRAN_LABELS[g]}
              </button>
            ))}
          </div>

          {/* Time navigator */}
          <div className="time-navigator">
            <button type="button" className="time-navigator__btn" onClick={() => navigate(-1)} title="Precedente">
              <ChevronLeft size={16} />
            </button>
            <span className="time-navigator__label">{formatCursor(cursor, granularity)}</span>
            <button
              type="button"
              className="time-navigator__btn"
              onClick={() => navigate(1)}
              disabled={atToday}
              title="Successivo"
            >
              <ChevronRight size={16} />
            </button>
            {!atToday && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={goToToday} style={{ marginLeft: 4 }}>
                Oggi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Family member filter ── */}
      {familyMembers && familyMembers.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space)" }}>
          <Users size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Visualizza per:</span>
          <div className="tabs">
            <button
              className={`tab${!memberId ? " active" : ""}`}
              onClick={() => setMemberId("")}
            >
              Tutti
            </button>
            {familyMembers.map((m) => (
              <button
                key={m.id}
                className={`tab${memberId === m.id ? " active" : ""}`}
                onClick={() => setMemberId(m.id)}
              >
                {m.firstName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI row ── */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card--income">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Entrate</span>
            <div className="kpi-card__icon kpi-card__icon--income"><ArrowUpRight size={16} /></div>
          </div>
          <div className="kpi-card__value kpi-card__value--income">
            {displayKpi ? format(displayKpi.income) : "—"}
          </div>
          <div className="kpi-card__sub">{formatCursor(cursor, granularity)}</div>
        </div>

        <div className="kpi-card kpi-card--expense">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Uscite</span>
            <div className="kpi-card__icon kpi-card__icon--expense"><ArrowDownRight size={16} /></div>
          </div>
          <div className="kpi-card__value kpi-card__value--expense">
            {displayKpi ? format(displayKpi.expenses) : "—"}
          </div>
          <div className="kpi-card__sub">{formatCursor(cursor, granularity)}</div>
        </div>

        <div className="kpi-card kpi-card--saving">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Risparmio</span>
            <div className="kpi-card__icon kpi-card__icon--saving"><TrendingUp size={16} /></div>
          </div>
          <div className={`kpi-card__value kpi-card__value--saving${displayKpi && displayKpi.balance >= 0 ? " positive" : " negative"}`}>
            {displayKpi ? format(displayKpi.balance) : "—"}
          </div>
          <div className="kpi-card__sub">{formatCursor(cursor, granularity)}</div>
        </div>

        <div className="kpi-card kpi-card--score">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Salute finanziaria</span>
            <div className="kpi-card__icon kpi-card__icon--score"><Sparkles size={16} /></div>
          </div>
          <div className="kpi-card__value kpi-card__value--score">
            {health.data ? `${health.data.score}/100` : "—"}
          </div>
          <div className="kpi-card__sub">
            {health.data
              ? health.data.score >= 71 ? "Situazione buona"
                : health.data.score >= 51 ? "Margini di miglioramento"
                : "Attenzione richiesta"
              : "Completa il profilo"}
          </div>
        </div>
      </div>

      {/* ── Trend chart ── */}
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
        {trend.data && trend.data.length > 0 ? (
          <TrendChart data={trend.data} granularity={trendGranularity} />
        ) : (
          <p className="text-muted" style={{ fontSize: 14 }}>
            Aggiungi entrate e uscite per vedere il grafico.
          </p>
        )}
      </div>

      {/* ── Distribution + Health ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space)" }}>
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: "var(--space)" }}>
            Distribuzione uscite
            {memberId && familyMembers && (
              <span className="filter-badge" style={{ marginLeft: 8 }}>
                {familyMembers.find((m) => m.id === memberId)?.firstName}
              </span>
            )}
          </h2>
          {distribution.data && distribution.data.length > 0 ? (
            <DistributionChart data={distribution.data} />
          ) : (
            <div className="empty-state">Nessuna uscita nel periodo</div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginBottom: "var(--space-lg)" }}>
            <Sparkles size={17} />
            Financial Health Score
          </h2>
          {health.data ? (
            <>
              <HealthGauge score={health.data.score} label={health.data.label} />
              <div className="breakdown-list">
                {health.data.breakdown.map((item) => (
                  <div className="breakdown-item" key={item.key}>
                    <div className="breakdown-item__header">
                      <span className="breakdown-item__label">{item.label}</span>
                      <span className="breakdown-item__points">{item.points}/{item.max}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar__fill" style={{ width: `${(item.points / item.max) * 100}%` }} />
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

      {/* ── Analysis ── */}
      {analysis.data && (
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: "var(--space)" }}>Analisi rapida</h2>
          <div className="card-grid">
            <div>
              <div className="kpi-card__label">Stato finanziario</div>
              <div style={{ marginTop: 6 }}>
                <span className={`badge badge--stability-${analysis.data.stability.toLowerCase()}`}>
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
          <h2 className="section-title" style={{ marginBottom: "var(--space)" }}>
            <Sparkles size={17} />
            Suggerimenti automatici
          </h2>
          <div className="suggestion-list">
            {suggestions.data.slice(0, 4).map((s, i) => (
              <div className="suggestion" key={i}>
                <div className="suggestion__icon"><Sparkles size={15} /></div>
                <p className="suggestion__text">{s.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
