import type { DurationUnit } from "luxon";
import { DateTime } from "luxon";

import type { RouterOutputs } from "@icebreaker/api";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";
import { CallRatingCluster } from "~/app/@caller/_components/current-call-rating-cluster";
import { RatingIcon } from "~/app/@caller/_components/rating-icon";

export const HistoryCall = ({
  call,
  first = false,
}: {
  call: RouterOutputs["phoneCall"]["history"]["data"][number];
  first: boolean;
}) => {
  const lastModified = DateTime.fromSQL(call.createdAt, {
    zone: "utc",
  });

  const isToday = lastModified.hasSame(DateTime.local(), "day");

  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();

  return (
    <div className={cn("space-y-4 p-4", first && "rounded-md bg-muted/25")}>
      <div className={cn("flex items-center justify-between gap-8")}>
        <div className="min-w-48 text-right text-xl">
          <span className={"text-muted-foreground"}>
            {call.phoneNumber.base} -{" "}
          </span>
          {call.phoneNumber.extension}
        </div>
        {!first && (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size={"icon"}>
                  <RatingIcon rating={call.rating} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <CallRatingCluster
                  rating={call.rating}
                  disabled={false}
                  setRating={(newRating) =>
                    updatePhoneCall({
                      sessionId: call.sessionId,
                      data: {
                        rating: newRating,
                      },
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
        <div className="flex w-20 flex-col justify-around text-xs text-muted-foreground">
          <div className="flex flex-col justify-evenly whitespace-nowrap text-nowrap">
            {isToday
              ? durationAgo(lastModified) + " ago"
              : lastModified.toRelativeCalendar()}
          </div>
          <div className="flex justify-between whitespace-nowrap text-nowrap">
            {!isToday && <div> {lastModified.toFormat("LLL dd")}</div>}
            <div>{lastModified.toFormat("hh:ss")} </div>
          </div>
        </div>
      </div>
      {first && (
        <div>
          <CallRatingCluster
            rating={call.rating}
            disabled={false}
            setRating={(newRating) =>
              updatePhoneCall({
                sessionId: call.sessionId,
                data: {
                  rating: newRating,
                },
              })
            }
          />
        </div>
      )}
    </div>
  );
};

const durationAgo = (timestamp: DateTime) => {
  const diffNow = timestamp.diffNow().rescale();

  const unit: DurationUnit = diffNow.get("hours") !== 0 ? "hours" : "minutes";

  return timestamp
    .diffNow([unit])
    .negate()
    .mapUnits((x) => Math.floor(x))
    .rescale()
    .toHuman({ compactDisplay: "short", unitDisplay: "short" });
};
