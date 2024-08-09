import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import { toast } from "@acme/ui/toast";

export function useSyncCallState(
  sessionId?: string,
  options: {
    onEnd?: () => void;
  } = {},
) {
  const { sessions } = useSIPProvider();
  const session = sessionId && sessions[sessionId];

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    if (!session) {
      toast.error("Call Sync: No session found");
      return;
    }

    const listener = (newSessionState: SessionState) => {
      const newCallState = mapSipStateToCallState(newSessionState);
      if (newCallState === "ended") {
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
      return "started";
    case SessionState.Establishing:
      return "started";
    case SessionState.Established:
      return "active";
    case SessionState.Terminating:
      return "ended";
    case SessionState.Terminated:
      return "ended";
  }
};
