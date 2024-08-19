"use client";

import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
import GuesserStrategySelector from "~/app/org/[orgId]/_components/guesser-strategy-selector";
import { NextPhoneNumberSelector } from "~/app/org/[orgId]/_components/next-phone-number-selector";

export const Guesser = ({ orgId }: { orgId: string }) => {
  return (
    <>
      <NextPhoneNumberSelector orgId={orgId} />

      <GuesserStrategySelector
        orgId={orgId}
        onApplyExtensionStrategyOnce={() => {}}
      />

      <AddNewGuessForm orgId={orgId} />
    </>
  );
};
