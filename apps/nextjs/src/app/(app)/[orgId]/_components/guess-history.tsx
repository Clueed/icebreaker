"use client";

import { useId, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useIntersectionObserver } from "usehooks-ts";

import { HistoryIcon, Loader2Icon } from "@icebreaker/ui/icons";
import { Label } from "@icebreaker/ui/label";
import { Skeleton } from "@icebreaker/ui/skeleton";
import { Switch } from "@icebreaker/ui/switch";

import { useSelectedGuessId } from "~/app/_api-hooks/use-selected-guess";
import { GuessDisplay } from "~/app/(app)/[orgId]/_components/guess-display";
import { api } from "~/trpc/react";

export const GuessHistory = ({ orgId }: { orgId: string }) => {
  const [onlyWithCalls, setOnlyWithCalls] = useState(true);
  const { data: selectedGuessId } = useSelectedGuessId({ id: orgId });
  const {
    data: guessesData,
    error,
    isError,
    isPending,
    isSuccess,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.guess.history.useInfiniteQuery(
    {
      orgId,
      onlyWithCalls,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 30000,
    },
  );

  const guesses = guessesData
    ? guessesData.pages
        .flatMap((page) => page.data)
        .filter((guess) => selectedGuessId && guess.id !== selectedGuessId)
    : [];

  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);

  const { ref: nextPageTriggerRef } = useIntersectionObserver({
    threshold: 0.5,
    root: containerElement,
    onChange: (isIntersecting) => {
      if (isIntersecting && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
  });

  const onlyWithCallsId = useId();

  const [animateRef] = useAutoAnimate();

  return (
    <div>
      <h2 className={"mb-4 text-nowrap px-8 text-xs text-muted-foreground"}>
        <HistoryIcon className="inline size-[1.65cap]" /> guess history
      </h2>
      <div ref={(el) => setContainerElement(el)}>
        <div
          className="flex h-52 flex-wrap justify-between gap-x-4 gap-y-6 overflow-y-auto rounded-md border-y-[1px] p-4"
          ref={animateRef}
          style={{
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",
          }}
        >
          {isPending && (
            <div className="flex h-full items-center justify-center">
              <Loader2Icon className="animate-spin" />
            </div>
          )}
          {isError && <div>Error! {error.message}</div>}
          {isSuccess && (
            <>
              {guesses.map((guess) => (
                <div key={guess.id} className="basis-0">
                  <GuessDisplay
                    key={guess.id}
                    guess={guess}
                    className="w-full"
                  />
                </div>
              ))}

              {isFetchingNextPage &&
                Array.from({ length: 3 }).map(() => (
                  <Skeleton className="flex-grow basis-0"></Skeleton>
                ))}

              <div className="" ref={nextPageTriggerRef}>
                {!hasNextPage && "the end"}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2 px-8">
        <Switch
          id={onlyWithCallsId}
          checked={onlyWithCalls}
          onCheckedChange={setOnlyWithCalls}
        />
        <Label htmlFor={onlyWithCallsId}>only with calls</Label>
      </div>
    </div>
  );
};
