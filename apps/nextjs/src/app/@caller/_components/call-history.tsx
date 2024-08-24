"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";
import { CurrentCallRatingCluster } from "~/app/@caller/_components/current-call-rating-cluster";
import { RatingIcon } from "~/app/@caller/_components/rating-icon";
import { api } from "~/trpc/react";

export const CallHistory = () => {
  const {
    data: callsData,
    isSuccess,
    isError,
    error,
    isPending,
  } = api.phoneCall.all.useInfiniteQuery(
    {
      active: false,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const calls = callsData?.pages.flatMap((page) => page.data) ?? [];
  const [animateRef] = useAutoAnimate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={animateRef} className="h-96 space-y-2 overflow-y-auto">
          {isPending && <div>Loading...</div>}
          {isError && <div>Error! {error.message}</div>}
          {isSuccess &&
            calls.map((call) => <HistoryCall key={call.id} call={call} />)}
        </div>
      </CardContent>
    </Card>
  );
};

const HistoryCall = ({
  call,
}: {
  call: RouterOutputs["phoneCall"]["all"]["data"][number];
}) => {
  const { base, extension } = call.phoneNumber;
  const lastModified = new Date(
    call.updatedAt ?? call.createdAt,
  ).toLocaleTimeString();

  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded px-4 py-2">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size={"icon"}>
              <RatingIcon rating={call.rating} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <CurrentCallRatingCluster
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
      <div className="text-lg">
        <PhoneNumberDisplay phoneNumber={call.phoneNumber} />
      </div>
      <div className="text-sm">{lastModified}</div>
    </div>
  );
};
