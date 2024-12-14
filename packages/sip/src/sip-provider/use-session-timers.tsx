import type { Session } from "sip.js";
import { useCallback, useState } from "react";

import type { SessionTimers } from "../type";

export const useSessionTimers = () => {
  const [sessionTimers, setTimers] = useState<SessionTimers>({});

  const createTimerCallback = useCallback(
    (timerKey: keyof SessionTimers[string]) => {
      return (session: Session) => {
        setTimers((timers) => {
          const existingTimer = timers[session.id];

          if (timerKey === "createdAt") {
            return {
              ...timers,
              [session.id]: {
                createdAt: new Date(),
              },
            };
          }

          if (!existingTimer) return timers;

          return {
            ...timers,
            [session.id]: {
              ...existingTimer,
              [timerKey]: new Date(),
            },
          };
        });
      };
    },
    [],
  );

  const onCallCreated = useCallback(
    (session: Session) => createTimerCallback("createdAt")(session),
    [createTimerCallback],
  );

  const onCallAnswered = useCallback(
    (session: Session) => createTimerCallback("answeredAt")(session),
    [createTimerCallback],
  );

  const onCallHangup = useCallback(
    (session: Session) => createTimerCallback("hangupAt")(session),
    [createTimerCallback],
  );

  const onCallReceived = useCallback(
    (session: Session) => createTimerCallback("receivedAt")(session),
    [createTimerCallback],
  );

  return {
    sessionTimers,
    timersUpdates: {
      onCallCreated,
      onCallAnswered,
      onCallHangup,
      onCallReceived,
    },
  };
};
