"use client";

import type { RouterOutputs } from "@acme/api";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";

import { api } from "~/trpc/react";

export const CallHistory = () => {
  // TODO: make infinite
  const { data: calls = [], isFetching } = api.phoneCall.all.useQuery({
    active: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
      </CardHeader>
      <CardContent className="h-96 space-y-2 overflow-y-auto">
        {calls.map((call) => (
          <HistoryCall key={call.id} call={call} />
        ))}
      </CardContent>
    </Card>
  );
};

const HistoryCall = ({
  call,
}: {
  call: RouterOutputs["phoneCall"]["all"][number];
}) => {
  const { base, extension } = call.phoneNumber;
  const lastModified = new Date(
    call.updatedAt ?? call.createdAt,
  ).toLocaleTimeString();

  return (
    <div className="flex w-full justify-between gap-2 rounded bg-muted p-2">
      <div>
        <PhoneNumberDisplay phoneNumber={call.phoneNumber} />
      </div>
      <div className="text-sm">{lastModified}</div>
    </div>
  );
};
