import { InsightsOverview } from "@/features/insights/InsightsOverview";

export function InsightsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analisi finanziaria</h1>
          <p className="page-subtitle">Overview intelligente della tua situazione economica</p>
        </div>
      </div>
      <InsightsOverview />
    </div>
  );
}
