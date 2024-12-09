"use client";

import type { AppRouterInputs } from "node_modules/@icebreaker/api/dist/root";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@icebreaker/ui/button";
import { CardContent, CardHeader, CardTitle } from "@icebreaker/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@icebreaker/ui/form";
import { Input } from "@icebreaker/ui/input";
import { toast } from "@icebreaker/ui/toast";

import { api } from "~/trpc/react";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
});

export function CreateOrgForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const utils = api.useUtils();
  const { mutateAsync: createOrg } = api.org.create.useMutation({
    onSuccess: (org) => {
      toast("org created");
      void utils.org.all.invalidate();
      void utils.org.byId.invalidate({ id: org.id });
    },
    onError: (error) => {
      toast("error creating org: " + error.message);
    },
  });

  // TODO: move to server action
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push } = useRouter();
  const onSubmit = async (args: AppRouterInputs["org"]["create"]) => {
    const newOrg = await createOrg(args);
    push(`/${newOrg.id}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <CardHeader>
          <CardTitle>add new org</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>name</FormLabel>
                <FormControl>
                  <Input placeholder="Saudi Aramco" {...field} />
                </FormControl>
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isDirty || !form.formState.isValid}
          >
            add
          </Button>
        </CardContent>
      </form>
    </Form>
  );
}
