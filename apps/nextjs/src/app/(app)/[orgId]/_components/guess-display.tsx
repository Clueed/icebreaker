import { forwardRef } from "react";

import type { RouterOutputs } from "@icebreaker/api";
import { cn } from "@icebreaker/ui";
import { getHighestRated } from "@icebreaker/validators/phone-call-rating";

import { RatingEffect } from "~/app/(app)/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const GuessDisplay = ({
  guess,
}: {
  guess: RouterOutputs["guess"]["byId"];
}) => {
  const highestRating = getHighestRated(guess.phoneCallRating);

  const hasCalls = guess.phoneCallCount > 0;

  return (
    <div className="grid grid-cols-[repeat(3,auto)] items-center justify-start gap-x-4 px-8 py-2">
      <div
        className={cn("w-[4ch] transition-opacity", !hasCalls && "opacity-0")}
      >
        {guess.phoneCallCount}x
      </div>
      <div
        className={cn("text-xl transition-opacity", !hasCalls && "opacity-0")}
      >
        <RatingEffect rating={highestRating}>
          <RatingIcon rating={highestRating} className={cn("size-[1.25cap]")} />
        </RatingEffect>
      </div>
      <div className="flex h-full items-center justify-between gap-3">
        {" "}
        <div className="text-xl">
          <span className={"opacity-50"}>{guess.phoneNumber.base} - </span>
          {guess.phoneNumber.extension}
        </div>
      </div>
    </div>
  );
};
