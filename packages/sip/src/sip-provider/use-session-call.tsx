import type { Session } from "sip.js";
import type { SessionManager } from "sip.js/lib/platform/web";
import { Inviter, SessionState } from "sip.js";

import { useSIPProvider } from ".";
import { SessionDirection } from "../type";

export const useSessionCall = (sessionId: string | null) => {
  const { sessions, sessionManager, sessionTimers } = useSIPProvider();

  const timer = sessionId ? sessionTimers[sessionId] : undefined;
  const session = sessionId ? sessions[sessionId] : undefined;
  const phoneNumber = session ? getFriendlyPhoneNumber(session) : undefined;

  const direction =
    session instanceof Inviter
      ? SessionDirection.OUTGOING
      : SessionDirection.INCOMING;

  const active = session ? session.state !== SessionState.Terminated : false;
  const live = session ? session.state === SessionState.Established : false;

  return {
    direction,
    session,
    timer,
    phoneNumber,
    active,
    live,
    answer: () => session && sessionManager?.answer(session),
    decline: () => session && sessionManager?.decline(session),
    hangup: () => hangup({ sessionManager, session }),
  };
};

const hangup = async (args: {
  sessionManager: SessionManager | null;
  session: Session | undefined;
}) => {
  if (!args.sessionManager) {
    console.error("[HU]: no session manager");
    return;
  }
  if (!args.session) {
    console.error("[HU]: no session");
    return;
  }
  await args.sessionManager.hangup(args.session);
};

const getFriendlyPhoneNumber = (session: Session) => {
  const friendlyName = session.remoteIdentity.friendlyName;
  const atIndex = friendlyName.indexOf("@");
  const phoneNumber = friendlyName.substring(0, atIndex);
  return phoneNumber;
};
