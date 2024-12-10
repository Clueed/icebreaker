import { useAutoAnimate } from "@formkit/auto-animate/react";

import type { PhoneNumber } from "@icebreaker/validators/phone-number";
import { Skeleton } from "@icebreaker/ui/skeleton";

export const CallPhoneNumberDisplay = ({
  sessionPhoneNumber,
  phoneCallPhoneNumber,
}: {
  sessionPhoneNumber: string | undefined;
  phoneCallPhoneNumber: PhoneNumber | undefined;
}) => {
  const [animateRef] = useAutoAnimate();
  return (
    <div ref={animateRef} className="text-xl">
      {!sessionPhoneNumber &&
        Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            key={index}
            className="mx-0.5 inline-block h-[1.5cap] w-[1.5ch] animate-none"
          />
        ))}
      {phoneCallPhoneNumber ? (
        <>
          <span className="opacity-50">{phoneCallPhoneNumber.base}</span>
          {" - "}
          <span>{phoneCallPhoneNumber.extension}</span>
        </>
      ) : (
        sessionPhoneNumber
      )}
    </div>
  );
};
