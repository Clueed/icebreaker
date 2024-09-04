import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useSelectedGuessIdSetQuery,
  useSelectedGuessIsPending,
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
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });
  const { id: selectedGuessId } = selectedGuess ?? {};

  const { mutate: setSelectedGuessId } = useSelectedGuessIdSetQuery();
  const setNextAsCurrentGuess = useCallback(() => {
    console.debug("[AS] setSelectedGuessId called");

    if (!selectedGuessId) {
      throw new Error("[AS]selectedGuess not found while setting selected");
    }

    if (!nextGuessId) {
      throw new Error("[AS]nextGuessId not found while setting selected");
    }

    console.debug("[AS] Updating org with selectedGuessId:", nextGuessId);
    setSelectedGuessId({
      orgId: orgId,
      data: { selectedGuessId: nextGuessId },
    });
  }, [nextGuessId, orgId, selectedGuessId, setSelectedGuessId]);

  const { hasActive } = useCurrentSessionCall();
  const selectedGuessHasCalls = Boolean(selectedGuess?.phoneCallCount);
  const selectedGuessIsPending = useSelectedGuessIsPending({ orgId });

  const [status, setStatus] = useState<string>("disabled");

  const canProceedToNextGuess = useMemo(() => {
    if (!enabled) return "disabled";
    if (selectedGuessIsPending) return "network pending";
    if (!selectedGuessId) return "selectedGuessId not found";
    if (!nextGuessId) return "nextGuessId not found";
    if (hasActive) return "waiting for current call to end";
    if (!selectedGuessHasCalls)
      return "waiting for selected guess to have calls";

    return true;
  }, [
    enabled,
    selectedGuessIsPending,
    selectedGuessId,
    nextGuessId,
    hasActive,
    selectedGuessHasCalls,
  ]);

  useEffect(() => {
    if (canProceedToNextGuess === true) {
      setStatus("going to next guess");
      setNextAsCurrentGuess();
      return;
    }

    setStatus(canProceedToNextGuess);
  }, [canProceedToNextGuess, setNextAsCurrentGuess]);

  return { status };
};
