import type { Duration } from "luxon";
import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useSessionCall } from "react-sipjs";

export function CallInfo({
  phoneCall,
}: {
  phoneCall: NonNullable<AppRouterOutputs["phoneCall"]["current"]>;
}) {
  const sessionCall = useSessionCall(phoneCall.sessionId);
  const timer = sessionCall?.timer;

  const [sinceStart, setSinceStart] = useState<Duration>();
  const [sinceAnswered, setSinceAnswered] = useState<Duration>();

  useEffect(() => {
    if (!timer) {
      return;
    }
    const createdAt = DateTime.fromJSDate(timer.createdAt);
    // const receivedAt = timer.receivedAt
    //   ? DateTime.fromJSDate(timer.receivedAt)
    //   : undefined;
    const answeredAt = timer.answeredAt
      ? DateTime.fromJSDate(timer.answeredAt)
      : undefined;
    const hangupAt = timer.hangupAt
      ? DateTime.fromJSDate(timer.hangupAt)
      : undefined;

    const interval = setInterval(() => {
      if (hangupAt?.isValid) {
        setSinceStart(createdAt.diffNow());
        setSinceAnswered(answeredAt?.diffNow());
        clearInterval(interval);
        return;
      }

      if (createdAt.isValid) {
        setSinceStart(createdAt.diffNow());
        setSinceAnswered(answeredAt?.diffNow());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, setSinceAnswered, setSinceStart]);

  return (
    <div>
      <div>state: {phoneCall.state}</div>
      <div>answeredAt: {timer?.answeredAt?.toISOString()}</div>
      <div>createdAt: {timer?.createdAt?.toISOString()}</div>
      <div>receivedAt:{timer?.receivedAt?.toISOString()}</div>
      <div>hangupAt: {timer?.hangupAt?.toISOString()}</div>
      <div>sinceStart: {sinceStart?.toFormat("mm:ss")}</div>
      <div>sinceAnswered: {sinceAnswered?.toFormat("mm:ss")}</div>
    </div>
  );
}
