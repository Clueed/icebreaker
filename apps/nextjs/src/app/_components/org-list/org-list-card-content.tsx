import type { AppRouterOutputs } from "node_modules/@icebreaker/api/dist/root";
import { Fragment } from "react";

import { cn } from "@icebreaker/ui";
import { PhoneCallIcon } from "@icebreaker/ui/icons";
import { Skeleton } from "@icebreaker/ui/skeleton";
import { phoneCallRatingList } from "@icebreaker/validators/phone-call-rating";

import { RatingEffect } from "~/app/(app)/@caller/_components/rating-effect";
import { RatingIcon } from "~/app/(app)/@caller/_components/rating-icon";
import { api } from "~/trpc/react";

export const OrgCardContent = ({
  org,
}: {
  org: AppRouterOutputs["org"]["all"][number];
}) => {
  const {
    data: rawStats,
    isLoading,
    isSuccess,
  } = api.org.statsById.useQuery(
    {
      id: org.id,
    },
    {
      throwOnError: true,
    },
  );

  const total = isSuccess
    ? rawStats.reduce((acc, cur) => acc + cur.count, 0)
    : undefined;

  const stats = isSuccess
    ? rawStats.filter((stat) => stat.rating !== null).reverse()
    : [];

  const noCalls = isSuccess && rawStats.length === 0;

  return (
    <div className="h-full">
      {isLoading && <Skeleton className="h-52 w-full" />}
      {isSuccess && (
        <>
          {noCalls && <div className="text-muted-foreground">no calls</div>}
          {!noCalls && (
            <div className="grid grid-cols-[auto_minmax(0,_1fr)_auto] items-center justify-center gap-x-4 gap-y-2 align-middle">
              <div className="mt-2">
                <PhoneCallIcon className="h-[1.25cap]" />
              </div>
              <div className="mt-2 font-medium">total</div>
              <div className="mt-2 font-medium">{total}</div>
              {phoneCallRatingList.map((rating) => {
                const count =
                  stats.find((stat) => stat.rating === rating)?.count ?? 0;

                return (
                  <Fragment key={rating}>
                    <div
                      className={cn(
                        count === 0
                          ? "text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      <RatingEffect rating={count === 0 ? null : rating}>
                        <RatingIcon rating={rating} className="h-[1.25cap]" />
                      </RatingEffect>
                    </div>
                    <div
                      className={cn(
                        count === 0
                          ? "text-muted-foreground"
                          : "text-foreground",
                        count > 0 && rating === "jackpot" && "font-medium",
                      )}
                    >
                      {rating}
                    </div>
                    <div
                      className={cn(
                        "text-right",
                        count === 0
                          ? "text-muted-foreground"
                          : "text-foreground",
                        count > 0 && rating === "jackpot" && "font-medium",
                      )}
                    >
                      {count}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
