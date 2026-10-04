import { SessionState } from "sip.js";

import type { PhoneNumber } from "@icebreaker/validators/phone-number";
import { phoneNumberSchema } from "@icebreaker/validators/phone-number";

import { useSIPProvider } from "../sip-provider/sip-provider-context";

export const useStartSipCall = () => {
  const { sessionManager, sessions, domain } = useSIPProvider();
  const disabled = Object.values(sessions).some(
    (s) => s.state !== SessionState.Terminated,
  );

  const startCall = async (args: { phoneNumber: PhoneNumber }) => {
    const { data: phoneNumber, success } = phoneNumberSchema.safeParse(
      args.phoneNumber,
    );

    if (!success) {
      console.error(
        "[SC]: invalid phone number " +
          args.phoneNumber.base +
          args.phoneNumber.extension,
      );
      return;
    }

    if (disabled) {
      console.error("[SC]: different call in progress");
      return;
    }

    if (!sessionManager) {
      console.error("[SC]: no session manager");
      return;
    }

    return await sessionManager.call(
      `sip:${phoneNumber.base + phoneNumber.extension}@${domain}`,
    );
  };

  return {
    startCall,
    disabled,
  };
};
