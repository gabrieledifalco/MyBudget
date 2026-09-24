import { z } from "zod";

export const expenseSchema = z.object({
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  kind: z.enum(["FIXED", "VARIABLE"]),
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
  isRecurring: z.boolean().default(true),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  utility: z.number().int().min(1).max(5).default(3),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateExpenseSchema = expenseSchema.partial();

export const loanSchema = z.object({
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  totalAmount: z.number().positive(),
  monthlyPayment: z.number().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const updateLoanSchema = loanSchema.partial();

export const expenseFiltersSchema = z.object({
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  utility: z.coerce.number().int().min(1).max(5).optional(),
});
