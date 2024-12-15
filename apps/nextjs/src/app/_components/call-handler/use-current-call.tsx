"use client";

import type { UseSessionCallCallbacks } from "@icebreaker/sip";
import { useSessionCall } from "@icebreaker/sip";

import { useCurrentSessionId } from "./current-session-id-context";

export const useCall = (
  props: {
    callbacks: UseSessionCallCallbacks;
  } = { callbacks: {} },
) => {
  const { sessionId } = useCurrentSessionId();

  const { session, timer, phoneNumber, hangup, active, live } = useSessionCall(
    sessionId,
    props.callbacks,
  );

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
