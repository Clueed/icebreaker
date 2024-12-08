"use client";

import { useState } from "react";
import { DateTime, Duration } from "luxon";

import { Card, CardContent } from "@icebreaker/ui/card";

import { useCurrentSessionCall } from "~/app/_components/call-handler/use-current-session-call";
import { AutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/auto-end-call";
import { useAutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/auto-end-call-b";
import { CallHistory } from "~/app/(app)/@caller/_components/call-history";
import { Caller } from "~/app/(app)/@caller/_components/caller";
import { EndCallButton } from "~/app/(app)/@caller/_components/end-call-button";
import { useCallTimer } from "~/app/(app)/@caller/_components/use-call-timer";

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

const CallerPage = () => {
  const [autoEndEnabled, setAutoEndEnabled] = useState(false);
  const [maxDuration, setMaxDuration] = useState(
    Duration.fromObject({ seconds: 20 }),
  );

  const [buffer, setBuffer] = useState<Duration>(Duration.fromMillis(0));

  const { register, isHovering } = useRecordTimeSpentOnMouse({
    handleDurationOnLeave: (newBuffer) =>
      setBuffer((prev) => prev.plus(newBuffer)),
  });

  const { hangup, timer } = useCurrentSessionCall();
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
    <div className="space-y-16">
      <div className="space-y-4">
        <Card className="overflow-hidden" {...register}>
          <CardContent>
            <Caller />
            <EndCallButton progressValue={progressValue} />
          </CardContent>
        </Card>
        <AutoEndCall
          maxDuration={maxDuration}
          enabled={autoEndEnabled}
          setEnabled={setAutoEndEnabled}
          setMaxDuration={setMaxDuration}
        />
      </div>

      <CallHistory />
    </div>
  );
};

export default CallerPage;
