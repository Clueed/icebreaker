import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";

import { api } from "~/trpc/react";

export const NextPhoneNumberSelector = ({
  orgId,
  phoneNumber,
}: {
  orgId: string;
  phoneNumber: NotEmptyPhoneNumber;
}) => {
  const { data: nextPhoneNumbersData } = api.guess.next.useQuery({
    orgId,
    phoneNumber,
    strategy: { type: "random" },
    count: 10,
  });

  const nextPhoneNumbers = nextPhoneNumbersData ?? [];

  return (
    <div>
      {nextPhoneNumbers.map(({ phoneNumber }) => (
        <div key={phoneNumber.base + phoneNumber.extension}>
          {phoneNumber.base}-{phoneNumber.extension}
        </div>
      ))}
    </div>
  );
};
