import { z } from "zod";

import type { AdditionStrategy } from "./strategy-addition";
import type { RandomStrategy } from "./strategy-random";
import {
  additionStrategySchema,
  isAdditionStrategy,
} from "./strategy-addition";
import { isRandomStrategy, randomStrategySchema } from "./strategy-random";

const strategySchema = z.union([additionStrategySchema, randomStrategySchema]);
type Strategy = z.infer<typeof strategySchema>;

const extionsionStrategiesAreEqual = (
  strategy1: Strategy,
  strategy2: Strategy,
) => {
  if (isAdditionStrategy(strategy1) && isAdditionStrategy(strategy2)) {
    return strategy1.numberToAdd === strategy2.numberToAdd;
  }

  if (isRandomStrategy(strategy1) && isRandomStrategy(strategy2)) {
    return true;
  }

  return false;
};

export { strategySchema, extionsionStrategiesAreEqual, type Strategy };
export {
  additionStrategySchema as additionStrategySchema,
  isAdditionStrategy,
  type AdditionStrategy as AdditionStrategy,
};
export { randomStrategySchema, isRandomStrategy, type RandomStrategy };
