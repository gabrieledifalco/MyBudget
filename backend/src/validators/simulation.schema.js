import { z } from "zod";

const actionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("REDUCE_EXPENSE"),
    expenseId: z.string(),
    percentage: z.number().min(0).max(100),
  }),
  z.object({
    type: z.literal("REMOVE_EXPENSE"),
    expenseId: z.string(),
  }),
  z.object({
    type: z.literal("INCREASE_INCOME"),
    amount: z.number().positive(),
  }),
]);

export const runSimulationSchema = z.object({
  actions: z.array(actionSchema).min(1),
});

export const saveSimulationSchema = runSimulationSchema.extend({
  name: z.string().min(1),
});
