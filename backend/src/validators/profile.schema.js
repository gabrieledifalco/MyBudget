import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  profileType: z.enum(["INDIVIDUAL", "FAMILY"]).optional(),
});

export const familyMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["SPOUSE", "CHILD", "PARENT", "OTHER"]),
  producesIncome: z.boolean().default(false),
});

export const updateFamilyMemberSchema = familyMemberSchema.partial();

export const housingSchema = z.object({
  type: z.enum(["OWNED", "MORTGAGE", "RENT"]),
  propertyValue: z.number().nonnegative().optional(),
  mortgagePayment: z.number().nonnegative().optional(),
  mortgageYears: z.number().int().nonnegative().optional(),
  rentAmount: z.number().nonnegative().optional(),
});

export const passiveIncomeSchema = z.object({
  type: z.enum(["RENT", "DIVIDEND", "FUND", "INVESTMENT", "PENSION", "OTHER"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.coerce.date(),
});

export const updatePassiveIncomeSchema = passiveIncomeSchema.partial();
