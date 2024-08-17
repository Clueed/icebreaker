import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import { useCurrentPhoneCall } from "~/app/_components/call-handler/current-call-provider";
import { AutoSkipper } from "~/app/org/[orgId]/_components/auto-skipper";
import { api } from "~/trpc/react";

export const NextPhoneNumberSelector = ({
  orgId,
  selectedGuessId,
}: {
  orgId: string;
  selectedGuessId: string;
}) => {
  const stableGuessId = useMemo(() => selectedGuessId, []);

  const {
    data: nextGuessesData,
    fetchNextPage,
    isFetching,
  } = api.guess.next.useInfiniteQuery(
    {
      guessId: stableGuessId,
      strategy: { type: "add", power: 0, loopAtPower: 3 },
    },
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

  const { updateOrg } = useOptimisticOrgMutation();
  function setSelectedGuessId(guessId: string): void {
    updateOrg({ id: orgId, data: { selectedGuessId: guessId } });

    const indexOfSelectedGuess = nextGuesses.findIndex((g) => g.id === guessId);
    if (!isFetching && nextGuesses.length - indexOfSelectedGuess < 5) {
      fetchNextPage();
      toast("next page");
    }
  }

  const indexOfSelectedGuess = nextGuesses.findIndex(
    (g) => g.id === selectedGuessId,
  );
  const nextGuessId = nextGuesses[indexOfSelectedGuess + 1]?.id;

  if (!nextGuesses) {
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
            selected={selectedGuessId === guess.id}
          />
        ))}
      </div>
      <div>
        <AutoSkipper
          selectedGuessId={selectedGuessId}
          nextGuessId={nextGuessId}
        />
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
