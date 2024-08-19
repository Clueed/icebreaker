"use client";

import { useSyncCallState } from "~/app/_components/call-handler/use-sync-call-state";
import { MakePhoneCall } from "~/app/@caller/_components/make-phone-call";

export const Caller = () => {
  useSyncCallState();

  return (
    <>
      <div>
        <MakePhoneCall />
      </div>
    </>
  );
};
