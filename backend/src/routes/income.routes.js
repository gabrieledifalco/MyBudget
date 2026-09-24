import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import * as incomeController from "../controllers/income.controller.js";

// Entrate da lavoro e tassazione
export const incomeRouter = Router();

incomeRouter.use(requireAuth);

incomeRouter.get("/", incomeController.list);
incomeRouter.post("/", incomeController.create);
incomeRouter.patch("/:id", incomeController.update);
incomeRouter.delete("/:id", incomeController.remove);
incomeRouter.get("/:id/history", incomeController.getHistory);
