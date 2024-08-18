import type { AdditionStrategy } from "..";

export default function applyStrategyAddition(
  baseString: string,
  strategy: AdditionStrategy,
): string {
  const extensionLength = baseString.length;

  const loopAtPower = strategy.loopAtPower ?? extensionLength - 1;
  const valueToAdd = strategy.numberToAdd;
  const valueToAddLength = valueToAdd.toString().length;

  if (valueToAddLength > extensionLength) {
    throw new Error(
      `Value to add (${valueToAdd}) is bigger than the extension (${baseString})`,
    );
  }

  const parsedNumber = parseInt(baseString, 10);
  const sumValue = parsedNumber + valueToAdd;
  const paddedSumValue = sumValue.toString().padStart(extensionLength, "0");

  const charsToPreverse = loopAtPower + 1;
  const startOfBaseString = baseString.slice(
    0,
    extensionLength - charsToPreverse,
  );
  const endOfpaddedSumValue = paddedSumValue.slice(
    paddedSumValue.length - charsToPreverse,
    paddedSumValue.length,
  );

  return startOfBaseString + endOfpaddedSumValue;
}
