"use client";

import { useState } from "react";

import type { Strategy } from "@acme/validators/guessing-strategies";
import { cn } from "@acme/ui";
import { Dices } from "@acme/ui/icons";
import { Label } from "@acme/ui/label";
import { LongPressButton } from "@acme/ui/long-press-button";
import { Skeleton } from "@acme/ui/skeleton";
import { Slider } from "@acme/ui/slider";
import {
  extionsionStrategiesAreEqual,
  isAdditionStrategy,
  isRandomStrategy,
} from "@acme/validators/guessing-strategies";
import { getAvailableExtensionStrategies } from "@acme/validators/guessing-strategies/get-available-strategies";

import {
  useCurrentStrategyQuery,
  useCurrentStrategySetMutation,
} from "~/app/_api-hooks/use-current-strategy";
import { useSelectedGuessQuery } from "~/app/_api-hooks/use-selected-guess";

const GuesserStrategySelector = (props: {
  orgId: string;
  onApplyExtensionStrategyOnce: (strategy: Strategy) => void;
}) => {
  const { data: currentStrategy, isLoading } = useCurrentStrategyQuery({
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

  if (!currentStrategy) {
    return "Error";
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2">
        {sortedStrategies.map((extensionStrategy, index) => (
          <LongPressButton
            onLongPress={() => handleLongPress(extensionStrategy)}
            onClick={() => {
              props.onApplyExtensionStrategyOnce(extensionStrategy);
            }}
            key={index}
            variant={
              extionsionStrategiesAreEqual(currentStrategy, extensionStrategy)
                ? "secondary"
                : "outline"
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

        <div
          className="col-start-2 row-start-2 mr-3 h-full py-[5%]"
          style={{
            gridRowEnd: availbaleExtensionStrategies.length + 1,
          }}
        >
          <LoopAtValueSlider
            orgId={props.orgId}
            strategyCount={availbaleExtensionStrategies.length - 1}
            currentStrategy={currentStrategy}
          />
        </div>
      </div>
      <Label className="mt-3">Strategy</Label>
    </div>
  );
};

export default GuesserStrategySelector;

const LoopAtValueSlider = (props: {
  strategyCount: number;
  orgId: string;
  currentStrategy: Strategy;
}) => {
  console.log("rendur slider");

  const currentStrategy = props.currentStrategy;

  const { mutate: setCurrentStrategy } = useCurrentStrategySetMutation();
  if (!currentStrategy) {
    return "loading...";
  }

  const handleSliderOnValueChange = (value: number[]): void => {
    if (!value[0]) {
      throw new Error("Slider Error: value should not be falsy");
    }

    if (!isAdditionStrategy(currentStrategy)) {
      throw new Error(
        "Slider Error: currentStrategy should be an addition strategy",
      );
    }

    if (value[0] === currentStrategy.loopAtPower) {
      return;
    }

    setCurrentStrategy({
      id: props.orgId,
      data: { ...currentStrategy, loopAtPower: value[0] },
    });
    setOldLoopAtPower(value[0]);
  };

  const isAddition = isAdditionStrategy(currentStrategy);

  const loopAtPowerFromDB =
    (isAddition && currentStrategy.loopAtPower) || props.strategyCount - 1;

  const [oldLoopAtPower, setOldLoopAtPower] =
    useState<number>(loopAtPowerFromDB);

  return (
    <Slider
      orientation="vertical"
      step={1}
      min={1}
      max={props.strategyCount}
      dir={"rtl"}
      value={[isAddition ? loopAtPowerFromDB : oldLoopAtPower]}
      onValueChange={handleSliderOnValueChange}
      disabled={!isAddition}
    />
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
