import { useEffect, useId, useRef, useState } from "react";
import { Label } from "@icebreaker/ui/label";
import { Switch } from "@icebreaker/ui/switch";
import { useInView } from "framer-motion";

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
  } = api.guess.all.useInfiniteQuery(
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

  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [isInView, isFetchingNextPage, fetchNextPage]);

  const onlyWithCallsId = useId();

  return (
    <div>
      <div className="h-96 overflow-y-scroll">
        {isPending && <div>Loading...</div>}
        {isError && <div>Error! {error.message}</div>}
        {isSuccess && (
          <>
            {guesses.map((guess) => (
              <GuessDisplay key={guess.id} guessId={guess.id} />
            ))}
            <div ref={ref} className="h-1 w-full" />
            {isFetchingNextPage && <div>Loading next page...</div>}
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
