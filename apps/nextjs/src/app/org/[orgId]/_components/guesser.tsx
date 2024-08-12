"use client";

import { skipToken } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
import { api } from "~/trpc/react";

export const Guesser = ({ orgId }: { orgId: string }) => {
  const utils = api.useUtils();
  const { mutate: updateOrg } = api.org.update.useMutation({
    onSettled: async () => {
      await utils.org.all.invalidate();
      await utils.org.byId.invalidate({ id: orgId });
    },
    onError: (error) => {
      toast.error("error updating org: " + error.message);
    },
  });
  function setSelectedGuessId(guessId: string): void {
    updateOrg({ id: orgId, data: { selectedGuessId: guessId } });
  }
  const [{ selectedGuessId }] = api.org.byId.useSuspenseQuery({
    id: orgId,
  });

  const { data: currentGuess } = api.guess.byId.useQuery(
    selectedGuessId ? { id: selectedGuessId } : skipToken,
  );

  return (
    <>
      {currentGuess && (
        <div className="flex border-2 p-4">
          <div>
            <h2>current guess</h2>
            <div className="flex gap-1">
              <div>{currentGuess?.phoneNumber.base}</div>-
              <div>{currentGuess?.phoneNumber.extension}</div>
            </div>
          </div>
        </div>
      )}
      <AddNewGuessForm
        setCurrentGuessId={setSelectedGuessId}
        currentOrgId={orgId}
      />
    </>
  );
};
