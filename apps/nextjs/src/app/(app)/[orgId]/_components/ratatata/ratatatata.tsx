import { useId, useState } from "react";

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

import { useAutoCaller } from "~/app/(app)/[orgId]/_components/ratatata/use-auto-caller";
import { useAutoSkipper } from "~/app/(app)/[orgId]/_components/ratatata/use-auto-skipper";

export const Ratatatata = (props: { orgId: string; nextGuessId?: string }) => {
  const autoSkipperId = useId();
  const [autoSkipperEnabled, setAutoSkipperEnabled] = useState(false);

  const autoCallerId = useId();
  const [autoCallerEnabled, setAutoCallerEnabled] = useState(false);

  const ratatatataId = useId();
  const enabled = autoSkipperEnabled || autoCallerEnabled;

  const setEnabled = (enabled: boolean) => {
    setAutoSkipperEnabled(enabled);
    setAutoCallerEnabled(enabled);
  };

  const { status: autoSkipperStatus } = useAutoSkipper({
    orgId: props.orgId,
    enabled: autoSkipperEnabled,
    nextGuessId: props.nextGuessId,
  });
  const { status: autoCallerStatus } = useAutoCaller({
    orgId: props.orgId,
    enabled: autoCallerEnabled,
  });

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2">
      <div className={cn("flex items-center space-x-4")}>
        <Switch
          id={ratatatataId}
          checked={enabled}
          onCheckedChange={setEnabled}
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
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
            <Switch
              id={autoCallerId}
              checked={autoCallerEnabled}
              onCheckedChange={setAutoCallerEnabled}
            />

            <Label htmlFor={autoCallerId} className="col-start-2">
              auto caller
            </Label>
            <p className="col-start-2 text-xs text-muted-foreground">
              {autoCallerStatus}
            </p>

            {/* spacer */}
            <div className="col-span-full h-4" />

            <Switch
              id={autoSkipperId}
              checked={autoSkipperEnabled}
              onCheckedChange={setAutoSkipperEnabled}
            />

            <Label htmlFor={autoSkipperId} className="col-start-2">
              auto guess skipper
            </Label>
            <p className="col-start-2 text-xs text-muted-foreground">
              {autoSkipperStatus}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
