"use client";

import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
import { GuessHistory } from "~/app/org/[orgId]/_components/guess-history";
import NextPhoneNumberSelector from "~/app/org/[orgId]/_components/next-phone-number-selector";
import GuesserStrategySelector from "~/app/org/[orgId]/_components/strategy-selector.tsx/strategy-selector";

export const Guesser = ({ orgId }: { orgId: string }) => {
  return (
    <div className="grid gap-4">
      <NextPhoneNumberSelector orgId={orgId} />

      <GuesserStrategySelector
        orgId={orgId}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onApplyExtensionStrategyOnce={() => {}}
      />

      <AddNewGuessForm orgId={orgId} />
      <GuessHistory orgId={orgId} />
    </div>
  );
};
