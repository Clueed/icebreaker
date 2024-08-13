import type { Strategy } from '..'
import type { NotEmptyPhoneNumber } from '../../phone-number'
import getAvailableStrategiesBase10 from './get-available-strategies-base10'
import getAvailableStrategiesRandom from './get-available-strategies-random'

function getAvailableExtensionStrategies(
    phoneNumber: NotEmptyPhoneNumber
): Strategy[] {
    return [
        ...getAvailableStrategiesRandom(phoneNumber),
        ...getAvailableStrategiesBase10(phoneNumber),
    ]
}

export { getAvailableExtensionStrategies }
