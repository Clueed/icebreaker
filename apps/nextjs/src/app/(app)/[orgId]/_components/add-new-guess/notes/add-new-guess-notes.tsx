"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Trash } from "lucide-react";

import { Button } from "@icebreaker/ui/button";
import { CardDescription, CardTitle } from "@icebreaker/ui/card";
import { Skeleton } from "@icebreaker/ui/skeleton";

import {
  useNotesQuery,
  useResetNotesMutation,
} from "~/app/_api-hooks/use-notes";
import { AddNewGuessNotesForm } from "~/app/(app)/[orgId]/_components/add-new-guess/notes/add-new-guess-notes-form";
import { AddNewGuessNotesGrouped } from "~/app/(app)/[orgId]/_components/add-new-guess/notes/add-new-guess-notes-grouped";

export const AddNewGuessNotes = (props: {
  orgId: string;
  onSubmit: () => void;
}) => {
  // Notes
  const {
    data: notes,
    isLoading,
    isSuccess,
  } = useNotesQuery({ orgId: props.orgId });

  const { mutate: resetNotes } = useResetNotesMutation();
  const handleResetNotes = () => {
    resetNotes({
      orgId: props.orgId,
    });
  };

  const [parent] = useAutoAnimate();
  return (
    <div className="space-y-8">
      <div>
        <CardTitle className="flex items-center justify-between gap-5">
          <div>notes</div>
          <div>
            <Button size={"icon"} variant={"ghost"} onClick={handleResetNotes}>
              <Trash />
            </Button>
            {/* <NotesSearchApollo
              addNewNote={handleAddNewNoteFromSearch}
              organisationName={organisationName}
            /> */}
          </div>
        </CardTitle>
        <CardDescription className="">
          infer base and extension from unstructured phone numbers
        </CardDescription>
      </div>
      <AddNewGuessNotesForm orgId={props.orgId} />
      <div className="flex h-full flex-col justify-between" ref={parent}>
        {isLoading && <Skeleton className="h-52 w-full" />}
        {isSuccess && (
          <>
            <AddNewGuessNotesGrouped
              notes={notes}
              onSubmit={props.onSubmit}
              orgId={props.orgId}
            />

            <div>
              <CardDescription className="mb-2 mt-4">raw notes</CardDescription>
              <p className="min-h-20 columns-2 space-y-1.5 text-sm">
                {notes.map((note, index) => (
                  <div key={note + index} className="flex gap-2">
                    <div className="w-[2ch] text-right text-muted-foreground">
                      {index + 1}
                    </div>{" "}
                    <div className={""}>{note}</div>
                  </div>
                ))}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
