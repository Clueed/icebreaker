"use client";

import { useId } from "react";
import * as React from "react";

import { Button } from "@icebreaker/ui/button";
import { Settings2Icon, TimerIcon } from "@icebreaker/ui/icons";
import { Label } from "@icebreaker/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";
import { Slider } from "@icebreaker/ui/slider";
import { Switch } from "@icebreaker/ui/switch";

interface AutoEndCallProps {
  maxDuration: number;
  setMaxDuration: (value: number) => void;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  resetOnAnswer: boolean;
  setResetOnAnswer: (value: boolean) => void;
}

export const AutoEndCall = (props: AutoEndCallProps) => {
  const enabledId = useId();
  const silderId = useId();

  const maxSeconds = props.maxDuration;

  const handleOnValueChange = (value: number[]): void => {
    if (!value[0]) {
      throw new Error("value[0] is required");
    }

    props.setMaxDuration(value[0]);
  };

  const resetOnAnswerId = useId();

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-4">
      <div className="place-self-center self-center">
        <Switch
          id={enabledId}
          checked={props.enabled}
          onCheckedChange={props.setEnabled}
          className="block"
        />
      </div>

      <Label htmlFor={enabledId} className="col flex items-center gap-1">
        <TimerIcon className="inline size-[1.65cap]" />
        auto end call
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button size={"icon"} variant={"ghost"}>
            <Settings2Icon />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
            <Switch
              id={resetOnAnswerId}
              checked={props.resetOnAnswer}
              onCheckedChange={props.setResetOnAnswer}
            />

            <Label htmlFor={resetOnAnswerId}>auto caller</Label>
            <p className="col-start-2 row-start-2 text-xs text-muted-foreground">
              reset the auto end call timer when the caller answers
            </p>
          </div>
        </PopoverContent>
      </Popover>
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
        max={42}
        step={1}
        className="col-span-2"
      />
    </div>
  );
};
