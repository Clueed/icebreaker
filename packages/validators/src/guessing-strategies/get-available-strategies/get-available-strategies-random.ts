import type { NotEmptyPhoneNumber } from "../../phone-number";
import type { RandomStrategy } from "../strategy-random";

export default function getAvailableStrategiesRandom(
  _phoneNumber: NotEmptyPhoneNumber,
): RandomStrategy[] {
  return [
    {
      type: "random" as const,
    },
  ];
}
