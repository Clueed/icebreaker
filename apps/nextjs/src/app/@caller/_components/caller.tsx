"use client";

import { toast } from "@acme/ui/toast";

import { useOptimisticUserSettingsMutation } from "~/app/_api-hooks/optimistic-user-settings-update";
import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";
import { MakePhoneCall } from "~/app/@caller/_components/make-phone-call";
import RegisterSip from "~/app/org/[orgId]/_components/register-sip";
import { api } from "~/trpc/react";

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
