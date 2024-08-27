import { useEffect, useId, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { Settings2Icon } from "@icebreaker/ui/icons";
import { Label } from "@icebreaker/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";
import { Switch } from "@icebreaker/ui/switch";

import { useAutoCaller } from "~/app/org/[orgId]/_components/ratatata/use-auto-caller";
import { useAutoSkipper } from "~/app/org/[orgId]/_components/ratatata/use-auto-skipper";
import { api } from "~/trpc/react";

export const Ratatatata = (props: { orgId: string; nextGuessId?: string }) => {
  const orgIsPending =
    useIsFetching({
      queryKey: getQueryKey(api.org.byId),
      fetchStatus: "fetching",
    }) > 0;
  const nextGuessessPending =
    useIsFetching({
      queryKey: getQueryKey(api.guess.next),
      fetchStatus: "fetching",
    }) > 0;

  const requisitesArePending = orgIsPending || nextGuessessPending;

  const autoSkipperId = useId();
  const [autoSkipperEnabled, setAutoSkipperEnabled] = useState(false);

  const autoCallerId = useId();
  const [autoCallerEnabled, setAutoCallerEnabled] = useState(false);

  const ratatatataId = useId();
  const enabled =
    !requisitesArePending && (autoSkipperEnabled || autoCallerEnabled);
  const setEnabled = (enabled: boolean) => {
    setAutoSkipperEnabled(enabled);
    setAutoCallerEnabled(enabled);
  };

  useEffect(() => {
    if (!props.nextGuessId) {
      setEnabled(false);
    }
  }, [props.nextGuessId]);

  useAutoSkipper({
    orgId: props.orgId,
    enabled: !requisitesArePending && autoSkipperEnabled,
    nextGuessId: props.nextGuessId,
  });
  useAutoCaller({
    orgId: props.orgId,
    enabled: !requisitesArePending && autoCallerEnabled,
  });

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2">
      <div
        className={cn(
          "flex items-center space-x-4",
          requisitesArePending && "animate-pulse",
        )}
      >
        <Switch
          id={ratatatataId}
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={requisitesArePending}
        />
        <Label htmlFor={autoSkipperId} className="truncate">
          {/* <ListStartIcon className="inline size-[1.65cap] uppercase text-muted-foreground" />{" "} */}
          ratatatata
        </Label>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button size={"icon"} variant={"ghost"}>
            <Settings2Icon />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={autoCallerId}
                checked={autoCallerEnabled}
                onCheckedChange={setAutoCallerEnabled}
              />
              <Label htmlFor={autoCallerId}>auto caller</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={autoSkipperId}
                checked={autoSkipperEnabled}
                onCheckedChange={setAutoSkipperEnabled}
              />
              <Label htmlFor={autoSkipperId}>auto guess skipper</Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
