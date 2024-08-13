import type { Base10Strategy } from '../strategy-base10.js'

export default function applyStrategyBase10(
    extension: string,
    strategy: Base10Strategy
): string {
    //TODO: implementconst { power, loopAtPower } = strategy
    const { power } = strategy
    const digits = extension.split('').map(Number)

    const digitToModify = digits.length - power - 1

    const incrementedDigits = digits.map((digit, i) => {
        if (i === digitToModify) {
            return (digit + 1) % 10
        }

        return digit
    })

    return incrementedDigits.join('')
}
