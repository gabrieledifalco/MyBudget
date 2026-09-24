import * as expenseService from "../services/expense.service.js";
import {
  expenseSchema,
  updateExpenseSchema,
  loanSchema,
  updateLoanSchema,
} from "../validators/expense.schema.js";
import { asyncHandler } from "../utils/httpError.js";

export const listCategories = asyncHandler(async (_req, res) => {
  res.json(await expenseService.listCategories());
});

export const list = asyncHandler(async (req, res) => {
  res.json(await expenseService.listExpenses(req.user.id));
});

export const create = asyncHandler(async (req, res) => {
  const data = expenseSchema.parse(req.body);
  res.status(201).json(await expenseService.createExpense(req.user.id, data));
});

export const update = asyncHandler(async (req, res) => {
  const data = updateExpenseSchema.parse(req.body);
  res.json(
    await expenseService.updateExpense(req.user.id, req.params.id, data),
  );
});

export const remove = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user.id, req.params.id);
  res.status(204).send();
});

export const listLoans = asyncHandler(async (req, res) => {
  res.json(await expenseService.listLoans(req.user.id));
});

export const createLoan = asyncHandler(async (req, res) => {
  const data = loanSchema.parse(req.body);
  res.status(201).json(await expenseService.createLoan(req.user.id, data));
});

export const updateLoan = asyncHandler(async (req, res) => {
  const data = updateLoanSchema.parse(req.body);
  res.json(await expenseService.updateLoan(req.user.id, req.params.id, data));
});

export const removeLoan = asyncHandler(async (req, res) => {
  await expenseService.deleteLoan(req.user.id, req.params.id);
  res.status(204).send();
});
