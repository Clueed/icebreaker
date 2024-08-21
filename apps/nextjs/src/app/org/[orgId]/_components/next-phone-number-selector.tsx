import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";

import { useCurrentStrategyQuery } from "~/app/_api-hooks/use-current-strategy";
import {
  useSelectedGuessId,
  useSelectedGuessIdSetQuery,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import { AutoCaller } from "~/app/org/[orgId]/_components/auto-caller";
import { AutoSkipper } from "~/app/org/[orgId]/_components/auto-skipper";
import { GuessDisplay } from "~/app/org/[orgId]/_components/guess-display";
import { api } from "~/trpc/react";

export const NextPhoneNumberSelector = ({ orgId }: { orgId: string }) => {
  const {
    data: nextGuessIds,
    fetchNextPage,
    isLoading,
    isSuccess,
    isError,
    error,
    isFetching,
  } = useStableNextGuessIdQuery({ orgId });

  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });
  const indexOfSelectedGuess = nextGuessIds.findIndex(
    (g) => g === selectedGuess?.id,
  );
  const nextGuessesLeft = nextGuessIds.length - indexOfSelectedGuess;
  useEffect(() => {
    if (nextGuessesLeft < 10 && !error && !isFetching) {
      fetchNextPage();
    }
  }, [nextGuessesLeft, error, isFetching]);

  const nextGuessId = nextGuessIds[indexOfSelectedGuess + 1];

  return (
    <div>
      <div
        className="h-96 overflow-y-scroll"
        style={{ overflowAnchor: "none" }}
      >
        {isLoading && <div>Loading...</div>}
        {isError && <div>Error! {error.message}</div>}
        {isSuccess &&
          [...nextGuessIds]
            .reverse()
            .map((guessId, index) => (
              <GuessDisplay key={index + guessId} guessId={guessId} />
            ))}
      </div>
      <div>
        <AutoSkipper orgId={orgId} nextGuessId={nextGuessId} />
        <AutoCaller orgId={orgId} />
      </div>
    </div>
  );
};

const useStableNextGuessIdQuery = ({ orgId }: { orgId: string }) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });
  const selectedGuessId = selectedGuess?.id;
  const { data: currentStrategy } = useCurrentStrategyQuery({
    id: orgId,
  });
  const [stableGuessId, setStableGuessId] = useState(selectedGuessId);

  const query = api.guess.next.useInfiniteQuery(
    stableGuessId && currentStrategy
      ? {
          guessId: selectedGuess?.id ?? stableGuessId,
          strategy: currentStrategy,
          limit: 3,
        }
      : skipToken,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(stableGuessId && currentStrategy),
    },
  );
  const nextGuessIds = useMemo(() => {
    if (!query.data) {
      return [];
    }

    return query.data.pages.flatMap((page) => page.data);
  }, [query.data]);

  const selectedGuessInNext = selectedGuessId
    ? nextGuessIds.includes(selectedGuessId)
    : false;

  useEffect(() => {
    if (!selectedGuessId) return;
    if (!selectedGuessInNext) {
      setStableGuessId(selectedGuessId);
    }
  }, [selectedGuessId, selectedGuessInNext]);

  return { ...query, data: nextGuessIds };
};
