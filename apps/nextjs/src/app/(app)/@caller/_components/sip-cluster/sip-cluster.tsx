"use client";

import React, { useEffect, useState } from "react";

import { CONNECT_STATUS, useSIPProvider } from "@icebreaker/sip";
import { Button } from "@icebreaker/ui/button";
import { DotIcon, WifiIcon, WifiOffIcon } from "@icebreaker/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";
import { toast } from "@icebreaker/ui/toast";

import { RegisterSipForm } from "~/app/(app)/@caller/_components/sip-cluster/register-sip-form";
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
        <PopoverTrigger className="ml-auto" asChild>
          <Button
            variant={connected ? "ghost" : "destructive"}
            className="inline-flex items-center gap-x-2 [&>svg]:size-[1.65cap]"
          >
            SIP{" "}
            <span className="sr-only">
              {connected
                ? "connected"
                : disconnected
                  ? "disconnected"
                  : "not connected"}
            </span>
            {connected ? (
              <WifiIcon />
            ) : disconnected ? (
              <WifiOffIcon />
            ) : (
              <DotIcon />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <RegisterSipForm />
        </PopoverContent>
      </Popover>
    </div>
  );
};
