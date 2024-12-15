import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DateTime } from "luxon";

import type { RouterOutputs } from "@icebreaker/api";
import { cn } from "@icebreaker/ui";

import { getHumanReadablePastDuration } from "~/app/(app)/@caller/_components/call-history/get-human-readable-past-duration";
import { CallRatingCluster } from "~/app/(app)/@caller/_components/rating-cluster";
import { RatingEffect } from "~/app/(app)/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";

export const HistoryCallItem = ({
  call,
  initialExpanded = false,
}: {
  call: RouterOutputs["phoneCall"]["history"]["data"][number];
  initialExpanded: boolean;
}) => {
  const lastModified = DateTime.fromSQL(call.createdAt, {
    zone: "utc",
  });

  const duration =
    call.answeredAt && call.hangupAt
      ? DateTime.fromSQL(call.hangupAt, { zone: "utc" })
          .diff(DateTime.fromSQL(call.answeredAt, { zone: "utc" }))
          .toFormat("mm:ss")
      : undefined;

  const [expanded, setExpanded] = useState(initialExpanded);

  const [animateRef] = useAutoAnimate();

  return (
    <div
      className={cn(
        "min-w-60 space-y-4 rounded-md p-4 transition-colors",
        expanded ? "bg-muted/50" : "hover:bg-muted/25",
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
            <RatingEffect rating={call.rating}>
              <RatingIcon
                rating={call.rating}
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
          <div>{getHumanReadablePastDuration(lastModified)}</div>
          <div>{duration && duration}</div>
        </div>
      </button>
      {expanded && (
        <>
          <div className="flex justify-between whitespace-nowrap text-nowrap text-xs text-muted-foreground">
            <div>{lastModified.toFormat("LLL dd")}</div>
            <div>{lastModified.toFormat("hh:ss")} </div>
          </div>

          {call.rating !== null && (
            <div>
              <CallRatingCluster
                sessionId={call.sessionId}
                rating={call.rating}
                disabled={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
