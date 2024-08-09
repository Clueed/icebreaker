import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import { toast } from "@acme/ui/toast";

import { useOptimisticPhoneCallMutation } from "~/app/playground/_components/optimistic-phone-call-update";
import { api } from "~/trpc/react";

export function useSyncCallState(
  callId?: string,
  sessionId?: string,
  options: {
    onEnd?: () => void;
  } = {},
) {
  const { updatePhoneCall } = useOptimisticPhoneCallMutation();

  const { sessions } = useSIPProvider();
  const session = sessionId && sessions[sessionId];

  useEffect(() => {
    if (!sessionId || !callId) {
      return;
    }

    if (!session) {
      toast.error("Call Sync: No session found");
      return;
    }

    const listener = (newSessionState: SessionState) => {
      updatePhoneCall(
        {
          id: callId,
          sessionId: sessionId,
          data: {
            state: newSessionState,
          },
        },
        {
          onError: (err) => {
            toast.error(err.message);
          },
        },
      );
      const newCallState = mapSipStateToCallState(newSessionState);
      if (newCallState === "Terminated") {
        options.onEnd?.();
        return;
      }
    };

    session.stateChange.addListener(listener);

    return () => {
      session.stateChange.removeListener(listener);
    };
  }, [session, options.onEnd]);
}

const mapSipStateToCallState = (state: SessionState) => {
  switch (state) {
    case SessionState.Initial:
      return "Initial";
    case SessionState.Establishing:
      return "Establishing";
    case SessionState.Established:
      return "Established";
    case SessionState.Terminating:
      return "Terminating";
    case SessionState.Terminated:
      return "Terminated";
  }
};
