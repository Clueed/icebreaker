import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

import { useOptimisticPhoneCallMutation } from "~/app/_api-hooks/optimistic-phone-call-update";
import { api } from "~/trpc/react";

function useStartCall() {
  const { createPhoneCall } = useOptimisticPhoneCallMutation();

  const { sessionManager } = useSIPProvider();

  return {
    startCall: async ({
      guessId,
      phoneNumber,
    }: {
      guessId: string;
      phoneNumber: { base: string; extension: string };
    }) => {
      if (!sessionManager) {
        toast.error("Starting Call: no session manager");
        return;
      }

      const inviter = await sessionManager.call(
        `sip:${phoneNumber.base + phoneNumber.extension}@sipgate.de`,
        {},
      );
      if (!inviter) {
        toast.error("Starting Call: no inviter");
        return;
      }

      const sessionId = inviter.id;
      const state = inviter.state;
      return await createPhoneCall(
        {
          sessionId,
          guessId,
          state,
        },
        {
          onSuccess: () => {
            toast.success("Call created");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    },
  };
}

export default useStartCall;
