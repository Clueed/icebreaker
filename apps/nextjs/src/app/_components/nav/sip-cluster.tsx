"use client";

import React, { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { CONNECT_STATUS, useSIPProvider } from "@icebreaker/sip";
import { Button } from "@icebreaker/ui/button";
import { DotIcon, WifiIcon, WifiOffIcon } from "@icebreaker/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";
import { toast } from "@icebreaker/ui/toast";

import { RegisterSipForm } from "~/app/_components/nav/register-sip-form";
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

  const [animateRef] = useAutoAnimate();
  return (
    <div>
      <Popover>
        <PopoverTrigger className="ml-auto" asChild>
          <Button variant={connected ? "ghost" : "destructive"}>
            SIP{" "}
            <span className="sr-only">
              {connected
                ? "connected"
                : disconnected
                  ? "disconnected"
                  : "not connected"}
            </span>
            <span ref={animateRef} className="[&>svg]:size-[1.65cap]">
              {connected ? (
                <WifiIcon />
              ) : disconnected ? (
                <WifiOffIcon />
              ) : (
                <DotIcon />
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <RegisterSipForm />
        </PopoverContent>
      </Popover>
    </div>
  );
};
