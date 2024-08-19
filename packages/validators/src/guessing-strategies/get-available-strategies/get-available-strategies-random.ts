import type { PhoneNumber } from "../../phone-number";
import type { RandomStrategy } from "../strategy-random";

export default function getAvailableStrategiesRandom(
  _phoneNumber: PhoneNumber,
): RandomStrategy[] {
  return [
    {
      type: "random" as const,
    },
  ];
}
