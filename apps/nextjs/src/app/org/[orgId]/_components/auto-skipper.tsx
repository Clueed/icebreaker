import { useCallback, useEffect, useState } from "react";

import { Button } from "@acme/ui/button";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import {
  useSelectedGuessIdSetQuery,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import { api } from "~/trpc/react";

export const AutoSkipper = ({
  orgId,
  nextGuessId,
}: {
  orgId: string;
  nextGuessId: string | undefined;
}) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });

  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();

  const setSelectedGuessId = useCallback(() => {
    console.debug("[AS] setSelectedGuessId called");

    if (!selectedGuess?.id) {
      throw new Error("[AS]selectedGuess not found while setting selected");
    }

    if (!nextGuessId) {
      throw new Error("[AS]nextGuessId not found while setting selected");
    }

    console.debug("[AS] Updating org with selectedGuessId:", nextGuessId);
    setSelectedGuessIdMutation.mutate({
      orgId: selectedGuess.orgId,
      data: { selectedGuessId: nextGuessId },
    });
  }, [selectedGuess?.id, nextGuessId, setSelectedGuessIdMutation.mutate]);

  const [enabled, setEnabled] = useState(false);

  const selectedGuessHasActiveCalls =
    selectedGuess?.phoneCalls.some((call) => call.state !== "Terminated") ??
    false;
  const selectedGuessHasCalls = selectedGuess?.phoneCalls.length || false;

  useEffect(() => {
    console.debug("[AS] useEffect triggered", {
      enabled,
      selectedGuessHasActiveCalls,
      selectedGuessHasCalls,
    });

    if (!enabled) {
      console.debug("[AS] Auto Skipper is disabled, returning");
      return;
    }

    if (selectedGuessHasActiveCalls) {
      console.debug("[AS] Active calls found, returning");
      return;
    }

    if (selectedGuessHasCalls) {
      console.debug(
        "[AS] No active calls, but calls present. Setting selected guess ID.",
      );
      setSelectedGuessId();
    }
  }, [
    enabled,
    selectedGuessHasActiveCalls,
    selectedGuessHasCalls,
    setSelectedGuessId,
  ]);

  return (
    <div>
      <div>Auto Skipper {enabled ? "enabled" : "disabled"}</div>
      {!enabled ? (
        <Button
          onClick={() => {
            console.debug("[AS] Enabling Auto Skipper");
            setEnabled(true);
          }}
        >
          enable
        </Button>
      ) : (
        <Button
          onClick={() => {
            console.debug("[AS] Disabling Auto Skipper");
            setEnabled(false);
          }}
        >
          disable
        </Button>
      )}
    </div>
  );
};
