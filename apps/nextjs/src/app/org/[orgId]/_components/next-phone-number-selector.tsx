import { useEffect, useMemo, useState } from "react";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";

import { useCurrentStrategyQuery } from "~/app/_api-hooks/use-current-strategy";
import { useSelectedGuessId } from "~/app/_api-hooks/use-selected-guess";
import { GuessDisplay } from "~/app/org/[orgId]/_components/guess-display";
import { Ratatatata } from "~/app/org/[orgId]/_components/ratatata/ratatatata";
import { api } from "~/trpc/react";

const NextPhoneNumberSelectorWrapper = ({ orgId }: { orgId: string }) => {
  const {
    data: selectedGuessId,
    isLoading: isLoadingSelectedGuess,
    isSuccess: isSuccessSelectedGuess,
  } = useSelectedGuessId({ id: orgId });
  const {
    data: currentStrategy,
    isLoading: isLoadingCurrentStrategy,
    isSuccess: isSuccessCurrentStrategy,
  } = useCurrentStrategyQuery({
    id: orgId,
  });

  const isLoading = isLoadingSelectedGuess || isLoadingCurrentStrategy;
  const isSuccess = isSuccessSelectedGuess && isSuccessCurrentStrategy;

  return (
    <div>
      {isSuccess && (
        <>
          {!selectedGuessId && (
            <div>Create an initial guess to get started</div>
          )}
          {<div>Select a strategy to get started</div>}
          {selectedGuessId && (
            <NextPhoneNumberSelector
              orgId={orgId}
              selectedGuessId={selectedGuessId}
              currentStrategy={currentStrategy}
            />
          )}
        </>
      )}
      {isLoading && <div>Loading Wrapper...</div>}
    </div>
  );
};

export default NextPhoneNumberSelectorWrapper;

const NextPhoneNumberSelector = (props: {
  orgId: string;
  selectedGuessId: string;
  currentStrategy: Strategy;
}) => {
  const [stableGuessId, setStableGuessId] = useState(props.selectedGuessId);
  const {
    data: nextGuessIdsData,
    fetchNextPage,
    isLoading: isLoadingNextGuessIds,
    isSuccess: isSuccessNextGuessIds,
    isFetching: isFetchingNextGuessIds,
  } = api.guess.next.useInfiniteQuery(
    {
      guessId: stableGuessId,
      strategy: props.currentStrategy,
      limit: 3,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const nextGuessIds = useMemo(() => {
    if (!nextGuessIdsData) {
      return [];
    }

    return nextGuessIdsData.pages.flatMap((page) => page.data);
  }, [nextGuessIdsData]);

  const selectedGuessInNext = nextGuessIds.includes(props.selectedGuessId);

  if (
    !selectedGuessInNext &&
    !isFetchingNextGuessIds &&
    stableGuessId !== props.selectedGuessId
  ) {
    setStableGuessId(props.selectedGuessId);
  }

  const indexOfSelectedGuess = nextGuessIds.findIndex(
    (g) => g === props.selectedGuessId,
  );
  const nextGuessesLeft = nextGuessIds.length - indexOfSelectedGuess;
  useEffect(() => {
    if (nextGuessesLeft < 10 && !isFetchingNextGuessIds) {
      void fetchNextPage();
    }
  }, [nextGuessesLeft, isFetchingNextGuessIds, fetchNextPage]);

  const nextGuessId = nextGuessIds[indexOfSelectedGuess + 1];

  const isLoading = isLoadingNextGuessIds;
  const isSuccess = isSuccessNextGuessIds;

  return (
    <div>
      <div
        className="h-96 overflow-y-scroll"
        style={{ overflowAnchor: "none" }}
      >
        {isLoading && <div>Loading...</div>}
        {isSuccess &&
          [...nextGuessIds]
            .reverse()
            .map((guessId, index) => (
              <GuessDisplay key={index + guessId} guessId={guessId} />
            ))}
      </div>
      <div className="space-y-4 py-8">
        <Ratatatata orgId={props.orgId} nextGuessId={nextGuessId} />
      </div>
    </div>
  );
};
