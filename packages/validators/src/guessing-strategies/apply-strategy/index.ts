import type { PhoneNumber } from "../../phone-number";
import type { Strategy } from "../index";
import { isAdditionStrategy } from "../index";
import { isRandomStrategy } from "../strategy-random";
import applyStrategyAddition from "./apply-strategy-addition";
import applyStrategyRandom from "./apply-strategy-random";

function applyStrategy(extension: string, strategy: Strategy) {
  if (isAdditionStrategy(strategy)) {
    return applyStrategyAddition(extension, strategy);
  }

  if (isRandomStrategy(strategy)) {
    return applyStrategyRandom(extension);
  }

  const _exhaustiveCheck: never = strategy;
  throw new Error("Invalid extension strategy");
}

function generateNextPhoneNumbers({
  phoneNumber,
  strategy,
  count,
}: {
  phoneNumber: PhoneNumber;
  strategy: Strategy;
  count: number;
}) {
  const newPhoneNumbers = Array.from({ length: count }).reduce(
    (acc: PhoneNumber[], _, index) => {
      const newExtension = applyStrategy(
        acc[index - 1]?.extension ?? phoneNumber.extension,
        strategy,
      );

      const newPhoneNumber: PhoneNumber = {
        base: phoneNumber.base,
        extension: newExtension,
      };

      return [...acc, newPhoneNumber];
    },
    [] as PhoneNumber[],
  );

  return newPhoneNumbers;
}

export { generateNextPhoneNumbers };
