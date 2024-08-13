import { z } from 'zod'

import type { Strategy } from '.'

export const base10StrategySchema = z.object({
    type: z.literal('add'),
    power: z.number(),
    loopAtPower: z.number().nullable(),
})

export type Base10Strategy = z.infer<typeof base10StrategySchema>

export const isBase10Strategy = (
    strategy: Strategy
): strategy is Base10Strategy =>
    base10StrategySchema.safeParse(strategy).success
