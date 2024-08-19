import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

import { useCurrentCallQuery } from "~/app/_api-hooks/use-current-call";

export function useEndCall() {
  const { sessionManager, sessions } = useSIPProvider();
  const { data: phoneCall } = useCurrentCallQuery();

  const endCall = useEndSipCall();

  return [
    () => {
      if (phoneCall === undefined) {
        toast.warning("Ending Call: something went wrong");
        return;
      }

      if (phoneCall === null) {
        toast.warning("Ending Call: no call found");
        return;
      }

      endCall({ sessionId: phoneCall.sessionId });
    },
  ] as const;
}

const useEndSipCall = () => {
  const { sessionManager, sessions } = useSIPProvider();

  return ({ sessionId }: { sessionId: string }) => {
    if (!sessionId) {
      toast.error("Ending Call failed: no sessionId");
      return;
    }

    if (!sessionManager) {
      toast.error("Ending Call failed: No session manager");
      return;
    }

    const session = sessions[sessionId];
    if (!session) {
      toast.error("Ending Call failed: No session");
      return;
    }

    sessionManager.hangup(session);
  };
};
