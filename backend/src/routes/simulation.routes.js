import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import * as simulationController from "../controllers/simulation.controller.js";

// Simulatore di risparmio
export const simulationRouter = Router();

simulationRouter.use(requireAuth);

simulationRouter.post("/run", simulationController.run);
simulationRouter.get("/", simulationController.list);
simulationRouter.post("/", simulationController.save);
simulationRouter.get("/:id", simulationController.getOne);
simulationRouter.delete("/:id", simulationController.remove);
