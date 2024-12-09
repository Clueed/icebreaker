import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useSelectedGuessIsPending,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import { useCall } from "~/app/_components/call-handler/use-current-call";

export const useAutoCaller = ({
  orgId,
  enabled,
}: {
  orgId: string;
  enabled: boolean;
}) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });
  const { id: selectedGuessId } = selectedGuess ?? {};
  const selectedGuessIsPending = useSelectedGuessIsPending({ orgId });

  const { hasActive } = useCall();

  const selectedGuessExists = !!selectedGuess;
  const selectedGuessHasCalls =
    selectedGuessExists && selectedGuess.phoneCallCount !== 0;

  const [callStratedOnGuessId, setCallStratedOnGuessId] = useState<string>();

  const shouldStartNextCall = useMemo(() => {
    if (!enabled) return "disabled";
    if (selectedGuessIsPending) return "network pending";
    if (hasActive) return "waiting for current call to end";
    if (!selectedGuessExists) return "no selected guess";
    if (selectedGuessHasCalls) return "selected guess already has calls";
    if (callStratedOnGuessId === selectedGuessId) return "call started";

    return true;
  }, [
    callStratedOnGuessId,
    enabled,
    hasActive,
    selectedGuessExists,
    selectedGuessHasCalls,
    selectedGuessId,
    selectedGuessIsPending,
  ]);

  const { startCall } = useCall({
    selectedGuessId: selectedGuess?.id,
  });

  const handleStartCall = useCallback(() => {
    void startCall();
    setCallStratedOnGuessId(selectedGuessId);
  }, [selectedGuessId, startCall]);

  const [status, setStatus] = useState<string>("disabled");

  useEffect(() => {
    if (shouldStartNextCall === true) {
      setStatus("starting call");
      handleStartCall();
      return;
    }

    setStatus(shouldStartNextCall);
  }, [handleStartCall, shouldStartNextCall]);

  return { status };
};
