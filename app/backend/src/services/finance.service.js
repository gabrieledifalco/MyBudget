import { prisma } from "../config/prisma.js";
import { toYearly, toMonthly, toDaily } from "../utils/frequency.js";

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

function isDateInCurrentYear(date, now = new Date()) {
  return date && date.getFullYear() === now.getFullYear();
}

/** Separa le uscite ricorrenti (proiettabili via frequency) da quelle singole (imputate su una sola `date`). */
function splitRecurring(expenses) {
  const recurring = expenses.filter((e) => e.isRecurring !== false);
  const oneOff = expenses.filter((e) => e.isRecurring === false);
  return { recurring, oneOff };
}

export function computeAnnualIncome({ incomes, passiveIncomes }) {
  const work = incomes.reduce(
    (sum, i) =>
      sum +
      i.netMonthly * (i.monthlyPaymentsCount ?? 12) +
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
  const { recurring, oneOff } = splitRecurring(expenses);
  const recurringTotal = recurring.reduce(
    (sum, e) => sum + toYearly(e.amount, e.frequency),
    0,
  );
  // Le uscite singole contano per l'anno solare in cui sono state imputate.
  const oneOffTotal = oneOff
    .filter((e) => isDateInCurrentYear(e.date))
    .reduce((sum, e) => sum + e.amount, 0);
  const loansTotal = loans.reduce((sum, l) => sum + l.monthlyPayment * 12, 0);
  return (
    recurringTotal + oneOffTotal + loansTotal + housingYearlyAmount(housing)
  );
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

/**
 * KPI per un singolo periodo navigabile (giorno/mese/anno specifico).
 * Applica la stessa logica di computeTrend ma per un solo periodo.
 */
export function computePeriodKpis(financials, { granularity = "month", refDate = new Date(), memberId } = {}) {
  const unit = ["day", "month", "year"].includes(granularity) ? granularity : "month";
  const { start, end } = getPeriodRange(refDate, unit, 0);
  const convert = { day: toDaily, month: toMonthly, year: toYearly }[unit];

  // Filter by memberId if provided
  const expenses = memberId
    ? financials.expenses.filter((e) => e.memberId === memberId)
    : financials.expenses;

  const income =
    financials.incomes.reduce(
      (sum, inc) => sum + monthlyToUnit(inc.netMonthly, unit, start),
      0,
    ) +
    financials.passiveIncomes
      .filter((p) => isActiveInRange(p.startDate, null, start, end))
      .reduce((sum, p) => sum + convert(p.amount, p.frequency), 0);

  const housingCost =
    financials.housing?.type === "MORTGAGE"
      ? monthlyToUnit(financials.housing.mortgagePayment ?? 0, unit, start)
      : financials.housing?.type === "RENT"
        ? monthlyToUnit(financials.housing.rentAmount ?? 0, unit, start)
        : 0;

  const { recurring, oneOff } = splitRecurring(expenses);
  const expensesTotal =
    recurring
      .filter((e) => isActiveInRange(e.startDate, e.endDate, start, end))
      .reduce((sum, e) => sum + convert(e.amount, e.frequency), 0) +
    oneOff
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((sum, e) => sum + e.amount, 0) +
    financials.loans
      .filter((l) => isActiveInRange(l.startDate, l.endDate, start, end))
      .reduce((sum, l) => sum + monthlyToUnit(l.monthlyPayment, unit, start), 0) +
    housingCost;

  return {
    income,
    expenses: expensesTotal,
    balance: income - expensesTotal,
    period: formatPeriodLabel(start, unit),
    granularity: unit,
  };
}

export function computeExpenseDistribution({ expenses, housing, loans }, { granularity = "year", refDate = new Date(), memberId } = {}) {
  const unit = ["day", "month", "year"].includes(granularity) ? granularity : "year";
  const { start, end } = getPeriodRange(refDate, unit, 0);
  const convert = { day: toDaily, month: toMonthly, year: toYearly }[unit];

  const filtered = memberId ? expenses.filter((e) => e.memberId === memberId) : expenses;
  const { recurring, oneOff } = splitRecurring(filtered);

  const totals = new Map();
  const add = (area, amount) => totals.set(area, (totals.get(area) ?? 0) + amount);

  for (const e of recurring.filter((e) => isActiveInRange(e.startDate, e.endDate, start, end))) {
    add(e.category?.macroArea ?? "OTHER", convert(e.amount, e.frequency));
  }
  for (const e of oneOff.filter((e) => e.date >= start && e.date <= end)) {
    add(e.category?.macroArea ?? "OTHER", e.amount);
  }

  // Housing e loans solo se granularity != day
  if (unit !== "day") {
    const housingAmount = convert(
      financials_housing_monthly(housing),
      "MONTHLY",
    );
    if (housingAmount > 0) add("HOME", housingAmount);

    const loansTotal = loans
      .filter((l) => isActiveInRange(l.startDate, l.endDate, start, end))
      .reduce((sum, l) => sum + convert(l.monthlyPayment, "MONTHLY"), 0);
    if (loansTotal > 0) add("OTHER", loansTotal);
  }

  return Array.from(totals.entries()).map(([macroArea, amount]) => ({
    macroArea,
    amount,
  }));
}

function financials_housing_monthly(housing) {
  if (!housing) return 0;
  if (housing.type === "MORTGAGE") return housing.mortgagePayment ?? 0;
  if (housing.type === "RENT") return housing.rentAmount ?? 0;
  return 0;
}

function isActiveInRange(startDate, endDate, rangeStart, rangeEnd) {
  if (startDate && startDate > rangeEnd) return false;
  if (endDate && endDate < rangeStart) return false;
  return true;
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Converte un importo mensile "piatto" (senza frequency propria, es. netMonthly) nell'unit\u00e0 richiesta. */
function monthlyToUnit(value, unit, referenceDate) {
  if (unit === "day") return value / daysInMonth(referenceDate);
  if (unit === "year") return value * 12;
  return value;
}

function getPeriodRange(now, unit, offset) {
  if (unit === "day") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - offset,
    );
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      23,
      59,
      59,
    );
    return { start, end };
  }
  if (unit === "year") {
    const start = new Date(now.getFullYear() - offset, 0, 1);
    const end = new Date(now.getFullYear() - offset, 11, 31, 23, 59, 59);
    return { start, end };
  }
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() - offset + 1,
    0,
    23,
    59,
    59,
  );
  return { start, end };
}

function formatPeriodLabel(start, unit) {
  if (unit === "day") {
    return `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}`;
  }
  if (unit === "year") return String(start.getFullYear());
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

const PERIOD_DEFAULTS = { day: 30, month: 6, year: 3 };

/** Andamento ricostruito dalle voci ricorrenti (nessuno storico di transazioni nel modello dati). */
export function computeTrend(
  financials,
  { granularity = "month", periods, refDate, memberId } = {},
) {
  const unit = ["day", "month", "year"].includes(granularity)
    ? granularity
    : "month";
  const count = periods ?? PERIOD_DEFAULTS[unit];
  const convert = { day: toDaily, month: toMonthly, year: toYearly }[unit];
  const now = refDate ? new Date(refDate) : new Date();
  const result = [];

  // Filter by memberId if provided (only for expenses)
  const filteredExpenses = memberId
    ? financials.expenses.filter((e) => e.memberId === memberId)
    : financials.expenses;

  for (let i = count - 1; i >= 0; i -= 1) {
    const { start, end } = getPeriodRange(now, unit, i);

    const income =
      financials.incomes.reduce(
        (sum, inc) => sum + monthlyToUnit(inc.netMonthly, unit, start),
        0,
      ) +
      financials.passiveIncomes
        .filter((p) => isActiveInRange(p.startDate, null, start, end))
        .reduce((sum, p) => sum + convert(p.amount, p.frequency), 0);

    const housingCost =
      financials.housing?.type === "MORTGAGE"
        ? monthlyToUnit(financials.housing.mortgagePayment ?? 0, unit, start)
        : financials.housing?.type === "RENT"
          ? monthlyToUnit(financials.housing.rentAmount ?? 0, unit, start)
          : 0;

    const { recurring, oneOff } = splitRecurring(filteredExpenses);
    const expenses =
      recurring
        .filter((e) => isActiveInRange(e.startDate, e.endDate, start, end))
        .reduce((sum, e) => sum + convert(e.amount, e.frequency), 0) +
      oneOff
        .filter((e) => e.date >= start && e.date <= end)
        .reduce((sum, e) => sum + e.amount, 0) +
      financials.loans
        .filter((l) => isActiveInRange(l.startDate, l.endDate, start, end))
        .reduce(
          (sum, l) => sum + monthlyToUnit(l.monthlyPayment, unit, start),
          0,
        ) +
      housingCost;

    result.push({
      period: formatPeriodLabel(start, unit),
      income,
      expenses,
      balance: income - expenses,
    });
  }

  return result;
}
