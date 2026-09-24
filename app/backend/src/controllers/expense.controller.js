import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import * as expenseService from "../services/expense.service.js";
import * as classifierService from "../services/classifier.service.js";
import {
  expenseSchema,
  expenseFiltersSchema,
  updateExpenseSchema,
  loanSchema,
  updateLoanSchema,
  classifySchema,
} from "../validators/expense.schema.js";
import { asyncHandler } from "../utils/httpError.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: join(__dirname, "../../uploads/receipts"),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export const listCategories = asyncHandler(async (_req, res) => {
  res.json(await expenseService.listCategories());
});

export const list = asyncHandler(async (req, res) => {
  const filters = expenseFiltersSchema.parse(req.query);
  res.json(await expenseService.listExpenses(req.user.id, filters));
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

export const uploadReceipt = [
  upload.single("receipt"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file ricevuto." });
    }
    const receiptUrl = `/uploads/receipts/${req.file.filename}`;
    const expense = await expenseService.saveReceiptUrl(
      req.user.id,
      req.params.id,
      receiptUrl,
    );
    res.json({ receiptUrl: expense.receiptUrl });
  }),
];

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

// Agente expense-classifier: interpreta una descrizione libera o il testo di
// uno scontrino e propone i campi del form. Vedi agents/definitions/.
export const classifierStatus = asyncHandler(async (_req, res) => {
  res.json({ enabled: classifierService.isEnabled() });
});

export const classify = asyncHandler(async (req, res) => {
  const data = classifySchema.parse(req.body);
  res.json(await classifierService.classify(data));
});
