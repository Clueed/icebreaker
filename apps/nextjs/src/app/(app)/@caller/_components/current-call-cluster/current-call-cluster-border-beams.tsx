import { cn } from "@icebreaker/ui";
import { BorderBeam } from "@icebreaker/ui/border-beam";

import { useCall } from "~/app/_components/call-handler/use-current-call";

export const CurrentCallClusterBorderBeams = () => {
  const { live, active } = useCall();

  return (
    <>
      <BorderBeam
        colorFrom={
          live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
        }
        colorTo={live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        size={80}
        duration={live ? 4 : 6}
        delay={0}
        enabled={active}
        className={cn("transition-color z-0 duration-1000 ease-in-out")}
      />
      <BorderBeam
        size={80}
        duration={live ? 4 : 6}
        delay={live ? 2 : 3}
        colorFrom={
          live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
        }
        colorTo={live ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        enabled={active}
        className={cn("transition-color z-0 duration-1000 ease-in-out")}
      />
    </>
  );
};
