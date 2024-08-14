"use client";

import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "node_modules/@acme/api/dist/root";
import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSIPProvider } from "react-sipjs";
import { z } from "zod";

import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { CallInfo } from "~/app/org/[orgId]/@caller/_components/call-info";
import { usePhoneCall } from "~/app/org/[orgId]/@caller/_components/current-call";
import { api } from "~/trpc/react";

export function MakePhoneCall({
  phoneCall,
  startCall,
  endCall,
}: {
  phoneCall: AppRouterOutputs["phoneCall"]["byId"];
  startCall: ({
    guessId,
    phoneNumber,
  }: {
    guessId: string;
    phoneNumber: NotEmptyPhoneNumber;
  }) => Promise<void>;
  endCall: () => Promise<void>;
}) {
  const phoneCallActive =
    phoneCall && !["Terminated", "Terminating"].includes(phoneCall.state);

  console.log("phoneCall.state", phoneCall.state);

  return (
    <div>
      <div>
        {phoneCall.guess.phoneNumber.base}-
        {phoneCall.guess.phoneNumber.extension}
      </div>
      {phoneCallActive ? (
        <Button onClick={endCall}>Hangup</Button>
      ) : (
        <Button
          onClick={() =>
            startCall({
              guessId: phoneCall.guess.id,
              phoneNumber: phoneCall.guess.phoneNumber,
            })
          }
        >
          Make Call
        </Button>
      )}
      {<CallInfo callId={phoneCall.id} />}
    </div>
  );
}
