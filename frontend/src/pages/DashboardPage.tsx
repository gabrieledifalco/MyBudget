import * as dashboardApi from "@/api/dashboard.api";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { useCurrency } from "@/features/settings/CurrencyContext";
import { useFetch } from "@/hooks/useFetch";
import type { Kpi } from "@/types/domain";

function KpiCard({ label, kpi }: { label: string; kpi: Kpi }) {
  const { format } = useCurrency();
  return (
    <div className="card">
      <span className="kpi-card__label">{label}</span>
      <div className="card-grid">
        <div>
          <span className="kpi-card__label">Entrate</span>
          <p className="kpi-card__value positive">{format(kpi.income)}</p>
        </div>
        <div>
          <span className="kpi-card__label">Uscite</span>
          <p className="kpi-card__value negative">{format(kpi.expenses)}</p>
        </div>
        <div>
          <span className="kpi-card__label">Saldo</span>
          <p
            className={`kpi-card__value ${kpi.balance >= 0 ? "positive" : "negative"}`}
          >
            {format(kpi.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const summary = useFetch(dashboardApi.getSummary, []);
  const trend = useFetch(() => dashboardApi.getTrend(6), []);
  const distribution = useFetch(dashboardApi.getDistribution, []);

  return (
    <section className="page">
      <h1>Dashboard</h1>

      {summary.error && <p className="form__error">{summary.error}</p>}
      {summary.data && (
        <div className="card-grid">
          <KpiCard label="Giornaliero" kpi={summary.data.daily} />
          <KpiCard label="Mensile" kpi={summary.data.monthly} />
          <KpiCard label="Annuale" kpi={summary.data.yearly} />
        </div>
      )}

      <div className="card">
        <h2>Andamento entrate/uscite (ultimi 6 mesi)</h2>
        {trend.data && <TrendChart data={trend.data} />}
      </div>

      <div className="card">
        <h2>Distribuzione uscite per categoria</h2>
        {distribution.data && <DistributionChart data={distribution.data} />}
      </div>
    </section>
  );
}
