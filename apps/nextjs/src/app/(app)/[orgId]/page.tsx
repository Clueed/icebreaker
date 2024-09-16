"use client";

import React from "react";

import { AddNewGuess } from "~/app/(app)/[orgId]/_components/add-new-guess/add-new-guess";
import { GuessHistory } from "~/app/(app)/[orgId]/_components/guess-history";
import { GuessStats } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats";
import NextPhoneNumberSelector from "~/app/(app)/[orgId]/_components/next-phone-number-selector";
import GuesserStrategySelector from "~/app/(app)/[orgId]/_components/strategy-selector.tsx/strategy-selector";

export default function GuesserPage({ params }: { params: { orgId: string } }) {
  return (
    <div className="space-y-16">
      <div className="mx-auto flex justify-center gap-16">
        <div className="space-y-8">
          <GuesserStrategySelector
            orgId={params.orgId}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onApplyExtensionStrategyOnce={() => {}}
          />
          <AddNewGuess orgId={params.orgId} />
        </div>
        <div className="">
          <NextPhoneNumberSelector orgId={params.orgId} />
        </div>
      </div>

      <GuessHistory orgId={params.orgId} />
      <GuessStats orgId={params.orgId} />
    </div>
  );
}
