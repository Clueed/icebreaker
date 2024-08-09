import React from "react";

import { api } from "~/trpc/react";

export function CallInfo({ callId }: { callId: string }) {
  const [phoneCall] = api.phoneCall.byId.useSuspenseQuery({
    id: callId,
  });

  return (
    <div>
      <div>state: {phoneCall.state}</div>
    </div>
  );
}
