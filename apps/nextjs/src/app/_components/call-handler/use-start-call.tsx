"use client";

import { skipToken } from "@tanstack/react-query";

import { useStartSipCall } from "@icebreaker/sip";
import { toast } from "@icebreaker/ui/toast";

import { usePhoneCallCreateMutation } from "~/app/_api-hooks/use-phone-call";
import { api } from "~/trpc/react";
import { useCurrentSessionId } from "./current-session-id-context";

export const useStartCall = (props?: { selectedGuessId?: string }) => {
  const { mutate: createPhoneCall } = usePhoneCallCreateMutation();
  const { setSessionId } = useCurrentSessionId();
  const { startCall: startSipCall, disabled } = useStartSipCall();
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

  return {
    startCall,
    disabled,
  };
};
