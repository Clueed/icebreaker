import type { Session } from "sip.js";
import type { SessionManager } from "sip.js/lib/platform/web";
import { createContext, useContext } from "react";

import type { SessionTimers, SIPAccount } from "../type";
import { CONNECT_STATUS, RegisterStatus } from "../type";

export interface IProviderContext {
  domain: string;
  sessionManager: SessionManager | null;
  connectAndRegister: (sipAccount: SIPAccount) => void;
  connectStatus: CONNECT_STATUS;
  registerStatus: RegisterStatus;
  sessions: Record<string, Session>;
  sessionTimers: SessionTimers;
}

export const ProviderContext = createContext<IProviderContext>({
  domain: "",
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
