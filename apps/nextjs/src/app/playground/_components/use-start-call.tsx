import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

function useStartCall({
  guessId,
  phoneNumber,
}: {
  guessId: string;
  phoneNumber: { base: string; extension: string };
}) {
  const { mutateAsync: createCall } = api.phoneCall.create.useMutation({
    onSuccess: () => {
      toast.success("Call created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { sessionManager } = useSIPProvider();

  return {
    startCall: async () => {
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
      return await createCall({
        sessionId,
        guessId,
      });
    },
  };
}

export default useStartCall;
