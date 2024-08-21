import { useEffect, useRef } from "react";
import { skipToken } from "@tanstack/react-query";

import type { AppRouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { PhoneNumberDisplay } from "@acme/ui/custom/phone-number-display";
import { CrosshairIcon, PhoneCallIcon } from "@acme/ui/icons";

import {
  useSelectedGuessId,
  useSelectedGuessIdSetQuery,
} from "~/app/_api-hooks/use-selected-guess";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { api } from "~/trpc/react";

export const GuessDisplay = ({ guessId }: { guessId: string }) => {
  const {
    data: guess,
    isLoading,
    isFetching,
    isError,
    isSuccess,
  } = api.guess.byId.useQuery({ id: guessId });
  const { data: selectedGuessId } = useSelectedGuessId(
    guess ? { id: guess.orgId } : skipToken,
  );
  const selected = selectedGuessId === guessId;

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
        "h-16 rounded border-2 px-4",
        isFetching && "animate-pulse bg-muted/50",
        // calls && "opacity-10",
        selected && "border-primary",
      )}
    >
      {isLoading ? "loading..." : null}
      {isError && <>Error</>}
      {isSuccess && <Inner guess={guess} selected={selected} />}
    </div>
  );
};

const Inner = ({
  guess,
  selected,
}: {
  guess: AppRouterOutputs["guess"]["byId"];
  selected: boolean;
}) => {
  const [startCall] = useStartCall({ guessId: guess.id });
  const calls = guess.phoneCalls.length > 0;

  return (
    <div className="flex h-full items-center gap-1">
      {" "}
      <SelectButton
        guessId={guess.id}
        orgId={guess.orgId}
        selected={selected}
      />
      <PhoneNumberDisplay phoneNumber={guess.phoneNumber} />
      {selected && (
        <Button onClick={startCall}>
          <PhoneCallIcon />
        </Button>
      )}
      <div>{calls && <PhoneCallIcon className="h-6 w-6" />}</div>
    </div>
  );
};

const SelectButton = (props: {
  guessId: string;
  orgId: string;
  selected: boolean;
}) => {
  const setSelectedGuessIdMutation = useSelectedGuessIdSetQuery();
  function handleOnClick(): void {
    setSelectedGuessIdMutation.mutate({
      orgId: props.orgId,
      data: { selectedGuessId: props.guessId },
    });
  }
  return (
    <Button
      size={"icon"}
      onClick={handleOnClick}
      variant={"ghost"}
      disabled={props.selected}
      className={cn(props.selected && "text-primary")}
    >
      <CrosshairIcon />
    </Button>
  );
};
