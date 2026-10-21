"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useIntersectionObserver } from "usehooks-ts";

import { cn } from "@icebreaker/ui";
import { ArrowDownIcon, HistoryIcon, Loader2Icon } from "@icebreaker/ui/icons";
import { ScrollContainer } from "@icebreaker/ui/scroll-container";

import { useCall } from "~/app/_components/call-handler/use-current-call";
import { HistoryCallItem } from "~/app/(app)/@caller/_components/call-history/call-history-item";
import { api } from "~/trpc/react";

export const CallHistory = () => {
  const { sessionId: currentSessionId, active } = useCall();
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
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const calls = isSuccess
    ? callsData.pages
        .flatMap((page) => page.data)
        // the current call is shown above while it is still going on
        .filter((call) => !(active && call.sessionId === currentSessionId))
    : [];
  const [animateRef] = useAutoAnimate();

  const { ref: nextPageTriggerRef } = useIntersectionObserver({
    onChange: (isIntersection) => {
      if (isIntersection && hasNextPage) {
        void fetchNextPage();
      }
    },
  });

  return (
    <div>
      <h2 className={"mb-4 text-nowrap px-4 text-xs text-muted-foreground"}>
        <HistoryIcon className="inline size-[1.65cap]" /> call history
      </h2>
      <ScrollContainer
        ref={animateRef}
        className="h-96 space-y-2 overflow-y-auto rounded-md p-4"
      >
        {isPending && (
          <div className="flex h-full items-center justify-center">
            <Loader2Icon className="animate-spin" />
          </div>
        )}
        {isError && <div>Error! {error.message}</div>}
        {isSuccess &&
          calls.map((call, index) => (
            <HistoryCallItem
              initialExpanded={index === 0}
              key={call.guessId + call.id}
              call={call}
            />
          ))}

        <div
          className="flex h-20 w-full items-center justify-center"
          ref={nextPageTriggerRef}
        >
          <ArrowDownIcon
            className={cn(isFetchingNextPage && "animate-bounce")}
          />
          {!hasNextPage && "the end"}
        </div>
      </ScrollContainer>
    </div>
  );
};
