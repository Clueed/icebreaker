import type { Session } from "sip.js";
import { useCallback, useState } from "react";

export const useSessions = () => {
  const [sessions, setSessions] = useState<Record<string, Session>>({});

  const updateSession = useCallback(
    (session: Session) => {
      setSessions((sessions) => ({
        ...sessions,
        [session.id]: session,
      }));
    },
    [setSessions],
  );

  return [sessions, updateSession] as const;
};
