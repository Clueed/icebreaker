import type { z } from "zod";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@icebreaker/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@icebreaker/ui/form";
import { Input } from "@icebreaker/ui/input";
import { phoneNumberSchema } from "@icebreaker/validators/phone-number";

import { useCreateGuess } from "~/app/_api-hooks/use-create-guess";
import {
  useSelectedGuessIdSetQuery,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";

const FormSchema = phoneNumberSchema;

export function AddNewGuessForm({ orgId }: { orgId: string }) {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: selectedGuess?.phoneNumber,
  });

  const { setValue } = form;

  useEffect(() => {
    if (selectedGuess) {
      setValue("base", selectedGuess.phoneNumber.base);
      setValue("extension", selectedGuess.phoneNumber.extension);
    }
  }, [setValue, selectedGuess]);

  const { createGuess } = useCreateGuess();
  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();
  const onSubmit = async ({ base, extension }: z.infer<typeof FormSchema>) => {
    const newGuess = await createGuess({
      orgId: orgId,
      phoneNumber: {
        base,
        extension,
      },
    });
    setSelectedGuessIdMutation.mutate({
      orgId: orgId,
      data: { selectedGuessId: newGuess.id },
    });
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
