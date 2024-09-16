import { AnimatePresence, LayoutGroup } from "framer-motion";

import { ChartColumnIcon } from "@icebreaker/ui/icons";
import { Skeleton } from "@icebreaker/ui/skeleton";

import { GuessStatsBaseGroup } from "~/app/(app)/[orgId]/_components/guess-stats/guess-stats-base-group";
import { api } from "~/trpc/react";

export const GuessStats = ({ orgId }: { orgId: string }) => {
  const {
    data: stats,
    isSuccess,
    isLoading,
  } = api.guess.stats.useQuery({
    orgId,
  });

  return (
    <div>
      <h2 className={"mb-4 text-nowrap px-8 text-xs text-muted-foreground"}>
        <ChartColumnIcon className="inline size-[1.65cap]" /> guess statistics
      </h2>
      {isLoading && <Skeleton className="h-[50rem] w-full"></Skeleton>}
      {isSuccess && (
        <div className="space-y-8">
          <LayoutGroup>
            <AnimatePresence mode="sync">
              {stats.map((phoneNumberBaseGroup) => (
                <GuessStatsBaseGroup
                  key={phoneNumberBaseGroup.base}
                  baseGroup={phoneNumberBaseGroup}
                  orgId={orgId}
                />
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      )}
    </div>
  );
};
