"use client";

import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { DateTime, Duration } from "luxon";
import { useSessionStorage } from "usehooks-ts";

import { cn } from "@icebreaker/ui";
import { BorderBeam } from "@icebreaker/ui/border-beam";
import { Card, CardContent, CardHeader } from "@icebreaker/ui/card";
import { PauseIcon } from "@icebreaker/ui/icons";

import { usePhoneCallBySessionIdQuery } from "~/app/_api-hooks/use-phone-call";
import { useCall } from "~/app/_components/call-handler/use-current-call";
import { AutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/auto-end-call";
import { useAutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/use-auto-end-call";
import { CallPhoneNumberDisplay } from "~/app/(app)/@caller/_components/current-call-cluster/phone-number-display";
import { EndCallButton } from "~/app/(app)/@caller/_components/end-call-button";
import { CallRatingCluster } from "~/app/(app)/@caller/_components/rating-cluster";
import { useSyncCall } from "~/app/(app)/@caller/_components/sync-call";
import { useCallTimer } from "~/app/(app)/@caller/_components/use-call-timer";

export const CurrentCallCluster = () => {
  const { hangup, timer, sessionId, phoneNumber, live, isActive } = useCall();
  const { duration: callDuration } = useCallTimer({ timer });
  //   const live = true;
  //   const isActive = true;

  const { data: phoneCall } = usePhoneCallBySessionIdQuery(
    sessionId ? { sessionId } : skipToken,
  );
  useSyncCall({
    phoneCall: phoneCall,
    timer,
  });

  const [autoEndEnabled, setAutoEndEnabled] = useSessionStorage(
    "autoEndEnabled",
    false,
  );
  const [maxDuration, setMaxDuration] = useSessionStorage(
    "maxDuration",
    Duration.fromObject({ seconds: 20 }),
  );
  const [buffer, setBuffer] = useState<Duration>(Duration.fromMillis(0));
  const { register, isHovering } = useRecordTimeSpentOnMouse({
    handleDurationOnLeave: (newBuffer) =>
      setBuffer((prev) => prev.plus(newBuffer)),
  });
  const { decimalLeft } = useAutoEndCall({
    enabled: autoEndEnabled && !isHovering,
    hangup,
    inputs: {
      maxDuration,
      callDuration,
      buffer,
    },
    onEnd: () => setBuffer(Duration.fromMillis(0)),
  });

  return (
    <div className="space-y-4">
      <Card className="relative" {...register}>
        <CardHeader
          className={cn(
            "text-center align-middle",
            live && "text-primary-foreground",
          )}
        >
          <div
            className={cn(
              "border-none text-center text-sm font-semibold tabular-nums tracking-widest",
            )}
          >
            {callDuration ? callDuration.toFormat("mm:ss") : ":"}
          </div>
          <CallPhoneNumberDisplay
            phoneCallPhoneNumber={phoneCall?.phoneNumber}
            sessionPhoneNumber={phoneNumber}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <CallRatingCluster
            sessionId={sessionId}
            rating={phoneCall?.rating ?? null}
          />
          <EndCallButton progressValue={decimalLeft} />
        </CardContent>
        <BorderBeam
          colorFrom={
            live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
          }
          colorTo={
            live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
          }
          size={80}
          duration={live ? 4 : 6}
          delay={0}
          enabled={isActive}
          className={cn(
            !isActive &&
              "opacity-0 transition-opacity duration-1000 ease-in-out",
          )}
        />
        <BorderBeam
          size={80}
          duration={live ? 4 : 6}
          delay={live ? 2 : 3}
          colorFrom={
            live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
          }
          colorTo={
            live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
          }
          enabled={isActive}
          className={cn(
            !isActive &&
              "opacity-0 transition-opacity duration-1000 ease-in-out",
          )}
        />
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
