import type { NotEmptyPhoneNumber } from "../../phone-number";
import getAvailableStrategiesAddition from "./get-available-strategies-addition";
import getAvailableStrategiesRandom from "./get-available-strategies-random";

function getAvailableExtensionStrategies(phoneNumber: NotEmptyPhoneNumber) {
  return [
    ...getAvailableStrategiesRandom(phoneNumber),
    ...getAvailableStrategiesAddition(phoneNumber),
  ];
}

export { getAvailableExtensionStrategies };
