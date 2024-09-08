import { useState } from "react";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";
import { Slider } from "@icebreaker/ui/slider";
import { isAdditionStrategy } from "@icebreaker/validators/guessing-strategies";

import { useCurrentStrategySetMutation } from "~/app/_api-hooks/use-current-strategy";

export const LoopAtValueSlider = (props: {
  id?: string;
  strategyCount: number;
  orgId: string;
  currentStrategy: Strategy;
}) => {
  console.log("rendur slider");

  const currentStrategy = props.currentStrategy;

  const { mutate: setCurrentStrategy } = useCurrentStrategySetMutation();

  const handleSliderOnValueChange = (value: number[]): void => {
    if (!value[0]) {
      throw new Error("Slider Error: value should not be falsy");
    }

    if (!isAdditionStrategy(currentStrategy)) {
      throw new Error(
        "Slider Error: currentStrategy should be an addition strategy",
      );
    }

    const newValue = value[0] ** 10;

    if (newValue === currentStrategy.loopAtPower) {
      return;
    }

    setCurrentStrategy({
      id: props.orgId,
      data: { ...currentStrategy, loopAtPower: newValue },
    });
    setOldLoopAtPower(newValue);
  };

  const isAddition = isAdditionStrategy(currentStrategy);

  const loopAtPowerFromDBAddition = isAddition
    ? currentStrategy.loopAtPower
    : undefined;
  const loopAtPowerFromDB =
    loopAtPowerFromDBAddition ?? props.strategyCount - 1;

  const [oldLoopAtPower, setOldLoopAtPower] =
    useState<number>(loopAtPowerFromDB);

  return (
    <Slider
      id={props.id}
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
