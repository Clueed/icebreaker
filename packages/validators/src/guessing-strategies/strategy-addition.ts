import { z } from "zod";

import type { Strategy } from ".";

export const additionStrategySchema = z.object({
  type: z.literal("add"),
  numberToAdd: z.number(),
  loopAtPower: z.number().optional(),
});

export type AdditionStrategy = z.infer<typeof additionStrategySchema>;

export const isAdditionStrategy = (
  strategy: Strategy,
): strategy is AdditionStrategy =>
  additionStrategySchema.safeParse(strategy).success;
