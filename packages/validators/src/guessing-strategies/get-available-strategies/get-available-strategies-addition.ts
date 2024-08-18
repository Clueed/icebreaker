import type { NotEmptyPhoneNumber } from "../../phone-number";
import type { AdditionStrategy } from "../strategy-addition";

export default function getAvailableAdditionAdditionExtensionStrategy(
  phoneNumber: NotEmptyPhoneNumber,
): AdditionStrategy[] {
  const extensionLength = phoneNumber.extension.length;
  const extensionStrategies = Array.from({ length: extensionLength }).map(
    (_, index) =>
      ({
        type: "add" as const,
        numberToAdd: 10 ** index,
      }) satisfies AdditionStrategy,
  );
  return extensionStrategies;
}
