import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import React from "react";

export function CallInfo({
  phoneCall,
}: {
  phoneCall: AppRouterOutputs["phoneCall"]["byId"];
}) {
  return (
    <div>
      <div>state: {phoneCall.state}</div>
    </div>
  );
}
