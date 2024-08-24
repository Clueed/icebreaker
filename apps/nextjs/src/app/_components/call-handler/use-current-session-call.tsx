import type { Timer } from "react-sipjs";
import { useSIPProvider } from "react-sipjs";

export const useCurrentSessionCall = (props: { sessionId?: string | null }) => {
  const { sessions, sessionManager, sessionTimer } = useSIPProvider();

  const session = props.sessionId ? sessions[props.sessionId] : null;

  if (!session) {
    return null;
  }

  if (props.sessionId && session) {
    const timer: Timer | undefined = sessionTimer[props.sessionId];

    const friendlyName = session.remoteIdentity.friendlyName;
    const atIndex = friendlyName.indexOf("@");
    const phoneNumber = friendlyName.substring(0, atIndex);

    return {
      state: session.state,
      isActive: session.state !== "Terminated",
      timer,
      phoneNumber: phoneNumber,
      hangup: () => sessionManager?.hangup(session),
    };
  }
};
