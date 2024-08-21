import type { z } from "zod";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { phoneNumberSchema } from "@acme/validators/phone-number";

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

  useEffect(() => {
    if (selectedGuess) {
      form.setValue("base", selectedGuess.phoneNumber.base);
      form.setValue("extension", selectedGuess.phoneNumber.extension);
    }
  }, [selectedGuess]);

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
