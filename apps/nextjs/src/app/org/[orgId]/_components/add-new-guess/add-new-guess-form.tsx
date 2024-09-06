import type { SubmitHandler } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@icebreaker/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@icebreaker/ui/form";
import { Loader2Icon } from "@icebreaker/ui/icons";
import { Input } from "@icebreaker/ui/input";
import { phoneNumberSchema } from "@icebreaker/validators/phone-number";

import { useCreateSelectedGuess } from "~/app/_api-hooks/use-create-guess";
import { useSelectedGuessQuery } from "~/app/_api-hooks/use-selected-guess";

const FormSchema = phoneNumberSchema;

export const AddNewGuessForm = (props: {
  orgId: string;
  onSubmit: () => void;
}) => {
  const { mutate: createSelectedGuess, isPending } = useCreateSelectedGuess({
    onSucess: props.onSubmit,
  });

  const { data: selectedGuess } = useSelectedGuessQuery({ id: props.orgId });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: selectedGuess?.phoneNumber,
    disabled: isPending,
    mode: "onChange",
  });

  const handleOnSubmit: SubmitHandler<z.infer<typeof FormSchema>> = (data) => {
    void createSelectedGuess({
      orgId: props.orgId,
      phoneNumber: data,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="base"
            render={({ field }) => (
              <FormItem className="w-full basis-3/5">
                <FormLabel className="text-right">base</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+49442345"
                    className="text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extension"
            render={({ field }) => (
              <FormItem className="w-full basis-2/5">
                <FormLabel>extension</FormLabel>
                <FormControl>
                  <Input placeholder="1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            !form.formState.isDirty || !form.formState.isValid || isPending
          }
        >
          {!isPending ? "create" : <Loader2Icon className="animate-spin" />}
        </Button>
      </form>
    </Form>
  );
};
