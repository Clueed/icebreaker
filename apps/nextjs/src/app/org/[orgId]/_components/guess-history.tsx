import { useId, useRef, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { cn } from "@icebreaker/ui";
import { ArrowDownIcon, Loader2Icon } from "@icebreaker/ui/icons";
import { Label } from "@icebreaker/ui/label";
import { Switch } from "@icebreaker/ui/switch";

import { useSelectedGuessId } from "~/app/_api-hooks/use-selected-guess";
import { GuessDisplay } from "~/app/org/[orgId]/_components/guess-display";
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
    },
  );

  const guesses = guessesData
    ? guessesData.pages
        .flatMap((page) => page.data)
        .filter((guess) => selectedGuessId && guess.id !== selectedGuessId)
    : [];

  const container = useRef(null);

  const { ref: nextPageTriggerRef } = useIntersectionObserver({
    threshold: 0.5,
    root: container.current,
    onChange: (isIntersecting) => {
      if (isIntersecting && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
  });

  const onlyWithCallsId = useId();

  return (
    <div>
      <div
        className="h-96 space-y-2 overflow-y-auto rounded-md border-y-[1px] p-4"
        ref={container}
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
              <div key={guess.id}>
                <GuessDisplay key={guess.id} guess={guess} selected={false} />
              </div>
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
          </>
        )}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <Switch
            id={onlyWithCallsId}
            checked={onlyWithCalls}
            onCheckedChange={setOnlyWithCalls}
          />
          <Label htmlFor={onlyWithCallsId}>only with calls</Label>
        </div>
      </div>
    </div>
  );
};
