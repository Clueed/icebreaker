import { useSIPProvider } from "react-sipjs";

import { toast } from "@acme/ui/toast";

export function useEndCall() {
  const { sessionManager, sessions } = useSIPProvider();

  return {
    endCall: async ({ sessionId }: { sessionId?: string }) => {
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
