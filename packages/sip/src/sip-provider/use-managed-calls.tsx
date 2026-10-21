import { useCallback } from "react";
import { SessionState } from "sip.js";

import type { SIPProviderDependencies } from "./use-create-sip-provider-context";

export const usePhoneCallSideEffects = ({
  updatePhoneCall,
  onCallEnded,
}: SIPProviderDependencies) => {
  const stateChangeListener = useCallback(
    (args: { sessionId: string; newState: SessionState }) => {
      if (args.newState === SessionState.Established) {
        updatePhoneCall({
          sessionId: args.sessionId,
          callSync: true,
          data: {
            rating: "answered",
          },
        });
      }
      if (args.newState === SessionState.Terminated) {
        onCallEnded({ sessionId: args.sessionId });
      }
    },
    [updatePhoneCall, onCallEnded],
  );

  return {
    stateChangeListener,
  };
};
