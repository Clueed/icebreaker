"use client";

import { skipToken } from "@tanstack/react-query";

import type { Strategy } from "@acme/validators/guessing-strategies";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import {
  useCurrentStrategyQuery,
  useCurrentStrategySetMutation,
} from "~/app/_api-hooks/use-current-strategy";
import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
import GuesserStrategySelector from "~/app/org/[orgId]/_components/guesser-strategy-selector";
import { NextPhoneNumberSelector } from "~/app/org/[orgId]/_components/next-phone-number-selector";
import { api } from "~/trpc/react";

export const Guesser = ({ orgId }: { orgId: string }) => {
  const { updateOrg } = useOptimisticOrgMutation();
  function setSelectedGuessId(guessId: string): void {
    updateOrg({ id: orgId, data: { selectedGuessId: guessId } });
  }
  const { data: org } = api.org.byId.useQuery({
    id: orgId,
  });
  const { selectedGuessId } = org ?? {};
  const { data: selectedGuess } = api.guess.byId.useQuery(
    selectedGuessId ? { id: selectedGuessId } : skipToken,
  );

  const { data: currentStrategy } = useCurrentStrategyQuery({
    id: orgId,
  });

  const { mutate: setCurrentStrategy } = useCurrentStrategySetMutation();

  const handleSetCurrentStrategy = (strategy: Strategy) => {
    setCurrentStrategy({ id: orgId, data: { currentStrategy: strategy } });
  };

  return (
    <>
      {selectedGuessId && currentStrategy && (
        <NextPhoneNumberSelector
          orgId={orgId}
          selectedGuessId={selectedGuessId}
          strategy={currentStrategy}
        />
      )}
      {selectedGuess && selectedGuessId && currentStrategy && (
        <>
          <GuesserStrategySelector
            currentPhoneNumber={selectedGuess.phoneNumber}
            currentExtensionStrategy={currentStrategy}
            onExtensionStrategyChange={handleSetCurrentStrategy}
            onApplyExtensionStrategyOnce={() => {}}
          />
        </>
      )}

      <AddNewGuessForm
        setCurrentGuessId={setSelectedGuessId}
        currentOrgId={orgId}
      />
    </>
  );
};
