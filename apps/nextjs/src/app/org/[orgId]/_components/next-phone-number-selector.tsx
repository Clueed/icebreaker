import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { skipToken } from "@tanstack/react-query";

import type { Strategy } from "@acme/validators/guessing-strategies";
import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import { useCurrentStrategyQuery } from "~/app/_api-hooks/use-current-strategy";
import {
  useSelectedGuessIdSetQuery,
  useSelectedGuessQuery,
} from "~/app/_api-hooks/use-selected-guess";
import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";
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
    fetchNextPage,
    isFetching,
  } = api.guess.next.useInfiniteQuery(
    stableGuessId && currentStrategy
      ? {
          guessId: stableGuessId,
          strategy: currentStrategy,
        }
      : skipToken,
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    },
  );

  const nextGuesses = useMemo(() => {
    if (!nextGuessesData) {
      return [];
    }

    return nextGuessesData.pages.flatMap((page) => page.data);
  }, [nextGuessesData]);

  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();
  function setSelectedGuessId(guessId: string): void {
    setSelectedGuessIdMutation.mutate({
      orgId: orgId,
      data: { selectedGuessId: guessId },
    });

    const indexOfSelectedGuess = nextGuesses.findIndex((g) => g.id === guessId);
    if (!isFetching && nextGuesses.length - indexOfSelectedGuess < 5) {
      fetchNextPage();
      toast("next page");
    }
  }

  const indexOfSelectedGuess = nextGuesses.findIndex(
    (g) => g.id === selectedGuess?.id,
  );
  const nextGuessId = nextGuesses[indexOfSelectedGuess + 1]?.id;

  if (!nextGuesses || !selectedGuess) {
    return null;
  }

  return (
    <div>
      <div className="h-96 overflow-y-scroll">
        {[...nextGuesses].reverse().map((guess) => (
          <GuessDisplay
            key={guess.id}
            guess={guess}
            onClick={() => setSelectedGuessId(guess.id)}
            selected={selectedGuess.id === guess.id}
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
  guess,
  onClick,
  selected,
}: {
  guess: AppRouterOutputs["guess"]["all"][0];
  onClick: () => void;
  selected: boolean;
}) => {
  const { startCall } = useCurrentPhoneCall();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [selected]);
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-1 border-2 p-4",
        selected && "bg-accent text-accent-foreground",
      )}
    >
      <Button onClick={onClick}>select</Button>
      <div className="flex gap-1">
        <div>{guess.phoneNumber.base}</div>-
        <div>{guess.phoneNumber.extension}</div>
      </div>
      <Button
        onClick={() =>
          startCall({
            guessId: guess.id,
            phoneNumber: guess.phoneNumber,
          })
        }
      >
        start call
      </Button>
    </div>
  );
};
