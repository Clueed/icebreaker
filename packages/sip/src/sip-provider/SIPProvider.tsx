import type { ReactNode } from "react";
import type { Session } from "sip.js/lib/api/session";
import type { SessionManagerOptions } from "sip.js/lib/platform/web";
import React, { useCallback, useRef, useState } from "react";
import { SessionManager } from "sip.js/lib/platform/web";

import type { SessionTimers, SIPAccount, SIPProviderOptions } from "../type";
import { ErrorMessageLevel1, ErrorMessageLevel2 } from "../enums/error";
import { CONNECT_STATUS, RegisterStatus } from "../type";
import { ProviderContext } from "./SIPProviderContext";

export const SIPProvider = (props: {
  options: SIPProviderOptions;
  children: ReactNode;
  mergedSessionManagerOptions?: SessionManagerOptions;
}): React.ReactNode => {
  const { options, mergedSessionManagerOptions = {}, children } = props;
  const refAudioRemote = useRef<HTMLAudioElement>(null);

  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [sessionTimers, setTimers] = useState<SessionTimers>({});
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(
    null,
  );
  const [connectStatus, setStatus] = useState<CONNECT_STATUS>(
    CONNECT_STATUS.WAIT_REQUEST_CONNECT,
  );
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus>(
    RegisterStatus.UNREGISTERED,
  );

  const updateSession = useCallback(
    (session: Session) => {
      setSessions((sessions) => ({
        ...sessions,
        [session.id]: session,
      }));
    },
    [setSessions],
  );

  const connectAndRegister = useCallback((sipAccount: SIPAccount) => {
    // can't be undefined initially for <video> and <audio> elements which only accept ref or null
    const audio =
      props.options.refAudioRemote ?? refAudioRemote.current ?? undefined;

    const sessionManager = new SessionManager(options.webSocketServer, {
      aor: `sip:${sipAccount.username}@${options.domain}`,
      userAgentOptions: {
        authorizationUsername: sipAccount.username,
        authorizationPassword: sipAccount.password,
      },
      media: {
        constraints: {
          audio: true,
          video: false,
        },
        remote: {
          audio,
        },
      },
      delegate: {
        onCallCreated: (session) => {
          session.stateChange.addListener((state) => {
            console.info(
              ErrorMessageLevel1.SIP_PROVIDER,
              `Session ${session.id} changed to ${state}`,
            );
            updateSession(session);
          });
          updateSession(session);
          setTimers((timers) => ({
            ...timers,
            [session.id]: {
              createdAt: new Date(),
            },
          }));
        },
        onCallAnswered: (session) => {
          updateSession(session);
          setTimers((timers) => {
            const timer = timers[session.id];
            if (!timer) return timers;

            return {
              ...timers,
              [session.id]: {
                ...timer,
                answeredAt: new Date(),
              },
            };
          });
        },
        onCallHangup: (session) => {
          updateSession(session);
          setTimers((timers) => {
            const timer = timers[session.id];
            if (!timer) return timers;

            return {
              ...timers,
              [session.id]: {
                ...timer,
                hangupAt: new Date(),
              },
            };
          });
        },
        onCallReceived: (session) => {
          updateSession(session);
          setTimers((timers) => {
            const timer = timers[session.id];
            if (!timer) return timers;

            return {
              ...timers,
              [session.id]: {
                ...timer,
                receivedAt: new Date(),
              },
            };
          });
        },
        onRegistered: () => {
          setRegisterStatus(RegisterStatus.REGISTERED);
        },
        onUnregistered: () => {
          setRegisterStatus(RegisterStatus.UNREGISTERED);
        },
        onServerConnect() {
          setStatus(CONNECT_STATUS.CONNECTED);
          void sessionManager.register();
        },
        onServerDisconnect(error) {
          console.error(
            ErrorMessageLevel1.SIP_PROVIDER,
            ErrorMessageLevel2.FAILED_CONNECT_SIP_USER,
            error,
          );
          setStatus(CONNECT_STATUS.DISCONNECTED);
        },
      },
      ...mergedSessionManagerOptions,
    });
    setSessionManager(sessionManager);
    void sessionManager.connect();
  }, []);

  return (
    <>
      <ProviderContext.Provider
        value={{
          connectAndRegister,
          sessionManager,
          connectStatus,
          registerStatus,
          sessions,
          sessionTimers,
        }}
      >
        {children}
      </ProviderContext.Provider>
      <audio ref={refAudioRemote} />
    </>
  );
};
