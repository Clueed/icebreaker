import type { NotEmptyPhoneNumber } from '../../phone-number'
import type { Base10Strategy } from '../strategy-base10'

export default function getAvailableBase10AdditionExtensionStrategy(
    phoneNumber: NotEmptyPhoneNumber
): Base10Strategy[] {
    const extensionLength = phoneNumber.extension.length
    const extensionStrategies = Array.from({ length: extensionLength }).map(
        (_, index) => ({
            type: 'add' as const,
            power: index,
            loopAtPower: null,
        })
    )
    return extensionStrategies
}
