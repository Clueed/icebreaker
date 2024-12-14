"use client";

import { useSessionCall } from "@icebreaker/sip";

import { useCurrentSessionId } from "./current-session-id-context";

export const useCall = () => {
  const { sessionId } = useCurrentSessionId();

  const { session, timer, phoneNumber, hangup, active, live } =
    useSessionCall(sessionId);

  const state = session ? session.state : undefined;

  return {
    state,
    active,
    live,
    timer,
    sessionId,
    phoneNumber,
    hangup,
  };
};
