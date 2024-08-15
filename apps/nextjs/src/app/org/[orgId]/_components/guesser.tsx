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
  const { data: org } = api.org.byId.useQuery({
    id: orgId,
  });
  const { selectedGuessId } = org ?? {};

  const { data: currentGuess } = api.guess.byId.useQuery(
    selectedGuessId ? { id: selectedGuessId } : skipToken,
  );

  const { startCall } = useCurrentPhoneCall();

  return (
    <>
      {selectedGuessId && (
        <NextPhoneNumberSelector
          orgId={orgId}
          selectedGuessId={selectedGuessId}
        />
      )}

      {/* <Suspense fallback={<div>loading...</div>}>
        <GuessHistory orgId={orgId} setSelectedGuessId={setSelectedGuessId} />
      </Suspense> */}
      <AddNewGuessForm
        setCurrentGuessId={setSelectedGuessId}
        currentOrgId={orgId}
      />
    </>
  );
};
