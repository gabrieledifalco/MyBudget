import { z } from "zod";

export const incomeSchema = z.object({
  employmentType: z.enum(["EMPLOYEE", "FREELANCER", "VAT", "RETIRED", "OTHER"]),
  netMonthly: z.number().nonnegative().default(0),
  grossMonthly: z.number().nonnegative().default(0),
  thirteenthSalary: z.number().nonnegative().optional(),
  fourteenthSalary: z.number().nonnegative().optional(),
  annualBonus: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxFrequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  taxSetAside: z.number().nonnegative().optional(),
  memberId: z.string().optional(),
});

export const updateIncomeSchema = incomeSchema.partial();
