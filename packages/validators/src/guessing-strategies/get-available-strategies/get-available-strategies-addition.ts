import type { NotEmptyPhoneNumber } from "../../phone-number";
import type { AdditionStrategy } from "../strategy-addition";

export default function getAvailableAdditionAdditionExtensionStrategy(
  phoneNumber: NotEmptyPhoneNumber,
): Omit<AdditionStrategy, "loopAtPower">[] {
  const extensionLength = phoneNumber.extension.length;
  const extensionStrategies = Array.from({ length: extensionLength }).map(
    (_, index) => ({
      type: "add" as const,
      numberToAdd: 10 ** index,
    }),
  );
  return extensionStrategies;
}
