"use client";

import { useId } from "react";
import * as React from "react";
import { Duration } from "luxon";

import { TimerIcon } from "@icebreaker/ui/icons";
import { Label } from "@icebreaker/ui/label";
import { Slider } from "@icebreaker/ui/slider";
import { Switch } from "@icebreaker/ui/switch";

export const AutoEndCall = (props: {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  maxDuration: Duration<true>;
  setMaxDuration: (maxSeconds: Duration<true>) => void;
}) => {
  const enabledId = useId();
  const silderId = useId();

  const maxSeconds = props.maxDuration.toMillis() / 1000;

  const handleOnValueChange = (value: number[]): void => {
    if (!value[0]) {
      throw new Error("value[0] is required");
    }

    props.setMaxDuration(Duration.fromObject({ seconds: value[0] }));
  };

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
      <div className="place-self-center self-center">
        <Switch
          id={enabledId}
          checked={props.enabled}
          onCheckedChange={props.setEnabled}
          className="block"
        />
      </div>

      <Label htmlFor={enabledId} className="flex items-center gap-1">
        <TimerIcon className="inline size-[1.65cap]" />
        auto end call
      </Label>
      <div className="place-content-center place-items-center place-self-center self-center">
        <div className="w-[4ch] text-center text-sm">
          {Math.round(maxSeconds)} s
        </div>
      </div>
      <Slider
        id={silderId}
        value={[maxSeconds]}
        onValueChange={handleOnValueChange}
        min={1}
        max={69}
        step={1}
      />
    </div>
  );
};
