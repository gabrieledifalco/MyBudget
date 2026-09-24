import { IncomeManager } from "@/features/income/IncomeManager";

export function IncomePage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Entrate</h1>
          <p className="page-subtitle">Gestisci stipendi, redditi e tutte le fonti di entrata</p>
        </div>
      </div>
      <IncomeManager />
    </div>
  );
}
