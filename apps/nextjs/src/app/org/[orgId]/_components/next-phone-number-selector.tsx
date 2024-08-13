import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";

import { api } from "~/trpc/react";

export const NextPhoneNumberSelector = ({
  orgId,
  phoneNumber,
}: {
  orgId: string;
  phoneNumber: NotEmptyPhoneNumber;
}) => {
  const [nextPhoneNumbers] = api.guess.next.useSuspenseQuery({
    orgId,
    phoneNumber,
    strategy: { type: "random" },
    count: 10,
  });

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
