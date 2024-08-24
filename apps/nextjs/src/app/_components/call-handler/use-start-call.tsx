import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";

import type { PhoneNumber } from "@acme/validators/phone-number";
import { toast } from "@acme/ui/toast";
import { phoneNumberSchema } from "@acme/validators/phone-number";

import { useCurrentSessionIdMutation } from "~/app/_api-hooks/use-current-session-id";
import { api } from "~/trpc/react";

function useStartCall({ guessId }: { guessId?: string }) {
  const { data: guess } = api.guess.byId.useQuery(
    guessId ? { id: guessId } : skipToken,
    {
      throwOnError: true,
    },
  );
  const { mutate: setCurrentSessionId } = useCurrentSessionIdMutation();
  const [startCall, options] = useStartSipCall();

  return [
    async () => {
      if (!guess) {
        toast.error("[SC]: guess not found");
        return;
      }

      const inviter = await startCall({ phoneNumber: guess.phoneNumber });
      if (!inviter) {
        toast.error("[SC]: no inviter");
        return;
      }

      const { id: sessionId } = inviter;
      setCurrentSessionId({
        sessionId,
        orgId: guess.orgId,
        phoneNumber: guess.phoneNumber,
      });
    },
    options,
  ] as const;
}

export default useStartCall;

const useStartSipCall = () => {
  const { sessionManager, sessions } = useSIPProvider();

  const activeSession = Boolean(
    Object.values(sessions).find((session) => session.state !== "Terminated"),
  );

  const start = async (args: { phoneNumber: PhoneNumber }) => {
    const { data: phoneNumber, success } = phoneNumberSchema.safeParse(
      args.phoneNumber,
    );

    if (!success) {
      toast.error(
        "[SC]: invalid phone number " +
          args.phoneNumber.base +
          args.phoneNumber.extension,
      );
      return;
    }

    if (activeSession) {
      toast.error("[SC]: different call in progress");
      return;
    }

    if (!sessionManager) {
      toast.error("[SC]: no session manager");
      return;
    }

    return await sessionManager.call(
      `sip:${phoneNumber.base + phoneNumber.extension}@sipgate.de`,
    );
  };

  return [start, { disabled: activeSession }] as const;
};
