import { prisma } from "../config/prisma.js";
import { toYearly, toMonthly } from "../utils/frequency.js";

/** Carica tutti i dati finanziari di un utente necessari ai calcoli di dashboard/insights/simulatore. */
export async function getUserFinancials(userId) {
  const [
    user,
    incomes,
    passiveIncomes,
    expenses,
    housing,
    loans,
    familyMembers,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.income.findMany({ where: { userId } }),
    prisma.passiveIncome.findMany({ where: { userId } }),
    prisma.expense.findMany({ where: { userId }, include: { category: true } }),
    prisma.housing.findUnique({ where: { userId } }),
    prisma.loan.findMany({ where: { userId } }),
    prisma.familyMember.findMany({ where: { userId } }),
  ]);

  return {
    user,
    incomes,
    passiveIncomes,
    expenses,
    housing,
    loans,
    familyMembers,
  };
}

export function housingYearlyAmount(housing) {
  if (!housing) return 0;
  if (housing.type === "MORTGAGE") return (housing.mortgagePayment ?? 0) * 12;
  if (housing.type === "RENT") return (housing.rentAmount ?? 0) * 12;
  return 0;
}

export function computeAnnualIncome({ incomes, passiveIncomes }) {
  const work = incomes.reduce(
    (sum, i) =>
      sum +
      i.netMonthly * 12 +
      (i.thirteenthSalary ?? 0) +
      (i.fourteenthSalary ?? 0) +
      (i.annualBonus ?? 0),
    0,
  );
  const passive = passiveIncomes.reduce(
    (sum, p) => sum + toYearly(p.amount, p.frequency),
    0,
  );
  return work + passive;
}

export function computeAnnualExpenses({ expenses, housing, loans }) {
  const recurring = expenses.reduce(
    (sum, e) => sum + toYearly(e.amount, e.frequency),
    0,
  );
  const loansTotal = loans.reduce((sum, l) => sum + l.monthlyPayment * 12, 0);
  return recurring + loansTotal + housingYearlyAmount(housing);
}

export function computeKpis(financials) {
  const yearlyIncome = computeAnnualIncome(financials);
  const yearlyExpenses = computeAnnualExpenses(financials);
  const toKpi = (income, expenses) => ({
    income,
    expenses,
    balance: income - expenses,
  });

  return {
    daily: toKpi(yearlyIncome / 365, yearlyExpenses / 365),
    monthly: toKpi(yearlyIncome / 12, yearlyExpenses / 12),
    yearly: toKpi(yearlyIncome, yearlyExpenses),
  };
}

export function computeExpenseDistribution({ expenses, housing, loans }) {
  const totals = new Map();
  const add = (area, amount) =>
    totals.set(area, (totals.get(area) ?? 0) + amount);

  for (const e of expenses) {
    add(e.category?.macroArea ?? "OTHER", toYearly(e.amount, e.frequency));
  }

  const housingAmount = housingYearlyAmount(housing);
  if (housingAmount > 0) add("HOME", housingAmount);

  const loansTotal = loans.reduce((sum, l) => sum + l.monthlyPayment * 12, 0);
  if (loansTotal > 0) add("OTHER", loansTotal);

  return Array.from(totals.entries()).map(([macroArea, amount]) => ({
    macroArea,
    amount,
  }));
}

function isActiveInMonth(startDate, endDate, monthStart, monthEnd) {
  if (startDate && startDate > monthEnd) return false;
  if (endDate && endDate < monthStart) return false;
  return true;
}

/** Andamento mensile ricostruito dalle voci ricorrenti (nessuno storico di transazioni nel modello dati). */
export function computeTrend(financials, months = 6) {
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
    );

    const income =
      financials.incomes.reduce((sum, inc) => sum + inc.netMonthly, 0) +
      financials.passiveIncomes
        .filter((p) => isActiveInMonth(p.startDate, null, monthStart, monthEnd))
        .reduce((sum, p) => sum + toMonthly(p.amount, p.frequency), 0);

    const housingCost =
      financials.housing?.type === "MORTGAGE"
        ? (financials.housing.mortgagePayment ?? 0)
        : financials.housing?.type === "RENT"
          ? (financials.housing.rentAmount ?? 0)
          : 0;

    const expenses =
      financials.expenses
        .filter((e) =>
          isActiveInMonth(e.startDate, e.endDate, monthStart, monthEnd),
        )
        .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0) +
      financials.loans
        .filter((l) =>
          isActiveInMonth(l.startDate, l.endDate, monthStart, monthEnd),
        )
        .reduce((sum, l) => sum + l.monthlyPayment, 0) +
      housingCost;

    result.push({
      month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      income,
      expenses,
      balance: income - expenses,
    });
  }

  return result;
}
