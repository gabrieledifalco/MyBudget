import { prisma } from "../config/prisma.js";
import { httpError } from "../utils/httpError.js";

export function listIncomes(userId) {
  return prisma.income.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function createIncome(userId, data) {
  return prisma.income.create({ data: { ...data, userId } });
}

async function findOwnedIncome(userId, id) {
  const income = await prisma.income.findFirst({ where: { id, userId } });
  if (!income) throw httpError(404, "Reddito non trovato");
  return income;
}

export async function updateIncome(userId, id, data) {
  await findOwnedIncome(userId, id);
  return prisma.income.update({ where: { id }, data });
}

export async function deleteIncome(userId, id) {
  await findOwnedIncome(userId, id);
  await prisma.income.delete({ where: { id } });
}
