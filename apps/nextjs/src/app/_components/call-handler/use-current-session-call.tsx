import type { Timer } from "react-sipjs";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import { useCurrentSessionIdQuery } from "~/app/_components/use-current-session-id";

export const useCurrentSessionCall = () => {
  const { data: sessionId } = useCurrentSessionIdQuery();
  const { sessions, sessionManager, sessionTimer } = useSIPProvider();

  const session = sessionId ? sessions[sessionId] : null;

  const hasActive = Object.values(sessions).some(
    (session) => session.state !== SessionState.Terminated,
  );

  if (sessionId && session) {
    const timer: Timer | undefined = sessionTimer[sessionId];

    const friendlyName = session.remoteIdentity.friendlyName;
    const atIndex = friendlyName.indexOf("@");
    const phoneNumber = friendlyName.substring(0, atIndex);

    return {
      state: session.state,
      isActive: hasActive,
      hasActive,
      timer,
      phoneNumber: phoneNumber,
      hangup: () => sessionManager?.hangup(session),
    };
  }

  return { hasActive };
};
