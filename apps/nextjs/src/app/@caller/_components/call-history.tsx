"use client";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";

export const CallHistory = () => {
  // TODO: make infinite
  const [calls] = api.phoneCall.all.useSuspenseQuery();
  return (
    <div className="space-y-2">
      {calls.map((call) => (
        <HistoryCall key={call.id} call={call} />
      ))}
    </div>
  );
};

const HistoryCall = ({
  call,
}: {
  call: RouterOutputs["phoneCall"]["all"][number];
}) => {
  return (
    <div className="border-2 p-4">
      {call.guess.phoneNumber.base}-{call.guess.phoneNumber.extension}
    </div>
  );
};
