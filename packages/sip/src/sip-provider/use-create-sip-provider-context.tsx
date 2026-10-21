import { useCallback, useState } from "react";
import { SessionManager } from "sip.js/lib/platform/web";

import type { PhoneCallRating } from "@icebreaker/validators/phone-call-rating";

import type { SIPAccount } from "../type";
import { usePhoneCallSideEffects } from "./use-managed-calls";
import { useSessionTimers } from "./use-session-timers";
import { useSessions } from "./use-sessions";
import { useSIPStatus } from "./use-sip-status";

export interface SIPProviderOptions {
  webSocketServer: string;
  domain: string;
  /** STUN/TURN urls. Every unreachable one delays each call by the ICE gathering timeout. */
  iceServers: string[];
}
export interface SIPProviderDependencies {
  updatePhoneCall: (args: {
    sessionId: string;
    callSync: boolean;
    data: {
      rating: PhoneCallRating;
    };
  }) => void;
  onCallEnded: (args: { sessionId: string }) => void;
}

export const useCreateSipProviderContext = (props: {
  options: SIPProviderOptions;
  audioRef: HTMLAudioElement | null;
  dependencies: SIPProviderDependencies;
}) => {
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(
    null,
  );
  const { statusPartialDelegate, connectStatus, registerStatus } =
    useSIPStatus();
  const [sessions, updateSession] = useSessions();
  const { sessionTimers, timersUpdates } = useSessionTimers();
  const { stateChangeListener } = usePhoneCallSideEffects(props.dependencies);

  const connectAndRegister = useCallback((sipAccount: SIPAccount) => {
    const newSessionManager = new SessionManager(
      props.options.webSocketServer,
      {
        aor: `sip:${sipAccount.username}@${props.options.domain}`,
        userAgentOptions: {
          authorizationUsername: sipAccount.username,
          authorizationPassword: sipAccount.password,
          sessionDescriptionHandlerFactoryOptions: {
            peerConnectionConfiguration: {
              iceServers: props.options.iceServers.map((urls) => ({ urls })),
            },
          },
        },
        media: {
          constraints: {
            audio: true,
            video: false,
          },
          remote: {
            audio: props.audioRef ?? undefined,
          },
        },
        delegate: {
          onCallCreated: (session) => {
            session.stateChange.addListener((state) => {
              stateChangeListener({
                newState: state,
                sessionId: session.id,
              });
              updateSession(session);
            });
            updateSession(session);
            timersUpdates.onCallCreated(session);
          },
          onCallAnswered: (session) => {
            updateSession(session);
            timersUpdates.onCallAnswered(session);
          },
          onCallHangup: (session) => {
            updateSession(session);
            timersUpdates.onCallHangup(session);
          },
          onCallReceived: (session) => {
            updateSession(session);
            timersUpdates.onCallReceived(session);
          },
          ...statusPartialDelegate,
        },
      },
    );
    setSessionManager(newSessionManager);
    void newSessionManager.connect().then(() => newSessionManager.register());
  }, []);

  return {
    domain: props.options.domain,
    sessionManager,
    connectStatus,
    registerStatus,
    sessionTimers,
    sessions,
    connectAndRegister,
  };
};
