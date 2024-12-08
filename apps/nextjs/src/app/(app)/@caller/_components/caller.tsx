"use client";

import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";
import { useCallback } from "react";
import { skipToken } from "@tanstack/react-query";

import { cn } from "@icebreaker/ui";
import { PhoneNumberDisplay } from "@icebreaker/ui/custom/phone-number-display";

import {
  usePhoneCallBySessionIdQuery,
  usePhoneCallUpdateMutation,
} from "~/app/_api-hooks/use-phone-call";
import { useCurrentSessionCall } from "~/app/_components/call-handler/use-current-session-call";
import { useCurrentSessionIdQuery } from "~/app/_components/use-current-session-id";
import { CallRatingCluster } from "~/app/(app)/@caller/_components/current-call-rating-cluster";
import { useSyncCall } from "~/app/(app)/@caller/_components/sync-call";
import { useCallTimer } from "~/app/(app)/@caller/_components/use-call-timer";

export function Caller() {
  const { data: currentSessionId } = useCurrentSessionIdQuery();

  const sessionCall = useCurrentSessionCall();
  const { timer, isActive, phoneNumber } = sessionCall;

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

  useSyncCall({ phoneCall, timer, updatePhoneCall: handleUpdatePhoneCall });

  const { duration } = useCallTimer({ timer });

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
      <div className="flex justify-around">
        <div
          className={cn(
            "size-[1.65cap] rounded-md bg-muted-foreground",
            isActive && "animate-pulse",
            timer?.answeredAt && "bg-green-500 dark:bg-green-200",
          )}
        />
        <div className="tabular-nums">
          {duration && <div>{duration.toFormat("mm:ss")}</div>}
        </div>
      </div>
      <CallRatingCluster
        rating={phoneCall?.rating ?? null}
        disabled={!isActive}
        setRating={(newRating) => handleUpdatePhoneCall({ rating: newRating })}
      />
    </div>
  );
}
