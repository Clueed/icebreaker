import { DateTime, Duration } from "luxon";

export const getHumanReadablePastDuration = (timestamp: DateTime) => {
  const isToday = timestamp.toLocal().hasSame(DateTime.local(), "day");
  return isToday ? durationAgo(timestamp) : timestamp.toRelativeCalendar();
};

const durationAgo = (timestamp: DateTime) => {
  // clamp at 0 in case the server clock is slightly ahead
  const { hours, minutes } = DateTime.now()
    .diff(timestamp, ["hours", "minutes"])
    .mapUnits((x) => Math.max(0, Math.floor(x)));

  if (hours === 0 && minutes === 0) {
    return "just now";
  }

  const duration =
    hours !== 0
      ? Duration.fromObject({ hours })
      : Duration.fromObject({ minutes });

  return duration.toHuman({ unitDisplay: "short" }) + " ago";
};
