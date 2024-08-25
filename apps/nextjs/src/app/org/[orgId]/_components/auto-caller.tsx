import { useEffect, useState } from "react";

import { Button } from "@icebreaker/ui/button";

import { useSelectedGuessQuery } from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";

export const AutoCaller = ({ orgId }: { orgId: string }) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });

  const [startCall, { disabled }] = useStartCall({
    guessId: selectedGuess?.id,
  });

  const [enabled, setEnabled] = useState(false);

  const selectedGuessExists = !!selectedGuess;
  const selectedGuessHasCalls =
    selectedGuessExists && selectedGuess.phoneCalls.length !== 0;

  useEffect(() => {
    console.log("[AC] triggered");

    if (!enabled || !selectedGuessExists) {
      console.log(
        "[AC] AutoCaller is not enabled or selectedGuess is undefined, returning early",
      );
      return;
    }

    if (disabled) {
      console.log("[AC] Current phone call is active, unlocking and returning");
      return;
    }

    if (!selectedGuessHasCalls) {
      console.log("[AC] No calls found for selectedGuess, starting a new call");
      void startCall();
      console.log("[AC] Call started and locked set to true");
    }
  }, [
    enabled,
    selectedGuessHasCalls,
    disabled,
    selectedGuessExists,
    startCall,
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
