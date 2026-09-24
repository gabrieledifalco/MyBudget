import { prisma } from "../config/prisma.js";
import { httpError } from "../utils/httpError.js";

export function listIncomes(userId) {
  return prisma.income.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

function snapshotHistory(income) {
  return prisma.incomeHistory.create({
    data: {
      incomeId: income.id,
      netMonthly: income.netMonthly,
      grossAnnual: income.grossAnnual,
      monthlyPaymentsCount: income.monthlyPaymentsCount,
      thirteenthSalary: income.thirteenthSalary,
      fourteenthSalary: income.fourteenthSalary,
      annualBonus: income.annualBonus,
    },
  });
}

export async function createIncome(userId, data) {
  const income = await prisma.income.create({ data: { ...data, userId } });
  await snapshotHistory(income);
  return income;
}

async function findOwnedIncome(userId, id) {
  const income = await prisma.income.findFirst({ where: { id, userId } });
  if (!income) throw httpError(404, "Reddito non trovato");
  return income;
}

export async function updateIncome(userId, id, data) {
  await findOwnedIncome(userId, id);
  const income = await prisma.income.update({ where: { id }, data });
  // Storicizza la variazione (README: "tutte le variazioni devono essere storicizzate").
  await snapshotHistory(income);
  return income;
}

export async function deleteIncome(userId, id) {
  await findOwnedIncome(userId, id);
  await prisma.income.delete({ where: { id } });
}

export async function getIncomeHistory(userId, id) {
  await findOwnedIncome(userId, id);
  return prisma.incomeHistory.findMany({
    where: { incomeId: id },
    orderBy: { recordedAt: "desc" },
  });
}
