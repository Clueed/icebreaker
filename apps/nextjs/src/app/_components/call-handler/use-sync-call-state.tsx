import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import { toast } from "@acme/ui/toast";

import { useOptimisticPhoneCallMutation } from "~/app/_api-hooks/optimistic-phone-call-update";
import { api } from "~/trpc/react";

export function useSyncCallState(
  phoneCall?: AppRouterOutputs["phoneCall"]["byId"],
) {
  const { sessionId, id: callId, state } = phoneCall ?? {};

  const { updatePhoneCall } = useOptimisticPhoneCallMutation();

  const { sessions } = useSIPProvider();
  const session = sessionId ? sessions[sessionId] : undefined;

  useEffect(() => {
    if (!sessionId || !callId) {
      return;
    }

    if (!session) {
      toast.error("Call Sync: No session found");
      if (state && state !== "Terminated") {
        updatePhoneCall(
          {
            id: callId,
            sessionId: sessionId,
            data: {
              state: "Terminated",
            },
          },
          {
            onError: (err) => {
              toast.error(err.message);
            },
          },
        );
      }
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
    };

    session.stateChange.addListener(listener);

    return () => {
      session.stateChange.removeListener(listener);
    };
  }, [session, phoneCall]);
}
