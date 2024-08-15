"use client";

import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";

import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { Button } from "@acme/ui/button";

import { CallInfo } from "~/app/@caller/_components/call-info";

export function MakePhoneCall({
  phoneCall,
  startCall,
  endCall,
}: {
  phoneCall: AppRouterOutputs["phoneCall"]["byId"];
  startCall: ({
    guessId,
    phoneNumber,
  }: {
    guessId: string;
    phoneNumber: NotEmptyPhoneNumber;
  }) => Promise<void>;
  endCall: () => Promise<void>;
}) {
  const phoneCallActive =
    phoneCall && !["Terminated", "Terminating"].includes(phoneCall.state);

  return (
    <div>
      <div>
        {phoneCall.guess.phoneNumber.base}-
        {phoneCall.guess.phoneNumber.extension}
      </div>
      {phoneCallActive ? (
        <Button onClick={endCall}>Hangup</Button>
      ) : (
        <Button
          onClick={() =>
            startCall({
              guessId: phoneCall.guess.id,
              phoneNumber: phoneCall.guess.phoneNumber,
            })
          }
        >
          Make Call
        </Button>
      )}
      {<CallInfo phoneCall={phoneCall} />}
    </div>
  );
}
