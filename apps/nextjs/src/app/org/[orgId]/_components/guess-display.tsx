import { forwardRef } from "react";

import type { RouterOutputs } from "@icebreaker/api";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { PhoneCallIcon } from "@icebreaker/ui/icons";
import { getHighestRated } from "@icebreaker/validators/phone-call-rating";

import { useSetSelectedGuessId } from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { RatingEffect } from "~/app/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/@caller/_components/rating-icon";

export const GuessDisplay = forwardRef<
  HTMLDivElement,
  { guess: RouterOutputs["guess"]["byId"]; selected: boolean }
>(({ guess, selected }, ref) => {
  const setSelectedGuessIdMutation = useSetSelectedGuessId();
  function handleOnClick(): void {
    setSelectedGuessIdMutation.mutate({
      orgId: guess.orgId,
      data: { selectedGuessId: guess.id },
    });
  }

  const [startCall] = useStartCall({ guessId: guess.id });

  const highestRating = getHighestRated(guess.phoneCallRating);

  const hasCalls = guess.phoneCallCount > 0;

  return (
    <div ref={ref} className="grid grid-cols-[auto,5rem] items-center gap-4">
      <button
        onClick={handleOnClick}
        className={cn(
          "rounded-md px-8 transition-all",
          "grid grid-cols-[repeat(3,auto)] items-center justify-start gap-x-4",
          selected && "h-16 border-[1px] border-primary",
          !selected && "hover:bg-muted/50",
        )}
      >
        <div className={cn("w-[4ch]", !hasCalls && "opacity-0")}>
          {guess.phoneCallCount}x
        </div>
        <div className={cn("text-xl", !hasCalls && "opacity-0")}>
          <RatingEffect rating={highestRating}>
            <RatingIcon
              rating={highestRating}
              className={cn("size-[1.25cap]")}
            />
          </RatingEffect>
        </div>
        <div className="flex h-full items-center justify-between gap-3">
          {" "}
          <div className="text-xl">
            <span className={"text-muted-foreground"}>
              {guess.phoneNumber.base} -{" "}
            </span>
            {guess.phoneNumber.extension}
          </div>
        </div>
      </button>
      {selected && (
        <Button onClick={startCall} className="" size={"icon-lg"}>
          <PhoneCallIcon />
        </Button>
      )}
    </div>
  );
});
