"use client";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
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

  return (
    <>
      {selectedGuessId && (
        <NextPhoneNumberSelector
          orgId={orgId}
          selectedGuessId={selectedGuessId}
        />
      )}

      <AddNewGuessForm
        setCurrentGuessId={setSelectedGuessId}
        currentOrgId={orgId}
      />
    </>
  );
};
