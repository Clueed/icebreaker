import { Button } from "@acme/ui/button";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";

import { useCurrentCallQuery } from "~/app/_api-hooks/use-current-call";
import { useEndCall } from "~/app/_components/call-handler/use-end-call";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { CallInfo } from "~/app/@caller/_components/call-info";

export function MakePhoneCall() {
  const { data: phoneCall } = useCurrentCallQuery();
  const [endCall] = useEndCall();
  const [startCall] = useStartCall({ guessId: phoneCall?.guessId });
  const phoneCallActive =
    phoneCall && !["Terminated", "Terminating"].includes(phoneCall.state);

  if (!phoneCall) {
    return <div>No call in progress</div>;
  }

  return (
    <div>
      <div>
        <PhoneNumberDisplay phoneNumber={phoneCall.phoneNumber} />
      </div>
      {phoneCallActive ? (
        <Button onClick={endCall}>Hangup</Button>
      ) : (
        <Button onClick={() => startCall()}>Make Call</Button>
      )}
      {<CallInfo phoneCall={phoneCall} />}
    </div>
  );
}
