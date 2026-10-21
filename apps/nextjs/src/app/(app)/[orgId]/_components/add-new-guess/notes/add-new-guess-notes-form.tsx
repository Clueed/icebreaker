"use client";

import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@icebreaker/ui";
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
import { toast } from "@icebreaker/ui/toast";

import { useAddNoteMutation } from "~/app/_api-hooks/use-notes";

const formSchema = z.object({
  phoneNumberString: z.string().min(3),
});

export const AddNewGuessNotesForm = (props: { orgId: string }) => {
  const { mutate: addNote, isPending } = useAddNoteMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { phoneNumberString: "" },
    disabled: isPending,
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    addNote(
      {
        orgId: props.orgId,
        note: data.phoneNumberString,
      },
      {
        onSuccess: () => {
          form.reset();
        },
        onError(error) {
          form.setError("root", {
            message: error.message,
          });
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="phoneNumberString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>phone number</FormLabel>
              <div className="flex gap-4">
                <FormControl>
                  <Input {...field} placeholder="+49 (0) 44234 - 51234" />
                </FormControl>
                <div>
                  <Button
                    size={"icon-lg"}
                    variant={"secondary"}
                    type="submit"
                    disabled={
                      !form.formState.isDirty ||
                      !form.formState.isValid ||
                      isPending
                    }
                  >
                    <Plus className={cn(isPending && "animate-spin")} />
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
