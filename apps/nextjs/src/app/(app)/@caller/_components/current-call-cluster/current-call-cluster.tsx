"use client";

import { useState } from "react";
import { DateTime, Duration } from "luxon";

import { cn } from "@icebreaker/ui";
import { Card, CardContent } from "@icebreaker/ui/card";
import { PauseIcon } from "@icebreaker/ui/icons";

import { useCall } from "~/app/_components/call-handler/use-current-call";
import { AutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/auto-end-call";
import { useAutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/use-auto-end-call";
import { Caller } from "~/app/(app)/@caller/_components/caller";
import { CallDurationBadge } from "~/app/(app)/@caller/_components/current-call-cluster/call-duration-badge";
import { EndCallButton } from "~/app/(app)/@caller/_components/end-call-button";
import { useCallTimer } from "~/app/(app)/@caller/_components/use-call-timer";

export const CurrentCallCluster = () => {
  const [autoEndEnabled, setAutoEndEnabled] = useState(false);
  const [maxDuration, setMaxDuration] = useState(
    Duration.fromObject({ seconds: 20 }),
  );

  const [buffer, setBuffer] = useState<Duration>(Duration.fromMillis(0));

  const { register, isHovering } = useRecordTimeSpentOnMouse({
    handleDurationOnLeave: (newBuffer) =>
      setBuffer((prev) => prev.plus(newBuffer)),
  });

  const { hangup, timer, isActive } = useCall();
  const { duration: callDuration } = useCallTimer({ timer });
  const { diff: diffAutoEndCall } = useAutoEndCall({
    enabled: autoEndEnabled && !isHovering,
    hangup,
    inputs: {
      maxDuration,
      callDuration,
      buffer,
    },
    onEnd: () => setBuffer(Duration.fromMillis(0)),
  });

  const progressValue = diffAutoEndCall
    ? (diffAutoEndCall.toMillis() / maxDuration.toMillis()) * 100
    : 100;

  return (
    <div className="space-y-4">
      <Card className="relative" {...register}>
        <CallDurationBadge callDuration={callDuration} answered={isActive} />
        <CardContent>
          <Caller />
          <EndCallButton progressValue={progressValue} />
        </CardContent>
      </Card>
      <div className="relative px-6 py-2">
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm transition-opacity duration-500 ease-in-out",
            !isHovering && "pointer-events-none opacity-0",
          )}
        >
          <PauseIcon />
        </div>

        <AutoEndCall
          maxDuration={maxDuration}
          enabled={autoEndEnabled}
          setEnabled={setAutoEndEnabled}
          setMaxDuration={setMaxDuration}
        />
      </div>
    </div>
  );
};

const useRecordTimeSpentOnMouse = (props: {
  handleDurationOnLeave: (duration: Duration<true>) => void;
}) => {
  const [startTime, setStartTime] = useState<DateTime | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  return {
    isHovering,
    register: {
      onMouseEnter: () => {
        setIsHovering(true);
        setStartTime(DateTime.now());
      },
      onMouseLeave: () => {
        setIsHovering(false);
        if (startTime) {
          const duration = DateTime.now().diff(startTime);
          props.handleDurationOnLeave(duration);
        }
      },
    },
  };
};
