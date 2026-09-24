import { prisma } from "../config/prisma.js";
import { httpError } from "../utils/httpError.js";
import {
  getUserFinancials,
  computeAnnualIncome,
  computeAnnualExpenses,
} from "./finance.service.js";
import { toYearly } from "../utils/frequency.js";

export async function runSimulation(userId, { actions }) {
  const financials = await getUserFinancials(userId);
  const baselineIncome = computeAnnualIncome(financials);
  const baselineExpenses = computeAnnualExpenses(financials);

  let projectedIncome = baselineIncome;
  let projectedExpenses = baselineExpenses;
  const applied = [];

  for (const action of actions) {
    if (action.type === "REDUCE_EXPENSE" || action.type === "REMOVE_EXPENSE") {
      const expense = financials.expenses.find(
        (e) => e.id === action.expenseId,
      );
      if (!expense)
        throw httpError(404, `Uscita ${action.expenseId} non trovata`);

      const yearly = toYearly(expense.amount, expense.frequency);
      const reduction =
        action.type === "REMOVE_EXPENSE"
          ? yearly
          : yearly * (action.percentage / 100);
      projectedExpenses -= reduction;
      applied.push({ ...action, name: expense.name, annualImpact: reduction });
    }

    if (action.type === "INCREASE_INCOME") {
      const annualImpact = action.amount * 12;
      projectedIncome += annualImpact;
      applied.push({ ...action, annualImpact });
    }
  }

  const currentMonthlySavings = (baselineIncome - baselineExpenses) / 12;
  const projectedMonthlySavings = (projectedIncome - projectedExpenses) / 12;

  return {
    baseline: {
      annualIncome: baselineIncome,
      annualExpenses: baselineExpenses,
      monthlySavings: currentMonthlySavings,
    },
    projected: {
      annualIncome: projectedIncome,
      annualExpenses: projectedExpenses,
      monthlySavings: projectedMonthlySavings,
    },
    delta: { monthlySavings: projectedMonthlySavings - currentMonthlySavings },
    actions: applied,
  };
}

function serializeSimulation(simulation) {
  return {
    id: simulation.id,
    name: simulation.name,
    createdAt: simulation.createdAt,
    actions: JSON.parse(simulation.payload),
    result: JSON.parse(simulation.result),
  };
}

export async function saveSimulation(userId, { name, actions }) {
  const result = await runSimulation(userId, { actions });
  const simulation = await prisma.simulation.create({
    data: {
      userId,
      name,
      payload: JSON.stringify(actions),
      result: JSON.stringify(result),
    },
  });
  return serializeSimulation(simulation);
}

export async function listSimulations(userId) {
  const simulations = await prisma.simulation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return simulations.map(serializeSimulation);
}

export async function getSimulation(userId, id) {
  const simulation = await prisma.simulation.findFirst({
    where: { id, userId },
  });
  if (!simulation) throw httpError(404, "Simulazione non trovata");
  return serializeSimulation(simulation);
}

export async function deleteSimulation(userId, id) {
  const simulation = await prisma.simulation.findFirst({
    where: { id, userId },
  });
  if (!simulation) throw httpError(404, "Simulazione non trovata");
  await prisma.simulation.delete({ where: { id } });
}
