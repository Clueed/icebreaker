import { useAutoAnimate } from "@formkit/auto-animate/react";

import type { PhoneNumber } from "@icebreaker/validators/phone-number";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { CardDescription } from "@icebreaker/ui/card";

import { useCreateSelectedGuess } from "~/app/_api-hooks/use-create-guess";
import { getSimilarNotes } from "~/app/org/[orgId]/_components/add-new-guess/notes/add-new-guess-notes-helpers";

export const AddNewGuessNotesGrouped = (props: {
  orgId: string;
  notes: string[];
  onSubmit: () => void;
}) => {
  const similarList = getSimilarNotes(props.notes);
  const [parent] = useAutoAnimate();

  const { mutate: createSelectedGuess, isPending } = useCreateSelectedGuess({
    onSucess: props.onSubmit,
  });

  const handleOnClick = (phoneNumber: PhoneNumber) => {
    void createSelectedGuess({
      orgId: props.orgId,
      phoneNumber,
    });
  };

  return (
    <div>
      <CardDescription className="mb-2">groups</CardDescription>
      <div
        className="flex min-h-20 items-start gap-4 overflow-x-auto pb-3"
        ref={parent}
      >
        {similarList.map(([base, extensions]) => (
          <SimilarityGroup
            key={base}
            base={base}
            extensions={extensions}
            onClick={handleOnClick}
            disabled={isPending}
          />
        ))}
      </div>
    </div>
  );
};

const SimilarityGroup = ({
  base,
  extensions,
  onClick,
  disabled,
}: {
  base: string;
  extensions: string[];
  onClick: (phoneNumber: PhoneNumber) => void;
  disabled: boolean;
}) => {
  const [parent] = useAutoAnimate();
  return (
    <div ref={parent}>
      {extensions.map((extension) => (
        <div key={extension}>
          <Button
            key={extension}
            variant={"ghost"}
            aria-label="use as next guess"
            className="gap-2 font-light"
            disabled={disabled}
            onClick={() =>
              onClick({
                base: base,
                extension: extension,
              })
            }
          >
            <div className={cn("text-muted-foreground")}>{base}</div>
            <div>{extension}</div>
          </Button>
        </div>
      ))}
    </div>
  );
};
