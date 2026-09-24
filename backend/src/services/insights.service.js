import {
  getUserFinancials,
  computeAnnualIncome,
  computeAnnualExpenses,
  housingYearlyAmount,
} from "./finance.service.js";
import { toYearly, toMonthly } from "../utils/frequency.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export async function getAnalysis(userId) {
  const financials = await getUserFinancials(userId);
  const annualIncome = computeAnnualIncome(financials);
  const annualExpenses = computeAnnualExpenses(financials);
  const savingsRate =
    annualIncome > 0 ? (annualIncome - annualExpenses) / annualIncome : 0;

  const fixedYearly =
    financials.expenses
      .filter((e) => e.kind === "FIXED")
      .reduce((s, e) => s + toYearly(e.amount, e.frequency), 0) +
    housingYearlyAmount(financials.housing);
  const variableYearly = financials.expenses
    .filter((e) => e.kind === "VARIABLE")
    .reduce((s, e) => s + toYearly(e.amount, e.frequency), 0);

  let stability = "CRITICA";
  if (savingsRate >= 0.3) stability = "STABILE";
  else if (savingsRate >= 0.1) stability = "MODERATA";
  else if (savingsRate >= 0) stability = "FRAGILE";

  return {
    annualIncome,
    annualExpenses,
    savingsAmount: annualIncome - annualExpenses,
    savingsRate,
    fixedExpenseIncidence:
      annualExpenses > 0 ? fixedYearly / annualExpenses : 0,
    variableExpenseIncidence:
      annualExpenses > 0 ? variableYearly / annualExpenses : 0,
    stability,
  };
}

export async function getSuggestions(userId) {
  const financials = await getUserFinancials(userId);
  const suggestions = [];

  const superfluous = [...financials.expenses]
    .filter((e) => e.utility <= 2)
    .sort(
      (a, b) =>
        toYearly(b.amount, b.frequency) - toYearly(a.amount, a.frequency),
    );

  for (const e of superfluous) {
    suggestions.push({
      type: "REDUCE_SUPERFLUOUS",
      expenseId: e.id,
      message: `"${e.name}" ha utilità bassa (${e.utility}/5): costa ${toYearly(e.amount, e.frequency).toFixed(0)} €/anno. Valuta di ridurla o eliminarla.`,
    });
  }

  const subscriptions = financials.expenses.filter(
    (e) => e.category?.name === "Abbonamenti" && e.utility <= 3,
  );
  for (const e of subscriptions) {
    suggestions.push({
      type: "REVIEW_SUBSCRIPTION",
      expenseId: e.id,
      message: `Abbonamento "${e.name}" con utilità dichiarata ${e.utility}/5: controlla se lo usi ancora.`,
    });
  }

  const dailyExpenses = financials.expenses.filter(
    (e) => e.frequency === "DAILY",
  );
  for (const e of dailyExpenses) {
    suggestions.push({
      type: "DAILY_IMPACT",
      expenseId: e.id,
      message: `"${e.name}": ${e.amount} €/giorno equivalgono a ${toMonthly(e.amount, "DAILY").toFixed(0)} €/mese e ${toYearly(e.amount, "DAILY").toFixed(0)} €/anno.`,
    });
  }

  return suggestions;
}

export async function getHealthScore(userId) {
  const financials = await getUserFinancials(userId);
  const annualIncome = computeAnnualIncome(financials);
  const annualExpenses = computeAnnualExpenses(financials);

  if (annualIncome <= 0) {
    return { score: 0, label: "Critico", breakdown: [] };
  }

  const savingsRate = (annualIncome - annualExpenses) / annualIncome;
  const savingsScore = clamp(savingsRate, 0, 1) * 35;

  const loansYearly = financials.loans.reduce(
    (s, l) => s + l.monthlyPayment * 12,
    0,
  );
  const debtRatio = loansYearly / annualIncome;
  const debtScore = clamp(1 - debtRatio * 2, 0, 1) * 20;

  const superfluousYearly = financials.expenses
    .filter((e) => e.utility <= 2)
    .reduce((s, e) => s + toYearly(e.amount, e.frequency), 0);
  const superfluousRatio =
    annualExpenses > 0 ? superfluousYearly / annualExpenses : 0;
  const superfluousScore = clamp(1 - superfluousRatio, 0, 1) * 15;

  const incomeSourceCount =
    financials.incomes.length + financials.passiveIncomes.length;
  const stabilityScore = clamp(incomeSourceCount / 2, 0, 1) * 15;

  const fixedYearly =
    financials.expenses
      .filter((e) => e.kind === "FIXED")
      .reduce((s, e) => s + toYearly(e.amount, e.frequency), 0) +
    housingYearlyAmount(financials.housing);
  const fixedRatio = annualExpenses > 0 ? fixedYearly / annualExpenses : 0;
  const fixedScore = clamp(1 - fixedRatio, 0, 1) * 15;

  const score = Math.round(
    savingsScore + debtScore + superfluousScore + stabilityScore + fixedScore,
  );

  let label = "Critico";
  if (score > 85) label = "Eccellente";
  else if (score > 70) label = "Buono";
  else if (score > 50) label = "Sufficiente";
  else if (score > 30) label = "Debole";

  return {
    score,
    label,
    breakdown: [
      {
        key: "savings",
        label: "Rapporto risparmio",
        points: Math.round(savingsScore),
        max: 35,
      },
      {
        key: "debt",
        label: "Debiti e finanziamenti",
        points: Math.round(debtScore),
        max: 20,
      },
      {
        key: "superfluous",
        label: "Spese superflue",
        points: Math.round(superfluousScore),
        max: 15,
      },
      {
        key: "stability",
        label: "Stabilità del reddito",
        points: Math.round(stabilityScore),
        max: 15,
      },
      {
        key: "fixed",
        label: "Incidenza spese fisse",
        points: Math.round(fixedScore),
        max: 15,
      },
    ],
  };
}
