import type { DurationUnit } from "luxon";
import { DateTime } from "luxon";

export const getHumanReadablePastDuration = (timestamp: DateTime) => {
  const isToday = timestamp.hasSame(DateTime.local(), "day");
  return isToday
    ? durationAgo(timestamp) + " ago"
    : timestamp.toRelativeCalendar();
};

const durationAgo = (timestamp: DateTime) => {
  const diffNow = timestamp.diffNow().rescale();

  const unit: DurationUnit = diffNow.get("hours") !== 0 ? "hours" : "minutes";

  return timestamp
    .diffNow([unit])
    .negate()
    .mapUnits((x) => Math.floor(x))
    .rescale()
    .toHuman({ compactDisplay: "short", unitDisplay: "short" });
};
