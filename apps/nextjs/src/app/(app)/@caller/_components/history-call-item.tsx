import type { DurationUnit } from "luxon";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DateTime } from "luxon";

import type { RouterOutputs } from "@icebreaker/api";
import { cn } from "@icebreaker/ui";
import {
  getRating,
  ratingToDbValue,
} from "@icebreaker/validators/phone-call-rating";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";
import { CallRatingCluster } from "~/app/(app)/@caller/_components/current-call-rating-cluster";
import { RatingEffect } from "~/app/(app)/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const HistoryCall = ({
  call,
  initialExpanded = false,
}: {
  call: RouterOutputs["phoneCall"]["history"]["data"][number];
  initialExpanded: boolean;
}) => {
  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();
  const lastModified = DateTime.fromSQL(call.createdAt, {
    zone: "utc",
  });

  const duration =
    call.answeredAt && call.hangupAt
      ? DateTime.fromSQL(call.hangupAt, { zone: "utc" })
          .diff(DateTime.fromSQL(call.answeredAt, { zone: "utc" }))
          .toFormat("mm:ss")
      : undefined;

  const isToday = lastModified.hasSame(DateTime.local(), "day");

  const [expanded, setExpanded] = useState(initialExpanded);

  const [animateRef] = useAutoAnimate();

  return (
    <div
      className={cn(
        "min-w-60 space-y-4 rounded-md p-4 transition-colors",
        "hover:bg-muted/25",
        expanded && "bg-muted/25",
      )}
      ref={animateRef}
    >
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          "grid grid-cols-[repeat(2,auto)] items-center justify-between gap-x-4",
        )}
      >
        <div className="text-xl">
          <div>
            <RatingEffect rating={getRating(call)}>
              <RatingIcon
                rating={getRating(call)}
                className={cn("size-[1.25cap]")}
              />
            </RatingEffect>
          </div>
        </div>

        <div className="text-xl">
          <span className={"text-muted-foreground"}>
            {call.phoneNumber.base} -{" "}
          </span>
          {call.phoneNumber.extension}
        </div>
        <div className="col-start-2 flex justify-start gap-4 text-nowrap text-xs text-muted-foreground">
          <div>
            {isToday
              ? durationAgo(lastModified) + " ago"
              : lastModified.toRelativeCalendar()}
          </div>
          <div>{duration && duration}</div>
        </div>
      </button>
      {expanded && (
        <>
          <div className="flex justify-between whitespace-nowrap text-nowrap text-xs text-muted-foreground">
            <div>{lastModified.toFormat("LLL dd")}</div>
            <div>{lastModified.toFormat("hh:ss")} </div>
          </div>

          <div>
            <CallRatingCluster
              rating={getRating(call)}
              disabled={false}
              setRating={(newRating) =>
                updatePhoneCall({
                  sessionId: call.sessionId,
                  data: {
                    rating: ratingToDbValue(newRating),
                  },
                })
              }
            />
          </div>
        </>
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
