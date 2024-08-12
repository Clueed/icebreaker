import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import { toast } from "@acme/ui/toast";

import { useEndCall } from "~/app/org/[orgId]/@caller/_components/use-end-call";
import useStartCall from "~/app/org/[orgId]/@caller/_components/use-start-call";
import { useSyncCallState } from "~/app/org/[orgId]/@caller/_components/use-sync-call-state";
import { api } from "~/trpc/react";

const PhoneCallContext = createContext<
  | {
      startCall: () => Promise<void>;
      endCall: () => Promise<void>;
    }
  | undefined
>(undefined);

export function PhoneCallProvider({
  children,
  callId,
  setCallId,
}: {
  children: ReactNode;
  callId: string | null;
  setCallId: (id: string | null) => void;
}) {
  const { data: phoneCall } = api.phoneCall.byId.useQuery(
    callId
      ? {
          id: callId,
        }
      : skipToken,
    {
      enabled: !!callId,
      throwOnError: true,
    },
  );

  useSyncCallState(callId ?? undefined, phoneCall?.sessionId);

  const { startCall } = useStartCall();
  const handleStartCall = async () => {
    if (!phoneCall) {
      toast.error("Starting Call: no call found in db");
      return;
    }
    const newCall = await startCall({
      guessId: phoneCall.guess.id,
      phoneNumber: phoneCall?.guess.phoneNumber,
    });
    if (!newCall) {
      return;
    }
    setCallId(newCall.id);
  };

  const { endCall } = useEndCall();
  const handleEndCall = async () => {
    if (!phoneCall) {
      toast.warning("Ending Call: No call found");
      return;
    }
    await endCall({ sessionId: phoneCall.sessionId });
  };

  return (
    <PhoneCallContext.Provider
      value={{
        startCall: handleStartCall,
        endCall: handleEndCall,
      }}
    >
      {children}
    </PhoneCallContext.Provider>
  );
}

export const usePhoneCall = () => {
  const context = useContext(PhoneCallContext);
  if (!context) {
    throw new Error("usePhoneCall must be used within a PhoneCallProvider");
  }
  return context;
};

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
