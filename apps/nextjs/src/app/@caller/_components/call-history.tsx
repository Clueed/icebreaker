"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useIntersectionObserver } from "usehooks-ts";

import { cn } from "@icebreaker/ui";
import { ArrowDownIcon } from "@icebreaker/ui/icons";

import { HistoryCall } from "~/app/@caller/_components/history-call-item";
import { api } from "~/trpc/react";

export const CallHistory = () => {
  const {
    data: callsData,
    isSuccess,
    isError,
    error,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.phoneCall.history.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const calls = isSuccess ? callsData.pages.flatMap((page) => page.data) : [];
  const [animateRef] = useAutoAnimate();

  const { ref: nextPageRef } = useIntersectionObserver({
    onChange: (isIntersection) => {
      if (isIntersection && hasNextPage) {
        void fetchNextPage();
      }
    },
  });

  return (
    <div>
      <div ref={animateRef} className="h-96 space-y-2 overflow-y-auto p-2">
        {isPending && <div>Loading...</div>}
        {isError && <div>Error! {error.message}</div>}
        {isSuccess &&
          calls.map((call, index) => (
            <HistoryCall first={index === 0} key={call.id} call={call} />
          ))}

        <div
          className="flex h-20 w-full items-center justify-center"
          ref={nextPageRef}
        >
          <ArrowDownIcon
            className={cn(isFetchingNextPage && "animate-bounce")}
          />
          {!hasNextPage && "the end"}
        </div>
      </div>
    </div>
  );
};
