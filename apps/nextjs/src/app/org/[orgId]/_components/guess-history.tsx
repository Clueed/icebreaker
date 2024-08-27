import { useId, useRef, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { LoaderCircleIcon } from "@icebreaker/ui/icons";
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
  } = api.guess.history.useInfiniteQuery(
    {
      orgId,
      onlyWithCalls,
      limit: 10,
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
      console.log("isIntersecting >>", isIntersecting);
      if (isIntersecting && !isFetchingNextPage) {
        console.log("ftech");
        void fetchNextPage();
      }
    },
  });

  const onlyWithCallsId = useId();

  return (
    <div>
      <div className="h-96 overflow-y-scroll" ref={container}>
        {isPending && <div>Loading...</div>}
        {isError && <div>Error! {error.message}</div>}
        {isSuccess && (
          <>
            {guesses.map((guess) => (
              <div key={guess.id}>
                <GuessDisplay key={guess.id} guess={guess} selected={false} />
              </div>
            ))}

            <div className="h-20 w-full" ref={nextPageTriggerRef}>
              {isFetchingNextPage && (
                <LoaderCircleIcon className="animate-spin" />
              )}
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
