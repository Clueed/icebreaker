import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { skipToken } from "@tanstack/react-query";

import type { Strategy } from "@acme/validators/guessing-strategies";
import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { PhoneCallIcon } from "@acme/ui/icons";
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

  useEffect(() => {
    if (nextGuessIds.length < 10 && !error && !isFetching) {
      fetchNextPage();
    }
  }, [nextGuessIds.length, error, isFetching]);

  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();
  function setSelectedGuessId(guessId: string): void {
    setSelectedGuessIdMutation.mutate({
      orgId: orgId,
      data: { selectedGuessId: guessId },
    });
  }

  const indexOfSelectedGuess = nextGuessIds.findIndex(
    (g) => g === selectedGuess?.id,
  );
  const nextGuessId = nextGuessIds[indexOfSelectedGuess + 1];

  if (!nextGuessIds || !selectedGuess) {
    return null;
  }

  return (
    <div>
      <div className="h-96 overflow-y-scroll">
        {[...nextGuessIds].reverse().map((guessId) => (
          <GuessDisplay
            key={guessId}
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
          <div>{calls && <PhoneCallIcon className="h-6 w-6" />}</div>
        </>
      )}
    </div>
  );
};
