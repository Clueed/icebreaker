"use client";

import { useId } from "react";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";
import { cn } from "@icebreaker/ui";
import { CpuIcon, Dices } from "@icebreaker/ui/icons";
import { Label, Legend } from "@icebreaker/ui/label";
import { LongPressButton } from "@icebreaker/ui/long-press-button";
import { Skeleton } from "@icebreaker/ui/skeleton";
import { Slider } from "@icebreaker/ui/slider";
import {
  extionsionStrategiesAreEqual,
  isRandomStrategy,
} from "@icebreaker/validators/guessing-strategies";
import { getAvailableExtensionStrategies } from "@icebreaker/validators/guessing-strategies/get-available-strategies";

import {
  useCurrentStrategyQuery,
  useCurrentStrategySetMutation,
} from "~/app/_api-hooks/use-current-strategy";
import { useSelectedGuessQuery } from "~/app/_api-hooks/use-selected-guess";
import { LoopAtValueSlider } from "~/app/org/[orgId]/_components/strategy-selector.tsx/strategy-selector-loop-at-value-silder";

const GuesserStrategySelector = (props: {
  orgId: string;
  onApplyExtensionStrategyOnce: (strategy: Strategy) => void;
}) => {
  const { data: currentStrategy } = useCurrentStrategyQuery({
    id: props.orgId,
  });

  const { data: selectedGuess } = useSelectedGuessQuery({ id: props.orgId });
  const currentPhoneNumber = selectedGuess?.phoneNumber;

  const availbaleExtensionStrategies = currentPhoneNumber
    ? getAvailableExtensionStrategies(currentPhoneNumber)
    : [];

  const sortedStrategies = availbaleExtensionStrategies.sort(startStrategiesUi);

  const { mutate: setCurrentStrategy } = useCurrentStrategySetMutation();
  const handleLongPress = (strategy: Strategy) => {
    setCurrentStrategy({
      id: props.orgId,
      data: strategy,
    });
  };

  const strategyId = useId();
  const loopAtPowerId = useId();

  if (!currentStrategy) {
    return "Error";
  }

  return (
    <div className="max-w-40">
      <fieldset>
        <Legend className={"mb-4 text-nowrap text-muted-foreground"}>
          <CpuIcon className="inline size-[1.65cap]" /> guessing tactics
        </Legend>
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2">
          {sortedStrategies.map((extensionStrategy, index) => (
            <LongPressButton
              id={strategyId}
              onLongPress={() => handleLongPress(extensionStrategy)}
              onClick={() => {
                props.onApplyExtensionStrategyOnce(extensionStrategy);
              }}
              key={index}
              variant={
                extionsionStrategiesAreEqual(currentStrategy, extensionStrategy)
                  ? "secondary"
                  : "ghost"
              }
              className="col-start-1"
            >
              {isRandomStrategy(extensionStrategy) ? (
                <Dices />
              ) : (
                `+${extensionStrategy.numberToAdd}`
              )}
            </LongPressButton>
          ))}
          <Label
            className={"mt-2 text-nowrap text-muted-foreground"}
            htmlFor={strategyId}
          >
            strategy
          </Label>

          <div
            className="col-start-2 row-start-2 mr-3 h-full py-[max(0.1rem,_20%)]"
            style={{
              gridRowEnd: availbaleExtensionStrategies.length + 1,
            }}
          >
            <LoopAtValueSlider
              id={loopAtPowerId}
              orgId={props.orgId}
              strategyCount={availbaleExtensionStrategies.length - 1}
              currentStrategy={currentStrategy}
            />
          </div>
          <Label
            className={"mt-2 text-nowrap text-muted-foreground"}
            htmlFor={loopAtPowerId}
          >
            loop at
          </Label>
        </div>
      </fieldset>
    </div>
  );
};

export default GuesserStrategySelector;

export const StrategySelectorSkeleton = ({ loading }: { loading: boolean }) => {
  return (
    <div className={cn("flex gap-4", !loading && "blur")}>
      <div className="flex-grow space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            className={cn("h-10", !loading && "animate-none")}
            key={"StrategySelectorSkeleton" + i}
          />
        ))}
      </div>
      <div>
        <Slider orientation="vertical" disabled />
      </div>
    </div>
  );
};

function startStrategiesUi(a: Strategy, b: Strategy): number {
  if (a.type === "add" && b.type === "random") {
    return 1;
  } else if (a.type === "random" && b.type === "add") {
    return -1;
  } else if (a.type === "add" && b.type === "add") {
    return b.numberToAdd - a.numberToAdd;
  } else {
    return 0;
  }
}
