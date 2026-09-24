import { api } from "./client";
import type { Income, IncomeHistoryEntry } from "@/types/domain";

export async function listIncomes(): Promise<Income[]> {
  const { data } = await api.get<Income[]>("/incomes");
  return data;
}

export async function createIncome(
  payload: Omit<Income, "id">,
): Promise<Income> {
  const { data } = await api.post<Income>("/incomes", payload);
  return data;
}

export async function updateIncome(
  id: string,
  payload: Partial<Omit<Income, "id">>,
): Promise<Income> {
  const { data } = await api.patch<Income>(`/incomes/${id}`, payload);
  return data;
}

export async function deleteIncome(id: string): Promise<void> {
  await api.delete(`/incomes/${id}`);
}

export async function getIncomeHistory(
  id: string,
): Promise<IncomeHistoryEntry[]> {
  const { data } = await api.get<IncomeHistoryEntry[]>(
    `/incomes/${id}/history`,
  );
  return data;
}
