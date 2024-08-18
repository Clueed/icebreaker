"use client";

import { useState } from "react";

import type { Strategy } from "@acme/validators/guessing-strategies";
import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
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

import { api } from "~/trpc/react";

const GuesserStrategySelector = (props: {
  currentPhoneNumber: NotEmptyPhoneNumber;
  currentExtensionStrategy: Strategy;
  onExtensionStrategyChange: (strategy: Strategy) => void;
  onApplyExtensionStrategyOnce: (strategy: Strategy) => void;
}) => {
  const currentExtensionStrategy = props.currentExtensionStrategy;

  const availbaleExtensionStrategies = getAvailableExtensionStrategies(
    props.currentPhoneNumber,
  );

  const sortedStrategies = availbaleExtensionStrategies.sort(startStrategiesUi);

  const [loopAtPower, setLoopAtPower] = useState<[number]>([
    availbaleExtensionStrategies.length - 1,
  ]);

  const handleLongPress = (strategy: Strategy) => {
    if (isRandomStrategy(strategy)) {
      props.onExtensionStrategyChange(strategy);
    }
    if (isAdditionStrategy(strategy)) {
      props.onExtensionStrategyChange({
        ...strategy,
        loopAtPower: loopAtPower[0],
      });
    }
  };

  function handleSliderOnValueChange(value: number[]): void {
    if (!value[0]) {
      throw new Error("Slider Error: value should not be falsy");
    }

    setLoopAtPower([value[0]]);
    if (isAdditionStrategy(currentExtensionStrategy)) {
      props.onExtensionStrategyChange({
        ...currentExtensionStrategy,
        loopAtPower: value[0],
      });
    }
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
              extionsionStrategiesAreEqual(
                currentExtensionStrategy,
                extensionStrategy,
              )
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
          <Slider
            orientation="vertical"
            step={1}
            min={1}
            max={availbaleExtensionStrategies.length - 1}
            dir={"rtl"}
            value={loopAtPower}
            onValueChange={handleSliderOnValueChange}
            disabled={isRandomStrategy(currentExtensionStrategy)}
          />
        </div>
      </div>
      <Label className="mt-3">Strategy</Label>
    </div>
  );
};

export default GuesserStrategySelector;

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
