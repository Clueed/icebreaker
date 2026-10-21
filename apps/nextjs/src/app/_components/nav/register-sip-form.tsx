"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSIPProvider } from "@icebreaker/sip";
import { Button } from "@icebreaker/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@icebreaker/ui/form";
import { Input } from "@icebreaker/ui/input";

import { api } from "~/trpc/react";

const FormSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(2),
});

export const RegisterSipForm = () => {
  const { connectAndRegister } = useSIPProvider();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: "", password: "" },
  });

  const { mutate: setRemoteCredentials } = api.sipCredentials.set.useMutation();

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    connectAndRegister(data);
    setRemoteCredentials(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Input type="password" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};
