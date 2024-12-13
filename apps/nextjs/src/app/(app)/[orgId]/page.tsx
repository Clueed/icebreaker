import React, { use } from "react";

import { Card, CardContent, CardHeader } from "@icebreaker/ui/card";

import { AddNewGuess } from "~/app/(app)/[orgId]/_components/add-new-guess/add-new-guess";
import { GuessHistory } from "~/app/(app)/[orgId]/_components/guess-history";
import { GuessStats } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats";
import NextPhoneNumberSelector from "~/app/(app)/[orgId]/_components/next-phone-number-selector";
import GuesserStrategySelector from "~/app/(app)/[orgId]/_components/strategy-selector.tsx/strategy-selector";
import { Todos } from "~/app/(app)/[orgId]/_components/todos/todos";
import { api } from "~/trpc/server";

const GuesserPage = (props: { params: Promise<{ orgId: string }> }) => {
  const params = use(props.params);
  const org = use(api.org.byId({ id: params.orgId }));
  return (
    <div className="space-y-16">
      <div className="mx-auto grid grid-cols-[auto_auto] gap-16">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-medium">{org.name}</h1>
          </CardHeader>
          <CardContent>
            <Todos orgId={params.orgId} />
          </CardContent>
        </Card>
        <div className="row-span-2">
          <NextPhoneNumberSelector orgId={params.orgId} />
        </div>{" "}
        <div className="space-y-8">
          <GuesserStrategySelector
            orgId={params.orgId}
            // onApplyExtensionStrategyOnce={() => {}}
          />
          <AddNewGuess orgId={params.orgId} />
        </div>
      </div>

      <GuessHistory orgId={params.orgId} />
      <GuessStats orgId={params.orgId} />
    </div>
  );
};

export default GuesserPage;
