import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { PhoneOffIcon } from "@icebreaker/ui/icons";

import { useCall } from "~/app/_components/call-handler/use-current-call";

export const EndCallButton = (props: { progressValue: number }) => {
  const { active, hangup } = useCall();
  const disabled = !active;

  return (
    <Button
      className="relative w-full overflow-hidden bg-transparent"
      size={"lg"}
      variant={"destructive"}
      onClick={hangup}
      disabled={disabled}
    >
      <Progress
        value={props.progressValue}
        className={cn("transition-opacity", disabled && "opacity-0")}
      />
      <div className="z-50 flex items-center justify-center gap-1">
        <PhoneOffIcon className="size-[1.65cap]" />
        <div>hangup</div>
      </div>
    </Button>
  );
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("absolute size-full bg-destructive/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-destructive transition-all"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;
