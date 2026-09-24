import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import * as expenseController from "../controllers/expense.controller.js";

// Spese fisse, variabili e finanziamenti
export const expenseRouter = Router();

expenseRouter.use(requireAuth);

expenseRouter.get("/categories", expenseController.listCategories);

expenseRouter.get("/loans", expenseController.listLoans);
expenseRouter.post("/loans", expenseController.createLoan);
expenseRouter.patch("/loans/:id", expenseController.updateLoan);
expenseRouter.delete("/loans/:id", expenseController.removeLoan);

expenseRouter.get("/", expenseController.list);
expenseRouter.post("/", expenseController.create);
expenseRouter.patch("/:id", expenseController.update);
expenseRouter.delete("/:id", expenseController.remove);
expenseRouter.post("/:id/receipt", expenseController.uploadReceipt);
