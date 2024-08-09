import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export function useEndCall({ sessionId }: { sessionId?: string }) {
  const { sessionManager, sessions } = useSIPProvider();

  return {
    endCall: async () => {
      if (!sessionId) {
        toast.error("Ending Call: no sessionId");
        return;
      }

      if (!sessionManager) {
        toast.error("Ending Call: No session manager");
        return;
      }

      const session = sessions[sessionId];
      if (!session) {
        toast.error("Ending Call: No session");
        return;
      }

      sessionManager.hangup(session);
    },
  };
}
