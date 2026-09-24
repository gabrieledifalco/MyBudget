import { prisma } from "../config/prisma.js";
import { httpError } from "../utils/httpError.js";

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function listExpenses(userId) {
  return prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function createExpense(userId, data) {
  return prisma.expense.create({
    data: { ...data, userId },
    include: { category: true },
  });
}

async function findOwnedExpense(userId, id) {
  const expense = await prisma.expense.findFirst({ where: { id, userId } });
  if (!expense) throw httpError(404, "Spesa non trovata");
  return expense;
}

export async function updateExpense(userId, id, data) {
  await findOwnedExpense(userId, id);
  return prisma.expense.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deleteExpense(userId, id) {
  await findOwnedExpense(userId, id);
  await prisma.expense.delete({ where: { id } });
}

export function listLoans(userId) {
  return prisma.loan.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export function createLoan(userId, data) {
  return prisma.loan.create({ data: { ...data, userId } });
}

async function findOwnedLoan(userId, id) {
  const loan = await prisma.loan.findFirst({ where: { id, userId } });
  if (!loan) throw httpError(404, "Finanziamento non trovato");
  return loan;
}

export async function updateLoan(userId, id, data) {
  await findOwnedLoan(userId, id);
  return prisma.loan.update({ where: { id }, data });
}

export async function deleteLoan(userId, id) {
  await findOwnedLoan(userId, id);
  await prisma.loan.delete({ where: { id } });
}
