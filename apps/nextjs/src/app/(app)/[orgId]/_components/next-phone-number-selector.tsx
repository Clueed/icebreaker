"use client";

import type { AppRouterOutputs } from "node_modules/@icebreaker/api/dist/root";
import { useEffect, useRef } from "react";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { Loader2Icon, PhoneCallIcon } from "@icebreaker/ui/icons";

import { useCurrentStrategyQuery } from "~/app/_api-hooks/use-current-strategy";
import { useGuessNextQueryStableGuessId } from "~/app/_api-hooks/use-guess-next";
import {
  useSelectedGuessQuery,
  useSetSelectedGuessId,
} from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { GuessDisplay } from "~/app/(app)/[orgId]/_components/guess-display";
import { Ratatatata } from "~/app/(app)/[orgId]/_components/ratatata/ratatatata";

const NextPhoneNumberSelectorWrapper = ({ orgId }: { orgId: string }) => {
  const {
    data: selectedGuess,
    isLoading: isLoadingSelectedGuess,
    isSuccess: isSuccessSelectedGuess,
    error: errorSelectedGuess,
  } = useSelectedGuessQuery({ id: orgId });
  const {
    data: currentStrategy,
    isLoading: isLoadingCurrentStrategy,
    isSuccess: isSuccessCurrentStrategy,
    error: errorCurrentStrategy,
  } = useCurrentStrategyQuery({
    id: orgId,
  });

  const isLoading = isLoadingSelectedGuess || isLoadingCurrentStrategy;
  const isSuccess = isSuccessSelectedGuess && isSuccessCurrentStrategy;

  return (
    <div>
      {isSuccess && (
        <>
          {
            // TODO: fix
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            !selectedGuess && (
              <div className="flex size-full items-center justify-center">
                Create an initial guess to get started
              </div>
            )
          }
          <NextPhoneNumberSelector
            orgId={orgId}
            selectedGuess={selectedGuess}
            currentStrategy={currentStrategy}
          />
        </>
      )}
      {isLoading && (
        <div className="flex size-full items-center justify-center">
          <Loader2Icon className="animate-spin" />
          conaitenr
        </div>
      )}
      {errorSelectedGuess && <div>Error: {errorSelectedGuess.message}</div>}
      {errorCurrentStrategy && <div>Error: {errorCurrentStrategy.message}</div>}
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
  const {
    data: nextGuesses,
    isFetching,
    fetchNextPage,
    isLoading,
    isSuccess,
  } = useGuessNextQueryStableGuessId({
    guessId: selectedGuessId,
    strategy: props.currentStrategy,
  });

  const indexOfSelectedGuess = nextGuesses.findIndex(
    (g) => g.id === selectedGuessId,
  );
  const nextGuessesLeft = nextGuesses.length - indexOfSelectedGuess;

  useEffect(() => {
    if (nextGuessesLeft < 10 && !isFetching) {
      void fetchNextPage();
    }
  }, [nextGuessesLeft, isFetching, fetchNextPage]);

  const nextGuessId = nextGuesses[indexOfSelectedGuess + 1]?.id;

  return (
    <div>
      <div className="h-96 min-w-96 space-y-4 overflow-y-scroll">
        <div className="h-1/2" /> {/* spacer */}
        {isLoading && <div>Loading inner...</div>}
        {isSuccess &&
          [...nextGuesses].reverse().map((guess, index) => (
            <GuessDisplayWrapper
              key={index + guess.id}
              // required to refetch/staleness
              guess={selectedGuessId === guess.id ? props.selectedGuess : guess}
              selected={selectedGuessId === guess.id}
            />
          ))}
        <div className="h-1/2" /> {/* spacer */}
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
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selected]);

  const setSelectedGuessIdMutation = useSetSelectedGuessId();
  const handleOnClick = () => {
    setSelectedGuessIdMutation.mutate({
      orgId: guess.orgId,
      data: { selectedGuessId: guess.id },
    });
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  const [startCall] = useStartCall({ guessId: guess.id });

  return (
    <div className="grid grid-cols-[auto_2.75rem] items-center gap-4">
      <button
        ref={ref}
        onClick={handleOnClick}
        className={cn(
          "block rounded-md px-8 transition-all duration-500",
          !selected && "hover:bg-secondary/50",
          selected && "h-16 bg-secondary text-xl text-secondary-foreground",
        )}
      >
        <GuessDisplay guess={guess} />
      </button>
      <div
        className={cn(
          "transition-opacity duration-500",
          !selected && "opacity-0",
        )}
      >
        <Button onClick={startCall} variant={"secondary"} size={"icon-lg"}>
          <PhoneCallIcon />
        </Button>
      </div>
    </div>
  );
};
