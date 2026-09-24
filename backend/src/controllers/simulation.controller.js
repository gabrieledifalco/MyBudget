import * as simulationService from "../services/simulation.service.js";
import {
  runSimulationSchema,
  saveSimulationSchema,
} from "../validators/simulation.schema.js";
import { asyncHandler } from "../utils/httpError.js";

export const run = asyncHandler(async (req, res) => {
  const data = runSimulationSchema.parse(req.body);
  res.json(await simulationService.runSimulation(req.user.id, data));
});

export const save = asyncHandler(async (req, res) => {
  const data = saveSimulationSchema.parse(req.body);
  res
    .status(201)
    .json(await simulationService.saveSimulation(req.user.id, data));
});

export const list = asyncHandler(async (req, res) => {
  res.json(await simulationService.listSimulations(req.user.id));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await simulationService.getSimulation(req.user.id, req.params.id));
});

export const remove = asyncHandler(async (req, res) => {
  await simulationService.deleteSimulation(req.user.id, req.params.id);
  res.status(204).send();
});
