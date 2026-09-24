import { api } from "./client";
import type { Category, Expense, Loan } from "@/types/domain";

export interface ExpenseFilters {
  categoryId?: string;
  memberId?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/expenses/categories");
  return data;
}

export async function listExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const { data } = await api.get<Expense[]>("/expenses", { params: filters });
  return data;
}

export async function createExpense(
  payload: Omit<Expense, "id">,
): Promise<Expense> {
  const { data } = await api.post<Expense>("/expenses", payload);
  return data;
}

export async function updateExpense(
  id: string,
  payload: Partial<Omit<Expense, "id">>,
): Promise<Expense> {
  const { data } = await api.patch<Expense>(`/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

export async function uploadReceipt(
  id: string,
  file: File,
): Promise<{ receiptUrl: string }> {
  const form = new FormData();
  form.append("receipt", file);
  const { data } = await api.post<{ receiptUrl: string }>(
    `/expenses/${id}/receipt`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function listLoans(): Promise<Loan[]> {
  const { data } = await api.get<Loan[]>("/expenses/loans");
  return data;
}

export async function createLoan(payload: Omit<Loan, "id">): Promise<Loan> {
  const { data } = await api.post<Loan>("/expenses/loans", payload);
  return data;
}

export async function updateLoan(
  id: string,
  payload: Partial<Omit<Loan, "id">>,
): Promise<Loan> {
  const { data } = await api.patch<Loan>(`/expenses/loans/${id}`, payload);
  return data;
}

export async function deleteLoan(id: string): Promise<void> {
  await api.delete(`/expenses/loans/${id}`);
}
