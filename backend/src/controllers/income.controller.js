import * as incomeService from "../services/income.service.js";
import {
  incomeSchema,
  updateIncomeSchema,
} from "../validators/income.schema.js";
import { asyncHandler } from "../utils/httpError.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await incomeService.listIncomes(req.user.id));
});

export const create = asyncHandler(async (req, res) => {
  const data = incomeSchema.parse(req.body);
  res.status(201).json(await incomeService.createIncome(req.user.id, data));
});

export const update = asyncHandler(async (req, res) => {
  const data = updateIncomeSchema.parse(req.body);
  res.json(await incomeService.updateIncome(req.user.id, req.params.id, data));
});

export const remove = asyncHandler(async (req, res) => {
  await incomeService.deleteIncome(req.user.id, req.params.id);
  res.status(204).send();
});
