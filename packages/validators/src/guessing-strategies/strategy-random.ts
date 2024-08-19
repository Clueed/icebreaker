import { z } from "zod";

import type { Strategy } from ".";

export const randomStrategySchema = z.object({
  type: z.literal("random"),
});

export type RandomStrategy = z.infer<typeof randomStrategySchema>;

export const isRandomStrategy = (
  strategy: Strategy,
): strategy is RandomStrategy =>
  randomStrategySchema.safeParse(strategy).success;
