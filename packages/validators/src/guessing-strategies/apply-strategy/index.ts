import type { Strategy } from '../index'
import { isBase10Strategy } from '../index'
import { isRandomStrategy } from '../strategy-random'
import applyStrategyBase10 from './apply-strategy-base10'
import applyStrategyRandom from './apply-strategy-random'

function applyStrategy(extension: string, strategy: Strategy) {
    if (isBase10Strategy(strategy)) {
        return applyStrategyBase10(extension, strategy)
    }

    if (isRandomStrategy(strategy)) {
        return applyStrategyRandom(extension)
    }

    throw new Error('Invalid extension strategy')
}

export { applyStrategy }
