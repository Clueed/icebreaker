"use client";

import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";
import { useCallback } from "react";
import { skipToken } from "@tanstack/react-query";

import { PhoneNumberDisplay } from "@icebreaker/ui/custom/phone-number-display";

import {
  usePhoneCallBySessionIdQuery,
  usePhoneCallUpdateMutation,
} from "~/app/_api-hooks/use-phone-call";
import { useCall } from "~/app/_components/call-handler/use-current-call";
import { CallRatingCluster } from "~/app/(app)/@caller/_components/rating-cluster";
import { useSyncCall } from "~/app/(app)/@caller/_components/sync-call";

export function Caller() {
  const { timer, phoneNumber, sessionId: currentSessionId } = useCall();

  const { data: phoneCall } = usePhoneCallBySessionIdQuery(
    currentSessionId ? { sessionId: currentSessionId } : skipToken,
  );

  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();

  const handleUpdatePhoneCall = useCallback(
    (data: AppRouterInputs["phoneCall"]["update"]["data"]) => {
      if (!currentSessionId) {
        throw new Error("cant update call: currentSessionId not found");
      }
      updatePhoneCall({
        sessionId: currentSessionId,
        data,
      });
    },
    [currentSessionId, updatePhoneCall],
  );

  useSyncCall({
    phoneCall: phoneCall,
    timer,
    updatePhoneCall: handleUpdatePhoneCall,
  });

  const phoneNumberToDisplay = phoneCall ? (
    <PhoneNumberDisplay phoneNumber={phoneCall.phoneNumber} />
  ) : (
    phoneNumber
  );

  return (
    <div className="space-y-6">
      <div className="text-center text-2xl font-medium">
        {phoneNumberToDisplay ?? (
          <div className="h-[3cap] w-full rounded-md bg-muted" />
        )}
      </div>
      <CallRatingCluster
        sessionId={currentSessionId}
        rating={phoneCall?.rating ?? null}
      />
    </div>
  );
}
