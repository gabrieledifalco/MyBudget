import { prisma } from "../config/prisma.js";
import { httpError } from "../utils/httpError.js";

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function listExpenses(userId, filters = {}) {
  const where = { userId };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.memberId) where.memberId = filters.memberId;
  if (filters.utility) where.utility = filters.utility;
  if (filters.minAmount != null || filters.maxAmount != null) {
    where.amount = {};
    if (filters.minAmount != null) where.amount.gte = filters.minAmount;
    if (filters.maxAmount != null) where.amount.lte = filters.maxAmount;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.date = {};
    if (filters.dateFrom) where.date.gte = filters.dateFrom;
    if (filters.dateTo) where.date.lte = filters.dateTo;
  }

  return prisma.expense.findMany({
    where,
    include: { category: true, member: true },
    orderBy: { date: "desc" },
  });
}

export function createExpense(userId, data) {
  return prisma.expense.create({
    data: { ...data, userId },
    include: { category: true, member: true },
  });
}

async function findOwnedExpense(userId, id) {
  const expense = await prisma.expense.findFirst({ where: { id, userId } });
  if (!expense) throw httpError(404, "Uscita non trovata");
  return expense;
}

export async function updateExpense(userId, id, data) {
  await findOwnedExpense(userId, id);
  return prisma.expense.update({
    where: { id },
    data,
    include: { category: true, member: true },
  });
}

export async function deleteExpense(userId, id) {
  await findOwnedExpense(userId, id);
  await prisma.expense.delete({ where: { id } });
}

export async function saveReceiptUrl(userId, id, receiptUrl) {
  await findOwnedExpense(userId, id);
  return prisma.expense.update({
    where: { id },
    data: { receiptUrl },
    include: { category: true, member: true },
  });
}

export function listLoans(userId) {
  return prisma.loan.findMany({
    where: { userId },
    include: { category: true, member: true },
    orderBy: { startDate: "desc" },
  });
}

export function createLoan(userId, data) {
  return prisma.loan.create({
    data: { ...data, userId },
    include: { category: true, member: true },
  });
}

async function findOwnedLoan(userId, id) {
  const loan = await prisma.loan.findFirst({ where: { id, userId } });
  if (!loan) throw httpError(404, "Finanziamento non trovato");
  return loan;
}

export async function updateLoan(userId, id, data) {
  await findOwnedLoan(userId, id);
  return prisma.loan.update({
    where: { id },
    data,
    include: { category: true, member: true },
  });
}

export async function deleteLoan(userId, id) {
  await findOwnedLoan(userId, id);
  await prisma.loan.delete({ where: { id } });
}

export async function setReceipt(userId, id, receiptUrl) {
  await findOwnedExpense(userId, id);
  return prisma.expense.update({
    where: { id },
    data: { receiptUrl },
    include: { category: true, member: true },
  });
}

export async function removeReceipt(userId, id) {
  return setReceipt(userId, id, null);
}
