import type { NotEmptyPhoneNumber } from "../../phone-number";
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
  phoneNumber: NotEmptyPhoneNumber;
  strategy: Strategy;
  count: number;
}) {
  const newPhoneNumbers = Array.from({ length: count }).reduce(
    (acc: NotEmptyPhoneNumber[], _, index) => {
      const newExtension = applyStrategy(
        acc[index - 1]?.extension ?? phoneNumber.extension,
        strategy,
      );

      const newPhoneNumber: NotEmptyPhoneNumber = {
        base: phoneNumber.base,
        extension: newExtension,
      };

      return [...acc, newPhoneNumber];
    },
    [] as NotEmptyPhoneNumber[],
  );

  return newPhoneNumbers;
}

export { generateNextPhoneNumbers };
