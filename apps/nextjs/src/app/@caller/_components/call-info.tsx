import type { Duration } from "luxon";
import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

export function CallInfo({
  phoneCall,
}: {
  phoneCall: Exclude<AppRouterOutputs["phoneCall"]["current"], 0>;
}) {
  const createdAt = DateTime.fromISO(phoneCall.createdAt);
  const answeredAt = phoneCall.answeredAt
    ? DateTime.fromISO(phoneCall.answeredAt)
    : undefined;
  const receivedAt = phoneCall.receivedAt
    ? DateTime.fromISO(phoneCall.receivedAt)
    : undefined;
  const hangupAt = phoneCall.hangupAt
    ? DateTime.fromISO(phoneCall.hangupAt)
    : undefined;

  const [sinceStart, setSinceStart] = useState<Duration>();
  const [sinceAnswered, setSinceAnswered] = useState<Duration>();

  useEffect(() => {
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
  }, [hangupAt, createdAt, answeredAt, setSinceAnswered, setSinceStart]);

  return (
    <div>
      <div>state: {phoneCall.state}</div>
      <div>answeredAt: {phoneCall.answeredAt}</div>
      <div>createdAt: {phoneCall.createdAt}</div>
      <div>receivedAt:{phoneCall.receivedAt}</div>
      <div>hangupAt: {phoneCall.hangupAt}</div>
      <div>sinceStart: {sinceStart?.toFormat("mm ss")}</div>
      <div>sinceAnswered: {sinceAnswered?.toFormat("mm ss")}</div>
    </div>
  );
}
