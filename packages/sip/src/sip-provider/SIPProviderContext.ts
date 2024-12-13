import { createContext, useContext } from "react";
import { Inviter } from "sip.js";

import type { IProviderContext } from "../type";
import { CONNECT_STATUS, RegisterStatus, SessionDirection } from "../type";

export const ProviderContext = createContext<IProviderContext>({
  sessionManager: null,
  connectAndRegister: () => {
    throw new Error("SIPcontext not initialized");
  },
  connectStatus: CONNECT_STATUS.WAIT_REQUEST_CONNECT,
  registerStatus: RegisterStatus.UNREGISTERED,
  sessions: {},
  sessionTimers: {},
});

export const useSIPProvider = () => {
  return useContext(ProviderContext);
};

export const useSessionCall = (sessionId: string) => {
  const { sessions, sessionManager, sessionTimers } = useSIPProvider();
  const session = sessions[sessionId];

  const direction =
    session instanceof Inviter
      ? SessionDirection.OUTGOING
      : SessionDirection.INCOMING;

  const timer = sessionTimers[sessionId];

  return {
    direction,
    session: session,
    timer,
    answer: () => session && sessionManager?.answer(session),
    decline: () => session && sessionManager?.decline(session),
    hangup: () => session && sessionManager?.hangup(session),
  };
};
