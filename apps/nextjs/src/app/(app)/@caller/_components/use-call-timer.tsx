import type { Duration } from "luxon";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

import type { Timer } from "@icebreaker/sip";

const getDuration = (timer?: Partial<Timer>) => {
  if (!timer?.createdAt) {
    return null;
  }

  const end = timer.hangupAt
    ? DateTime.fromJSDate(timer.hangupAt)
    : DateTime.now();
  const start = DateTime.fromJSDate(timer.answeredAt ?? timer.createdAt);

  const duration = end.diff(start);

  if (!duration.isValid) {
    return null;
  }

  return duration;
};

export const useCallTimer = ({ timer }: { timer?: Timer }) => {
  const [duration, setDuration] = useState<Duration<true> | null>(
    getDuration(timer),
  );

  const { createdAt, answeredAt, hangupAt } = timer ?? {};

  useEffect(() => {
    const reTimer = { createdAt, answeredAt, hangupAt };
    if (hangupAt) {
      const newDuration = getDuration(reTimer);
      setDuration(newDuration);
      return;
    }

    const interval = setInterval(() => {
      const newDuration = getDuration(reTimer);
      setDuration(newDuration);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, answeredAt, hangupAt]);

  return {
    duration,
  };
};
