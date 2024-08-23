"use client";

import { useSessionCall, useSIPProvider } from "react-sipjs";

import { Button } from "@acme/ui/button";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";

import {
  useCurrentCallQuery,
  useCurrentCallUpdateMutation,
} from "~/app/_api-hooks/use-current-call";
import { useEndCall } from "~/app/_components/call-handler/use-end-call";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { CallInfo } from "~/app/@caller/_components/call-info";
import { CurrentCallRatingCluster } from "~/app/@caller/_components/current-call-rating-cluster";

export function Caller() {
  const { data: phoneCall } = useCurrentCallQuery();
  const [endCall] = useEndCall();
  const phoneCallActive = phoneCall?.state !== "Terminated";

  const { mutate: updateCurrentPhoneCall } = useCurrentCallUpdateMutation();

  if (!phoneCall) {
    return <div>No call in progress</div>;
  }

  return (
    <div>
      <div>
        <PhoneNumberDisplay phoneNumber={phoneCall.phoneNumber} />
      </div>
      {phoneCallActive && (
        <Button
          className="w-full"
          size={"lg"}
          variant={"destructive"}
          onClick={endCall}
        >
          Hangup
        </Button>
      )}
      {/* <CallInfo phoneCall={phoneCall} /> */}
      <CurrentCallRatingCluster
        rating={phoneCall.rating}
        disabled={!phoneCallActive}
        setRating={(newRating) =>
          updateCurrentPhoneCall({
            data: {
              rating: newRating,
            },
          })
        }
      />
    </div>
  );
}
