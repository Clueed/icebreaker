import { useCallback, useEffect, useState } from "react";

import { Button } from "@acme/ui/button";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";
import { api } from "~/trpc/react";

export const AutoCaller = ({
  selectedGuessId,
}: {
  selectedGuessId: string;
}) => {
  const { phoneCall, startCall } = useCurrentPhoneCall();
  const { data: selectedGuess } = api.guess.byId.useQuery({
    id: selectedGuessId,
  });

  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  const selectedGuessHasCalls = selectedGuess?.phoneCalls.length || false;
  const currentPhoneCallActive = phoneCall?.state !== "Terminated";

  useEffect(() => {
    if (!enabled || selectedGuess === undefined) {
      return;
    }

    if (currentPhoneCallActive) {
      setLocked(false);
      return;
    }

    if (!selectedGuessHasCalls) {
      startCall({
        guessId: selectedGuessId,
        phoneNumber: selectedGuess.phoneNumber,
      });
      setLocked(true);
    }
  }, [
    enabled,
    selectedGuessHasCalls,
    locked,
    setLocked,
    currentPhoneCallActive,
  ]);

  return (
    <div>
      <div>Auto Caller{enabled ? "enabled" : "disabled"}</div>
      {!enabled ? (
        <Button onClick={() => setEnabled(true)}>enbale</Button>
      ) : (
        <Button onClick={() => setEnabled(false)}>disable</Button>
      )}
    </div>
  );
};
