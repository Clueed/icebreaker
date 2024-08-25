import { useCallback, useEffect } from "react";

import {
  useSelectedGuessIdSetQuery,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import { useCurrentSessionCall } from "~/app/_components/call-handler/use-current-session-call";

export const useAutoSkipper = ({
  orgId,
  nextGuessId,
  enabled,
}: {
  orgId: string;
  nextGuessId: string | undefined;
  enabled: boolean;
}) => {
  const { hasActive } = useCurrentSessionCall();
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });

  const { mutate: setSelectedGuessIdMutate } = useSelectedGuessIdSetQuery();

  const setSelectedGuessId = useCallback(() => {
    console.debug("[AS] setSelectedGuessId called");

    if (!selectedGuess?.id) {
      throw new Error("[AS]selectedGuess not found while setting selected");
    }

    if (!nextGuessId) {
      throw new Error("[AS]nextGuessId not found while setting selected");
    }

    console.debug("[AS] Updating org with selectedGuessId:", nextGuessId);
    setSelectedGuessIdMutate({
      orgId: selectedGuess.orgId,
      data: { selectedGuessId: nextGuessId },
    });
  }, [
    selectedGuess?.id,
    selectedGuess?.orgId,
    nextGuessId,
    setSelectedGuessIdMutate,
  ]);

  const selectedGuessHasCalls = Boolean(selectedGuess?.phoneCallCount);

  useEffect(() => {
    if (!enabled) {
      console.debug("[AS] Auto Skipper is disabled, returning");
      return;
    }

    if (hasActive) {
      console.debug("[AS] Active calls found, returning");
      return;
    }

    if (selectedGuessHasCalls) {
      console.debug(
        "[AS] No active calls, but calls present. Setting selected guess ID.",
      );
      setSelectedGuessId();
    }
  }, [enabled, hasActive, selectedGuessHasCalls, setSelectedGuessId]);
};
