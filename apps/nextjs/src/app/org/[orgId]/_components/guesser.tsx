"use client";

import { Suspense } from "react";
import { skipToken } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";
import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
import { GuessHistory } from "~/app/org/[orgId]/_components/guess-histroy";
import { NextPhoneNumberSelector } from "~/app/org/[orgId]/_components/next-phone-number-selector";
import { api } from "~/trpc/react";

export const Guesser = ({ orgId }: { orgId: string }) => {
  const { updateOrg } = useOptimisticOrgMutation();
  function setSelectedGuessId(guessId: string): void {
    updateOrg({ id: orgId, data: { selectedGuessId: guessId } });
  }
  const [{ selectedGuessId }] = api.org.byId.useSuspenseQuery({
    id: orgId,
  });

  const { data: currentGuess } = api.guess.byId.useQuery(
    selectedGuessId ? { id: selectedGuessId } : skipToken,
  );

  const { startCall } = useCurrentPhoneCall();

  return (
    <>
      {currentGuess && (
        <Suspense fallback={<div>loading...</div>}>
          <NextPhoneNumberSelector
            orgId={orgId}
            phoneNumber={currentGuess.phoneNumber}
          />
        </Suspense>
      )}
      {currentGuess && (
        <div className="flex border-2 p-4">
          <div>
            <h2>current guess</h2>
            <div className="flex gap-1">
              <div>{currentGuess?.phoneNumber.base}</div>-
              <div>{currentGuess?.phoneNumber.extension}</div>
            </div>
          </div>
          <Button
            onClick={() =>
              startCall({
                guessId: currentGuess.id,
                phoneNumber: currentGuess.phoneNumber,
              })
            }
          >
            start call
          </Button>
        </div>
      )}
      <Suspense fallback={<div>loading...</div>}>
        <GuessHistory orgId={orgId} setSelectedGuessId={setSelectedGuessId} />
      </Suspense>
      <AddNewGuessForm
        setCurrentGuessId={setSelectedGuessId}
        currentOrgId={orgId}
      />
    </>
  );
};
