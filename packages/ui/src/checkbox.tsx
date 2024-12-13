"use client";

import * as React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from ".";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [animateRef] = useAutoAnimate({});
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "data-[state=checked]:bg-seconborder-secondary data-[state=checked]:text-seconborder-secondary-foreground peer size-[1.65cap] shrink-0 rounded-md border border-secondary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
        ref={animateRef}
      >
        <CheckIcon className="size-[1.2cap]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
