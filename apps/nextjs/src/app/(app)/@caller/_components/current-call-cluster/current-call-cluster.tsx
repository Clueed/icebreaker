"use client";

import { skipToken } from "@tanstack/react-query";

import { cn } from "@icebreaker/ui";
import { Card, CardContent, CardHeader } from "@icebreaker/ui/card";
import { PauseIcon } from "@icebreaker/ui/icons";
import { Skeleton } from "@icebreaker/ui/skeleton";

import { usePhoneCallBySessionIdQuery } from "~/app/_api-hooks/use-phone-call";
import { useCall } from "~/app/_components/call-handler/use-current-call";
import { AutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/auto-end-call";
import { useAutoEndCall } from "~/app/(app)/@caller/_components/auto-end-call/use-auto-end-call";
import { CurrentCallClusterBorderBeams } from "~/app/(app)/@caller/_components/current-call-cluster/current-call-cluster-border-beams";
import { CallPhoneNumberDisplay } from "~/app/(app)/@caller/_components/current-call-cluster/phone-number-display";
import { EndCallButton } from "~/app/(app)/@caller/_components/end-call-button";
import { CallRatingCluster } from "~/app/(app)/@caller/_components/rating-cluster";
import { useCallTimer } from "~/app/(app)/@caller/_components/use-call-timer";

export const CurrentCallCluster = () => {
  const { timer, sessionId, phoneNumber } = useCall();
  const { duration: callDuration } = useCallTimer({ timer });

  const { data: phoneCall } = usePhoneCallBySessionIdQuery(
    sessionId ? { sessionId } : skipToken,
  );

  const autoEnd = useAutoEndCall();

  return (
    <div className="space-y-4">
      <Card className="relative" {...autoEnd.register}>
        <CardHeader className={cn("text-center align-middle")}>
          <div
            className={cn(
              "border-none text-center text-sm font-semibold tabular-nums tracking-widest",
            )}
          >
            {callDuration ? (
              callDuration.toFormat("mm:ss")
            ) : (
              <>
                <Skeleton className="w-[8ch]" size={"char"} animate={false} />
              </>
            )}
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
          <EndCallButton progressValue={autoEnd.percentLeft} />
        </CardContent>
        <CurrentCallClusterBorderBeams />
      </Card>

      <div className="relative px-6 py-2">
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm transition-opacity duration-500 ease-in-out",
            !autoEnd.isPaused && "pointer-events-none opacity-0",
          )}
        >
          <PauseIcon />
        </div>

        <AutoEndCall
          maxDuration={autoEnd.maxDurationS}
          setMaxDuration={autoEnd.setMaxDurationS}
          enabled={autoEnd.enabled}
          setEnabled={autoEnd.setEnabled}
          resetOnAnswer={autoEnd.resetOnAnswer}
          setResetOnAnswer={autoEnd.setResetOnAnswer}
        />
      </div>
    </div>
  );
};
