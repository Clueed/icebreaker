"use client";

import { skipToken } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";

import { useCurrentSessionIdQuery } from "~/app/_api-hooks/use-current-session-id";
import { usePhoneCallByIdQuery } from "~/app/_api-hooks/use-phone-call";
import { useCurrentSessionCall } from "~/app/_components/call-handler/use-current-session-call";
import { CallInfo } from "~/app/@caller/_components/call-info";
import { CurrentCallRatingCluster } from "~/app/@caller/_components/current-call-rating-cluster";

export function Caller() {
  const { data: current } = useCurrentSessionIdQuery();
  const { currentSessionId, callId } = current ?? {};
  const sessionCall = useCurrentSessionCall({ sessionId: currentSessionId });
  const { timer, state, isActive, phoneNumber, hangup } = sessionCall ?? {};

  const { data: phoneCall } = usePhoneCallByIdQuery(
    callId ? { id: callId } : skipToken,
  );

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

      {/* <CurrentCallRatingCluster
        rating={phoneCall?.rating}
        disabled={!isActive}
        setRating={(newRating) =>
          updateCurrentPhoneCall({
            data: {
              rating: newRating,
            },
          })
        }
      /> */}
    </div>
  );
}
