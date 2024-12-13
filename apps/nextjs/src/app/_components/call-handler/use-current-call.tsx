"use client";

import type { Session } from "sip.js";
import type { SessionManager } from "sip.js/lib/platform/web";
import { skipToken } from "@tanstack/react-query";
import { SessionState } from "sip.js";

import type { PhoneNumber } from "@icebreaker/validators/phone-number";
import { useSIPProvider } from "@icebreaker/sip";
import { toast } from "@icebreaker/ui/toast";
import { phoneNumberSchema } from "@icebreaker/validators/phone-number";

import { usePhoneCallCreateMutation } from "~/app/_api-hooks/use-phone-call";
import { api } from "~/trpc/react";
import { useCurrentSessionId } from "./current-session-id-context";

export const useCall = (props?: { selectedGuessId?: string }) => {
  const { sessionId, setSessionId } = useCurrentSessionId();
  const { sessions, sessionManager, sessionTimers } = useSIPProvider();

  const _session = sessionId ? sessions[sessionId] : undefined;
  const session = _session ?? undefined;
  const isActive = Object.values(sessions).some(
    (session) => session.state !== SessionState.Terminated,
  );

  const { mutate: createPhoneCall } = usePhoneCallCreateMutation();
  const { data: guess } = api.guess.byId.useQuery(
    props?.selectedGuessId ? { id: props.selectedGuessId } : skipToken,
    {
      throwOnError: true,
    },
  );
  const startCall = async () => {
    if (!guess) {
      toast.error("[SC]: guess not found");
      return;
    }

    const inviter = await startSipCall({
      phoneNumber: guess.phoneNumber,
      isActive,
      sessionManager,
    });
    if (!inviter) {
      toast.error("[SC]: no inviter");
      return;
    }
    const newSessionId = inviter.id;

    createPhoneCall({
      sessionId: newSessionId,
      orgId: guess.orgId,
      phoneNumber: guess.phoneNumber,
    });
    setSessionId(newSessionId);
  };

  const hangup = async () => {
    await stopSipCall({
      sessionManager,
      session,
    });
  };

  const state = session ? session.state : undefined;
  const timer = sessionId ? sessionTimers[sessionId] : undefined;
  const phoneNumber = session ? getFriendlyPhoneNumber(session) : undefined;
  const live = !!(isActive && timer?.answeredAt);

  return {
    state,
    isActive,
    hasActive: isActive,
    live,
    timer,
    sessionId,
    phoneNumber,
    startCall,
    hangup,
  };
};

const startSipCall = async (args: {
  phoneNumber: PhoneNumber;
  isActive: boolean;
  sessionManager: SessionManager | null;
}) => {
  const { data: phoneNumber, success } = phoneNumberSchema.safeParse(
    args.phoneNumber,
  );

  if (!success) {
    toast.error(
      "[SC]: invalid phone number " +
        args.phoneNumber.base +
        args.phoneNumber.extension,
    );
    return;
  }

  if (args.isActive) {
    toast.error("[SC]: different call in progress");
    return;
  }

  if (!args.sessionManager) {
    toast.error("[SC]: no session manager");
    return;
  }

  return await args.sessionManager.call(
    `sip:${phoneNumber.base + phoneNumber.extension}@sipgate.de`,
  );
};

const stopSipCall = async (args: {
  sessionManager: SessionManager | null;
  session: Session | undefined;
}) => {
  if (!args.sessionManager) {
    toast.error("[SC]: no session manager");
    return;
  }
  if (!args.session) {
    toast.error("[SC]: no session");
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
