import { useEffect, useMemo, useRef } from "react";
import { skipToken } from "@tanstack/react-query";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { PhoneCallIcon } from "@acme/ui/icons";

import { useCurrentStrategyQuery } from "~/app/_api-hooks/use-current-strategy";
import {
  useSelectedGuessIdSetQuery,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { AutoCaller } from "~/app/org/[orgId]/_components/auto-caller";
import { AutoSkipper } from "~/app/org/[orgId]/_components/auto-skipper";
import { api } from "~/trpc/react";

export const NextPhoneNumberSelector = ({ orgId }: { orgId: string }) => {
  const { data: selectedGuess } = useSelectedGuessQuery({ id: orgId });
  const { data: currentStrategy } = useCurrentStrategyQuery({
    id: orgId,
  });

  const stableGuessId = useMemo(() => selectedGuess?.id, [!!selectedGuess]);

  const {
    data: nextGuessesData,
    error,
    fetchNextPage,
    isFetching,
  } = api.guess.next.useInfiniteQuery(
    stableGuessId && currentStrategy
      ? {
          guessId: stableGuessId,
          strategy: currentStrategy,
          limit: 3,
        }
      : skipToken,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const nextGuessIds = useMemo(() => {
    if (!nextGuessesData) {
      return [];
    }

    return nextGuessesData.pages.flatMap((page) => page.data);
  }, [nextGuessesData]);

  const indexOfSelectedGuess = nextGuessIds.findIndex(
    (g) => g === selectedGuess?.id,
  );
  const nextGuessesLeft = nextGuessIds.length - indexOfSelectedGuess;

  useEffect(() => {
    if (nextGuessesLeft < 10 && !error && !isFetching) {
      fetchNextPage();
    }
  }, [nextGuessesLeft, error, isFetching]);

  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();
  function setSelectedGuessId(guessId: string): void {
    setSelectedGuessIdMutation.mutate({
      orgId: orgId,
      data: { selectedGuessId: guessId },
    });
  }

  const nextGuessId = nextGuessIds[indexOfSelectedGuess + 1];

  if (!nextGuessIds || !selectedGuess) {
    return null;
  }

  return (
    <div>
      <div className="h-96 overflow-y-scroll">
        {[...nextGuessIds].reverse().map((guessId, index) => (
          <GuessDisplay
            key={index + guessId}
            guessId={guessId}
            onClick={() => setSelectedGuessId(guessId)}
            selected={selectedGuess.id === guessId}
          />
        ))}
      </div>
      <div>
        <AutoSkipper orgId={orgId} nextGuessId={nextGuessId} />
        <AutoCaller orgId={orgId} />
      </div>
    </div>
  );
};

const GuessDisplay = ({
  guessId,
  onClick,
  selected,
}: {
  guessId: string;
  onClick: () => void;
  selected: boolean;
}) => {
  const { data: guess, isLoading } = api.guess.byId.useQuery({ id: guessId });
  const [startCall] = useStartCall({ guessId });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [selected]);

  const calls = guess ? guess.phoneCalls.length > 0 : false;
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-1 border-2 p-4",
        calls && "opacity-10",
        selected && "bg-accent text-accent-foreground",
      )}
    >
      {isLoading ? "loading..." : null}
      {guess && (
        <>
          <Button onClick={onClick}>select</Button>
          <div className="flex gap-1">
            <div>{guess.phoneNumber.base}</div>-
            <div>{guess.phoneNumber.extension}</div>
          </div>
          <Button onClick={() => startCall()}>start call</Button>
          <div>{calls && <PhoneCallIcon className="h-6 w-6" />}</div>
        </>
      )}
    </div>
  );
};
