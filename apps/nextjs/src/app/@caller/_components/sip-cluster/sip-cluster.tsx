"use client";

import React, { useEffect, useState } from "react";
import { CONNECT_STATUS, useSIPProvider } from "react-sipjs";

import { Badge } from "@icebreaker/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";
import { toast } from "@icebreaker/ui/toast";

import { RegisterSipForm } from "~/app/@caller/_components/sip-cluster/register-sip-form";
import { api } from "~/trpc/react";

export const SipCluster = () => {
  const { data: remoteCredentials, error } = api.sipCredentials.get.useQuery(
    undefined,
    {
      staleTime: undefined,
    },
  );
  useEffect(() => {
    if (error) {
      toast.error(`Error fetching sip credentials`, {
        description: error.message,
      });
    }
  }, [error]);

  const { connectStatus, connectAndRegister } = useSIPProvider();

  const connected = connectStatus === CONNECT_STATUS.CONNECTED;
  const disconnected = connectStatus === CONNECT_STATUS.DISCONNECTED;
  const notConnected = connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT;

  const [sonnerId, setSonnerId] = useState<string | number>();

  useEffect(() => {
    if (!sonnerId && notConnected && remoteCredentials) {
      const id = toast.loading("Connecting with remote SIP credentials...");
      setSonnerId(id);

      connectAndRegister(remoteCredentials);
    }
    if (connected && sonnerId) {
      toast.dismiss(sonnerId);
      setSonnerId(undefined);
      toast.success("All SIP systems ready", {
        description: "successfully connected with remote credentials",
      });
    }
    if (disconnected && sonnerId) {
      if (sonnerId) {
        toast.dismiss(sonnerId);
        toast.error("Connecting with SIP credentials failed");
        return;
      }

      toast.error("All SIP systems offline");
    }
  }, [
    notConnected,
    remoteCredentials,
    connected,
    disconnected,
    sonnerId,
    connectAndRegister,
  ]);

  return (
    <div>
      <Popover>
        <PopoverTrigger className="w-full">
          <Badge
            variant={connected ? "secondary" : "destructive"}
            className="block w-full text-center"
          >
            SIP{" "}
            {connected
              ? "connected"
              : disconnected
                ? "disconnected"
                : "not connected"}
          </Badge>
        </PopoverTrigger>
        <PopoverContent>
          <RegisterSipForm />
        </PopoverContent>
      </Popover>
    </div>
  );
};
