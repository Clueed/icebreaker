import React, { use } from "react";

import { AddNewGuess } from "~/app/(app)/[orgId]/_components/add-new-guess/add-new-guess";
import { GuessHistory } from "~/app/(app)/[orgId]/_components/guess-history";
import { GuessStats } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats";
import NextPhoneNumberSelector from "~/app/(app)/[orgId]/_components/next-phone-number-selector";
import GuesserStrategySelector from "~/app/(app)/[orgId]/_components/strategy-selector.tsx/strategy-selector";
import { api } from "~/trpc/server";

const GuesserPage = (props: { params: Promise<{ orgId: string }> }) => {
  const params = use(props.params);
  const org = use(api.org.byId({ id: params.orgId }));
  return (
    <div className="space-y-16">
      <h1 className="text-center font-[50] text-muted-foreground">
        {org.name}
      </h1>
      <div className="mx-auto flex justify-center gap-16">
        <div className="space-y-8">
          <GuesserStrategySelector
            orgId={params.orgId}
            // onApplyExtensionStrategyOnce={() => {}}
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
};

export default GuesserPage;
