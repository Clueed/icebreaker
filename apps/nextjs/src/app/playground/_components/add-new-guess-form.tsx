"use client";

import type { AppRouterInputs } from "node_modules/@acme/api/dist/root";
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
  base: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  extension: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
});

export function AddNewGuessForm({
  currentOrgId,
  setCurrentGuessId,
}: {
  currentOrgId: string;
  setCurrentGuessId: (guessId: string) => void;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      base: "",
      extension: "",
    },
  });

  const utils = api.useUtils();
  const { mutateAsync: createOrg } = api.guess.create.useMutation({
    onSuccess: async (guess) => {
      toast("guess created");
      await utils.guess.all.invalidate();
      await utils.guess.byId.invalidate({ id: guess.id });
    },
    onError: (error) => {
      toast("error creating org: " + error.message);
    },
  });

  const onSubmit = async ({ base, extension }: z.infer<typeof FormSchema>) => {
    const newGuess = await createOrg({
      orgId: currentOrgId,
      phoneNumber: {
        base,
        extension,
      },
    });
    setCurrentGuessId(newGuess.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="base"
          render={({ field }) => (
            <FormItem>
              <FormLabel>base</FormLabel>
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
          name="extension"
          render={({ field }) => (
            <FormItem>
              <FormLabel>extension</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
