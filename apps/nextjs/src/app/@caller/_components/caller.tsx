"use client";

import { skipToken } from "@tanstack/react-query";

import type { PhoneCallRating } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";

import {
  usePhoneCallBySessionIdQuery,
  usePhoneCallUpdateMutation,
} from "~/app/_api-hooks/use-phone-call";
import { useCurrentSessionCall } from "~/app/_components/call-handler/use-current-session-call";
import { useCurrentSessionIdQuery } from "~/app/_components/use-current-session-id";
import { CallInfo } from "~/app/@caller/_components/call-info";
import { CurrentCallRatingCluster } from "~/app/@caller/_components/current-call-rating-cluster";

export function Caller() {
  const { data: currentSessionId } = useCurrentSessionIdQuery();

  const sessionCall = useCurrentSessionCall({ sessionId: currentSessionId });
  const { timer, state, isActive, phoneNumber, hangup } = sessionCall ?? {};

  const { data: phoneCall } = usePhoneCallBySessionIdQuery(
    currentSessionId ? { sessionId: currentSessionId } : skipToken,
  );

  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();

  const handleSetRating = (newRating: PhoneCallRating) => {
    if (!currentSessionId) {
      throw new Error("cant update call: currentSessionId not found");
    }
    updatePhoneCall({
      sessionId: currentSessionId,
      data: {
        rating: newRating,
      },
    });
  };

  return (
    <div>
      {currentSessionId}

      <div>
        {phoneCall ? (
          <PhoneNumberDisplay phoneNumber={phoneCall.phoneNumber} />
        ) : (
          phoneNumber
        )}
      </div>
      {isActive && (
        <Button
          className="w-full"
          size={"lg"}
          variant={"destructive"}
          onClick={hangup}
        >
          Hangup
        </Button>
      )}
      <CallInfo timer={timer} />

      <CurrentCallRatingCluster
        rating={phoneCall?.rating}
        disabled={!isActive}
        setRating={handleSetRating}
      />
    </div>
  );
}
