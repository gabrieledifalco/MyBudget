import { api } from "./client";
import type {
  Simulation,
  SimulationAction,
  SimulationResult,
} from "@/types/domain";

export async function runSimulation(
  actions: SimulationAction[],
): Promise<SimulationResult> {
  const { data } = await api.post<SimulationResult>("/simulations/run", {
    actions,
  });
  return data;
}

export async function saveSimulation(
  name: string,
  actions: SimulationAction[],
): Promise<Simulation> {
  const { data } = await api.post<Simulation>("/simulations", {
    name,
    actions,
  });
  return data;
}

export async function listSimulations(): Promise<Simulation[]> {
  const { data } = await api.get<Simulation[]>("/simulations");
  return data;
}

export async function deleteSimulation(id: string): Promise<void> {
  await api.delete(`/simulations/${id}`);
}
