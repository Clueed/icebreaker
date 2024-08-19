"use client";

import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CONNECT_STATUS, useSIPProvider } from "react-sipjs";
import { z } from "zod";

import type { RouterOutputs } from "@acme/api";
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

import { SipStatus } from "~/app/@caller/_components/register-sip/sip-status";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(2),
});

function RegisterSip({
  remoteCredentials,
}: {
  remoteCredentials: AppRouterOutputs["sipCredentials"]["get"];
}) {
  const { connectAndRegister, connectStatus } = useSIPProvider();

  const [connectingToastId, setConnectingToastId] = useState<string | number>();
  const connected = connectStatus === CONNECT_STATUS.CONNECTED;
  const disconnected = connectStatus === CONNECT_STATUS.DISCONNECTED;
  const notConnected = connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT;

  useEffect(() => {
    if (connectingToastId) {
      toast.dismiss(connectingToastId);
    }
    if (connected) {
      toast.success("SIP connected");
    }
    if (disconnected) {
      toast.error("SIP disconnected");
    }
  }, [connected, disconnected]);

  useEffect(() => {
    if (
      remoteCredentials?.username &&
      remoteCredentials.password &&
      connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT
    ) {
      const toastid = toast.loading("Connecting with remote credentials...");
      setConnectingToastId(toastid);
      connectAndRegister(remoteCredentials);
    }
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: remoteCredentials,
  });

  const { mutate: setRemoteCredentials } = api.sipCredentials.set.useMutation();

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    connectAndRegister(data);
    setRemoteCredentials(data);
  };

  if (connectStatus === CONNECT_STATUS.CONNECTED) {
    return <SipStatus />;
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export default RegisterSip;
