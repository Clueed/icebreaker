import type { RouterOutputs } from "@icebreaker/api";
import { cn } from "@icebreaker/ui";
import { getHighestRated } from "@icebreaker/validators/phone-call-rating";

import { RatingEffect } from "~/app/(app)/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const GuessDisplay = ({
  guess,
  className,
}: {
  guess: RouterOutputs["guess"]["byId"];
  className?: string;
}) => {
  const highestRating = getHighestRated(guess.phoneCallRating);

  const hasCalls = guess.phoneCallCount > 0;

  return (
    <div
      className={cn("flex items-center justify-start gap-x-3 p-2", className)}
    >
      <div
        className={cn(
          "flex items-center justify-start gap-1 transition-opacity",
          !hasCalls && "opacity-0",
        )}
      >
        <div
          className={cn(
            "text-[0.9em] font-medium leading-none",
            guess.phoneCallCount <= 1 && "opacity-0",
          )}
        >
          {guess.phoneCallCount}
          <span className="text-[0.9em] font-medium leading-none opacity-50">
            x
          </span>
        </div>

        <div>
          <RatingEffect rating={highestRating}>
            <RatingIcon
              rating={highestRating}
              className={cn("size-[1.5cap]")}
            />
          </RatingEffect>
        </div>
      </div>
      <div className="flex h-full flex-grow items-center justify-between gap-3">
        {" "}
        <div className="text-nowrap font-mono font-light">
          <span className={"opacity-50"}>{guess.phoneNumber.base} - </span>
          {guess.phoneNumber.extension}
        </div>
      </div>
    </div>
  );
};
