import { useEffect, useState } from "react";

import { useSelectedGuessQuery } from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";

export const useAutoCaller = ({
  orgId,
  enabled,
}: {
  orgId: string;
  enabled: boolean;
}) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });

  const [startCall, { disabled }] = useStartCall({
    guessId: selectedGuess?.id,
  });

  const selectedGuessExists = !!selectedGuess;
  const selectedGuessHasCalls =
    selectedGuessExists && selectedGuess.phoneCallCount !== 0;

  const [lock, setLock] = useState(false);

  useEffect(() => {
    setLock(false);
  }, [selectedGuess?.id]);

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

    if (!selectedGuessHasCalls && !lock) {
      console.log("[AC] No calls found for selectedGuess, starting a new call");
      void startCall();
      console.log("[AC] Call started and locked set to true");
      setLock(true);
    }

    if (selectedGuessHasCalls && lock) {
      console.log(
        "[AC] Calls found for selectedGuess, unlocking and returning",
      );
      setLock(false);
    }
  }, [
    enabled,
    selectedGuessHasCalls,
    disabled,
    selectedGuessExists,
    startCall,
    lock,
  ]);
};
