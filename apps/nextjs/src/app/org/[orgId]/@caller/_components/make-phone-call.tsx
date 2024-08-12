"use client";

import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";
import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSIPProvider } from "react-sipjs";
import { z } from "zod";

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

export function MakePhoneCall({ currentCallId }: { currentCallId: string }) {
  const [phoneCall] = api.phoneCall.byId.useSuspenseQuery({
    id: currentCallId,
  });

  const phoneCallActive =
    phoneCall && !["Terminated", "Terminating"].includes(phoneCall.state);
  const { startCall, endCall } = usePhoneCall();

  return (
    <div>
      <div>
        {phoneCall.guess.phoneNumber.base}-
        {phoneCall.guess.phoneNumber.extension}
      </div>
      {currentCallId && phoneCallActive ? (
        <Button onClick={endCall}>Hangup</Button>
      ) : (
        <Button onClick={startCall}>Make Call</Button>
      )}
      {currentCallId && <CallInfo callId={currentCallId} />}
    </div>
  );
}
