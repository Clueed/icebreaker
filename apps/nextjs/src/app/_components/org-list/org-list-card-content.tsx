import type { AppRouterOutputs } from "node_modules/@icebreaker/api/dist/root";
import { Fragment } from "react";

import { PhoneCallIcon } from "@icebreaker/ui/icons";
import { Skeleton } from "@icebreaker/ui/skeleton";

import { RatingIcon } from "~/app/@caller/_components/rating-icon";
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
    <div className="h-40">
      {isLoading && <Skeleton className="h-full w-full" />}
      {isSuccess && (
        <>
          {noCalls && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              no calls
            </div>
          )}
          {!noCalls && (
            <div className="grid grid-cols-[auto_minmax(0,_1fr)_auto] items-center justify-center gap-x-4 gap-y-2 align-middle">
              {stats.map((stat, i) => (
                <Fragment key={i}>
                  <div className="text-muted-foreground">
                    <RatingIcon rating={stat.rating} className="h-[1.25cap]" />
                  </div>
                  <div className="">{stat.rating}</div>
                  <div>{stat.count}</div>
                </Fragment>
              ))}
              <div className="col-span-3 h-0.5 rounded-full bg-muted-foreground" />
              <div className="">
                <PhoneCallIcon className="h-[1.25cap]" />
              </div>
              <div className="font-medium">total</div>
              <div className="font-medium">{total}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
