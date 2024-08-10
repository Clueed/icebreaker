"use client";

import { useEffect } from "react";
import { CONNECT_STATUS, useSIPProvider } from "react-sipjs";

import { Badge } from "@acme/ui/badge";
import { toast } from "@acme/ui/toast";

export const SipStatus = () => {
  const { connectStatus } = useSIPProvider();

  const connected = connectStatus === CONNECT_STATUS.CONNECTED;
  const disconnected = connectStatus === CONNECT_STATUS.DISCONNECTED;
  const notConnected = connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT;

  useEffect(() => {
    if (connected) {
      toast.success("SIP connected");
    }
    if (disconnected) {
      toast.error("SIP disconnected");
    }
  }, [connected, disconnected, notConnected]);

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
