import { useCallback, useEffect, useState } from "react";

import { Button } from "@acme/ui/button";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import { api } from "~/trpc/react";

export const AutoSkipper = ({
  selectedGuessId,
  nextGuessId,
}: {
  selectedGuessId: string;
  nextGuessId: string | undefined;
}) => {
  const { data: selectedGuess } = api.guess.byId.useQuery({
    id: selectedGuessId,
  });

  const { updateOrg } = useOptimisticOrgMutation();
  const setSelectedGuessId = useCallback(() => {
    if (!selectedGuess?.id) {
      throw new Error("selectedGuess not found while setting selected");
    }
    if (!nextGuessId) {
      throw new Error("nextGuessId not found while setting selected");
    }
    updateOrg({
      id: selectedGuess?.orgId,
      data: { selectedGuessId: nextGuessId },
    });
  }, [selectedGuess?.id, nextGuessId]);

  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  const selectedGuessHasActiveCalls =
    selectedGuess?.phoneCalls.some((call) => call.state !== "Terminated") ??
    false;
  const selectedGuessHasCalls = selectedGuess?.phoneCalls.length || false;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (selectedGuessHasActiveCalls) {
      setLocked(false);
      return;
    }

    if (selectedGuessHasCalls) {
      setSelectedGuessId();
      setLocked(true);
    }
  }, [
    enabled,
    selectedGuessHasActiveCalls,
    selectedGuessHasCalls,
    setSelectedGuessId,
  ]);

  return (
    <>
      <div>{enabled ? "enabled" : "disabled"}</div>
      {!enabled ? (
        <Button onClick={() => setEnabled(true)}>enbale</Button>
      ) : (
        <Button onClick={() => setEnabled(false)}>disable</Button>
      )}
    </>
  );
};
