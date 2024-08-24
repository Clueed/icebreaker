import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";

import type { PhoneNumber } from "@acme/validators/phone-number";
import { toast } from "@acme/ui/toast";
import { phoneNumberSchema } from "@acme/validators/phone-number";

import {
  useCurrentCallCreateMutation,
  useCurrentCallQuery,
} from "~/app/_api-hooks/use-current-call";
import {
  useCurrentSessionIdMutation,
  useCurrentSessionIdQuery,
} from "~/app/_api-hooks/use-current-session-id";
import { api } from "~/trpc/react";

function useStartCall({ guessId }: { guessId?: string }) {
  const { data: guess } = api.guess.byId.useQuery(
    guessId ? { id: guessId } : skipToken,
    {
      throwOnError: true,
    },
  );
  const { mutate: createPhoneCall } = useCurrentCallCreateMutation();
  const { mutate: setCurrentSessionId } = useCurrentSessionIdMutation();
  const { data: phoneCall } = useCurrentCallQuery();

  const startCall = useStartSipCall();

  return [
    async () => {
      if (!guess) {
        toast.error("Starting Call failed: guess not found");
        return;
      }

      if (phoneCall === undefined) {
        toast.warning("Starting Call failed: something went wrong");
        return;
      }

      if (phoneCall && phoneCall.state !== "Terminated") {
        toast.warning("Starting Call failed: call in progress");
        return;
      }

      const inviter = await startCall({ phoneNumber: guess.phoneNumber });
      if (!inviter) {
        toast.error("Starting Call failed: no inviter");
        return;
      }

      const { id: sessionId } = inviter;
      setCurrentSessionId({
        sessionId,
        orgId: guess.orgId,
        phoneNumber: guess.phoneNumber,
      });
      //   return createPhoneCall(
      //     {
      //       sessionId,
      //       guessId: guess.id,
      //       state,
      //     },
      //     {
      //       onSuccess: () => {
      //         toast.success("Call started: " + guess.phoneNumber);
      //       },
      //       onError: (error) => {
      //         toast.error("Starting Call failed: " + error.message);
      //       },
      //     },
      //   );
    },
  ] as const;
}

export default useStartCall;

const useStartSipCall = () => {
  const { sessionManager, sessions } = useSIPProvider();

  const activeSession = Object.values(sessions).find(
    (session) => session.state !== "Terminated",
  );

  return async (args: { phoneNumber: PhoneNumber }) => {
    const { data: phoneNumber, success } = phoneNumberSchema.safeParse(
      args.phoneNumber,
    );

    if (!success) {
      toast.error(
        "Starting Call failed: invalid phone number " +
          args.phoneNumber.base +
          args.phoneNumber.extension,
      );
      return;
    }

    if (activeSession) {
      toast.error("Starting Call failed: failed, different call in progress");
      return;
    }

    if (!sessionManager) {
      toast.error("Starting Call failed: no session manager");
      return;
    }

    return await sessionManager.call(
      `sip:${phoneNumber.base + phoneNumber.extension}@sipgate.de`,
    );
  };
};
