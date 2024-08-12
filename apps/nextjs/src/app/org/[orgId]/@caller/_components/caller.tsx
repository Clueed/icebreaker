"use client";

import { toast } from "@acme/ui/toast";

import RegisterSip from "~/app/org/[orgId]/_components/register-sip";
import { PhoneCallProvider } from "~/app/org/[orgId]/@caller/_components/current-call";
import { MakePhoneCall } from "~/app/org/[orgId]/@caller/_components/make-phone-call";
import { api } from "~/trpc/react";

export const Caller = ({ userId }: { userId: string }) => {
  const utils = api.useUtils();

  const [userSettings] = api.userSettings.get.useSuspenseQuery({
    userId,
  });

  const currentCallId =
    userSettings !== 0 ? userSettings.currentPhoneCallId : null;

  const { mutate: updateUserSettings } = api.userSettings.set.useMutation({
    onSettled: async () => {
      await utils.userSettings.get.invalidate({ userId });
    },
    onError: (error) => {
      toast.error("error updating user settings: " + error.message);
    },
  });

  function setCurrentPhoneCallId(phoneCallId: string | null): void {
    updateUserSettings({
      userId,
      currentPhoneCallId: phoneCallId,
    });
  }

  return (
    <>
      <PhoneCallProvider
        callId={currentCallId}
        setCallId={setCurrentPhoneCallId}
      >
        <div>
          {currentCallId ? (
            <MakePhoneCall currentCallId={currentCallId} />
          ) : (
            <div>No call in progress</div>
          )}
        </div>
      </PhoneCallProvider>
    </>
  );
};
