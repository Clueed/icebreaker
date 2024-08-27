import { forwardRef } from "react";

import type { RouterOutputs } from "@icebreaker/api";
import type { PhoneCallRating } from "@icebreaker/db/schema";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { PhoneNumberDisplay } from "@icebreaker/ui/custom/phone-number-display";
import { PhoneCallIcon } from "@icebreaker/ui/icons";

import { useSelectedGuessIdSetQuery } from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { RatingIcon } from "~/app/@caller/_components/rating-icon";

export const GuessDisplay = forwardRef<
  HTMLDivElement,
  { guess: RouterOutputs["guess"]["byId"]; selected: boolean }
>(({ guess, selected }, ref) => {
  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();
  function handleOnClick(): void {
    setSelectedGuessIdMutation.mutate({
      orgId: guess.orgId,
      data: { selectedGuessId: guess.id },
    });
  }

  const [startCall] = useStartCall({ guessId: guess.id });

  return (
    <div ref={ref} className="grid grid-cols-[auto,5rem] items-center gap-4">
      <button
        onClick={handleOnClick}
        className={cn(
          "rounded-md px-8 transition-all",
          "h-12",
          selected && "h-16 border-[1px] border-primary",
          !selected && "hover:bg-muted/50",
        )}
      >
        <div className="flex h-full max-w-sm items-center justify-between gap-3">
          {" "}
          <PhoneNumberDisplay phoneNumber={guess.phoneNumber} />
          <div>{guess.phoneCallCount > 0 && `${guess.phoneCallCount}x`}</div>
          <div>
            {guess.phoneCallCount > 0 && guess.phoneCallRating.length > 0 && (
              <RatingIcon
                className="size-[1.3cap]"
                rating={getHighestRated(guess.phoneCallRating)}
              />
            )}
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

const phoneCallRatingList = [
  null,
  "answered",
  "voicemail",
  "person",
  "jackpot",
] as const;

function getHighestRated(ratings: PhoneCallRating[]): PhoneCallRating {
  return ratings.reduce((highest, rating) => {
    return phoneCallRatingList.indexOf(rating) >
      phoneCallRatingList.indexOf(highest)
      ? rating
      : highest;
  }, null);
}
