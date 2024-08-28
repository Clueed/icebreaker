import type { AppRouterOutputs } from "node_modules/@icebreaker/api/dist/root";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";

import { useCurrentStrategyQuery } from "~/app/_api-hooks/use-current-strategy";
import {
  useSelectedGuessId,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import { GuessDisplay } from "~/app/org/[orgId]/_components/guess-display";
import { Ratatatata } from "~/app/org/[orgId]/_components/ratatata/ratatatata";
import { api } from "~/trpc/react";

const NextPhoneNumberSelectorWrapper = ({ orgId }: { orgId: string }) => {
  const {
    data: selectedGuessId,
    isLoading: isLoadingSelectedGuessId,
    isSuccess: isSuccessSelectedGuessId,
  } = useSelectedGuessId({ id: orgId });
  const {
    data: selectedGuess,
    isLoading: isLoadingSelectedGuess,
    isSuccess: isSuccessSelectedGuess,
  } = useSelectedGuessQuery({ id: orgId });
  const {
    data: currentStrategy,
    isLoading: isLoadingCurrentStrategy,
    isSuccess: isSuccessCurrentStrategy,
  } = useCurrentStrategyQuery({
    id: orgId,
  });

  const isLoading =
    isLoadingSelectedGuess ||
    isLoadingCurrentStrategy ||
    isLoadingSelectedGuessId;
  const isSuccess =
    isSuccessSelectedGuess &&
    isSuccessCurrentStrategy &&
    isSuccessSelectedGuessId;

  return (
    <div>
      {isSuccess && (
        <>
          {!selectedGuessId && (
            <div>Create an initial guess to get started</div>
          )}
          {selectedGuessId && (
            <NextPhoneNumberSelector
              orgId={orgId}
              selectedGuess={selectedGuess}
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
  selectedGuess: AppRouterOutputs["guess"]["byId"];
  currentStrategy: Strategy;
}) => {
  const selectedGuessId = props.selectedGuess.id;
  const [stableGuessId, setStableGuessId] = useState(selectedGuessId);
  const {
    data: nextGuesses,
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
    if (!nextGuesses) {
      return [];
    }

    return nextGuesses.pages.flatMap((page) => page.data);
  }, [nextGuesses]);

  const indexOfSelectedGuess = nextGuessIds.findIndex(
    (g) => g.id === selectedGuessId,
  );
  const selectedGuessInNext = indexOfSelectedGuess !== -1;

  if (
    !selectedGuessInNext &&
    !isFetchingNextGuessIds &&
    stableGuessId !== selectedGuessId
  ) {
    setStableGuessId(selectedGuessId);
  }

  const nextGuessesLeft = nextGuessIds.length - indexOfSelectedGuess;
  useEffect(() => {
    if (nextGuessesLeft < 10 && !isFetchingNextGuessIds) {
      void fetchNextPage();
    }
  }, [nextGuessesLeft, isFetchingNextGuessIds, fetchNextPage]);

  const nextGuessId = nextGuessIds[indexOfSelectedGuess + 1]?.id;

  const isLoading = isLoadingNextGuessIds;
  const isSuccess = isSuccessNextGuessIds;

  return (
    <div>
      <div
        className="h-96 space-y-4 overflow-y-scroll"
        style={{ overflowAnchor: "none" }}
      >
        {isLoading && <div>Loading...</div>}
        {isSuccess &&
          [...nextGuessIds]
            .reverse()
            .map((guess, index) => (
              <GuessDisplayWrapper
                key={index + guess.id}
                guess={
                  selectedGuessId === guess.id ? props.selectedGuess : guess
                }
                selected={selectedGuessId === guess.id}
              />
            ))}
      </div>
      <div className="space-y-4 py-8">
        <Ratatatata orgId={props.orgId} nextGuessId={nextGuessId} />
      </div>
    </div>
  );
};

const GuessDisplayWrapper = ({
  guess,
  selected,
}: {
  guess: AppRouterOutputs["guess"]["next"]["data"][number];
  selected: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [selected]);
  return <GuessDisplay ref={ref} guess={guess} selected={selected} />;
};
