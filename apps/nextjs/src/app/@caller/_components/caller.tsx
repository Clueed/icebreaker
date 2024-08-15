"use client";

import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";
import { MakePhoneCall } from "~/app/@caller/_components/make-phone-call";

export const Caller = () => {
  const { phoneCall, startCall, endCall } = useCurrentPhoneCall();
  return (
    <>
      <div>
        {phoneCall ? (
          <MakePhoneCall
            phoneCall={phoneCall}
            startCall={startCall}
            endCall={endCall}
          />
        ) : (
          <div>No call in progress</div>
        )}
      </div>
    </>
  );
};
