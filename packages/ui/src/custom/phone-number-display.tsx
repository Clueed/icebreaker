import type { PhoneNumber } from "@icebreaker/validators/phone-number";

export const PhoneNumberDisplay = (props: { phoneNumber: PhoneNumber }) => {
  return (
    <div className="grid grid-cols-[7rem_auto_5rem] gap-1 text-lg">
      <div className="text-right opacity-75">{props.phoneNumber.base}</div>-
      <div>{props.phoneNumber.extension}</div>
    </div>
  );
};
