import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";

import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { toast } from "@acme/ui/toast";

import { useEndCall } from "~/app/_components/call-handler/use-end-call";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { useSyncCallState } from "~/app/_components/call-handler/use-sync-call-state";

export const usePhoneCallHandler = ({
  phoneCall,
}: {
  phoneCall?: AppRouterOutputs["phoneCall"]["current"];
}) => {
  useSyncCallState();

  const { startCall } = useStartCall();
  const { endCall } = useEndCall();

  const handleStartCall = async ({
    guessId,
    phoneNumber,
  }: {
    guessId: string;
    phoneNumber: NotEmptyPhoneNumber;
  }) => {
    if (phoneCall && phoneCall.state !== "Terminated") {
      toast.warning("Starting Call: call in progress");
      return;
    }
    return await startCall({
      guessId: guessId,
      phoneNumber: phoneNumber,
    });
    // if (!newCall) {
    //   toast.error("Starting Call: failed to create call");
    //   return;
    // }
    // updateUserSettings({ currentPhoneCallId: newCall.id });
  };

  const handleEndCall = async () => {
    if (!phoneCall) {
      toast.warning("Ending Call: No call found");
      return;
    }
    await endCall({ sessionId: phoneCall.sessionId });
    // state update is handled by useSyncCallState
  };

  return {
    phoneCall,
    startCall: handleStartCall,
    endCall: handleEndCall,
  };
};
