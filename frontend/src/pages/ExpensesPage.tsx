import { ExpenseManager } from "@/features/expenses/ExpenseManager";
import { LoanManager } from "@/features/expenses/LoanManager";

export function ExpensesPage() {
  return (
    <section className="page">
      <h1>Uscite</h1>
      <ExpenseManager />
      <LoanManager />
    </section>
  );
}
