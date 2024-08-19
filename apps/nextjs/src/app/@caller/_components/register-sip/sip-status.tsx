"use client";

import { CONNECT_STATUS, useSIPProvider } from "react-sipjs";

import { Badge } from "@acme/ui/badge";

export const SipStatus = () => {
  const { connectStatus } = useSIPProvider();

  const connected = connectStatus === CONNECT_STATUS.CONNECTED;
  const disconnected = connectStatus === CONNECT_STATUS.DISCONNECTED;
  const notConnected = connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT;

  if (!connectStatus) {
    return null;
  }

  return (
    <Badge variant={connected ? "secondary" : "destructive"}>
      SIP{" "}
      {connected
        ? "connected"
        : disconnected
          ? "disconnected"
          : "not connected"}
    </Badge>
  );
};
