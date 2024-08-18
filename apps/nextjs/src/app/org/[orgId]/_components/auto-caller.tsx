import { useEffect, useState } from "react";

import { Button } from "@acme/ui/button";

import { useCurrentCallQuery } from "~/app/_api-hooks/use-current-call";
import { useSelectedGuessQuery } from "~/app/_api-hooks/use-selected-guess";
import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";

export const AutoCaller = ({ orgId }: { orgId: string }) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });

  const { startCall } = useCurrentPhoneCall();
  const { data: phoneCall } = useCurrentCallQuery();

  const [enabled, setEnabled] = useState(false);

  const selectedGuessHasCalls = selectedGuess?.phoneCalls.length || false;
  const currentPhoneCallActive = phoneCall?.state !== "Terminated";

  useEffect(() => {
    console.log("[AC] triggered");

    if (!enabled || selectedGuess === undefined) {
      console.log(
        "[AC] AutoCaller is not enabled or selectedGuess is undefined, returning early",
      );
      return;
    }

    if (currentPhoneCallActive) {
      console.log("[AC] Current phone call is active, unlocking and returning");
      return;
    }

    if (!selectedGuessHasCalls) {
      console.log("[AC] No calls found for selectedGuess, starting a new call");
      startCall({
        guessId: selectedGuess.id,
        phoneNumber: selectedGuess.phoneNumber,
      });
      console.log("[AC] Call started and locked set to true");
    }
  }, [
    enabled,
    selectedGuessHasCalls,
    currentPhoneCallActive,
    selectedGuess?.id,
  ]);

  return (
    <div>
      <div>Auto Caller {enabled ? "enabled" : "disabled"}</div>
      {!enabled ? (
        <Button
          onClick={() => {
            setEnabled(true);
            console.log("[AC] AutoCaller enabled");
          }}
        >
          enable
        </Button>
      ) : (
        <Button
          onClick={() => {
            setEnabled(false);
            console.log("[AC] AutoCaller disabled");
          }}
        >
          disable
        </Button>
      )}
    </div>
  );
};
