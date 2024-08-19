"use client";

import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
});

export function CreateOrgForm({}: {}) {
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
      utils.org.all.invalidate();
      utils.org.byId.invalidate({ id: org.id });
    },
    onError: (error) => {
      toast("error creating org: " + error.message);
    },
  });

  // TODO: move to server action
  const { push } = useRouter();
  const onSubmit = async (args: AppRouterInputs["org"]["create"]) => {
    const newOrg = await createOrg(args);
    push(`/org/${newOrg.id}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
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
