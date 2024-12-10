import type { Duration } from "luxon";

import { Badge } from "@icebreaker/ui/badge";

export const CallDurationBadge = ({
  callDuration,
  answered,
}: {
  callDuration: Duration<true> | null;
  answered: boolean | undefined;
}) => {
  return (
    <Badge
      className="absolute right-1/2 top-0 z-10 block w-[8ch] -translate-y-1/2 translate-x-1/2 text-center tabular-nums"
      variant={answered ? "default" : "secondary"}
    >
      {callDuration ? callDuration.toFormat("mm:ss") : ":"}
    </Badge>
  );
};
