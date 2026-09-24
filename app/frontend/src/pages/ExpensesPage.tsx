import { ExpenseManager } from "@/features/expenses/ExpenseManager";
import { LoanManager } from "@/features/expenses/LoanManager";

export function ExpensesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Uscite</h1>
          <p className="page-subtitle">Gestisci tutte le tue spese fisse, variabili e finanziamenti</p>
        </div>
      </div>
      <ExpenseManager />
      <LoanManager />
    </div>
  );
}
