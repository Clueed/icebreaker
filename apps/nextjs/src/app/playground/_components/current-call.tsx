import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import { toast } from "@acme/ui/toast";

import { useEndCall } from "~/app/playground/_components/use-end-call";
import useStartCall from "~/app/playground/_components/use-start-call";
import { useSyncCallState } from "~/app/playground/_components/use-sync-call-state";
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
  guessId,
  callId,
  setCallId,
}: {
  children: ReactNode;
  guessId: string;
  callId: string | null;
  setCallId: (id: string | null) => void;
}) {
  const [{ phoneNumber }] = api.guess.byId.useSuspenseQuery({
    id: guessId,
  });

  const { data: phoneCall } = api.phoneCall.byId.useQuery(
    callId
      ? {
          id: callId,
        }
      : skipToken,
    {
      enabled: !!callId,
    },
  );

  useSyncCallState(callId ?? undefined, phoneCall?.sessionId, {
    onEnd: () => {
      setCallId(null);
    },
  });

  const { startCall } = useStartCall({ guessId, phoneNumber });
  const handleStartCall = async () => {
    const newCall = await startCall();
    if (!newCall) {
      return;
    }
    setCallId(newCall.id);
  };

  const { endCall } = useEndCall({ sessionId: phoneCall?.sessionId });
  const handleEndCall = async () => {
    if (!phoneCall) {
      toast.warning("Ending Call: No call found");
      return;
    }
    await endCall();
    // end state is handle with useSyncCallState
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
