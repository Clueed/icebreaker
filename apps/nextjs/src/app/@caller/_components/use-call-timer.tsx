import type { Duration } from "luxon";
import type { Timer } from "react-sipjs";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

export const useCallTimer = ({ timer }: { timer: Timer }) => {
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
  return <></>;
};
