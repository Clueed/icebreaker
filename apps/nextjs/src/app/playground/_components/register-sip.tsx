"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CONNECT_STATUS, useSIPProvider } from "react-sipjs";
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

import { api } from "~/trpc/react";

const FormSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(2),
});

function RegisterSip({ userId }: { userId: string }) {
  const [remoteCredentials] = api.sipCredentials.get.useSuspenseQuery({
    userId,
  });
  const { connectAndRegister, connectStatus } = useSIPProvider();
  const [remoteCredentialsAttempted, setRemoteCredentialsAttempted] =
    React.useState(false);

  if (
    remoteCredentialsAttempted &&
    remoteCredentials &&
    connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT
  ) {
    toast("Connecting to SIP with remote saved credentials");
    connectAndRegister(remoteCredentials);
    setRemoteCredentialsAttempted(true);
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate: setRemoteCredentials } = api.sipCredentials.set.useMutation(
    {},
  );

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    connectAndRegister(data);
    setRemoteCredentials({ userId, ...data });
  };

  if (connectStatus === CONNECT_STATUS.CONNECTED) {
    return null;
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
                <Input placeholder="shadcn" {...field} />
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
