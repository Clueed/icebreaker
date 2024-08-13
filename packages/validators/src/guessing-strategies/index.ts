import { z } from 'zod'

import type { Base10Strategy } from './strategy-base10'
import type { RandomStrategy } from './strategy-random'
import { base10StrategySchema, isBase10Strategy } from './strategy-base10'
import { isRandomStrategy, randomStrategySchema } from './strategy-random'

const strategySchema = z.union([base10StrategySchema, randomStrategySchema])

type Strategy = z.infer<typeof strategySchema>

const extionsionStrategiesAreEqual = (
    strategy1: Strategy,
    strategy2: Strategy
) => {
    if (isBase10Strategy(strategy1) && isBase10Strategy(strategy2)) {
        return strategy1.power === strategy2.power
    }

    if (isRandomStrategy(strategy1) && isRandomStrategy(strategy2)) {
        return true
    }

    return false
}

export { strategySchema, extionsionStrategiesAreEqual, type Strategy }
export { base10StrategySchema, isBase10Strategy, type Base10Strategy }
export { randomStrategySchema, isRandomStrategy, type RandomStrategy }
