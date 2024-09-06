import { useState } from "react";

import { Button } from "@icebreaker/ui/button";
import { DiamondPlusIcon } from "@icebreaker/ui/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@icebreaker/ui/sheet";

import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess/add-new-guess-form";
import { AddNewGuessNotes } from "~/app/org/[orgId]/_components/add-new-guess/notes/add-new-guess-notes";

export const AddNewGuess = (props: { orgId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={"ghost"} size={"icon-full"}>
          <DiamondPlusIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex max-h-full flex-col">
        <SheetHeader>
          <SheetTitle>add new guess</SheetTitle>
          <SheetDescription className="sr-only">
            add an initial phone number to get started
          </SheetDescription>
        </SheetHeader>
        <div className="my-8 h-full space-y-16 overflow-y-auto pr-2">
          <AddNewGuessForm
            orgId={props.orgId}
            onSubmit={() => setIsOpen(false)}
          />
          <AddNewGuessNotes
            orgId={props.orgId}
            onSubmit={() => setIsOpen(false)}
          />
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
